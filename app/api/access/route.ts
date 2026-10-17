import { z } from "zod";
import { accessCookie, hasPaidAccess, matchesAccessCode } from "@/lib/access";
import { apiError, body, HttpError } from "@/lib/engine-http";
import { checkOrigin, claimCreation, productionOwner } from "@/lib/productions";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return Response.json({ authorized: hasPaidAccess(request), configured: Boolean(process.env.SCRIPTY_ACCESS_CODE) }, { headers: { "Cache-Control": "no-store" } });
}
export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const { code } = await body(request, z.strictObject({ code: z.string().min(1).max(200) }));
    const owner = productionOwner(request, true);
    await claimCreation(request, owner.hash, "access");
    if (!matchesAccessCode(code)) throw new HttpError("That access code didn't match.", 401);
    const headers = new Headers({ "Cache-Control": "no-store" });
    headers.append("Set-Cookie", accessCookie());
    if (owner.cookie) headers.append("Set-Cookie", owner.cookie);
    return Response.json({ authorized: true }, { headers });
  } catch (error) { return apiError(error); }
}
