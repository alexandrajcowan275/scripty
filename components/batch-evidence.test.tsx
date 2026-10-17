import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Batch, Shot } from "../lib/types";
import { batchEvidence, parseScenePrompts } from "./batch-evidence";
import { LearningCurve } from "./learning-curve";

const batch: Batch = { id: "batch-1", projectId: "mara", index: 1, rulesApplied: [], driftRate: 0.5, createdAt: "2026-10-17T00:00:00Z" };
function shots(confidence = 0.9): Shot[] {
  return Array.from({ length: 6 }, (_, index) => ({ id: `shot-${index}`, projectId: "mara", batchId: batch.id, scenePrompt: `Scene ${index}`, finalPrompt: `Scene ${index}`, imageUrl: "/recorded.png", checks: [{ key: "scarf", expected: "red", observed: "red", pass: true, confidence }], driftScore: 0, flagged: false, status: "pending" }));
}

test("partial batches and unavailable monitors cannot produce a completed learning point", () => {
  assert.equal(batchEvidence(shots().slice(0, 5)).complete, false);
  const unavailable = shots();
  unavailable[2].checks[0].confidence = 0;
  assert.equal(batchEvidence(unavailable).complete, false);
  const html = renderToStaticMarkup(<LearningCurve batches={[{ ...batch, driftRate: 0 }]} shots={unavailable}/>);
  assert.match(html, /<strong>—<\/strong>/);
  assert.match(html, /Incomplete evidence/);
  assert.doesNotMatch(html, /class="chart-dot"/);
  assert.doesNotMatch(html, /percentage points|pass-text/);
});

test("low-confidence occlusion remains available, with uncertainty counted separately", () => {
  const occluded = shots(0.4);
  occluded[0].checks[0].observed = "unclear";
  const evidence = batchEvidence(occluded);
  assert.equal(evidence.complete, true);
  assert.equal(evidence.uncertainChecks, 6);
  assert.equal(evidence.unavailableChecks, 0);
});

test("recorded measured rate is preserved and the latest unavailable batch does not imply improvement", () => {
  const later = { ...batch, id: "batch-2", index: 2, driftRate: 0 };
  const laterShots = shots(0).map((shot) => ({ ...shot, id: `later-${shot.id}`, batchId: later.id }));
  const html = renderToStaticMarkup(<LearningCurve batches={[batch, later]} shots={[...shots(), ...laterShots]}/>);
  assert.match(html, /Take 1: 50%/);
  assert.match(html, /1 incomplete takes excluded/);
  assert.doesNotMatch(html, /Batch 2: 0%/);
  assert.match(html, /Human-reviewed labels under fixed criteria/);
  assert.match(html, /<strong>—<\/strong>/);
});

test("custom scene input requires exactly six nonempty lines and blank input keeps server defaults", () => {
  assert.equal(parseScenePrompts(" \n "), undefined);
  assert.deepEqual(parseScenePrompts(" First \nSecond\nThird\nFourth\nFifth\nSixth\n"), ["First", "Second", "Third", "Fourth", "Fifth", "Sixth"]);
  assert.throws(() => parseScenePrompts("One\nTwo"), /exactly six/);
  assert.throws(() => parseScenePrompts("One\nTwo\n\nFour\nFive\nSix"), /exactly six/);
  assert.throws(() => parseScenePrompts("One\nTwo\nThree\nFour\nFive\nSix\nSeven"), /exactly six/);
});
