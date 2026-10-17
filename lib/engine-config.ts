export const DEFAULT_IMAGE_MODEL = "gpt-image-2.5-sunburst-2026-09-08";
export const DEFAULT_MONITOR_MODEL = "gpt-5.4-mini-2026-03-17";
export const IMAGE_ATTEMPT_RESERVATION = 0.75;
export const MONITOR_ATTEMPT_RESERVATION = 0.05;
export function imageConfiguration() {
  const model = process.env.OPENAI_IMAGE_MODEL ?? DEFAULT_IMAGE_MODEL;
  if (!["gpt-image-1.5", "gpt-image-2", "gpt-image-2-2026-04-21", "gpt-image-2.5-sunburst", "gpt-image-2.5-sunburst-2026-09-08"].includes(model)) throw new Error("Image model is outside the budgeted allowlist");
  const quality = process.env.OPENAI_IMAGE_QUALITY ?? (model.startsWith("gpt-image-2.5-") ? "high" : "medium");
  if (!["low", "medium", ...(model.startsWith("gpt-image-2.5-") ? ["high"] : [])].includes(quality)) throw new Error("Image quality is outside the model's budgeted allowlist");
  return { model, quality };
}
export function monitorConfiguration() { return { model: process.env.OPENAI_MONITOR_MODEL ?? DEFAULT_MONITOR_MODEL, version: "canon-monitor-v3" }; }
export function isReasoningMonitor(model: string) { return model === "gpt-5.4-mini" || model === "gpt-5.4-mini-2026-03-17"; }
