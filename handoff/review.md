# Independent review — round 1

Reviewed commit `0cb3469`. Reviewer did not implement application code. Scope: complete source review, production build, tests, desktop/mobile browser flow, API/cache architecture, evidence honesty, budget guard, credentials and XSS boundaries. Only this handoff is committed by the reviewer.

## Evidence and limits

- `npm ci`: PASS. `npm test`: **22/22 PASS**. `npm run build`: PASS using the repository's webpack build script, including TypeScript and all six API endpoints.
- Browser: isolated production server at `127.0.0.1:3025`, CUA only, 1440×1000 and 390×844. The actual repository initially had no cache. Temporary, visibly marked REVIEW TEST FIXTURE records and existing neutral SVG slates were used only to exercise interface states. They were deleted after verification and are not committed. Their flags, images, and curve are **not experimental evidence**.
- Root initially reported OpenAI authentication 401 and no paid calls. During review, root reported a replacement credential returned 200 and real reference generation began. Reviewer did not read credentials or call paid APIs. Live results, actual images/cache, and measured transfer remain unverified in this round.
- Root reports isolated real Supabase persistence smoke passed, anonymous table access denied, and public image bucket verified. This reviewer checked corresponding source and mocked-boundary tests, not the live service.

## Demo acceptance

| Demo step | Result | Evidence |
| --- | --- | --- |
| 1. Open Mara and character sheet | PASS for UI; BLOCKED for real reference | Actual seed project/attributes/rules render. Reference at reviewed commit remains a neutral SVG, explicitly unsuitable for live generation. Root is replacing it. |
| 2. Generate six real shots | BLOCKED | Six-worker/concurrency-three and fallback paths are implemented and tested. No real six-shot batch independently reviewed. Cache initially absent; a real replay cannot yet pass. |
| 3. Inspect actual detected drift | BLOCKED for real quality; PASS for fixture rendering | Fixture failure shows expected/observed/confidence and red state; unavailable evidence shows Unclear. Monitor normalizes uncertainty and validates exact required keys. Real anatomy/model accuracy unverified. |
| 4. Accept/reject, deduplicate memory, refresh | PASS for isolated cached mechanism; BLOCKED for real AI extraction | R focused correction textarea, typing A/R did not trigger shortcuts, rejection saved a local rule and review, reload retained both; A accepted selected frame. Unit tests cover exact/semantic merge. Live DB and LLM boundary not independently exercised. |
| 5. Apply learned rule to next generation | BLOCKED | Source injects all ordered rules and creator-accepted extra reference; monitor independently checks each active rule. No real generation after correction independently inspected. Cached viewer corrections deliberately do not alter recorded results. |
| 6. Transfer to DIFFERENT scenes, fixed-criteria labels, honest chart/trace | FAIL in reviewed UI; BLOCKED for experiment | Every UI generation uses the same default scenes. Incomplete-check fixture falsely produces a green declining curve; details below. No verified hand labels or real improvement claim exists. |

## Ranked fixes and operational checks

1. **P1 — unavailable monitoring looks like improvement.** `components/learning-curve.tsx:7–20` accepts every finite batch rate and colors decreases green. `components/canon-studio.tsx:169` colors zero-rate batch headers green. `app/api/batch/route.ts:31–36` persists an initial zero rate before shots exist; errors can leave partial batches. Reproduced: batch 1 has 1/6 flags, batch 2 has all checks `observed:unclear/confidence:0`; UI says **0% drift, ↓17 percentage points**, although inspector says Evidence incomplete. Fix: derive per-batch completeness from persisted shots/checks, distinguish incomplete counts/rates on refresh, prevent incomplete batches entering the completed comparison, and explicitly say operational flag rates do not establish improvement without fixed-criteria human labels. Root assigned a fix; not yet re-reviewed.
2. **P1 — no UI path to different new scenes.** `components/canon-studio.tsx:107–110` sends only projectId; `app/api/batch/route.ts:28` always selects seed scenes. Fix: editable six-scene live input or explicit alternate scene sets and applied-rule inspection; retain honest recorded scene replay in cached mode. Root assigned a fix; not yet re-reviewed.
3. **P2 — final run/config documentation is stale.** `README.md:3` still calls the implementation TASK0 and describes stateless mock APIs; `.env.example` omits `CANON_SESSION_SECRET`, admin token and model configuration. Production cached session mutation needs a signing key (service-role key fallback currently exists). Update final setup, modes, limits, cache capture, deployment and missing evidence before submission. Root notified.
4. **Operational live-demo gate.** `lib/engine-http.ts:6–9` intentionally routes ordinary browser requests to cached mode when an admin token is configured; client fetch supplies no admin header. A live browser demonstration needs a dedicated isolated local runtime without that token or proper server-side admin authentication. Never embed the admin token in client code. Public final cached playback is compatible with this gate.

