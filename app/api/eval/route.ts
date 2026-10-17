import { z } from "zod";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getProject } from "@/lib/db";
import { evaluateMonitor } from "@/lib/eval";
import { monitorImage } from "@/lib/monitor";
import { cachedProject } from "@/lib/engine-cache";
import { apiError, body, HttpError, liveMode, projectIdSchema } from "@/lib/engine-http";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    const input = await body(request, z.strictObject({ projectId: projectIdSchema, recheck: z.boolean().optional(), includeDrafts: z.boolean().optional() }));
    const live = liveMode(request);
    if (input.recheck && !live) throw new HttpError("Fresh evaluation requires authorized live mode", 409);
    const cached = live ? null : await cachedProject(request, input.projectId);
    const snapshot = live ? await getProject(input.projectId) : cached?.data;
    if (!snapshot) throw new HttpError("Project not found", 404);
    const labels = JSON.parse(await readFile(path.join(process.cwd(), "seed/labels.json"), "utf8"));
    const deadline = Date.now() + 260000;
    const result = await evaluateMonitor(snapshot.shots, labels, { includeDrafts: input.includeDrafts, ...(input.recheck ? { recheck: async (shot) => { const checked = await monitorImage({ imageUrl: shot.imageUrl, character: snapshot.project.characters[0], rules: snapshot.rules, deadline }); if (checked.error) throw new HttpError("Evaluation incomplete: a monitor request failed; no success metrics returned", 503); return checked.checks; } } : {}) });
    return Response.json({ projectId: input.projectId, ...result, engineMode: live ? "live" : "cached", provenance: input.recheck ? "live_recheck" : "stored_checks" }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
