import { apiError, HttpError } from "@/lib/engine-http";
import {
  productionOwner,
  checkOrigin,
  claimCreation,
  rasterType,
  uploadReference,
  referenceTicket,
} from "@/lib/productions";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (Number(request.headers.get("content-length")) > 4.4 * 1024 * 1024)
      throw new HttpError("Choose an image under 4 MB.", 413);
    const form = await request.formData();
    const file = form.get("reference");
    if (!(file instanceof File) || !file.size || file.size > 4 * 1024 * 1024)
      throw new HttpError("That image didn't load. Choose another.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = rasterType(bytes);
    if (!mime) throw new HttpError("That image didn't load. Choose another.");
    const owner = productionOwner(request, true);
    await claimCreation(request, owner.hash, "upload");
    const id = crypto.randomUUID();
    const path = await uploadReference(bytes, id, mime);
    const ticket = referenceTicket({ id, path, ownerHash: owner.hash });
    return Response.json(
      {
        ticket,
        imageUrl: `/api/productions/reference?ticket=${encodeURIComponent(ticket)}`,
      },
      {
        headers: {
          ...(owner.cookie ? { "Set-Cookie": owner.cookie } : {}),
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return apiError(error);
  }
}
