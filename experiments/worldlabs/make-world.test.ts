import test from "node:test";
import assert from "node:assert/strict";
import { reserveAttempt, summarize, requestOnce, MODELS, MAX_CREDITS } from "./make-world";

test("single draft and standard exhaust the fixed budget; repeated starts are blocked", () => {
  const ledger = { version: 1 as const, attempts: [] as Parameters<typeof reserveAttempt>[0]["attempts"] };
  const draft = reserveAttempt(ledger, "draft");
  assert.equal(draft.model, "marble-1.0-draft");
  assert.throws(() => reserveAttempt(ledger, "draft"), /already attempted/);
  assert.throws(() => reserveAttempt(ledger, "standard", "looks usable"), /completed draft/);
  draft.status = "complete";
  assert.throws(() => reserveAttempt(ledger, "standard"), /written visual assessment/);
  reserveAttempt(ledger, "standard", "Reviewed station panorama and two camera views; topology is usable.");
  assert.equal(ledger.attempts.reduce((sum, a) => sum + a.reserved_credits, 0), MAX_CREDITS);
  assert.throws(() => reserveAttempt(ledger, "standard", "again"), /already attempted/);
  assert.ok(MAX_CREDITS / 1250 <= 1.5);
});

test("unknown outcomes consume a slot; unexpectedly high settled costs block standard", () => {
  const ledger = { version: 1 as const, attempts: [] as Parameters<typeof reserveAttempt>[0]["attempts"] };
  const draft = reserveAttempt(ledger, "draft");
  assert.equal(draft.status, "reserved");
  assert.throws(() => reserveAttempt(ledger, "draft"), /already attempted/);
  draft.status = "complete"; draft.settled_credits = 300;
  assert.throws(() => reserveAttempt(ledger, "standard", "usable"), /credit cap/);
});

test("normalize both documented identifier shapes without inventing assets", () => {
  const op = { operation_id: "operation-fixture", done: true, cost: { total_credits: 230 } };
  const summary = summarize({ world_id: "world-fixture", assets: { splats: { spz_urls: { "100k": "https://example.com/world.spz" } } } }, op, "draft");
  assert.equal(summary.world_id, "world-fixture"); assert.equal(summary.thumbnail, null);
  assert.equal(summary.settled_cost?.total_credits, 230);
  assert.equal(summarize({ id: "legacy-id" }, op, "standard").world_id, "legacy-id");
  assert.throws(() => summarize({}, op, "draft"), /missing world_id/);
  assert.equal(MODELS.standard, "marble-1.1");
});

test("HTTP and network failures never retry or expose response bodies/secrets", async () => {
  let calls = 0;
  const transport = (async (_url, options) => {
    calls++; assert.ok(options?.signal); assert.equal(options?.redirect, "error");
    return new Response("secret-test-token provider debug body", { status: 429 });
  }) as typeof fetch;
  await assert.rejects(requestOnce("https://example.com", {}, "test", transport), { message: "test: HTTP 429; no retry performed." });
  assert.equal(calls, 1);
  const failing = (async () => { calls++; throw new Error("secret-test-token"); }) as typeof fetch;
  await assert.rejects(requestOnce("https://example.com", {}, "test", failing), error => {
    assert.ok(error instanceof Error); assert.doesNotMatch(error.message, /secret-test-token/); return true;
  });
  assert.equal(calls, 2);
});
