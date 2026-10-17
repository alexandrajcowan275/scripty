# Scripty demo safety QA — current report-only status

Updated October16,2026 8:29p.m. Pacific (2026-10-17T03:29Z).

## Current authority

User explicitly corrected this role to REPORT-ONLY. Do not change app code, install assets, implement fixes, commit/push/deploy/promote/cancel, change secrets/access, or call paid APIs. Send findings to the main build lead; the lead implements fixes/releases. Only this report may be updated. Scheduled report-only QA is ACTIVE every45minutes, automation `scripty-demo-safety-qa`, with notifications only for meaningful changes. This replaces all earlier15-minute wording.

## Round2 — genuine cache and release handoff

- **Genuine real cache is now present locally.** Before the report-only correction, exported two persisted six-shot batches through the existing `--capture-existing` command into `/private/tmp/scripty-real-cache`. No AI calls. Provenance real_engine/persisted_read_only,12 real raster images,25,812,286 bytes; every SHA256 and byte count verified. Installed these assets into `~/canon/seed/cache` before the correction; no feature/app code edits.
- **Full genuine local cached replay PASS.** Isolated production server had global fetch and Node http/https request/get denied. Exercised both recorded batches, all12 image hashes, fixed local reference, browser-local rejection/rule persistence, acceptance/refresh, fresh-session isolation and replay exhaustion409. ZERO outbound requests attempted. JSON results: `/private/tmp/scripty-real-cache-local-qa.json`.
- **Genuine browser rehearsal PASS.** Loaded actual first batch, rejected the wrong-hand ring shot, saved local correction, refreshed and loaded the second different-scene batch. All12 recorded images plus local reference loaded. Page explicitly distinguishes browser-local correction from recorded memory. No captured browser errors/warnings. Recorded flag rates33.3% and0% are operational observations with4 and6 uncertain checks respectively, not verified causal improvement.
- **Cache packaging PASS.** A fresh release build from82c2550 plus real assets passed. Each of five API route tracing manifests includes the cache manifest and all12 PNG files. Release source is `/private/tmp/scripty-demo-release`; no secrets were copied into it.
- **Production verification PENDING.** Before correction, production deploy was initiated to existing archer-rag-dev/canon with DEMO_MODE=cached. When correction arrived, local CLI was interrupted, but upload had already completed and remote build had started. Last read-only status: BUILDING, deployment `dpl_3tLWEtqyiLyWD53faC5fcGWSYRv2`, URL https://canon-j5fddrey9-archer-rag-dev.vercel.app. The lead was informed and owns any decision to continue/cancel/promote. QA will not mutate it. Public canonical URL https://canon-woad.vercel.app still needs a new post-release full replay check.
- Local QA server was stopped after checks. All new stateful reviews were confined to isolated replay cookies, not live project/database reviews.

## Findings sent to main build lead

Working cache and no-egress rehearsal are ready. Confirm the desired release targets the production alias, then request read-only public QA. Preserve genuine images, measured flags/uncertainty and honest replay labels. Main build lead chat: `01a147ad-d75d-7080-9dae-1d4cda06584b`.

## Earlier round1 evidence (historical; cache absence is superseded)

# Scripty demo safety QA

Last checked: October 16, 2026, 8:22 p.m. Pacific (2026-10-17T03:22Z).
Role: independent demo safety QA. No feature, credential, access-control, deployment or database changes made. No paid model calls made. Problems reported to main build lead chat `01a147ad-d75d-7080-9dae-1d4cda06584b`.

## Verdict

**NOT READY for the full cached demonstration.** The public app loads, but genuine recorded cache assets are absent and playback is disabled. Tested API failures degrade gracefully. No credential-pattern matches were found in scanned committed history; this is a bounded scan, not proof that every possible secret is absent.

| Requested check | Result | Evidence |
| --- | --- | --- |
| DEMO_MODE=cached plays the full demo without internet/provider/database calls | BLOCKED for genuine full replay; PASS for tested no-cache paths and fixture mechanism | `seed/cache/` contains README.md only. With server-side fetch/http/https requests denied, project GET returns200 with cache_unavailable, batch POST returns409, eval returns200 stored_checks. Zero attempted outbound calls recorded. Full genuine replay cannot pass until manifest/images are installed. Same-origin localhost API calls are required by the architecture and are distinct from outbound AI/internet calls. |
| Vercel production loads and works | PARTIAL: public shell PASS; full demo BLOCKED | https://canon-woad.vercel.app opens without login, then shows Cache not installed, no shots and disabled playback. It still displays the older Canon branding. Vercel project metadata identifies latest production dpl_EPvqkHzVc53FoVM13uW4En3ZUNM5, commit12c9f07d3db76c701a8b3b22d147a9115e24760f, deployment URL https://canon-3g7np6ns1-archer-rag-dev.vercel.app. The alias must be rechecked after release; READY metadata alone does not establish a working demo. |
| No secrets committed to GitHub | PASS within scanned patterns/history | Fetched GitHub main82c2550469d30ed4b3f09a22102b419b7578a046 into isolated QA clone. Scanned185 reachable blobs across394 objects, including local branches and fetched main. Zero credential-pattern or sensitive-filename findings. `.env.local` and `.vercel/project.json` are ignored. Limits below. |
| No crash/blank screen when an API fails | PASS for exercised cases; universal claim unverified | Browser-tested project-load503 JSON,503 HTML/unreadable response and disconnected API. All retain page structure, error message and retry. With labeled QA state fixture, failed batch/review503 preserve six shots, inspector and controls. Retry restores loaded state. No captured browser error/warning logs in the exercised failure tab. Provider/storage failure behavior also has passing fixture tests. |

