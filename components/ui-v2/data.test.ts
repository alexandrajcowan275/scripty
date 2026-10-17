import test from "node:test";
import assert from "node:assert/strict";
import {
  currentShot,
  confidence,
  failedCheck,
  frameName,
  modelFor,
  money,
  operationIssue,
  ruleReach,
  shotStatus,
  type ProductionData,
} from "./data";
import type { Rule, Shot } from "@/lib/types";

const rule: Rule = {
  id: "ring",
  projectId: "project",
  text: "Ring stays on the right hand.",
  source: "rejection",
  createdAt: "2026-10-17",
  timesApplied: 1,
};
const shot: Shot = {
  id: "shot",
  projectId: "project",
  batchId: "take",
  scenePrompt: "A new scene",
  imageUrl: "/real.png",
  finalPrompt: rule.text,
  checks: [
    {
      key: "rule:ring",
      expected: rule.text,
      observed: "right hand",
      confidence: 0.9,
      pass: true,
    },
  ],
  driftScore: 0,
  flagged: false,
  status: "pending",
};
test("missing costs/confidence remain unavailable instead of becoming mock metrics", () => {
  assert.equal(money(null), "—");
  assert.equal(money(undefined), "—");
  assert.equal(confidence(0), "—");
  assert.equal(confidence(0.83), "0.83");
});
test("memory reach requires the same real shot in prompt and checking; duplicates do not inflate it", () => {
  assert.equal(ruleReach(rule, [shot, shot]), 1);
  assert.equal(
    ruleReach(rule, [
      { ...shot, finalPrompt: "Other prompt" },
      { ...shot, id: "other", checks: [] },
    ]),
    0,
  );
});
test("invisible/low-confidence criteria stay unclear and do not create a defect callout", () => {
  const uncertain = {
    ...shot,
    checks: [
      {
        key: "scar_side",
        expected: "left",
        observed: "not visible",
        confidence: 0.85,
        pass: false,
      },
    ],
  };
  assert.equal(shotStatus(uncertain).kind, "unclear");
  assert.equal(failedCheck(uncertain), undefined);
});
test("frame numbering and model labels use actual selected-batch records, not shot IDs or mock defaults", () => {
  const data = {
    project: { id: "project", name: "Production", characters: [] },
    shots: [shot],
    batches: [
      {
        id: "take",
        projectId: "project",
        index: 4,
        driftRate: 0,
        rulesApplied: ["ring"],
        createdAt: "2026-10-17",
      },
    ],
    rules: [rule],
    traces: [
      {
        id: "trace",
        projectId: "project",
        shotId: "shot",
        type: "generate",
        message: "provider=openai; image_model=recorded-model; images=1",
        createdAt: "2026-10-17",
      },
    ],
  } satisfies ProductionData;
  assert.equal(frameName(shot, data), "T4·S01");
  assert.equal(
    modelFor(data, data.batches[0], "image_model"),
    "recorded-model",
  );
  assert.equal(modelFor(data, data.batches[0], "monitor_model"), "—");
});

test("a newer recheck changes the working view without rewriting original evidence", () => {
  const data = {
    project: { id: "project", name: "Production", characters: [] },
    shots: [shot],
    batches: [],
    rules: [],
    traces: [],
    monitorRuns: [
      {
        id: "recheck",
        shot_id: shot.id,
        checks: [],
        flagged: true,
        drift_score: 1,
        rule_ids: [],
        model: "actual-model",
        version: "v1",
        created_at: "2026-10-17",
      },
    ],
  } satisfies ProductionData;
  const working = currentShot(shot, data);
  assert.equal(working.flagged, true);
  assert.equal(shot.flagged, false);
  assert.equal(shot.checks.length, 1);
});
test("a repaired frame keeps the original take and shot identity", () => {
  const repaired = { ...shot, id: "repair", batchId: "repair-batch" };
  const data = {
    project: { id: "project", name: "Production", characters: [] },
    shots: [shot],
    repairShots: [repaired],
    repairs: [
      {
        shot_id: repaired.id,
        source_shot_id: shot.id,
        created_at: "2026-10-17",
      },
    ],
    batches: [
      {
        id: "take",
        projectId: "project",
        index: 4,
        driftRate: 0,
        rulesApplied: [],
        createdAt: "2026-10-17",
      },
    ],
    rules: [],
    traces: [],
  } satisfies ProductionData;
  assert.equal(frameName(repaired, data), "T4·S01·fix");
});

test("partial repair and recheck failures remain visible after successful HTTP responses", () => {
  assert.equal(
    operationIssue({
      repaired: [
        { shot: { id: "repaired" } },
        { error: "One source image could not be repaired." },
      ],
    }),
    "One source image could not be repaired.",
  );
  assert.equal(
    operationIssue({ results: [{ error: "Vision check unavailable." }] }),
    "Vision check unavailable.",
  );
  assert.equal(
    operationIssue({ warning: "Original images were retained." }),
    "Original images were retained.",
  );
  assert.equal(operationIssue({ shots: [] }), "");
});
