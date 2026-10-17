import { z } from "zod";
import { batchSchema, shotSchema, ruleSchema, traceSchema } from "../lib/db";
import type { Batch, Shot, TraceEvent, Rule } from "../lib/types";
export const liveBatchSchema = z.object({ batch: batchSchema, shots: z.array(shotSchema).length(6), provenance: z.literal("real_engine"), imageProvenance: z.record(z.string(), z.enum(["openai", "gemini"])) });
export const snapshotSchema = z.object({ mode: z.literal("live"), provenance: z.literal("supabase"), batches: z.array(batchSchema), shots: z.array(shotSchema), rules: z.array(ruleSchema), traces: z.array(traceSchema) });
export type LiveBatch = z.infer<typeof liveBatchSchema>;
export function validateEvidence(data: LiveBatch): LiveBatch {
  const ids = new Set(data.shots.map((shot) => shot.id));
  if (ids.size !== 6 || data.shots.some((shot) => shot.batchId !== data.batch.id || shot.projectId !== data.batch.projectId)) throw new Error("A cache batch must contain six unique shots belonging to that project and batch.");
  if (data.shots.some((shot) => !["openai", "gemini"].includes(data.imageProvenance[shot.id]) || !shot.checks.length || shot.checks.some((check) => check.confidence === 0))) throw new Error("Incomplete generation/monitor evidence cannot be labeled real_engine. Fallback images or zero-confidence checks must not enter the real demo cache.");
  const measured = data.shots.filter((shot) => shot.flagged).length / 6;
  if (Math.abs(data.batch.driftRate - measured) > 0.000001) throw new Error("Saved drift rate does not match the six actual shot flags.");
  return data;
}
export function batchTraces(batch: Batch, shots: Shot[], traces: TraceEvent[]): TraceEvent[] {
  const ids = new Set(shots.map((shot) => shot.id));
  return traces.filter((trace) => trace.shotId ? ids.has(trace.shotId) : trace.type === "rule_applied" && trace.message.startsWith(`Applied to batch ${batch.index}: `) || trace.type === "generate" && trace.message.startsWith(`Batch ${batch.index} usage:`));
}
export function appliedRules(batch: Batch, rules: Rule[]): Rule[] {
  const filtered = batch.rulesApplied.map((id) => rules.find((rule) => rule.id === id));
  if (filtered.some((rule) => !rule)) throw new Error(`Cannot export batch ${batch.index}: an applied rule is missing from persistence.`);
  return filtered as Rule[];
}
/** Reconstruct only provenance actually recorded by the engine, never infer it from image URLs. */
export function existingBatch(batch: Batch, allShots: Shot[], traces: TraceEvent[]): LiveBatch {
  const shots = allShots.filter((shot) => shot.batchId === batch.id);
  const imageProvenance: Record<string, "openai" | "gemini"> = {};
  const sceneOrder = new Map<string, number>();
  for (const shot of shots) {
    const generation = traces.find((trace) => trace.shotId === shot.id && trace.type === "generate" && trace.message.startsWith(`Batch ${batch.index}, scene `));
    const match = generation?.message.match(/^Batch (\d+), scene ([1-6]); provider=(openai|gemini);/);
    if (!match) throw new Error(`Shot ${shot.id} lacks successful provider provenance; fallback or unknown images cannot be exported.`);
    imageProvenance[shot.id] = match[3] as "openai" | "gemini"; sceneOrder.set(shot.id, Number(match[2]));
    for (const check of shot.checks) {
      if (!traces.some((trace) => trace.shotId === shot.id && trace.type === "check" && trace.message.startsWith(`${check.key}: `) && trace.message.includes("provenance=live_monitor"))) throw new Error(`Shot ${shot.id} lacks verified live-monitor provenance for ${check.key}.`);
    }
  }
  if (new Set(sceneOrder.values()).size !== 6) throw new Error(`Batch ${batch.index} does not have six distinct recorded scene indices.`);
  shots.sort((a, b) => sceneOrder.get(a.id)! - sceneOrder.get(b.id)!);
  return validateEvidence(liveBatchSchema.parse({ batch, shots, provenance: "real_engine", imageProvenance }));
}