## Test baseline and reproducibility

- Isolated snapshot `/private/tmp/scripty-demo-safety`, commit505b0b59a0d4f7adf1aaf5558836412b09474e39, production build PASS. Main advanced to82c2550 during this round; browser results apply to the built snapshot and require a new run after a meaningful update.
- `NODE_ENV=test node --import tsx --input-type=module` with a throwing global fetch ran Data, Cache, Engine and batch-evidence test modules: **40/40 passed**. These use controlled fixtures/injected dependencies and do not certify real cached assets.
- Local production server127.0.0.1:3046 used `DEMO_MODE=cached`, a dedicated test-only signing secret and `/private/tmp/scripty-deny-egress.cjs`; no project secrets were loaded. The preload replaces global fetch and Node http/https request/get with failing guards. `/private/tmp/scripty-egress-attempts.log` remained absent/zero entries for tested cached routes.
- HTTP requests including `x-canon-mode:live` could not override cached environment. Project returned honest missing-cache metadata, batch returned409 and eval returned stored-check mode.
- Failure proxy127.0.0.1:3047 simulated503 JSON, non-JSON HTML and socket disconnect. The stateful action checks used existing scaffold fixtures, conspicuously labeled QA STATE FIXTURE. No temporary manifest or fabricated experimental evidence was installed in the build checkout.
- Browser evidence: `handoff/screenshots/demo-safety-production-cache-missing.png`, `demo-safety-api-failure.png`, `demo-safety-action-failure.png`.

## Findings for the main build lead

1. **P1 — genuine cache absent locally and on the public app.** Finish real capture/export, include manifest, every raster and fixed reference in the released artifact, then request a recheck. Do not treat fixture success or a project200 response as a successful complete demo.
2. **P1 — deployed public build is behind current local work.** Confirm the production alias targets the intended final Scripty build. Verify full replay in a clean browser, not just deployment READY state. No deployment/access settings were changed by QA.
3. **Release gate — full replay with outbound calls denied remains pending.** Verify every recorded batch, inspect actual frames/checks/traces, accept/reject, correction memory, refresh persistence, replay exhaustion/reset, all asset responses and public cold-start behavior. Check that browser images/fonts/scripts use only local assets; server guard alone does not establish browser resource behavior.
4. **Limits on the no-crash claim.** Tested concrete failures pass. Actual long provider timeout, failed actions against genuine cached shots, malformed successful nested payloads and every possible runtime error were not exhaustively exercised. Avoid an absolute “never crashes” certification.

## Secret scan scope

Custom redacting scan over all reachable Git blobs: OpenAI sk- credential patterns, GitHub token patterns, AWS access-key identifiers, PEM/OpenSSH private-key markers, Supabase sb_secret values and JWT payloads with role=service_role. Sensitive filenames included committed `.env`, deployment/runtime env variants, auth.json and SSH private-key names. Findings would record only kind/path/blob ID, never credential values. No actual environment-secret files were opened for this scan.

GitHub exposed only main at the branch-list check; it was fetched read-only into the QA clone. Unreachable/deleted remote objects, unavailable private refs, arbitrary unknown secret formats, full GitHub account settings and provider-side secret-scanning alerts are outside this audit. An anon/public Supabase key is not treated as a private service-role credential. Latest scan summary: `/private/tmp/scripty-secret-scan.json`.

## Recheck policy

Earlier configuration (superseded above): `scripty-demo-safety-qa`, every15minutes until October17,2026 1:15p.m. Pacific. Compare main commit, real cache and production deployment. Recheck on major changes, preserve prior evidence, remain quiet on unchanged state, report new actionable failures/verified readiness to the build lead and user. Main lead was also asked to send major-update milestones directly to this QA chat.

No feature fixes, commits, pushes, production mutations or external submissions are authorized by this QA role. Do not run paid generation to make a blocked QA result pass.
