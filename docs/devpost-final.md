# Scripty

**The AI script supervisor. Every correction carries forward.**

Live app: https://getscripty.vercel.app · Code: https://github.com/alexandrajcowan275/scripty · Video: [link]

## Inspiration
Every film set has a script supervisor — the "scripty" — whose job is to notice that the coffee cup moved, the scarf changed, the scar switched sides. AI filmmakers have no one doing that job. Image and video models return "success" even when the character is wrong, so creators catch drift by eye and re-roll by hand, shot after shot. That's a silent failure, and it gets worse the more you generate.

## What it does
Scripty sits in front of any image or video model and does three things:
1. **Checks** every shot against the production's canon (reference image + confirmed details like "scar over the LEFT eye"), one attribute at a time, with confidence — and says "unclear" instead of guessing.
2. **Learns** from the creator. Reject a shot with one plain-language note; Scripty turns it into a single testable rule, merges duplicates, and saves it to the production's Memory.
3. **Carries it forward.** Every rule is written into future generation prompts *and* added to future checks. The creator chooses the reach: future takes (free), re-check existing shots without generating anything, or regenerate only the shots that break the rule.

Try **Mara**, a real sample production: 4 takes, 24 generated shots, 162 attribute checks, the full learning history. Or start your own production — upload a reference, Scripty proposes the canon, you confirm left/right.

## How we built it
Next.js 16 + TypeScript on Vercel; Supabase Postgres and private Storage with row-level security; OpenAI image generation conditioned on the reference; a separate vision monitor with Zod-validated structured output; 20 API routes; 79 automated tests with green CI. Rules, checks, traces, human labels and repair lineage are all persisted and append-only, so history is never rewritten. Paid calls are reserved against a hard budget before they run. Built solo in ~24 hours with a multi-agent workflow: Codex agents owning backend, UI, QA and a simulated judge panel, with Claude for product design.

## Continual learning — and how we measured it
The learning is per-production memory that compounds with use: a correction becomes a rule that shapes both what the model generates and what the monitor checks.
- **Memory carries forward:** one ring-hand correction reached **18 of 18** later generation prompts and **18 of 18** later checks across new scenes.
- **Controlled A/B:** 6 matched scenes, identical settings, rules off vs on. Both arms came back clean (0/6 vs 0/6) — the base canon already held for those details, so this test shows **no extra reduction**. We publish it instead of hiding it.
- **The monitor is measured too:** blind human labeling hides the model's verdict until you answer. On the first 48 blind labels, the monitor agreed with the human on **48 of 48** checks; precision/recall appear once enough drift cases are labeled.
Next experiment: a creator preference that is *not* in the original canon, memory on vs off, judged blind by people.

## Design
Built around one idea: the viewfinder. Brackets lock onto what drifted, a loupe magnifies it, the contact sheet reads like a set photographer's, and learned rules land in Memory with a glow so the moment of learning is visible. Real generated shots everywhere, frame IDs and confidence in mono, keyboard review (R / A / J / K / Esc). Visual direction came from my own moodboard of futuristic editorial photography.

## Silent-failure monitoring (Lemma)
A generation that "succeeds" with the wrong character is the generative-media version of an agent that runs without errors but does the wrong thing. Scripty gives every shot a trace: expected vs observed, confidence, failure category, the rule behind each check — and turns each human correction into an actionable fix for the next run.

## Scale
Buyer: AI studios and creators producing recurring characters — micro-drama series, branded ad campaigns, episodic content — where one character appears in hundreds of shots. Pricing: per seat plus per checked shot, with an API for generation platforms. The moat is each production's accumulated canon and correction history, which gets more valuable the longer a team works in Scripty. Next: video (temporal checks) and world models — we already turned one of Mara's sets into a persistent 3D world with World Labs, so Scripty can remember locations, not just characters.

## Challenges
Left/right is genuinely hard for vision models (a character's right hand is the viewer's left), so Scripty asks the creator to confirm laterality and marks uncertain checks instead of flagging them. Keeping the results honest — separating real history, controlled tests and live demos — mattered as much as building features.

## What's next
Creator pilots measuring review time and cost per approved shot, a larger blind-labeled evaluation, temporal checks for video, and location memory from world models.
