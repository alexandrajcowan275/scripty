import { z } from "zod";
export class HttpError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function liveMode(request: Request): boolean {
  if (request.headers.get("x-canon-mode") === "cached") return false;
  if (process.env.DEMO_MODE !== "live") return false;
  const token = process.env.CANON_ADMIN_TOKEN;
  if (token && request.headers.get("x-canon-admin-token") !== token) {
    if (request.headers.get("x-canon-mode") === "live") throw new HttpError("Live generation requires the configured admin token", 401);
    return false;
  }
  return true;
}
export async function body<T>(request: Request, schema: z.ZodType<T>): Promise<T> {
  if (Number(request.headers.get("content-length")) > 30000) throw new HttpError("Request body too large", 413);
  const text = await request.text(); if (text.length > 30000) throw new HttpError("Request body too large", 413);
  let value: unknown; try { value = JSON.parse(text); } catch { throw new HttpError("Invalid JSON"); }
  return schema.parse(value);
}
export function apiError(error: unknown): Response {
  if (error instanceof HttpError) return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof z.ZodError) return Response.json({ error: "Invalid request", details: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) }, { status: 400 });
  console.error("Canon request failed", error instanceof Error ? error.message : "unknown error");
  return Response.json({ error: "The request could not be completed. Check server configuration or try the cached demo." }, { status: 503 });
}
export const projectIdSchema = z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_-]+$/);
export async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length); let cursor = 0;
  const workers = await Promise.allSettled(Array.from({ length: Math.min(limit, items.length) }, async () => { while (cursor < items.length) { const index = cursor++; results[index] = await fn(items[index], index); } }));
  const failed = workers.find((worker) => worker.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
  return results;
}
