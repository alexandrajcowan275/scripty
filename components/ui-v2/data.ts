import type { AttributeCheck, Batch, Project, Rule, Shot, TraceEvent } from "@/lib/types";

export type Check = AttributeCheck & {
  location?: { x: number; y: number; width: number; height: number; units?: "normalized" | "pixels" };
};
export type ProductionData = {
  project: Project;
  batches: Batch[];
  shots: Shot[];
  rules: Rule[];
  traces: TraceEvent[];
  mode?: string;
  effectiveMode?: string;
  generationEnabled?: boolean;
  recordedRuleIds?: string[];
  scenePrompts?: string[];
  pricing?: { generatePerShotUsd?: number; recheckPerShotUsd?: number; model?: string };
  capabilities?: { recheck?: boolean; fix?: boolean; undo?: boolean };
};
export type ReviewReceipt = {
  shot: Shot;
  newRule?: Rule;
  merged?: boolean;
  undoToken?: string;
  mode?: string;
};
export class RequestError extends Error {
  constructor(message: string, public status: number, public details?: Record<string, unknown>) {
    super(message);
    this.name = "RequestError";
  }
}
export async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  if (init.signal?.aborted) controller.abort();
  const timer = setTimeout(abort, init.method && init.method !== "GET" ? 310_000 : 25_000);
  try {
    const response = await fetch(url, {
      ...init, cache: "no-store", signal: controller.signal,
      headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new RequestError(
      typeof payload.error === "string" ? payload.error : response.status === 404 ? "This part of the set isn’t ready yet." : "That didn’t land. Try again.",
      response.status, payload,
    );
    return payload as T;
  } catch (error) {
    if (controller.signal.aborted && !init.signal?.aborted) throw new RequestError("The set is taking a moment. Your work is safe; try again.", 408);
    throw error;
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}
export const post = <T,>(url: string, body: unknown = {}) => request<T>(url, { method: "POST", body: JSON.stringify(body) });
export const message = (error: unknown) => error instanceof Error ? error.message : "That didn’t land. Try again.";
export const number = (value: number | undefined | null) => value == null || !Number.isFinite(value) ? "—" : String(value);
export const percent = (value: number | undefined | null) => value == null || !Number.isFinite(value) ? "—" : `${Math.round(value * 100)}%`;
export const confidence = (value: number | undefined | null) => value == null || !Number.isFinite(value) || value <= 0 ? "—" : value.toFixed(2);
export const money = (value: number | undefined | null) => value == null || !Number.isFinite(value) ? "—" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value);
export const sortedBatches = (data?: ProductionData | null) => [...(data?.batches ?? [])].sort((a, b) => a.index - b.index);
export const shotsFor = (data: ProductionData | null | undefined, batchId?: string) => (data?.shots ?? []).filter(s => s.batchId === batchId);
export const unclear = (check: AttributeCheck) => !Number.isFinite(check.confidence) || check.confidence < .6 || /unclear|not visible|occluded|cannot determine/i.test(check.observed);
export const failedCheck = (shot: Shot): Check | undefined => (shot.checks.find(c => !c.key.startsWith("rule:") && !c.pass && !unclear(c)) ?? shot.checks.find(c => !c.pass && !unclear(c))) as Check | undefined;
export const checkLabel = (key: string, data?: ProductionData | null) => data?.project.characters.flatMap(c => c.attributes).find(a => a.key === key)?.label ?? key.replace(/^rule:/, "Rule ").replaceAll("_", " ");
export function shotStatus(shot: Shot) {
  const failed = failedCheck(shot);
  if (shot.flagged) return { kind: "drift" as const, label: failed ? checkLabel(failed.key) : "Flagged", detail: failed ? confidence(failed.confidence) : "—" };
  const count = shot.checks.filter(unclear).length;
  if (!shot.checks.length) return { kind: "unclear" as const, label: "Check pending", detail: "—" };
  if (count) return { kind: "unclear" as const, label: `${count} unclear`, detail: "?" };
  return { kind: "pass" as const, label: "on-model", detail: "✓" };
}
export function ruleReach(rule: Rule, shots: Shot[]) {
  return new Set(shots.filter(s => s.finalPrompt.includes(rule.text) && s.checks.some(c => c.key === `rule:${rule.id}`)).map(s => s.id)).size;
}
export function rulePromptReach(rule: Rule, shots: Shot[]) { return new Set(shots.filter(s => s.finalPrompt.includes(rule.text)).map(s => s.id)).size; }
export function ruleCheckReach(rule: Rule, shots: Shot[]) { return new Set(shots.filter(s => s.checks.some(c => c.key === `rule:${rule.id}`)).map(s => s.id)).size; }
export function frameName(shot: Shot, data: ProductionData) {
  const batch = data.batches.find(b => b.id === shot.batchId);
  const index = shotsFor(data, shot.batchId).findIndex(s => s.id === shot.id);
  return `T${number(batch?.index)}·S${index < 0 ? "—" : String(index + 1).padStart(2, "0")}`;
}
export const sharedShot = (id: string) => `shot-${id.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
export const sceneTitle = (shot: Shot) => shot.scenePrompt.replace(/^(wide establishing shot|close-up portrait|low-angle shot|profile medium shot|over-the-shoulder shot|high-angle shot|medium shot|shot) of /i, "").replace(/^[^ ]+ /, "").replace(/[.]$/, "");
export function modelFor(data: ProductionData, batch: Batch | undefined, field: "image_model" | "monitor_model") {
  const ids = new Set(shotsFor(data, batch?.id).map(s => s.id));
  const traces = data.traces.filter(t => ids.has(t.shotId ?? "") || t.message.includes(`Batch ${batch?.index},`));
  return traces.map(t => t.message.match(new RegExp(`${field}=([^;\\s]+)`))?.[1]).find(Boolean) ?? "—";
}
export function reviewReason(shot: Shot) { const check = failedCheck(shot); return shot.rejectReason ?? (check ? `Keep ${check.expected}.` : ""); }
export function primaryRule(data: ProductionData) { return data.rules.find(r => r.source !== "seed" && ruleReach(r, data.shots) > 0) ?? data.rules.find(r => r.source !== "seed"); }
