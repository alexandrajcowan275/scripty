# Decisions

## TASK 0 — scaffold

- Keep the mandated Next.js App Router + TypeScript + Tailwind stack. Pin stable npm registry versions and commit the lockfile. No stack changes or shared type changes.
- Use Tailwind's PostCSS plugin. Keep the prescribed palette in `styles/tokens.css`, with semantic Tailwind aliases; components use token names. Standalone SVG placeholder files repeat the palette because they are image assets, not components.
- Use local neutral SVG slates so the skeleton has no external image/font dependency. The font stack prefers Inter/Geist when installed and uses system fonts otherwise; the UI task can bundle fonts. No fabricated reference art or AI checks.
- All mock routes share deterministic fixtures in `lib/mock-data.ts`. Do not create fake persistence or continual learning. Echo a review response only; GET returns the original fixture.
- Return null eval metrics until hand labels and actual checks exist. Mock drift rate is calculated from fixture flags, not hardcoded as a learning result.
- Leave provider choice, Supabase SDK/schema, Zod monitor validation, shadcn primitives, and real features to their owning tasks. No live credentials are needed or read by the scaffold.
- Use one minimal status page for now. No Figma file was supplied; use section 7 tokens for this skeleton and leave composed UI design to TASK 1.

## Overnight build — setup and evidence

- Use isolated Data, Engine, and UI worktrees with folder ownership; root handles integration, deployment, API spending, and pitch. Serves rubric3: parallel progress with reviewable commits.
- Keep public database RLS enabled and server-only access instead of the optional RLS-off demo shortcut. Only generated image reads are public. Serves rubric3: reliable deployment without exposing the service key or raw write access.
- Bundle Geist locally to avoid font-fetch build failures. Serves rubric3/4: repeatable builds and intentional typography.
- Use a conservative persistent API reservation ledger and default public production to explicitly labeled real-cache playback after capture. Live generation requires the configured admin token. Serves rubric1/3/5: honest measurements, budget reliability, and visible failure handling.
- Keep draft labels out of authoritative eval; draft-only metrics must be clearly separate. Serves rubric1/5: judge-facing claims remain auditable.
- Background heartbeat creation was rejected by automatic approval review; no recurring automation was installed. Work continues in the active session.

- Adopt11:00am PT as the conservative working submission deadline, assets10:45am, based on updated event-review planning. Do not claim the event page was verified here. Serves rubric3: earlier safe readiness.
- Demonstrate transfer to DIFFERENT scenes after a correction and hold the evaluation criteria fixed. Do not equate a lower changing-monitor flag rate with verified improvement; draft labels remain provisional. Serves rubric1/2/5.
- Defer extra providers/features when they compete with the one-character learning proof. Serves rubric1/3/4.

- Disable Next.js generated agent rules so `next dev` cannot overwrite this project's own AGENTS.md. Use webpack for the production build script because Turbopack's CSS worker needs a port that is restricted in worker sandboxes. `npm run build` remains the required production gate. Include dynamic seed/cache assets in serverless tracing. Serves rubric3: instructions and cached backup survive deployment.

- The first real batch exposed mirror/orientation false positives in monitorv1. Freeze explicit anatomical orientation and occlusion handling as monitorv2; retain originalv1 output and label any baseline re-evaluation. Do not attribute checker calibration to creator learning or hide the original100% flag rate. Serves rubric1/5: evaluate the evaluator and keep evidence auditable.
- Give live users an optional six-scene editor and poll durable partial results. Incomplete batches cannot appear as improving chartpoints. Serves rubric1/3/4/5: demonstrate transfer while preserving usable successes and uncertainty.
- Return actionable409 on replay-session capacity and use content-hashed cache image names. Serves rubric3: recoverable, reproducible backup.

## Scripty identity and latest user steering

- Rename the product to **Scripty**, the AI script supervisor. Keep repository/folder/project identifiers and environment prefixes stable so deployment and stored data remain intact. Serves rubric2/3/4/6: a film-native role explains the actual buyer problem without a camera-brand collision.
- User reaffirmed1:15pmPT submission deadline and a1:00amPT readiness checkpoint. Keep morning assets target10:45am. This latest direct steering supersedes the earlier conservative11am planning. Serves rubric3.
- Inspect a small latest-model quality sample before scaling; use a consistent cinematic lens/lighting/style prompt. Final calibration is limited to roughly3 attempts; retain all observed results rather than chase a descending curve. Serves rubric1/3/4/5.

