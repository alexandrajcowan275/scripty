import { evaluationShots } from "@/lib/blind-study";
import { z } from "zod";
import { apiError, body, HttpError, projectIdSchema } from "@/lib/engine-http";
import { cachedProject } from "@/lib/engine-cache";
import { evaluateHumanLabels, humanSubmissions } from "@/lib/human-eval";
import { checkOrigin, productionOwner } from "@/lib/productions";
import { workspace } from "@/lib/workspace";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
async function evaluation(request:Request, projectId:string) {
 const owner=productionOwner(request,true);
 const data=projectId==='mara'?(await cachedProject(request,projectId,true))?.data:await workspace(request,projectId);
 if(!data)throw new HttpError('Production not found',404);
 const labels=await humanSubmissions(projectId,owner.hash);
 const result=await evaluateHumanLabels(evaluationShots(projectId,data.shots),labels);
 return Response.json({projectId,...result},{headers:{'Cache-Control':'no-store',...(owner.cookie?{'Set-Cookie':owner.cookie}:{})}});
}
/** Read-only alias: no model calls, rechecks, label writes or shared metrics. */
export async function GET(request:Request) {
 try {
  const input=z.strictObject({projectId:projectIdSchema}).parse(Object.fromEntries(new URL(request.url).searchParams));
  return await evaluation(request,input.projectId);
 }catch(error){return apiError(error);}
}
export async function POST(request:Request) {
 try {
  checkOrigin(request);
  const input=await body(request,z.strictObject({projectId:projectIdSchema,recheck:z.boolean().optional(),includeDrafts:z.boolean().optional()}));
  if(input.includeDrafts)throw new HttpError('Public evaluation uses human labels only. Agent drafts are never ground truth.',400);
  if(input.recheck)throw new HttpError('Use the explicit memory re-check endpoint; evaluation itself never spends API budget.',409);
  return await evaluation(request,input.projectId);
 }catch(error){return apiError(error);}
}
