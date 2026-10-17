# Scripty integration handoff

UI, engine, Supabase data/evaluation, pitch and senior design work are integrated on main. No runtime mock generation remains. Public playback uses four genuine recorded batches; local/deployed live runs used real OpenAI/Supabase calls. Internal repository/project names remaincanon.

## Full live flow verified

Reference+sheet →6-shot baseline →structured checks →reject/correction →one deduplicated persistent rule →different new scenes with rule in prompt/checks →accepted positive reference →deployed final batch. Exact evidence/limitations are in results.md. The local browser generated batch3, inspected and accepted a portrait, and refresh preserved it. Batch4 ran on Vercel with that portrait in all6 generation traces.

## Highest-impact issues fixed

1. Anatomy false positives: three disclosed checker attempts; finalv3 frozen, residual profile ambiguity retained rather than hidden.
2. Missing new-scene entry: six-line scene editor with exact validation and saved prompt context.
3. Misleading incomplete curve/false green: unavailable/partial batches excluded, uncertainty counted separately, explanatory chart caption.
4. Serverless replay state: signed per-browser cookie with stable server secret, isolated review memory, explicit recorded/local provenance and finite409 exhaustion.
5. Professional image/detail review: real Sunburst high samples inspected before scaling, consistent cinematic language, original-size native dialog with keyboard protection/focus restoration.

Additional live-rehearsal fixes: progress polling cannot mislabel a new completed batch as a duplicate; rejection input matches400-character API limit. Forty tests and final production build pass. All24 cache hashes and API file traces pass. Run `cd ~/canon && npm run dev` →http://localhost:3000; exact one-command startup and full local cached flow were verified on this Mac.

## Remaining

No application setup blocker. Human label verification, video recording/link, and external submission remain morning actions. No claim of verified image improvement. See MORNING.md for final public release/rehearsal and results.md for all measured counts.