- Design pass uses the script-supervisor role as a quiet slate/wordmark and actual UTC capture metadata instead of fabricated footage timecodes. Increase image/type scale and retain mobile stacking; distinguish recorded memory from browser-local corrections. Red/gold/green remain semantic evidence colors while operational metrics use neutral marks. Serves rubric2/3/4/5.
- Final checker v3 uses a labeled canonical reference plus shot and a stronger budgeted vision model. A known-shot spot check correctly resolved scar-side false positives. Freeze this version after the third calibration attempt; do not tune further to chase a curve. Originalv1/v2 results remain in experiments. Serves rubric1/5.
- Per direct quality steering, later batches use pinned GPTImage2.5Sunburst high with consistent35mm/Super35/f2.8 lighting/grade language. Two inspected real samples passed visual quality. This model/style transition is disclosed as a confound; no memory-only causal claim is made. Serves rubric1/3/4.

### Final live rehearsal: completion and review limits

The live browser rehearsal produced six new frames while read-only polling displayed durable progress. The completion notice now compares against batch IDs present when generation began, so polling cannot mislabel a fresh batch as a duplicate. Rejection input is limited to the API's400-character contract, avoiding an avoidable validation failure after a long production note.

## Figma v2 and founder Runway/Natural direction

- Main is the sole application-code editor. Other chats deliver research, Figma, pitch and report-only reviews; judge/QA intervals are90minutes to conserve usage. Pitch writer completed `handoff/pitch-final.md` and stopped.
- Adopt final Education-team Figma v2 rather than rejected Drafts v1. Replace the dense dashboard with an editorial landing, a large fitted image/320px contextual decision area, a quiet six-frame strip, contextual Memory, and separate recorded learning/evidence. Keep the working API/replay contracts. Serves Design and demo clarity.
- Match v2 Inter80/88 display,40/48 headings,24/32 titles,16/24 body and48px controls. Bundle Inter locally. Near-black#0C0C0C and warm-white primary recede around genuine images; red marks findings, gold marks learned memory. No green victory signal or generic red action.
- Research current Runway, Natural and seven creative/product references before implementation. Runway's observed public/guest surfaces currently use light surrounds; the near-black Scripty canvas follows the founder's direction, not an invented Runway token. Borrow image hierarchy, restraint and Natural's editorial craft; never copy their logos, layouts or media. Original faint grain stays off evidence images.
- Use the clearer recorded map/ring candidate as default review, while retaining the Figma portrait selection for comparisons. Image markers belong only to exact known shots and are disclosed as editor-positioned monitor claims. Human laterality review remains necessary.
- Correction reach is inspectable evidence: unique shot IDs with exact rule text in final prompts AND corresponding rule IDs in monitor output. Delivered playback counts grow6/12/18; local replay edits never claim to affect historical images. Expose the recorded rule identity and readable expected/observed checks on demand. Serves continual-learning credibility.
- Preserve all four recorded rates2/6,0/6,0/6,1/6, uncertainty denominators, v3 calibration and generator/scenes/reference confounds. The comparison says settings changed and human review is pending; no verified visual gain. No additional paid generation.
- Visual verification found filmstrip captions below the desktop reference and a lingering notice over imagery. Reduce secondary vertical chrome and dismiss routine notices after5.5seconds; saved-rule notices remain available for Memory inspection. Stop the recorded next-batch action after all four takes are delivered.

## Production-first direction and overnight authorization

- Replace prototype-oriented entry with Start a new production and Explore a sample production: Mara. Retain internal adapter identifiers for compatibility; sample images, prompts and checks keep their original provenance. Main pauses layout work until the designer's replacement linear-flow spec arrives.
- New productions use existing shared engine contracts, with private reference storage and a separate ownership/settings table. A signed HttpOnly browser capability scopes server reads/writes. No service key or ownership hash enters client state. Accounts and cross-device recovery are deferred and disclosed.
- Keep upload-based creation available while paid work is off. Reference creation is an explicit action, never triggered by selecting a method or continuing a form. Signed reference tickets bind a private asset to its owner and expire after one hour.
- Add persistent creation throttling and atomic generation claims. The global reservation cap remains$24. Founder explicitly prohibited overnight spending and deletion, so public paid requests default off and recover with a saved production plus Mara alternative. No paid tests, purchases or data cleanup were performed.
- Real-data verification caught an origin comparison using Next's internal localhost URL. Validate against the visible Host instead, and test same-host loopback plus cross-site rejection. Private production and image reads were verified to reject a different browser. Security advisors found no issues.
- The designer is rebuilding a calm linear Batch → Review → Learned flow, with Memory in a drawer and Progress separately. Earlier dark layouts are superseded; no new layout embellishments will be added before the definitive spec.

