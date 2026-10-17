import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { HttpError } from "./engine-http";
const cookieName = "scripty_access";
function digest(value: string) { return createHash("sha256").update(value).digest(); }
export function matchesAccessCode(value: string): boolean {
  const expected = process.env.SCRIPTY_ACCESS_CODE;
  return Boolean(expected && value && timingSafeEqual(digest(expected), digest(value)));
}
function signature(payload: string) {
  const secret = process.env.CANON_SESSION_SECRET;
  const code = process.env.SCRIPTY_ACCESS_CODE;
  if (!secret || !code) throw new HttpError("Live access is not configured. Explore the sample production.", 503);
  return createHmac("sha256", secret).update(`paid-access:${digest(code).toString("hex")}:${payload}`).digest("hex");
}
export function accessCookie() {
  const payload = String(Date.now() + 24 * 3600000);
  return `${cookieName}=${payload}.${signature(payload)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
export function hasPaidAccess(request: Request): boolean {
  if (process.env.CANON_PUBLIC_GENERATION_ENABLED !== "true") return false;
  const operator = process.env.CANON_ADMIN_TOKEN;
  if (operator && timingSafeEqual(digest(request.headers.get("x-canon-admin-token") ?? ""), digest(operator))) return true;
  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ") && matchesAccessCode(bearer.slice(7))) return true;
  const raw = request.headers.get("cookie")?.split(";").map(v => v.trim()).find(v => v.startsWith(cookieName + "="))?.slice(cookieName.length + 1);
  if (!raw || raw.length > 150) return false;
  const [payload, sig] = raw.split(".");
  if (!/^\d{13}$/.test(payload ?? "") || Number(payload) < Date.now() || !/^[a-f0-9]{64}$/.test(sig ?? "")) return false;
  try { return timingSafeEqual(Buffer.from(sig), Buffer.from(signature(payload))); } catch { return false; }
}
export function requirePaidAccess(request: Request): void {
  if (!hasPaidAccess(request)) throw new HttpError("Enter the production access code to use live generation and checks. You can explore Mara without it.", 401);
}
