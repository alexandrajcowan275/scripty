import { z } from "zod";
import { serverDatabase } from "@/lib/db";
import { apiError, body, HttpError, projectIdSchema } from "@/lib/engine-http";
import { cachedProject } from "@/lib/engine-cache";
import { humanSubmissions, latestHumanLabels } from "@/lib/human-eval";
import { checkOrigin, productionOwner } from "@/lib/productions";
import { workspace } from "@/lib/workspace";
export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const id = projectIdSchema.parse((await context.params).id);
    const owner = productionOwner(request, true);
    const data = id === "mara" ? (await cachedProject(request, id, true))?.data : await workspace(request, id);
    if (!data) throw new HttpError("Production not found", 404);
    const labels = latestHumanLabels(await humanSubmissions(id, owner.hash));
    // Blind cards deliberately contain no model verdict, confidence or drift flag.
    const questions = data.shots.flatMap(shot => shot.checks.map(check => ({ shotId: shot.id, attributeKey: check.key, expected: check.expected, imageUrl: shot.imageUrl, referenceImageUrl: data.project.characters[0].referenceImageUrl })));
    return Response.json({ questions, labels: labels.map(row => ({ shotId: row.shot_id, attributeKey: row.attribute_key, pass: row.true_pass, note: row.note, createdAt: row.created_at })) }, { headers: { "Cache-Control": "no-store", ...(owner.cookie ? { "Set-Cookie": owner.cookie } : {}) } });
  } catch (error) { return apiError(error); }
}
export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    checkOrigin(request);
    const id = projectIdSchema.parse((await context.params).id);
    const input = await body(request, z.strictObject({ shotId: z.string().min(1).max(200), attributeKey: z.string().min(1).max(200), pass: z.boolean().nullable(), note: z.string().trim().max(400).default("") }));
    const data = await workspace(request, id);
    const shot = data.effectiveShots.find(shot => shot.id === input.shotId);
    const check = shot?.checks.find(check => check.key === input.attributeKey);
    if (!shot || !check) throw new HttpError("Choose a valid shot and attribute", 404);
    const { data: saved, error } = await serverDatabase().from("human_labels").insert({ project_id: id, shot_id: shot.id, attribute_key: input.attributeKey, owner_hash: data.ownerHash, true_pass: input.pass, prediction: check, note: input.note }).select("id,created_at").single();
    if (error) throw new Error("Human label could not be saved");
    return Response.json({ saved: true, ...saved, labelSource: "human_blind" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) { return apiError(error); }
}
