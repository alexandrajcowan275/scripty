import assert from "node:assert/strict";
import test from "node:test";
import { isStudioRoute, publicNavigation } from "../lib/navigation";

test("public information stays outside the working Studio shell", () => {
  for (const path of ["/", "/#how", "/developers", "/developers?example=correct", "/evidence", "/evidence#method", "/api/config", "/newspaper"])
    assert.equal(isStudioRoute(path), false, path);
  for (const path of ["/dashboard", "/dashboard?view=all", "/productions", "/new", "/p/mara", "/p/mara/evidence", "/p/owned/shot/one"])
    assert.equal(isStudioRoute(path), true, path);
});

test("public navigation separates information from the single dashboard entry", () => {
  assert.deepEqual(publicNavigation.map(({label,href})=>[label,href]), [
    ["Product", "/#how"], ["API", "/developers"], ["Evidence", "/evidence"], ["Open studio", "/dashboard"],
  ]);
  assert.deepEqual(publicNavigation.filter(({href})=>isStudioRoute(href)).map(({label})=>label), ["Open studio"]);
});
