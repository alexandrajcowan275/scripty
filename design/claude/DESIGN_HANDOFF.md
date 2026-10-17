# Scripty: Claude Design handoff v2 (source of truth for the UI)

Open `design/claude/screens/*.html` in a browser. They use **real Mara shots** from `design/claude/img/`, which are compressed copies of `seed/cache/images`. In the app, load the real images through the existing cache/Supabase URLs. These screens are the target for **layout, flow, interaction and visual language**. Figma owns color tokens only; fonts are Funnel Display / Funnel Sans / Martian Mono.

**Never hardcode mock values.** Bind every number, ID, confidence score and label to real data. If a value is missing, show "—". Mock-only values to replace include the costs ("~$0.05"), the 6/40 eval counts and the confusion-matrix numbers.

## Visual language: "the script supervisor's contact sheet, in glass"
The references are Runway (real cinematic imagery as the hero), Natural (radical whitespace, two-tone statement headlines) and Michelle Liu (iridescent haze, frosted glass labels over imagery, tactile objects).

- **Real imagery everywhere.** Never use empty placeholder boxes.
- **Glass HUD over images.** Frosted pills for frame IDs and status. Red viewfinder brackets around the drifted region (from check location; if there's no location, use a frame outline). A glass checklist panel.
- **Iridescent haze.** A soft lavender/pink radial blur in one corner of each page. One haze per page, low opacity.
- **Two-tone headlines.** The statement is in ink; the continuation is in `#B9B5AF`. Weight 400, tracking -0.04em.
- **Colors carry meaning only:**
  - red `#FF4D4F` / `#D93A3F` = drift
  - gold `#F5C451` / `#B07800` / `#FFF8E1` = memory and learned rules
  - green `#1F9D57` = on-model / accepted
  - everything else is ink on `#FBFAF8`
- **Fonts: Funnel Display (headlines), Funnel Sans (UI), Martian Mono (all data)** — Geist is no longer used.
- **Mono (Martian Mono)** for frame IDs (T4·S05), confidences, costs, receipts and traces.
- **Floating glass action dock** at the bottom center for primary actions, instead of scattered buttons.
- **Tactile objects:**
  - a continuity receipt for each check result (API page)
  - a stack of shot cards in blind eval
  - a zoom loupe on the drifted detail in review
- **Logo:** `design/claude/logo.svg`. It's a black rounded square with white viewfinder corners and a red "record" dot. Wordmark: lowercase **scripty**, Funnel Display 600, tracking -0.03em. Use it as the favicon too.
- **Motion** (≤250ms, ease-out):
  - the memory card lands with a gold glow ring
  - shots fade in sequentially
  - the loupe follows the bracket

## Product decisions baked into these screens
1. **Rules never force regeneration.** After a reject, the **Memory update** sheet lets the user choose how far the rule reaches:
   - *Every future take*: free, on by default.
   - *Re-check existing shots*: vision-only re-check of stored shots, no new images. Cheap, and the scalable path.
   - *Fix shots that break it*: regenerates only the flagged shots.
   Notes collect in Memory while you review a batch, and you apply them when you're done. This works for one shot or for a 500-shot production.
2. **The monitor learns too.** In blind eval, the human labels the shot before seeing the monitor's verdict. "Monitor is wrong" and "false alarm" labels become per-production checker calibration notes.
3. **Ask about left/right once.** New production auto-proposes canon from the reference image with a vision call, then asks the user to confirm laterality (left/right). That's where the drift happens.
4. **Quick vs Studio.** Quick covers one character and a few scenes (small creators). Studio adds full script import, a cast of characters/locations/props, model choice and API keys (pro teams). Both run the same engine.

## Screens → routes → data
| Screen | Route | Notes |
|---|---|---|
| Main.html | `/` | Hero = a real flagged shot with a live glass checklist. The status pill uses real counts. A contact sheet of the latest take. |
| NewProduction.html | `/new` | Inline-editable title. The reference shows detection pins and boxes from a vision call (if detection isn't built, show the pins as a list only, no fake boxes). Canon rows have a weight and a L/R confirm. Scenes: paste a script and it gets split. The dock shows model, shot count and an estimated cost computed from real pricing. |
| Batch.html | `/p/[id]` | **Studio.** Left: takes timeline (mini 6-cell drift map per take, gold dot = carried a learned rule, sparkline). Center: contact sheet with glass tags and status. Right: Memory (reference, rules, applied counts). Dock: Review N drifted (R) · Re-check with memory · Fix drifted only · Generate take N+1. |
| Review.html | `/p/[id]/shot/[shotId]` | Big shot, brackets, glass callout, loupe, filmstrip. Segmented control: Shot / side-by-side with reference / compare takes. Inspector: verdict headline, all checks with confidence bars (gold dot marks a check that exists because of a learned rule), editable note + quick chips, Reject & remember (R), Looks right (A), Fix this shot. J/K for next/prev, Esc to go back. |
| Learned.html | modal sheet after a reject | Blurred studio behind it. A gold rule card with merge info. Rule-reach options. Next-prompt and next-check diffs. Undo, Next drifted shot, Save to memory. |
| Progress.html | `/p/[id]/evidence` | Two-tone headline, a 4-stat strip, and the **memory thread**: takes × shots grid of real thumbnails (red outline = drift, gold outline = taught a rule, green = accepted look, gold dot = rule applied). Ends with the honest caveat. |
| Eval.html | `/p/[id]/eval` | Blind, one question per card (Y/N/U keys), a stack of upcoming shots, a live confusion matrix. Precision/recall appear only after 20+ labels. Saves to labels and calls `POST /api/eval`. |
| Developers.html | `/developers` | Pipeline strip, curl examples for real routes only, and the continuity receipt (render a real check result). |

**Responsive at 390px:**
- the Studio rails become drawers
- the dock becomes a bottom sheet
- grids drop to 1–2 columns
- the inspector stacks under the image

**Honesty:**
- Show only the real rates: 2/6, 0/6, 0/6, 1/6. Note that Take 4 used new scenes.
- Claim memory carry-forward, not proven visual improvement.
- Accuracy shows "—" until human labels exist.


## Transitions
See screens/Flow.html for all 11 page transitions and motion tokens. Motion reference: prototype/scripty-studio.html.
