# AGENTS.md — Canon (SEP Hacks 2026)

Read this whole file before writing any code. Every agent on this repo follows it.

## 1. What we're building
**Canon** is the continuity memory and monitoring layer for AI-generated stories.

AI image and video generators drift between shots. A character's scarf changes color, a scar switches sides, the lighting flips. The model still returns success, so nothing flags it. These are **silent failures**. Creators lose hours re-rolling shots by hand.

Canon sits in front of any image or video generator and does three things:
1. **Checks** every generated shot against the project's *canon*: a character sheet plus learned rules.
2. **Flags** drift, showing which attribute drifted and why, with a confidence score.
3. **Learns** from every creator accept, reject, or correction. Each rejection becomes a project rule, and those rules are injected into future generations and checks. The more you use Canon, the less your AI drifts.

**Hackathon theme: continual learning.** Canon has to show measurable improvement from real usage inside a 2-minute demo.

## 2. The demo we are building toward (everything serves this)
1. Open the seeded project **"Mara"**. Its character sheet: red wool scarf, scar over the LEFT eye, short black hair, silver ring on the right hand, plus a reference image.
2. Click **Generate batch**. Canon creates 6 shots from scene prompts.
3. The Canon monitor checks each shot. Drifted shots get highlighted, for example "Scarf: blue, expected red (0.91)".
4. The creator **rejects** a shot with a reason, or **accepts** one. Each rejection becomes a rule, for example "Scar is always over the LEFT eye", which appears in the **Canon Memory** panel.
5. Click **Generate batch** again. Learned rules are injected into the prompts, and the drift rate drops, for example from 3/6 to 1/6.
6. The **Learning curve** chart shows drift rate per batch going down. The **Trace log** shows every check, every rule applied, and every failure category.

## 3. Hard constraints
- Deadline: Sat Oct 17, 2026, 1:15pm PT. Build small and polished. Leave no half-built features.
- Must deploy on **Vercel** with a public URL. Must work in a desktop browser at 1440px and stay usable at 390px.
- No GPU hosting. APIs only. Keep the total API budget under $25.
- **Never commit secrets.** Read keys from env vars only. Keep `.env.example` up to date.
- Every network call to an AI API needs a timeout and a graceful fallback, so the UI never crashes.
- **Demo safety:** the app must work offline-from-AI using cached seed data (`/seed`). Set `DEMO_MODE=cached` to replay pre-generated batches.

## 4. Stack (do not change without writing why in DECISIONS.md)
- Next.js (App Router) + TypeScript + Tailwind CSS. Use shadcn/ui only as primitives, restyled to our design system.
- API: Next.js Route Handlers in `/app/api/*`. No separate Python server.
- DB + file storage: **Supabase** (Postgres + Storage bucket `shots`).
- Image generation: an image model that accepts a **reference image** for character consistency. Check current docs and pick the best available, with OpenAI image models as the default and Google Gemini image models as the alternative. Wrap it behind `lib/generate.ts` so the provider can be swapped.
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
- **Metric.** `driftRate = flagged / total` per batch. That's the learning curve. Never fake the numbers. If the real curve is flat, say so in README so we can tune.

## 7. Design system (design is a top priority, so treat the UI as the product)
Vibe: a professional film-editing suite meets a calm observability console. Dark, cinematic, precise. Think DaVinci Resolve or Frame.io crossed with Linear. Not a generic SaaS dashboard.
- Background `#0B0B0D`, surface `#141418`, raised `#1C1C22`, border `#2A2A33`, text `#EDEDF0`, muted `#8A8A96`.
- Accent "Canon red" `#E5484D`, used only for drift and alerts. Pass `#3DD68C`. Learned-rule highlight `#F5C451` (warm gold for memory).
- Type: Inter or Geist for UI, Geist Mono for traces and numbers. Tight, confident hierarchy.
- Layout (desktop): left = project and Canon Memory (character sheet + learned rules list); center = **film-strip** of 6 shots per batch, horizontally scrollable with batch rows stacked; right = selected-shot inspector (large image, attribute checks with pass/fail chips, Accept/Reject with reason); bottom = learning-curve chart + trace log drawer.
- Motion: subtle and purposeful. The rule "lands" in Memory with a gold glow, flagged shots get a thin red frame plus a corner badge, and batches animate in sequentially. Under 250ms, ease-out.
- Accessibility: WCAG AA contrast, visible focus states, every action reachable by keyboard (A = accept, R = reject).
- If a Figma file or Figma MCP is available, use it as the source of truth for layout and tokens. Otherwise follow this section.
- Put the tokens in `/styles/tokens.css` as CSS variables, and never hardcode colors in components.

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
