import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Batch, Rule, Shot, TraceEvent } from "@/lib/types";
import {
  pendingReviewShots,
  dashboardActivity,
  lastProductionActivity,
  productionTotals,
  ringMilestone,
} from "./dashboard-data";
import type { ProductionData } from "./data";

const fixture = JSON.parse(
  readFileSync(
    new URL("../../seed/cache/manifest.json", import.meta.url),
    "utf8",
  ),
) as {
  batches: {
    batch: Batch;
    shots: Shot[];
    rules: Rule[];
    traces: TraceEvent[];
  }[];
};
const project = JSON.parse(
  readFileSync(new URL("../../seed/mara.json", import.meta.url), "utf8"),
).project;
const mara: ProductionData = {
  project,
  batches: fixture.batches.map((item) => item.batch),
  shots: fixture.batches.flatMap((item) => item.shots),
  rules: fixture.batches.at(-1)!.rules,
  traces: fixture.batches.flatMap((item) => item.traces),
};

test("dashboard totals count real original take checks, distinct flagged shots, and learned rules", () => {
  assert.deepEqual(productionTotals([mara]), {
    checks: 162,
    flagged: 3,
    learned: 1,
  });
  assert.deepEqual(
    mara.batches.map((batch) => Math.round(batch.driftRate * 100)),
    [33, 0, 0, 17],
  );
});
test("duplicate projects, duplicate shots and separate repaired/rechecked artifacts do not inflate totals", () => {
  const duplicate = {
    ...mara,
    shots: [...mara.shots, mara.shots[0]],
    repairShots: mara.shots,
    monitorRuns: [{ checks: mara.shots[0].checks }],
  } as ProductionData;
  assert.deepEqual(
    productionTotals([mara, duplicate]),
    productionTotals([mara]),
  );
});
test("only actual supplied owned production data is aggregated", () => {
  const owned: ProductionData = {
    ...mara,
    project: { ...mara.project, id: "owned-production" },
    rules: [],
    traces: [],
  };
  assert.deepEqual(productionTotals([mara, owned]), {
    checks: 324,
    flagged: 6,
    learned: 1,
  });
  assert.deepEqual(productionTotals([]), { checks: 0, flagged: 0, learned: 0 });
});
test("ring milestone is based on first applied learned rule, never a hardcoded take or invented timestamp", () => {
  assert.equal(ringMilestone(mara)?.firstApplied, 1);
  assert.equal(ringMilestone(mara)?.position, 0.5);
  assert.equal(ringMilestone({ ...mara, rules: [] }), null);
  assert.equal(
    ringMilestone({
      ...mara,
      batches: mara.batches.map((batch) => ({ ...batch, rulesApplied: [] })),
    }),
    null,
  );
});
test("activity keeps last eight actual events, deduplicates trace IDs, and links flagged shots to Review", () => {
  const rows = dashboardActivity([mara, mara]);
  assert.equal(rows.length, 8);
  assert.equal(new Set(rows.map((row) => row.event.id)).size, 8);
  assert.ok(
    rows.every(
      (row, index) =>
        index === 0 ||
        Date.parse(rows[index - 1].event.createdAt) >=
          Date.parse(row.event.createdAt),
    ),
  );
  const flag = rows.find((row) => row.event.type === "flag")!;
  assert.equal(flag.shot, "T4·S05");
  assert.match(flag.href, /^\/p\/mara\/shot\//);
  assert.match(flag.detail, /0\.83/);
  assert.equal(
    rows.some((row) => row.label === "Accepted"),
    false,
  );
  assert.ok(rows.some((row) => row.href.includes("?take=")));
});
test("a generation mentioning accepted references is not an accepted event; explicit review trace is", () => {
  const trace = mara.traces[0];
  const events: TraceEvent[] = [
    {
      ...trace,
      id: "reference",
      type: "generate",
      message: "accepted_reference=false",
    },
    {
      ...trace,
      id: "review",
      type: "check",
      message: "Creator accepted this shot.",
      shotId: mara.shots[0].id,
    },
  ];
  assert.deepEqual(
    dashboardActivity([{ ...mara, traces: events }]).map((row) => row.label),
    ["Accepted"],
  );
});
test("production activity uses recorded take/trace times only", () => {
  const latest = lastProductionActivity(mara);
  assert.ok(
    latest &&
      [
        ...mara.batches.map((batch) => batch.createdAt),
        ...mara.traces.map((trace) => trace.createdAt),
      ].includes(latest),
  );
  assert.equal(
    lastProductionActivity({ ...mara, batches: [], traces: [] }),
    undefined,
  );
});

test("Home excludes decided flags while preserving historical evidence", () => {
  const flagged = mara.shots.filter((shot) => shot.flagged);
  assert.ok(flagged.length >= 3);
  const data = {
    ...mara,
    shots: flagged.map((shot, index) => ({
      ...shot,
      status: (index === 0
        ? "pending"
        : index === 1
          ? "accepted"
          : "rejected") as Shot["status"],
    })),
  };
  const queue = pendingReviewShots([data, data]);
  assert.deepEqual(
    queue.map((item) => item.shot.id),
    [flagged[0].id],
  );
  assert.equal(
    data.shots.filter((shot) => shot.flagged).length,
    flagged.length,
  );
});
