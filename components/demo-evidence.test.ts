import { test } from "node:test";
import assert from "node:assert/strict";
import { correctionReach, archiveEvidence } from "./demo-evidence";
import manifest from "../seed/cache/manifest.json";
import type { Rule, Shot } from "../lib/types";
const rule: Rule = {
  id: "r",
  projectId: "mara",
  text: "Ring on RIGHT hand",
  source: "correction",
  createdAt: "2026-10-16",
  timesApplied: 0,
};
const shot = (id: string, prompt: string, key: string): Shot => ({
  id,
  projectId: "mara",
  batchId: "b",
  scenePrompt: "scene",
  finalPrompt: prompt,
  imageUrl: "/frame.png",
  checks: [
    { key, expected: "right", observed: "right", pass: true, confidence: 0.9 },
  ],
  driftScore: 0,
  flagged: false,
  status: "pending",
});
test("correction reach requires the same rule in both prompt and monitor, and deduplicates shots", () => {
  const applied = shot("a", rule.text, "rule:r");
  assert.equal(
    correctionReach(rule, [
      applied,
      applied,
      shot("b", rule.text, "rule:other"),
      shot("c", "other", "rule:r"),
    ]),
    1,
  );
  assert.equal(
    correctionReach({ ...rule, id: "new-local-rule" }, [applied]),
    0,
  );
});
test("archive evidence preserves all four actual batches and their uncertainty denominators", () => {
  const result = archiveEvidence(manifest.batches);
  assert.deepEqual(
    result.takes.map((t) => [t.flagged, t.shots, t.uncertain, t.checks]),
    [
      [2, 6, 4, 36],
      [0, 6, 6, 42],
      [0, 6, 8, 42],
      [1, 6, 6, 42],
    ],
  );
  assert.equal(result.applications, 18);
});
