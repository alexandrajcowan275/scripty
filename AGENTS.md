# AGENTS.md — Scripty (SEP Hacks 2026)

Read this whole file before writing any code. Every agent on this repo follows it.

**Current founder overrides (October16 night):** Main alone edits application code. Production-first entry and the final linear-flow Figma spec supersede the legacy layout below. Other chats provide Design/Figma, report-only judge/QA reviews, and completed pitch material. No paid calls, purchases or data deletion overnight. Preserve the working public URL; build/test and verify before release. Routine code/docs, private-repo pushes, Vercel deployment, Supabase changes, Figma uploads and browser use are approved without further questions.

## 1. What we're building
**Scripty** is the AI script supervisor: on film sets, the “scripty” tracks continuity between shots. The product is the continuity memory and monitoring layer for AI-generated stories. Repo/folder and Vercel project stay `canon`.

AI image and video generators drift between shots. A character's scarf changes color, a scar switches sides, the lighting flips. The model still returns success, so nothing flags it. These are **silent failures**. Creators lose hours re-rolling shots by hand.

Scripty sits in front of any image or video generator and does three things:
1. **Checks** every generated shot against the project's *canon*: a character sheet plus learned rules.
2. **Flags** drift, showing which attribute drifted and why, with a confidence score.
3. **Learns** from every creator accept, reject, or correction. Each rejection becomes a project rule, and those rules are injected into future generations and checks. The more you use Scripty, the less your AI drifts.

**Hackathon theme: continual learning.** Scripty has to show measurable improvement from real usage inside a 2-minute demo.

## 2. The demo we are building toward (everything serves this)
1. Open the seeded project **"Mara"**. Its character sheet: red wool scarf, scar over the LEFT eye, short black hair, silver ring on the right hand, plus a reference image.
2. Click **Generate batch**. Scripty creates 6 shots from scene prompts.
3. The Scripty monitor checks each shot. Drifted shots get highlighted, for example "Scarf: blue, expected red (0.91)".
4. The creator **rejects** a shot with a reason, or **accepts** one. Each rejection becomes a rule, for example "Scar is always over the LEFT eye", which appears in the **Scripty Memory** panel.
5. Click **Generate batch** again. Learned rules are injected into the prompts, and the drift rate drops, for example from 3/6 to 1/6.
6. Generate different new scenes with the learned rule, compare against the same fixed character criteria, and inspect the applied-rule trace. The **Learning curve** shows the actual flagged rate per batch; the **Trace log** shows checks, rules, and failures. Never deliberately weaken the baseline or promise a falling curve. Human-reviewed labels on new scenes are needed to establish improvement; operational flagged rates alone are insufficient because learned rules also change the monitor.

## 3. Hard constraints
- Submission timing: founder supplied Sat Oct17,2026 **1:15pm PT**; official https://sephacks-2026.devpost.com/ rechecked October17 lists **11am PT (2pmEDT)**. Use the earlier published cutoff unless an organizer extension is confirmed. Checkpoint **1:00am PT**: local real-image flow, one-command run instructions, real cached replay, latest Vercel link in MORNING.md. Target final morning assets by10:45am. Do not submit externally without explicit user authorization.
- Must deploy on **Vercel** with a public URL. Must work in a desktop browser at 1440px and stay usable at 390px.
- No GPU hosting. APIs only. Keep the total API budget under $25.
- **Never commit secrets.** Read keys from env vars only. Keep `.env.example` up to date.
- Every network call to an AI API needs a timeout and a graceful fallback, so the UI never crashes.
- **Demo safety:** the app must work offline-from-AI using cached seed data (`/seed`). Set `DEMO_MODE=cached` to replay pre-generated batches.

## 4. Stack (do not change without writing why in DECISIONS.md)
- Next.js (App Router) + TypeScript + Tailwind CSS. Use shadcn/ui only as primitives, restyled to our design system.
- API: Next.js Route Handlers in `/app/api/*`. No separate Python server.
- DB + file storage: **Supabase** (Postgres + Storage bucket `shots`).
- Image generation: use the best available image model that accepts a **reference image** for character consistency; inspect a few real cinematic shots before scaling, with consistent lens/lighting/style language. Time-box tuning to about3 attempts; preserve flat/worse results honestly. Check current docs and pick the best available, with OpenAI image models as the default and Google Gemini image models as the alternative. Wrap it behind `lib/generate.ts` so the provider can be swapped.
- Drift checking: a vision-capable LLM with **structured JSON output**, validated with Zod. Wrap it behind `lib/monitor.ts`.
- Charts: Recharts or a hand-rolled SVG.

