import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";
import { serverDatabase, attributeSchema } from "./db";
import type { Character } from "./types";
import { HttpError } from "./engine-http";
const ownerCookieName = "scripty_owner";
function signature(value: string) {
  const key = process.env.CANON_SESSION_SECRET;
  if (!key) throw new Error("Production session is unavailable");
  return createHmac("sha256", key).update(`production:${value}`).digest("hex");
}
export function productionOwner(request: Request, create = false) {
  const raw = request.headers
    .get("cookie")
    ?.split(";")
    .map((s) => s.trim())
    .find((s) => s.startsWith(ownerCookieName + "="))
    ?.slice(ownerCookieName.length + 1);
  if (raw) {
    const [token, sig] = raw.split(".");
    if (
      /^[a-f0-9]{64}$/.test(token ?? "") &&
      /^[a-f0-9]{64}$/.test(sig ?? "")
    ) {
      const expected = signature(token);
      if (timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
        return {
          token,
          hash: createHash("sha256").update(token).digest("hex"),
          cookie: undefined,
        };
    }
  }
  if (!create)
    throw new HttpError(
      "Open this production in the browser where you created it.",
      404,
    );
  const token = randomBytes(32).toString("hex");
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
    cookie: `${ownerCookieName}=${token}.${signature(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000${process.env.NODE_ENV === "production" ? "; Secure" : ""}`,
  };
}
export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const url = new URL(request.url);
  const host = request.headers.get("host") ?? url.host;
  if (origin && new URL(origin).host !== host) {
    throw new HttpError("Please open Scripty directly to continue.", 403);
  }
}
/** Public paid calls stay off until explicitly enabled by the operator. */
export function requireGenerationCapacity(productionSaved = false) {
  if (process.env.CANON_PUBLIC_GENERATION_ENABLED !== "true")
    throw new HttpError(
      productionSaved ? generationLimitMessage : referenceLimitMessage,
      429,
    );
}
export const productionInput = z.object({
  name: z.string().trim().min(1).max(100),
  characterName: z.string().trim().min(1).max(80),
  description: z.string().trim().max(1200).default(""),
  attributes: z.array(z.string().trim().min(1).max(200)).min(1).max(12),
  scenePrompts: z.array(z.string().trim().min(1).max(2000)).length(6),
});
export function rasterType(
  bytes: Uint8Array,
): "image/png" | "image/jpeg" | "image/webp" | null {
  if (bytes.length < 12) return null;
  if (
    Buffer.from(bytes.subarray(0, 8)).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    )
  )
    return "image/png";
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
    return "image/jpeg";
  if (
    Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" &&
    Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP"
  )
    return "image/webp";
  return null;
}
export async function ownedProduction(request: Request, id: string) {
  const owner = productionOwner(request);
  if (!z.uuid().safeParse(id).success)
    throw new HttpError("Production not found", 404);
  const { data, error } = await serverDatabase()
    .from("production_settings")
    .select(
      "project_id,scene_prompts,reference_path,generation_count,character_version_id,current_character:production_character_versions(name,reference_path,attributes)",
    )
    .eq("project_id", id)
    .eq("owner_hash", owner.hash)
    .maybeSingle();
  if (error) throw new Error("Could not open production");
  if (!data) throw new HttpError("Production not found in this browser", 404);
  return { ...data, ownerHash: owner.hash };
}
export async function privateReference(id: string, versionId?: string) {
  let path: string;
  if (versionId) {
    z.uuid().parse(versionId);
    const { data, error } = await serverDatabase()
      .from("production_character_versions")
      .select("reference_path")
      .eq("id", versionId)
      .eq("project_id", id)
      .single();
    if (error || !data) throw new Error("Character reference unavailable");
    path = data.reference_path;
  } else {
    const { data, error } = await serverDatabase()
      .from("production_settings")
      .select("reference_path")
      .eq("project_id", id)
      .single();
    if (error || !data) throw new Error("Character reference unavailable");
    path = data.reference_path;
  }
  return downloadReferencePath(path);
}
export async function uploadReference(
  bytes: Uint8Array,
  id: string,
  mime: string,
) {
  if (bytes.length > 4 * 1024 * 1024 || !rasterType(bytes))
    throw new HttpError("Choose a PNG, JPEG or WebP under 4 MB.");
  const path = `${id}/reference.${mime === "image/png" ? "png" : mime === "image/jpeg" ? "jpg" : "webp"}`;
  const { error } = await serverDatabase()
    .storage.from("references")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (error) throw new Error("Reference upload could not finish");
  return path;
}
export async function claimCreation(
  request: Request,
  ownerHash: string,
  kind = "create",
) {
  const hour = new Date().toISOString().slice(0, 13);
  const ip =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "local";
  for (const value of [
    ownerHash,
    createHmac("sha256", process.env.CANON_SESSION_SECRET!)
      .update(ip)
      .digest("hex"),
  ]) {
    const { data, error } = await serverDatabase().rpc(
      "claim_production_slot",
      { p_bucket: `${kind}:${hour}:${value}` },
    );
    if (error || !data)
      throw new HttpError(
        "The set is busy. Try again later, or explore Mara while we make room.",
        429,
      );
  }
}
export const generationLimitMessage =
  "Generation is taking a breather. Your production is saved. Explore Mara while more capacity becomes available.";

export function referenceTicket(input: {
  id: string;
  path: string;
  ownerHash: string;
}) {
  const payload = Buffer.from(
    JSON.stringify({ ...input, expires: Date.now() + 3600000 }),
  ).toString("base64url");
  return `${payload}.${signature(`reference:${payload}`)}`;
}
export function readReferenceTicket(
  ticket: string,
  ownerHash: string,
): { id: string; path: string } {
  if (ticket.length > 2000)
    throw new HttpError("Please generate your reference again.");
  const [payload, sig] = ticket.split(".");
  const expected = signature(`reference:${payload}`);
  if (
    !sig ||
    sig.length !== expected.length ||
    !timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  )
    throw new HttpError("Reference is no longer available.");
  let value;
  try {
    value = JSON.parse(Buffer.from(payload, "base64url").toString());
  } catch {
    throw new HttpError("Reference is no longer available.");
  }
  if (
    value.ownerHash !== ownerHash ||
    value.expires < Date.now() ||
    !z.uuid().safeParse(value.id).success ||
    !String(value.path).startsWith(value.id + "/")
  )
    throw new HttpError("Please generate your reference again.");
  return { id: value.id, path: value.path };
}
export async function downloadReferencePath(path: string) {
  const { data, error } = await serverDatabase()
    .storage.from("references")
    .download(path);
  if (error || !data) throw new Error("Reference is unavailable");
  return data;
}

export const referenceLimitMessage =
  "Reference generation is taking a breather. Upload an image to keep going, or explore Mara.";

export function productionCharacter(
  base: Character,
  settings: { current_character?: unknown; character_version_id?: unknown },
): Character {
  const raw = Array.isArray(settings.current_character)
    ? settings.current_character[0]
    : settings.current_character;
  if (!raw) return base;
  const version = z
    .object({
      name: z.string().min(1).max(80),
      attributes: z.array(attributeSchema).min(1).max(12),
    })
    .parse(raw);
  return {
    ...base,
    name: version.name,
    attributes: version.attributes,
    referenceImageUrl:
      typeof settings.character_version_id === "string"
        ? `${base.referenceImageUrl.split("?")[0]}?v=${settings.character_version_id}`
        : base.referenceImageUrl,
  };
}
