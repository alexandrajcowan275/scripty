import { mockProject } from "@/lib/mock-data";

export async function POST(request: Request) {
  let body;
  try { body = await request.json(); }
  catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body.projectId !== "string") {
    return Response.json({ error: "projectId is required" }, { status: 400 });
  }
  if (body.projectId !== mockProject.id) return Response.json({ error: "Project not found" }, { status: 404 });
  return Response.json({
    projectId: mockProject.id, mode: "mock", precision: null, recall: null, f1: null, evaluatedChecks: 0,
    message: "Evaluation is not implemented. TASK 3 will add hand labels and measured metrics; null means not evaluated.",
  });
}
