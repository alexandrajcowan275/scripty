# Captured demo batches

No fabricated learning results are checked in. Generate real batches with the running engine using `npx tsx scripts/cache-demo.ts --confirm-live --batches 2 --decisions seed/review-decisions.json`. This spends API budget; the orchestrator controls live runs.

`manifest.json` format: `{version:1, projectId, createdAt, provenance:"real_engine", batches:[{batch, shots, rules, traces, reviews, imageProvenance, capturedAt}]}`. Each `batch` and `shot` is the shared contract. `reviews` are the actual scripted decisions and API responses; `rules` are a snapshot after those reviews. `imageProvenance` records original URL, hash, byte size, and local filename. Real raster images live in `images/`, served by the engine at `/api/cache/images/:filename`.

Engine responses must include `x-canon-mode: live` for capture. This prevents accidentally capturing cached fixtures as live evidence. Recorded drift rates and checks are never modified. The script supports a JSON review sequence with 1-based `batchIndex` and `shotIndex`, `decision`, and optional `reason`. Rejections should come from actual visual inspection. Review decisions are applied after that batch and before the next generation so later batches use real learned rules.

Do not report a reduction until real captures support it. If the measured curve is flat or increases, preserve the actual result.
