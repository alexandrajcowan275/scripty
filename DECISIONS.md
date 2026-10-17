# Decisions

## TASK 0 — scaffold

- Keep the mandated Next.js App Router + TypeScript + Tailwind stack. Pin stable npm registry versions and commit the lockfile. No stack changes or shared type changes.
- Use Tailwind's PostCSS plugin. Keep the prescribed palette in `styles/tokens.css`, with semantic Tailwind aliases; components use token names. Standalone SVG placeholder files repeat the palette because they are image assets, not components.
- Use local neutral SVG slates so the skeleton has no external image/font dependency. The font stack prefers Inter/Geist when installed and uses system fonts otherwise; the UI task can bundle fonts. No fabricated reference art or AI checks.
- All mock routes share deterministic fixtures in `lib/mock-data.ts`. Do not create fake persistence or continual learning. Echo a review response only; GET returns the original fixture.
- Return null eval metrics until hand labels and actual checks exist. Mock drift rate is calculated from fixture flags, not hardcoded as a learning result.
- Leave provider choice, Supabase SDK/schema, Zod monitor validation, shadcn primitives, and real features to their owning tasks. No live credentials are needed or read by the scaffold.
- Use one minimal status page for now. No Figma file was supplied; use section 7 tokens for this skeleton and leave composed UI design to TASK 1.
