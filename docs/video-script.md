# Scripty — two-minute VC pitch and demo

Approximately 240 spoken words, with space for screen actions. Rehearse at a calm pace and cut to exactly 2:00. Use the final tested deployment and evidence in `handoff/results.md`. The script demonstrates persistent memory; it does not promise a falling drift curve.

| Time | Voiceover | Screen |
| --- | --- | --- |
| 0:00–0:12 | “On a film set, the script supervisor—the scripty—keeps continuity between shots. Same costume. Same prop. Same hand. AI filmmakers need one too.” | Real Mara reference next to the captured wrong-hand ring shot. Enlarge the visible detail. |
| 0:12–0:25 | “Meet Scripty: your AI script supervisor. A generator can say success while the story breaks. Scripty checks the image against the character sheet and the project's memory.” | Scripty wordmark, character sheet, then expected and observed values. Keep the mode badge visible. |
| 0:25–0:42 | “Here is Mara, across six generated shots. Her silver ring belongs on her right hand. I reject this shot and explain the mistake. Scripty turns that correction into one testable rule.” | Six real baseline images. Select the ring shot, enter the actual correction, reject, and show the rule. |
| 0:42–0:58 | “That rule survives refresh. Repeating the correction merges it into the same memory. The next scene gets the constraint in its generation prompt, and its monitor checks the rule too.” | In a verified live run, refresh and show persistence; show dedupe and a different scene's recorded prompt and monitor context. Cut around API latency with recorded evidence. |
| 0:58–1:16 | “This is continual learning through project memory. The traces show what changed and where it was applied. Our chart reports monitor flags; proving better images needs a fixed review standard. We are still validating that.” | Rule-applied traces, different scene, then actual chart with monitor versions and verification status. Flags do not equal true errors. |
| 1:16–1:32 | “Our first users would be AI production teams making recurring characters for ads and episodic stories. Every repeated correction is an opportunity to retain a production decision and test it on the next scene.” | Project overview, memory, buyer caption: “Initial buyer hypothesis: AI production teams.” |
| 1:32–1:48 | “We would charge for creative-review seats and checked generations. The business test is fewer rerolls and less review time. Those savings are a hypothesis today. The durable asset is the project's approved continuity memory.” | “Proposed: seats + checked generations.” No invented prices, customers, revenue, or savings. |
| 1:48–2:00 | “Next: video continuity and, eventually, real-time world models such as Reactor. For now, one correction becomes memory for the next scene. Scripty. Keep the story straight.” | “Future” label for video/world models; real app, wordmark, latest tested URL. |

## Mode-specific recording lines

- If showing cached playback, prepend “This is recorded playback of a real run” at 0:25 and shorten the following sentence. Show captured persistence and different-scene context as recorded evidence. Do not act out a browser-local cached correction as a new server-persisted learning event.
- If the final new-scene run is not verified, replace the dependent portion at 0:42 with: “That rule survives refresh. Repeating the correction merges it into the same memory. Next, we are testing whether it helps on different scenes.” Show only proof actually captured.
- If a human has verified final comparisons, replace the last sentence at 0:58 with one concise result copied from `handoff/results.md`, including sample counts. Remove the same number of words elsewhere to preserve timing. If results are flat or worse, say so.

## Recording checklist

- Verify the selected ring failure visually before recording. Monitor flags alone cannot establish it.
- Use the final tested Vercel URL and show live or recorded-playback status.
- Keep draft labels provisional; no human accuracy claim without human verification.
- Show actual prompt/rule provenance for a different new scene; do not relabel a historical baseline as a learned generation.
- Keep the shared video to 2:00 and confirm its link opens without login.
- Capture only the app window; keep keys, account dashboards, and private handoff details out of frame.
- Submission deadline: October 17, 2026, 1:15pm PT. Target assets ready by 10:45am PT; external submission requires the user's authorization.
