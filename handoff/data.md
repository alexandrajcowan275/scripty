# Data and evaluation handoff

## Working

- Supabase migrations create the eight shared-contract tables using text IDs (`mara` stays `mara`), constraints, foreign-key indexes, public-read Storage bucket `shots`, and server-only grants/RLS. Anonymous users cannot read tables or upload images.
- `lib/db.ts` exports all Engine-requested persistence APIs, `getShot`, `uploadShotImage`, `getAcceptedReferences`, `incrementRuleUsage`, and `seedProject`. Zod validates contract inputs/outputs; requests time out after 15 seconds. Missing credentials explain setup. `getProject` reads fresh persisted reviews and learned rules. Shot/check writes are transactional and repeated generation saves preserve creator reviews.
- Persistent API budget cap is fixed at **$24** in SQL. `reserveAiBudget(reservationId, amountUsd)` atomically reserves pessimistic dollars, with an idempotent reservation ledger. Repeating a reservation ID is only for retrying an ambiguous DB request, **never a second paid AI attempt**. Every image, vision, rule call, AI retry, and evaluation attempt needs its own ID and conservative amount. `reserveApiBudget(amountUsd)` creates a fresh random reservation ID. Both return false when budget is exhausted and throw on DB/config failure; callers must fail closed. `getApiBudget()` returns reserved, remaining, and limit. No automatic refunds.
- Seed script loads `.env.local` silently, preserves existing batches/reviews/learned rules, and reloads the project to verify persistence.
- Eval treats **drift as positive**, excludes draft/unverified labels by default, uses the monitor's 0.6 flag threshold, reports missing evidence, and returns null for undefined metrics. A recheck callback lets Engine implement `/api/eval` without circular imports. Duplicate/conflicting labels fail validation. CLI prints a table.
- Cache capture script calls a running live Engine, supports actual scripted creator reviews between batches, downloads real raster images, and records original URLs/hashes/checks/traces/rules/review responses. It preserves measured drift rates. Requires explicit `--confirm-live` and `x-canon-mode: live` response header.

## Commands

From the project root (Node >=22):

```sh
npm ci
npx tsx scripts/seed.ts
node --import tsx --test scripts/test-data.ts
npm run typecheck
npm run build -- --webpack
npx tsx scripts/run-eval.ts --project mara
npx tsx scripts/run-eval.ts --project mara --live-recheck --base-url http://localhost:3000
npx tsx scripts/cache-demo.ts --confirm-live --batches 2 --decisions seed/review-decisions.json
```

`run-eval` defaults to persisted checks without AI spend. `--live-recheck` explicitly invokes the `/api/eval` monitor route and may spend budget. `--shots path.json --labels path.json` evaluates fixtures without DB credentials. `--include-drafts` is explicit exploratory output and must not be reported as verified accuracy. `review-decisions.example.json` shows syntax only: copy and replace the reason after inspecting real shots. Batch and shot indices are 1-based.

Apply all three SQL migrations in filename order before seeding. Root orchestrator owns live migrations and secrets; this worktree never read or copied `.env.local`. Supabase CLI used: `npx --yes supabase@2.121.0`. Local-only RLS-off notes are in `supabase/README.md`; deployed RLS stays on.

## Cache integration contract

`seed/cache/manifest.json`: `{version:1,projectId,createdAt,provenance:"real_engine",batches:[{batch,shots,rules,traces,reviews,imageProvenance,capturedAt}]}`. Images: `seed/cache/images/*`; shot URLs: `/api/cache/images/:filename`. Engine owns the static image route and replay/session state. Its bounded signed browser cookie keeps reviews/rules isolated across browsers and survives cold starts. No server memory store or cached-mode Supabase table was added.

## Verification and limits

Nine focused tests pass, including eval confusion matrix/denominators, draft exclusion, missing evidence, single recheck per shot, duplicate-label rejection, credential errors, malformed checks, fresh review/rule visibility using a mocked PostgREST boundary, and fail-closed budget result/rounding. TypeScript passes. `npm run build -- --webpack` passes. Bare Turbopack `npm run build` hits the environment's port-bind EPERM when spawning its CSS worker; webpack builds the same production app successfully without that worker-port requirement.

Root reported first two migrations applied to the live project. The budget migration still needs applying after merge, followed by seed and live DB/storage tests. No AI calls were made by this agent. `seed/labels.json` deliberately contains exactly three unverified examples, so initial precision/recall/F1 are **N/A**, not invented scores. No real cache or accuracy claims exist until the orchestrator captures images and a human labels them. `/api/eval` is Engine-owned, as agreed. No package/type changes were made.

## Integration follow-up: authorized live scripts and read-only capture

Fixed `scripts/run-eval.ts --live-recheck` to send `recheck:true` and explicit live/admin headers. It now invokes the actual authorized monitor recheck route. `CANON_ADMIN_TOKEN` is read silently from the environment; no token is logged. Cache capture uses the same header helper.

Added `--capture-existing` to export already persisted live batches without calling any generation/review/monitor API. Use `--batches N` (earliest indexed saved batches) or `--batch-ids id1,id2,id3` (original order preserved) to exclude incomplete failed attempts. Existing export rejects `--decisions` and `--scenes`. It restores original shot order and successful image-provider provenance from recorded generation traces, preserves actual creator review state/reasons with honest missing timestamp, includes only that batch's applied rule IDs, and filters unrelated batch traces. Current rule wording is labeled as a capture-time snapshot; original applied wording remains in traces.

For paid generation capture, optional `--scenes path.json` supplies an array of scene sets, each exactly six prompt strings. All captures require exactly six unique shots per batch. The script rejects `live_with_fallback`, unknown/cached image providers, missing successful monitor provenance on existing exports, zero-confidence checks, and drift-rate mismatches. Raster images have hash-based filenames and retain original provider/URL/hash; the manifest is replaced atomically only after the entire capture succeeds.

```sh
npx tsx scripts/cache-demo.ts --capture-existing --batches 3
npx tsx scripts/cache-demo.ts --capture-existing --batch-ids FIRST_ID,SECOND_ID,THIRD_ID
node --import tsx --test scripts/test-data.ts scripts/test-cache.ts
```

All 17 focused tests pass, including complete mocked CLI export/recheck flows, live header behavior, strict six-shot evidence, fallback refusal, persisted scene ordering/review preservation, batch-specific rule/trace history, and existing eval/DB/budget checks. TypeScript and the production webpack build pass. The follow-up made no live calls and did not invent a cache; the root's current provider authentication failure remains external to this data implementation. Root controls all actual generation and inspection.
