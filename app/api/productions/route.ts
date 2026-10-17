import { apiError, HttpError } from "@/lib/engine-http";
import {
  requireGenerationCapacity,
  readReferenceTicket,
  productionInput,
  productionOwner,
  checkOrigin,
  claimCreation,
  rasterType,
  uploadReference,
  referenceLimitMessage,
} from "@/lib/productions";
import { serverDatabase, getApiBudget } from "@/lib/db";
import { generateImage } from "@/lib/generate";
export const dynamic = "force-dynamic";
export const maxDuration = 180;
export async function GET(request: Request) {
  try {
    const owner = productionOwner(request);
    const { data, error } = await serverDatabase()
      .from("production_settings")
      .select("project_id,created_at,projects(name)")
      .eq("owner_hash", owner.hash)
      .order("created_at", { ascending: false })
      .limit(12);
    if (error) throw error;
    return Response.json(
      { productions: data },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 404)
      return Response.json({ productions: [] });
    return apiError(error);
  }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    if (Number(request.headers.get("content-length")) > 4.4 * 1024 * 1024)
      throw new HttpError("Choose an image under 4 MB.", 413);
    const form = await request.formData();
    let parsed: unknown;
    try {
      parsed = JSON.parse(String(form.get("production")));
    } catch {
      throw new HttpError("Check your production details.");
    }
    const input = productionInput.parse(parsed);
    const file = form.get("reference");
    let bytes: Uint8Array | undefined;
    let mime: string | undefined;
    if (file instanceof File && file.size) {
      if (file.size > 4 * 1024 * 1024)
        throw new HttpError("Choose an image under 4 MB.", 413);
      bytes = new Uint8Array(await file.arrayBuffer());
      mime = rasterType(bytes) ?? undefined;
      if (!mime) throw new HttpError("Choose a PNG, JPEG or WebP reference.");
    }
    const ticket = String(form.get("referenceTicket") ?? "");
    if (!bytes && !ticket && !input.description)
      throw new HttpError("Upload a reference or describe your character.");
    const owner = productionOwner(request, true);
    await claimCreation(request, owner.hash);
    let id = crypto.randomUUID();
    let referencePath: string;
    if (ticket) {
      const saved = readReferenceTicket(ticket, owner.hash);
      id = saved.id;
      referencePath = saved.path;
    } else if (bytes && mime)
      referencePath = await uploadReference(bytes, id, mime);
    else {
      requireGenerationCapacity(false, request);
      const budget = await getApiBudget();
      if (budget.remainingUsd < 1.5)
        throw new HttpError(referenceLimitMessage, 429);
      let uploadedPath = "";
      const generated = await generateImage(
        {
          finalPrompt: `Create one cinematic character reference portrait of ${input.characterName}. ${input.description}. Canon: ${input.attributes.join("; ")}. Neutral simple background, natural controlled light, 35mm film still. Keep anatomical LEFT and RIGHT explicit.`,
          fallbackImageUrl: "",
          filename: "reference.png",
        },
        {
          upload: async (buffer, _name, type) => {
            uploadedPath = await uploadReference(buffer, id, type);
            return `/api/productions/${id}/reference`;
          },
        },
      );
      if (!uploadedPath || generated.provenance === "cached_fallback")
        throw new HttpError(
          "The reference could not be generated. Try uploading an image, or explore Mara.",
          503,
        );
      referencePath = uploadedPath;
    }
    const project = {
      id,
      name: input.name,
      characters: [
        {
          id: crypto.randomUUID(),
          name: input.characterName,
          referenceImageUrl: `/api/productions/${id}/reference`,
          attributes: input.attributes.map((expected, index) => ({
            key: `canon_${index + 1}`,
            label: `Canon ${index + 1}`,
            expected,
            weight: 1,
          })),
        },
      ],
    };
    const { error } = await serverDatabase().rpc("create_production", {
      p_project: project,
      p_owner_hash: owner.hash,
      p_scenes: input.scenePrompts,
      p_reference_path: referencePath,
    });
    if (error) throw new Error("Production could not be saved");
    return Response.json(
      { project },
      {
        status: 201,
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
