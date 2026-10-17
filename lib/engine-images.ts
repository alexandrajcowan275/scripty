import { readFile } from "node:fs/promises";
import path from "node:path";

export async function imageDataUrl(url: string): Promise<string> {
  if (url.startsWith("data:image/")) {
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(url) || url.length > 20 * 1024 * 1024) throw new Error("Unsupported reference image");
    return url;
  }
  let bytes: Uint8Array; let mime: string;
  if (url.startsWith("/")) {
    const cache = url.startsWith("/api/cache/images/");
    const root = path.join(process.cwd(), cache ? "seed/cache/images" : "public");
    const relative = cache ? url.slice("/api/cache/images/".length) : url.slice(1);
    const filename = path.resolve(root, relative);
    if (!filename.startsWith(root + path.sep)) throw new Error("Invalid image path");
    bytes = await readFile(filename);
    mime = filename.endsWith(".png") ? "image/png" : /\.jpe?g$/i.test(filename) ? "image/jpeg" : filename.endsWith(".webp") ? "image/webp" : "unsupported";
  } else {
    const parsed = new URL(url);
    const allowed = [process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SITE_URL].filter(Boolean).map((value) => new URL(value!).origin);
    if (parsed.protocol !== "https:" || !allowed.includes(parsed.origin)) throw new Error("Image URL must belong to configured project storage");
    const response = await fetch(url, { signal: AbortSignal.timeout(15000), redirect: "error", cache: "no-store" });
    if (!response.ok) throw new Error("Could not load reference image");
    if (Number(response.headers.get("content-length")) > 15 * 1024 * 1024) throw new Error("Reference image too large");
    bytes = new Uint8Array(await response.arrayBuffer()); mime = response.headers.get("content-type")?.split(";")[0] ?? "unsupported";
  }
  if (!["image/png", "image/jpeg", "image/webp"].includes(mime)) throw new Error("Reference must be PNG, JPEG or WebP; replace the seed SVG before live generation.");
  if (bytes.length > 15 * 1024 * 1024) throw new Error("Reference image too large");
  return `data:${mime};base64,${Buffer.from(bytes).toString("base64")}`;
}
