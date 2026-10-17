import type { Shot } from "@/lib/types";

export function batchEvidence(shots: Shot[]) {
  const checks = shots.flatMap((shot) => shot.checks);
  const unavailableChecks = checks.filter((check) => !Number.isFinite(check.confidence) || check.confidence <= 0).length;
  const uncertainChecks = checks.filter((check) => check.confidence > 0 && (check.confidence < 0.6 || check.observed.toLowerCase() === "unclear")).length;
  const missingCheckShots = shots.filter((shot) => shot.checks.length === 0).length;
  const complete = shots.length === 6 && unavailableChecks === 0 && missingCheckShots === 0;
  return { complete, shotCount: shots.length, checkCount: checks.length, unavailableChecks, uncertainChecks, missingCheckShots };
}

/** Blank means use the API's scene set; populated input must provide six complete lines. */
export function parseScenePrompts(value: string): string[] | undefined {
  if (!value.trim()) return undefined;
  const lines = value.trim().split(/\r?\n/).map((line) => line.trim());
  if (lines.length !== 6 || lines.some((line) => !line)) throw new Error("Enter exactly six nonempty scene prompts, one per line, or clear the field to use the server defaults.");
  if (lines.some((line) => line.length > 2000)) throw new Error("Keep each scene prompt under 2,000 characters.");
  return lines;
}
