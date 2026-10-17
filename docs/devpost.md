# Canon

> Submission draft. Only measurements recorded in `handoff/results.md` may replace metric placeholders. The eval labels remain provisional until a human verifies them. See `handoff/MORNING.md` for the final tested behavior.

## Inspiration

A generation API can return success while the story fails: a red scarf becomes blue, a scar moves to the wrong eye, or a character changes between shots. The creator pays for a technically successful frame, then spends time finding and repairing the mistake. We wanted continuity to behave like a living production bible that remembers decisions and makes silent failures visible.

## What it does

Canon puts a character sheet and a growing set of creator rules around an image generator. It checks each shot attribute by attribute, shows expected versus observed values with confidence, and flags confident failures. A rejection can become one testable project rule. Rules constrain later prompts and become checks in later monitoring. Accepted shots can serve as additional positive references.

The Mara demo follows one character: a red wool scarf, a scar above the left eye, short black hair, and a silver ring on the right hand. A six-shot batch appears as a filmstrip; the inspector explains why a shot needs attention. Canon Memory shows what the project learned. Batch history and traces show whether those decisions helped.

## How we built it

Next.js App Router and TypeScript serve the interface and route handlers. Tailwind and shared CSS tokens express a dark film-suite design. Supabase Postgres stores projects, attributes, rules, batches, shots, checks, and traces; its `shots` storage bucket serves generated images. Database access is server-only. The generator adapter supports reference images; a separate vision monitor validates structured output with Zod. Rejection-to-rule learning is kept separate from monitoring and generation so each decision is inspectable.

A real-image cache provides a backup presentation without AI requests. Cached playback preserves the captured checks and measured batch rates. It is labeled as playback; it does not pretend to produce new live improvements. A conservative persistent API reservation budget protects the hackathon's $25 spending limit.

## Challenges

Image continuity and reliable measurement are separate problems. Occluded details should be marked uncertain rather than guessed. Confidence is model-reported, not a calibrated probability. A few generated batches do not establish causation; model randomness, scene composition, and reference quality can affect drift. We keep prompt/rule provenance and do not turn a flat curve into a marketing claim.

Serverless deployment also makes in-memory state unreliable. Live state belongs in Postgres, while cached playback needs isolated browser state. The backup must remain useful without hiding the difference between a replay and a live model call.

## Accomplishments

- A compact production-bible workflow: generate, inspect, accept/reject, retain a rule, and compare batches.
- Explicit failure categories and per-attribute explanations instead of a generic failed badge.
- An honest evaluation harness with draft-label exclusion and defined drift-positive precision/recall.
- Deployment and repeatable cache assets: [TODO: live URL from MORNING.md].
- Measured results: [TODO: real number] real batches; [TODO: real number] generated shots; observed drift rates [TODO: real number].

## What we learned

The useful learning unit is a small, testable production constraint connected to a creator's decision. A rule is more valuable when a reviewer can inspect where it came from, where it was applied, and whether the measured output changed. Evaluating the monitor is as important as improving the generator: an optimistic checker can produce an attractive curve that means little.

## What's next

Verified labels and larger controlled comparisons, temporal checks across video frames, creator-approved positive references, and provider adapters. Real-time world models such as Reactor are a future integration direction, not a current product capability. Cross-project analysis would require customer consent and appropriate data controls.

## Continual Learning track

Canon uses project-specific continual memory rather than model weight training. Rejecting a shot produces one short rule, deduplicated with existing rules; that rule changes both the next generation prompt and the next monitor's checklist. Accepting a shot adds a positive reference. The visible metric is `flagged shots / total shots` for each six-shot batch.

Experiment: [TODO: real number] captured batches with the same scene set and documented creator-style review decisions. Rates: [TODO: real number]. Report a flat or worsening result plainly. These are small observational measurements; no causal or generalization claim follows from three batches. Eval precision/recall/F1: [TODO: real number], with label status prominently disclosed.

## Design track

The layout follows creative work: a left production bible, a center filmstrip grouped by batch, a right inspection surface, and a bottom measurement/trace layer. Red means drift or an error, gold means memory, and green means a check passed. Color is paired with text and icons. Monospace numbers make time, confidence, and traces easier to compare. Motion communicates insertion and ordering, stays below 250ms, and respects reduced-motion preferences. The design aims for the precision of a film-editing suite, with keyboard review and a usable narrow-screen stack.

See `docs/brand-guide.md` for the design rationale and palette.

## Agent Monitoring track — Lemma

A generator's success response is not a continuity guarantee. Canon watches for silent attribute, identity, style, and prompt-adherence failures and keeps API failures separate. Traces connect the generation, check, flag, review-derived rule, and later rule application. A rejected shot becomes a concrete constraint that can be checked again. The creator remains the decision maker; the monitor presents evidence and uncertainty.

## Scale to $1B track

Potential buyers include AI video studios, micro-drama studios, ad agencies, and AI video platforms that need continuity checks through an API. The proposed commercial model combines seats for creative review with usage pricing per checked generation. Pricing is a hypothesis, not tested revenue or committed customer demand.

The first compounding asset is each project's consented canon memory: character details, review history, and constraints. With explicit customer permission and privacy controls, aggregated failure patterns could improve future monitoring. A model-agnostic adapter layer lets teams change image providers while keeping their production memory. The business case should be validated through creator interviews, paid pilots, and measured reduction in rework.
