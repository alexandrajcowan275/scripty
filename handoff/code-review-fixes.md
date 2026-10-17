# Scripty code review fixes — October 17, 2026

Coordinated with Main in chat `01a147ad-d75d-7080-9dae-1d4cda06584b`. Main confirmed no overlapping application edits and requested local changes only; production remains unchanged pending release review.

## Changes

- `app/api/shot/[id]/review/route.ts`: authorized cached-sample extraction now deduplicates against browser-local rules, matching the free path. It cannot merge a new visitor correction into a recorded historical rule.
- `components/ui/memory-update.tsx`: cached samples no longer offer unsupported new-take generation. Both free and authorized cached receipts disclose browser-local memory and unchanged original takes. Owned live-production generation is retained.
- `components/ui-v2/studio.tsx`: replaced Mara's second unsupported fifth-take action in the header with a link to start an owned production. Existing take selection is preserved.
- Removed unreferenced legacy implementations `components/canon-studio.tsx`, `components/new-production.tsx`, and `lib/mock-data.ts` (1,880 lines). Checked import paths and exported symbols across application, scripts and tests; final production build and test suite pass without them. Historical decision documents were retained.
- `tests/sample-review.test.ts` plus the `package.json` test command: regression coverage for free and authorized sample review, repeated-note deduplication, refresh persistence, recorded-rule identity/content/application provenance, original checks and batch preservation, and browser isolation. Authorized extraction uses a deliberately disallowed test model to exercise its fallback with zero network/budget calls; successful paid model extraction was not exercised.

## Verification

- `npm test`: 93 passed, 0 failed, 0 skipped.
- `npm run build`: passed on final source, including TypeScript and all route generation.
- `git diff --check`: passed.
- Isolated headless Chrome against the final production build on localhost:3005, desktop 1440x1000 and mobile 390x1000: landing and Studio open; all 24 sample shots load; note -> Reject & remember -> learned dialog -> Back to Studio -> reload works; repeated note returns the same rule ID and merged=true; acceptance survives reload; another browser sees no visitor rule or decision.
- Sample generation actions absent in Studio header and learned dialog; supported continuation returns to the selected take.
- Original recorded rules/IDs, prompts, image URLs, checks and batch records remain unchanged after corrections. Original rates remain 2/6, 0/6, 0/6, 1/6. No seed or original image files changed.
- Final desktop/mobile runs: zero page exceptions, zero HTTP responses >=400, no horizontal overflow on Evidence.
- Initial database-disabled run returned the expected unavailable optional evaluation request. Final run used configured database reads; Evidence succeeded with no failed responses. No database mutations or human labels were submitted.

Local verification artifacts and script: `/private/tmp/scripty-review-verification/` (`results.json`, `tests.log`, `check-demo.cjs`, desktop/mobile screenshots). The script uses the bundled Playwright runtime and installed Chrome; these are verification dependencies, not new app dependencies.

## Release status and limits

Ready for Main's release review of the recorded-sample demo. No paid generation, paid extraction, live repairs, live rechecks, new-production database writes, push, deployment, or external submission occurred. Paid live generation and deployment of these changes remain unverified. Browser-local sample corrections use the existing signed 24-hour cookie, not cross-device account storage. Existing unrelated documentation/design WIP was preserved.
