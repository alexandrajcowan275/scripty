import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { z } from "zod";
import seed from "../seed/mara.json";
import { batchSchema, projectSchema, ruleSchema, shotSchema, traceSchema, type ProjectData } from "./db";
import type { Rule, TraceEvent } from "./types";
const entrySchema = z.object({ batch: batchSchema, shots: z.array(shotSchema).length(6), rules: z.array(ruleSchema).default([]), traces: z.array(traceSchema).default([]) });
const manifestSchema = z.object({ version: z.literal(1), projectId: z.string(), provenance: z.literal("real_engine"), createdAt: z.string(), batches: z.array(entrySchema) });
const stateSchema = z.object({ v: z.literal(1), projectId: z.string(), count: z.number().int().min(0).max(20), reviews: z.array(z.object({ id: z.string().max(200), decision: z.enum(["accept", "reject"]), reason: z.string().max(400).optional() })).max(36), rules: z.array(ruleSchema).max(12) });
export type DemoState = z.infer<typeof stateSchema>;
const cookieName = "canon_demo";
function secret() { return process.env.CANON_SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || (process.env.NODE_ENV !== "production" ? "canon-local-development-cookie-key" : undefined); }
function sign(value: string) { const key = secret(); if (!key) throw new Error("CANON_SESSION_SECRET is required for cached session reviews"); return createHmac("sha256", key).update(value).digest("base64url"); }
export function readDemoState(request: Request, projectId: string): DemoState {
  const initial: DemoState = { v: 1, projectId, count: 0, reviews: [], rules: [] };
  const value = request.headers.get("cookie")?.split(";").map((part) => part.trim()).find((part) => part.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  if (!value || value.length > 5000) return initial;
  try {
    const [payload, signature] = value.split("."); const expected = sign(payload);
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return initial;
    const state = stateSchema.parse(JSON.parse(inflateRawSync(Buffer.from(payload, "base64url"), { maxOutputLength: 20000 }).toString()));
    return state.projectId === projectId ? state : initial;
  } catch { return initial; }
}
export function sessionCookie(state: DemoState): string {
  const payload = deflateRawSync(JSON.stringify(stateSchema.parse(state))).toString("base64url");
  const value = `${payload}.${sign(payload)}`;
  if (value.length > 3800) throw new Error("Demo session is full. Clear site data to start a new replay.");
  return `${cookieName}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export async function loadCache() {
  try { return manifestSchema.parse(JSON.parse(await readFile(path.join(process.cwd(), "seed/cache/manifest.json"), "utf8"))); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return null; throw new Error("Recorded cache is invalid; regenerate it before serving the demo."); }
}
export async function cachedProject(request: Request, projectId: string): Promise<{ data: ProjectData; state: DemoState; cache: Awaited<ReturnType<typeof loadCache>> } | null> {
  const project = projectSchema.parse(seed.project);
  if (project.id !== projectId) return null;
  const cache = await loadCache();
  if (cache && cache.projectId !== projectId) throw new Error("Cache belongs to another project");
  const state = readDemoState(request, projectId);
  const entries = cache?.batches.slice(0, state.count) ?? [];
  const rules = new Map<string, Rule>(seed.rules.map((rule) => [rule.id, rule as Rule]));
  for (const rule of state.rules) rules.set(rule.id, rule);
  const shots = entries.flatMap((entry) => entry.shots).map((shot) => {
    const review = state.reviews.find((item) => item.id === shot.id);
    return review ? { ...shot, status: review.decision === "accept" ? "accepted" as const : "rejected" as const, rejectReason: review.decision === "reject" ? review.reason : undefined } : { ...shot };
  });
  const localTraces: TraceEvent[] = state.rules.map((rule) => ({ id: `local-${rule.id}`, projectId, type: "rule_learned", message: `Cached session correction (local extraction, no AI call): ${rule.text}`, createdAt: rule.createdAt }));
  return { data: { project, rules: [...rules.values()], batches: entries.map((entry) => entry.batch), shots, traces: [...entries.flatMap((entry) => entry.traces), ...localTraces] }, state, cache };
}
export const cacheMetadata = { mode: "cached", provenance: "cached_real_engine", warning: "Replaying recorded images and measured checks. Reviews and local memory persist in this browser; recorded generation results do not change when you add a correction." };
export async function fallbackImage(index: number): Promise<string> { const cache = await loadCache(); return cache?.batches[0]?.shots[index % 6]?.imageUrl ?? seed.project.characters[0].referenceImageUrl; }
