# Scripty studio refinement — October 17, 2026

Reference: founder-provided Natural dashboard screenshot and https://www.cosmos.so/alexandrajcowan/scripty. References supply hierarchy, restraint, material and atmosphere; no layouts, logos or moodboard imagery are copied into Scripty.

## Round 0 — honest assessment at 1440 px

Baseline: released f3ebd74, with the local browser's actual Mara records. Screenshots are `round-0-dashboard.png`, `round-0-studio.png`, `round-0-review.png`, and `round-0-evidence.png`. Session-specific learned notes can change counts; no display values are invented for these comparisons.

Natural's useful quality is proportion: a small title, one readable metric, a quiet plot, then entities and activity. The surrounding interface stays neutral. The moodboard's useful quality is controlled contrast: cool light, a precise dark visor edge, and a single warm highlight. Neither reference suggests purple haze, bouncing UI, or a container around every control.

### The five worst problems

1. **Too many competing materials and colors.** Studio, Review and Evidence have pink/purple ambient light; learned rules use broad yellow fills; green badges, red buttons, red outlines and bright dots compete with the photographs. A studio tool should be cool and neutral, with one restrained memory accent and red attached to actual drift. Use dark primary actions, quieter pass states, solid readable HUDs and a faint chrome edge. Keep the source photographs unchanged.
2. **Too many nested pills and cards.** Navigation is a pill inside a pill; frame IDs, every status, take rows, notes, quick chips and action docks share a soft capsule treatment. This makes minor metadata compete with decisions. Flatten the nav, make HUD tags compact rectangles, reserve pill shapes for primary actions, and use space rather than a box around each section. Keep every control and route functional.
3. **Type is too loud and insufficiently differentiated.** The dashboard's 104 px number dominates the production cards; its 42 px page title and Evidence's 46 px marketing headline are oversized for a working app. Studio's three separate claims share a 28 px line. Use a 30–32 px page title, 64 px primary dashboard number, 22–24 px working headings, 13–14 px secondary text and monospace only for frames/data/keys. Make Take 4 the heading and its real counts subordinate.
4. **The image does not consistently win the hierarchy.** Studio gives 220 px to a take rail and 300 px to Memory, squeezing six images into the middle. Review wraps a long blank inspector in a large rounded card. Evidence surrounds its photographs with heavy outlines and luminous memory dots. Give the central contact sheet more width, flatten the inspector surface, and shrink the memory dots while retaining every real flag, rule and accepted state. Never crop, grade or otherwise change Review/Evidence image content.
5. **Decorative motion undermines crispness.** Studio images enter through a 20 px blur with staggered delays; hover tilt and glints move the contact sheet; rule dots glow and confidence bars take a full second to resolve. The first Studio capture was visibly blurred because of that entrance animation. Keep images legible immediately; use short, purposeful 150–220 ms transitions for state changes. Keep scan, drift brackets, keyboard feedback and reduced-motion behavior.

### Screen-by-screen diagnosis

| Screen | What feels amateur | What should remain | Targeted correction |
| --- | --- | --- | --- |
| Dashboard | Giant number, large floating chart card, multiple shadow styles, broad empty color haze, capsule selection treatment | Real aggregate totals, the honest 33/0/0/17 take history, learned-rule marker, Mara-first cards and actual activity | Quieter title/metric scale; flatter chart/table; consistent 24/32 px section rhythm; a single selected-nav treatment |
| Studio | Rainbow haze, cramped header, a prominent red action dock, broad yellow rule tiles, entrance blur | Real six-shot contact sheet, take maps, Memory, drift brackets and all actions | Narrower rails, a clear Take heading, compact metadata tags, black primary review action, smaller warm memory cues |
| Review | Repeated rounded shells; grey glass callout with tiny low-contrast canonical text; several pill-shaped minor controls | Large original shot, real checks/confidence, filmstrip, loupe, note, quick chips, accept/reject and keyboard control | White readable callout with restrained red edge; quieter segmented controls; one consistent inspector gutter and action hierarchy |
| Evidence | Marketing-size heading, loud metric row, glowing dot on 18 photographs, heavy repeated borders | All 24 original shots; actual rates; rule prompt/check reach; merge count; missing accuracy and causal/human-label caveats | Working-page title; clean metric strip; small flat memory marks; preserve disclosure and full evidence integrity |

## Guardrails

- No API, database, generation, review decision, label or trace changes.
- No fabricated data, causal claims, or accuracy claims.
- No changes to original image files, API image URLs, Review/Evidence image filters or source-coordinate callouts.
- Preserve R/A/Esc/J/K and native focus behavior; no paid calls during verification.
- Build and tests before each handoff; Main owns deployment; stop releases at 9:30 am PT.

