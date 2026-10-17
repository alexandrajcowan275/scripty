import "../components/ui-v2/data.test";
import "../components/ui-v2/evaluation.test";
import "./test-backend";
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
test("database mappings keep reviews and learned rules visible across fresh project reads", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://canon-test.invalid"; process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-not-a-secret";
  let persistedShot = { id: shot.id, projectId: shot.projectId, batchId: shot.batchId, scenePrompt: shot.scenePrompt, finalPrompt: shot.finalPrompt, imageUrl: shot.imageUrl, driftScore: shot.driftScore, flagged: shot.flagged, status: shot.status as string, rejectReason: null as string | null, checks: shot.checks.map((check, position) => ({ ...check, note: null, position })) };
  const persistedRules: unknown[] = [];
  const { addRule, updateShotReview } = await import("../lib/db");
  globalThis.fetch = async (input, init) => {
    const address = new URL(input instanceof Request ? input.url : String(input));
    const table = address.pathname.split("/").pop();
    let result: unknown;
    if (table === "projects") result = { id: "mara", name: "Mara", characters: [{ id: "mara-character", name: "Mara", referenceImageUrl: "/seed/ref.png", position: 0, attributes: [{ key: "scarf_color", label: "Scarf", expected: "red", weight: 1, position: 0 }] }] };
    else if (table === "rules" && init?.method === "POST") { const row = JSON.parse(String(init.body)); persistedRules.push({ id: row.id, projectId: row.project_id, text: row.text, attributeKey: row.attribute_key, source: row.source, createdAt: row.created_at, timesApplied: row.times_applied }); return new Response(null, { status: 201 }); }
    else if (table === "rules") result = persistedRules;
    else if (table === "batches") result = [{ id: shot.batchId, projectId: "mara", index: 1, rulesApplied: [], driftRate: 0.5, createdAt: "2026-10-17T01:00:00Z" }];
    else if (table === "traces") result = [];
    else if (table === "shots" && init?.method === "PATCH") { const row = JSON.parse(String(init.body)); persistedShot = { ...persistedShot, status: row.status, rejectReason: row.reject_reason }; result = { id: shot.id }; }
    else if (table === "shots") result = address.searchParams.has("id") ? persistedShot : [persistedShot];
    else throw new Error(`Unexpected database request: ${address.pathname}`);
    return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
  };
  try {
    const first = await getProject("mara"); assert.equal(first?.shots[0].status, "pending"); assert.equal(first?.shots[0].rejectReason, undefined);
    await updateShotReview(shot.id, "reject", "Scarf is blue.");
    await addRule({ id: "learned-scarf", projectId: "mara", text: "Scarf must stay red.", source: "rejection", createdAt: "2026-10-17T01:00:00Z", timesApplied: 0 });
    const second = await getProject("mara"); assert.equal(second?.shots[0].status, "rejected"); assert.equal(second?.shots[0].rejectReason, "Scarf is blue."); assert.equal(second?.rules[0].text, "Scarf must stay red.");
    await updateShotReview(shot.id, "accept"); const third = await getProject("mara"); assert.equal(third?.shots[0].status, "accepted"); assert.equal(third?.shots[0].rejectReason, undefined);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
  }
});
test("budget reservations round up and fail closed at the persistent limit", async () => {
  const originalFetch = globalThis.fetch;
  const { reserveApiBudget, getApiBudget } = await import("../lib/db");
  const reservations: number[] = [];
  globalThis.fetch = async (input, init) => {
    const address = new URL(input instanceof Request ? input.url : String(input));
    if (address.pathname.endsWith("reserve_api_attempt")) {
      reservations.push(JSON.parse(String(init?.body)).p_amount);
      return new Response(JSON.stringify(reservations.length === 1), { headers: { "content-type": "application/json" } });
    }
    if (address.pathname.endsWith("release_stale_api_holds")) return new Response("0", { headers: { "content-type": "application/json" } });
    if (address.pathname.endsWith("api_budget_v2")) return new Response(JSON.stringify({ baseline_usd: "2.230000", spent_usd: "27.770000", held_usd: "0", limit_usd: "30" }), { headers: { "content-type": "application/json" } });
    throw new Error("Unexpected budget request.");
  };
  try {
    assert.equal(await reserveApiBudget(0.000001), true); assert.equal(reservations[0], 0.000001);
    assert.equal(await reserveApiBudget(0.5), false);
    assert.deepEqual(await getApiBudget(), { reservedUsd: 30, remainingUsd: 0, limitUsd: 30, baselineUsd: 2.23, usageEstimatedUsd: 27.77, heldUsd: 0 });
    await assert.rejects(reserveApiBudget(-0.1)); await assert.rejects(reserveApiBudget(Number.NaN));
  } finally { globalThis.fetch = originalFetch; }
});
