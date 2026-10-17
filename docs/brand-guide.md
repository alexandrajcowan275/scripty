# Canon — brand guide

**Positioning.** The continuity memory and monitoring layer for AI-generated stories. A production bible that learns from the creator's decisions.

**Name and mark.** Canon means the established facts of a story. Set CANON as a restrained wordmark; a frame/bracket motif can suggest a camera gate and a fixed reference. Keep the identity quiet so the footage and review evidence stay dominant.

**Creative direction.** A professional film-editing suite meets a calm observability console. Dense enough for a working editor, with clear grouping and generous inspection space. Filmstrips communicate temporal production; memory lives beside the footage rather than on a separate dashboard.

| Token | Hex | Purpose |
| --- | --- | --- |
| Background | `#0B0B0D` | Receding canvas |
| Surface | `#141418` | Main working panes |
| Raised | `#1C1C22` | Controls and selected details |
| Border | `#2A2A33` | Quiet separation |
| Text | `#EDEDF0` | Primary reading |
| Muted | `#8A8A96` | Supporting text; verify contrast at its actual size |
| Canon red | `#E5484D` | Drift and alerts only |
| Pass green | `#3DD68C` | Passed checks |
| Memory gold | `#F5C451` | Learned constraints and memory |

**Typography.** Geist Sans for interface text; Geist Mono for confidence, batch numbers, metrics, and traces. Tight hierarchy, readable labels, aligned numbers. Fonts are bundled locally; the app does not depend on runtime font requests.

**Interaction.** Red frame and a labeled badge identify drift. A brief gold arrival highlights a learned rule. New shot cards enter in order. Motion stays below 250ms and respects reduced motion. Visible focus, descriptive labels, and A/R review shortcuts support keyboard work; narrow screens stack panes.

**Voice.** Precise, calm, evidence-led. Say “Scarf observed blue; expected red” and “Unable to check the occluded hand.” Distinguish live checks, cached playback, draft labels, and measured results. Avoid anthropomorphic certainty and unsupported claims about improvement.

**Product promise.** “Canon: the more you use it, the less your AI drifts.” Treat this as the intended direction of the product; report experimental results as observed, even when flat.

**Export.** This guide is designed to fit a concise one-page handout; export after checking final type scale and margins. The app's CSS tokens remain the implementation source of truth.
