import { z } from "zod";
import { apiError, body, HttpError } from "@/lib/engine-http";
import {
  requireGenerationCapacity,
  productionOwner,
  checkOrigin,
  claimCreation,
  uploadReference,
  referenceTicket,
  readReferenceTicket,
  downloadReferencePath,
  referenceLimitMessage,
} from "@/lib/productions";
import { getApiBudget } from "@/lib/db";
import { generateImage } from "@/lib/generate";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    requireGenerationCapacity(false, request);
    const input = await body(
      request,
      z.object({
        name: z.string().trim().min(1).max(80),
        description: z.string().trim().min(8).max(1200),
      }),
    );
    const owner = productionOwner(request, true);
    const budget = await getApiBudget();
    if (budget.remainingUsd < 1.5)
      throw new HttpError(referenceLimitMessage, 429);
    await claimCreation(request, owner.hash);
    const id = crypto.randomUUID();
    let path = "";
    const generated = await generateImage(
      {
        finalPrompt: `Create one professional cinematic character reference portrait. Name: ${input.name}. ${input.description}. Neutral background, controlled natural light, realistic film still, 35mm lens.`,
        fallbackImageUrl: "",
        filename: "reference.png",
      },
      {
        upload: async (bytes, _filename, mime) => {
          path = await uploadReference(bytes, id, mime);
          return `/api/productions/${id}/reference`;
        },
      },
    );
    if (!path || generated.provenance === "cached_fallback")
      throw new HttpError(
        "The reference could not be generated. Your description is safe; try again or upload an image.",
        503,
      );
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
export async function GET(request: Request) {
  try {
    const owner = productionOwner(request);
    const ticket = new URL(request.url).searchParams.get("ticket") ?? "";
    const { path } = readReferenceTicket(ticket, owner.hash);
    const image = await downloadReferencePath(path);
    return new Response(image, {
      headers: {
        "Content-Type": image.type,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return apiError(error);
  }
}
