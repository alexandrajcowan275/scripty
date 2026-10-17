# Scripty UI system

Implementation source: `/styles/tokens.css`. Screen/layout rules: `/styles/ui-v2.css`. Fonts are self-hosted in `/public/fonts`; their licenses ship alongside them. Color literals belong in tokens only. Pages compose the components below; do not add page-local hexadecimal colors or JSX style props.

## Tokens

| Purpose            | Tokens                                                                                                                                                                                                                         |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Canvas and imagery | `--background` warm off-white, `--surface` white, `--image-bed` neutral image backdrop                                                                                                                                         |
| Text and hierarchy | `--text`, `--muted`, `--muted-strong`, `--v2-tone` (large secondary headline text only)                                                                                                                                        |
| Meaning            | `--drift` accessible red text, `--drift-fill` accessible filled action, `--drift-outline` bright image brackets; `--pass` green; `--memory`, `--memory-fill/border/detail`, `--memory-halo/glow/code-text` gold rule materials |
| Interaction        | `--focus-ring`, `--hover`, `--border`, `--v2-stroke`, `--v2-soft`                                                                                                                                                              |
| Optical materials  | `--v2-glass`, `--glass-soft/nav/hover/border/opaque/label/highlight/sheet`, `--scrim`, `--scrim-light`, `--sheet-scrim`                                                                                                        |
| Ambient            | `--haze-violet`, `--haze-rose`; one low-opacity haze per screen, grain is a shared SVG texture                                                                                                                                 |
| Depth              | `--shadow`, `--shadow-tint`, `--shadow-tint-subtle/soft/strong`, `--shadow-sheet`; focus and semantic rule glow remain separate                                                                                                |
| Fonts              | `--font-display`: Funnel Display; `--font-ui`: Funnel Sans; `--font-mono`: Martian Mono                                                                                                                                        |
| Space              | `--space-4/8/12/16/20/24/28/32/40/48/64/96`; 8-point base, 4-point optical adjustments                                                                                                                                         |
| Radius             | `--radius-small` 12, `--radius-card` 16, `--radius-large` 22, `--radius-sheet` 30, `--radius-pill` 999                                                                                                                         |
| Motion             | `--dur-fast` 180 ms, `--dur-base` 360 ms, `--dur-slow` 520 ms, `--ease-out`, `--ease-spring`; reduced motion uses 150 ms opacity changes                                                                                       |

Desktop page wrap: max 1320 px including 40 px margins. Studio: 24 px margins, 220 px take rail / flexible contact sheet / 300 px Memory, 24 px gutters. Review: flexible image + 380 px inspector, 24 px margins/gutters. At 390 px, margins are 16 px, Studio images use two columns, rails become dialogs, dock becomes a bottom sheet, Review stacks. Headlines use tight tracking; body remains normal tracking. Mono is reserved for frame numbers, check confidence, costs and machine receipts.

## Shared components — `/components/ui/`

- `chrome.tsx`: **Brand**, **Nav**, **Kbd**, **ActionDock**, **ErrorNotice**, **AccessDialog**. One navigation/action/error/access implementation. Native dialogs supply focus containment and Escape behavior; form errors use `role=alert`.
- `motion.tsx`: **MotionProvider**, **MotionLink**, **Ambient**, **RevealHeadline**, **Tilt**, **Brackets**, **Scan**, **InView**. Route transitions, image continuity, grain/haze, word reveal, pointer effects and reduced-motion handling live here. Runtime image geometry, transition identities, pointer coordinates and stagger order belong to these primitives, never page-specific styling.
- `shot-card.tsx`: **ShotCard**, **SharedShotImage**. Real image, shared transition identity, frame number, actual check status, scan/brackets and stagger. Used by Studio and Landing; no invented bounding boxes. Missing locations produce a frame outline.
- `rule-card.tsx`: **RuleCard**, **LearnedRuleCard**. Gold only for learned rules; real prompt/check reach, source rule identity, settle/glow when just learned. Used by Memory and future rule surfaces.
- `inspection.tsx`: **InspectImage**, **CheckList**. Shared loupe geometry, actual confidence indicators, reference-safe crops and missing-location behavior.
- `metrics.tsx`: **Stat**, **ConfusionMatrix**. Shared Evidence/Eval typography, actual API counts, human-metric readiness gate.
- `receipt.tsx`: **ContinuityReceipt**. Real shot checks, timestamp and applied rules, printed with stepped motion.
- `skeleton.tsx`: **ScreenSkeleton**. Shared neutral loading geometry for Studio/Review.
- `/components/shot-image.tsx`: resilient real-image rendering with accessible unavailable state. All image URLs come from real production records.

CSS components (`v2-button`, `v2-field`, `v2-segment`, `v2-glass`, `v2-label`, `v2-skeleton`) are shared classes rather than per-screen restyling. Button variants: primary ink, secondary white, clear, small; disabled opacity and focus treatment remain consistent. Layout classes decide placement, not component appearance.

