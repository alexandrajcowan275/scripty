/** Isolated paid spike. Run from repo root with node --import tsx.
 * Defaults to NO generation; see --help. Never delete the budget ledger.
 */
import { readFile, writeFile, rename, open, unlink, readdir } from "node:fs/promises";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseEnv } from "node:util";

export type Stage = "draft" | "standard";
type World = {
  id?: string; world_id?: string; world_marble_url?: string;
  assets?: { thumbnail_url?: string; caption?: string;
    imagery?: { pano_url?: string }; mesh?: { collider_mesh_url?: string };
    splats?: { spz_urls?: Record<string, string>; semantics_metadata?: {
      metric_scale_factor?: number; ground_plane_offset?: number } } };
};
type Operation = {
  operation_id: string; done: boolean; error?: { code?: number; message?: string } | null;
  response?: World | { world: World } | null;
  cost?: { total_credits: number; line_items?: { name: string; credits: number }[] } | null;
};
type Attempt = {
  stage: Stage; model: string; reserved_credits: number; started_at: string;
  operation_id?: string; status: "reserved" | "polling" | "complete" | "failed";
  settled_credits?: number; assessment?: string;
};
type Ledger = { version: 1; attempts: Attempt[]; media_asset_id?: string };
export const MODELS = { draft: "marble-1.0-draft", standard: "marble-1.1" } as const;
export const PRICES = { draft: 230, standard: 1580 } as const;
export const MAX_CREDITS = 1810; // $1.448, below the $1.50 user cap.
const API = "https://api.worldlabs.ai/marble/v1";
const SEED_PREFIX = "de366e443656";
const PROMPT = "A cinematic foggy railway platform at blue hour. Preserve the seed image's wet paving, parallel tracks, train on the left, overhead railway gantries, warm platform lamps and low shelter on the right. Prioritize the persistent station environment; do not add more people. The person in the seed is not the location canon.";

export function reserveAttempt(ledger: Ledger, stage: Stage, assessment?: string): Attempt {
  if (ledger.attempts.some(a => a.stage === stage))
    throw new Error(`Budget guard: ${stage} already attempted; resume its operation, never regenerate.`);
  if (stage === "standard" && (!ledger.attempts.some(a => a.stage === "draft" && a.status === "complete") || !assessment?.trim()))
    throw new Error("Standard requires a completed draft and a written visual assessment via --draft-usable=... .");
  const reserved = ledger.attempts.reduce((sum, a) => sum + Math.max(a.reserved_credits, a.settled_credits ?? 0), 0);
  if (reserved + PRICES[stage] > MAX_CREDITS) throw new Error("Budget guard: credit cap exceeded.");
  const attempt: Attempt = { stage, model: MODELS[stage], reserved_credits: PRICES[stage],
    started_at: new Date().toISOString(), status: "reserved", ...(assessment ? { assessment } : {}) };
  ledger.attempts.push(attempt);
  return attempt;
}

export function summarize(world: World, operation: Operation, stage: Stage) {
  const world_id = world.world_id ?? world.id;
  if (!world_id) throw new Error("Completed operation is missing world_id/id. No regeneration will be attempted.");
  return {
    stage, model: MODELS[stage], operation_id: operation.operation_id, world_id,
    world_marble_url: world.world_marble_url ?? null,
    thumbnail: world.assets?.thumbnail_url ?? null,
    pano_url: world.assets?.imagery?.pano_url ?? null,
    splat_urls: world.assets?.splats?.spz_urls ?? {},
    collider_glb_url: world.assets?.mesh?.collider_mesh_url ?? null,
    semantics_metadata: world.assets?.splats?.semantics_metadata ?? null,
    caption: world.assets?.caption ?? null,
    settled_cost: operation.cost ?? null,
    estimated_credits: PRICES[stage],
    completed_at: new Date().toISOString(),
  };
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try { return JSON.parse(await readFile(path, "utf8")) as T; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback; throw error; }
}
async function atomicJson(path: string, value: unknown) {
  const temp = `${path}.${process.pid}.tmp`;
  await writeFile(temp, JSON.stringify(value, null, 2) + "\n", { mode: 0o600 });
  await rename(temp, path);
}

