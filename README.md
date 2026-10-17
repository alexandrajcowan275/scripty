# Canon

Continuity memory and monitoring for AI-generated stories. **TASK 0 scaffold only.**

## Run locally

Use Node.js 22+ (Node 24 is also supported) and npm.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. No API keys or Supabase project are needed for the scaffold.

```sh
npm run typecheck
npm run build
npm start
```

Dependencies are pinned; commit `package-lock.json` and use `npm ci` for repeatable installs.

## What exists

- Next.js App Router, TypeScript, Tailwind CSS via its PostCSS plugin.
- `/styles/tokens.css`: section 7 palette, type stacks, and motion variables.
- `/lib/types.ts`: exact shared contracts from AGENTS.md.
- `/seed/mara.json`: project, four character attributes, six varied scene prompts, two seed rules.
- `/public/seed`: local neutral SVG reference/shot placeholders, served at `/seed/*`.
- `/lib/mock-data.ts`: deterministic fixture data used by all four API stubs.
- `/components`, `/supabase`, `/scripts`, `/docs`: reserved folders for later tasks.
- Minimal status page; the three-pane product interface is TASK 1.

## Mock API

```sh
curl http://localhost:3000/api/project/mara
curl -X POST http://localhost:3000/api/batch -H 'Content-Type: application/json' -d '{"projectId":"mara"}'
curl -X POST http://localhost:3000/api/shot/mock-shot-1/review -H 'Content-Type: application/json' -d '{"decision":"reject","reason":"The scarf is blue."}'
curl -X POST http://localhost:3000/api/eval -H 'Content-Type: application/json' -d '{"projectId":"mara"}'
```

`POST /api/batch` accepts optional `scenePrompts` containing exactly six nonempty strings. Accept reviews use `{"decision":"accept"}`. Invalid JSON/input returns 400; unknown project/shot IDs return 404.

Mocks are **stateless**: batch IDs, timestamps, checks, and review-rule responses are fixtures. A subsequent GET resets review state. Rejection reasons are echoed, not interpreted. Review does not persist a rule or deduplicate it. Mock checks intentionally do not describe the neutral placeholder pixels. The fixture drift rate is computed from flagged shots (3/6); it is not evidence of model quality or learning. No improvement curve is fabricated. `/api/eval` returns null metrics and zero evaluated checks until TASK 3 adds real hand labels.

## Environment and next tasks

`.env.example` lists all planned keys. Keep `.env.local` untracked; the service-role key must stay server-only. `DEMO_MODE=cached` is the planned engine switch: TASK 0 always returns local fixtures regardless of this variable. Pre-generated image batches in `/seed/cache`, live/cached replay, generation timeouts/fallbacks, provider selection, Supabase persistence, monitoring, learning, and eval are not implemented yet.

Next tasks: Data → schema, adapters, seed/eval/cache tooling; Engine → generation, monitoring, rule learning and real routes; UI → full interface; Pitch → docs. Follow AGENTS.md folder ownership. Data and Engine should coordinate API route changes. See `/handoff/scaffold.md` and `CODEX_TASKS.md`.

## Deployment target

The scaffold is structured for Vercel's Next.js support (`npm run build`; no separate server). A public deployment and live API testing are later work. No deployment was created by TASK 0.

Setup references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [Tailwind PostCSS setup](https://tailwindcss.com/docs/installation/using-postcss).
