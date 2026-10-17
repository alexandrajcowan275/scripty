import { hasPaidAccess } from "@/lib/access";
import { serverDatabase, getApiBudget } from "@/lib/db";
import { imageConfiguration, monitorConfiguration, IMAGE_ATTEMPT_RESERVATION, MONITOR_ATTEMPT_RESERVATION } from "@/lib/engine-config";
import { apiError } from "@/lib/engine-http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  try {
    const image = imageConfiguration(), monitor = monitorConfiguration();
    const authorized = hasPaidAccess(request);
    let observedImageCostUsd: number | null = null, measuredImages = 0;
    if (authorized) {
      const { data } = await serverDatabase().from("api_attempts").select("cost_usd").eq("model", image.model).not("settled_at", "is", null).limit(100);
      if (data?.length) { measuredImages = data.length; observedImageCostUsd = data.reduce((sum, row) => sum + Number(row.cost_usd), 0) / data.length; }
    }
    return Response.json({ authorized, imageModel: image.model, imageQuality: image.quality, monitorModel: monitor.model, monitorVersion: monitor.version, observedImageCostUsd, measuredImages, estimateSource: observedImageCostUsd === null ? null : "usage_derived_mean_not_invoice", reservationPerShotUsd: 2 * (IMAGE_ATTEMPT_RESERVATION + MONITOR_ATTEMPT_RESERVATION), ...(authorized ? { budget: await getApiBudget() } : {}) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
