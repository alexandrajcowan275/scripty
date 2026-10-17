import { z } from "zod";
import * as database from "./db";

export type Usage = { imageRequests: number; textRequests: number; inputTokens: number; outputTokens: number; reservedUsd: number };
export const emptyUsage = (): Usage => ({ imageRequests: 0, textRequests: 0, inputTokens: 0, outputTokens: 0, reservedUsd: 0 });
export function addUsage(target: Usage, source: Usage) { for (const key of Object.keys(target) as (keyof Usage)[]) target[key] += source[key]; }
export const safeError = (error: unknown): string => error instanceof Error ? error.message.slice(0, 300) : "Provider request failed";
export async function reserve(amount: number, usage: Usage): Promise<void> {
  const fn = (database as unknown as { reserveApiBudget?: (amount: number) => Promise<boolean> }).reserveApiBudget;
  if (!fn || !await fn(amount)) throw new Error("AI spending allowance exhausted or unavailable; no provider call made.");
  usage.reservedUsd += amount;
}
export async function aiFetch(url: string, init: RequestInit, deadline = Date.now() + 60000): Promise<Response> {
  const remaining = Math.min(60000, deadline - Date.now());
  if (remaining < 1000) throw new Error("Batch deadline reached; provider call skipped.");
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(remaining), cache: "no-store" });
  if (!response.ok) throw new Error(`AI provider returned HTTP ${response.status}`);
  return response;
}
export async function structuredCall<T>(options: { schema: z.ZodType<T>; name: string; system: string; content: unknown[]; model: string; usage: Usage; deadline?: number; reservation?: number }): Promise<T> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");
  let failure: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await reserve(options.reservation ?? 0.03, options.usage);
      options.usage.textRequests++;
      const response = await aiFetch("https://api.openai.com/v1/responses", {
        method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: options.model, max_output_tokens: 2400, store: false,
          instructions: options.system, input: [{ role: "user", content: options.content }],
          text: { format: { type: "json_schema", name: options.name, strict: true, schema: z.toJSONSchema(options.schema) } } }),
      }, options.deadline);
      const data = await response.json();
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
