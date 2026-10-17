# Scripty — brand guide

**Positioning.** Your AI script supervisor. Continuity memory and monitoring for AI-generated stories.

**Name and story.** On set, the script supervisor—the “scripty”—tracks details that keep separate shots continuous. Scripty carries that production habit into AI image workflows: inspect the shot, retain the correction, carry the instruction into the next scene. The name is always **Scripty**, pronounced “script-ee.”

**Wordmark and mark.** Set Scripty in a restrained sans serif with a capital S. A small frame corner paired with a production-note tick can suggest a shot and a retained decision. Keep the mark simple at filmstrip size and quieter than the footage. This is a logo direction; a final logo asset is not included.

**Creative direction.** A professional film-editing suite with calm, legible monitoring. A filmstrip keeps shots central. Reference, memory, and inspector sit beside the work so a creator can move from a visible mistake to a usable instruction.

| Token | Hex | Meaning |
| --- | --- | --- |
| Background | `#0B0B0D` | Receding canvas |
| Surface | `#141418` | Main working panes |
| Raised | `#1C1C22` | Controls and selected details |
| Border | `#2A2A33` | Quiet separation |
| Text | `#EDEDF0` | Primary reading |
| Muted | `#8A8A96` | Supporting text; verify contrast at actual size |
| Drift red | `#E5484D` | Continuity flags and alerts |
| Pass green | `#3DD68C` | A check passed |
| Memory gold | `#F5C451` | Retained constraints and learning events |

**Typography and interaction.** Geist Sans for interface text; Geist Mono for confidence, batch counts, metrics, and traces. Use aligned numbers and clear labels. Pair color with text and icons. A thin red frame identifies a flagged shot; a brief gold arrival marks a learned rule. Keep motion below 250ms and respect reduced motion. Provide visible focus and keyboard review, with stacked panes on narrow screens. Fonts are bundled locally.

**Voice.** Sound like an attentive production colleague: calm, specific, economical. “Ring observed on the left hand; expected right.” “Hand occluded; unable to verify.” “Correction saved to Scripty Memory.” Explain what evidence supports. Label live calls, recorded playback, browser-local replay edits, and draft labels clearly. Use “learned project rule” for memory; do not imply model retraining or guaranteed consistency.

**Message hierarchy.** Lead with “Your AI script supervisor.” Explain the loop with “Check the shot. Keep the correction. Carry it forward.” Close with “Scripty. Keep the story straight.” Treat reduced rework and better continuity as goals until measured.

**Production note.** The companion `docs/brand-guide.pdf` is a one-page handout, rendered and visually verified. The app's CSS tokens are the implementation source of truth. Internal repository names and environment-variable prefixes retain their existing spelling for compatibility.
