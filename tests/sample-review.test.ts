import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import seed from "../seed/mara.json";
import { GET as sampleGet } from "../app/api/productions/sample/route";
import { POST as reviewPost } from "../app/api/shot/[id]/review/route";
import { cachedProject } from "../lib/engine-cache";
import type { Rule, Shot } from "../lib/types";

test("free and authorized sample corrections preserve recorded memory across refresh and deduplication", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "scripty-sample-review-"));
  const cwd = process.cwd();
  const names = ["DEMO_MODE", "CANON_PUBLIC_GENERATION_ENABLED", "SCRIPTY_ACCESS_CODE", "OPENAI_RULE_MODEL"] as const;
  const saved = new Map(names.map(name => [name, process.env[name]]));
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => { networkCalls++; throw new Error("Network forbidden in sample regression test"); };
  const reason = "Keep the ring on the right hand.";
  const recordedRule: Rule = { id: "original-ring", projectId: "mara", text: `Creator correction: ${reason}`, attributeKey: "ring_hand", source: "rejection", createdAt: "2026-10-16T12:00:00.000Z", timesApplied: 18 };
  const batch = { id: "recorded-take", projectId: "mara", index: 1, rulesApplied: [recordedRule.id], driftRate: 1 / 6, createdAt: recordedRule.createdAt };
  const shots: Shot[] = Array.from({ length: 6 }, (_, index) => ({ id: `recorded-${index}`, projectId: "mara", batchId: batch.id, scenePrompt: "A recorded scene", finalPrompt: "The original prompt", imageUrl: "/recorded.png", checks: [{ key: "ring_hand", expected: "right", observed: index ? "right" : "left", pass: !!index, confidence: .9 }], driftScore: index ? 0 : .9, flagged: !index, status: "pending" }));
  try {
    await mkdir(path.join(directory, "seed/cache"), { recursive: true });
    await writeFile(path.join(directory, "seed/cache/manifest.json"), JSON.stringify({ version: 1, projectId: "mara", provenance: "real_engine", createdAt: batch.createdAt, batches: [{ batch, shots, rules: [recordedRule], traces: [] }] }));
    process.chdir(directory);
    process.env.DEMO_MODE = "cached";
    process.env.CANON_PUBLIC_GENERATION_ENABLED = "true";
    process.env.SCRIPTY_ACCESS_CODE = "sample-test-only";
    // Exercise the authorized extraction fallback without a budget reservation,
    // database mutation, API key, or billable provider call.
    process.env.OPENAI_RULE_MODEL = "forbidden-test-model";
    for (const authorized of [false, true]) {
      const sample = await sampleGet(new Request("http://localhost/api/productions/sample"));
      assert.equal(sample.status, 200);
      let cookie = sample.headers.get("set-cookie")!.split(";")[0];
      let visitorRuleId: string | undefined;
      for (let repeat = 0; repeat < 2; repeat++) {
        const headers: Record<string, string> = { cookie, "content-type": "application/json" };
        if (authorized) headers.authorization = "Bearer sample-test-only";
        const reviewed = await reviewPost(new Request("http://localhost/api/shot/recorded-0/review", { method: "POST", headers, body: JSON.stringify({ projectId: "mara", decision: "reject", reason }) }), { params: Promise.resolve({ id: "recorded-0" }) });
        assert.equal(reviewed.status, 200);
        const receipt = await reviewed.json();
        assert.notEqual(receipt.newRule.id, recordedRule.id);
        assert.equal(receipt.merged, repeat === 1);
        if (visitorRuleId) assert.equal(receipt.newRule.id, visitorRuleId);
        visitorRuleId = receipt.newRule.id;
        cookie = reviewed.headers.get("set-cookie")!.split(";")[0];
        const refreshed = await cachedProject(new Request("http://localhost", { headers: { cookie } }), seed.project.id);
        assert.ok(refreshed);
        assert.deepEqual(refreshed.data.rules.find(rule => rule.id === recordedRule.id), recordedRule);
        assert.ok(refreshed.recordedRuleIds.includes(recordedRule.id));
        assert.equal(refreshed.state.rules.length, 1);
        const visitorTrace = refreshed.data.traces.find(trace => trace.id === `local-${visitorRuleId}`);
        assert.equal(visitorTrace?.message, `Browser-saved sample correction: ${receipt.newRule.text}`);
        assert.doesNotMatch(visitorTrace!.message, /no AI call|local extraction/);
        assert.equal(refreshed.data.shots[0].status, "rejected");
        assert.deepEqual(refreshed.data.shots[0].checks, shots[0].checks);
        assert.deepEqual(refreshed.data.batches, [batch]);
      }
      const isolated = await cachedProject(new Request("http://localhost"), "mara", true);
      assert.equal(isolated!.state.rules.length, 0);
      assert.equal(isolated!.data.shots[0].status, "pending");
    }
    assert.equal(networkCalls, 0);
  } finally {
    process.chdir(cwd);
    globalThis.fetch = originalFetch;
    for (const name of names) {
      const value = saved.get(name);
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});
