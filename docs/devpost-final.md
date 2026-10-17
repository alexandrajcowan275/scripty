# Scripty

**The AI script supervisor. Every correction carries forward.**

Live app: https://getscripty.vercel.app · Code: https://github.com/alexandrajcowan275/scripty · Video: [link]

## Inspiration
Every film set has a script supervisor — the "scripty" — whose job is to notice that the coffee cup moved, the scarf changed, the scar switched sides. AI filmmakers have no one doing that job. Image and video models return "success" even when the character is wrong, so creators catch drift by eye and re-roll by hand, shot after shot. That's a silent failure, and it gets worse the more you generate.

## What it does
This release generates still images through its integrated provider and does three things:
1. **Checks** every shot against the production's canon (reference image + confirmed details like "scar over the LEFT eye"), one attribute at a time, with confidence — and says "unclear" instead of guessing.
2. **Learns** from the creator. Reject a shot with one plain-language note; Scripty turns it into a single testable rule, merges duplicates, and saves it to the production's Memory.
3. **Carries it forward.** Every rule is written into future generation prompts *and* added to future checks. The creator chooses the reach: future takes (free), re-check existing shots without generating anything, or regenerate only the shots that break the rule.

Try **Mara**, a real sample production: 4 takes, 24 generated shots, 162 attribute checks, the full learning history. Or start your own production — upload a reference, Scripty proposes the canon, you confirm left/right.

## How we built it
Next.js 16 + TypeScript on Vercel; Supabase Postgres and private Storage with row-level security; OpenAI image generation conditioned on the reference; a separate vision monitor with Zod-validated structured output; 20 API routes; 92 automated tests with green CI. New-production state is persisted; monitor runs, human labels and repair lineage preserve the original evidence. Sample visitor notes remain browser-local. Paid calls are reserved against a hard budget before they run. Built solo in ~24 hours with a multi-agent workflow: Codex agents owning backend, UI, QA and a simulated judge panel, with Claude for product design.

## Continual learning — and how we measured it
The learning is per-production memory that compounds with use: a correction becomes a rule that shapes both what the model generates and what the monitor checks.
- **Memory carries forward:** one ring-hand correction reached **18 of 18** later generation prompts and **18 of 18** later checks across new scenes.
- **Controlled A/B:** 6 matched scenes, identical settings, rules off vs on. Both arms came back clean (0/6 vs 0/6) — the base canon already held for those details, so this test shows **no extra reduction**. We publish it instead of hiding it.
- **The monitor is measured too:** blind human labeling hides the model's verdict until you answer. The original-browser session showed48agreements on48clean cases with no drift-positive cases. This does not establish checker accuracy; precision/recall are undefined without the required positive cases.
Next experiment: a creator preference that is *not* in the original canon, memory on vs off, judged blind by people.

## Design
A charcoal, image-first workspace follows the script supervisor’s job: inspect, correct, remember. A persistent56px header and grouped sidebar preserve orientation. Studio places the full shot, actual monitor checks, editable note and real contact sheet together. A gold Rule learned card shows the returned constraint and future prompt/check previews. Evidence keeps all original frames and honest results separate. The cinematic landing uses credited photography, an opening title, word reveal and an expanding Mara shot. Desktop1440px and mobile390px flows were verified publicly; Review/Evidence source images are unchanged.

## Silent-failure monitoring (Lemma)
A generation that "succeeds" with the wrong character is the generative-media version of an agent that runs without errors but does the wrong thing. Scripty gives every shot a trace: expected vs observed, confidence, failure category, the rule behind each check — and turns each human correction into an actionable fix for the next run.

## Scale
Our initial buyer hypothesis is a small AI production team making recurring characters for ads, storyboards or episodic stories. Review seats plus checked-generation usage is a pricing hypothesis. Pilots would measure review time, repeated errors and total cost per human-approved shot. Video continuity, collaboration and generator integrations are next steps. The existing World Labs experiment supplies a captured location still and a private external world link; location checking and a persistent-world continuity workflow are not demonstrated.

## Challenges
Left/right is genuinely hard for vision models (a character's right hand is the viewer's left), so Scripty asks the creator to confirm laterality and marks uncertain checks instead of flagging them. Keeping the results honest — separating real history, controlled tests and live demos — mattered as much as building features.

## What's next
Creator pilots measuring review time and cost per approved shot, a larger blind-labeled evaluation, temporal checks for video, and location memory from world models.
