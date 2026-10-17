# Scripty design polish

Scripty is the AI script supervisor: it checks continuity and carries creator corrections into project memory. The UI now uses the Scripty name throughout and the page title/description reflect that role. Internal repository paths, database contracts, environment keys and API routes are unchanged.

## What works

- Quiet clapperboard wordmark; restrained production, batch and frame slates. Capture timestamps use the actual batch.createdAt in explicitly labeled UTC. No invented footage timecodes.
- Larger filmstrip images, readable supporting text, clearer hierarchy and spacing, with the existing three-pane workstation and stacked mobile flow retained.
- Red denotes drift/errors, gold denotes learned memory, green denotes passing checks. Operational chart markers and playback notices are neutral. Incomplete and unclear evidence remains explicit; passing checks are described as checks passed, never continuity verified.
- Playback says Load recorded batch and distinguishes recorded memory from this browser’s corrections using recordedRuleIds. The UI does not claim new corrections change recorded generations.
- Existing A/R keyboard controls, focus states, reduced-motion rules, sequential shot entry, rule arrival, loading, empty and failure states remain available.

## Validation

- npm run build: passed (webpack).
- npm run typecheck: passed.
- node --import tsx --test components/batch-evidence.test.tsx: 4 passed.
- git diff --check: passed.
- Browser inspection through Cua at 1465px and compact desktop at 910px: real reference, six real captured batch-01 frames, pass/fail attributes, pending reviews, metadata, and source disclosures render. The compact screenshot is handoff/screenshots/scripty-compact-desktop-captured-batch.png.
- A fresh 390px visual check was interrupted by user control of the browser. Existing 390px styles remain; integration should recheck the final app at exactly 1440px and 390px.

## Mocked / limitations

No fabricated images, checks, metrics or cache were committed. Visual QA used a temporary isolated fixture built from the real batch-01 response and inspection PNGs supplied by the root agent. The temporary manifest and image copies were removed, and the original seed file restored before commit. The historical captured checker results in that screenshot are not a claim of accuracy or improvement; root is calibrating anatomical-side checks separately.

At shorter desktop heights the full workspace extends vertically so filmstrip images remain usable; the center batches, memory and inspector also retain their own overflow regions. There are no new paid requests or live UI writes.

## Next steps / run

Cherry-pick the design commit, install the real final cache/reference, then run npm run dev -- --webpack --port 3027 (or the integration port). Confirm desktop/mobile, cache provenance and one local replay correction. Re-run build after integration.

Intentional design decision for root DECISIONS.md: use actual capture-time UTC metadata instead of fabricated video frame timecodes; apply semantic red/gold/green to evidence states while rendering operational metrics in neutral colors.


## Full-frame inspection follow-up

The selected-shot image now has a keyboard-accessible Expand frame control. It opens the same image in a native modal dialog with batch/frame/scene context and contain sizing within the viewport. Close and Escape use native dialog dismissal and focus restoration. A/R global review shortcuts return immediately while the preview is open, so inspecting detail cannot review a hidden frame. No API, generation, image-editing or review behavior was added.

Follow-up validation: typecheck, webpack build, focused evidence/scene tests and diff checks. A fresh browser check was left to root because browser user control interrupted the earlier session.
