import { test } from "node:test";
import assert from "node:assert/strict";
import seed from "../seed/mara.json";
import { buildFinalPrompt, localRejectionRule, mergeRule, orderRules } from "../lib/rules";
import { scoreChecks, uncertainChecks, monitorImage, normalizeMonitorChecks } from "../lib/monitor";
import { assertBudgetedTextModel, emptyUsage, structuredCall } from "../lib/engine-ai";
import { z } from "zod";
import { generateImage } from "../lib/generate";
import { readDemoState, sessionCookie, type DemoState } from "../lib/engine-cache";
import { liveMode, mapLimit } from "../lib/engine-http";
import type { Character, Rule, Shot } from "../lib/types";
const character = seed.project.characters[0] as Character;
const rules = seed.rules as Rule[];
const shot: Shot = { id: "shot-1", projectId: "mara", batchId: "b1", scenePrompt: "scene", finalPrompt: "prompt", imageUrl: "/seed/mara-reference.svg", checks: [], driftScore: 0, flagged: false, status: "pending" };
test("final prompt includes every sheet attribute and all ordered constraints without mutating memory", () => {
  const memory = [{ ...rules[0], timesApplied: 2 }, { ...rules[1], createdAt: "2026-10-17T00:00:00Z", timesApplied: 5 }];
  const before = JSON.stringify(memory); const prompt = buildFinalPrompt("  A night portrait  ", character, memory);
  assert.ok(prompt.startsWith("A night portrait\n"));
  for (const attribute of character.attributes) assert.ok(prompt.includes(attribute.expected));
  for (const rule of memory) assert.ok(prompt.includes(rule.text));
  assert.ok(prompt.indexOf(memory[1].text) < prompt.indexOf(memory[0].text));
  assert.equal(JSON.stringify(memory), before);
  assert.equal(orderRules([{ ...memory[0], timesApplied: 0 }, { ...memory[1], timesApplied: 0 }])[0].id, memory[1].id);
});
test("rule merge normalizes punctuation and preserves id/application history", () => {
  const existing: Rule = { ...rules[0], text: "Mara’s scarf stays RED.", timesApplied: 7 };
  const candidate: Rule = { ...existing, id: "new", text: "Maras scarf stays red!", timesApplied: 0, createdAt: "2026-10-17T01:00:00Z" };
  const merged = mergeRule(candidate, [existing]);
  assert.equal(merged.merged, true); assert.equal(merged.rule.id, existing.id); assert.equal(merged.rule.timesApplied, 7);
  const semantic = mergeRule({ ...candidate, text: "Mara always wears her red scarf." }, [existing], existing.id);
  assert.equal(semantic.rule.id, existing.id); assert.equal(semantic.rule.text, "Mara always wears her red scarf.");
  assert.equal(mergeRule({ ...candidate, attributeKey: "hair" }, [existing], existing.id).merged, false);
});
test("local corrections use the creator reason and merge same-attribute memory", () => {
  const learned = localRejectionRule(shot, character, "The scar is over the wrong eye", rules);
  assert.equal(learned.rule.attributeKey, "scar_side"); assert.equal(learned.rule.id, "seed-scar"); assert.equal(learned.merged, true);
  assert.equal(localRejectionRule(shot, character, "Her ring switched hands", rules).rule.attributeKey, "ring_hand");
});
test("threshold is exactly .6; rules are checks; confidence-weighted drift respects weights", () => {
  const weighted = { ...character, attributes: [{ key: "a", label: "A", expected: "red", weight: 3 }, { key: "b", label: "B", expected: "left", weight: 1 }] };
  const checks = [{ key: "a", expected: "red", observed: "blue", pass: false, confidence: .6 }, { key: "b", expected: "left", observed: "left", pass: true, confidence: 1 }];
  assert.equal(scoreChecks(checks, weighted, []).flagged, true); assert.ok(Math.abs(scoreChecks(checks, weighted, []).driftScore - .45) < .00001);
  assert.equal(scoreChecks([{ ...checks[0], confidence: .599 }], weighted, []).flagged, false);
  const uncertain = uncertainChecks(character, rules, "occluded");
  assert.equal(uncertain.length, character.attributes.length + rules.length);
  assert.ok(uncertain.every((check) => !check.pass && check.confidence === 0));
});
test("missing raster reference/provider degrades to uncertain checks without paid calls", async () => {
  const oldFetch = globalThis.fetch; let calls = 0; globalThis.fetch = async () => { calls++; throw new Error("Network is forbidden in test"); };
  try {
    const checked = await monitorImage({ imageUrl: "/seed/mara-reference.svg", character, rules });
    assert.ok(checked.error); assert.ok(checked.checks.every((check) => !check.pass && check.confidence === 0)); assert.equal(checked.flagged, false);
    const generated = await generateImage({ finalPrompt: "scene", referenceImageUrl: "/seed/mara-reference.svg", fallbackImageUrl: "/fallback.png", filename: "x.png" });
    assert.equal(generated.provenance, "cached_fallback"); assert.equal(generated.imageUrl, "/fallback.png"); assert.equal(calls, 0);
  } finally { globalThis.fetch = oldFetch; }
});
test("signed session survives refresh, isolates browsers, rejects tampering", () => {
  const state: DemoState = { v: 1, projectId: "mara", count: 2, reviews: [{ id: "x", decision: "reject", reason: "Wrong scarf" }], rules: [] };
  const cookie = sessionCookie(state).split(";")[0];
  assert.deepEqual(readDemoState(new Request("http://localhost", { headers: { cookie } }), "mara"), state);
  assert.equal(readDemoState(new Request("http://localhost"), "mara").count, 0);
  assert.equal(readDemoState(new Request("http://localhost", { headers: { cookie: cookie.replace(/.$/, "!") } }), "mara").count, 0);
  assert.equal(readDemoState(new Request("http://localhost", { headers: { cookie } }), "other").count, 0);
});
test("public header cannot enable live mode; admin gate is enforced", () => {
  const oldMode = process.env.DEMO_MODE, oldAdmin = process.env.CANON_ADMIN_TOKEN;
  try {
    process.env.DEMO_MODE = "cached";
    assert.equal(liveMode(new Request("http://localhost", { headers: { "x-canon-mode": "live" } })), false);
    process.env.DEMO_MODE = "live"; process.env.CANON_ADMIN_TOKEN = "secret";
    assert.equal(liveMode(new Request("http://localhost")), false);
    assert.throws(() => liveMode(new Request("http://localhost", { headers: { "x-canon-mode": "live" } })));
    assert.equal(liveMode(new Request("http://localhost", { headers: { "x-canon-mode": "live", "x-canon-admin-token": "secret" } })), true);
  } finally { if (oldMode === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = oldMode; if (oldAdmin === undefined) delete process.env.CANON_ADMIN_TOKEN; else process.env.CANON_ADMIN_TOKEN = oldAdmin; }
});
test("six concurrent jobs never exceed three workers and preserve scene order", async () => {
  let active = 0, peak = 0;
  const output = await mapLimit([0, 1, 2, 3, 4, 5], 3, async (value) => { active++; peak = Math.max(peak, active); await new Promise((resolve) => setTimeout(resolve, 2)); active--; return value * 2; });
  assert.equal(peak, 3); assert.deepEqual(output, [0, 2, 4, 6, 8, 10]);
});

test("cached API replay, review and refresh share only the signed browser state", async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os"); const path = await import("node:path");
  const { POST: batchPost } = await import("../app/api/batch/route");
  const { GET: projectGet } = await import("../app/api/project/[id]/route");
  const { POST: reviewPost } = await import("../app/api/shot/[id]/review/route");
  const directory = await mkdtemp(path.join(tmpdir(), "canon-engine-test-"));
  const cwd = process.cwd(), oldMode = process.env.DEMO_MODE;
  try {
    await mkdir(path.join(directory, "seed/cache"), { recursive: true });
    const batch = { id: "recorded", projectId: "mara", index: 1, rulesApplied: ["captured-applied"], driftRate: 1 / 6, createdAt: "2026-10-17T00:00:00.000Z" };
    const shots = Array.from({ length: 6 }, (_, index) => ({ ...shot, id: `recorded-${index}`, batchId: "recorded", status: "rejected", rejectReason: "Captured script reason", flagged: index === 0 }));
    await writeFile(path.join(directory, "seed/cache/manifest.json"), JSON.stringify({ version: 1, projectId: "mara", provenance: "real_engine", createdAt: batch.createdAt, batches: [{ batch, shots, rules: [{ ...rules[0], id: "captured-only" }, { ...rules[0], id: "captured-applied", text: "A recorded applied constraint." }], traces: [{ id: "applied-trace", projectId: "mara", type: "rule_applied", message: "Applied recorded constraint", createdAt: batch.createdAt }] }] }));
    process.chdir(directory); process.env.DEMO_MODE = "cached";
    const initial = await projectGet(new Request("http://localhost"), { params: Promise.resolve({ id: "mara" }) });
    assert.equal((await initial.json()).shots.length, 0);
    const response = await batchPost(new Request("http://localhost", { method: "POST", body: JSON.stringify({ projectId: "mara" }) }));
    assert.equal(response.status, 200); const firstCookie = response.headers.get("set-cookie")!.split(";")[0];
    const payload = await response.json(); assert.equal(payload.batch.driftRate, 1 / 6); assert.equal(payload.provenance, "cached_real_engine"); assert.ok(payload.shots.every((item: Shot) => item.status === "pending" && !item.rejectReason));
    const review = await reviewPost(new Request("http://localhost", { method: "POST", headers: { cookie: firstCookie }, body: JSON.stringify({ decision: "reject", reason: "The ring is on the wrong hand" }) }), { params: Promise.resolve({ id: "recorded-0" }) });
    assert.equal(review.status, 200); const reviewCookie = review.headers.get("set-cookie")!.split(";")[0];
    const refreshed = await projectGet(new Request("http://localhost", { headers: { cookie: reviewCookie } }), { params: Promise.resolve({ id: "mara" }) });
    const refreshedData = await refreshed.json();
    assert.equal(refreshedData.shots[0].status, "rejected"); assert.equal(refreshedData.rules.length, 4); assert.ok(refreshedData.rules.some((rule: Rule) => rule.id === "captured-applied")); assert.ok(refreshedData.traces.some((trace: { message: string }) => trace.message.startsWith("[Recorded engine]"))); assert.ok(!refreshedData.rules.some((rule: Rule) => rule.id === "captured-only"));
    const secondBrowser = await projectGet(new Request("http://localhost"), { params: Promise.resolve({ id: "mara" }) });
    assert.equal((await secondBrowser.json()).shots.length, 0);
    const exhausted = await batchPost(new Request("http://localhost", { method: "POST", headers: { cookie: reviewCookie }, body: JSON.stringify({ projectId: "mara" }) }));
    assert.equal(exhausted.status, 409);
  } finally { process.chdir(cwd); if (oldMode === undefined) delete process.env.DEMO_MODE; else process.env.DEMO_MODE = oldMode; await rm(directory, { recursive: true, force: true }); }
});

