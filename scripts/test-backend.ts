import { test } from "node:test";
import assert from "node:assert/strict";
import { accessCookie, hasPaidAccess, matchesAccessCode } from "../lib/access";
import { usageCost } from "../lib/pricing";
import { calibrationNotes, evaluateHumanLabels, latestHumanLabels, type HumanSubmission } from "../lib/human-eval";
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

test("checker calibration uses actual human disagreements, never uncertainty or agreement", () => {
  const row: HumanSubmission = { id: "human", shot_id: "s1", attribute_key: "scarf", true_pass: true, prediction: check, note: "Scarf is red in shadow.", created_at: "2026-10-17T10:00:00Z" };
  assert.equal(calibrationNotes([row]).length, 1);
  assert.equal(calibrationNotes([{ ...row, true_pass: false }]).length, 0);
  assert.equal(calibrationNotes([{ ...row, true_pass: null }]).length, 0);
  assert.equal(calibrationNotes([row])[0].expected, "red scarf");
});

import { productionInputV2, confirmedProductionAttributes } from "../lib/productions";
test("structured production canon preserves weights/keys and requires anatomical confirmation", () => {
  const input = { name: "Night Shift", characterName: "Ada", attributes: [{ key: "scar_side", label: "Scar", expected: "scar over LEFT eye", weight: 2 }], scenePrompts: ["Station portrait"] };
  assert.equal(productionInputV2.safeParse(input).success, false);
  const confirmed = productionInputV2.parse({ ...input, lateralityConfirmations: { scar_side: "left" } });
  assert.deepEqual(confirmedProductionAttributes(confirmed), input.attributes);
  assert.equal(productionInputV2.safeParse({ ...input, lateralityConfirmations: { scar_side: "right" } }).success, false);
  assert.equal(productionInputV2.safeParse({ ...input, attributes: ["red scarf"], lateralityConfirmations: {} }).success, true);
  assert.equal(productionInputV2.safeParse({ ...input, attributes: ["red scarf"], scenePrompts: [] }).success, false);
});

import { neutralCanonSuggestions } from "../lib/canon-suggestions";
test("provisional laterality never leaks into stable canon identifiers or labels", () => {
  const original = [{ key: "ring_left_hand", label: "Ring on left hand", expected: "silver ring on LEFT hand" }, { key: "ring_right_hand", label: "Ring on right hand", expected: "silver ring on RIGHT hand" }];
  const corrected = neutralCanonSuggestions(original);
  assert.equal(corrected[0].key, "ring_hand"); assert.equal(corrected[1].key, "ring_hand_2");
  assert.equal(corrected[0].label, "Ring on hand"); assert.equal(corrected[0].expected, original[0].expected);
  assert.equal(original[0].key, "ring_left_hand");
});

import { blindQuestions, validatedStudyShots } from '../lib/blind-study';
test('incomplete studies never enter blind evaluation and completed cards hide conditions and predictions', () => {
 const shots=Array.from({length:12},(_,i)=>({...shot,id:`study-${i}`,projectId:'mara',condition:i<6?'A':'B',checks:['ring_hand','scar_side','scarf_color','hair'].map(key=>({...check,key}))}));
 assert.deepEqual(validatedStudyShots({status:'running',projectId:'mara',shots}),[]);
 assert.deepEqual(validatedStudyShots({status:'completed',projectId:'mara',shots:[...shots.slice(0,11),shots[0]]}),[]);
 const valid=validatedStudyShots({status:'completed',projectId:'mara',shots});
 assert.equal(valid.length,12);
 const questions=blindQuestions(valid,'/reference.png');
 assert.equal(questions.length,48);
 assert.deepEqual(questions.slice(0,2).map(q=>q.attributeKey),['ring_hand','scar_side']);
 for(const card of questions){ assert.equal('condition' in card,false);assert.equal('pass' in card,false);assert.equal('confidence' in card,false);assert.equal('flagged' in card,false); }
});
