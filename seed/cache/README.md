# Captured demo batches

No fabricated learning results are checked in. Capture complete real engine outputs only. Both scripts load `.env.local` silently and send `x-canon-mode: live` plus `x-canon-admin-token` from `CANON_ADMIN_TOKEN` when set. An unauthorized/cached response cannot be labeled real evidence.

## Export already generated evidence without API spending

After the orchestrator generates, inspects, reviews, and generates new scenes in live mode:

```sh
npx tsx scripts/cache-demo.ts --capture-existing --batches 3
npx tsx scripts/cache-demo.ts --capture-existing --batch-ids FIRST_ID,SECOND_ID,THIRD_ID
```

`--capture-existing` makes a read-only project request and downloads existing images. It never calls generation, review, or monitor APIs. Default selection is the earliest indexed `--batches` batches (default two). Use `--batch-ids` to exclude incomplete attempts; selected batches remain in original index order. Combining existing export with `--decisions` or `--scenes` is rejected so this mode cannot unexpectedly spend money.

Every selected batch must have exactly six unique shots, successful `openai` or `gemini` generation provenance, live-monitor provenance for every check, no zero-confidence fallback checks, and a drift rate matching its actual flags. Provider and scene order are reconstructed from saved engine traces. Missing/fallback/uncertain evidence causes an error; no real manifest is invented. Persisted creator review states/reasons are retained. Their original review timestamp is explicitly null because the shared Shot contract does not store it.

## Generate and capture new evidence (paid calls)

```sh
npx tsx scripts/cache-demo.ts --confirm-live --batches 2 --decisions seed/review-decisions.json --scenes seed/scenes.json
```

The orchestrator controls all live spending. `--scenes` is optional JSON shaped as an array of batches, each containing exactly six nonempty prompt strings. This supports new angles/actions/lighting between batches rather than repeating scenes. `--decisions` is optional JSON with 1-based `batchIndex` and `shotIndex`, `decision`, and a real inspected `reason` for rejections. Decisions are applied after each batch and before the next generation. Example decisions are syntax only; replace the example reason after inspecting actual images.

The generated batch response must have both `x-canon-mode: live` and `provenance: real_engine`; `live_with_fallback`, cached images, zero-confidence checks, and non-raster images are refused. No counts/checks/drift rates are changed to force improvement.

## Manifest contract

`manifest.json`: `{version:1, projectId, createdAt, provenance:"real_engine", captureMode, batches:[{batch,shots,provenance,rules,rulesSnapshotAt,traces,reviews,imageProvenance,capturedAt}]}`. `batch` and `shots` match shared contracts. Each entry's `rules` includes only IDs in that batch's `rulesApplied`; wording is the current capture-time snapshot. Original applied wording remains in `rule_applied` traces. Later learned rules are never presented as having been applied to earlier batches.

`imageProvenance` records original provider, original URL, SHA256, byte size, MIME type, and local filename. Real raster images live in `images/`, served by the engine at `/api/cache/images/:filename`. Hash filenames prevent an interrupted export from overwriting images used by a previous manifest; the manifest is replaced atomically only after all selected batches pass.

Replay starts from seed rules plus the viewer's signed browser cookie corrections. Captured review/rule history is historical evidence; the engine must not preload later learned rules into an earlier generation. Do not report reduction until genuine captures support it. Preserve a flat or increasing curve if that is what the real engine measures.
