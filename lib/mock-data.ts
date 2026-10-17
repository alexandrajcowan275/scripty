// TASK 0 fixtures only. No persistence, AI calls, or learned behavior.
import seed from "@/seed/mara.json";
import type { Batch, Project, Rule, Shot, TraceEvent } from "@/lib/types";

export const mockProject: Project = seed.project;
export const mockRules: Rule[] = seed.rules as Rule[];
const createdAt = "2026-10-16T12:00:00.000Z";

export function createMockBatch(scenePrompts: string[] = seed.scenePrompts): { batch: Batch; shots: Shot[] } {
  const character = mockProject.characters[0];
  const drift: Record<number, { key: string; observed: string }> = {
    0: { key: "scarf_color", observed: "blue wool scarf" },
    2: { key: "scar_side", observed: "scar over the RIGHT eye" },
    4: { key: "ring_hand", observed: "silver ring on the left hand" },
  };
  const shots: Shot[] = scenePrompts.map((scenePrompt, i) => {
    const checks = character.attributes.map((attribute) => ({
      key: attribute.key,
      expected: attribute.expected,
      observed: drift[i]?.key === attribute.key ? drift[i].observed : attribute.expected,
      pass: drift[i]?.key !== attribute.key,
      confidence: 0.91,
      note: "Illustrative mock check; placeholder image was not analyzed.",
    }));
    const totalWeight = character.attributes.reduce((sum, attribute) => sum + attribute.weight, 0);
    const failedWeight = character.attributes.reduce((sum, attribute, index) => sum + (checks[index].pass ? 0 : attribute.weight), 0);
    return {
      id: `mock-shot-${i + 1}`, projectId: mockProject.id, batchId: "mock-batch-1",
      scenePrompt,
      finalPrompt: `${scenePrompt}\nCharacter sheet: ${character.attributes.map((a) => a.expected).join("; ")}.\nConstraints: ${mockRules.map((r) => r.text).join(" ")}`,
      imageUrl: `/seed/shot-${i + 1}.svg`, checks,
      driftScore: failedWeight / totalWeight,
      flagged: checks.some((check) => !check.pass && check.confidence >= 0.6),
      status: "pending",
    };
  });
  return { batch: {
    id: "mock-batch-1", projectId: mockProject.id, index: 1,
    rulesApplied: mockRules.map((rule) => rule.id),
    driftRate: shots.filter((shot) => shot.flagged).length / shots.length, createdAt,
  }, shots };
}

export function getMockProject() {
  const { batch, shots } = createMockBatch();
  const traces: TraceEvent[] = shots.flatMap((shot) => [
    { id: `${shot.id}-check`, projectId: mockProject.id, shotId: shot.id, type: "check" as const,
      message: "MOCK: fixture checks loaded; no AI analysis performed.", createdAt },
    ...(shot.flagged ? [{ id: `${shot.id}-flag`, projectId: mockProject.id, shotId: shot.id,
      type: "flag" as const, category: "attribute_drift" as const,
      message: `MOCK: ${shot.checks.find((check) => !check.pass)?.key} differs from the character sheet.`, createdAt }] : []),
  ]);
  return { project: mockProject, rules: mockRules, batches: [batch], shots, traces };
}
