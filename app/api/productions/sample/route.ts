import {
  cachedProject,
  cacheMetadata,
  sessionCookie,
} from "@/lib/engine-cache";
import { apiError, HttpError } from "@/lib/engine-http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const sample = await cachedProject(request, "mara", true);
    if (!sample?.cache?.batches.length)
      throw new HttpError("Sample production unavailable", 503);
    return Response.json(
      {
        ...sample.data,
        ...cacheMetadata,
        recordedRuleIds: sample.recordedRuleIds,
      },
      {
        headers: {
          "Set-Cookie": sessionCookie(sample.state),
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
