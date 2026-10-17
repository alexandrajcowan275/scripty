# Independent review — round 2

**Local recorded-demo acceptance: PASS, with evidence limitations below.** No remaining P1 defect was found in the reviewed build. The reviewer did not implement application code, read credentials, call paid APIs, or modify the live experiment. Only this report is committed.

Reviewed: integrated `82c2550469d30ed4b3f09a22102b419b7578a046` plus designer `5148d2b7d11746d74abc35076bfb781950548758` (QA cherry-pick `b50d7da`). Real cache copied read-only from the root worktree: **2 batches / 12 shots**, manifest SHA256 `7d7b9a72466bfead2e222428df1465172cd568881159d47523af201ec41c5f1a`. All 12 image hashes matched their provenance records. This round supersedes the earlier missing-assets/invalid-credential blockers recorded in round 1; root subsequently authenticated and captured genuine outputs.

## Demo acceptance

| Demo step | Result | Evidence |
| --- | --- | --- |
| 1. Open Mara and character sheet | PASS | Genuine raster reference and four fixed attributes render in production UI; no neutral slates used in this round. |
| 2. Load/generate six shots | PASS for real historical capture and replay; live execution root-owned | Two actual six-shot batches and successful provider traces inspected. Independent replay runs cached-only without credentials. No reviewer model calls. |
| 3. Inspect actual detected drift | PASS for functioning evidence display; accuracy not independently validated | Batch1 frame2 visibly has a silver ring on image-right hand in a frontal pose, corresponding to anatomical LEFT; stored v3 monitor flags ring mismatch. Full-frame view makes the contradiction inspectable. Uncertain shots display Evidence incomplete / Unclear rather than passing. Agent visual inspection is not human ground truth. |
| 4. Reject/accept, memory, dedupe, refresh | PASS | CUA R focused correction field; local reject saved a browser correction and survived reload; A accepted a different frame. Independent HTTP tests repeat the same correction, retain one rule ID, and preserve both decisions on fresh GET. Real live extraction/dedupe evidence shows identical learned rule ID in review and repeated-review artifacts, and visibility after persisted refresh. |
| 5. Apply learned rule to next generation and monitor | PASS for recorded experiment | Rule `ca721c45-1e5d-412c-83ba-9a566443c44b`, “Mara always wears a silver ring on her RIGHT hand.”, occurs in all six B2 final prompts, all six B2 monitor check sets, B2 rulesApplied and genuine rule_applied trace. Review traces disclose live_rule and merged. Browser corrections are separately labeled and do not rewrite historical generation. |
| 6. DIFFERENT scenes, chart and trace | PASS for transfer mechanism; BLOCKED for a validated improvement claim | All six B2 scene strings differ from every B1 scene. UI shows real rates, uncertainty counts, and fixed-criteria/human-label caveat. B1/B2 image model, quality and cinematic style differ, so lower flags cannot be attributed to memory alone. No independently human-verified labels inspected. |

## Actual measured evidence inspected

| Batch | Scenes | Flagged shots | Checks | Uncertain checks | Unavailable checks |
| --- | --- | --- | --- | --- | --- |
| 1, frozen checker v3 recheck | Original six | 2/6 (33.3%) | 36 | 4 | 0 |
| 2, checker v3 | Six different new scenes | 0/6 (0%) | 42 | 6 | 0 |

These are **operational monitor outputs**, not validated accuracy or a controlled memory-only effect. Baseline images were generated with image1.5 medium; B2 uses Sunburst high plus revised cinematic language. Baseline was rechecked under v3, retaining original diagnostic files/traces. The trace log contains older calibration events as historical events; current inspector checks are the stored v3 checks. Root's reviewed/merged ring correction is agent-created and explicitly needs human verification.

B3/B4 generation, accepted-positive-reference behavior on those later batches, later draft labels, final four-batch cache and final public Vercel deployment were still being completed by root/another QA agent while this snapshot was reviewed. They are **outside this round's verification**. Do not extend the two-batch numbers to later batches without their actual evidence.

## Verification results

