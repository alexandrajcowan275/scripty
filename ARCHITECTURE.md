# Scripty architecture

Scripty is a Next.js App Router application. Route handlers coordinate reference-conditioned image generation, a separate structured vision monitor and persistent production memory. Supabase Postgres and Storage are accessed only by the server. There is no GPU server, training job or external queue.

## Boundaries

- UI: Studio, individual Review, Memory update, Progress and Blind Eval. The Design thread owns `/app` except `/app/api`, `/components`, `/styles` and `/public`.
- API: `/app/api` validates inputs, checks ownership/access, reserves budget, invokes providers and persists evidence.
- Engine: `lib/generate.ts`, `monitor.ts`, `rules.ts`; provider JSON is validated with Zod. Explicit uncertainty/failure provenance prevents fallback images from becoming successful new evidence.
- Persistence: `lib/db.ts`, `productions.ts`, `workspace.ts`, `human-eval.ts`; migrations live in `/supabase`.
- Sample: immutable original batches, local PNGs and a validated manifest in `/seed/cache`.

## Learning and reach

1. The creator submits accept/reject with an editable note (at most 400 characters).
2. Authorized live rejection calls a structured mini model for one visually testable constraint, proposed attribute and existing-rule merge ID. An exact-text local fallback preserves the note if extraction fails; provenance distinguishes it from AI extraction.
3. Memory writes are serialized per project. Semantic extraction can reuse a rule ID; normalized exact outputs are also deduplicated atomically. Application counts survive merges. Distinct constraints are not silently discarded just because they share an attribute.
4. Future prompts contain the character sheet and ordered active rules. Accepted images can provide an extra visual reference.
5. Future monitor requests include the reference, shot and each required canon/rule check. Every required key must appear exactly once. Anatomical side ambiguity remains uncertain, not a confident defect.
6. Re-checking appends `monitor_runs`; it never replaces original checks or batch rates. The UI can display the latest run separately.
7. Repair creates new shot IDs and stores `shot_repairs` lineage. Only selected currently flagged sources are eligible; unflagged IDs are rejected. Originals and their reviews remain available.

This is production-memory adaptation, not model-weight training. Contradictory creator constraints may still need manual canon editing; no general conflict-resolution or causal improvement claim is made.

## Data model

Original tables: projects → characters → attributes; projects → batches → shots → attribute_checks; projects → rules/traces. Production settings bind a project to an HMAC-derived browser-owner hash. Immutable character versions preserve earlier references and canon.

Additive tables:

| Table | Purpose |
| --- | --- |
| `monitor_runs` | Owner-scoped append-only checks, rule IDs, checker model/version and timestamp |
| `shot_repairs` | New shot → original source lineage, owner/project scope |
| `human_labels` | Append-only human yes/no/unclear judgments and frozen model prediction |
| `api_budget_v2` | Reported historical baseline, usage-derived new spend, outstanding holds, $40 cap |
| `api_attempts` | Unique preflight reservation, production/verification scope, returned token usage and settlement |

The original budget tables remain unchanged for auditability. No historical data is deleted by the new migration.

## Sample isolation

Mara's original four takes always retain 2/6, 0/6, 0/6 and 1/6 flagged shots. Public sample reviews use a signed browser cookie. New authorized rechecks and repairs are separately owner-scoped; sample repairs are returned as `repairShots`, not substituted into the original 24-image history. The free sample falls back to its local artifacts when database enrichment is unavailable.

## Blind evaluation

Blind questions contain image/reference URLs, shot/attribute IDs and the expected constraint, but no model verdict. The UI collects a human judgment first. Each label stores the then-current model check, so later recalibration/rechecks cannot retroactively inflate agreement. Revising a label appends a record; the latest judgment per browser/project/shot/attribute is evaluated. Unclear human judgments are stored but excluded from the binary denominator.

`POST /api/eval` is free: it reads only `source=human_blind` records for the requesting owner. Seed drafts never enter this endpoint. Drift is the positive class; a monitor flag is a failing check with confidence ≥0.6. The API returns TP/FP/TN/FN, precision, recall, F1 and honest denominators. Undefined denominators yield null. `metricsReady` requires 20 scored labels; below that the UI should show “—” for headline accuracy. Browser-entered labels are human submissions, not expert-certified ground truth.

Human disagreements also become scoped checker-calibration context for later monitoring. They preserve the same canon, rules and confidence threshold; the model is instructed to inspect each new shot independently. They never alter image-generation constraints or retroactively change frozen eval predictions. This is another prompt adaptation, not automatic truth or weight training.

## Security

All public-schema tables have RLS enabled. Anonymous and authenticated database roles cannot read/write these internal tables. Server-only service credentials perform authorized operations. Database functions use security invoker, explicit privileges and an empty search path.

Private references are MIME-sniffed PNG/JPEG/WebP, up to 4 MB, with non-overwriting upload paths. Owner-bound signed upload tickets expire after one hour. Image fetches allow only local files and configured HTTPS origins; redirects and path escapes are rejected. Historical reference versions remain accessible to their owner.

The owner cookie is signed, HttpOnly and Secure in production. Cross-origin mutations are denied. Live actions additionally require `SCRIPTY_ACCESS_CODE`, exchanged for a signed 24-hour HttpOnly/SameSite=Strict cookie, or a bearer access code for developer calls. Rotating the code invalidates prior access sessions. The `CANON_PUBLIC_GENERATION_ENABLED` switch can disable all public paid actions. The operator token remains server-only.

Access code attempts, reference upload/creation, canon suggestions, rechecks and repairs use persistent per-owner/IP hourly limits. New-production generation has an atomic in-flight lease and lifetime attempt cap. These are bounded hackathon capacity controls, not a multi-tenant billing system.

## Budget accounting

The authorized cap is $40. The founder-reported historical provider spend is $2.05; its source is recorded. Old pessimistic reservations are preserved and are not subtracted again as actual spend.

Before every provider attempt (including retry), a database transaction locks the budget row, checks baseline + settled usage estimate + held reservations + new hold against $40, then inserts a unique attempt. Verification attempts also check their aggregate settled cost plus held reservations against $6. The application fails closed if accounting is unavailable.

Completed OpenAI responses settle from their returned token counts and pinned standard model prices. Sunburst text/image inputs have separate rates; unknown modality split uses the higher input rate. Cached-input discounts are ignored conservatively. Unknown models or missing usage retain their hold. Failed requests/timeouts retain a hold because billing is ambiguous. Settlement failure never triggers another paid generation. The provider dashboard remains authoritative for actual invoices.

Pricing sources checked October 17, 2026: [Sunburst](https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst), [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini), [GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini). Prices are implemented in `lib/pricing.ts`; observed per-image cost is a mean from completed requests, never a fabricated fixed quote.

## Failures and release process

Provider requests have timeouts and bounded retries. Generation fallback is explicit; it cannot enter the immutable real-image cache as a successful new shot. Failed monitoring produces uncertain checks. Repair failures preserve the source. Partial rechecks return per-shot errors rather than reporting complete evaluation.

Main coordinates page commits from Design, runs `npm test` and `npm run build`, deploys the existing `archer-rag-dev/canon` project and verifies the public alias. No public repository conversion or external submission is performed. Code freeze: 8am PT; official deadline: 11am PT on October 17.
