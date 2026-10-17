import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateMonitor } from "../lib/eval";
import { getProject, shotSchema } from "../lib/db";
import { z } from "zod";
import { loadLocalEnv } from "./env";

function option(name: string, fallback: string) { const at = process.argv.indexOf(name); return at < 0 ? fallback : process.argv[at + 1] ?? fallback; }
async function main() {
  loadLocalEnv();
  const projectId = option("--project", "mara");
  const includeDrafts = process.argv.includes("--include-drafts");
  const labels = JSON.parse(await readFile(resolve(option("--labels", "seed/labels.json")), "utf8"));
  let result;
  if (process.argv.includes("--live-recheck")) {
    // This explicitly invokes the live vision monitor and may incur API charges.
    const response = await fetch(`${option("--base-url", "http://localhost:3000")}/api/eval`, {
      method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ projectId, includeDrafts }), signal: AbortSignal.timeout(240000),
    });
    if (!response.ok) throw new Error(`Eval endpoint failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
    result = await response.json();
    if (result.positiveClass !== "drift" || result.mode !== "rechecked") throw new Error("Endpoint did not return the real recheck eval contract.");
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
