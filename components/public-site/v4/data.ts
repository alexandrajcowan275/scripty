import recorded from "@/seed/cache/manifest.json";
import matched from "@/seed/experiments/ab-test/summary.json";
export const ruleKey = "rule:ca721c45-1e5d-412c-83ba-9a566443c44b";
export const frames = recorded.batches.flatMap(({ batch, shots }) =>
  shots.map((shot, index) => ({
    ...shot,
    rejectReason: "rejectReason" in shot ? shot.rejectReason : undefined,
    take: batch.index,
    number: index + 1,
  })),
);
export type EvidenceFrame = (typeof frames)[number];
export const rejected = frames.find(
  (frame) => frame.take === 1 && frame.number === 2,
)!;
export const ringCheck = frames
  .flatMap((frame) => frame.checks)
  .find((check) => check.key === ruleKey)!;
export const ringRule = ringCheck.expected;
export const laterFrames = frames.filter((frame) => frame.take > 1);
export const carriedFrames = laterFrames.filter(
  (frame) =>
    frame.finalPrompt.includes(ringRule) &&
    frame.checks.some((check) => check.key === ruleKey),
);
export const matchedFlags = [
  matched.summary.A.targetedFlaggedShots,
  matched.summary.B.targetedFlaggedShots,
];
export function constraints(prompt: string) {
  return (
    prompt
      .match(/ACTIVE (?:STORY|CANON) CONSTRAINTS[^\n]*:\n(?:- [^\n]*\n?)+/)?.[0]
      .trim() ?? prompt
  );
}
