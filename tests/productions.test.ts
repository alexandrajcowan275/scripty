import { shotSchema, batchSchema, traceSchema } from "../lib/db";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  productionOwner,
  referenceTicket,
  readReferenceTicket,
  rasterType,
  productionInput,
  ownedProduction,
} from "../lib/productions";
process.env.CANON_SESSION_SECRET = "production-access-test-secret";
test("production ownership is a signed HttpOnly cookie and fails closed on tampering", () => {
  const owner = productionOwner(new Request("https://scripty.test"), true);
  assert.match(owner.cookie!, /HttpOnly; SameSite=Lax/);
  const cookie = owner.cookie!.split(";")[0];
  assert.equal(
    productionOwner(
      new Request("https://scripty.test", { headers: { cookie } }),
    ).hash,
    owner.hash,
  );
  assert.throws(
    () =>
      productionOwner(
        new Request("https://scripty.test", {
          headers: { cookie: cookie + "x" },
        }),
      ),
    /browser/,
  );
  assert.throws(
    () => productionOwner(new Request("https://scripty.test")),
    /browser/,
  );
});
test("generated reference tickets are owner-bound and tamper-resistant", () => {
  const id = "7e14883b-42a9-4e0e-b25f-335f73498557";
  const ticket = referenceTicket({
    id,
    path: `${id}/reference.png`,
    ownerHash: "first-owner",
  });
  assert.equal(readReferenceTicket(ticket, "first-owner").id, id);
  assert.throws(
    () => readReferenceTicket(ticket, "second-owner"),
    /reference again/,
  );
  assert.throws(
    () => readReferenceTicket(ticket + "f", "first-owner"),
    /no longer/,
  );
});
test("raster sniffing rejects SVG and disguised active content", () => {
  assert.equal(rasterType(Buffer.from('<svg onload="alert(1)"></svg>')), null);
  assert.equal(
    rasterType(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])),
    "image/png",
  );
  assert.equal(rasterType(Buffer.from("not an image of a person")), null);
});
test("new productions require their own canon and exactly six nonempty scenes", () => {
  const input = {
    name: "Night Shift",
    characterName: "Ada",
    attributes: ["red wool scarf"],
    scenePrompts: Array(6).fill("Walk beside a river"),
  };
  assert.equal(productionInput.parse(input).characterName, "Ada");
  assert.equal(
    productionInput.safeParse({ ...input, attributes: [] }).success,
    false,
  );
  assert.equal(
    productionInput.safeParse({ ...input, scenePrompts: ["only one"] }).success,
    false,
  );
});
test("missing production ownership stops before any database access", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw new Error("Unexpected network");
  };
  try {
    await assert.rejects(
      ownedProduction(
        new Request("https://scripty.test"),
        "7e14883b-42a9-4e0e-b25f-335f73498557",
      ),
      /browser/,
    );
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("public paid generation is disabled by default and origin checks use the visible Host", async () => {
  const { checkOrigin, requireGenerationCapacity } = await import(
    "../lib/productions"
  );
  const previous = process.env.CANON_PUBLIC_GENERATION_ENABLED;
  delete process.env.CANON_PUBLIC_GENERATION_ENABLED;
  try {
    assert.throws(() => requireGenerationCapacity(), /Upload an image/);
    assert.throws(() => requireGenerationCapacity(true), /saved/);
  } finally {
    if (previous) process.env.CANON_PUBLIC_GENERATION_ENABLED = previous;
  }
  assert.doesNotThrow(() =>
    checkOrigin(
      new Request("http://localhost:3032", {
        headers: { host: "127.0.0.1:3032", origin: "http://127.0.0.1:3032" },
      }),
    ),
  );
  assert.throws(
    () =>
      checkOrigin(
        new Request("https://scripty.test", {
          headers: { host: "scripty.test", origin: "https://other.test" },
        }),
      ),
    /directly/,
  );
});

test("sample opens all four original takes without outbound requests", async () => {
  const original = globalThis.fetch;
  let requests = 0;
  globalThis.fetch = async () => {
    requests++;
    throw new Error("Unexpected outbound request");
  };
  try {
    const { GET } = await import("../app/api/productions/sample/route");
    const response = await GET(
      new Request("https://scripty.test/api/productions/sample"),
    );
    const sample = await response.json();
    assert.equal(response.status, 200);
    assert.equal(sample.batches.length, 4);
    assert.equal(sample.shots.length, 24);
    assert.deepEqual(
      sample.batches.map(
        (batch: { id: string }) =>
          sample.shots.filter(
            (shot: { batchId: string; flagged: boolean }) =>
              shot.batchId === batch.id && shot.flagged,
          ).length,
      ),
      [2, 0, 0, 1],
    );
    assert.equal(requests, 0);
  } finally {
    globalThis.fetch = original;
  }
});

test("fresh database reads retain the original scene order despite concurrent random shot IDs", async () => {
  const { orderShotsForReview } = await import("../lib/shot-order");
  const manifest = await import("../seed/cache/manifest.json");
  const entries = manifest.default.batches;
  const shots = entries
    .flatMap((entry) => entry.shots)
    .map((shot) => shotSchema.parse(shot));
  const reversed = [...shots].reverse();
  const result = orderShotsForReview(
    reversed,
    entries.map((entry) => batchSchema.parse(entry.batch)),
    entries
      .flatMap((entry) => entry.traces)
      .map((trace) => traceSchema.parse(trace)),
  );
  assert.deepEqual(
    result.map((shot) => shot.id),
    shots.map((shot) => shot.id),
  );
  assert.equal(reversed[0].id, shots.at(-1)!.id);
});

test("sample corrections cannot overwrite the original engine rule or its provenance", async () => {
  const { GET } = await import("../app/api/productions/sample/route");
  const { POST } = await import("../app/api/shot/[id]/review/route");
  const initial = await GET(
    new Request("https://scripty.test/api/productions/sample"),
  );
  const sample = await initial.json();
  const original = sample.rules.find(
    (rule: { source: string }) => rule.source === "rejection",
  );
  const reviewed = await POST(
    new Request(
      "https://scripty.test/api/shot/1fc48122-2b25-4841-b588-5554298bd339/review",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          cookie: initial.headers.get("set-cookie")!.split(";")[0],
        },
        body: JSON.stringify({
          decision: "reject",
          reason: "Mara always wears a silver ring on her RIGHT hand.",
        }),
      },
    ),
    { params: Promise.resolve({ id: "1fc48122-2b25-4841-b588-5554298bd339" }) },
  );
  assert.equal(reviewed.status, 200);
  const correction = await reviewed.json();
  assert.notEqual(correction.newRule.id, original.id);
  const refreshed = await GET(
    new Request("https://scripty.test/api/productions/sample", {
      headers: { cookie: reviewed.headers.get("set-cookie")!.split(";")[0] },
    }),
  );
  const data = await refreshed.json();
  assert.equal(
    data.rules.find((rule: { id: string }) => rule.id === original.id).text,
    original.text,
  );
  assert.ok(data.recordedRuleIds.includes(original.id));
  assert.ok(!data.recordedRuleIds.includes(correction.newRule.id));
});

test("character versions affect current canon without mutating the original character", async () => {
  const { productionCharacter } = await import("../lib/productions");
  const base = {
    id: "char",
    name: "Vera",
    referenceImageUrl:
      "/api/productions/7e14883b-42a9-4e0e-b25f-335f73498557/reference",
    attributes: [
      { key: "canon_1", label: "Scarf", expected: "red wool scarf", weight: 1 },
    ],
  };
  const old = JSON.stringify(base);
  const version = "11eb4da9-2284-4e5c-8900-57fb862c93a3";
  const current = productionCharacter(base, {
    character_version_id: version,
    current_character: {
      name: "Vera Night",
      attributes: [
        {
          key: "canon_1",
          label: "Scarf",
          expected: "blue wool scarf",
          weight: 1,
        },
      ],
    },
  });
  assert.equal(current.name, "Vera Night");
  assert.equal(current.attributes[0].expected, "blue wool scarf");
  assert.match(current.referenceImageUrl, new RegExp("v=" + version));
  assert.equal(JSON.stringify(base), old);
});
