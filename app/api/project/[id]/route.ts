import { getProject } from "@/lib/db";
import { cachedProject, cacheMetadata } from "@/lib/engine-cache";
import { apiError, HttpError, liveMode, projectIdSchema } from "@/lib/engine-http";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = projectIdSchema.parse((await context.params).id);
    if (liveMode(request)) { const data = await getProject(id); if (!data) throw new HttpError("Project not found", 404); return Response.json({ ...data, mode: "live", provenance: "supabase" }, { headers: { "Cache-Control": "no-store", "x-canon-mode": "live" } }); }
    const cached = await cachedProject(request, id); if (!cached) throw new HttpError("Project not found", 404);
    return Response.json({ ...cached.data, ...cacheMetadata, ...(cached.cache ? {} : { provenance: "cache_unavailable", warning: "No recorded batches are installed. Capture real engine batches to enable generation replay." }) }, { headers: { "Cache-Control": "no-store", "x-canon-mode": "cached" } });
  } catch (error) { return apiError(error); }
}
