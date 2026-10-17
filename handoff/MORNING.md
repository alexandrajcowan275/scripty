**Public Scripty demo: https://canon-woad.vercel.app/**

```sh
cd ~/canon && npm run dev
```

Open **http://localhost:3000**. This exact one-command startup was verified on this Mac with `DEMO_MODE=cached`; the server is currently running. Node24/npm and dependencies are installed. Repo/folder/Vercel project remain `canon`.

# Scripty — morning handoff

## Status

All build phases, integration, two independent review rounds, real experiments, cache capture, draft evaluation and pitch/design assets are complete. Final production release verification is in progress; its result will be recorded here before work stops. Public access without Vercel login was independently verified. Production stays cached, with no public AI spending.

## What works

- Mara reference/character sheet, cinematic six-shot filmstrip, expected/observed checks and uncertainty, full-frame original image view, accept/reject with keyboard shortcuts, Scripty Memory, operational chart, prompt context and trace drawer.
- Real OpenAI reference-conditioned generation →Supabase storage/checks →correction →one persisted/deduplicated rule →different scenes with that rule in prompts and monitor checks. Accepted portrait used as an extra reference in all6 deployed final-batch generations.
- Four genuine cached batches/24 images. Local exact-hash replay, review/accept refresh persistence, session isolation and finite replay exhaustion pass without paid calls. All24 images bundled into all5 API routes.
- Independent responsive/keyboard QA at1440px and390px;40 tests and final production build pass. Failures retain the workspace and actionable errors.

## Real measurements

| Batch | Flagged | Uncertain checks |
| --- | --- | --- |
| 1, finalv3 recheck | 2/6 | 4/36 |
| 2, different scenes | 0/6 | 6/42 |
| 3, local browser/new scenes | 0/6 | 8/42 |
| 4, deployed/new scenes/positive reference | 1/6 | 6/42 |

The final rate worsened. Baseline images used an older model/style; checker v1/v2 originally flagged6/6 before disclosed calibration. Learned rules also add checks. These are **confounded operational rates, not human-verified improvement**. The final profile-side flag may itself be a monitor anatomy error. Three tuning attempts were time-boxed; no more tuning or paid generation is in progress.

All18 later prompts and18 monitor outputs include the learned ring rule. Pessimistic reservations total **$20.58** against the$24 ledger cap, not a provider billing receipt. Human-verified precision/recall/F1 remain unavailable. Ten-shot worksheet:35 draft booleans,5 uncertain cells; exploratory draft-only eval is not reportable accuracy. Full evidence/limitations: `results.md`, `experiments/final-summary.json`, `label-review.md`.

## Two-minute rehearsal

1. Open the public URL in a fresh browser session, or local3000. Keep **Cached playback** visible. Click **Load recorded batch**.
2. Select baseline **Frame04, map under streetlamp**. Click **Expand frame** to make the ring visible; Escape closes. Its ring is the clearer candidate wrong-hand example; human confirmation remains required.
3. Reject with “Mara always wears a silver ring on her RIGHT hand.” Show the gold **This browser’s correction** label. Refresh: review/local memory survive. These replay edits do not change recorded images or live Supabase memory.
4. Load batch2. Show its different scene and **Generation context** containing the recorded ring rule, its corresponding **Memory rule** check, and a recorded **Rule applied** trace. Recorded memory is labeled separately. This demonstrates the captured real engine run; do not claim the viewer’s local correction caused a historical image.
5. Load batches3/4 to show all real rates, including final1/6. Inspect the accepted cafe portrait and final positive-reference trace if useful. No new image calls occur in playback.

After four batches, the next click returns an actionable exhaustion message. Restart with a fresh browser profile/private session or clear this site’s data. The local server may already be running; if a second terminal reports port3000 busy, use the existing http://localhost:3000 or stop its server before restarting. To stop your terminal’s server, pressCtrl-C.

## Your next steps, in order

1. **Record the2:00 video** using `../docs/video-script.md`, screen only, mode badge visible. Rehearse once; use real cached evidence and the script-supervisor story. Show the public URL and ensure the video link opens without login.
2. **Verify draft labels** in `label-review.md` / `../seed/labels.json` against the exact images. Keep uncertain cells uncertain. Only a human should supply verifiedBy/verifiedAt after actual review, then run `npm run eval`. Keep accuracy/improvement unclaimed until that is done.
3. **Submit to Devpost by Saturday October17,1:15pm PT.** Target assets ready10:45am. Use `../docs/devpost.md`, public app URL, video, private GitHub repo as permitted by the event, and `../docs/brand-guide.pdf` for Design. No external submission has been made.

## Operations and files

Secrets remain in ignored `.env.local` and Vercel env vars; never include them in video/screenshots or commits. Production is cached; preview live APIs require server-only admin credentials. Private live operator instructions are in README; paid generation is finished and not needed for rehearsal.

`integration.md` covers fixes; `review.md` is independent round2; `results.md` preserves real numbers/attempts; `../DECISIONS.md` records intentional design choices. Separate demo-safety/judge reports are dated checkpoint reviews and can predate the final release; final evidence here takes precedence for release status.

Automatic approval review rejected the proposed recurring spend/push/deploy automation, so it was not created. All release work is performed in this active session. Caffeinate remains running to keep the Mac awake.