| Check | Result | Evidence |
| --- | --- | --- |
| Install, tests, build | PASS | `npm ci`; `npm test` **40/40**; `npm run build` including TypeScript and all API endpoints. |
| Real cached replay without AI/DB credentials | PASS | Isolated production server3025 uses only DEMO_MODE=cached and a test-only signing secret. B1/B2 replay, review, refresh and eval require no external model/database request. |
| HTTP persistence and isolation | PASS | Independent requests against3025: fresh session has zero delivered shots/local rules; load two batches; repeated rejection dedupes one rule; reject/accept survive GET; request without cookie remains empty; batches unchanged after local reviews. |
| Finite replay exhaustion | PASS | Third batch request on this two-batch snapshot returns409 with “All recorded batches have been replayed. Clear site data to start again.” UI retains shots and provides dismissible actionable message. |
| Genuine image routes | PASS | All12 image URLs return200 image/png and substantial raster bytes; manifest provenance hashes match local files. |
| Stateless-server packaging | PASS at build/architecture level | All five API route tracing manifests include manifest.json and12 image files. Signed compressed HttpOnly browser state and existing tamper/isolation tests avoid process-global viewer state. Final Vercel cold-start behavior remains an external deployment check. |
| Unavailable/incomplete curve handling | PASS | Prior P1 fixed: evidence helper excludes partial or zero-confidence batches from completed points; unavailable latest shows Incomplete evidence. Four focused evidence/scene tests pass. Real B1/B2 low-confidence occlusions remain counted separately and chart caveat is visible. |
| Different-scene entry and disclosure | PASS at source/test and recorded-UI level | Live editor requires six nonempty lines; valid values are sent as scenePrompts. Cached editor is labeled Recorded scenes / read only. Real B2 scene set differs in all six prompts. No paid editor submission performed by reviewer. |
| 1440×1000 UI | PASS | Real reference, filmstrip, selected inspector, review actions, memory, operational chart, expandable frame and trace drawer inspected in CUA Chrome. |
| 390×844 UI | PASS | No document overflow: innerWidth390 / scrollWidth385. Filmstrip, stacked inspector/review, legible full-width chart/caveat, memory and sticky trace access inspected. Real images render and retain aspect ratio. |
| Full-frame dialog keyboard | PASS | Enter opens from Expand frame; native Close gets focus; Enter closes; Escape closes and restores Expand-frame focus. A/R while modal open leaves selected shot pending and does not open review. Mobile dialog contains the full image and reachable close button. |
| Review keyboard | PASS | R focuses reason field; typing does not accept/reject; A accepts selected card; review status/reason retained after confirmed save then reload. |
| Browser console | PASS | No warning/error entries during actual cached UI flow. |
| Design tokens / AA text | PASS within inspected scope | New UI follows semantic tokens and neutral operational metrics. Existing text contrast pairs remain4.97–15.72:1. Visible gold focus styling retained. Full assistive-technology audit not performed. |
| Secrets/XSS | PASS within inspected scope |105 files including the copied manifest scanned for OpenAI/Supabase private-key/PEM patterns: no hits. React text rendering and no raw-HTML/eval sinks or client imports of secret readers. No `.env.local` accessed. Pattern scan is not a full historical secret audit. |
| Budget guard | PASS at code/test level | Paid attempts still reserve durably before calls, retries get fresh IDs, SQL cap fixed$24, fail-closed errors, model/input/output restrictions. Later models have explicit reservations. Actual billing reconciliation is root-owned; reservations are upper bounds rather than receipts. |
| Eval honesty | PASS | With reviewed snapshot's unverified labels, actual cached `/api/eval` returns precision/recall null and0 evaluated labels. Draft/verified separation and missing-evidence arithmetic tests pass. Later root draft labels were not reviewed here. |
| Final public deployment | BLOCKED in this reviewer round | External QA/root owns the final URL, public access, later cache and production cold-start acceptance. Local build alone cannot establish them. |

## Findings and fix-loop outcome

- **Round1 P1 incomplete curve:** resolved by integrated evidence completeness checks, neutral operational chart and explicit caveat; tests and final real UI inspected.
- **Round1 P1 same scenes only:** resolved by six-line live scene editor; actual captured B2 new-scene transfer verified.
- **Round1 P2 stale setup docs:** resolved; README/.env.example now document real implementation, signing secret, modes, server-only admin gate, cached replay and live localhost rehearsal.
- **Round2 minor P2 rejection length mismatch:** reviewed UI allowed1000 characters while API accepts400. Root reports correcting maxLength to400 after this snapshot; no additional reviewer code edit required. Final integration should include that small fix. Root also reports correcting progress-poll completion wording; that later change was not part of this reviewed snapshot.
- **Operational live gate:** intentional, documented and retained. Public cached mode cannot be switched to paid live execution by client headers. Live browser rehearsal requires the documented private-localhost override or authenticated operator API requests. Do not embed admin token in client code.

No new feature edits were made. Reviewer temporary server stopped and viewport restored; source cache and active root3017 generation were not modified. Only this report is committed. The actual deadline now follows AGENTS.md/user reaffirmation: Oct17 **1:15pm PT**, checkpoint1am, assets target10:45am. No external submission performed.
