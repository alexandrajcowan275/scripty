import { z } from "zod";
import { isReasoningMonitor, MONITOR_ATTEMPT_RESERVATION } from "./engine-config";
import * as database from "./db";
import { usageCost } from "./pricing";

export type Usage = { imageRequests: number; textRequests: number; inputTokens: number; outputTokens: number; reservedUsd: number; estimatedUsd: number; pricedRequests: number };
export const emptyUsage = (): Usage => ({ imageRequests: 0, textRequests: 0, inputTokens: 0, outputTokens: 0, reservedUsd: 0, estimatedUsd: 0, pricedRequests: 0 });
export function addUsage(target: Usage, source: Usage) { for (const key of Object.keys(target) as (keyof Usage)[]) target[key] += source[key]; }
export const safeError = (error: unknown): string => error instanceof Error ? error.message.slice(0, 300) : "Provider request failed";
const reservationIds = new WeakMap<Usage, string[]>();
export async function reserve(amount: number, usage: Usage): Promise<void> {
  const id = crypto.randomUUID();
  if (!await database.reserveAiBudget(id, amount)) throw new Error("AI spending allowance exhausted or unavailable; no provider call made.");
  reservationIds.set(usage, [...(reservationIds.get(usage) ?? []), id]);
  usage.reservedUsd += amount;
}
export async function settleUsage(usage: Usage, model: string, raw: Record<string, unknown> | undefined) {
  const ids = reservationIds.get(usage);
  const id = ids?.pop();
  if (!raw) return;
  const cost = usageCost(model, raw);
  if (cost === null) return;
  usage.estimatedUsd += cost;
  usage.pricedRequests++;
  if (!id) return;
  // A settlement outage must not trigger another billable call. Retain its hold.
  try { await database.settleApiBudget(id, cost, model, raw); } catch { console.error("Usage settlement unavailable; conservative reservation retained"); }
}
export async function aiFetch(url: string, init: RequestInit, deadline = Date.now() + 60000): Promise<Response> {
  const remaining = Math.min(60000, deadline - Date.now());
  if (remaining < 1000) throw new Error("Batch deadline reached; provider call skipped.");
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(remaining), cache: "no-store" });
  if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}`);
  return response;
}
export function assertBudgetedTextModel(model: string): void {
  if (!["gpt-4.1-mini", "gpt-4.1-mini-2025-04-14", "gpt-4o-mini", "gpt-4o-mini-2024-07-18", "gpt-5.4-mini", "gpt-5.4-mini-2026-03-17"].includes(model)) throw new Error("Text model is outside the budgeted allowlist; use an approved mini model");
}
export async function structuredCall<T>(options: { schema: z.ZodType<T>; name: string; system: string; content: unknown[]; model: string; usage: Usage; deadline?: number; reservation?: number }): Promise<T> {
  assertBudgetedTextModel(options.model);
  const ruleCall = options.name === "canon_rule";
  const reasoningMonitor = isReasoningMonitor(options.model);
  if (ruleCall && reasoningMonitor) throw new Error("Rule extraction uses the budgeted non-reasoning mini models");
  const imageCount = options.content.filter((item) => item && typeof item === "object" && "type" in item && item.type === "input_image").length;
  if (imageCount > 2) throw new Error("Monitor accepts at most two budgeted input images");
  if (options.system.length > 4000) throw new Error("System prompt exceeds the budgeted input limit");
  if (JSON.stringify(options.content.filter((item) => !(item && typeof item === "object" && "type" in item && item.type === "input_image"))).length > (ruleCall ? 12000 : 32000)) throw new Error("Text context exceeds the budgeted input limit");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  let failure: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await reserve(ruleCall ? options.reservation ?? 0.01 : Math.max(options.reservation ?? 0, reasoningMonitor ? MONITOR_ATTEMPT_RESERVATION : 0.03), options.usage);
      options.usage.textRequests++;
      const response = await aiFetch("https://api.openai.com/v1/responses", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: options.model, max_output_tokens: ruleCall ? 600 : reasoningMonitor ? 4800 : 2400, store: false, ...(reasoningMonitor ? { reasoning: { effort: "low" } } : {}),
          instructions: options.system, input: [{ role: "user", content: options.content }],
          text: { format: { type: "json_schema", name: options.name, strict: true, schema: z.toJSONSchema(options.schema) } } }),
      }, options.deadline);
      const data = await response.json();
      await settleUsage(options.usage, options.model, data.usage);
      options.usage.inputTokens += data.usage?.input_tokens ?? 0;
      options.usage.outputTokens += data.usage?.output_tokens ?? 0;
      if (data.status !== "completed") throw new Error("Structured response incomplete or refused");
      const output = data.output?.flatMap((item: { content?: { type: string; text?: string }[] }) => item.content ?? []).find((part: { type: string }) => part.type === "output_text");
      if (!output?.text) throw new Error("Structured response had no JSON output");
      return options.schema.parse(JSON.parse(output.text));
    } catch (error) { failure = error; }
  }
  throw failure;
}
