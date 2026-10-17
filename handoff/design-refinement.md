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
