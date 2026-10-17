import { z } from "zod";
import { requirePaidAccess } from "@/lib/access";
import { addTrace, getAcceptedReferences, getApiBudget, getProject, incrementRuleUsage, saveBatch, saveShot, serverDatabase } from "@/lib/db";
import { addUsage, emptyUsage } from "@/lib/engine-ai";
import { apiError, body, HttpError, mapLimit, projectIdSchema } from "@/lib/engine-http";
import { generateImage } from "@/lib/generate";
import { monitorImage } from "@/lib/monitor";
import { buildFinalPrompt } from "@/lib/rules";
import { checkOrigin, claimCreation } from "@/lib/productions";
import { selectShots, workspace } from "@/lib/workspace";
import type { Batch } from "@/lib/types";
export const maxDuration = 300;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request); requirePaidAccess(request);
    const id = projectIdSchema.parse((await context.params).id);
    const input = await body(request, z.strictObject({ shotIds: z.array(z.string().min(1).max(200)).min(1).max(6).optional() }));
    const data = await workspace(request, id);
    const selected = selectShots(data.effectiveShots, input.shotIds, true);
    if (!selected.length) return Response.json({ shots: [], repaired: [], message: "No flagged shots to fix.", usage: emptyUsage() });
    if (selected.length > 6) throw new HttpError("Fix up to six flagged shots at a time");
    const budget = await getApiBudget();
    if (budget.remainingUsd < selected.length * 1.6) throw new HttpError("The set is at capacity. Your shots and memory are saved.", 429);
    await claimCreation(request, data.ownerHash, "fix");
    const current = await getProject(id);
    const batch: Batch = { id: crypto.randomUUID(), projectId: id, index: Math.max(0, ...(current?.batches ?? data.batches).map(b => b.index)) + 1, rulesApplied: data.rules.map(rule => rule.id), driftRate: 0, createdAt: new Date().toISOString() };
    await saveBatch(batch);
    const accepted = await getAcceptedReferences(id), usage = emptyUsage(), deadline = Date.now() + 260000;
    const results = await mapLimit(selected, 2, async source => {
      const id = crypto.randomUUID(), character = data.project.characters[0];
      const finalPrompt = buildFinalPrompt(source.scenePrompt, character, data.rules);
      const generated = await generateImage({ finalPrompt, referenceImageUrl: character.referenceImageUrl, acceptedReferenceUrl: accepted[0], fallbackImageUrl: source.imageUrl, filename: `${id}.png`, deadline });
      addUsage(usage, generated.usage);
      if (generated.provenance === "cached_fallback") {
        await addTrace({ id: crypto.randomUUID(), projectId: source.projectId, shotId: source.id, type: "error", category: "api_error", message: `Repair unavailable; original retained: ${generated.errors.join("; ")}`, createdAt: new Date().toISOString() });
        return { sourceShotId: source.id, error: generated.errors.join("; "), provenance: generated.provenance };
      }
      const checked = await monitorImage({ imageUrl: generated.imageUrl, character, rules: data.rules, calibration: data.checkerCalibration, deadline });
      addUsage(usage, checked.usage);
      const shot = { ...source, id, batchId: batch.id, finalPrompt, imageUrl: generated.imageUrl, checks: checked.checks, flagged: checked.flagged, driftScore: checked.driftScore, status: "pending" as const, rejectReason: undefined };
      await saveShot(shot);
      const saved = await serverDatabase().from("shot_repairs").insert({ shot_id: id, source_shot_id: source.id, owner_hash: data.ownerHash, project_id: source.projectId });
      if (saved.error) throw new Error("Repair generated but its lineage could not be saved");
      await addTrace({ id: crypto.randomUUID(), projectId: source.projectId, shotId: id, type: "generate", message: `Flagged-shot repair of ${source.id}; rules=${JSON.stringify(batch.rulesApplied)}; image=${generated.imageModel}; monitor=${checked.monitorModel}; provenance=${checked.error ? "live_with_uncertain_checks" : "real_engine"}`, createdAt: new Date().toISOString() });
      return { sourceShotId: source.id, shot, provenance: generated.provenance, ...(checked.error ? { warning: checked.error } : {}) };
    });
    const shots = results.flatMap(result => "shot" in result && result.shot ? [result.shot] : []);
    batch.driftRate = shots.length ? shots.filter(shot => shot.flagged).length / shots.length : 0;
    await saveBatch(batch);
    if (shots.length) await incrementRuleUsage(data.project.id, batch.rulesApplied);
    return Response.json({ batch, shots, repaired: results, usage, originalHistoryUnchanged: true, provenance: results.some(result => "error" in result || "warning" in result) ? "live_with_fallback" : "real_engine", completed: results.filter(result => "shot" in result && !("warning" in result)).length, warning: shots.length !== selected.length ? "Some repairs failed; original shots remain available." : undefined }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
