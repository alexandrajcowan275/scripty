import { test } from "node:test";
import assert from "node:assert/strict";
import seed from "../seed/mara.json";
import { buildFinalPrompt, localRejectionRule, mergeRule, orderRules } from "../lib/rules";
import { scoreChecks, uncertainChecks, monitorImage, normalizeMonitorChecks, MONITOR_INSTRUCTIONS, MONITOR_VERSION, buildMonitorContent } from "../lib/monitor";
import { assertBudgetedTextModel, emptyUsage, structuredCall } from "../lib/engine-ai";
import { z } from "zod";
import { imageConfiguration, monitorConfiguration, isReasoningMonitor, DEFAULT_IMAGE_MODEL, DEFAULT_MONITOR_MODEL, IMAGE_ATTEMPT_RESERVATION, MONITOR_ATTEMPT_RESERVATION } from "../lib/engine-config";
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
test("local custom corrections preserve creator intent and deduplicate exact notes", () => {
  const reason = "Keep the scarf blue for the flashback; retain its wool texture.";
  const first = localRejectionRule(shot, character, reason, rules);
  assert.equal(first.rule.text, `Creator correction: ${reason}`);
  assert.equal(first.merged, false);
  const repeated = localRejectionRule(shot, character, reason, [...rules, first.rule]);
  assert.equal(repeated.rule.id, first.rule.id);
  assert.equal(repeated.merged, true);
  const changed = localRejectionRule(shot, character, "Keep the scarf green in the dream.", [...rules, first.rule]);
  assert.notEqual(changed.rule.id, first.rule.id);
  assert.ok(changed.rule.text.includes("green"));
  assert.equal(first.rule.text, `Creator correction: ${reason}`);
});
test("a 400-character local continuity note is retained without truncation", () => {
  const reason = "Keep the continuity detail. ".repeat(20).slice(0, 400);
  assert.equal(localRejectionRule(shot, character, reason, []).rule.text, `Creator correction: ${reason.trim()}`);
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
    assert.equal(refreshedData.shots[0].status, "rejected"); assert.equal(refreshedData.rules.length, 4); assert.ok(refreshedData.rules.some((rule: Rule) => rule.id === "captured-applied")); assert.ok(refreshedData.traces.some((trace: { message: string }) => trace.message.startsWith("[Original production]"))); assert.ok(!refreshedData.rules.some((rule: Rule) => rule.id === "captured-only"));
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

test("v2 buried scar invisibility stays uncertain while a visible contrary ring remains a failure", () => {
  const output = [...character.attributes.map((attribute) => ({ key: attribute.key, observed: attribute.expected, pass: true, confidence: .9, note: null, category: null as "attribute_drift" | null })), ...rules.map((rule) => ({ key: `rule:${rule.id}`, observed: rule.text, pass: true, confidence: .9, note: null, category: null as "attribute_drift" | null }))];
  output.find((check) => check.key === "rule:seed-scar")!.observed = "scar over the left eye not visible because character faces away";
  Object.assign(output.find((check) => check.key === "rule:seed-scar")!, { pass: false, confidence: .7, category: "attribute_drift" });
  Object.assign(output.find((check) => check.key === "ring_hand")!, { observed: "right hand unclear but visible silver ring on the LEFT hand", pass: false, confidence: .85, category: "attribute_drift" });
  const normalized = normalizeMonitorChecks(output, character, rules);
  assert.equal(normalized.checks.find((check) => check.key === "rule:seed-scar")!.confidence, .49);
  assert.equal(normalized.checks.find((check) => check.key === "ring_hand")!.confidence, .85);
  assert.deepEqual(normalized.failures.map((failure) => failure.key), ["ring_hand"]);
});

test("v2 orientation prompt requires facing evidence and conditional anatomical mapping", () => {
  assert.equal(MONITOR_VERSION, "canon-monitor-v3");
  assert.match(MONITOR_INSTRUCTIONS, /frontal character facing the viewer, image-right is the character's LEFT/);
  assert.match(MONITOR_INSTRUCTIONS, /facing away from the viewer, image-left is the character's LEFT/);
  assert.match(MONITOR_INSTRUCTIONS, /profile or uncertain orientation must be unclear/);
  assert.match(MONITOR_INSTRUCTIONS, /note must state the observed image side, inferred facing orientation and evidence before the anatomical conclusion/);
  assert.match(MONITOR_INSTRUCTIONS, /Absence of visibility is not proof the attribute is wrong/);
});


test("full replay memory returns actionable409 instead of a generic server failure", () => {
  const state = { v: 1 as const, projectId: "mara", count: 1, reviews: [], rules: Array.from({ length: 13 }, (_, index) => ({ ...rules[0], id: `full-${index}` })) };
  assert.throws(() => sessionCookie(state), (error: unknown) => error instanceof Error && "status" in error && error.status === 409 && /fresh browser session/.test(error.message));
});

test("v3 roles label canonical reference first and score ONLY the second SHOT image", () => {
  const content = buildMonitorContent(character, rules, "data:image/png;base64,REFERENCE", "data:image/png;base64,SHOT");
  const images = content.filter((item) => item.type === "input_image");
  assert.deepEqual(images.map((item) => item.image_url), ["data:image/png;base64,REFERENCE", "data:image/png;base64,SHOT"]);
  assert.match(content[1].text!, /CANONICAL REFERENCE.*do not score this image/);
  assert.match(content[3].text!, /SHOT TO CHECK.*Score ONLY visible evidence/);
  assert.match(MONITOR_INSTRUCTIONS, /IMAGE 2 SHOT TO CHECK is the only image you score/);
  assert.ok(MONITOR_INSTRUCTIONS.length < 4000);
});

test("quality defaults pin Sunburst high and v3 mini within their new reservations", async () => {
  const names = ["OPENAI_IMAGE_MODEL", "OPENAI_IMAGE_QUALITY", "OPENAI_MONITOR_MODEL", "OPENAI_API_KEY"] as const;
  const saved = new Map(names.map((name) => [name, process.env[name]]));
  try {
    for (const name of names) delete process.env[name];
    assert.deepEqual(imageConfiguration(), { model: DEFAULT_IMAGE_MODEL, quality: "high" });
    assert.equal(monitorConfiguration().model, DEFAULT_MONITOR_MODEL);
    assert.equal(monitorConfiguration().version, MONITOR_VERSION);
    assert.equal(isReasoningMonitor(DEFAULT_MONITOR_MODEL), true);
    assert.doesNotThrow(() => assertBudgetedTextModel("gpt-5.4-mini-2026-03-17"));
    assert.equal(IMAGE_ATTEMPT_RESERVATION, .75); assert.equal(MONITOR_ATTEMPT_RESERVATION, .05);
    process.env.OPENAI_API_KEY = "test-only-not-real";
    let payload: { model?: string; quality?: string; images?: unknown[]; input_fidelity?: string } = {}, reserved = 0;
    const generated = await generateImage({ finalPrompt: "scene", referenceImageUrl: "/reference.png", acceptedReferenceUrl: "/accepted.png", fallbackImageUrl: "/fallback.png", filename: "x.png" }, {
      image: async () => "data:image/png;base64,dGVzdA==",
      reserve: async (amount, usage) => { reserved += amount; usage.reservedUsd += amount; },
      request: async (_url, options) => { payload = JSON.parse(String(options.body)); return Response.json({ data: [{ b64_json: "dGVzdA==" }] }); },
      upload: async () => "/stored.png",
    });
    assert.equal(payload.model, DEFAULT_IMAGE_MODEL); assert.equal(payload.quality, "high"); assert.equal(payload.images?.length, 2); assert.equal(payload.input_fidelity, undefined);
    assert.equal(generated.imageModel, DEFAULT_IMAGE_MODEL); assert.equal(generated.imageQuality, "high"); assert.equal(reserved, .75);
    process.env.OPENAI_IMAGE_QUALITY = "max"; assert.throws(imageConfiguration, /budgeted allowlist/);
  } finally { for (const name of names) { const value = saved.get(name); if (value === undefined) delete process.env[name]; else process.env[name] = value; } }
});

test("cinematic visual language and STORY constraints remain equal across baseline and learned prompts", () => {
  const baseline = buildFinalPrompt("A platform scene", character, rules);
  const adapted = buildFinalPrompt("A new doorway scene", character, [...rules, { ...rules[0], id: "learned-ring", text: "Keep the silver ring on the anatomical right hand." }]);
  for (const prompt of [baseline, adapted]) {
    assert.match(prompt, /ACTIVE STORY CONSTRAINTS/); assert.match(prompt, /35mm lens on Super35 at f\/2.8/); assert.match(prompt, /natural motivated scene light/); assert.match(prompt, /restrained cinematic grade, real textures and subtle film grain/);
    for (const attribute of character.attributes) assert.ok(prompt.includes(attribute.expected));
  }
});
