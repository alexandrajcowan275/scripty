# Production backend — verified local increment

Working branch: `codex/figma-implementation`. Public release is preserved while the designer finishes the replacement linear-flow spec. This file describes verified backend behavior, not a claim that the new interface is deployed.

## Verified

- Upload-based new production creation uses the creator's own name, character, canon details and six scene prompts. Atomic Postgres creation saves the project plus ownership/settings.
- References are uploaded to private Supabase Storage. An ownership-checked server route returns the exact original bytes. Public Storage URLs are not used for uploaded references.
- Signed HttpOnly same-site owner cookie; scoped project reads, image reads, production listing and review writes. A different browser receives404 for both production and reference.
- Separate explicit reference-generation endpoint, owner-bound expiring reference ticket and private generated-reference storage are implemented. **Paid execution was skipped** under the founder's spending restriction.
- Existing generation/review/learn functions now accept an owned production. The production's scenes and character replace sample defaults. Its own character reference is used on provider failure; another production's image is never silently substituted.
- Mara's full four-take/24-image history opens immediately. Its original flags stay2/6,0/6,0/6,1/6. Sample edits remain browser-local.
- Persistent creation throttles, atomic per-production generation claim and global$24 reservation cap. Public paid calls default off with `CANON_PUBLIC_GENERATION_ENABLED=false`. A blocked generation leaves the production saved and offers Mara.
- Additive migration `20261017043406_production_workspaces.sql` applied through the already authenticated linked CLI. Security advisor: **No issues found**.

Evidence: `experiments/production-workspaces-local.json` contains ten passing real-data checks.50 tests and production build pass. API reservations remained$20.58 after verification; this is a pessimistic reservation ledger, not a provider receipt.

## Practical boundaries

Production access belongs to the creating browser for30days; no accounts, cross-device recovery or sharing are implemented. Clearing the owner cookie loses access from that browser. Do not claim account-backed recovery. A generated-reference ticket expires after one hour. Unused generated references and verification productions were retained; no data deletion is authorized overnight.

The six-shot generation route is implemented but paid requests were not rerun for a new production. The earlier Mara engine history is the real generation/learning evidence. New-production generation is intentionally unavailable overnight, not presented as a successful new run.
