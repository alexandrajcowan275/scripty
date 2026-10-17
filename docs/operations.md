# Operations

## Local startup

On the configured workstation: `cd ~/canon && npm run dev` → http://localhost:3000. A new checkout needs Node24, `npm ci`, and `.env.example` copied privately to `.env.local`. The sample requires no AI credentials. Build with `npm run build`; serve that build with `npm start`.

## Private live access

Set `SCRIPTY_ACCESS_CODE` and `CANON_PUBLIC_GENERATION_ENABLED=true` in the project-root `.env.local`. The configured workstation already has a private code there. Do not paste it into docs, URLs, screenshots or client-prefixed variables.

For production, set the same server-only variables in [Vercel → canon → Environment Variables](https://vercel.com/archer-rag-dev/canon/settings/environment-variables), scope **Production**, then redeploy. Keep OpenAI/Supabase service/session credentials private. `POST /api/access` exchanges the code for a signed24-hour HttpOnly session. API clients can use a bearer code while retaining the separate production-owner cookies.

## Ownership and recording

Productions and blind labels belong to a signed30-day browser-owner cookie. Clearing that cookie loses browser access; accounts/cross-device recovery are outside this release. Record Mara in a separate clean browser session to avoid old QA notes. Preserve existing sessions and historical evidence. The original sample always has24images/four takes; new checks and repairs are separate.

## Accounting

The latest founder-reported OpenAI dashboard baseline is **$2.23**, with **$32.29 credit balance reported at that checkpoint**. These are reported figures, not a live invoice API. The app cap is **$30 total**, Main testing allowance **$12**, and controlled A/B allowance **$3** inside testing.

Every completed response settles against actual returned token usage and pinned model rates. Estimates can differ from billing. Reconciliation preserves prior receipts without double counting costs already in the new baseline. Unresolved holds older than30minutes release their accounting reservation with a timestamp; a late response can still record cost exactly once. Release is not a provider refund. Preserve all ledgers; never delete receipts. Repair stale accounting before retrying; a real provider billing/quota error stops paid work and belongs in `BLOCKED.md`. Never purchase credits.

`SCRIPTY_BUDGET_SCOPE=verification` selects Main's testing allowance; `ab_test` also applies the experiment ceiling. A preflight reservation is not a per-image price. See `lib/pricing.ts`, `api_attempts` and `api_budget_reconciliations`.

## Release verification

Main integrates Design's page commits, runs typecheck/tests/build, pushes to private main, then verifies the production alias resolves to the intended SHA. Preserve the previous ready deployment for immediate rollback. A release check covers landing, Mara Studio, Review, Memory, Evidence, Eval and API. Only repeat paid tests for a concrete changed-flow need. Historical verification receipts identify what was tested at their recorded release; they are not a claim that every later screen was exercised.

Final overnight handoff is6:15am PT. The latest founder-supplied submission deadline is **October17,2026,2:00pm PT**. Earlier official11am listings remain historical sources. No automated submission or public-repository conversion is authorized. Founder must record/upload the final video, arrange judge access to the private repo, supply human blind judgments, and submit.
