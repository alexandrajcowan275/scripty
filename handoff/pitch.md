# Scripty pitch handoff

## Works

Product-facing docs use **Scripty** and the script-supervisor origin story. `docs/devpost.md` covers the workflow and four tracks; `docs/video-script.md` is a timed two-minute VC pitch with a demo sequence and honest alternate lines; `docs/brand-guide.md` defines voice, identity direction, and existing palette; `docs/competitors.md` compares four adjacent products using official sources reviewed October 17, 2026.

The story is: a creator correction on one shot becomes persistent, deduplicated memory, then reaches generation and monitoring of different scenes. Operational flags are separate from verified continuity. Pricing, buyers, savings, video/world-model integrations, and cross-project analysis are hypotheses or future work.

## Mocked / pending

The Devpost draft now reports baseline checker-v3 recheck 2/6 flagged and batch 2 at 0/6 flagged, including 6/42 uncertain checks and zero unavailable checks. All six different new-scene prompts and monitor outputs contain the learned ring rule. Original v1/v2 baseline checks remain preserved at 6/6 flagged. The image model/quality and cinematic style changed at batch 2; this confounds a memory-only comparison. Batch 3 is running with six different new scenes and frozen later settings/checker; no result is claimed yet. Human-verified continuity, accuracy, and causal improvement remain unmeasured.

Agent draft labels require human verification. Cached viewer corrections are browser-local; recorded engine context belongs to the captured run and historical images do not change. The public URL https://canon-woad.vercel.app is included, with latest real-cache deployment verification pending. The new one-page docs/brand-guide.pdf is complete and visually verified. Final logo artwork, recording, and external submission are pending.

## Decisions for root to merge

- Public name: Scripty. Tagline: “Your AI script supervisor.” Close: “Scripty. Keep the story straight.” This replaces the old guaranteed-improvement-sounding close.
- Keep internal repository/folder names, Vercel project names, contracts, and environment prefixes unchanged.
- Use the real ring example when visibly verified, not a hypothetical scarf failure. Retain initial checks and disclose monitor calibration changes.
- Compare Runway, Frame.io, Mem0, and LangSmith as adjacent categories; no unsupported uniqueness or competitor feature-absence claim.

## Exact next steps

1. Root: add final batch 3/4 evidence from `handoff/results.md` when complete; preserve scene sets, monitor versions, sample counts, actual flags, and label verification status. Do not imply an improvement if none is verified.
2. Root: verify latest real-cache deployment at the documented public URL. At the 1:00am PT October 17 checkpoint, verify local full flow with real images, one-command README setup, real cached playback, and latest deployment URL.
3. Record the pitch with its appropriate live/recorded line; use only verified different-scene traces and actual persistence evidence.
4. Target assets ready October 17 at 10:45am PT. The user's event deadline is **October 17, 2026, 1:15pm PT**; it overrides the older 11:00am planning note. External submission requires direct user authorization.

## Run / validation

Documentation and one PDF only; no app changes, new dependencies, or paid API requests. PDF authored with ReportLab using embedded fonts, rendered with Poppler, visually inspected at 1600px, and confirmed as exactly one page with pypdf. git diff --check passes. Pilot business metric is review minutes and generation cost per approved shot under a fixed review standard; no market or savings numbers are invented. Root runs the combined repository build gate after merging.
