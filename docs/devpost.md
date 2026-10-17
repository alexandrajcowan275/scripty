# Scripty

**Scripty: the AI script supervisor. Every correction carries forward.**

## Inspiration

On a film set, the script supervisor tracks the costume, prop and continuity detail an editor will need later. Crews call that person the “scripty.” AI filmmakers need that memory too: a generator can return success while a ring changes hands or a scar changes sides. [ScreenSkills role profile](https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/technical/script-supervisor-film-and-tv-drama/).

## What it does

Start a production with a character reference, creator-confirmed canon details and one to six scenes. Review each shot against those requirements. A correction becomes one short continuity rule, persisted and deduplicated in Scripty Memory. Future generation prompts receive it; future monitoring checks it. Accepted shots can become positive references.

Mara is a pre-filled sample production with four original takes and 24 real images. Its complete learning history opens without waiting for AI calls. Sample edits stay in the viewer's browser; original prompts and traces preserve the real engine history. New productions have separate Supabase state and private reference storage.

## How we built it

Next.js App Router, React and TypeScript serve the application and API routes. Supabase Postgres stores production canon, shots, rules, checks and traces. Uploaded references live in private Storage with ownership checks. Signed HttpOnly browser sessions keep productions isolated. Reference-conditioned generation and a separate structured vision monitor sit behind server-side rate and atomic cost limits. Zod validates inputs and model output. A multi-agent Codex workflow separated Main backend/evidence/releases from Design pages/components/styles/assets, with Claude product design and independent report-only QA/judge reviews.

Learning is persistent project memory and prompt adaptation; foundation-model weights stay fixed. Every paid attempt is reserved before its provider request. Generation failures preserve the production and offer the sample. Live actions require a private access code and usage-based accounting under the founder-authorized $30 cap. Operator verification has a separate $12 ceiling.

## Evidence and limits

**Controlled A/B: 0/6 targeted-attribute flagged shots with canon only, 0/6 with canon + learned memory.** The fixed checker found 0/12 ring/scar failures and 0/24 overall failures in each arm, with no uncertain checks. Adding the learned ring rule produced no additional reduction in this six-pair test; canon-only generation already passed the rubric. These are monitor judgments, pending human blind validation. The run cost an estimated **$0.710364** from returned usage.

Both arms used identical scenes, reference, model, high quality, 1536×1024 size and checker version. Only learned-rule injection into generation changed; the checker used fixed canon-only requirements in both arms. All 12 study images are queued first for blind human review. [Artifacts](../seed/experiments/ab-test/) / [protocol and results](results.md).

One ring correction persisted after refresh, merged on repeat, and reached all 18 later new-scene generation prompts and monitor outputs. An accepted portrait was an extra reference for the final six shots.

| Original take | Flagged shots | Uncertain checks |
| --- | --- | --- |
| 1, final checker v3 recheck | 2/6 | 4/36 |
| 2 | 0/6 | 6/42 |
| 3 | 0/6 | 8/42 |
| 4, latest | 1/6 | 6/42 |

These are operational monitor results, **not human-verified accuracy or causal image improvement**. Model, quality, style and scenes changed after take 1; later rules changed the monitor and take 4 added a positive reference. The final rate worsened and remains visible. Original checker v1/v2 each flagged 6/6 before disclosed calibration. The final scar-side flag may itself be a checker error. Human review is pending. Full evidence: `handoff/results.md`.

## Continual Learning

A creator decision becomes inspectable, reusable production memory. Its exact text reaches later prompts and its rule ID reaches later checks across different scenes. The application learns project constraints through usage; it does not retrain model weights. The fixed-criteria six-pair comparison found no additional reduction; human validation is next.

## Design

A script supervisor’s workflow guides the final dark interface: a charcoal workspace with shared header/sidebar, real production table, full-shot Studio review, editable correction and a gold Rule learned card. Memory is available on demand; Evidence retains original imagery, rule reach and the matched comparison. The cinematic landing has an opening sequence and projected Mara reveal. Public1440/390 checks verified the review-to-memory flow. Design decisions are recorded in `DECISIONS.md`; the current release is identified in `handoff/MORNING.md`.

## Agent Monitoring — Lemma

A successful API call can conceal a failed creative requirement. Scripty exposes expected versus observed details, uncertainty, flags and the rule behind a check. Original traces connect generation, monitoring, creator review and later rule application. The creator can challenge the monitor: anatomical-side false positives made this need concrete during development. Re-checking applies memory to stored images without generating new ones. Human/model disagreements supply scoped future checker-calibration context. Blind human judgments, with frozen monitor predictions, are the sole source for public precision/recall/F1; absent labels yield no accuracy claim.

## Scale

Our first buyer hypothesis is a small AI production team making recurring characters. Proposed pricing combines review seats and checked generations. A pilot would measure review minutes and total generation cost per approved shot. Customers, pricing and savings remain unvalidated.

## What we learned and what's next

Continuity is a memory problem and a measurement problem. A useful correction is short, testable and traceable to its source; a useful monitor admits when the detail cannot be seen. Next: human-reviewed evaluation, creator pilots, temporal video checks and broader generator integrations. Accounts, collaboration and billing remain outside this release.

Public app: [Scripty](https://getscripty.vercel.app/). The repository remains private at the founder's request. Confirm the final video and judge-access requirements before submitting; no external submission has been made.