Known followups already integrated on root during this round: no-cache UI/recorded-correction wording `70d561b`, data capture/auth/recheck changes `9c01afe`. These are **not listed as still-unfixed defects**; they were outside the reviewed commit and require the next integrated check.

## Other checks

| Item | Result | Evidence |
| --- | --- | --- |
| Graceful provider/storage failure | PASS at code/test level | 60-second provider deadlines, retry bounds, uncertain fallback, no second paid generation for Storage failure, independent workers complete despite another failure. Actual provider timeout not induced. |
| Budget guard | PASS at code/test level; BLOCKED for billed-cost reconciliation | Every paid attempt reserves via durable SQL ledger, fails closed, fresh reservation ID per retry, fixed $24 limit, atomic locking. Text models/input/output bounded. Reservations are upper bounds, not billing receipts. |
| Serverless cached state | PASS at fixture/API level | Signed compressed HttpOnly SameSite cookie, production Secure, browser isolation/tamper tests, reload persistence, bounded reviews/rules/cookie, cache read from bundled files; no module-global mutable viewer history. Actual Vercel cold-start replay unverified. |
| Cached mode fully with real assets | BLOCKED | Missing genuine manifest/images at review start. Fixture mechanism passes, but cannot substitute for real replay acceptance. |
| Metrics and evaluation | PASS for arithmetic/tests; BLOCKED for real accuracy | Drift is positive class, low-confidence failures count according to actual flag threshold, draft labels excluded by default, missing labels/checks reported, undefined metrics null. No real verified labels reviewed. Flag rate changes alone do not establish improvement. |
| XSS and credential exposure | PASS within inspected scope | React text rendering; no raw HTML/eval sinks or client imports of server secret readers. 78 tracked files scanned for OpenAI/Supabase private-key and PEM patterns: no hits. No `.env.local` accessed. Pattern scan is not a complete historical secret audit. |
| 1440px layout | PASS with neutral fixture slates | Three-pane filmstrip/inspector/memory visible; scrollable image row and inspector keep review controls available. Real-image cropping still needs inspection. |
| 390px layout | PASS with neutral fixture slates | No document horizontal overflow (`innerWidth390`, scrollWidth385); filmstrip scroll, inspector, review, chart, memory and sticky trace control usable. |
| Keyboard/focus | PASS for exercised flow | R focuses textarea, typing does not trigger A/R, A accepts selected card, semantic buttons, visible gold focus rule. Full assistive-technology audit not performed. |
| AA text contrast and design tokens | PASS for inspected text pairs | Token-only component/style colors; text/surface15.72:1, muted/raised4.97:1, muted-strong/raised7.37:1, drift-text/drift-dim6.29:1, pass/pass-dim7.44:1, memory/memory-dim8.47:1. |
| Browser console | PASS | Production fixture flow returned no warnings/errors. |
| Public final deployment | BLOCKED | Preview URL supplied by root; final public production, real asset replay and deployment protection still require end-to-end verification. |

## Next check

Re-review integrated UI/data/docs fixes and the real captured reference/batches without making paid requests. Inspect actual finalPrompt/check keys/rulesApplied/traces on different scenes, replay cache in a fresh browser, review and reload, verify deployment is public, and report actual sample counts honestly. Engineer-created draft labels remain draft until human review. Working deadline: Oct17 11am PT; assets10:45am. No external submission was performed.
