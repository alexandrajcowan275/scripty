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

## Monitor calibration v2

`MONITOR_VERSION = "canon-monitor-v2"` is exported and included in batch check/flag trace messages and monitor results. `MONITOR_INSTRUCTIONS` explicitly requires observed image side, inferred facing orientation, and anatomical evidence in side-check notes. Frontal and back-facing coordinate mappings are conditional; profile/ambiguous views remain uncertain rather than applying a blanket mapping. Occlusion is not visual proof of a failure. Character sheet expectations and the confidence>=.6 flag threshold are unchanged.

Uncertainty phrases anywhere in the observed text (including “scar over the left eye not visible”) normalize to confidence<=.49. A separate concrete positive contradictory clause remains actionable, e.g. “right hand unclear but visible silver ring on the LEFT hand.” Both normalized shot flags and failure traces use the same evidence.

Calibration responds to root human inspection of the first real baseline; it is monitor calibration, not learned generator improvement. Preserve original baseline measurements, then compare rechecked baseline and later batches under this frozen monitor version. Root owns any paid recheck and generation. Engine performed no paid calls.15 focused regression tests and typecheck pass, including buried scar invisibility and orientation-prompt invariants.

## Current configuration: quality images and final monitor v3

User steering names the product Scripty; repository paths, database IDs and environment prefixes remain Canon. Prompt heading is now ACTIVE STORY CONSTRAINTS. Both baseline and adapted prompts retain the entire character sheet and identical cinematic guidance:35mm lens / Super35 / f/2.8, natural motivated scene light, restrained grade, real textures and subtle grain.

Current defaults supersede earlier handoff defaults:

- `OPENAI_IMAGE_MODEL=gpt-image-2.5-sunburst-2026-09-08`, `OPENAI_IMAGE_QUALITY=high`. Sunburst alias and dated snapshot are allowlisted; low/medium/high accepted for2.5 (other allowlisted image models remain low/medium). Every image attempt pessimistically reserves $.75. Same60s timeout and max two attempts; no baseline weakening.
- `OPENAI_MONITOR_MODEL=gpt-5.4-mini-2026-03-17`; alias also allowed. Uses Responses strict structured output, reasoning.effort=low, max_output_tokens4800,32k text cap and at most two images; every monitor attempt reserves $.05. Rule extraction remains gpt-4.1-mini,600 output cap and $.01 reservation.
- Frozen `MONITOR_VERSION=canon-monitor-v3`. Labeled IMAGE1 is the canonical character reference, IMAGE2 is SHOT TO CHECK. The prompt instructs identity/feature comparison against reference while scoring ONLY visible SHOT evidence. Frontal/back/profile orientation and uncertainty rules fromv2 remain unchanged, as do sheet expectations and confidence>=.6 threshold.
- Each new batch traces exact image model/quality and monitor model/version; each generated shot records actual provider model/quality (including fallback distinction), and check traces record monitor model/version. Batch response includes configuration metadata.

Root must update existing model/quality environment overrides: old explicitly configured values otherwise override these defaults. Root owns the first known-scar-correct/ring-wrong v3 spot check, transparent baseline recheck, quality spot checks, generation and cache recapture. v1/v2 outputs must remain retained and calibration must never be pitched as generator learning. v3 is the final tuning attempt under the user’s timebox.

18 focused tests + typecheck pass, including labeled image order/score-only role invariants, pinned Sunburst-high request body and$.75 mock reservation, default v3 mini/.05 configuration, and equal visual-language constraints before/after memory. No paid API calls made by Engine. Current official docs checked: https://developers.openai.com/api/docs/models/gpt-5.4-mini (image input, Responses, structured output, low reasoning,$.75/$4.50 per1M,2026-03-17 snapshot), https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst (2026-09-08 snapshot), https://developers.openai.com/api/docs/guides/image-prompting (Sunburst for demanding quality).
