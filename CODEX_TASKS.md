# Scripty: Codex task prompts

**Current execution target:** checkpoint1:00amPT on Saturday October17,2026; direct user submission deadline1:15pmPT that day, with morning assets targeted10:45am. The latest direct user deadline supersedes earlier conservative11am planning. Product is Scripty, the AI script supervisor; repo/folder/Vercel project staycanon. Root orchestrates authorized parallel subagents/worktrees. Do not submit externally without direct user authorization.

MVP proof: a real creator correction on one shot survives refresh, becomes one deduplicated rule, and appears in generation and monitoring of a different new scene. Keep the baseline intact. Operational monitor flags alone do not prove improvement; report fixed-criteria, human-reviewed results with sample counts, or clearly label draft evidence. Defer video, multiple characters, accounts, collaboration, billing, and extra providers.

How to use this (about 20 minutes of setup tonight):
1. **GitHub:** create an empty repo called `canon` (Codex can't create repos), upload `AGENTS.md` to the root, and commit.
2. **Codex:** go to chatgpt.com/codex → connect GitHub (install the Codex GitHub app, and give it access to `canon`) → create an Environment for the repo.
3. **Environment settings:**
   - Add your keys as **environment variables**, not only as "secrets." Secrets may only be available while setup runs, but variables are available to the agent: `OPENAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (plus `GEMINI_API_KEY` if you have one).
   - **Turn on agent internet access.** It's off by default, and the agents need it for npm and API docs. Allow common dependencies plus `api.openai.com`, `*.supabase.co` and `generativelanguage.googleapis.com`.
   - Leave the setup script blank, or set it to `npm install` once Task 0 has created package.json.
4. **Supabase (5 min, can wait until Saturday):** create a free project and copy the URL and keys into the Codex variables. Saturday morning, paste the migration SQL from Task 3 into the Supabase SQL Editor and run it.
5. **Launch Task 0. When it finishes, open its PR and MERGE it into main.** Tasks 1–4 have to start from the scaffold.
6. Launch Tasks 1–4 as four separate tasks, all at once. Each one opens its own PR.
7. Saturday morning: **merge the 4 PRs on GitHub** in this order: Data → Engine → UI → Pitch. Each agent owns its own folders, so conflicts should be small. If GitHub reports a conflict, merge that PR anyway and let Task 5 fix it. Then launch Task 5, merge its PR, and launch Task 6.

Note: one Codex task can't start other Codex tasks, so paste each prompt yourself (it takes about 10 seconds each). The agents don't need working API keys to write the code. Live API runs happen Saturday once Supabase is set up.

---

## TASK 0: Scaffold (run first, alone)
```
Read AGENTS.md fully. Scaffold the repo exactly to its stack and layout:
- Next.js App Router + TypeScript + Tailwind, with /styles/tokens.css containing the design tokens from AGENTS.md section 7.
- Create /lib/types.ts exactly as in AGENTS.md section 5.
- Create stub API route handlers for every route in section 5 that return realistic MOCK data matching the types (use 6 placeholder shots).
- Create /seed/mara.json with the Mara project, character sheet, 6 scene prompts (varied angles/lighting/actions), and 2 seed rules.
- Add .env.example, a README with run instructions, DECISIONS.md, and an empty /handoff folder.
- Make sure `npm run build` passes. Commit. Write /handoff/scaffold.md.
Do NOT build real features. This task only sets up the shared skeleton so parallel agents don't conflict.
```

## TASK 1: UI / Design agent (parallel)
```
Read AGENTS.md fully, especially section 7 (Design system). You own /app, /components, /styles ONLY.
Build the full Scripty interface against the MOCK API routes (don't touch /app/api or /lib except to import types):
- Three-pane desktop layout: Scripty Memory (left), film-strip batches (center), shot inspector (right), and a bottom drawer with the learning-curve chart and trace log.
- Shot cards: image, drift badge, thin red frame when flagged, and status. Inspector: big image, attribute check rows (expected vs observed, pass/fail chip, confidence bar), Accept/Reject buttons with a reason input, and keyboard shortcuts A/R.
- Scripty Memory: character sheet with reference image, plus a list of learned rules. A new rule animates in with a gold glow.
- Learning curve: drift rate per batch (line), labeled clearly.
- "Generate batch" button with a sequential loading animation (shots appear one by one).
- Empty, loading and error states for everything. Responsive down to 390px (stack panes).
Quality bar: this should look like a pro film tool (Frame.io / DaVinci / Linear), not a template. Use only the tokens. Check AA contrast.
If a Figma MCP server or Figma file is available in this environment, read it and match it.
Commit often. Finish with screenshots (if you can) and /handoff/ui.md.
```

## TASK 2: Engine agent (parallel)
```
Read AGENTS.md fully, especially sections 5 and 6. You own /lib/generate.ts, /lib/monitor.ts, /lib/rules.ts, and /app/api/* ONLY.
Replace the mock routes with real logic:
1. lib/generate.ts: generate an image from finalPrompt + reference image(s). Check current OpenAI image API docs for a model/endpoint that supports reference images; implement a Gemini image fallback behind the same interface. Upload results to Supabase Storage via lib/db.ts (the Data agent is building it; if it's not there yet, write a minimal adapter and note it in handoff). 60s timeout, retry once, then fall back to a cached seed image with an error trace.
2. lib/monitor.ts: given an image + character attributes + active rules, call a vision LLM with STRICT structured output (Zod schema) returning AttributeCheck[] plus failure categories. Compute driftScore (weighted) and flagged (any pass:false with confidence >= 0.6). Keep the prompt precise: check each attribute independently, say "unclear" rather than guess, and mark low confidence when occluded. Penalize guessing.
3. lib/rules.ts: rejection → ONE short testable rule via LLM (dedupe/merge against existing rules); buildFinalPrompt(scenePrompt, character, rules) per section 6.
4. Routes: /api/batch generates 6 shots in parallel (max concurrency 3), checks each, saves everything, and writes TraceEvents. /api/shot/:id/review stores the decision; if rejected, creates a rule and a rule_learned trace. /api/project/:id returns everything.
5. Respect DEMO_MODE=cached: replay /seed/cache batches without calling APIs.
Log token/image counts per batch to estimate cost. Write unit tests for buildFinalPrompt and rule dedupe. Commit often. Write /handoff/engine.md.
```

## TASK 3: Data + Eval agent (parallel)
```
Read AGENTS.md fully. You own /supabase, /lib/db.ts, /seed, /scripts, /lib/eval.ts ONLY.
1. Supabase SQL migration for tables: projects, characters, attributes, rules, batches, shots, attribute_checks, traces (match /lib/types.ts). Storage bucket "shots" (public read). Include RLS-off notes for the hackathon demo.
2. lib/db.ts: typed data-access functions used by the API routes (getProject, saveBatch, saveShot, updateShotReview, addRule, listRules, addTrace, listTraces).
3. scripts/seed.ts: loads /seed/mara.json into Supabase.
4. EVAL HARNESS (important for the pitch): /seed/labels.json format for hand-labeled shots (shotId, attributeKey, truePass). lib/eval.ts + /api/eval computes monitor precision/recall/F1 against labels. scripts/run-eval.ts prints a table. Leave labels for the human to fill in, with 3 examples.
5. scripts/cache-demo.ts: runs N batches against the real engine and saves outputs to /seed/cache for DEMO_MODE=cached.
Commit often. Write /handoff/data.md with exact commands.
```

## TASK 4: Pitch + Devpost agent (parallel, docs only)
```
Read AGENTS.md fully. You own /docs ONLY. Write:
1. /docs/devpost.md: Inspiration, What it does, How we built it, Challenges, Accomplishments, What we learned, What's next. Write a separate section for each track: Continual Learning (how it learns from real usage and the metric), Design (intentional design decisions, the film-suite reference, color semantics: red = drift, gold = memory, green = pass), Scale to $1B (buyers: AI video studios, micro-drama studios, ad agencies, AI video platforms via API; pricing per seat + per checked generation; moat = per-project canon memory plus cross-customer failure-pattern data), Agent Monitoring (silent failures in generative media, failure taxonomy, traces, how a rejected shot becomes a fix).
2. /docs/video-script.md: a 2:00 script timed to the demo in AGENTS.md section 2. Hook in the first 10 seconds; product + business story; end with "Scripty: the more you use it, the less your AI drifts." Mention a future integration with real-time world models (e.g. Reactor) as what's next.
3. /docs/brand-guide.md: a one-page brand guideline (name, logo concept, color tokens with meanings, type, voice) suitable to export as a PDF and attach to the Design track.
Leave clearly marked [TODO: real number] placeholders for metrics. NEVER invent results. Commit. Write /handoff/pitch.md.
```

---

## SATURDAY MORNING

## TASK 5: Integrator (run first thing Saturday)
```
Read AGENTS.md and every file in /handoff. The ui, engine, data and pitch work has already been merged into main. Find and fix any leftover merge conflicts or broken imports, resolving them in favor of the AGENTS.md contracts. Wire the UI to the real API routes and remove the mocks. Make `npm run build` pass. Deploy-ready for Vercel (env vars documented). Run the seed script instructions in README. Then run one full flow in DEMO_MODE=live and record what breaks in /handoff/integration.md, prioritized by demo impact. Fix the top 5 issues. Commit.
```

## TASK 6: Reviewer / QA (run after Task 5; this agent did NOT build anything)
```
You are an independent reviewer. You did not write this code. Read AGENTS.md, then test the app against the demo script in section 2, step by step. Check: does every step work, does the learning curve reflect real data (no faked numbers), do errors degrade gracefully, does DEMO_MODE=cached work fully, is the UI consistent with the design system (tokens only, AA contrast, keyboard shortcuts, 390px layout), and are there no secrets in the repo. Write /handoff/review.md with PASS/FAIL per item and a ranked fix list. Fix only small, safe issues yourself; list the rest.
```
