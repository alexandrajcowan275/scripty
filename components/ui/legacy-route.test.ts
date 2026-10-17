import test from "node:test";
import assert from "node:assert/strict";
import { legacyStudioTarget } from "./legacy-route";

test("legacy Studio preserves the owned production, take and one-shot start intent", () => {
  assert.equal(legacyStudioTarget(), "/p/mara");
  assert.equal(
    legacyStudioTarget({ id: "owned-123", start: "1", take: "batch-456" }),
    "/p/owned-123?start=1&take=batch-456",
  );
  for (const view of ["progress", "evidence"]) {
    assert.equal(
      legacyStudioTarget({ id: "owned-123", view, take: "batch-456" }),
      "/p/owned-123/evidence?take=batch-456",
    );
  }
});

test("legacy query strings cannot become an external redirect or add route segments", () => {
  assert.equal(
    legacyStudioTarget({
      id: "https://elsewhere.invalid/a?x=1",
      take: "a&start=1",
    }),
    "/p/https%3A%2F%2Felsewhere.invalid%2Fa%3Fx%3D1?take=a%26start%3D1",
  );
  assert.equal(
    legacyStudioTarget({ id: ["one", "two"], view: ["progress"] }),
    "/p/mara",
  );
});
