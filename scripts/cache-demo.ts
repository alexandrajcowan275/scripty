import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve, join } from "node:path";
import { z } from "zod";
import { shotSchema, ruleSchema } from "../lib/db";
import { loadLocalEnv } from "./env";
import { liveHeaders } from "./live-request";
import { appliedRules, batchTraces, existingBatch, liveBatchSchema, snapshotSchema, validateEvidence, type LiveBatch } from "./cache-utils";

function option(name: string, fallback: string) { const at = process.argv.indexOf(name); return at < 0 ? fallback : process.argv[at + 1] ?? fallback; }
const reviewSchema = z.object({ batchIndex: z.number().int().positive(), shotIndex: z.number().int().min(1).max(6), decision: z.enum(["accept", "reject"]), reason: z.string().max(400).optional() }).refine((review) => review.decision !== "reject" || Boolean(review.reason?.trim()), "A rejection needs an actual inspected reason.");
async function main() {
  loadLocalEnv();
  const captureExisting = process.argv.includes("--capture-existing");
  if (!captureExisting && !process.argv.includes("--confirm-live")) throw new Error("Generating batches spends API budget. Run with --confirm-live, or use --capture-existing for read-only export without AI calls.");
  const count = z.coerce.number().int().min(1).max(5).parse(option("--batches", "2"));
  const projectId = option("--project", "mara");
  const base = new URL(option("--base-url", "http://localhost:3000"));
  const output = resolve(option("--out", "seed/cache"));
  const decisionsPath = option("--decisions", ""); const scenesPath = option("--scenes", "");
  if (captureExisting && (decisionsPath || scenesPath)) throw new Error("--capture-existing only exports saved evidence. Apply reviews/new scenes in the live app before export.");
  const decisions = decisionsPath ? z.array(reviewSchema).parse(JSON.parse(await readFile(resolve(decisionsPath), "utf8"))) : [];
  const scenes = scenesPath ? z.array(z.array(z.string().trim().min(1).max(2000)).length(6)).min(count).parse(JSON.parse(await readFile(resolve(scenesPath), "utf8"))) : undefined;
  if (decisions.some((review) => review.batchIndex > count)) throw new Error("A scripted decision references a batch outside --batches.");
  const selectedIds = option("--batch-ids", "").split(",").filter(Boolean);
  if (selectedIds.length && !captureExisting) throw new Error("--batch-ids applies only to --capture-existing.");
  await mkdir(join(output, "images"), { recursive: true });
  const cookieJar = new Map<string, string>();
  async function request(path: string, body?: unknown) {
    const response = await fetch(new URL(path, base), { method: body ? "POST" : "GET", headers: { ...liveHeaders(), cookie: [...cookieJar].map(([k, v]) => `${k}=${v}`).join("; ") }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(300000) });
    for (const cookie of response.headers.getSetCookie()) { const [pair] = cookie.split(";"); const at = pair.indexOf("="); cookieJar.set(pair.slice(0, at), pair.slice(at + 1)); }
    if (!response.ok) throw new Error(`${path} failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
    return { body: await response.json(), mode: response.headers.get("x-canon-mode") };
  }
  async function snapshot() {
    const result = await request(`/api/project/${encodeURIComponent(projectId)}`);
    if (result.mode !== "live") throw new Error("Project export requires authorized live access. Check CANON_ADMIN_TOKEN; cached fixtures cannot become real evidence.");
    return snapshotSchema.parse(result.body);
  }
  const initial = captureExisting ? await snapshot() : undefined;
  const existing = initial ? [...initial.batches].sort((a, b) => a.index - b.index).filter((batch) => !selectedIds.length || selectedIds.includes(batch.id)).slice(0, selectedIds.length || count) : [];
  if (captureExisting && (!existing.length || selectedIds.some((id) => !existing.some((batch) => batch.id === id)))) throw new Error("Requested persisted batches were not found.");
  // Validate all persisted candidates before downloading anything or replacing a manifest.
  const existingData = initial ? existing.map((batch) => existingBatch(batch, initial.shots, initial.traces)) : [];
  const manifest: { version: number; projectId: string; createdAt: string; provenance: string; captureMode: string; batches: unknown[] } = { version: 1, projectId, createdAt: new Date().toISOString(), provenance: "real_engine", captureMode: captureExisting ? "persisted_read_only" : "generated_live", batches: [] };
  const total = captureExisting ? existingData.length : count;
  for (let offset = 0; offset < total; offset++) {
    const index = offset + 1;
    let data: LiveBatch;
    if (captureExisting) data = existingData[offset];
    else {
      console.log(`Generating authorized live batch ${index}/${total}...`);
      const response = await request("/api/batch", { projectId, ...(scenes ? { scenePrompts: scenes[offset] } : {}) });
      if (response.mode !== "live") throw new Error("Engine must return x-canon-mode: live. Check CANON_ADMIN_TOKEN.");
      data = validateEvidence(liveBatchSchema.parse(response.body));
    }
    const imageProvenance = [];
    for (let shotIndex = 0; shotIndex < data.shots.length; shotIndex++) {
      const shot = data.shots[shotIndex]; const originalImageUrl = shot.imageUrl;
      const image = await fetch(new URL(originalImageUrl, base), { signal: AbortSignal.timeout(30000) });
      if (!image.ok) throw new Error(`Could not download shot image (${image.status}).`);
      const contentType = image.headers.get("content-type")?.split(";")[0];
      const extension = contentType === "image/png" ? "png" : contentType === "image/jpeg" ? "jpg" : contentType === "image/webp" ? "webp" : null;
      if (!extension) throw new Error(`Only real raster images are cacheable; received ${contentType ?? "unknown"}.`);
      const bytes = new Uint8Array(await image.arrayBuffer());
      if (!bytes.length || bytes.length > 20 * 1024 * 1024) throw new Error("Invalid cached image size.");
      // Hash-based filenames avoid corrupting an installed manifest during an interrupted export.
      const hash = createHash("sha256").update(bytes).digest("hex"); const filename = `${hash}.${extension}`;
      await writeFile(join(output, "images", filename), bytes); shot.imageUrl = `/api/cache/images/${filename}`;
      imageProvenance.push({ shotId: shot.id, provider: data.imageProvenance[shot.id], originalImageUrl, filename, sha256: hash, bytes: bytes.length, contentType });
    }
    const reviews: unknown[] = captureExisting ? data.shots.filter((shot) => shot.status !== "pending").map((shot) => ({ shotId: shot.id, decision: shot.status === "accepted" ? "accept" : "reject", ...(shot.rejectReason ? { reason: shot.rejectReason } : {}), provenance: "persisted_creator_review", reviewedAt: null, note: "Stored review state is genuine; original review timestamp is not recorded by the shared Shot contract." })) : [];
    for (const decision of decisions.filter((item) => item.batchIndex === index)) {
      const shot = data.shots[decision.shotIndex - 1];
      const review = await request(`/api/shot/${encodeURIComponent(shot.id)}/review`, { decision: decision.decision, reason: decision.reason });
      const parsed = z.object({ shot: shotSchema, newRule: ruleSchema.optional(), provenance: z.string(), mode: z.literal("live") }).parse(review.body);
      const localImage = shot.imageUrl; Object.assign(shot, parsed.shot, { imageUrl: localImage });
      reviews.push({ ...decision, shotId: shot.id, response: parsed, capturedAt: new Date().toISOString() });
    }
    const saved = initial ?? await snapshot();
    const rules = appliedRules(data.batch, saved.rules); const traces = batchTraces(data.batch, data.shots, saved.traces);
    manifest.batches.push({ batch: data.batch, shots: data.shots, provenance: data.provenance, rules, rulesSnapshotAt: "capture_time_current_wording; original applied IDs are batch.rulesApplied and original wording is preserved in rule_applied traces", traces, reviews, imageProvenance, capturedAt: new Date().toISOString() });
    console.log(`Captured batch ${data.batch.index}: six real images; measured drift rate ${(data.batch.driftRate * 100).toFixed(1)}%.`);
  }
  await writeFile(join(output, "manifest.json.tmp"), `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(join(output, "manifest.json.tmp"), join(output, "manifest.json"));
  console.log(`Cache saved to ${output}. Measured outputs preserved; no improvement is forced. ${captureExisting ? "No AI calls were made." : "Live generation calls were explicitly requested."}`);
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Cache capture failed."); process.exitCode = 1; });
