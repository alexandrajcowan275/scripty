import { hasPaidAccess } from "@/lib/access";
import {
  ownedProduction,
  checkOrigin,
  productionCharacter,
  productionOwner,
} from "@/lib/productions";
import { z } from "zod";
import seed from "@/seed/mara.json";
import {
  getShot,
  serverDatabase,
  getProject,
  updateShotReview,
  addLearnedRule,
  addTrace,
} from "@/lib/db";
import { emptyUsage } from "@/lib/engine-ai";
import { learnRule, localRejectionRule } from "@/lib/rules";
import {
  cachedProject,
  cacheMetadata,
  sessionCookie,
} from "@/lib/engine-cache";
import { apiError, body, HttpError, liveMode } from "@/lib/engine-http";
export const maxDuration = 300;
const requestSchema = z
  .strictObject({
    decision: z.enum(["accept", "reject"]),
    reason: z.string().trim().max(400).optional(),
    projectId: z.string().max(100).optional(),
  })
  .refine(
    (input) => input.decision !== "reject" || Boolean(input.reason),
    "A rejection reason is required to learn a correction",
  );
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    checkOrigin(request);
    const { id } = await context.params;
    if (!id || id.length > 200) throw new HttpError("Invalid shot ID");
    const input = await body(request, requestSchema);
    const production =
      input.projectId && input.projectId !== "mara"
        ? await ownedProduction(request, input.projectId)
        : null;
    if (production) checkOrigin(request);
    if (!production && !liveMode(request)) {
      const cached = await cachedProject(request, seed.project.id);
      if (!cached) throw new HttpError("Project not found", 404);
      let original = cached.data.shots.find((shot) => shot.id === id);
      let ownedRepair = false;
      if (!original) {
        const owner = productionOwner(request);
        const lineage = await serverDatabase().from("shot_repairs").select("shot_id").eq("shot_id", id).eq("project_id", "mara").eq("owner_hash", owner.hash).maybeSingle();
        if (!lineage.error && lineage.data) { original = await getShot(id) ?? undefined; ownedRepair = true; }
      }
      if (!original)
        throw new HttpError("Shot not found in this browser session", 404);
      const shot = {
        ...original,
        status: input.decision === "accept" ? "accepted" : "rejected",
        rejectReason: input.decision === "reject" ? input.reason : undefined,
      };
      const learned =
        input.decision === "reject"
          ? hasPaidAccess(request)
            ? await learnRule(original, cached.data.project.characters[0], input.reason!, cached.data.rules)
            : { ...localRejectionRule(original, cached.data.project.characters[0], input.reason!, cached.state.rules), provenance: "cached_local_rule", usage: emptyUsage(), error: undefined }
          : undefined;
      if (ownedRepair) await updateShotReview(id, input.decision, input.reason);
      cached.state.reviews = [
        ...cached.state.reviews.filter((review) => review.id !== id),
        { id, ...input },
      ];
      if (learned)
        cached.state.rules = [
          ...cached.state.rules.filter((rule) => rule.id !== learned.rule.id),
          learned.rule,
        ];
      return Response.json(
        {
          shot,
          ...(learned ? { newRule: learned.rule, merged: learned.merged } : {}),
          ...cacheMetadata,
          provenance: learned?.provenance ?? "cached_review",
          ...(learned ? { usage: learned.usage, ...(learned.error ? { warning: "AI extraction was unavailable. Your exact note was saved locally." } : {}) } : {}),
        },
        {
          headers: {
            "Set-Cookie": sessionCookie(cached.state),
            "Cache-Control": "no-store",
            "x-canon-mode": "cached",
          },
        },
      );
    }
    const original = await getShot(id);
    if (production && original?.projectId !== input.projectId)
      throw new HttpError("Shot not found in this production", 404);
    if (!original) throw new HttpError("Shot not found", 404);
    const snapshot = await getProject(original.projectId);
    if (!snapshot) throw new HttpError("Project not found", 404);
    const shot = await updateShotReview(id, input.decision, input.reason);
    if (input.decision === "accept")
      return Response.json({
        shot,
        mode: "live",
        provenance: "supabase_review",
      });
    const learningCharacter = production
      ? productionCharacter(snapshot.project.characters[0], production)
      : snapshot.project.characters[0];
    const learned =
      !hasPaidAccess(request)
        ? {
            ...localRejectionRule(
              shot,
              learningCharacter,
              input.reason!,
              snapshot.rules,
            ),
            usage: emptyUsage(),
            provenance: "creator_rule",
            error: undefined,
          }
        : await learnRule(
            shot,
            production
              ? productionCharacter(snapshot.project.characters[0], production)
              : snapshot.project.characters[0],
            input.reason!,
            snapshot.rules,
          );
    const savedRule = await addLearnedRule(learned.rule);
    learned.merged = learned.merged || savedRule.id !== learned.rule.id;
    learned.rule = savedRule;
    await addTrace({
      id: crypto.randomUUID(),
      projectId: shot.projectId,
      shotId: id,
      type: "rule_learned",
      message: `${learned.merged ? "Merged" : "Learned"}: ${learned.rule.text}; provenance=${learned.provenance}`,
      createdAt: new Date().toISOString(),
    });
    if (learned.error)
      await addTrace({
        id: crypto.randomUUID(),
        projectId: shot.projectId,
        shotId: id,
        type: "error",
        category: "api_error",
        message: `Rule extraction unavailable: ${learned.error}; used explicit local correction fallback`,
        createdAt: new Date().toISOString(),
      });
    return Response.json({
      shot,
      newRule: learned.rule,
      merged: learned.merged,
      mode: "live",
      provenance: learned.provenance,
      usage: learned.usage,
      ...(learned.error
        ? {
            warning:
              "AI rule extraction was unavailable. A local correction was saved; see the trace.",
          }
        : {}),
    });
  } catch (error) {
    return apiError(error);
  }
}