## State and evidence rules

Missing metric/cost/confidence: `—`. Uncertain/occluded check: `?`, never a confident green/red claim. A failed or empty generation is not 0% improvement. Original take evidence is immutable; rechecks and repaired images retain lineage and are shown separately. Local sample notes are identified as local. Saving a rule does not regenerate anything. Existing-image recheck and flagged-only repair are explicit opt-ins; paid actions use production access and measured pricing only. No fabricated image locations, elapsed times, labels, human accuracy or Undo action.

Loading uses neutral skeletons/scan, not spinners. Error leaves the draft and image available. Disabled controls explain unavailable capability. Long titles truncate only in compact navigation; editable titles wrap/scroll naturally. Focus uses the system focus token. Meaning is repeated in text/icons, not color alone.

Keyboard: Studio **R** review; Review **R** reject, **A** accept, **J/K** previous/next, **Esc** Studio. Shortcuts pause while typing or a dialog is open. Blind Eval owns **Y/N/U** and must never show the monitor verdict before the human answer. Do not test invented human labels against real data.

## Motion rationale

Image continuity ties a contact-sheet tile to the selected shot. Brackets lock onto actual data. The memory sheet rises while the stage blurs, then the new rule settles into Memory; the original shot remains available. These are progress/orientation signals, not decoration. Reference-specific transitions follow `screens/Flow.html`: 220 ms shot changes, 360 ms image continuity, 420 ms sheet, 520 ms rule return, 200 ms Evidence, 260 ms Eval swipe, 1.6 s stepped receipt. Ambient/pointer effects stop for reduced motion and coarse pointers.

## Production integration

`ProductionProvider` keeps a browser-memory snapshot while routes change and always refreshes the API. This preserves shared-image transitions without replacing real records with fixtures. Repaired reviews retain source-frame context. Operation warnings and partial failures remain visible. Auto-start runs only for an authorized, genuinely new production with no existing take, so reloading a failed/ambiguous take does not automatically spend again. `/productions/new` uses the new setup; saved productions open `/p/:id`; existing character/scenes editing remains available from the production switcher. Access-code fields are masked.

All eight source screens are implemented as pages/sheet: Landing, New production, Studio, Review, Memory update, Evidence, Blind Eval and API. Layouts reuse the shared modules above. No page JSX styles or page-local color literals are permitted.

## Reference fidelity — Studio

Canvas is the supplied warm `#FBFAF8`; near-black is `#111111`. Bright image brackets are separate from accessible text and filled red actions. Gold cards use the source pale paper fill and border; rule metadata uses a darker gold for contrast. Large secondary headline text keeps AA contrast. Model labels remove only a recorded date suffix and retain the full value on hover. Scene captions derive from the actual prompt, with the full prompt retained as image alternative text and caption title. Missing coordinates still outline the whole frame. Real uncertainty, rule reach and recorded take history supersede illustrative source data.

## Reference fidelity — Review

The complete check list uses compact rows: canon and model-reported confidence are visible; keyboard-native details expose the full observation and note. Failed checks appear first. Actual uncertainty remains neutral. Confidence fills from zero over one second; reduced motion shows the final value immediately. The 4× loupe includes a 14px reticle and samples only the actual image. Without returned coordinates it rests at the image center and follows the pointer, rather than inventing a defect location. Filmstrip entry rises 12px; both filmstrip and J/K use the 220ms shot transition.

## Reference fidelity — Memory update

`/components/ui/memory-update.tsx` owns the shared native sheet, real returned rule, three reach choices, prompt/check previews, errors and permission-aware action. The heading receives initial programmatic focus; a keyboard-focusable content region scrolls independently, leaving Close and both footer actions visible at 390px and on short desktop screens. No code is painted beneath a floating footer. Source gold halo, pale paper fill, 24px glass blur and settle animation are shared tokens. IDs are abbreviated visually with the full saved identifier on hover. Re-check and repair remain opt-in and estimates remain unavailable until measured; saving future memory never silently regenerates. Native modal focus containment and Escape are retained.

## Reference fidelity — Landing and motion

Landing keeps the supplied editorial headline rhythm (74px desktop, 40px mobile, tight tracking and AA secondary tone), two ambient haze fields, film grain, full real Mara frame, glass criterion HUD, floating drift callout and bottom-left gold memory card. “Carried forward” describes demonstrated prompt/check memory; “never repeated” is not claimed. The contact sheet uses the same image component and actual uncertainty as Studio; it opens the matching recorded take. A shared `production-stage` transition links the landing hero and reference drop zone; `start` lasts420ms, Mara480ms. Shared motion includes 8px blur/.25em word reveal with45ms stagger, 9°/11° card tilt with250ms soft-light sheen, and34px viewfinder cursor following at.25 easing only over imagery. Reduced motion disables movement. Supplied logo/favicon remain exact; the provided cover is the automatic Open Graph image, with descriptive alternative text.

