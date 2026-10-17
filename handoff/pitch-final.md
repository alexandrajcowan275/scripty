# Scripty — final submission copy

Public app: https://canon-woad.vercel.app
GitHub: canon repository is currently private; provide judges an accessible repository link before submission.

## Tagline
Your AI script supervisor. Every correction carries forward.

## Devpost description
On a film set, the script supervisor keeps the story straight between shots. AI production needs that memory too: a generator can return success while a character detail changes.

Scripty checks generated shots against a character reference and project rules. A review correction becomes a short, persistent continuity rule. Future generation prompts receive that rule, and the monitor checks it. Accepted shots can become positive visual references. The creator can inspect the image, the finding, and the production note behind it.

Built with Next.js, TypeScript, Supabase, reference-based image generation, and a separate structured vision monitor, Scripty connects shot review to reusable project memory. Mara is a sample production containing genuine images and original engine history. Viewer edits stay browser-local; original prompts and traces remain inspectable.

## Four judging angles

**Continual learning.** A recorded ring correction persisted, deduplicated on repeat, and reached all 18 subsequent new-scene generation prompts and monitor outputs. Learning happens through project memory and prompt adaptation; foundation-model weights stay fixed.

**Visual design.** A cinematic, image-first workspace puts the shot and review decision first. Short production notes, a gold memory cue, and evidence on demand make the correction-to-memory relationship visible without overwhelming the footage.

**Agent monitoring.** Successful generation calls can conceal continuity failures. A separate monitor exposes expected versus observed attributes, flags, uncertainty, and applied-rule traces. Its findings remain reviewable because the checker can make mistakes too.

**Scale.** Our initial buyer hypothesis is a small AI production team creating recurring characters. Proposed pricing combines review seats and usage per checked generation. A pilot would test review minutes and total generation cost per approved shot under a fixed review standard. Customers, pricing, savings, and billion-dollar potential are unvalidated. Expansion could include a continuity API and video workflows.

## Evidence caption
24 real images, four six-shot batches: monitor flags **2/6 → 0/6 → 0/6 → 1/6**. Baseline is a disclosed v3 recheck; original checker outputs are retained. Image model, quality, style, and scenes changed; rules also changed monitoring, and batch four added an accepted reference. Uncertain checks were 4/36, 6/42, 8/42, and 6/42. These are operational results, not human-verified accuracy or causal improvement. See [recorded results](results.md). The final rate increased; no batch was discarded.

## Two-minute voiceover

On a film set, the script supervisor—the scripty—keeps continuity between shots. Same costume. Same prop. Same hand. AI filmmakers need one too.

Meet Scripty: your AI script supervisor. A generator can report success while a character detail changes. Scripty checks the shot against the character sheet and project memory.

This is Mara, our sample production from real runs. Here is Mara across six generated shots. Her silver ring belongs on her right hand. A review correction became one short rule: keep the ring on the right.

That rule persisted after refresh. Repeating the correction merged it into the same memory. Then it appeared in all eighteen later generation prompts and their monitor checks, across different scenes. An accepted portrait also became a positive reference for six later shots.

That is our learning loop: a production decision carries forward. The traces make it inspectable.

Across four six-shot batches, flags were two, zero, zero, then one; settings, scenes, and references changed, so improvement remains unverified.

Our first buyer would be an AI production team making recurring characters for ads or episodic stories. Their ordinary review decisions build project-specific continuity memory.

We would charge for review seats and checked generations. Our pilot would measure review minutes and total generation cost per approved shot. Savings are a hypothesis today.

Next comes video continuity and broader generator integrations. Tonight, we have a working correction-to-memory workflow, real images, and a reviewable record.

Scripty. Keep the story straight.

## Recording notes
- Identify Mara as the sample production. Use original persistence/prompt evidence; do not portray a visitor’s new note as the source of historical generation.
- Show the character reference, selected shot, learned rule, and a different scene's applied-rule evidence. Treat ring laterality as a review judgment until a human verifies it.
- Put the evidence caption beside the four-batch chart or in the video caption. No accuracy headline from provisional agent labels.
- Use the short landing line and quiet workspace labels; technical detail belongs in Evidence.
- Rehearse and trim the recording to exactly two minutes. Confirm the video and GitHub links are accessible to judges.
- Rechecked October17: [official Devpost](https://sephacks-2026.devpost.com/) currently lists2pmEDT, which is11amPacific today. Plan submission before11am. The founder supplied1:15pm, but no organizer extension is verified. Requirements: two-minute demo/pitch video, working GitHub and project links.
