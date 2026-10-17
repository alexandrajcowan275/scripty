import { evaluateMonitor, type HandLabel } from "./eval";
import { serverDatabase } from "./db";
import type { Shot, AttributeCheck } from "./types";
export type HumanSubmission = { id: string; shot_id: string; attribute_key: string; true_pass: boolean | null; prediction: AttributeCheck | null; note: string; created_at: string };
export function latestHumanLabels(rows: HumanSubmission[]) {
  const found = new Map<string, HumanSubmission>();
  for (const row of [...rows].sort((a, b) => b.created_at.localeCompare(a.created_at))) {
    const key = `${row.shot_id}\u0000${row.attribute_key}`;
    if (!found.has(key)) found.set(key, row);
  }
  return [...found.values()];
}
export async function humanSubmissions(projectId: string, ownerHash: string): Promise<HumanSubmission[]> {
  const { data, error } = await serverDatabase().from("human_labels").select("id,shot_id,attribute_key,true_pass,prediction,note,created_at").eq("project_id", projectId).eq("owner_hash", ownerHash).eq("source", "human_blind").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error("Human labels could not be loaded");
  return data as HumanSubmission[];
}
export async function evaluateHumanLabels(shots: Shot[], rows: HumanSubmission[]) {
  const latest = latestHumanLabels(rows);
  const labels: HandLabel[] = latest.filter(row => row.true_pass !== null).map(row => ({ shotId: row.shot_id, attributeKey: row.attribute_key, truePass: row.true_pass!, status: "verified", verifiedBy: "human_blind_submission", verifiedAt: row.created_at }));
  const frozen = shots.map(shot => ({ ...shot, checks: latest.filter(row => row.shot_id === shot.id && row.prediction).map(row => row.prediction!) }));
  const result = await evaluateMonitor(frozen, labels);
  return { ...result, confusionMatrix: { truePositives: result.truePositives, falsePositives: result.falsePositives, trueNegatives: result.trueNegatives, falseNegatives: result.falseNegatives }, labelSource: "human_blind" as const, humanLabels: labels.length, uncertainHumanLabels: latest.filter(row => row.true_pass === null).length, totalSubmissions: rows.length, metricsReady: result.evaluatedLabels >= 20, provenance: "human_labels_frozen_predictions", caveat: result.evaluatedLabels < 20 ? "Small sample: collect at least 20 human judgments before presenting accuracy." : "Human-entered labels, frozen monitor predictions; not independent expert certification." };
}

export function calibrationNotes(rows: HumanSubmission[]) {
  return latestHumanLabels(rows).filter(row => row.true_pass !== null && row.prediction && ((!row.prediction.pass && row.prediction.confidence >= 0.6) !== !row.true_pass)).slice(0, 10).map(row => ({ attributeKey: row.attribute_key, expected: row.prediction!.expected, previousObserved: row.prediction!.observed, humanPass: row.true_pass!, note: row.note }));
}
export async function humanCalibrationNotes(projectId: string, ownerHash: string) {
  return calibrationNotes(await humanSubmissions(projectId, ownerHash));
}
