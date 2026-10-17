# Production backend — verified local increment

Final light-v3 implementation is deployed at https://canon-woad.vercel.app/. Release details are in MORNING.md.

## Verified

- Upload-based new production creation uses the creator's own name, character, canon details and six scene prompts. Atomic Postgres creation saves the project plus ownership/settings.
- References are uploaded to private Supabase Storage. An ownership-checked server route returns the exact original bytes. Public Storage URLs are not used for uploaded references.
- Signed HttpOnly same-site owner cookie; scoped project reads, image reads, production listing and review writes. A different browser receives404 for both production and reference.
- Separate explicit reference-generation endpoint, owner-bound expiring reference ticket and private generated-reference storage are implemented. **Paid execution was skipped** under the founder's spending restriction.
- Existing generation/review/learn functions now accept an owned production. The production's scenes and character replace sample defaults. Its own character reference is used on provider failure; another production's image is never silently substituted.
- Mara's full four-take/24-image history opens immediately. Its original flags stay2/6,0/6,0/6,1/6. Sample edits remain browser-local.
- Persistent creation throttles, atomic per-production generation claim and global$24 reservation cap. Public paid calls default off with `CANON_PUBLIC_GENERATION_ENABLED=false`. A blocked generation leaves the production saved and offers Mara.
- Additive migration `20261017043406_production_workspaces.sql` applied through the already authenticated linked CLI. Security advisor: **No issues found**.

Evidence: `experiments/production-workspaces-local.json` contains ten passing real-data checks.52 tests and production build pass. API reservations remained$20.58 after verification; this is a pessimistic reservation ledger, not a provider receipt.

## Practical boundaries

Production access belongs to the creating browser for30days; no accounts, cross-device recovery or sharing are implemented. Clearing the owner cookie loses access from that browser. Do not claim account-backed recovery. A generated-reference ticket expires after one hour. Unused generated references and verification productions were retained; no data deletion is authorized overnight.

The six-shot generation route is implemented but paid requests were not rerun for a new production. The earlier Mara engine history is the real generation/learning evidence. New-production generation is intentionally unavailable overnight, not presented as a successful new run.

## Final release verification

The upload endpoint saves a private reference before Continue and returns an owner-bound expiring ticket. Character edits append an immutable version, keep historical private image URLs working and do not rewrite past shots/checks. Additive migrations20261017051806 and20261017054309 applied successfully. Final security advisor: no issues found. Ten real version checks passed locally; ten production-workspace checks passed again on the public URL, including exact uploaded bytes, other-browser404 and friendly429 without invented shots. Public sample regression verified all24 image hashes, all4 takes, review/accept persistence, isolation and actionable exhaustion. Evidence: experiments/production-character-versions-local.json, public-light-v3-productions.json and public-light-v3-replay.json. API reservations remain$20.58/$24.
