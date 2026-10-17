import { test } from "node:test";
import assert from "node:assert/strict";
import { accessCookie, hasPaidAccess, matchesAccessCode } from "../lib/access";
import { usageCost } from "../lib/pricing";
import { evaluateHumanLabels, latestHumanLabels, type HumanSubmission } from "../lib/human-eval";
import { selectShots } from "../lib/workspace";
import type { Shot } from "../lib/types";
const check = { key: "scarf", expected: "red scarf", observed: "blue scarf", pass: false, confidence: 0.9 };
const shot: Shot = { id: "s1", projectId: "test", batchId: "b1", scenePrompt: "scene", finalPrompt: "prompt", imageUrl: "/image.png", checks: [check], driftScore: 0.9, flagged: true, status: "pending" };
test("live paid access needs switch and code; session is signed, expiring and rotation-bound", () => {
  const previous = { code: process.env.SCRIPTY_ACCESS_CODE, secret: process.env.CANON_SESSION_SECRET, enabled: process.env.CANON_PUBLIC_GENERATION_ENABLED };
  process.env.SCRIPTY_ACCESS_CODE = "test-only-code"; process.env.CANON_SESSION_SECRET = "test-signing-secret"; process.env.CANON_PUBLIC_GENERATION_ENABLED = "true";
  try {
    assert.equal(matchesAccessCode("wrong"), false); assert.equal(matchesAccessCode("test-only-code"), true);
    assert.equal(hasPaidAccess(new Request("https://scripty.test")), false);
    const cookie = accessCookie(); assert.ok(cookie.includes("HttpOnly")); assert.ok(cookie.includes("SameSite=Strict"));
    const request = new Request("https://scripty.test", { headers: { cookie } });
    assert.equal(hasPaidAccess(request), true);
    assert.equal(hasPaidAccess(new Request("https://scripty.test", { headers: { cookie: cookie.replace("scripty_access=", "scripty_access=0") } })), false);
    process.env.CANON_PUBLIC_GENERATION_ENABLED = "false"; assert.equal(hasPaidAccess(request), false);
    process.env.CANON_PUBLIC_GENERATION_ENABLED = "true"; process.env.SCRIPTY_ACCESS_CODE = "rotated"; assert.equal(hasPaidAccess(request), false);
  } finally {
    for (const [key, value] of Object.entries({ SCRIPTY_ACCESS_CODE: previous.code, CANON_SESSION_SECRET: previous.secret, CANON_PUBLIC_GENERATION_ENABLED: previous.enabled })) if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
test("usage cost distinguishes image/text rates and fails closed on unknown usage", () => {
  assert.equal(usageCost("gpt-image-2.5-sunburst-2026-09-08", { input_tokens: 1000, output_tokens: 2000, input_tokens_details: { text_tokens: 200, image_tokens: 800 } }), 0.0674);
  assert.equal(usageCost("gpt-5.4-mini", { input_tokens: 1000, output_tokens: 1000 }), 0.00525);
  assert.equal(usageCost("gpt-4.1-mini", { input_tokens: 1000, output_tokens: 1000 }), 0.002);
  assert.equal(usageCost("unpriced-model", { input_tokens: 1, output_tokens: 1 }), null);
  assert.equal(usageCost("gpt-image-2.5-sunburst", {}), null);
});
test("repair selection excludes unflagged shots and rejects cross-production IDs", () => {
  const good = { ...shot, id: "s2", flagged: false };
  assert.deepEqual(selectShots([shot, good], undefined, true).map(s => s.id), ["s1"]);
  assert.throws(() => selectShots([shot, good], ["s2"], true));
  assert.throws(() => selectShots([shot], ["other"], true));
  assert.throws(() => selectShots([shot], ["s1", "s1"], true));
});
test("human-only evaluation excludes uncertainty and freezes predictions at labeling time", async () => {
  const base: HumanSubmission = { id: "l1", shot_id: "s1", attribute_key: "scarf", true_pass: true, prediction: check, note: "false alarm", created_at: "2026-10-17T09:00:00Z" };
  const result = await evaluateHumanLabels([{ ...shot, checks: [{ ...check, pass: true }] }], [base]);
  assert.equal(result.falsePositives, 1); assert.equal(result.trueNegatives, 0); assert.equal(result.humanLabels, 1); assert.equal(result.metricsReady, false);
  const uncertain = { ...base, id: "l2", true_pass: null, created_at: "2026-10-17T09:01:00Z" };
  assert.equal(latestHumanLabels([base, uncertain]).length, 1);
  const revised = await evaluateHumanLabels([shot], [base, uncertain]);
  assert.equal(revised.evaluatedLabels, 0); assert.equal(revised.precision, null); assert.equal(revised.uncertainHumanLabels, 1);
});
test("empty human submissions never turn draft seed labels into accuracy", async () => {
  const result = await evaluateHumanLabels([shot], []);
  assert.equal(result.precision, null); assert.equal(result.recall, null); assert.equal(result.f1, null); assert.equal(result.accuracy, null); assert.equal(result.labelSource, "human_blind");
});
