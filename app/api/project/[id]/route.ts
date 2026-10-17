import { getMockProject, mockProject } from "@/lib/mock-data";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (id !== mockProject.id) return Response.json({ error: "Project not found" }, { status: 404 });
  return Response.json(getMockProject());
}
