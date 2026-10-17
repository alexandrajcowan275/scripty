import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Batch, Project, Rule, Shot, TraceEvent } from "./types";

const id = z.string().min(1).max(200);
const text = z.string().min(1);
const date = z.iso.datetime({ offset: true });
const url = z.string().refine((value) => value.startsWith("/") || /^https?:\/\//.test(value), "Expected an image path or HTTP URL");
export const attributeSchema = z.object({ key: id, label: text, expected: text, weight: z.number().positive().finite() });
export const projectSchema = z.object({ id, name: text.max(200), characters: z.array(z.object({ id, name: text, referenceImageUrl: url, attributes: z.array(attributeSchema) })) });
export const ruleSchema = z.object({ id, projectId: id, text: text.max(2000), attributeKey: id.optional(), source: z.enum(["rejection", "correction", "seed"]), createdAt: date, timesApplied: z.number().int().nonnegative() });
export const batchSchema = z.object({ id, projectId: id, index: z.number().int().positive(), rulesApplied: z.array(id), driftRate: z.number().min(0).max(1), createdAt: date });
export const checkSchema = z.object({ key: id, expected: text, observed: text, pass: z.boolean(), confidence: z.number().min(0).max(1), note: z.string().optional() });
export const shotSchema = z.object({ id, projectId: id, batchId: id, scenePrompt: text, finalPrompt: text, imageUrl: url, checks: z.array(checkSchema), driftScore: z.number().min(0).max(1), flagged: z.boolean(), status: z.enum(["pending", "accepted", "rejected"]), rejectReason: z.string().max(4000).optional() }).refine((shot) => new Set(shot.checks.map((check) => check.key)).size === shot.checks.length, "Duplicate attribute checks");
export const traceSchema = z.object({ id, projectId: id, shotId: id.optional(), type: z.enum(["generate", "check", "flag", "rule_learned", "rule_applied", "error"]), category: z.enum(["attribute_drift", "identity_drift", "style_drift", "prompt_ignored", "api_error"]).optional(), message: text.max(20000), createdAt: date });

let client: SupabaseClient | undefined;
function db(): SupabaseClient {
  if (typeof window !== "undefined") throw new Error("Canon database access is server-only.");
  if (client) return client;
  const endpoint = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!endpoint || !key) throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local or use DEMO_MODE=cached.");
  if (!/^https?:\/\//.test(endpoint)) throw new Error("NEXT_PUBLIC_SUPABASE_URL must be an HTTP URL.");
  client = createClient(endpoint, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: (input, init) => fetch(input, { ...init, signal: init?.signal ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) }) },
  });
  return client;
}
function fail(error: { message: string; code?: string } | null, operation: string): void {
  if (error) throw new Error(`Supabase ${operation} failed (${error.code ?? "request"}): ${error.message}`);
}
// PostgREST aliases make the API's shared camelCase contracts the validation boundary.
const ruleSelect = "id,projectId:project_id,text,attributeKey:attribute_key,source,createdAt:created_at,timesApplied:times_applied";
const batchSelect = "id,projectId:project_id,index,rulesApplied:rules_applied,driftRate:drift_rate,createdAt:created_at";
const shotSelect = "id,projectId:project_id,batchId:batch_id,scenePrompt:scene_prompt,finalPrompt:final_prompt,imageUrl:image_url,driftScore:drift_score,flagged,status,rejectReason:reject_reason,checks:attribute_checks(key,expected,observed,pass,confidence,note,position)";
const traceSelect = "id,projectId:project_id,shotId:shot_id,type,category,message,createdAt:created_at";
function withoutNulls(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(withoutNulls);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== null).map(([k, v]) => [k, withoutNulls(v)]));
  return value;
}
function parseShot(value: unknown): Shot {
  const row = value as { checks: { position: number }[] };
  return shotSchema.parse(withoutNulls({ ...row, checks: [...row.checks].sort((a, b) => a.position - b.position) }));
}
export type ProjectData = { project: Project; rules: Rule[]; batches: Batch[]; shots: Shot[]; traces: TraceEvent[] };
export async function getProject(projectId: string): Promise<ProjectData | null> {
  id.parse(projectId);
  const { data, error } = await db().from("projects").select("id,name,characters(id,name,referenceImageUrl:reference_image_url,position,attributes(key,label,expected,weight,position))").eq("id", projectId).maybeSingle();
  fail(error, "getProject");
  if (!data) return null;
  const row = data as unknown as { characters: { position: number; attributes: { position: number }[] }[] };
  const project = projectSchema.parse({ ...data, characters: [...row.characters].sort((a, b) => a.position - b.position).map((character) => ({ ...character, attributes: [...character.attributes].sort((a, b) => a.position - b.position) })) });
  const [rules, batchesResult, shotsResult, traces] = await Promise.all([
    listRules(projectId),
    db().from("batches").select(batchSelect).eq("project_id", projectId).order("index"),
    db().from("shots").select(shotSelect).eq("project_id", projectId).order("id"),
    listTraces(projectId),
  ]);
  fail(batchesResult.error, "list batches"); fail(shotsResult.error, "list shots");
  return { project, rules, batches: z.array(batchSchema).parse(batchesResult.data), shots: (shotsResult.data ?? []).map(parseShot), traces };
}
export async function getShot(shotId: string): Promise<Shot | null> {
  const { data, error } = await db().from("shots").select(shotSelect).eq("id", id.parse(shotId)).maybeSingle();
  fail(error, "getShot"); return data ? parseShot(data) : null;
}
export async function saveBatch(input: Batch): Promise<Batch> {
  const batch = batchSchema.parse(input);
  const { error } = await db().from("batches").upsert({ id: batch.id, project_id: batch.projectId, index: batch.index, rules_applied: batch.rulesApplied, drift_rate: batch.driftRate, created_at: batch.createdAt });
  fail(error, "saveBatch"); return batch;
}
export async function saveShot(input: Shot): Promise<Shot> {
  const shot = shotSchema.parse(input);
  const { error } = await db().rpc("save_shot", { p_shot: shot });
  fail(error, "saveShot"); return shot;
}
export async function updateShotReview(shotId: string, decision: "accept" | "reject", reason?: string): Promise<Shot> {
  id.parse(shotId); z.enum(["accept", "reject"]).parse(decision); z.string().max(4000).optional().parse(reason);
  const { error, data } = await db().from("shots").update({ status: decision === "accept" ? "accepted" : "rejected", reject_reason: decision === "reject" ? reason?.trim() || null : null }).eq("id", shotId).select("id").maybeSingle();
  fail(error, "updateShotReview");
  if (!data) throw new Error(`Shot ${shotId} was not found.`);
  const saved = await getShot(shotId); if (!saved) throw new Error("Reviewed shot could not be reloaded."); return saved;
}
export async function addRule(input: Rule): Promise<Rule> {
  const rule = ruleSchema.parse(input);
  const { error } = await db().from("rules").upsert({ id: rule.id, project_id: rule.projectId, text: rule.text, attribute_key: rule.attributeKey ?? null, source: rule.source, created_at: rule.createdAt, times_applied: rule.timesApplied });
  fail(error, "addRule"); return rule;
}
export async function listRules(projectId: string): Promise<Rule[]> {
  const { data, error } = await db().from("rules").select(ruleSelect).eq("project_id", id.parse(projectId)).order("times_applied", { ascending: false }).order("created_at", { ascending: false });
  fail(error, "listRules"); return z.array(ruleSchema).parse(withoutNulls(data));
}
export async function addTrace(input: TraceEvent): Promise<TraceEvent> {
  const trace = traceSchema.parse(input);
  const { error } = await db().from("traces").upsert({ id: trace.id, project_id: trace.projectId, shot_id: trace.shotId ?? null, type: trace.type, category: trace.category ?? null, message: trace.message, created_at: trace.createdAt });
  fail(error, "addTrace"); return trace;
}
export async function listTraces(projectId: string): Promise<TraceEvent[]> {
  const { data, error } = await db().from("traces").select(traceSelect).eq("project_id", id.parse(projectId)).order("created_at").order("id");
  fail(error, "listTraces"); return z.array(traceSchema).parse(withoutNulls(data));
}
export async function incrementRuleUsage(projectId: string, ruleIds: string[]): Promise<void> {
  id.parse(projectId); z.array(id).parse(ruleIds); if (!ruleIds.length) return;
  const { error } = await db().rpc("increment_rule_usage", { p_project_id: projectId, p_rule_ids: [...new Set(ruleIds)] }); fail(error, "incrementRuleUsage");
}
export async function getAcceptedReferences(projectId: string): Promise<string[]> {
  const { data, error } = await db().from("shots").select("image_url").eq("project_id", id.parse(projectId)).eq("status", "accepted").order("drift_score").limit(4);
  fail(error, "getAcceptedReferences"); return z.array(z.object({ image_url: url })).parse(data).map((shot) => shot.image_url);
}
export async function uploadShotImage(buffer: Uint8Array, filename: string, contentType: string): Promise<string> {
  z.instanceof(Uint8Array).refine((bytes) => bytes.byteLength > 0 && bytes.byteLength <= 20 * 1024 * 1024, "Image must be 1 byte–20 MiB").parse(buffer);
  z.enum(["image/png", "image/jpeg", "image/webp"]).parse(contentType);
  const safeName = filename.split(/[\\/]/).pop()?.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-150);
  if (!safeName) throw new Error("A shot filename is required.");
  const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${safeName}`;
  const { error } = await db().storage.from("shots").upload(path, buffer, { contentType, upsert: false }); fail(error, "uploadShotImage");
  return db().storage.from("shots").getPublicUrl(path).data.publicUrl;
}
/** Seed updates the character sheet and seed rules; existing reviews, batches and learned rules survive. */
export async function seedProject(input: Project, inputRules: Rule[]): Promise<void> {
  const project = projectSchema.parse(input); const rules = z.array(ruleSchema).parse(inputRules);
  if (rules.some((rule) => rule.projectId !== project.id)) throw new Error("Seed rule belongs to another project.");
  const { error } = await db().rpc("seed_project", { p_project: project, p_rules: rules }); fail(error, "seedProject");
}

/** Reserve a conservative upper bound BEFORE every paid attempt, including retries.
 * Returns false at the fixed $24 DB cap. Never refund network failures automatically. */
export async function reserveAiBudget(reservationId: string, amount: number): Promise<boolean> {
  id.parse(reservationId);
  z.number().positive().max(24).finite().parse(amount);
  // Round upward: numeric(10,4) must never round a tiny reservation down to zero.
  const rounded = Math.ceil(amount * 10000) / 10000;
  const { data, error } = await db().rpc("reserve_api_budget", { p_amount: rounded, p_reservation_id: reservationId });
  fail(error, "reserveApiBudget"); return z.boolean().parse(data);
}
export async function reserveApiBudget(amount: number): Promise<boolean> {
  return reserveAiBudget(crypto.randomUUID(), amount);
}
export async function getApiBudget(): Promise<{ reservedUsd: number; limitUsd: 24; remainingUsd: number }> {
  const { data, error } = await db().from("api_budget").select("reserved_usd").eq("id", "canon-demo").single();
  fail(error, "getApiBudget");
  const reservedUsd = z.coerce.number().min(0).max(24).parse(data?.reserved_usd);
  return { reservedUsd, limitUsd: 24, remainingUsd: Math.max(0, 24 - reservedUsd) };
}
