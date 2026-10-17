import { evaluationShots } from "@/lib/blind-study";
import { z } from "zod";
import { apiError, body, HttpError, projectIdSchema } from "@/lib/engine-http";
import { cachedProject } from "@/lib/engine-cache";
import { evaluateHumanLabels, humanSubmissions } from "@/lib/human-eval";
import { checkOrigin, productionOwner } from "@/lib/productions";
import { workspace } from "@/lib/workspace";
export const maxDuration = 300;
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = await body(request, z.strictObject({ projectId: projectIdSchema, recheck: z.boolean().optional(), includeDrafts: z.boolean().optional() }));
    if (input.includeDrafts) throw new HttpError("Public evaluation uses human labels only. Agent drafts are never ground truth.", 400);
    if (input.recheck) throw new HttpError("Use the explicit memory re-check endpoint; evaluation itself never spends API budget.", 409);
    const owner = productionOwner(request, true);
    const data = input.projectId === "mara" ? (await cachedProject(request, input.projectId, true))?.data : await workspace(request, input.projectId);
    if (!data) throw new HttpError("Production not found", 404);
    const labels = await humanSubmissions(input.projectId, owner.hash);
    const result = await evaluateHumanLabels(evaluationShots(input.projectId, data.shots), labels);
    return Response.json({ projectId: input.projectId, ...result }, { headers: { "Cache-Control": "no-store", ...(owner.cookie ? { "Set-Cookie": owner.cookie } : {}) } });
  } catch (error) { return apiError(error); }
}