/** One HTTP attempt only. Never return/log provider bodies or signed upload URLs in errors. */
export async function requestOnce(url: string, init: RequestInit, label: string,
  transport: typeof fetch = fetch, timeoutMs = 30_000): Promise<Response> {
  try {
    const response = await transport(url, { ...init, signal: AbortSignal.timeout(timeoutMs), redirect: "error" });
    if (!response.ok) throw new Error(`${label}: HTTP ${response.status}; no retry performed.`);
    return response;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith(`${label}: HTTP `)) throw error;
    throw new Error(`${label}: network error or timeout; no retry performed. An accepted job may still be billed.`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] ?? "--help";
  if (command === "--help") {
    console.log(`Usage (from repository root):
  node --import tsx experiments/worldlabs/make-world.ts --check
  node --import tsx experiments/worldlabs/make-world.ts draft
  node --import tsx experiments/worldlabs/make-world.ts standard --draft-usable="Visual review evidence"
  node --import tsx experiments/worldlabs/make-world.ts resume draft|standard
Budget: ONE marble-1.0-draft (230 credits) + ONE marble-1.1 (1580 credits).
No automatic generation, retries, exports, purchases or app changes.
Review the draft in viewer.html before standard. Keep budget.json after errors.`);
    return;
  }
  const resume = command === "resume";
  const stageName = resume ? args[1] : command;
  if (command !== "--check" && stageName !== "draft" && stageName !== "standard")
    throw new Error("Use --help, --check, draft, standard, or resume draft|standard.");
  const folder = dirname(fileURLToPath(import.meta.url));
  const repo = resolve(folder, "../..");
  let env: NodeJS.Dict<string> = {};
  try { env = parseEnv(await readFile(join(repo, ".env.local"), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw new Error("Cannot parse .env.local."); }
  const key = process.env.WORLDLABS_API_KEY || env.WORLDLABS_API_KEY;
  const images = join(repo, "seed/cache/images");
  const matches = (await readdir(images)).filter(name => name.startsWith(SEED_PREFIX) && name.endsWith(".png"));
  if (matches.length !== 1) throw new Error("Expected exactly one de366e443656*.png seed image.");
  if (command === "--check") {
    console.log(JSON.stringify({ seed_found: true, key_present: Boolean(key?.trim()),
      generation_requests: 0, models: MODELS, max_credits: MAX_CREDITS, max_estimated_usd: MAX_CREDITS / 1250 }));
    return;
  }
  if (!key?.trim()) throw new Error("WORLDLABS_API_KEY missing. No network calls made; wait for the user before generation.");
  const stage = stageName as Stage;
  const assessment = args.find(arg => arg.startsWith("--draft-usable="))?.slice("--draft-usable=".length);
  const headers = { "WLT-Api-Key": key, "Content-Type": "application/json" };
  const api = async <T>(path: string, method = "GET", body?: unknown): Promise<T> => {
    const response = await requestOnce(`${API}${path}`, { method, headers,
      ...(body === undefined ? {} : { body: JSON.stringify(body) }) }, `World Labs ${method} ${path}`);
    try { return await response.json() as T; } catch { throw new Error("World Labs returned invalid JSON; no retry performed."); }
  };
  const lockPath = join(folder, ".run.lock");
  const lock = await open(lockPath, "wx").catch(() => { throw new Error("Run lock exists. Check for a running process before removing only .run.lock; preserve budget.json."); });
  try {
    const ledgerPath = join(folder, "budget.json");
    const ledger = await readJson<Ledger>(ledgerPath, { version: 1, attempts: [] });
    let attempt: Attempt;
    let operation: Operation;
    if (resume) {
      const saved = ledger.attempts.find(a => a.stage === stage);
      if (!saved?.operation_id) throw new Error("No saved operation to resume. Do not resubmit a generation with an unknown outcome.");
      attempt = saved;
      operation = await api<Operation>(`/operations/${encodeURIComponent(saved.operation_id)}`);
    } else {
      // Validate budget/gate before any remote mutation. Ledger stays reserved even on unknown failure.
      attempt = reserveAttempt(ledger, stage, assessment);
      const credits = await api<{ remaining_credits: number }>("/credits");
      if (!Number.isFinite(credits.remaining_credits) || credits.remaining_credits < PRICES[stage])
        throw new Error("Insufficient confirmed prepaid credits for this run. No generation; no purchase attempted.");
      if (!ledger.media_asset_id) {
        const prepared = await api<{ media_asset: { id?: string; media_asset_id?: string };
          upload_info: { upload_url: string; upload_method: string; required_headers?: Record<string, string> } }>(
          "/media-assets:prepare_upload", "POST", { file_name: "scripty-mara-foggy-platform.png", kind: "image", extension: "png" });
        const id = prepared.media_asset.media_asset_id ?? prepared.media_asset.id;
        if (!id) throw new Error("Prepare upload is missing media_asset_id/id.");
        const info = prepared.upload_info;
        const bytes = await readFile(join(images, matches[0]));
        await requestOnce(info.upload_url, { method: info.upload_method,
          headers: { "Content-Type": "image/png", ...info.required_headers }, body: new Uint8Array(bytes) }, "Seed upload", fetch, 60_000);
        ledger.media_asset_id = id;
      }
      // Persist reservation BEFORE the paid POST, including when its response times out.
      await atomicJson(ledgerPath, ledger);
      console.log(`Starting ${stage}; reserved ${attempt.reserved_credits} credits. No automatic retries.`);
      operation = await api<Operation>("/worlds:generate", "POST", {
        display_name: `Scripty — Mara foggy platform (${stage})`, model: MODELS[stage],
        permission: { public: false, allow_id_access: false },
        world_prompt: { type: "image", image_prompt: { source: "media_asset", media_asset_id: ledger.media_asset_id },
          is_pano: false, text_prompt: PROMPT },
      });
      if (!operation.operation_id) throw new Error("No operation_id returned. Budget remains reserved; do not retry generation.");
      attempt.operation_id = operation.operation_id;
      attempt.status = "polling";
      await atomicJson(ledgerPath, ledger);
    }
    // Bounded status polling is not a request-retry loop. Any failed GET stops this invocation.
    const deadline = Date.now() + 12 * 60_000;
    for (let count = 0; !operation.done && count < 48 && Date.now() + 45_000 < deadline; count++) {
      await new Promise(resolve => setTimeout(resolve, 15_000));
      operation = await api<Operation>(`/operations/${encodeURIComponent(attempt.operation_id!)}`);
      console.log(`Poll ${count + 1}: ${operation.done ? "complete" : "in progress"}`);
    }
    if (!operation.done) throw new Error(`Polling deadline reached. Resume ${stage}; never start it again. Server work may continue.`);
    if (operation.error) {
      attempt.status = "failed";
      await atomicJson(ledgerPath, ledger);
      throw new Error(`World generation failed (code ${operation.error.code ?? "unknown"}); budget remains reserved. No retry.`);
    }
    if (!operation.response) throw new Error("Completed operation has no world response.");
    await atomicJson(join(folder, `${stage}-operation.json`), operation);
    let world = "world" in operation.response ? operation.response.world : operation.response;
    const worldId = world.world_id ?? world.id;
    // Operation snapshots can omit pano/metadata; a single free GET retrieves the latest assets.
    if (worldId) {
      try {
        const latest = await api<World | { world: World }>(`/worlds/${encodeURIComponent(worldId)}`);
        world = "world" in latest ? latest.world : latest;
        await atomicJson(join(folder, `${stage}-world.json`), world);
      } catch { console.log("Latest world GET unavailable; preserving completed operation snapshot. No retry."); }
    }
    const summary = summarize(world, operation, stage);
    attempt.status = "complete";
    if (Number.isFinite(operation.cost?.total_credits)) attempt.settled_credits = operation.cost!.total_credits;
    await atomicJson(ledgerPath, ledger);
    const old = await readJson<{ runs?: Record<string, unknown> }>(join(folder, "result.json"), {});
    await atomicJson(join(folder, "result.json"), {
      status: "generated", ...summary, runs: { ...old.runs, [stage]: summary },
      budget: { max_credits: MAX_CREDITS, reserved_credits: ledger.attempts.reduce((sum, a) => sum + a.reserved_credits, 0),
        settled_credits: ledger.attempts.every(a => a.settled_credits !== undefined)
          ? ledger.attempts.reduce((sum, a) => sum + a.settled_credits!, 0) : null },
    });
    console.log(`Saved result.json. Marble: ${summary.world_marble_url ?? "not returned"}`);
    console.log(`Run credits: ${attempt.settled_credits ?? "unverified"}; estimate ${PRICES[stage]}.`);
    if (stage === "draft") console.log("STOP: inspect thumbnail, panorama, and SPZ before deciding on the single standard run.");
  } finally { await lock.close(); await unlink(lockPath); }
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  main().catch(error => {
    // All request errors above are sanitized, never include the env/key or provider body.
    console.error(error instanceof Error ? error.message : "Spike failed; inspect local files.");
    process.exitCode = 1;
  });
}
