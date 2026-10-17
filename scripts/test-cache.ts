import assert from "node:assert/strict";
import test from "node:test";
import type { Batch, Rule, Shot, TraceEvent } from "../lib/types";
import { appliedRules, batchTraces, existingBatch, liveBatchSchema, validateEvidence } from "./cache-utils";
import { liveHeaders } from "./live-request";
const batch: Batch = { id: "real-batch", projectId: "mara", index: 2, rulesApplied: ["seed-scarf"], driftRate: 0.5, createdAt: "2026-10-17T03:00:00Z" };
const shots: Shot[] = Array.from({ length: 6 }, (_, index) => ({ id: `real-${index}`, batchId: batch.id, projectId: "mara", scenePrompt: `Real scene ${index}`, finalPrompt: `Real scene ${index} + canon`, imageUrl: `https://images.example/real-${index}.png`, driftScore: index < 3 ? 0.9 : 0, flagged: index < 3, status: index === 0 ? "rejected" : "pending", ...(index === 0 ? { rejectReason: "Scarf is blue" } : {}), checks: [{ key: "scarf_color", expected: "red", observed: index < 3 ? "blue" : "red", pass: index >= 3, confidence: 0.9 }] }));
const traces: TraceEvent[] = shots.flatMap((shot, index) => [
  { id: `generate-${index}`, projectId: "mara", shotId: shot.id, type: "generate" as const, message: `Batch 2, scene ${index + 1}; provider=openai; images=1; accepted_reference=false`, createdAt: batch.createdAt },
  { id: `check-${index}`, projectId: "mara", shotId: shot.id, type: "check" as const, message: "scarf_color: expected=red; observed=red; provenance=live_monitor", createdAt: batch.createdAt },
]);
const live = () => ({ batch: structuredClone(batch), shots: structuredClone(shots), provenance: "real_engine" as const, imageProvenance: Object.fromEntries(shots.map((shot) => [shot.id, "openai" as const])) });
test("authorized script headers opt into live mode without exposing the token", () => {
  const before = process.env.CANON_ADMIN_TOKEN;
  try {
    process.env.CANON_ADMIN_TOKEN = "test-only-private-header";
    const headers = liveHeaders(); assert.equal(headers["x-canon-mode"], "live"); assert.equal(headers["x-canon-admin-token"], "test-only-private-header");
    delete process.env.CANON_ADMIN_TOKEN; assert.equal(liveHeaders()["x-canon-admin-token"], undefined);
  } finally { if (before === undefined) delete process.env.CANON_ADMIN_TOKEN; else process.env.CANON_ADMIN_TOKEN = before; }
});
test("only complete six-shot real engine batches are accepted", () => {
  assert.equal(validateEvidence(live()).shots.length, 6);
  assert.equal(liveBatchSchema.safeParse({ ...live(), provenance: "live_with_fallback" }).success, false);
  assert.equal(liveBatchSchema.safeParse({ ...live(), shots: shots.slice(0, 5) }).success, false);
  assert.equal(liveBatchSchema.safeParse({ ...live(), imageProvenance: { "real-0": "cached_fallback" } }).success, false);
});
test("zero-confidence monitor fallback, missing provider and drift mismatch cannot enter cache", () => {
  const uncertain = live(); uncertain.shots[0].checks[0].confidence = 0; assert.throws(() => validateEvidence(uncertain), /Incomplete/);
  const missing = live(); delete missing.imageProvenance["real-0"]; assert.throws(() => validateEvidence(missing), /Incomplete/);
  const wrongRate = live(); wrongRate.batch.driftRate = 0; assert.throws(() => validateEvidence(wrongRate), /drift rate/);
});
test("persisted export restores original scene order and preserves genuine creator review", () => {
  const restored = existingBatch(batch, [...shots].reverse(), traces);
  assert.deepEqual(restored.shots.map((shot) => shot.id), shots.map((shot) => shot.id));
  assert.equal(restored.shots[0].status, "rejected"); assert.equal(restored.shots[0].rejectReason, "Scarf is blue"); assert.equal(restored.imageProvenance["real-0"], "openai");
});
test("persisted export refuses unknown/fallback generation and unverified monitoring", () => {
  assert.throws(() => existingBatch(batch, shots, traces.filter((trace) => trace.id !== "generate-0")), /provider provenance/);
  assert.throws(() => existingBatch(batch, shots, traces.map((trace) => trace.id === "generate-0" ? { ...trace, message: trace.message.replace("provider=openai", "provider=cached_fallback") } : trace)), /provider provenance/);
  assert.throws(() => existingBatch(batch, shots, traces.filter((trace) => trace.id !== "check-0")), /live-monitor provenance/);
});
test("batch trace/rule snapshots exclude unrelated global history and later rules", () => {
  const rules: Rule[] = [{ id: "seed-scarf", projectId: "mara", text: "red scarf", source: "seed", timesApplied: 0, createdAt: batch.createdAt }, { id: "later-rule", projectId: "mara", text: "right ring", source: "rejection", timesApplied: 0, createdAt: batch.createdAt }];
  assert.deepEqual(appliedRules(batch, rules).map((rule) => rule.id), ["seed-scarf"]);
  assert.throws(() => appliedRules(batch, []), /applied rule is missing/);
  const global = (id: string, type: TraceEvent["type"], message: string): TraceEvent => ({ id, projectId: "mara", type, message, createdAt: batch.createdAt });
  const filtered = batchTraces(batch, shots, [...traces, global("right-rule", "rule_applied", "Applied to batch 2: red scarf"), global("wrong-rule", "rule_applied", "Applied to batch 1: red scarf"), global("right-usage", "generate", "Batch 2 usage: {}"), global("wrong-usage", "generate", "Batch 1 usage: {}")]);
  assert(filtered.some((trace) => trace.id === "right-rule")); assert(filtered.some((trace) => trace.id === "right-usage")); assert(!filtered.some((trace) => trace.id.startsWith("wrong")));
});
test("read-only CLI export makes no paid endpoint calls and writes six image/provenance records", async () => {
  const { mkdtemp, readFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os"); const { join } = await import("node:path"); const { spawnSync } = await import("node:child_process");
  const directory = await mkdtemp(join(tmpdir(), "canon-cache-test-"));
  const snapshot = { mode: "live", provenance: "supabase", batches: [batch], shots: [...shots].reverse(), rules: [{ id: "seed-scarf", projectId: "mara", text: "Red scarf", source: "seed", timesApplied: 0, createdAt: batch.createdAt }], traces };
  const code = `
    import assert from 'node:assert/strict';
    process.argv.push('--capture-existing', '--batches', '1', '--out', ${JSON.stringify(directory)});
    const snapshot = ${JSON.stringify(snapshot)};
    globalThis.fetch = async (input, init) => {
      const url = new URL(input);
      assert.equal(init?.method ?? 'GET', 'GET', 'Read-only capture must never POST to a paid endpoint');
      if (url.pathname.startsWith('/api/project/')) {
        assert.equal(init.headers['x-canon-mode'], 'live');
        assert.equal(init.headers['x-canon-admin-token'], 'test-only-cli-token');
        return new Response(JSON.stringify(snapshot), { headers: { 'content-type':'application/json', 'x-canon-mode':'live' } });
      }
      assert.equal(url.hostname, 'images.example');
      return new Response(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6GoAAAAASUVORK5CYII=', 'base64'), { headers: { 'content-type':'image/png' } });
    };
    await import('./scripts/cache-demo.ts');
  `;
  try {
    const child = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", code], { cwd: process.cwd(), env: { ...process.env, CANON_ADMIN_TOKEN: "test-only-cli-token" }, encoding: "utf8", timeout: 10000 });
    assert.equal(child.status, 0, child.stderr);
    const manifest = JSON.parse(await readFile(join(directory, "manifest.json"), "utf8"));
    assert.equal(manifest.captureMode, "persisted_read_only"); assert.equal(manifest.batches[0].shots.length, 6); assert.equal(manifest.batches[0].imageProvenance.length, 6);
    assert.equal(manifest.batches[0].reviews[0].reason, "Scarf is blue"); assert.equal(manifest.batches[0].reviews[0].reviewedAt, null);
    assert.equal(manifest.batches[0].imageProvenance[0].provider, "openai"); assert.equal(manifest.batches[0].shots[0].id, "real-0");
    assert.equal(manifest.batches[0].batch.driftRate, 0.5);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("live eval CLI explicitly requests authorized fresh rechecking", async () => {
  const { spawnSync } = await import("node:child_process");
  const { evaluateMonitor } = await import("../lib/eval");
  const result = { ...await evaluateMonitor([], [], { recheck: async () => [] }), engineMode: "live" };
  const code = `
    import assert from 'node:assert/strict';
    process.argv.push('--live-recheck');
    globalThis.fetch = async (input, init) => {
      assert.equal(new URL(input).pathname, '/api/eval'); assert.equal(init.method, 'POST');
      assert.deepEqual(JSON.parse(init.body), { projectId:'mara', includeDrafts:false, recheck:true });
      assert.equal(init.headers['x-canon-mode'], 'live'); assert.equal(init.headers['x-canon-admin-token'], 'test-only-eval-token');
      return new Response(JSON.stringify(${JSON.stringify(result)}), { headers: { 'content-type':'application/json' } });
    };
    await import('./scripts/run-eval.ts');
  `;
  const child = spawnSync(process.execPath, ["--import", "tsx", "--input-type=module", "--eval", code], { cwd: process.cwd(), env: { ...process.env, CANON_ADMIN_TOKEN: "test-only-eval-token" }, encoding: "utf8", timeout: 10000 });
  assert.equal(child.status, 0, child.stderr);
});