- Fresh database reads now restore original shot order from generation traces instead of random IDs from concurrent saves. Verified against all24 original shots; this keeps the forthcoming one-shot review counter meaningful without changing shared contracts or historical data.

- Full sample history exposed a provenance edge case: a viewer correction could merge into the historical engine rule and change its text. Sample extraction now deduplicates only within that browser’s own notes. Original rule identity/text and18 original applications remain intact; a regression test verifies both origins.

## Final light v3 release candidate

The final Figma After / Light v3 specification supersedes the dark layouts. Implemented separate Batch, single-shot Review and Learned views, optional Memory drawer and Progress. Warm #F5F3EE canvas, Inter 400/500, 1296px grid, 72px desktop margins, 24px mobile margins, 16px radii and 56px pill actions follow the supplied frames. No persistent dashboard panels or extra badges. Matched full-source review containment and normalized eye/ring annotations; Batch uses centered source crops. Corrected desktop CTA position to the actual Figma frame and disabled optical font sizing to match Figma Inter. Motion follows 200ms marker/drawer, 180ms saved rule and 220ms comparison reveal, with reduced-motion support.

Success follows persistence. Browser verification created an owned production with private upload, two canon details and six scenes, reached the truthful saved/capacity state without generation, reloaded its own character and edited it through Memory. Character edits append immutable versions; the earlier reference remains retrievable. Ten real-data version checks passed. Sample keyboard R saves the actual scar rule; A persists acceptance through reload; original flagged counts remain unchanged. Memory Escape returns focus. All 52 tests and the production build pass. Sample flow was verified with server outbound requests blocked. No paid calls or data deletion.

## Release and overnight verification

Promoted the staged light-v3 build only after its sample endpoint returned all four takes/24 shots. Public browser review/save/Memory/Progress passed at1440px and390px; all24 original image hashes and review/accept refresh/isolation passed over HTTPS. Real public new-production upload, owned reads, exact private bytes, other-browser404 and friendly paid-off429 passed. Independent QA passed the public flow; Design found no remaining material mismatch after replacing an early mobile screenshot with a settled capture. Main was fast-forwarded and pushed; its READY Vercel deployment is dpl_Bp27FCZzgXFkyG6ViBVYunJPBcRm. The canonical alias serves the final capacity copy.

Verified cd ~/canon && npm run dev in the browser, then stopped it so port3000 remains free for the founder. Updated and rendered the light-v3 brand PDF. Retained superseded local design/code drafts under .gitignore because no deletion is authorized. Created one bounded90-minute Main heartbeat through the morning handoff, complementing existing report-only judge/QA checks; it stays quiet unchanged and pauses after the final6:30–7am readiness update. No purchases, paid calls or deletion.

## Judge feedback: uncertainty and noncommittal navigation

Changed Batch copy to “N of6 shots flagged.” The monitor can be wrong, particularly on anatomical laterality; flags are not verified drift. Added a quiet48px Back to shots control above the Review image, using the existing Escape/back action without a review write. The image bed and decision geometry stay unchanged. This small usability/credibility amendment follows the founder’s standing permission to improve; Design was asked to mirror it in final Figma.

Rechecked the official SEPHacks Devpost page on October17: it lists2pmEDT, equivalent to11amPacific, and requires a two-minute video, working GitHub link and project link. Preserve the founder’s supplied1:15pm target as context, but use the earlier published cutoff for readiness unless the organizer confirms otherwise. No submission or message to organizers was sent. Source: https://sephacks-2026.devpost.com/.

Verified the amendment on canonical public production dpl_BAEjvkXeUGUTWkdnYknWq71x6fU4 /911f854: pending review unchanged on Back, originating focus restored, bed1076×640 at182,72 unchanged, exit160×48 at182,12 with exact secondary color,390px no overflow and no captured warnings/errors. Final Figma and public screenshot comparisons saved.52 tests/build pass; no paid calls or data deletion.

## Restore creator corrections and production navigation

Founder requested both features explicitly after the status report. Restored the400-character editable continuity note in Review; blank rejection is blocked, drafts survive failed saves/back, and keyboard A/R ignores text editing. The no-paid fallback now preserves the actual creator note instead of replacing it with an older character-sheet expectation. Exact repeat notes reuse one rule ID; distinct constraints on the same attribute do not silently overwrite one another or original experiment provenance. Regression tests cover new constraint content and400-character retention.

Restored saved productions through a dedicated /productions page linked from landing/setup/workspace, and Open your production on the saved-capacity screen. Listing uses the existing ownership-checked API, with loading/empty/error/retry states. Existing owned production and character reopened successfully in the real browser. Mobile has no horizontal overflow.53 tests and production build pass; local custom-note API checks pass without a usable OpenAI key. Paid generation remains off. Budget plan distinguishes a not-yet-implemented one-shot verification ($3.22 from existing remainder) from two current six-shot takes ($19.22 retry headroom, $15.80 additional). No spending or cap change is authorized until founder responds.

