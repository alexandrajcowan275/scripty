# UI handoff

## What works

The complete Canon workspace uses the shared API contracts without importing any server-only code or making model requests from the browser.

- Desktop: project/Canon Memory left; stacked batch rows and horizontal six-shot filmstrips center; selected-shot inspector right; measured SVG learning chart below the filmstrips; trace drawer at the bottom.
- Mobile (390px): horizontally scrollable filmstrips, then full inspector/review area, full-width learning chart, and character memory. The trace control stays reachable at the bottom.
- A accepts the selected frame; R opens the correction form and focuses its textarea. Shortcuts ignore text inputs, textareas, selects, editable content, modifiers, and repeated keys. Native buttons and filmstrip regions remain keyboard reachable. Every control has visible focus.
- Shot selection, review states, expected/observed checks, confidence bars, image failures, project loading/retry, generation loading, empty data, empty filters, API errors, source warnings, and review notifications are represented.
- Generate has a 310-second client deadline, aligned with the Engine's 260-second shared deadline / 300-second route budget. Project reads time out after 20 seconds.
- Reviews call `POST /api/shot/:id/review`; generation calls `POST /api/batch`; both merge their returned records and then fetch `GET /api/project/mara` to refresh memory, traces, rule usage, and history. Selection is retained through project refresh.
- The learning chart uses ONLY returned `Batch.driftRate` values. Its delta compares the first and latest returned batch. One batch has one point and explicitly asks for another batch. Repeated IDs do not create extra chart points.
- Additive `mode`, `effectiveMode`, `demoMode`, `warning`, `warnings`, and `provenance` fields are supported without changing shared types. `mode:cached` visibly says Cached playback; live says Live engine. Cached review messages explicitly say recorded results remain unchanged. Missing provenance is never described as a live model check.
- Incomplete evidence (`confidence < 0.6`, `observed:unclear`, or missing checks) is labeled Unclear / Evidence incomplete rather than a green pass. This does not alter the engine's flag threshold or historical drift metric.

## What is mocked / remaining integration

This worktree still contains TASK 0 scaffold API handlers and SVG slates because those files belong to Engine/Data/root. Browser screenshots therefore show **Scaffold preview** and fixture checks; they are layout evidence, not evidence of model quality or actual learning. No learning improvement has been invented.

The scaffold returns stateless snapshots and the same batch ID on every generation. The UI recognizes mock IDs, retains explicit review responses across those snapshots, and reports when generation returned an already-loaded batch. It does not manufacture a second batch or call that improvement. Real Engine snapshots take precedence for matching shot IDs. All arrays merge by ID to retain returned history; no server deletion/reset workflow is implemented or exposed.

Root should integrate Data + Engine, replace SVGs with supplied real assets, then retest cached finite replay, signed-cookie review persistence across a reload, and a live generation where one correction affects different scenes. Those backend and live-model boundaries were deliberately not tested here; no API budget was spent. There is no custom-scene editor in this UI version, so generation uses the API's default scene set. Root may add its already-discussed alternate scene prompts at the generation boundary if needed for the unseen-scene demonstration.

## Verification evidence

Story: creator opens Mara → project API returns character, history and checks → creator reviews a frame → review API returns updated shot and learned rule → project refresh preserves selection → memory and measured history render.

| Boundary | Result | Evidence |
| --- | --- | --- |
| Production compilation | PASS | `npm run build -- --webpack`: compiled, TypeScript, five static pages, all four API routes completed |
| TypeScript | PASS | `npm run typecheck` |
| Browser load | PASS | CUA, 1440×1000 desktop and 390×844 mobile |
| Client → scaffold API | PASS | GET project 200; POST review 200; post-review GET project 200 in dev server logs |
| Reject → memory | PASS | R focused reason field; typing did not accept/reject; submit rendered rejected state, review note, and learned rule |
| Accept shortcut | PASS | A on a selected filmstrip frame rendered Accepted and reduced pending count |
| Generate → history | PASS | Duplicate scaffold batch returned an honest existing-batch notice, retained a single 50% point |
| Trace | PASS | Drawer exposed check/flag/category events and View shot controls |
| Mobile lower content | PASS | Inspector checks/review, readable full-width chart, and memory stack inspected by scrolling |
| Production console | PASS | `productionTab.dev.logs({levels:["error","warn"]})` returned `[]` |
| Token-only colors | PASS | Raw color values appear only in `styles/tokens.css`; no client secrets or env reads |
| Contrast | PASS for text pairs | text/surface 15.72:1; muted/raised 4.97:1; muted-strong/raised 7.37:1; drift-text/drift-dim 6.29:1; pass/pass-dim 7.44:1; memory/memory-dim 8.47:1 |
| Real Engine / storage / live models | NOT RUN | Integrate Engine/Data before final acceptance |

The default Turbopack `npm run build` hit environment `EPERM` binding a CSS worker port (including after escalation). Next's locally documented `--webpack` production builder passes. Root owns package.json and can set its build script to webpack if this environment issue reproduces. The UI does not require a package change beyond root's already-installed pinned `geist@1.8.1`.

`next dev` auto-generated AGENTS.md/next-env.d.ts in this worktree. Their original tracked contents were restored; they are not part of the UI commits. Root can disable Next's automatic agent-rules generation centrally.

Screenshots in `handoff/screenshots/`:

- `ui-desktop.png`: 1440px desktop, selected accepted frame (dev fixture data).
- `ui-mobile.png`: 390px filmstrip and stacked inspector entry.
- `ui-mobile-learning.png`: 390px readable full-width chart and review controls (production build).
- `ui-trace.png`: production trace drawer with real scaffold API event messages.

The mobile chart screenshot reflects the final layout refinement. The desktop screenshot is from before the final cached-memory footer wording change. There were no model images available in this worktree at capture time.

## Design / rubric decisions for DECISIONS.md

- Section 7 is the visual source of truth; no Figma file was supplied, so no unrelated Figma document was created.
- Minimal CANON wordmark and nested-frame icon; neutral Generate action preserves red exclusively for drift/rejection, green for checks/acceptance, and gold for memory/learning.
- Local bundled Geist Sans and Geist Mono avoid build-time font downloads.
- Brightened derived drift-text token provides AA contrast while the original Canon red remains the thin flagged frame and confidence accent. Supporting muted text meets AA on the raised surface.
- Landscape images retain landscape ratios. Filmstrip thumbnails use cover; selected images use contain to preserve evidence without distortion.
- Sequential six-card arrival is 110ms with 25ms staggering (last card completes at 235ms). New rules land with a 220ms gold glow. Reduced-motion disables all animation and transition time.
- Native images intentionally support arbitrary configured public Supabase/provider URLs and display a readable failure state, avoiding a fixed remote-host allowlist. No remote image/font dependency is required for layout.
- Replay provenance is a persistent visible source badge plus server warning, not a transient tooltip alone. Cached corrections do not claim to change historical measurements.

## Run / exact next steps

1. Cherry-pick core UI commit `39515e4` after root font dependency `aaedaf7` (already in this branch history), then the UI handoff commit reported separately.
2. `npm ci`
3. `npm run build -- --webpack` (or root's final build command)
4. `npm run start -- --port 3021` for isolated UI verification. Root integration uses its reserved port 3017.
5. Integrate backend/data/assets; browser-test the main demo and different-scene transfer; replace layout-only fixture screenshots with final real-image screenshots.

No API routes, lib files, seed data, package files, shared types, or environment settings were changed by the UI commits. The local verification server has been stopped.
