import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateMonitor } from "../lib/eval";
import { getProject, shotSchema } from "../lib/db";
import { z } from "zod";
import { loadLocalEnv } from "./env";
import { liveHeaders } from "./live-request";

function option(name: string, fallback: string) { const at = process.argv.indexOf(name); return at < 0 ? fallback : process.argv[at + 1] ?? fallback; }
async function main() {
  loadLocalEnv();
  const projectId = option("--project", "mara");
  const includeDrafts = process.argv.includes("--include-drafts");
  const labels = JSON.parse(await readFile(resolve(option("--labels", "seed/labels.json")), "utf8"));
  let result;
  if (process.argv.includes("--live-recheck")) {
    // Paid monitor inference is explicit and separate from free human evaluation.
    // For private productions provide an owner Cookie header in this private file.
    const cookieFile = option("--cookie-header-file", "");
    const cookie = cookieFile ? (await readFile(resolve(cookieFile), "utf8")).trim() : "";
    const headers: Record<string, string> = { ...liveHeaders(), ...(process.env.SCRIPTY_ACCESS_CODE ? { authorization: `Bearer ${process.env.SCRIPTY_ACCESS_CODE}` } : {}), ...(cookie ? { cookie } : {}) };
    const base = option("--base-url", "http://localhost:3000");
    const response = await fetch(`${base}/api/project/${encodeURIComponent(projectId)}/recheck`, {
      method: "POST", headers, body: JSON.stringify({}), signal: AbortSignal.timeout(280000),
    });
    if (!response.ok) throw new Error(`Recheck endpoint failed (${response.status}). Open the production in its owning browser and use Re-check with memory, or supply --cookie-header-file.`);
    const checked = await response.json();
    if (checked.failed || checked.imageRequests !== 0) throw new Error("Recheck did not complete without image generation");
    const evaluated = await fetch(`${base}/api/eval`, { method: "POST", headers, body: JSON.stringify({ projectId }), signal: AbortSignal.timeout(30000) });
    if (!evaluated.ok) throw new Error(`Human evaluation endpoint failed (${evaluated.status})`);
    result = await evaluated.json();
    if (result.labelSource !== "human_blind") throw new Error("Endpoint did not return human-only evaluation");
  } else {
    const input = option("--shots", "");
    const project = input ? null : await getProject(projectId);
    const shots = input ? z.array(shotSchema).parse(JSON.parse(await readFile(resolve(input), "utf8"))) : project?.shots;
    if (!shots) throw new Error(`Project ${projectId} does not exist. Seed it first, or provide --shots path.json.`);
    result = await evaluateMonitor(shots, labels, { includeDrafts });
  }
  console.log(`Monitor evaluation: ${result.mode}; positive class = drift; ${result.evaluatedLabels}/${result.eligibleLabels} labels scored.`);
  if (includeDrafts) console.warn("DRAFT LABELS INCLUDED: exploratory output only; do not report as validated metrics.");
  const percent = (value: number | null) => value === null ? "N/A" : `${(value * 100).toFixed(1)}%`;
  console.table([{ precision: percent(result.precision), recall: percent(result.recall), F1: percent(result.f1), accuracy: percent(result.accuracy), TP: result.truePositives, FP: result.falsePositives, TN: result.trueNegatives, FN: result.falseNegatives, unverified: result.skippedUnverified, missingShots: result.missingShots, missingChecks: result.missingChecks }]);
  console.table(result.rows);
  if (result.status === "no_verified_labels") console.log("No verified hand labels. Inspect actual images and complete seed/labels.json before claiming monitor accuracy.");
}
main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Evaluation failed."); process.exitCode = 1; });
