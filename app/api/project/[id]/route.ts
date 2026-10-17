import { ownedProduction } from "@/lib/productions";
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
      return Response.json(
        {
          ...data,
          ...(production ? { scenePrompts: production.scene_prompts } : {}),
          mode: "live",
          provenance: "supabase",
        },
        { headers: { "Cache-Control": "no-store", "x-canon-mode": "live" } },
      );
    }
    const cached = await cachedProject(request, id);
    if (!cached) throw new HttpError("Project not found", 404);
    return Response.json(
      {
        ...cached.data,
        ...cacheMetadata,
        recordedRuleIds: cached.recordedRuleIds,
        ...(cached.cache
          ? {}
          : {
              cacheAvailable: false,
              provenance: "cache_unavailable",
              warning:
                "No recorded batches are installed. Capture real engine batches to enable generation replay.",
            }),
      },
      { headers: { "Cache-Control": "no-store", "x-canon-mode": "cached" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