## 5. Shared contracts (all agents must match these exactly)
`/lib/types.ts`:
```ts
export type Attribute = { key: string; label: string; expected: string; weight: number }; // e.g. key:"scarf_color", expected:"red"
export type Character = { id: string; name: string; referenceImageUrl: string; attributes: Attribute[] };
export type Project = { id: string; name: string; characters: Character[] };
export type Rule = { id: string; projectId: string; text: string; attributeKey?: string; source: "rejection" | "correction" | "seed"; createdAt: string; timesApplied: number };
export type AttributeCheck = { key: string; expected: string; observed: string; pass: boolean; confidence: number; note?: string };
export type Shot = { id: string; projectId: string; batchId: string; scenePrompt: string; finalPrompt: string; imageUrl: string;
  checks: AttributeCheck[]; driftScore: number; flagged: boolean; status: "pending" | "accepted" | "rejected"; rejectReason?: string };
export type Batch = { id: string; projectId: string; index: number; rulesApplied: string[]; driftRate: number; createdAt: string };
export type TraceEvent = { id: string; projectId: string; shotId?: string; type: "generate" | "check" | "flag" | "rule_learned" | "rule_applied" | "error";
  category?: "attribute_drift" | "identity_drift" | "style_drift" | "prompt_ignored" | "api_error"; message: string; createdAt: string };
```
API routes:
- `POST /api/batch` `{projectId, scenePrompts?: string[]}` → `{batch: Batch, shots: Shot[]}`. Generates and checks 6 shots, applying all project rules.
- `POST /api/shot/:id/review` `{decision:"accept"|"reject", reason?: string}` → `{shot: Shot, newRule?: Rule}`
- `GET /api/project/:id` → `{project, rules, batches, shots, traces}`
- `POST /api/eval` `{projectId}` → re-checks a fixed set of shots and returns precision/recall of the monitor against hand labels in `/seed/labels.json`.

## 6. How the learning works (implement this exactly; it's what we pitch)
- **Rejection → rule.** On reject, an LLM call turns `{attribute checks, reject reason, character sheet}` into ONE short, testable rule. It also deduplicates against existing rules: merge, don't duplicate.
- **Rules → generation.** `finalPrompt = scenePrompt + character sheet + all active rules`, written as explicit constraints. Order rules by `timesApplied` and how recently they were learned.
- **Rules → monitoring.** Rules become additional checks the monitor must verify, so the checker learns what this creator cares about.
- **Accept signal.** Accepted shots become positive references. Store their URLs and pass the best one as an extra reference image to the generator.
- **Metric.** `driftRate = flagged / total` per batch is operational feedback, not sufficient evidence of improvement. Check different new scenes against fixed character criteria with human-reviewed labels and disclosed sample counts. Learning means persistent memory and prompt adaptation, not model-weight training. Never fake results or weaken the baseline. If the curve is flat or worse, report it in README and results.
- **MVP scope.** One seeded character, Mara; reference and attributes; filmstrip batches; inspector; accept/reject with correction; persistent deduplicated memory; rules applied to generation and monitoring; applied-rule traces; labeled cached replay. Defer video generation, multiple characters, accounts, collaboration, billing, and additional providers unless necessary for the core demonstration.

## 7. Design system (design is a top priority, so treat the UI as the product)
The final light v3 Figma specification is authoritative: `handoff/design-v3-implementation.md`. It supersedes all earlier dark dashboard layouts.
- Warm canvas #F5F3EE, white cards, #E8E5DF image beds, #171714 text, #615E58 secondary. Drift #B4232C, pass #147A42, memory #FFF0C2/#8A5D00, focus #2858B8.
- Inter400/500:56/64,24/32,16/24. Mobile title24/32. Mono only actual frame numbers.
-1296px desktop grid,72px margins,24px gutters. Mobile24px margins. Radius16,56px pill actions.
- Separate Batch → Review one shot → Learned. Memory drawer and Progress on demand. No extra panels, badges or explanatory paragraphs in the main flow.
- Follow supplied native motion timings, reduced motion and keyboard/focus contracts. Source-coordinate drift markers preserve full-image evidence.
- Main alone edits app code. Other chats provide design and read-only reviews; legacy folder ownership below is historical.

## 8. Repo layout (each agent owns its folders, so don't edit others' folders)
- `/app`, `/components`, `/styles` → **UI agent**
- `/lib/generate.ts`, `/lib/monitor.ts`, `/lib/rules.ts`, `/app/api/*` → **Engine agent**
- `/supabase/*`, `/lib/db.ts`, `/seed/*`, `/scripts/*`, `/lib/eval.ts` → **Data agent**
- `/docs/*` → **Pitch agent**
- `/lib/types.ts` is shared. Only change it if you note it in DECISIONS.md, and keep it backward compatible.

## 9. Working rules for every agent
- Commit early and often with clear messages.
- When done, update `/handoff/<agent>.md` with: what works, what's mocked, what's broken, exact next steps, and how to run it.
- Prefer working and simple over clever and unfinished. When unsure, pick the option that makes the demo more reliable.
- Don't add features outside this file. Write ideas in `/handoff/ideas.md` instead.
- If API keys or the Supabase project aren't available in your environment, **don't stop**. Write the real implementation anyway, test it with mocks and fixtures, and note in your handoff exactly what still needs a live test.
- Use pinned, stable package versions. Run `npm run build` and fix all type errors before you finish.
