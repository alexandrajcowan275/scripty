import { getShot } from "@/lib/db";
import { workspaceEvidence } from "@/lib/workspace";
import { productionOwner } from "@/lib/productions";
import { hasPaidAccess } from "@/lib/access";
import { ownedProduction, productionCharacter } from "@/lib/productions";
import { getProject } from "@/lib/db";
import { cachedProject, cacheMetadata } from "@/lib/engine-cache";
import {
  apiError,
  HttpError,
  liveMode,
  projectIdSchema,
} from "@/lib/engine-http";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const id = projectIdSchema.parse((await context.params).id);
    const production =
      id !== "mara" ? await ownedProduction(request, id) : null;
    if (production || liveMode(request)) {
      const data = await getProject(id);
      if (!data) throw new HttpError("Project not found", 404);
      if (production && data.project.characters[0])
        data.project.characters[0] = productionCharacter(
          data.project.characters[0],
          production,
        );
      return Response.json(
        {
          ...data,
          ...(production ? await workspaceEvidence(id, production.ownerHash) : {}),
          ...(production
            ? {
                scenePrompts: production.scene_prompts,
                generationEnabled:
                  hasPaidAccess(request),
              }
            : {}),
          mode: "live",
          provenance: "supabase",
        },
        { headers: { "Cache-Control": "no-store", "x-canon-mode": "live" } },
      );
    }
    const cached = await cachedProject(request, id);
    if (!cached) throw new HttpError("Project not found", 404);
    let evidence = {};
    try {
      const found = await workspaceEvidence(id, productionOwner(request).hash);
      evidence = { ...found, repairShots: (await Promise.all(found.repairs.map(row => getShot(row.shot_id)))).filter(Boolean) };
    } catch { /* Free sample still works without database/owner session. */ }
    return Response.json(
      {
        ...cached.data,
        ...evidence,
        generationEnabled: hasPaidAccess(request),
        ...cacheMetadata,
        recordedRuleIds: cached.recordedRuleIds,
        ...(cached.cache
          ? {}
          : {
              cacheAvailable: false,
              provenance: "cache_unavailable",
              warning:
                "Sample shots are unavailable. Please try again.",
            }),
      },
      { headers: { "Cache-Control": "no-store", "x-canon-mode": "cached" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
