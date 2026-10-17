import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import manifest from "../../lib/image-renditions.json";
import { displayImageSource, originalImageSource } from "../image-source";

test("every sample/study/reference display candidate is a shipped WebP, not the preserved original", () => {
  for (const [original, rendition] of Object.entries(manifest)) {
    for (const variant of ["thumbnail", "review"] as const) {
      const display = displayImageSource(original, variant);
      assert.match(display.src, /\.webp$/);
      assert.ok(!display.srcSet?.includes(original));
      assert.equal(
        display.src,
        variant === "thumbnail" ? rendition.thumbnailUrl : rendition.reviewUrl,
      );
      for (const [url, bytes] of [
        [rendition.thumbnailUrl, rendition.thumbnailBytes],
        [rendition.reviewUrl, rendition.reviewBytes],
      ] as const) {
        const file = path.join(process.cwd(), "public", url);
        assert.ok(existsSync(file), `Missing display copy: ${url}`);
        assert.equal(statSync(file).size, bytes);
      }
    }
    assert.equal(originalImageSource(original), rendition.originalUrl);
  }
});

test("thumbnails cannot trigger a full review/original fetch; unknown owned uploads remain unchanged", () => {
  const original = Object.keys(manifest)[0];
  const thumbnail = displayImageSource(original, "thumbnail");
  assert.ok(thumbnail.srcSet);
  assert.ok(!thumbnail.srcSet.includes("1200w"));
  const review = displayImageSource(original, "review", "500px");
  assert.ok(review.srcSet);
  assert.ok(review.srcSet.includes("480w"));
  assert.ok(review.srcSet.includes("1200w"));
  assert.equal(review.sizes, "500px");
  const upload = "/api/productions/owned/reference";
  assert.deepEqual(displayImageSource(upload, "thumbnail"), { src: upload });
  assert.equal(originalImageSource(upload), upload);
  assert.deepEqual(displayImageSource("toString"), { src: "toString" });
});
