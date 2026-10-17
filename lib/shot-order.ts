import type { Batch, Shot, TraceEvent } from "./types";
/** Concurrent saves have random IDs; original generation traces retain scene order. */
export function orderShotsForReview(
  shots: Shot[],
  batches: Batch[],
  traces: TraceEvent[],
): Shot[] {
  const batchOrder = new Map(batches.map((batch) => [batch.id, batch.index]));
  const sceneOrder = new Map<string, number>();
  for (const trace of traces) {
    if (trace.type !== "generate" || !trace.shotId) continue;
    const match = /^(?:Batch|Take) \d+, scene ([1-6]);/.exec(trace.message);
    if (match) sceneOrder.set(trace.shotId, Number(match[1]));
  }
  return [...shots].sort(
    (a, b) =>
      (batchOrder.get(a.batchId) ?? 0) - (batchOrder.get(b.batchId) ?? 0) ||
      (sceneOrder.get(a.id) ?? 99) - (sceneOrder.get(b.id) ?? 99) ||
      a.id.localeCompare(b.id),
  );
}
