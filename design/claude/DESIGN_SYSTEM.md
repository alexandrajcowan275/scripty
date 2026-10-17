# Scripty UI system

Implementation source: `/styles/tokens.css`. Screen/layout rules: `/styles/ui-v2.css`. Fonts are self-hosted in `/public/fonts`; their licenses ship alongside them. Color literals belong in tokens only. Pages compose the components below; do not add page-local hexadecimal colors or JSX style props.

## Tokens

| Purpose            | Tokens                                                                                                                                   |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Canvas and imagery | `--background` warm off-white, `--surface` white, `--image-bed` neutral image backdrop                                                   |
| Text and hierarchy | `--text`, `--muted`, `--muted-strong`, `--v2-tone` (large secondary headline text only)                                                  |
| Meaning            | `--drift` red: monitor flag; `--pass` green: on-model; `--memory`, `--memory-fill` gold: learned rule                                    |
| Interaction        | `--focus-ring`, `--hover`, `--border`, `--v2-stroke`, `--v2-soft`                                                                        |
| Optical materials  | `--v2-glass`, `--glass-soft/nav/hover/border/opaque/label/highlight`, `--scrim`, `--scrim-light`, `--sheet-scrim`                        |
| Ambient            | `--haze-violet`, `--haze-rose`; one low-opacity haze per screen, grain is a shared SVG texture                                           |
| Depth              | `--shadow`, `--shadow-tint`, `--shadow-tint-subtle/soft/strong`; focus and semantic rule glow remain separate                            |
| Fonts              | `--font-display`: Funnel Display; `--font-ui`: Funnel Sans; `--font-mono`: Martian Mono                                                  |
| Space              | `--space-4/8/12/16/20/24/28/32/40/48/64/96`; 8-point base, 4-point optical adjustments                                                   |
| Radius             | `--radius-small` 12, `--radius-card` 16, `--radius-large` 22, `--radius-sheet` 30, `--radius-pill` 999                                   |
| Motion             | `--dur-fast` 180 ms, `--dur-base` 360 ms, `--dur-slow` 520 ms, `--ease-out`, `--ease-spring`; reduced motion uses 150 ms opacity changes |

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
