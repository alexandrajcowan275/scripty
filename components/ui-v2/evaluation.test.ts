import test from "node:test";
import assert from "node:assert/strict";
import {
  pendingQuestions,
  changedMatrixCell,
  metricsVisible,
  type Evaluation,
} from "./evaluation";
test("an explicit can't-tell answer is saved, not silently offered again or counted as a pass", () => {
  const question = {
    shotId: "actual-shot-id",
    attributeKey: "ring",
    expected: "silver ring",
    imageUrl: "/real.png",
    referenceImageUrl: "/ref.png",
  };
  assert.equal(
    pendingQuestions({
      questions: [question],
      labels: [{ ...question, pass: null, createdAt: "now" }],
    }).length,
    0,
  );
  assert.equal(
    pendingQuestions({ questions: [question], labels: [] }).length,
    1,
  );
});
test("accuracy requires both backend readiness and twenty evaluated human judgments", () => {
  const metrics = { metricsReady: true, evaluatedLabels: 19 } as Evaluation;
  assert.equal(metricsVisible(metrics), false);
  assert.equal(metricsVisible({ ...metrics, evaluatedLabels: 20 }), true);
  assert.equal(
    metricsVisible({ ...metrics, evaluatedLabels: 20, metricsReady: false }),
    false,
  );
  assert.equal(metricsVisible(null), false);
});

test("a saved judgment bumps only the actual increased matrix cell; uncertainty does not invent one", () => {
  const before = {
    confusionMatrix: {
      truePositives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      trueNegatives: 0,
    },
  } as Evaluation;
  assert.equal(
    changedMatrixCell(before, {
      ...before,
      confusionMatrix: { ...before.confusionMatrix, falsePositives: 1 },
    }),
    "falsePositives",
  );
  assert.equal(
    changedMatrixCell(before, { ...before, uncertainHumanLabels: 1 }),
    null,
  );
  assert.equal(changedMatrixCell(null, before), null);
});
