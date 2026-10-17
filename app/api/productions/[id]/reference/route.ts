import { ownedProduction, privateReference } from "@/lib/productions";
import { apiError } from "@/lib/engine-http";
export const dynamic = "force-dynamic";
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    await ownedProduction(request, id);
    const blob = await privateReference(id);
    return new Response(blob, {
      headers: {
        "Content-Type": blob.type,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
