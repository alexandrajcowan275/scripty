import { createMockBatch } from "@/lib/mock-data";
import type { Rule, Shot } from "@/lib/types";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const original = createMockBatch().shots.find((shot) => shot.id === id);
  if (!original) return Response.json({ error: "Shot not found" }, { status: 404 });
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || !["accept", "reject"].includes(body.decision) ||
      (body.reason !== undefined && typeof body.reason !== "string")) {
    return Response.json({ error: "Expected decision accept or reject, with optional string reason" }, { status: 400 });
  }
  const shot: Shot = { ...original, status: body.decision === "accept" ? "accepted" : "rejected" };
  if (body.decision === "accept") return Response.json({ shot });
  shot.rejectReason = body.reason;
  const failedCheck = shot.checks.find((check) => !check.pass);
  const newRule: Rule = {
    id: `mock-rule-${id}`, projectId: shot.projectId,
    text: failedCheck ? `Keep ${failedCheck.key} consistent: ${failedCheck.expected}.` : "Preserve Mara’s character-sheet attributes in every shot.",
    attributeKey: failedCheck?.key, source: "rejection", createdAt: "2026-10-16T12:00:00.000Z", timesApplied: 0,
  };
  // Static illustrative response only; reason-to-rule learning and persistence are TASK 2/3.
  return Response.json({ shot, newRule });
}