Restoration released as e881d86 /dpl_BPQnopq17XoEMthqERfiyBVYzppU and verified on canonical public URL. Blank rejection disabled; exact novel scarf-knot note saved and persisted through refresh; list route and owner-scoped saved production API passed. Public mobile field342×96 at24,704 with full image unchanged and no overflow/errors.53 tests/build pass. Reservation ledger remains$20.58; public generation and cap remain unchanged. Figma amendments and final comparisons retained.

## October17 — current execution plan, budget and controlled evidence

The founder's latest deadline is2:00pm PT, with Main handoff6:15am PT. Earlier deadline entries above are history. Folder ownership is Main backend/repo/docs/releases and Design pages/components/styles/public; no restart of the current UI. A real dashboard baseline of$2.23 replaces the earlier estimate, with$30 app/$12 testing/$3 A/B limits. Additive reconciliation preserves old receipts, avoids double counting and audits stale-hold release. The controlled experiment changes only learned-rule injection; reference/settings/scenes and canon-only checker stay fixed. Original24images and the2/6,0/6,0/6,1/6 history remain intact. New blind labels must be supplied by humans. CI is verified green before adding its README badge; the repo stays private and all secrets remain ignored. A read-only location card may use the already captured World Labs still/link; no further world generation is authorized.

## October 17 morning — image delivery and legacy routes only

Ship offline-generated, content-addressed 480px/1200px WebPs for all 24 Mara and 12 A/B images, plus the reference/location still. Static files use one-year immutable caching; original PNG URLs/artifacts stay intact and load only on explicit loupe intent. The latest six-shot grid shrinks from13,720,257bytes to97,530bytes. Keep private uploads untouched. Redirect legacy Studio/Learning routes into the current workspace and preserve saved productions at /projects. Combined79tests, typecheck, build and CI pass; public asset bytes/headers/redirects verified. Under-two-second Incognito rendering is not yet certified because native Chrome automation timed out. No paid calls or labels.

## October 17 morning — productions dashboard

Add the founder-requested /dashboard overview from existing owner-scoped APIs. Count saved original-take attribute checks, distinct monitor-flagged shots and non-seed rules; keep historical calibration/recheck events and the separate A/B corpus out of take totals. The Mara curve and ring-rule marker derive from actual batch/rule data. Activity uses deduplicated recorded events and real links. Preserve compressed WebP delivery, original-on-intent inspection and existing workspace layouts; in-app branding and Open studio now enter the dashboard.

## October 17 morning — Scripty URLs

Founder requested a reversible URL rebrand before the 9:30am freeze. Add `getscripty.vercel.app` as a production domain of the existing `canon` project, preserving all old aliases; the first two requested names were already in use. Rename the private GitHub repository to `scripty` while retaining its numeric repository identity and old-URL redirect, and update origin. Keep local folder/project identifiers unchanged. A docs-only push verifies Git-triggered production delivery before changing app metadata. Preserve hostname-scoped owner sessions on the old URL rather than transferring private browser capabilities.

## October 17 morning — licensed editorial presentation

The founder directly confirmed in Main that credited Unsplash/Pexels photographs are allowed as brand atmosphere on landing and Home. Apply the cool studio palette and orange memory accents while keeping layouts/data intact. Credits, source/license links, camera provenance, responsive sizes and hashes are in `public/brand/CREDITS.md`. Mara remains the product content. Original sample/A/B assets stay unchanged; cool grading, grain and cropping are presentation-only on landing/dashboard. Review and Evidence images receive no filters or transformations from this treatment. Use darker small-text variants to meet AA contrast on the cool canvas, and include three contrast/scope checks in normal CI. Stop deployments at 9:30am PT.

## October 17 morning — working Home and restrained workspace

Make Home actionable: pending monitor-flagged shots first, followed by browser-owned productions, recent learned rules, recorded agent run times, and activity. Accepted/rejected shots leave the work queue while their original flags remain in Evidence. Move the historical take chart to Evidence; remove Home totals and slogans. Replace Home fashion imagery with a credited cinematic landscape. Agent cards explicitly show unavailable live status because the backend exposes recorded traces, not a running-agent service. Share quieter typography, compact metadata, neutral surfaces and short non-blurring transitions across Home/Studio/Review/Evidence, preserving existing controls, image evidence, keyboard actions and data contracts. New queue/contrast checks join the standard release tests. The landing hero remains a separate increment.
