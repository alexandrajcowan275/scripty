import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import postcss from "postcss";

const tokens = new Map<string, string>();
postcss
  .parse(
    readFileSync(new URL("../../styles/tokens.css", import.meta.url), "utf8"),
  )
  .walkDecls((declaration) => {
    tokens.set(declaration.prop, declaration.value);
  });
function color(token: string): string {
  const value = tokens.get(token);
  assert.ok(value, `Missing ${token}`);
  return value.startsWith("var(") ? color(value.slice(4, -1)) : value;
}
function luminance(hex: string) {
  const values = hex
    .slice(1)
    .match(/../g)!
    .map((pair) => parseInt(pair, 16) / 255)
    .map((value) =>
      value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4,
    );
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
function contrast(foreground: string, background: string) {
  const a = luminance(color(foreground)),
    b = luminance(color(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
test("editorial primary and small secondary type meet AA on the cool canvas", () => {
  for (const foreground of [
    "--text",
    "--muted",
    "--muted-strong",
    "--studio-ink-soft",
  ]) {
    assert.ok(
      contrast(foreground, "--background") >= 4.5,
      `${foreground} contrast ${contrast(foreground, "--background")}`,
    );
  }
  assert.ok(contrast("--cool-grey", "--surface") >= 4.5);
});
test("orange memory uses readable text variants while drift and pass retain AA", () => {
  assert.equal(color("--memory-signal"), "#ff8a3d");
  assert.equal(color("--memory"), "#b4520f");
  for (const foreground of ["--memory-ink", "--drift", "--pass"])
    assert.ok(contrast(foreground, "--background") >= 4.5, foreground);
  assert.ok(contrast("--memory-detail", "--memory-fill") >= 4.5);
  assert.ok(contrast("--memory", "--surface") >= 4.5);
  assert.ok(contrast("--memory-code-text", "--code-surface") >= 4.5);
});
test("workspace text and memory labels remain AA on the quiet working surface", () => {
  for (const foreground of [
    "--text",
    "--muted",
    "--muted-strong",
    "--memory-ink",
    "--drift",
  ]) {
    assert.ok(contrast(foreground, "--work-canvas") >= 4.5, foreground);
  }
  assert.ok(contrast("--memory-detail", "--work-memory-fill") >= 4.5);
});
test("the image color grade can only apply to landing and dashboard image layers", () => {
  const styles = postcss.parse(
    readFileSync(new URL("../../styles/ui-v2.css", import.meta.url), "utf8"),
  );
  let found = false;
  styles.walkDecls("filter", (declaration) => {
    if (!declaration.value.includes("--editorial-grade")) return;
    found = true;
    const selector = (declaration.parent as postcss.Rule).selector;
    assert.ok(
      selector
        .split(",")
        .every((part) => /^\s*\.v2-(landing|dashboard)\s/.test(part)),
      selector,
    );
    assert.doesNotMatch(selector, /review|evidence|studio|inspect/);
  });
  assert.ok(found);
});
