# Engine handoff

## Implemented

- Real reference-guided OpenAI Images edits (`gpt-image-1.5`, medium, 1536×1024), configurable `OPENAI_IMAGE_MODEL` (`gpt-image-1.5`, `gpt-image-2`, dated 2 snapshot) and `OPENAI_IMAGE_QUALITY` (low/medium). First character raster plus best accepted shot as extra reference; uploads via existing Supabase adapter. Optional Gemini image fallback on second attempt if configured.
- Every provider call has a 60-second timeout, at most two attempts, pessimistic atomic DB reservation before each paid attempt ($.50 image, $.03 monitor, $.01 rule). No reservation means no AI request. Requires Data's `reserveApiBudget` and budget migration. Batch has a shared 260-second provider deadline, 300-second route budget, six scenes, max concurrency three.
- Vision Responses `text.format` strict JSON Schema generated from Zod, then Zod validation and exact required-key coverage validation. Character attributes plus EVERY active rule are independent checks. Occlusion/unavailable evidence returns uncertain, `pass:false`, confidence zero; never counted as pass. `flagged` is exactly any failure confidence ≥.6; score is weighted confidence of failures divided by all check weights.
- LLM rejection extraction creates ONE short testable rule, merges exact normalized text or explicitly selected semantic equivalent while preserving ID/usage. Prompt ordering is usage descending then newest. Accepted shots stored by DB review API are selected by lowest drift score for future extra references.
- Routes persist batches, shots, reviews, rules, usages and categorized traces. Eval uses Data's verified hand labels, excludes drafts by default; fresh paid recheck requires authorized live mode and returns error if monitor unavailable, rather than success metrics.
- Cached replay reads `seed/cache/manifest.json` real-engine manifest and serves raster images at `/api/cache/images/[filename]`. No global mutable demo state and no API/DB requirement: bounded, signed, compressed HttpOnly cookie stores replay count, viewer reviews and local correction rules. Separate browsers are isolated; refresh survives cold starts. Recorded rules are visible only when their IDs occur in a delivered batch’s rulesApplied; rules learned after a captured batch are not preloaded early. recordedRuleIds metadata distinguishes recorded constraints from browser corrections, and historical trace messages are prefixed [Recorded engine]. Recorded images/checks/prompts/curve remain unchanged; response warnings explain historical replay versus local extraction.
- Production defaults to cached unless `DEMO_MODE=live`. `x-canon-mode:live` cannot override cached environment. If `CANON_ADMIN_TOKEN` set, live access requires matching `x-canon-admin-token`; ordinary public requests still use cached. Response metadata `mode`, `provenance`, `warning`, `usage`, `imageProvenance` is additive to shared contracts.

## No mock outcomes

No fake generation/check/learning outcomes are returned. A missing cache yields the seed project with empty batches and a clear warning, then generation returns409. A live generation fallback produces uncertain checks, explicit `api_error` traces and `live_with_fallback` provenance. Its mathematically unflagged rate must NOT be used as evidence of improvement. Capture script must reject incomplete/fallback runs. Local rejection fallback is explicitly labeled and traced; it is not represented as successful LLM extraction.

## Validation

- `npm ci`: passed.
- `node --import tsx --test tests/engine.test.ts`:9 passed; prompt contents/order, exact/semantic merge, rejection reason mapping, weighted score/threshold, no-network uncertain fallback, signed cookie refresh/tamper/isolation, live/admin gates, worker concurrency, and full cached replay→review→refresh API flow using a temporary test-only fixture.
- `npm run typecheck`: passed.
- `npm run build`: attempted; sandbox blocks Turbopack CSS worker port binding with EPERM.
- `npx next build --webpack`: production build passed and compiled every route. One expected import warning until Data's budget export is merged into this worktree's older `lib/db.ts`; root must run merged build.
- No live calls or credentials used in this worktree. Root controls real runs and total spend.

## Required integration steps

1. Merge Data budget migration/export, then this branch and UI.
2. Set `CANON_SESSION_SECRET` (random32+ characters; server-side service role key is fallback), `CANON_ADMIN_TOKEN`, `OPENAI_API_KEY`, Supabase URL/service role key, model envs above. Optional `OPENAI_MONITOR_MODEL`, `OPENAI_RULE_MODEL` default `gpt-4.1-mini`; `GEMINI_API_KEY`, `GEMINI_IMAGE_MODEL` default `gemini-2.5-flash-image`.
3. Replace SVG reference with actual PNG/JPEG/WebP and update seeded project DB and JSON. SVG is deliberately rejected before any paid image request.
4. Root live-test/capture real baseline and correction on different scenes; baseline always uses full character sheet and existing seed rules. Validate actual anatomy confidence by human inspection. Never claim weight training; this is persistent memory and prompt adaptation.
5. Ensure Next `outputFileTracingIncludes` bundles `./seed/cache/**/*` for API routes; filesystem dynamic reads may need explicit inclusion on Vercel.
6. Production `DEMO_MODE=cached`. Use admin header only in root capture requests. Capture script should refuse `live_with_fallback`.

## Limits

- Cached replay is finite and does not rerender custom prompts; custom prompts return409 in cached mode. After all recorded batches, clear site data for a new replay. Browser correction overlay max12 rules /36 reviews /3800-byte signed cookie, so it stays under browser limits.
- Cached rule extraction is a deterministic local attribute correction. Only live LLM extraction is claimed as AI learning. Cached measurement and local viewer correction are explicitly distinct.
- Live batch sequence allocation uses existing DB unique(project,index); simultaneous live batch requests can conflict before paid work, returning503. Root admin demo is serial.
- An interrupted live DB write can leave an incomplete batch row. Do not use/capture interrupted batches as evidence.

## Official documentation checked

- https://developers.openai.com/api/reference/resources/images/methods/edit — JSON `images:[{image_url}]` accepts data URLs/multiple references; omit input_fidelity for2;1.5 supports high.
- https://developers.openai.com/api/docs/models/gpt-image-1.5 — medium landscape output listed $.05 plus input usage; $.50 attempt reservation is conservative.
- https://developers.openai.com/api/docs/guides/structured-outputs — strict Responses `text.format` schema.
- https://ai.google.dev/gemini-api/docs/image-generation — inlineData reference inputs and IMAGE output.
- https://supabase.com/docs/reference/javascript/rpc — durable budget RPC access. Changelog fetch attempted but tool returned internal error; no Supabase schema edits by engine.
- Vercel Functions skill consulted: default Node runtime, stateless invocations, maxDuration300, explicit filesystem tracing caveat.

## Integration followup

- Normalized monitor evidence now drives BOTH flags and failure traces; an unclear high-confidence raw response cannot emit a confident flag trace.
- Successful image generation followed by failed Storage upload immediately records a storage fallback; it never buys a second generation to solve a storage outage. Independent worker successes finish/persist even if another worker fails.
- Text models are allowlisted to gpt-4.1-mini / gpt-4o-mini and their known dated snapshots; text context/output caps preserve pessimistic per-call reservations. Unknown models fail before reservation/network.
- cacheAvailable metadata distinguishes missing cache from an available cache with no delivered batches.
-13 regression tests and typecheck pass; no real API calls performed. Mock dependency seam exercises paid-generation success/storage failure without real requests.
