import { readFile } from "node:fs/promises";
import path from "node:path";
export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(filename)) return new Response("Not found", { status: 404 });
  try {
    const bytes = await readFile(path.join(process.cwd(), "seed/cache/images", filename));
    return new Response(bytes, { headers: { "Content-Type": filename.endsWith(".png") ? "image/png" : filename.endsWith(".webp") ? "image/webp" : "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" } });
  } catch { return new Response("Not found", { status: 404 }); }
}
