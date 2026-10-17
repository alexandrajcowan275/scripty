# Decisions

## TASK 0 — scaffold

- Keep the mandated Next.js App Router + TypeScript + Tailwind stack. Pin stable npm registry versions and commit the lockfile. No stack changes or shared type changes.
- Use Tailwind's PostCSS plugin. Keep the prescribed palette in `styles/tokens.css`, with semantic Tailwind aliases; components use token names. Standalone SVG placeholder files repeat the palette because they are image assets, not components.
- Use local neutral SVG slates so the skeleton has no external image/font dependency. The font stack prefers Inter/Geist when installed and uses system fonts otherwise; the UI task can bundle fonts. No fabricated reference art or AI checks.
- All mock routes share deterministic fixtures in `lib/mock-data.ts`. Do not create fake persistence or continual learning. Echo a review response only; GET returns the original fixture.
- Return null eval metrics until hand labels and actual checks exist. Mock drift rate is calculated from fixture flags, not hardcoded as a learning result.
- Leave provider choice, Supabase SDK/schema, Zod monitor validation, shadcn primitives, and real features to their owning tasks. No live credentials are needed or read by the scaffold.
- Use one minimal status page for now. No Figma file was supplied; use section 7 tokens for this skeleton and leave composed UI design to TASK 1.

## Overnight build — setup and evidence

- Use isolated Data, Engine, and UI worktrees with folder ownership; root handles integration, deployment, API spending, and pitch. Serves rubric3: parallel progress with reviewable commits.
- Keep public database RLS enabled and server-only access instead of the optional RLS-off demo shortcut. Only generated image reads are public. Serves rubric3: reliable deployment without exposing the service key or raw write access.
- Bundle Geist locally to avoid font-fetch build failures. Serves rubric3/4: repeatable builds and intentional typography.
- Use a conservative persistent API reservation ledger and default public production to explicitly labeled real-cache playback after capture. Live generation requires the configured admin token. Serves rubric1/3/5: honest measurements, budget reliability, and visible failure handling.
- Keep draft labels out of authoritative eval; draft-only metrics must be clearly separate. Serves rubric1/5: judge-facing claims remain auditable.
- Background heartbeat creation was rejected by automatic approval review; no recurring automation was installed. Work continues in the active session.

- Adopt11:00am PT as the conservative working submission deadline, assets10:45am, based on updated event-review planning. Do not claim the event page was verified here. Serves rubric3: earlier safe readiness.
- Demonstrate transfer to DIFFERENT scenes after a correction and hold the evaluation criteria fixed. Do not equate a lower changing-monitor flag rate with verified improvement; draft labels remain provisional. Serves rubric1/2/5.
- Defer extra providers/features when they compete with the one-character learning proof. Serves rubric1/3/4.

- Disable Next.js generated agent rules so `next dev` cannot overwrite this project's own AGENTS.md. Use webpack for the production build script because Turbopack's CSS worker needs a port that is restricted in worker sandboxes. `npm run build` remains the required production gate. Include dynamic seed/cache assets in serverless tracing. Serves rubric3: instructions and cached backup survive deployment.

- The first real batch exposed mirror/orientation false positives in monitorv1. Freeze explicit anatomical orientation and occlusion handling as monitorv2; retain originalv1 output and label any baseline re-evaluation. Do not attribute checker calibration to creator learning or hide the original100% flag rate. Serves rubric1/5: evaluate the evaluator and keep evidence auditable.
- Give live users an optional six-scene editor and poll durable partial results. Incomplete batches cannot appear as improving chartpoints. Serves rubric1/3/4/5: demonstrate transfer while preserving usable successes and uncertainty.
- Return actionable409 on replay-session capacity and use content-hashed cache image names. Serves rubric3: recoverable, reproducible backup.

## Scripty identity and latest user steering

- Rename the product to **Scripty**, the AI script supervisor. Keep repository/folder/project identifiers and environment prefixes stable so deployment and stored data remain intact. Serves rubric2/3/4/6: a film-native role explains the actual buyer problem without a camera-brand collision.
- User reaffirmed1:15pmPT submission deadline and a1:00amPT readiness checkpoint. Keep morning assets target10:45am. This latest direct steering supersedes the earlier conservative11am planning. Serves rubric3.
- Inspect a small latest-model quality sample before scaling; use a consistent cinematic lens/lighting/style prompt. Final calibration is limited to roughly3 attempts; retain all observed results rather than chase a descending curve. Serves rubric1/3/4/5.

- Design pass uses the script-supervisor role as a quiet slate/wordmark and actual UTC capture metadata instead of fabricated footage timecodes. Increase image/type scale and retain mobile stacking; distinguish recorded memory from browser-local corrections. Red/gold/green remain semantic evidence colors while operational metrics use neutral marks. Serves rubric2/3/4/5.
- Final checker v3 uses a labeled canonical reference plus shot and a stronger budgeted vision model. A known-shot spot check correctly resolved scar-side false positives. Freeze this version after the third calibration attempt; do not tune further to chase a curve. Originalv1/v2 results remain in experiments. Serves rubric1/5.
- Per direct quality steering, later batches use pinned GPTImage2.5Sunburst high with consistent35mm/Super35/f2.8 lighting/grade language. Two inspected real samples passed visual quality. This model/style transition is disclosed as a confound; no memory-only causal claim is made. Serves rubric1/3/4.

### Final live rehearsal: completion and review limits

The live browser rehearsal produced six new frames while read-only polling displayed durable progress. The completion notice now compares against batch IDs present when generation began, so polling cannot mislabel a fresh batch as a duplicate. Rejection input is limited to the API's400-character contract, avoiding an avoidable validation failure after a long production note.
