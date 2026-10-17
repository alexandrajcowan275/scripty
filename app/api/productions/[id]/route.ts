import { z } from "zod";
import {
  ownedProduction,
  checkOrigin,
  readReferenceTicket,
} from "@/lib/productions";
import { apiError, body, HttpError } from "@/lib/engine-http";
import { serverDatabase } from "@/lib/db";
const canon = z
  .array(
    z.object({
      key: z
        .string()
        .min(1)
        .max(200)
        .regex(/^[a-zA-Z0-9_-]+$/),
      label: z.string().min(1).max(200),
      expected: z.string().trim().min(1).max(200),
      weight: z.number().finite().min(0.1).max(5),
    }),
  )
  .min(1)
  .max(12)
  .refine(
    (attrs) => new Set(attrs.map((attr) => attr.key)).size === attrs.length,
  );
const inputSchema = z.union([
  z.strictObject({
    scenePrompts: z.array(z.string().trim().min(1).max(2000)).min(1).max(6),
  }),
  z.strictObject({
    character: z.strictObject({
      name: z.string().trim().min(1).max(80),
      attributes: canon,
      referenceTicket: z.string().max(2000).optional(),
    }),
  }),
]);
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    const owned = await ownedProduction(request, id);
    const input = await body(request, inputSchema);
    if ("character" in input) {
      const referencePath = input.character.referenceTicket
        ? readReferenceTicket(input.character.referenceTicket, owned.ownerHash)
            .path
        : owned.reference_path;
      const { data, error } = await serverDatabase().rpc(
        "save_production_character",
        {
          p_project_id: id,
          p_owner_hash: owned.ownerHash,
          p_name: input.character.name,
          p_reference_path: referencePath,
          p_attributes: input.character.attributes,
        },
      );
      if (error || !data)
        throw new HttpError("Couldn't save those changes. Try again.", 503);
    } else {
      const { error } = await serverDatabase()
        .from("production_settings")
        .update({ scene_prompts: input.scenePrompts })
        .eq("project_id", id)
        .eq("owner_hash", owned.ownerHash);
      if (error) throw new Error("Scenes could not be saved");
    }
    return Response.json(
      { saved: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return apiError(error);
  }
}
