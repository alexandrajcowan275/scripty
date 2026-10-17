# Scaffold handoff

## Works

- Next.js App Router, strict TypeScript, Tailwind PostCSS, semantic design tokens.
- Exact shared contracts in `lib/types.ts` and Mara seed with six scene prompts/two seed rules.
- Four mock routes with six local placeholder shots, computed fixture drift rate, basic 400/404 validation.
- Environment template, run/deployment notes, reserved task directories.

## Mocked

All API behavior is stateless fixture output. The neutral SVGs are not generated shots or a character reference. Reviews do not persist; newRule is illustrative and does not interpret the reason. Eval metrics are null. No model quality or learning improvement has been measured.

## Broken / not implemented

No known scaffold defects. Product UI, AI providers, Zod monitor validation, Supabase schema/storage, actual cached batch replay, rule learning/deduplication, labels/eval harness, and live testing are pending their assigned tasks. Keys were not needed.

## Exact next steps

1. Start TASK 1–4 from this scaffold (the current task does not launch them).
2. Data: implement typed DB adapters/schema, replace reference and shot slates, add labels/cache tooling.
3. Engine: replace route fixtures and `lib/mock-data.ts` usage with real generation/monitor/rules; add timeouts, graceful fallbacks, and DEMO_MODE replay. Coordinate `/api/eval` ownership with Data.
4. UI: use shared types and existing route contracts; build the full section 7 layout.
5. Pitch: write docs and keep measured metrics as TODO until actual results exist.

## Run

```sh
npm ci
cp .env.example .env.local
npm run dev
# Separate shell after dev/start:
curl http://localhost:3000/api/project/mara
```

Build: `npm run build`. Type check: `npm run typecheck`. Production: `npm start`.

## Validation

- `npm install --save-exact`: 48 packages installed; audit reported zero vulnerabilities.
- `npm run build`: PASS (Next.js 16.4.2, all four API routes compiled, TypeScript passed).
- `npm run typecheck`: PASS.
- Production server on localhost:3017: PASS; landing page returned 200.
- Browser: rendered the scaffold heading, mock-data label, and Mara API link; no warning/error console entries.
- API → fixture → response: GET Mara returns four attributes, two seed rules, six shots, traces, and a drift rate equal to fixture flags/6. All seven SVG assets returned 200 with image/svg MIME type.
- POST batch: default and six custom prompts returned six shots. Accept/reject responses matched contracts; a following GET correctly retained original stateless fixtures.
- Eval: null metrics and zero evaluated checks (no invented measurements).
- Invalid/missing input, unknown IDs, malformed JSON: expected 400/404 responses.
- Shared types compared verbatim to the AGENTS.md fenced contract: PASS.
- React review: simple server components, semantic headings/link, visible focus token, no client hooks or external dependencies.
- No live AI, Supabase, learning, or deployment behavior was tested because those are outside TASK 0.