test("unclear high-confidence provider output cannot create a confident failure trace", () => {
  const output = character.attributes.map((attribute) => ({ key: attribute.key, observed: attribute.expected, pass: true, confidence: .9, note: null, category: null as "attribute_drift" | null }));
  output[0] = { ...output[0], observed: "unclear because the scarf is occluded", pass: false, category: "attribute_drift" };
  const normalized = normalizeMonitorChecks(output, character, []);
  assert.equal(normalized.checks[0].confidence, .49); assert.equal(normalized.failures.length, 0); assert.equal(scoreChecks(normalized.checks, character, []).flagged, false);
  output[1] = { ...output[1], observed: "scar over the RIGHT eye", pass: false, category: "attribute_drift" };
  const visibleFailure = normalizeMonitorChecks(output, character, []);
  assert.equal(visibleFailure.failures.length, 1); assert.equal(visibleFailure.failures[0].key, "scar_side");
});

test("storage failure after paid image success never generates a second image", async () => {
  const key = process.env.OPENAI_API_KEY; process.env.OPENAI_API_KEY = "test-only-not-real";
  let requests = 0, reservations = 0, uploads = 0;
  try {
    const generated = await generateImage({ finalPrompt: "scene", referenceImageUrl: "/reference.png", fallbackImageUrl: "/fallback.png", filename: "x.png" }, {
      image: async () => "data:image/png;base64,dGVzdA==",
      reserve: async (_amount, usage) => { reservations++; usage.reservedUsd += .5; },
      request: async () => { requests++; return Response.json({ data: [{ b64_json: "dGVzdA==" }] }); },
      upload: async () => { uploads++; throw new Error("Storage unavailable"); },
    });
    assert.equal(requests, 1); assert.equal(reservations, 1); assert.equal(uploads, 1); assert.equal(generated.provenance, "cached_fallback"); assert.ok(generated.errors.some((error) => error.includes("storage upload failed")));
  } finally { if (key === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = key; }
});

test("unbudgeted text models fail closed before reservation or network", async () => {
  assert.doesNotThrow(() => assertBudgetedTextModel("gpt-4.1-mini"));
  assert.throws(() => assertBudgetedTextModel("future-very-expensive-model"), /budgeted allowlist/);
  const usage = emptyUsage();
  await assert.rejects(structuredCall({ schema: z.strictObject({ value: z.string() }), name: "test", model: "future-very-expensive-model", system: "test", content: [], usage }), /budgeted allowlist/);
  assert.equal(usage.reservedUsd, 0); assert.equal(usage.textRequests, 0);
});

test("partial job failure waits for independent successful persistence before rejecting", async () => {
  const saved: number[] = [];
  await assert.rejects(mapLimit([0, 1, 2], 2, async (value) => {
    if (value === 0) throw new Error("One shot failed");
    await new Promise((resolve) => setTimeout(resolve, 2)); saved.push(value); return value;
  }), /One shot failed/);
  assert.deepEqual(saved, [1, 2]);
});
