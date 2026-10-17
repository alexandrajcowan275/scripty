**Public Scripty app: https://canon-woad.vercel.app/**

```sh
cd ~/canon && npm run dev
```

Open **http://localhost:3000**. This exact command was restarted and browser-verified on this Mac against the final interface, then stopped to leave port3000 free for morning. Node24, dependencies and local credentials are installed. Repo/folder/Vercel project remain `canon`; GitHub stays private.

# Scripty — current handoff

Updated **October 17, 2026, 2:45am PT**. Current phase: Design owns the new UI from `design/claude/`; Main owns backend, persistence, docs and releases. **Code freeze 8am PT; official deadline 11am PT.** This handoff will be finalized at the freeze.

## Live now

Public: https://canon-woad.vercel.app/ · Private repo: https://github.com/alexandrajcowan275/canon · Figma: https://www.figma.com/design/M6a6owg9izgReM2ejauaos.

Production: main **3e0c8b8**, READY deployment **dpl_C4D7c2LBvDAGPqCjnkVWn1eVkq8B**, https://canon-q7gtwc6vg-archer-rag-dev.vercel.app. The public URL is the judge entry; unique URLs may require Vercel authentication. The new Studio → Review → Memory flow is live at **https://canon-woad.vercel.app/p/mara** and publicly browser-verified. Existing landing/new-production routes remain available while Design completes their replacements and consolidates shared components.

Implemented and real-tested: private reference upload → vision canon suggestions → production save → one-shot Generate → editable rejection → live rule extraction → repeat semantic dedupe → regenerate a new scene with the rule in both prompt and monitor → existing-shot recheck with **zero image requests** → flagged-only real replacement with source lineage. Sample repair persisted separately and original24-shot/four-take history is unchanged. The repair remained monitor-flagged: **do not claim visual improvement**.

Blind question/label endpoints and human-only evaluation are implemented. Public blind questions contain no verdict, and zero human labels return null precision/recall/F1/accuracy. Automated tests deliberately do not create human ground truth. Human disagreements can supply scoped future checker-calibration context; fixed canon/threshold and frozen eval predictions remain intact.

Evidence: [real backend loop](../docs/verification-live.json), [public backend smoke](../docs/verification-public-backend.json), [API reference](../docs/api.md), [architecture](../ARCHITECTURE.md).60 backend tests,4 UI regression tests and build pass for the integrated release. A real one-scene save/reload confirms stable keys, labels, manual weights and confirmed laterality; missing confirmation is rejected. Supabase additive migration applied; security advisor reports no issues.

## Access code and budget

The generated private **`SCRIPTY_ACCESS_CODE` value is in `~/canon/.env.local`**. It is also installed as a server-only Secret in [Vercel Production environment variables](https://vercel.com/archer-rag-dev/canon/settings/environment-variables). The same file/dashboard holds `CANON_PUBLIC_GENERATION_ENABLED=true`. Do not put the code in browser bundles, URLs, screenshots, docs or Git. The new UI will exchange it with `POST /api/access`; developer clients can use a bearer header. The new Studio live-action buttons open the access-code dialog; access remains optional for free sample review.

Founder-authorized global cap: **$40**. Historical baseline: **$2.05**, as reported from the founder's OpenAI dashboard. Additional real verification **$0.204639 usage-derived estimate**, no holds remaining. Combined baseline+estimate **$2.254639**, available accounting headroom **$37.745361**. These estimates are not provider invoices. The old$20.58 pessimistic reservation history is preserved separately and no longer mistaken for billed spend. Main's verification has a separate atomic$6 ceiling. No purchase or data deletion occurred.

Codex last checkpoint: **61% weekly remaining**; five-hour window unavailable; zero resets used, two still available. No reset threshold has been reached.

## Exact two-minute click path on the current release

1. **0:00–0:15** Open **https://canon-woad.vercel.app/p/mara**. Take4 shows six real shots, one flagged, and the original four-take timeline.
2. **0:15–0:35** Click **Review1 flagged** to open T4·S05. Show the canonical reference comparison and the monitor's expected/observed evidence; its anatomical verdict is not human-certified.
3. **0:35–1:00** Edit **Your note**, click **Reject & remember**, show the actual returned rule and merged/new result in Memory update. This free sample session uses a literal creator correction unless live access is entered; never call a local correction AI extraction.
4. **1:00–1:30** Leave optional paid re-check/fix unchecked and click **Save to memory**. Back in Studio, the new note has0 prompts/0 checks until actually applied; the original ring rule shows18 prompts/18 checks.
5. **1:30–2:00** Show the unchanged2/6,0/6,0/6,1/6 timeline and explain persistent memory plus separate generation/monitoring. Visual improvement and human accuracy remain unverified. Close on “Every correction carries forward.”

New Evidence/Eval/developer/new-production pages are still pending integration. Do not click their unfinished navigation for the recording. Desktop1440 and mobile390 public checks passed with no horizontal overflow or missing images. [Studio desktop](../docs/images/ui-v2-studio-public.png) · [Memory update](../docs/images/ui-v2-memory-public.png) · [Studio mobile](../docs/images/ui-v2-studio-mobile-public.png).

## Remaining before freeze / human actions

- Main: integrate completed Design page commits, build/test, deploy and verify the public URL. The complete Studio/Review/Memory checkpoint is merged/deployed; consolidation, landing/new-production/Progress/Eval/developers follow.
- Main: finalize this file at8am with actual final commit, exact new two-minute route and remaining limits.
- Founder: enter the private access code in the Studio live-action dialog; confirm anatomical left/right in canon suggestions rather than trusting the vision proposal.
- Founder: provide actual blind judgments if presenting checker metrics. No human accuracy or causal visual improvement is established yet.
- Founder: record/upload the final two-minute video, arrange judge access to the private GitHub repo, and submit before11am unless an organizer confirms an extension. No external submission or repository visibility change has been performed.
- No general Undo API, accounts/cross-device recovery, full script/cast management or rule-conflict resolution. UI must not advertise these as complete. Browser ownership lasts30days; clearing the cookie loses access.

[Devpost](../docs/devpost.md) · [video script](../docs/video-script.md) · [pitch](pitch-final.md) · [backend decisions](../docs/backend-decisions.md) · [blockers](../BLOCKED.md).
