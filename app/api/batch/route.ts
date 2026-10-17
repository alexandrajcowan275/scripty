import { createMockBatch, mockProject } from "@/lib/mock-data";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body.projectId !== "string") {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }
  if (body.projectId !== mockProject.id) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }
  if (body.scenePrompts !== undefined && (!Array.isArray(body.scenePrompts) || body.scenePrompts.length !== 6 ||
      !body.scenePrompts.every((prompt: unknown) => typeof prompt === "string" && prompt.trim().length > 0))) {
    return Response.json({ error: "scenePrompts must contain exactly six nonempty strings" }, { status: 400 });
  }
  return Response.json(createMockBatch(body.scenePrompts));
}
