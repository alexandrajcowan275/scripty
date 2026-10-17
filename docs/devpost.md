# Scripty

**Your AI script supervisor.** Continuity memory and monitoring for AI-generated stories.

> Evidence snapshot: October 17, 2026. Measurements are operational monitor results, not human-verified continuity or accuracy. The current public app is [Scripty](https://canon-woad.vercel.app); four genuine batches and24 images are bundled for recorded playback.

## Inspiration

On a film set, the script supervisor keeps track of continuity across shots: the costume, the prop, the detail an editor will need later. The role involves detailed written and photographic records so separately filmed takes can fit together. [ScreenSkills role profile](https://www.screenskills.com/job-profiles/browse/film-and-tv-drama/technical/script-supervisor-film-and-tv-drama/).

Crews call that person the “scripty.” We are building the AI scripty. An image API can return success while the story breaks: the ring moves to the wrong hand, or a scar switches sides. A creator catches it, corrects it, and too often has to repeat the instruction. Scripty makes that correction part of the project's working memory.

## What it does

Scripty puts a character reference, a character sheet, and creator-approved constraints around an image generator. It checks each shot attribute by attribute, shows expected versus observed values with confidence, and flags confident failures. A rejected shot becomes one short, testable rule. Repeated corrections merge with existing memory. Later generations receive the rule, and later monitoring checks it.

The demo follows Mara: red wool scarf, scar above the left eye, short black hair, silver ring on the right hand. Six shots appear as a filmstrip beside Scripty Memory and a shot inspector. The essential demonstration is a correction on one shot, a persistent rule after refresh, and that rule in generation and monitoring context for different new scenes. Traces let the creator inspect each step. Accepted shots can also provide positive visual references.

## How we built it

Next.js App Router and TypeScript serve the interface and route handlers. Shared CSS tokens create a dark film-suite workspace. Supabase Postgres stores projects, attributes, rules, batches, shots, checks, and traces; Storage holds images. The generator accepts a reference image. A separate vision monitor returns structured checks validated with Zod. Rejection-to-rule extraction, deduplication, generation, and monitoring are separate, inspectable steps.

Learning is persistent project memory and prompt adaptation; model weights stay fixed. A real-image cache provides a backup without new AI requests. Recorded images, prompts, checks, and rule traces retain their original provenance. Corrections made in cached playback are browser-local review state; they do not change historical generations or prove a new engine run. Persistent API reservations protect the hackathon's spending limit.

## Challenges

The monitor can be wrong too. In the initial real batch it flagged all six shots, including apparent anatomical-side mistakes by the checker. That is a calibration problem, not evidence that all six images truly failed. We retain the original checks and disclose monitor changes. Occluded details should be uncertain; confidence is model-reported, not a calibrated probability.

A falling chart alone cannot prove learning: rules change the monitor as well as the prompt. We need different new scenes, fixed character criteria, disclosed sample sizes, and human-reviewed labels to assess the output. Serverless persistence creates another constraint: real project state must survive a new request, while cached review state must be visibly distinguished from live memory.

## Accomplishments

- A real raster reference and four complete six-shot batches:24 real images on different scene sets.
- A wrong-hand ring correction converted to one rule; repeating the correction merged into the same rule ID, and refresh confirmed persistence.
- The learned ring rule appears in all18 later new-scene generation prompts and all18 corresponding monitor outputs. An accepted portrait was an extra reference in all6 deployed batch4 generations.
- Frozen calibrated checker v3 reports **2/6 flagged** in the baseline recheck and **0/6 flagged** in batch 2, with **6/42 uncertain checks** in batch 2. Original v1/v2 baseline checks remain retained at 6/6 flagged.
- Batch3 returned0/6 flags with8/42 uncertain checks; batch4 returned1/6 flags with6/42 uncertain checks. The final operational rate worsened; no further tuning or selective exclusion was performed.
- Public app: [Scripty](https://canon-woad.vercel.app), publicly accessible; follow the final release verification in `handoff/MORNING.md`.

## What we learned

Continuity is a memory problem and a measurement problem. A useful production note is short, testable, and linked to the creator decision that produced it. A useful monitor admits when it cannot see the detail. The proof we can show first is that a correction persists and reaches a different scene; improvement in the resulting images needs its own evidence.

## What's next

Human-verified labels and larger comparisons, temporal checks across video frames, and creator-controlled positive references. A future integration with real-time world models such as Reactor is exploratory. Video generation, multi-character projects, collaboration, billing, and additional provider integrations are outside this MVP.

## Continual Learning track

One correction becomes reusable project memory. The rule is deduplicated, persisted, injected into a different scene's generation prompt, and checked during monitoring. This is an application-level learning loop with fixed model weights.

The chart reports operational `flagged shots / total shots` per batch. With frozen calibrated checker v3, the baseline recheck is **2/6 flagged (33.3%)** and batch 2 is **0/6 flagged**, with **6 of 42 checks uncertain** and zero unavailable checks in batch 2. The original baseline checks with v1 and v2 each flagged 6/6; those diagnostics are preserved separately.

Batch 2 changes both the scene set and the image generation settings: baseline images used version 1.5 at medium quality; later images use version 2.5 Sunburst at high quality with cinematic lens/grade instructions. This confounds a memory-only comparison. Batch3 uses six different new scenes with the later settings and same frozen checker:0/6 flags,8/42 uncertain. Batch4 adds the accepted portrait as an extra reference:1/6 flags,6/42 uncertain. That final increase remains visible, and its profile-side scar flag still needs human review. Fixed character criteria are retained throughout. These runs establish memory application to new scenes; they do not establish that memory caused better images. Human-verified continuity, precision, recall, and improvement remain unmeasured. Agent-drafted labels are provisional.

## Design track

The layout follows production work: reference and Scripty Memory at left, a central filmstrip, a right inspection surface, and a measurement/trace layer below. Red signals drift, gold signals retained memory, and green signals a passed check. Text and icons carry those meanings alongside color. Monospace numbers make confidence and traces easier to scan. Brief motion shows a rule arriving in memory. Keyboard review and a narrow-screen stack support practical use.

See `docs/brand-guide.md` and the rendered one-page `docs/brand-guide.pdf` for the identity and palette. Every intentional interface decision is recorded in `DECISIONS.md`.

## Agent Monitoring track — Lemma

A successful API response can hide a failed creative requirement. Scripty checks for attribute, identity, style, and prompt-adherence drift while recording API errors separately. Traces connect generation, check, flag, creator correction, and later rule application. The system exposes the monitor's judgment and uncertainty so the creator can challenge it. The real baseline's false anatomical-side flags make this need concrete.

## Scale to $1B track

The initial buyer hypothesis is a small AI production team making recurring characters for ads, episodic stories, or micro-dramas. Repeated output gives continuity memory a reason to accumulate. A proposed commercial model combines creative-review seats with usage per checked generation; an API could serve larger production platforms later. There are no claimed customers, validated prices, measured savings, or revenue.

The first asset is each project's creator-approved continuity memory and review history. Retention and lower rework are hypotheses to test with creator interviews and paid pilots. The proposed pilot compares review minutes and generation cost per approved shot under a fixed review standard, including uncertain checks and failed attempts in the accounting. Cross-customer failure-pattern analysis would require explicit permission and privacy controls. The model adapter creates a route toward keeping production memory when a team changes generators; broad provider coverage remains future work.

## Competitive context

Reference-driven generators, creative review tools, persistent agent memory, and agent observability already solve adjacent problems. Scripty's proposed focus is the complete creator workflow from a visible continuity mistake to a persistent, testable production constraint. This is a positioning hypothesis, not a uniqueness claim. See `docs/competitors.md` for dated comparisons and primary sources.
