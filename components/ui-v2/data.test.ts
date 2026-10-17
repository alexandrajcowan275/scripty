import test from "node:test";
import assert from "node:assert/strict";
import { confidence, failedCheck, frameName, modelFor, money, ruleReach, shotStatus, type ProductionData } from "./data";
import type { Rule, Shot } from "@/lib/types";

const rule: Rule = { id: "ring", projectId: "project", text: "Ring stays on the right hand.", source: "rejection", createdAt: "2026-10-17", timesApplied: 1 };
const shot: Shot = { id: "shot", projectId: "project", batchId: "take", scenePrompt: "A new scene", imageUrl: "/real.png", finalPrompt: rule.text, checks: [{ key: "rule:ring", expected: rule.text, observed: "right hand", confidence: .9, pass: true }], driftScore: 0, flagged: false, status: "pending" };
test("missing costs/confidence remain unavailable instead of becoming mock metrics", () => { assert.equal(money(null), "—"); assert.equal(money(undefined), "—"); assert.equal(confidence(0), "—"); assert.equal(confidence(.83), "0.83"); });
test("memory reach requires the same real shot in prompt and checking; duplicates do not inflate it", () => {
  assert.equal(ruleReach(rule, [shot, shot]), 1);
  assert.equal(ruleReach(rule, [{ ...shot, finalPrompt: "Other prompt" }, { ...shot, id: "other", checks: [] }]), 0);
});
test("invisible/low-confidence criteria stay unclear and do not create a defect callout", () => {
  const uncertain = { ...shot, checks: [{ key: "scar_side", expected: "left", observed: "not visible", confidence: .85, pass: false }] };
  assert.equal(shotStatus(uncertain).kind, "unclear"); assert.equal(failedCheck(uncertain), undefined);
});
test("frame numbering and model labels use actual selected-batch records, not shot IDs or mock defaults", () => {
  const data = { project: { id: "project", name: "Production", characters: [] }, shots: [shot], batches: [{ id: "take", projectId: "project", index: 4, driftRate: 0, rulesApplied: ["ring"], createdAt: "2026-10-17" }], rules: [rule], traces: [{ id: "trace", projectId: "project", shotId: "shot", type: "generate", message: "provider=openai; image_model=recorded-model; images=1", createdAt: "2026-10-17" }] } satisfies ProductionData;
  assert.equal(frameName(shot, data), "T4·S01"); assert.equal(modelFor(data, data.batches[0], "image_model"), "recorded-model"); assert.equal(modelFor(data, data.batches[0], "monitor_model"), "—");
});
