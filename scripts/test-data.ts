import assert from "node:assert/strict";
import test from "node:test";
import { evaluateMonitor } from "../lib/eval";
import { getProject, saveShot, shotSchema } from "../lib/db";
import type { Shot } from "../lib/types";
const shot: Shot = { id: "test-shot", projectId: "mara", batchId: "test-batch", scenePrompt: "Scene", finalPrompt: "Scene with constraints", imageUrl: "/seed/example.png", driftScore: 0.5, flagged: true, status: "pending", checks: [
  { key: "tp", expected: "red", observed: "blue", pass: false, confidence: 0.9 },
  { key: "fp", expected: "left", observed: "right", pass: false, confidence: 0.8 },
  { key: "tn", expected: "black", observed: "black", pass: true, confidence: 0.8 },
  { key: "fn", expected: "silver", observed: "unclear", pass: false, confidence: 0.2 },
] };
const labels = [{ attributeKey: "tp", truePass: false }, { attributeKey: "fp", truePass: true }, { attributeKey: "tn", truePass: true }, { attributeKey: "fn", truePass: false }].map((label) => ({ ...label, shotId: shot.id, status: "verified", verifiedBy: "test-human", verifiedAt: "2026-10-17T01:00:00Z" }));
test("drift is positive; low-confidence failure is a false negative; metrics have honest denominators", async () => {
  const result = await evaluateMonitor([shot], labels);
  assert.equal(result.truePositives, 1); assert.equal(result.falsePositives, 1); assert.equal(result.trueNegatives, 1); assert.equal(result.falseNegatives, 1);
  assert.equal(result.precision, 0.5); assert.equal(result.recall, 0.5); assert.equal(result.f1, 0.5); assert.equal(result.accuracy, 0.5);
});
test("unverified and DRAFT labels never produce metrics by default", async () => {
  const result = await evaluateMonitor([shot], [{ shotId: shot.id, attributeKey: "tp", truePass: false }, { ...labels[0], shotId: "DRAFT-example" }]);
  assert.equal(result.status, "no_verified_labels"); assert.equal(result.precision, null); assert.equal(result.f1, null); assert.equal(result.skippedUnverified, 2);
});
test("missing evidence is reported instead of counted as correct", async () => {
  const result = await evaluateMonitor([shot], [{ ...labels[0], shotId: "missing" }, { ...labels[0], attributeKey: "missing" }]);
  assert.equal(result.missingShots, 1); assert.equal(result.missingChecks, 1); assert.equal(result.evaluatedLabels, 0); assert.equal(result.accuracy, null);
});
test("rechecks run once per labeled shot and replace stored predictions", async () => {
  let count = 0;
  const result = await evaluateMonitor([shot], labels.slice(0, 2), { recheck: async () => { count++; return shot.checks.map((check) => ({ ...check, pass: true })); } });
  assert.equal(count, 1); assert.equal(result.mode, "rechecked"); assert.equal(result.falseNegatives, 1); assert.equal(result.trueNegatives, 1);
});
test("conflicting duplicate labels are rejected", async () => {
  await assert.rejects(evaluateMonitor([shot], [labels[0], { ...labels[0], truePass: true }]), /Duplicate hand label/);
});
test("missing Supabase credentials explain setup without a network call", async () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  try { await assert.rejects(getProject("mara"), /Supabase is not configured/); }
  finally { if (originalUrl !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl; if (originalKey !== undefined) process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey; }
});
test("input validation rejects malformed checks before writing", async () => {
  assert.equal(shotSchema.safeParse({ ...shot, checks: [...shot.checks, shot.checks[0]] }).success, false);
  await assert.rejects(saveShot({ ...shot, driftScore: 1.2 }));
});
