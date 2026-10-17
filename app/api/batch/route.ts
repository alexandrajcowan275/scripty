import { z } from "zod";
import seed from "@/seed/mara.json";
import { getProject, getAcceptedReferences, incrementRuleUsage, saveBatch, saveShot, addTrace } from "@/lib/db";
import { generateImage } from "@/lib/generate";
import { monitorImage, uncertainChecks, scoreChecks, MONITOR_VERSION } from "@/lib/monitor";
import { buildFinalPrompt } from "@/lib/rules";
import { imageConfiguration, monitorConfiguration } from "@/lib/engine-config";
import { addUsage, emptyUsage } from "@/lib/engine-ai";
import { cachedProject, cacheMetadata, fallbackImage, sessionCookie } from "@/lib/engine-cache";
import { apiError, body, HttpError, liveMode, mapLimit, projectIdSchema } from "@/lib/engine-http";
import type { Batch, Shot, TraceEvent } from "@/lib/types";
export const maxDuration = 300;
export const dynamic = "force-dynamic";
const requestSchema = z.strictObject({ projectId: projectIdSchema, scenePrompts: z.array(z.string().trim().min(1).max(2000)).length(6).optional() });
export async function POST(request: Request) {
  try {
    const input = await body(request, requestSchema);
    if (!liveMode(request)) {
      const cached = await cachedProject(request, input.projectId); if (!cached) throw new HttpError("Project not found", 404);
      if (input.scenePrompts) throw new HttpError("Custom scene prompts require live mode; cached mode replays recorded scenes", 409);
      const entry = cached.cache?.batches[cached.state.count];
      if (!entry) throw new HttpError(cached.cache ? "All recorded batches have been replayed. Clear site data to start again." : "No recorded batches installed. Capture real engine batches first.", 409);
      cached.state.count++;
      return Response.json({ batch: entry.batch, shots: entry.shots.map((shot) => ({ ...shot, status: "pending", rejectReason: undefined })), ...cacheMetadata, recordedRuleIds: entry.batch.rulesApplied }, { headers: { "Set-Cookie": sessionCookie(cached.state), "Cache-Control": "no-store", "x-canon-mode": "cached" } });
    }
    const snapshot = await getProject(input.projectId); if (!snapshot) throw new HttpError("Project not found", 404);
    const character = snapshot.project.characters[0]; if (!character) throw new HttpError("Project has no character sheet", 409);
    if (snapshot.rules.length > 40) throw new HttpError("Demo supports at most forty active rules", 409);
    const scenes = input.scenePrompts ?? seed.scenePrompts;
    const imageConfig = imageConfiguration(), monitorConfig = monitorConfiguration();
    const configuration = { imageModel: imageConfig.model, imageQuality: imageConfig.quality, monitorModel: monitorConfig.model, monitorVersion: MONITOR_VERSION };
    const deadline = Date.now() + 260000;
    const usage = emptyUsage();
    const batch: Batch = { id: crypto.randomUUID(), projectId: input.projectId, index: Math.max(0, ...snapshot.batches.map((item) => item.index)) + 1, rulesApplied: snapshot.rules.map((rule) => rule.id), driftRate: 0, createdAt: new Date().toISOString() };
    const traces: TraceEvent[] = [];
    const trace = (type: TraceEvent["type"], message: string, shotId?: string, category?: TraceEvent["category"]) => { traces.push({ id: crypto.randomUUID(), projectId: input.projectId, ...(shotId ? { shotId } : {}), type, ...(category ? { category } : {}), message, createdAt: new Date().toISOString() }); };
    trace("generate", `Batch ${batch.index} configuration: ${JSON.stringify(configuration)}`);
    const accepted = await getAcceptedReferences(input.projectId);
    // A batch row precedes shots because shots reference it. The final measured rate replaces this row after checks finish.
    await saveBatch(batch);
    for (const rule of snapshot.rules) trace("rule_applied", `Applied to batch ${batch.index}: ${rule.text}`);
    const imageProvenance: Record<string, string> = {};
    const shots = await mapLimit(scenes, 3, async (scenePrompt, index): Promise<Shot> => {
      const shotId = crypto.randomUUID(); const finalPrompt = buildFinalPrompt(scenePrompt, character, snapshot.rules);
      const generated = await generateImage({ finalPrompt, referenceImageUrl: character.referenceImageUrl, acceptedReferenceUrl: accepted[0], fallbackImageUrl: await fallbackImage(index), filename: `${shotId}.png`, deadline });
      addUsage(usage, generated.usage); imageProvenance[shotId] = generated.provenance;
      for (const error of generated.errors) trace("error", `Generation: ${error}; provenance=${generated.provenance}`, shotId, "api_error");
      trace("generate", `Batch ${batch.index}, scene ${index + 1}; provider=${generated.provenance}; image_model=${generated.imageModel ?? "unavailable"}; image_quality=${generated.imageQuality ?? "unavailable"}; images=${generated.usage.imageRequests}; accepted_reference=${Boolean(accepted[0])}`, shotId);
      const monitor = generated.provenance === "cached_fallback" ? (() => { const checks = uncertainChecks(character, snapshot.rules, "Generation unavailable; cached/reference fallback is not a newly generated shot and was not re-evaluated."); return { checks, ...scoreChecks(checks, character, snapshot.rules), failures: [], usage: emptyUsage(), error: "Generation fallback: monitor skipped to avoid presenting old or placeholder evidence as a new pass", provenance: "unavailable_monitor" }; })() : await monitorImage({ imageUrl: generated.imageUrl, character, rules: snapshot.rules, deadline });
      addUsage(usage, monitor.usage);
      if (monitor.error) trace("error", monitor.error, shotId, "api_error");
      for (const check of monitor.checks) trace("check", `${check.key}: expected=${check.expected}; observed=${check.observed}; result=${check.confidence < 0.6 ? "uncertain" : check.pass ? "pass" : "fail"}; confidence=${check.confidence.toFixed(2)}; ${check.note ?? ""}; provenance=${monitor.provenance}; monitor_version=${MONITOR_VERSION}; monitor_model=${monitorConfig.model}`, shotId);
      for (const failure of monitor.failures) trace("flag", `${failure.key}: confident continuity failure; monitor_version=${MONITOR_VERSION}; monitor_model=${monitorConfig.model}`, shotId, failure.category);
      const shot: Shot = { id: shotId, projectId: input.projectId, batchId: batch.id, scenePrompt, finalPrompt, imageUrl: generated.imageUrl, checks: monitor.checks, driftScore: monitor.driftScore, flagged: monitor.flagged, status: "pending" };
      await saveShot(shot); return shot;
    });
    batch.driftRate = shots.filter((shot) => shot.flagged).length / shots.length;
    await saveBatch(batch); await incrementRuleUsage(input.projectId, batch.rulesApplied);
    trace("generate", `Batch ${batch.index} usage: ${JSON.stringify(usage)}. Reservations are pessimistic bounds, not billed cost.`);
    await mapLimit(traces, 3, async (event) => addTrace(event));
    const incomplete = shots.some((shot) => shot.checks.some((check) => check.confidence === 0));
    return Response.json({ batch, shots, mode: "live", provenance: incomplete ? "live_with_fallback" : "real_engine", imageProvenance, usage, configuration, ...(incomplete ? { warning: "Some shots could not be generated or evaluated. Unavailable checks are uncertain, never passes; this batch is not complete evidence of improvement." } : {}) }, { headers: { "Cache-Control": "no-store", "x-canon-mode": "live" } });
  } catch (error) { return apiError(error); }
}
