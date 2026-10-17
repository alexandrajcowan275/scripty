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