## Production catalog

`ProductionCard` reuses the real-image, Tilt and MotionLink primitives. `/productions` always renders Mara first, with the actual GET reference and a supplied real-image fallback while loading. Owned entries follow the existing production-list API order and use each production's authenticated reference endpoint. Empty, loading and retry states never remove the sample. The catalog uses the public brand, warm ambient treatment, shared typography and one Start action; long names wrap within cards. Three columns become two, then one at390px.

## Reference fidelity — New production

The reference image leads the same1280px content grid and1.25:1 columns as the supplied screen; the character name lives in the Cast row beneath it. First use shows a supplied real Mara image explicitly marked Example, never an uploaded/confirmed character. Actual uploads replace it; only returned/edited canon is overlaid, with real detail/unconfirmed counts and no invented region boxes. The original upload, side confirmation, scene validation, script import and production-creation routes remain intact. Editing canon text clears that row's previous side confirmation, preventing stale anatomical choices from silently overriding a new instruction. Native form verification exercised Left→editRight→both unconfirmed and removed the temporary local row; no upload, production, review or AI request was sent. The dock keeps actual scene counts and measured estimates; example imagery cannot enable Generate.

## Reference fidelity — Evidence

The shared detail layout now matches the source1280px content width. Evidence uses40px real counts on warm stat surfaces, the original24-shot image thread, source170px/110px row tracks,14px row spacing and bottom-right gold halos. Shared `CountUp` animates known values over200ms and keeps missing values as an em dash; screen readers receive the actual target. `MemoryThreadDot` enters through the shared visibility observer with70ms column stagger. Reduced motion shows final values immediately. Rule reach compares actual dual prompt/check reach against original shots since its first recorded application. Every changed scene set is marked; invented accepted/taught states are never copied from the source. The existing measurement note includes the completed matched study's aggregate counts imported from Main's derived JSON, with human review pending. The original operational curve and matched study remain separate. Evidence/Eval query metrics through Main's owner-scoped GET endpoint; human labels still require explicit human submission.

## Reference fidelity — Blind review

`QuestionDeck` accepts only the blind question packet, frame caption and motion choice; it receives no monitor verdict/confidence. Original shots keep actual frame/scene labels, while additional study images use the neutral Study frame label. The complete image stays contained. Right/left guidance refers to the character without inventing camera orientation. Three real images deal from the right at60ms stagger with preserved back-card opacity. Source-sized stacked answers retain Y/N/U; yes exits left, no right, unsure down, at260ms/8°. Only an actual increased confusion-matrix count bumps1.08×, guarded by a focused regression; uncertainty invents no changed cell. All metric reads use GET, labels require explicit human input, and no QA labels were submitted. Precision/recall remain unavailable below20 judgments. Mobile preserves the layered deck and puts the answer controls above the fold. Landing's stored final check is labeled Checked. Memory reach choices reset to future-only whenever the sheet reopens; an abandoned re-check/fix choice cannot carry into a later correction.

## Reference fidelity — API

The connected four-node pipeline uses source-sized left-aligned cards, dashed links and semantic gold memory; a red monitor outline appears only when the actual displayed check is flagged. Recorded model aliases keep full versions in titles. Shared `CodeBlock` preserves request text exactly while adding accessible syntax colors; keyboard-focusable horizontal scrolling keeps long real authenticated examples inside the panel. Endpoint cards distinguish GET reads, including owner-scoped metrics, from POST actions. Shared `ContinuityReceipt` prints from a slot using a1.6s stepped clip reveal with reserved layout space, a1.5° paper angle and serrated edge. Reduced motion reveals the final receipt immediately. Every check, confidence, rule count and timestamp comes from the selected real shot/trace; long observed evidence remains available in titles. No unsupported model integrations, public sample writes or fabricated receipt fields are copied from the illustrative source. Desktop1440 and mobile390 were checked; page width stays390 while code scrolls independently.

## Optional location reference

Shared `LocationReference` reads the owner-scoped locations API and appears only when a real record returns. Memory shows the reviewed still through its image endpoint, preserving the complete image. This is reference context, not a generation or checking claim. The Marble world is private: its caption is non-interactive and explains permission is required; no dead viewer action is offered. Missing/error responses hide optional context without interrupting review. No duplicate binary, external world generation, or permission change is introduced.

## Recovery states

Shared `RecoveryScreen` supplies branded missing-route and render-error states using the same headline, ambient, brand and navigation primitives. One action returns to the production catalog, where Mara remains available. Recovery does not replay a generation/review, expose an internal error or replace actual data with a fabricated result. Inline request errors continue to preserve the current work and provide their existing explicit retry.

Flow01 names the landing hero stage and New reference zone as the same shared surface only during Start navigation. Its420ms geometry follows the supplied flow; the outgoing headline lifts12px. Other routes retain their shot-specific image continuity. Reduced motion skips geometry and preserves the150ms fade policy.
