import { z } from "zod";
import type { AttributeCheck, Shot } from "./types";

export const handLabelSchema = z.object({
  shotId: z.string().min(1), attributeKey: z.string().min(1), truePass: z.boolean(),
  status: z.enum(["draft", "verified"]).default("draft"),
  verifiedBy: z.string().min(1).optional(), verifiedAt: z.iso.datetime({ offset: true }).optional(), note: z.string().optional(),
});
export type HandLabel = z.infer<typeof handLabelSchema>;
export const labelsFileSchema = z.object({ version: z.literal(1), description: z.string().optional(), labels: z.array(handLabelSchema) });
export type EvalResult = {
  positiveClass: "drift"; mode: "stored_checks" | "rechecked"; status: "no_verified_labels" | "complete";
  precision: number | null; recall: number | null; f1: number | null; accuracy: number | null;
  truePositives: number; falsePositives: number; trueNegatives: number; falseNegatives: number;
  eligibleLabels: number; evaluatedLabels: number; skippedUnverified: number; missingChecks: number; missingShots: number;
  confidenceThreshold: number; includesDrafts: boolean; rows: EvalRow[];
};
type EvalRow = { shotId: string; attributeKey: string; trueDrift: boolean; predictedDrift: boolean | null; confidence: number | null; result: "TP" | "FP" | "TN" | "FN" | "missing_shot" | "missing_check" };
export type Recheck = (shot: Shot) => Promise<AttributeCheck[]>;
/** Ground truth is never inferred from the monitor. Low-confidence failures are not flags. */
export async function evaluateMonitor(shots: Shot[], input: unknown, options: { includeDrafts?: boolean; confidenceThreshold?: number; recheck?: Recheck } = {}): Promise<EvalResult> {
  const labels = Array.isArray(input) ? z.array(handLabelSchema).parse(input) : labelsFileSchema.parse(input).labels;
  const threshold = z.number().min(0).max(1).parse(options.confidenceThreshold ?? 0.6);
  const eligible = labels.filter((label) => options.includeDrafts || (label.status === "verified" && Boolean(label.verifiedBy && label.verifiedAt) && !/^DRAFT/i.test(label.shotId)));
  const seen = new Set<string>();
  for (const label of eligible) { const key = `${label.shotId}\u0000${label.attributeKey}`; if (seen.has(key)) throw new Error(`Duplicate hand label for ${label.shotId}/${label.attributeKey}`); seen.add(key); }
  const checksByShot = new Map<string, AttributeCheck[]>();
  const shotById = new Map(shots.map((shot) => [shot.id, shot]));
  const rows: EvalRow[] = [];
  for (const label of eligible) {
    const shot = shotById.get(label.shotId);
    if (!shot) { rows.push({ ...label, trueDrift: !label.truePass, predictedDrift: null, confidence: null, result: "missing_shot" }); continue; }
    if (!checksByShot.has(shot.id)) checksByShot.set(shot.id, options.recheck ? await options.recheck(shot) : shot.checks);
    const check = checksByShot.get(shot.id)?.find((item) => item.key === label.attributeKey);
    if (!check) { rows.push({ ...label, trueDrift: !label.truePass, predictedDrift: null, confidence: null, result: "missing_check" }); continue; }
    const predictedDrift = !check.pass && check.confidence >= threshold;
    const trueDrift = !label.truePass;
    rows.push({ shotId: label.shotId, attributeKey: label.attributeKey, trueDrift, predictedDrift, confidence: check.confidence, result: trueDrift ? predictedDrift ? "TP" : "FN" : predictedDrift ? "FP" : "TN" });
  }
  const count = (value: EvalRow["result"]) => rows.filter((row) => row.result === value).length;
  const tp = count("TP"), fp = count("FP"), tn = count("TN"), fn = count("FN");
  const ratio = (numerator: number, denominator: number) => denominator ? numerator / denominator : null;
  return {
    positiveClass: "drift", mode: options.recheck ? "rechecked" : "stored_checks", status: eligible.length ? "complete" : "no_verified_labels",
    precision: ratio(tp, tp + fp), recall: ratio(tp, tp + fn), f1: ratio(2 * tp, 2 * tp + fp + fn), accuracy: ratio(tp + tn, tp + fp + tn + fn),
    truePositives: tp, falsePositives: fp, trueNegatives: tn, falseNegatives: fn, eligibleLabels: eligible.length,
    evaluatedLabels: tp + fp + tn + fn, skippedUnverified: labels.length - eligible.length, missingChecks: count("missing_check"), missingShots: count("missing_shot"), confidenceThreshold: threshold, includesDrafts: Boolean(options.includeDrafts), rows,
  };
}
