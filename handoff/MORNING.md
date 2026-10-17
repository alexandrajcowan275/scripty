**Public Scripty app: https://canon-woad.vercel.app/**

```sh
cd ~/canon && npm run dev
```

Open **http://localhost:3000**. Node24/npm, dependencies and local credentials are installed on this Mac. Repo/folder/Vercel project remain `canon`; GitHub stays private.

# Scripty — morning handoff

Updated during the founder-authorized overnight work. Target: ready before **7am PT, October17**. Human submission deadline supplied by founder: **1:15pm PT**. No external submission has been made.

## Release status

The previously verified public release remains working. The replacement production-first application is being developed on `codex/figma-implementation`; it is **not yet the public release**. The designer is rebuilding a calm linear flow: Batch → one-shot Review → Learned, Memory drawer, separate Progress. Main is holding layout work until that exact spec arrives, then will verify screenshots, build and the public URL before releasing.

Verified checkpoint commit: `7af5e42` (Figma v2 implementation), pushed to the private repo. The subsequent production backend increment is tested locally. Final release commit/deployment/screenshot links will replace this paragraph when deployed.

## What works in the new backend

- New production creation with the creator's name, character, private reference upload, canon details and six scene prompts saved to real Supabase.
- Fresh production reads, exact uploaded-image bytes, owned production listing and same-browser persistence.
- Different browser denied both production and private reference access.
- Mara opens with all four original takes/24 real images immediately, without AI or database calls.
- Sample review state remains separate from original history and from new productions.
- Existing generation/review/Memory/trace engine is production-aware; public paid requests default off overnight. Limit responses preserve the production and offer Mara.
-50 tests and production build pass; Supabase security advisors report no issues. Ten real-data checks are in `experiments/production-workspaces-local.json`.

Reference generation and new-production paid generation are implemented but intentionally not paid-tested. The founder's no-spending/no-deletion instruction is enforced and recorded in `../BLOCKED.md`.

## Real evidence

| Original take | Flagged shots | Uncertain checks |
| --- | --- | --- |
| 1, final checker v3 recheck | 2/6 | 4/36 |
| 2 | 0/6 | 6/42 |
| 3 | 0/6 | 8/42 |
| 4, latest | 1/6 | 6/42 |

One ring rule reached all18 later generation prompts and18 corresponding monitor outputs. An accepted portrait was a positive reference for all six final-take shots. Original checker v1/v2 each flagged6/6 before disclosed calibration. Generator/settings/scenes/reference changes confound comparison, learned rules alter monitoring, and the final rate rose. Human-verified accuracy and causal image improvement remain unavailable. Draft labels are not authoritative. See `results.md`.

API reservations remain **$20.58 of$24**, unchanged after production-upload verification; remaining$3.42. These reservations are pessimistic bounds, not a billing receipt. No more paid work is authorized tonight.

## Remaining overnight work

1. Receive the final linear-flow Figma spec and implement exact grid, spacing, type, motion and every state, with no extra labels/features.
2. Compare final desktop/mobile screenshots with the Figma frames; verify upload/create, sample review/Memory/Progress, shortcuts, refresh, errors and sample alternatives.
3. Finish repo terminology/design docs and final brand handout; keep business model short.
4. Commit/push verified increments, deploy Vercel, and verify the public URL end to end. Add actual release artifacts here.

## Morning human actions

Record and share a two-minute video using `../docs/video-script.md`; verify it opens without login. Review the draft labels before claiming accuracy. Confirm private-repo judge-access and Devpost timing requirements, then submit. No account, pricing, savings or causal improvement claim is validated.

## Overnight operating rules

Main alone edits app code. Design owns Figma/spec; judge panel and report-only QA run every90minutes, quiet when unchanged. Pitch writer delivered `pitch-final.md` and stopped. Routine editing, commits/pushes, deployments, Supabase changes, Figma uploads, browser use and inter-chat coordination are explicitly approved. Skip purchases, paid calls and deletion; log in `../BLOCKED.md`.

Check usage at meaningful checkpoints. At10% or less remaining in a reported window tonight, use the one available free full reset expiring October29 first (`RateLimitResetCredit_4a4a7f9881f881918f27541d1a601a4a`). No purchases. Last check: weekly80% remaining; 5-hour window unreported; two free resets available; none consumed.

Secrets remain in ignored `.env.local` and server-only Vercel variables. Never include them in video, screenshots, commits or URLs. Caffeinate is running. Production access is currently tied to its creating browser; clearing the owner cookie loses that access. No cross-device recovery is claimed.
