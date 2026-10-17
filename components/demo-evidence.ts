import type { Batch, Rule, Shot } from "@/lib/types";
export type ArchiveEvidence = {
  takes: {
    index: number;
    shots: number;
    flagged: number;
    checks: number;
    uncertain: number;
  }[];
  firstImage: string;
  latestImage: string;
  heroImage: string;
  learnedRule: string;
  ruleId: string;
  applications: number;
};
export function correctionReach(rule: Rule, shots: Shot[]): number {
  return new Set(
    shots
      .filter(
        (shot) =>
          shot.finalPrompt.includes(rule.text) &&
          shot.checks.some((check) => check.key === `rule:${rule.id}`),
      )
      .map((shot) => shot.id),
  ).size;
}
export function archiveEvidence(entries: unknown): ArchiveEvidence {
  const ordered = [
    ...(entries as { batch: Batch; shots: Shot[]; rules: Rule[] }[]),
  ].sort((a, b) => a.batch.index - b.batch.index);
  const shots = ordered.flatMap((entry) => entry.shots);
  const rule = ordered
    .flatMap((entry) => entry.rules)
    .find((item) => item.source === "rejection");
  return {
    takes: ordered.map((entry) => ({
      index: entry.batch.index,
      shots: entry.shots.length,
      flagged: entry.shots.filter((shot) => shot.flagged).length,
      checks: entry.shots.flatMap((shot) => shot.checks).length,
      uncertain: entry.shots
        .flatMap((shot) => shot.checks)
        .filter(
          (check) =>
            check.confidence < 0.6 ||
            check.observed.toLowerCase() === "unclear",
        ).length,
    })),
    firstImage:
      ordered[0]?.shots.find(
        (shot) => shot.id === "9986ea9e-1d8f-4afc-a45a-a6631923d8cb",
      )?.imageUrl ??
      shots[0]?.imageUrl ??
      "/seed/mara-reference.png",
    latestImage:
      ordered.at(-1)?.shots.find((shot) => shot.scenePrompt.includes("locker"))
        ?.imageUrl ??
      shots.at(-1)?.imageUrl ??
      "/seed/mara-reference.png",
    heroImage:
      shots.find((shot) => shot.scenePrompt.includes("cafe window"))
        ?.imageUrl ?? "/seed/mara-reference.png",
    learnedRule: rule?.text ?? "",
    ruleId: rule?.id ?? "",
    applications: rule ? correctionReach(rule, shots) : 0,
  };
}