## Subsequent rounds

Record the next five visible issues after each corrected screenshot set, then fix and recheck them. A clean result should need less explanation, not more decoration.

## Round 1 — hierarchy, then working Home (08:38 PT)

Fixed the five issues through a shared workspace scope: quieter neutral backgrounds, small rectangular HUD labels, 30px working titles, wider Studio contact sheet, less inspector boxing, immediate image legibility, 180ms confidence transitions and smaller memory marks. The founder then replaced the dashboard reporting brief with a work-first Home. The earlier metric is removed entirely, and the actual take chart is now on Evidence.

Home now answers the first-time user's question before anything else: **Needs review** displays only pending flagged shots, with real findings and direct Review links. Accepted and rejected flags remain historical evidence. Productions follows with Mara first, then recently learned non-seed rules, Agents and activity. Agent health is not exposed by the backend: the interface says status unavailable and uses real recorded run timestamps. No invented live/running state. The neutral mountain photograph is a shallow atmospheric header, not product evidence.

Screens checked at 1440 and 390. No document overflow on Home, Studio or Review. Evidence retains all 24 original images with computed filter `none`. The review image also has filter `none`; no review labels or decisions were mutated. Home has a meaningful regression test for pending-only queue membership. Standard tests 91/91; build passes.

Remaining visual concerns for the next pass: long raw monitor observations need a readable summary/full-detail hierarchy; long production names must not displace navigation; mobile activity needs an obvious scroll affordance; the new landing photograph must not compete with real product content; photo motion must be pausable and static under reduced motion.

## Round 2 — cinematic introduction (08:40 PT)

Founder explicitly replaces visor/fashion art with real cinematic photography. Four Pexels scenes use responsive 1600/640px WebP files, totaling approximately 452KB desktop or 106KB mobile across the complete four-scene sequence. Actual source pages and free-use license are recorded in public/brand/CREDITS.md; images are atmosphere, not generated Scripty outputs. Earlier fashion files are retained unused.

The first viewport has one headline, the founder's exact wording, and a production action. White type and a steady dark scrim establish hierarchy over slowly crossfading scenes; there is no pan/zoom, blur, color effect or invented camera metadata. The header and footer align to a 1296px grid with 72px desktop gutters and 24px mobile gutters. A 32-second CSS loop provides two-second dissolves; Pause stops every layer, and reduced motion disables the sequence and shows the first photograph. No timer-driven React renders. One h1 on the page; the existing Mara scan is the next section under a smaller h2, separated from the atmospheric stock photography.

At 390px the headline fits without overflow, the mobile picture sources are selected, and Open studio, Start a production and Watch it on Mara retain their destinations. Playback and Pause states verified through rendered computed animation states. Review/Evidence images are not changed by this pass.

## Final restraint review — screen comparisons

Final 1440px contact sheets are `compare-2-dashboard.png`, `compare-2-studio.png`, `compare-2-review.png`, and `compare-2-evidence.png`. The Natural reference is used for type scale, alignment and quiet surfaces; the moodboard is reference material only and contributes no assets. Home deliberately prioritizes the founder's work queue rather than reproducing Natural's financial metric/chart composition.

- **Home:** the first actionable section is visually dominant and the other sections share one rhythm. Real monitor findings can be verbose; the queue caps their visual height and Review retains full detail. No synthetic data fills the unused column or adds productions. The shallow photographic band contributes atmosphere without displacing the queue. Agent status remains honestly unavailable.
- **Studio:** the contact sheet is substantially wider; white HUD tags are small, memory orange appears only on learned rules, and the black action dock has a clear review action. Existing scene labels and status chips are retained to preserve the supplied rich demo rather than reduce it again. Source photographs appear immediately without entrance blur.
- **Review:** the photograph occupies most of the page; the inspector is a quieter white working surface. Red attaches to the actual finding, the on-image annotation remains within the image, and keyboard shortcuts and loupe stay visible. The mobile callout sits away from Mara's face and the original image is ungraded.
- **Evidence:** the small heading, flat data strip and chart precede the 24-image memory thread. The upward final rate remains visible (33/0/0/17), and the causal/human-label limitations remain present. The chart's small “View evidence” self-link is redundant after relocation; this is a non-blocking cleanup opportunity, not a data or navigation failure.

No claim is made that these pages copy either reference or are visually indistinguishable from another product. Their strongest improvement is a consistent hierarchy: photograph, finding, next action. All feature work is handed to Main; remaining work is public verification only. Freeze remains 9:30am PT.
