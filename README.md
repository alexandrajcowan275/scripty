# Scripty

```sh
cd ~/canon && npm run dev
```

Open http://localhost:3000. This is the one-command local cached demo on this Mac after setup.

The continuity memory and monitoring layer for AI-generated stories. One creator correction becomes a persistent, deduplicated constraint on later image generation and monitoring. This is project memory and prompt adaptation—not model-weight training.

## Run

Node24.x and npm.

```sh
npm ci
cp .env.example .env.local
# Fill server credentials locally. Never commit .env.local.
npm run dev
```

Open http://localhost:3000. Public mode defaults to `DEMO_MODE=cached`. The committed cache contains four genuine batches and24 images. A fresh browser begins with no delivered batches; Load recorded batch reveals the next six frames. A missing cache is labeled and generation is disabled.

```sh
npm run build
npm test
npm run typecheck
npm start
```

Build uses Next.js webpack for consistent CSS/font compilation in restricted worker sandboxes. Geist fonts are bundled locally.

## Live setup and access

Apply SQL migrations in filename order with the Supabase CLI, then run `npm run seed`. Tables use RLS and server-only service-role access. Storage bucket `shots` permits public image reads; uploads go through the server. `.env.example` lists all configuration without values.

Set `DEMO_MODE=live` for the operator runtime. With `CANON_ADMIN_TOKEN` configured, live API requests also require `x-canon-mode: live` and `x-canon-admin-token`; an ordinary browser still gets cached playback. Keep that token out of the client bundle. For a private localhost browser rehearsal, start a runtime bound only to127.0.0.1 with an empty admin-token override:

```sh
CANON_ADMIN_TOKEN= DEMO_MODE=live npm start -- --hostname 127.0.0.1 --port 3017
```

Do not run the ungated live override on a public host. The persistent database reservation cap remains active in every live runtime. Production stays cached.

## Product and API

- One Mara character sheet and a real raster reference, six-shot filmstrip, selected-shot inspector, keyboard A/R review, Scripty Memory, operational flag chart, trace drawer.
- `POST /api/batch` `{projectId,scenePrompts?: string[6]}` generates/checks six shots with concurrency at most3. Every prompt includes the sheet and ordered rules; accepted frames can be extra references.
- `POST /api/shot/:id/review` `{decision:"accept"|"reject",reason?:string}` saves review and creates/merges one rule on rejection. Reject requires a reason.
- `GET /api/project/:id` returns project, rules, batches, shots, traces and provenance.
- `POST /api/eval` `{projectId,recheck?:boolean,includeDrafts?:boolean}` evaluates stored checks by default; recheck requires authorized live mode.
- `GET /api/cache/images/:filename` serves bundled captured images.

AI calls time out, retry within a shared deadline, and return explicit fallback/uncertain evidence on failure. Failed generation or monitoring is never a verified pass. The global server-only ledger reserves pessimistic upper bounds before each paid attempt and stops at$24; it is not an exact billing receipt.

## Honest evidence and cached backup

`driftRate = flagged shots / total shots` is operational feedback. Learned rules can change the monitor as well as generation. A lower changing-monitor flag rate alone does not establish improvement. Freeze character criteria, inspect DIFFERENT new scenes, disclose label coverage and sample counts, and use human-reviewed labels before making accuracy/improvement claims. Flat or worsening results stay in `handoff/results.md`.

Cached playback replays real historical images, checks, prompts and measurements; a viewer's local correction does not rewrite those historical outputs. Signed browser cookies keep playback/review memory isolated and persistent across refresh. Browser-local cached corrections do not automatically enter live Supabase memory. Use a new browser session/clear site data to restart after exhausting the finite replay. `CANON_SESSION_SECRET` must be stable across deployments.

## Capture and eval

```sh
# Export already-generated batches from the private live runtime, without more AI calls:
npm run cache:demo -- --capture-existing --batches 4 --base-url http://127.0.0.1:3017
npm run eval -- --project mara
npm run eval -- --project mara --include-drafts
```

Capture refuses fallback/incomplete evidence and records image hashes and provenance. `seed/experiment-scenes.json` records the actual planned scene sets; the capture `--scenes` input expects an array of six-prompt arrays, not its metadata wrapper. Draft labels are excluded by default. Agent-prepared labels require human verification; uncertain visual observations stay out of boolean labels and must remain disclosed in the worksheet.

## Measured run

Four genuine six-shot batches have final-monitor flag counts **2/6,0/6,0/6,1/6**; uncertain checks **4/36,6/42,8/42,6/42**. Baseline used an older image model/style, and its original monitor v1/v2 each flagged6/6 before disclosed calibration. Batch4 worsened from0/6 to1/6. These are operational monitor outputs, not verified image improvement. The learned ring rule reached all18 later generation prompts and monitor outputs; batch4 used an accepted portrait as a positive reference in all6 generations. Ten-shot labels remain agent drafts; human-verified precision/recall/F1 are unavailable. Pessimistic API reservations total **$20.58**, not a billing receipt. See `handoff/results.md` for limitations and exact evidence.

## Deployment and handoffs

Target: Vercel project `archer-rag-dev/canon`, private GitHub repository. Secrets are configured as server-only production/preview variables. Cache assets are included in serverless file tracing. Verify public production separately from protected previews.

Submission deadline: Saturday October17,2026 **1:15pm PT**. Local/deployed checkpoint:1:00am PT; target morning assets by10:45am. See `handoff/MORNING.md` for the final URL and exact human steps; `handoff/results.md` for actual measurements; `handoff/review.md` for independent QA. External submission/video recording remain human steps.

Sources: [OpenAI image generation](https://developers.openai.com/api/docs/guides/image-generation), [Supabase CLI](https://supabase.com/docs/reference/cli/introduction), [Next.js installation](https://nextjs.org/docs/app/getting-started/installation).
