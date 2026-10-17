import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { z } from "zod";
import { batchSchema, shotSchema, ruleSchema, traceSchema } from "../lib/db";
import { loadLocalEnv } from "./env";

function option(name: string, fallback: string) { const at = process.argv.indexOf(name); return at < 0 ? fallback : process.argv[at + 1] ?? fallback; }
const reviewSchema = z.object({ batchIndex: z.number().int().positive(), shotIndex: z.number().int().min(1).max(6), decision: z.enum(["accept", "reject"]), reason: z.string().max(4000).optional() });
const responseSchema = z.object({ batch: batchSchema, shots: z.array(shotSchema).min(1) });
async function main() {
  loadLocalEnv();
  if (!process.argv.includes("--confirm-live")) throw new Error("This command calls the real engine and spends API budget. Run with --confirm-live after checking the server uses DEMO_MODE=live. The orchestrator controls all live calls.");
  const count = z.coerce.number().int().min(1).max(5).parse(option("--batches", "2"));
  const projectId = option("--project", "mara");
  const base = new URL(option("--base-url", "http://localhost:3000"));
  const output = resolve(option("--out", "seed/cache"));
  const decisionsPath = option("--decisions", "");
  const decisions = decisionsPath ? z.array(reviewSchema).parse(JSON.parse(await readFile(resolve(decisionsPath), "utf8"))) : [];
  await mkdir(join(output, "images"), { recursive: true });
  const cookieJar = new Map<string, string>();
  async function request(path: string, body?: unknown) {
    const response = await fetch(new URL(path, base), { method: body ? "POST" : "GET", headers: { "content-type": "application/json", cookie: [...cookieJar].map(([k, v]) => `${k}=${v}`).join("; ") }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(600000) });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";"); const at = pair.indexOf("="); cookieJar.set(pair.slice(0, at), pair.slice(at + 1)); }
    if (!response.ok) throw new Error(`${path} failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
    return { body: await response.json(), mode: response.headers.get("x-canon-mode") };
  }
  const manifest: { version: number; projectId: string; createdAt: string; provenance: string; batches: unknown[] } = { version: 1, projectId, createdAt: new Date().toISOString(), provenance: "real_engine", batches: [] };
  for (let index = 1; index <= count; index++) {
    console.log(`Capturing live batch ${index}/${count}...`);
    const response = await request("/api/batch", { projectId });
    if (response.mode !== "live") throw new Error("Refusing to label this capture as real: engine must return x-canon-mode: live. No fake learning curve will be saved.");
    const data = responseSchema.parse(response.body);
    const imageProvenance = [];
    for (let shotIndex = 0; shotIndex < data.shots.length; shotIndex++) {
      const shot = data.shots[shotIndex];
      const originalImageUrl = shot.imageUrl;
      const image = await fetch(new URL(originalImageUrl, base), { signal: AbortSignal.timeout(30000) });
      if (!image.ok) throw new Error(`Could not download shot image (${image.status}).`);
      const contentType = image.headers.get("content-type")?.split(";")[0];
      const extension = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : contentType === "image/webp" ? "webp" : null;
      if (!extension) throw new Error(`Only real raster images are cacheable; received ${contentType ?? "unknown"}.`);
      const bytes = new Uint8Array(await image.arrayBuffer());
      if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("Invalid cached image size.");
      const filename = `batch-${index}-shot-${shotIndex + 1}.${extension}`;
      await writeFile(join(output, "images", filename), bytes);
      shot.imageUrl = `/api/cache/images/${filename}`;
      imageProvenance.push({ shotId: shot.id, originalImageUrl, filename, sha256: createHash("sha256").update(bytes).digest("hex"), bytes: bytes.length, contentType });
    }
    const reviews = [];
    for (const decision of decisions.filter((item) => item.batchIndex === index)) {
      const shot = data.shots[decision.shotIndex - 1];
      if (!shot) throw new Error(`Scripted review refers to missing shot ${decision.shotIndex}.`);
      const review = await request(`/api/shot/${encodeURIComponent(shot.id)}/review`, { decision: decision.decision, reason: decision.reason });
      const parsed = z.object({ shot: shotSchema, newRule: ruleSchema.optional() }).parse(review.body);
      // Keep capture image paths, while recording the actual returned review and rule.
      const localImage = shot.imageUrl;
      Object.assign(shot, parsed.shot, { imageUrl: localImage });
      reviews.push({ ...decision, shotId: shot.id, response: parsed, createdAt: new Date().toISOString() });
    }
    const snapshot = (await request(`/api/project/${encodeURIComponent(projectId)}`)).body;
    const rules = z.array(ruleSchema).parse(snapshot.rules);
    const traces = z.array(traceSchema).parse(snapshot.traces).filter((trace) => !trace.shotId || data.shots.some((shot) => shot.id === trace.shotId));
    manifest.batches.push({ ...data, rules, traces, reviews, imageProvenance, capturedAt: new Date().toISOString() });
    await writeFile(join(output, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Saved ${data.shots.length} real images; recorded drift rate ${(data.batch.driftRate * 100).toFixed(1)}%.`);
  }
  console.log(`Cache saved to ${output}. These are measured engine outputs; the script does not force improvement.`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Cache capture failed."); process.exitCode = 1; });
