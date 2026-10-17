# Scripty

**Your AI script supervisor. Every correction carries forward.**

## Inspiration

On a film set, the script supervisor tracks the costume, prop and continuity detail an editor will need later. Crews call that person the “scripty.” AI filmmakers need that memory too: a generator can return success while a ring changes hands or a scar changes sides. [ScreenSkills role profile](https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/technical/script-supervisor-film-and-tv-drama/).

## What it does

Start a production with a character reference, canon details and six scenes. Review each shot against those requirements. A correction becomes one short continuity rule, persisted and deduplicated in Scripty Memory. Future generation prompts receive it; future monitoring checks it. Accepted shots can become positive references.

Mara is a pre-filled sample production with four original takes and24 real images. Its complete learning history opens without waiting for AI calls. Sample edits stay in the viewer's browser; original prompts and traces preserve the real engine history. New productions have separate Supabase state and private reference storage.

## How we built it

Next.js App Router, React and TypeScript serve the application and API routes. Supabase Postgres stores production canon, shots, rules, checks and traces. Uploaded references live in private Storage with ownership checks. Signed HttpOnly browser sessions keep productions isolated. Reference-conditioned generation and a separate structured vision monitor sit behind server-side rate and atomic cost limits. Zod validates inputs and model output.

Learning is persistent project memory and prompt adaptation; foundation-model weights stay fixed. Every paid attempt is reserved before its provider request. Generation failures preserve the production and offer the sample. During the founder's overnight no-spending window, public paid generation is explicitly disabled.

## Evidence and limits

One ring correction persisted after refresh, merged on repeat, and reached all18 later new-scene generation prompts and monitor outputs. An accepted portrait was an extra reference for the final six shots.

| Original take | Flagged shots | Uncertain checks |
| --- | --- | --- |
| 1, final checker v3 recheck | 2/6 | 4/36 |
| 2 | 0/6 | 6/42 |
| 3 | 0/6 | 8/42 |
| 4, latest | 1/6 | 6/42 |

These are operational monitor results, **not human-verified accuracy or causal image improvement**. Model, quality, style and scenes changed after take1; later rules changed the monitor and take4 added a positive reference. The final rate worsened and remains visible. Original checker v1/v2 each flagged6/6 before disclosed calibration. The final scar-side flag may itself be a checker error. Human review is pending. Full evidence: `handoff/results.md`.

## Continual Learning

A creator decision becomes inspectable, reusable production memory. Its exact text reaches later prompts and its rule ID reaches later checks across different scenes. The application learns project constraints through usage; it does not retrain model weights. Establishing better images requires a separate fixed-criteria, human-reviewed comparison.

## Design

A script supervisor's workflow guides the interaction: shots first, one review decision at a time, a clear learned moment, Memory on demand and Progress separately. The final light v3 Figma design is implemented as separate Batch, Review and Learned views, with a Memory drawer and separate Progress. Desktop and mobile screenshots were compared with the supplied frames; `handoff/MORNING.md` records release verification. Every intentional decision and verification finding is kept in `DECISIONS.md`. No reference-site logos, media or layouts are copied into Scripty.

## Agent Monitoring — Lemma

A successful API call can conceal a failed creative requirement. Scripty exposes expected versus observed details, uncertainty, flags and the rule behind a check. Original traces connect generation, monitoring, creator review and later rule application. The creator can challenge the monitor: anatomical-side false positives made this need concrete during development.

## Scale

Our first buyer hypothesis is a small AI production team making recurring characters. Proposed pricing combines review seats and checked generations. A pilot would measure review minutes and total generation cost per approved shot. Customers, pricing and savings remain unvalidated.

## What we learned and what's next

Continuity is a memory problem and a measurement problem. A useful correction is short, testable and traceable to its source; a useful monitor admits when the detail cannot be seen. Next: human-reviewed evaluation, creator pilots, temporal video checks and broader generator integrations. Accounts, collaboration and billing remain outside this release.

Public app: [Scripty](https://canon-woad.vercel.app/). The repository remains private at the founder's request. Confirm the final video and judge-access requirements before submitting; no external submission has been made.
