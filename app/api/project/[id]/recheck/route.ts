import { z } from "zod";
import { requirePaidAccess } from "@/lib/access";
import { addTrace, serverDatabase } from "@/lib/db";
import { addUsage, emptyUsage } from "@/lib/engine-ai";
import { apiError, body, HttpError, mapLimit, projectIdSchema } from "@/lib/engine-http";
import { monitorImage } from "@/lib/monitor";
import { checkOrigin, claimCreation } from "@/lib/productions";
import { selectShots, workspace } from "@/lib/workspace";
export const maxDuration = 300;
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request); requirePaidAccess(request);
    const id = projectIdSchema.parse((await context.params).id);
    const input = await body(request, z.strictObject({ shotIds: z.array(z.string().min(1).max(200)).min(1).max(24).optional(), ruleIds: z.array(z.string().min(1).max(200)).max(40).optional() }));
    const data = await workspace(request, id);
    if (input.ruleIds?.some(ruleId => !data.rules.some(rule => rule.id === ruleId))) throw new HttpError("Rule not found", 404);
    const shots = selectShots(data.shots, input.shotIds);
    if (shots.length > 24) throw new HttpError("Re-check up to 24 shots at a time");
    await claimCreation(request, data.ownerHash, "recheck");
    const usage = emptyUsage(), deadline = Date.now() + 260000;
    const results = await mapLimit(shots, 2, async shot => {
      const result = await monitorImage({ imageUrl: shot.imageUrl, character: data.project.characters[0], rules: data.rules, calibration: data.checkerCalibration, deadline });
      addUsage(usage, result.usage);
      if (result.error) return { shotId: shot.id, error: result.error, provenance: result.provenance };
      const row = { project_id: id, shot_id: shot.id, owner_hash: data.ownerHash, checks: result.checks, flagged: result.flagged, drift_score: result.driftScore, rule_ids: data.rules.map(rule => rule.id), model: result.monitorModel!, version: result.monitorVersion! };
      const saved = await serverDatabase().from("monitor_runs").insert(row).select("id,created_at").single();
      if (saved.error) throw new Error("Check finished but its evidence could not be saved");
      await addTrace({ id: crypto.randomUUID(), projectId: id, shotId: shot.id, type: "check", message: `Memory re-check ${saved.data.id}; rules=${JSON.stringify(row.rule_ids)}; monitor=${row.model}; original shot and batch unchanged`, createdAt: new Date().toISOString() });
      return { shotId: shot.id, ...saved.data, checks: result.checks, flagged: result.flagged, driftScore: result.driftScore, rulesApplied: row.rule_ids, provenance: result.provenance };
    });
    return Response.json({ results, usage, imageRequests: 0, completed: results.filter(row => !("error" in row)).length, failed: results.filter(row => "error" in row).length, originalHistoryUnchanged: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
