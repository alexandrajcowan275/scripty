# Scripty — brand guide

**Your AI script supervisor. Every correction carries forward.**

On a film set, the script supervisor—the “scripty”—tracks the detail an editor needs between shots. Scripty brings that memory to AI production. Pronounced “script-ee”; lowercase **scripty** in the interface wordmark. Repository, folder and Vercel project remain `canon`.

## Current direction

A script supervisor's contact sheet, in glass: real cinematic frames, generous space, frosted image labels, restrained lavender/rose haze and tactile production notes. Runway informed the image-led restraint; Natural informed the editorial voice. Their logos, layouts and assets are not reused.

[Claude design handoff](../design/claude/DESIGN_HANDOFF.md) and [shared design system](../design/claude/DESIGN_SYSTEM.md) are the current implementation references. [Live token source](../styles/tokens.css) is authoritative for exact values; earlier light-v3 explorations and the older PDF handout are retained as history.

| Role | Current token | Meaning |
| --- | --- | --- |
| Canvas | `#FBFAF8` | Warm contact sheet |
| Surface / ink | `#FFFFFF` / `#111111` | Quiet controls and confident type |
| Secondary | `#615E58` | Supporting copy |
| Drift ink / fill / outline | `#B4232C` / `#D93A3F` / `#FF4D4F` | Model-reported flags |
| Pass | `#147A42` | On-model finding, not human truth |
| Memory fill / ink | `#FFF8E1` / `#8A5D00` | Learned constraints |
| Focus | `#2858B8` | Keyboard accessibility |

Funnel Display leads headlines; Funnel Sans carries UI; Martian Mono identifies actual frame numbers, model versions, costs and traces. Fonts are served locally. Use the existing primitives, spacing, radii and responsive rules instead of one-off styling. Desktop rails become mobile drawers; the Memory sheet keeps its header/actions visible while the evidence body scrolls.

## Images and motion

Studio uses real contact-sheet crops; Review preserves the full image and offers a reference comparison and loupe. Use location-based brackets only when actual coordinates exist; otherwise outline the frame. Unclear evidence stays distinct from a confident pass or failure. Example references are explicitly labeled and cannot enable generation until a real upload is supplied.

Motion follows the supplied transition prototype and reduced-motion setting: staged shot entry, restrained glass sheen, a settling gold Memory card, a moving loupe and short shot-step transitions. Source timings and easing live in shared tokens/components; no invented live counters or success before a saved response.

## Voice and evidence

Confident, cinematic, specific: “Noted. On the next take.” “Every correction carries forward.” Keep visible copy short. A monitor flags or questions a detail; human review decides. Learned memory adapts prompts/checks, not foundation-model weights.

The controlled study found0/6flags in both arms; it does not support a guaranteed drift-reduction slogan. Use less drift as the goal and memory transfer as the demonstrated claim. Unknown values display “—”; prices are measured estimates, confidence is model-reported, and human accuracy appears only from actual labels.

Use the supplied Scripty logo, light variant on dark surfaces, and the founder-provided cover. Current screenshots and [measured results](results.md) take precedence over illustrative numbers in the original visual prototype.
