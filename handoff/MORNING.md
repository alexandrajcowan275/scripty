**Public Scripty app: https://canon-woad.vercel.app/**

```sh
cd ~/canon && npm run dev
```

Open **http://localhost:3000**. This exact command was restarted and browser-verified on this Mac against the final interface, then stopped to leave port3000 free for morning. Node24, dependencies and local credentials are installed. Repo/folder/Vercel project remain `canon`; GitHub stays private.

# Scripty — current handoff

Updated **October 17, 2026, 2:39am PT**. Current phase: Design owns the new UI from `design/claude/`; Main owns backend, persistence, docs and releases. **Code freeze 8am PT; official deadline 11am PT.** This handoff will be finalized at the freeze.

## Live now

Public: https://canon-woad.vercel.app/ · Private repo: https://github.com/alexandrajcowan275/canon · Figma: https://www.figma.com/design/M6a6owg9izgReM2ejauaos.

Production backend: main **c5acbde**, READY deployment **dpl_6GqkrWHhyqRPa45oW4cruXP7QrqM**, https://canon-cas6kz2de-archer-rag-dev.vercel.app. The public URL is the judge entry; unique URLs may require Vercel authentication. The existing light-v3 UI is still live while Design finishes the new Studio/Review/Memory flow; partial UI checkpoints are not deployed.

Implemented and real-tested: private reference upload → vision canon suggestions → production save → one-shot Generate → editable rejection → live rule extraction → repeat semantic dedupe → regenerate a new scene with the rule in both prompt and monitor → existing-shot recheck with **zero image requests** → flagged-only real replacement with source lineage. Sample repair persisted separately and original24-shot/four-take history is unchanged. The repair remained monitor-flagged: **do not claim visual improvement**.

Blind question/label endpoints and human-only evaluation are implemented. Public blind questions contain no verdict, and zero human labels return null precision/recall/F1/accuracy. Automated tests deliberately do not create human ground truth. Human disagreements can supply scoped future checker-calibration context; fixed canon/threshold and frozen eval predictions remain intact.

Evidence: [real backend loop](../docs/verification-live.json), [public backend smoke](../docs/verification-public-backend.json), [API reference](../docs/api.md), [architecture](../ARCHITECTURE.md).60 tests and build pass for the compatible backend follow-up. A real one-scene save/reload confirms stable keys, labels, manual weights and confirmed laterality; missing confirmation is rejected. Supabase additive migration applied; security advisor reports no issues.

## Access code and budget

The generated private **`SCRIPTY_ACCESS_CODE` value is in `~/canon/.env.local`**. It is also installed as a server-only Secret in [Vercel Production environment variables](https://vercel.com/archer-rag-dev/canon/settings/environment-variables). The same file/dashboard holds `CANON_PUBLIC_GENERATION_ENABLED=true`. Do not put the code in browser bundles, URLs, screenshots, docs or Git. The new UI will exchange it with `POST /api/access`; developer clients can use a bearer header. The current legacy UI has no code-entry screen yet.

Founder-authorized global cap: **$40**. Historical baseline: **$2.05**, as reported from the founder's OpenAI dashboard. Additional real verification **$0.204639 usage-derived estimate**, no holds remaining. Combined baseline+estimate **$2.254639**, available accounting headroom **$37.745361**. These estimates are not provider invoices. The old$20.58 pessimistic reservation history is preserved separately and no longer mistaken for billed spend. Main's verification has a separate atomic$6 ceiling. No purchase or data deletion occurred.

Codex last checkpoint: **61% weekly remaining**; five-hour window unavailable; zero resets used, two still available. No reset threshold has been reached.

## Exact two-minute click path on the current release

1. **0:00–0:15** Open the public landing and **Explore a sample production: Mara**.
2. **0:15–0:35** Open the flagged shot in Take4. State that this is a monitor flag whose anatomical correctness still needs a human judgment.
3. **0:35–1:00** Edit the Continuity note and **Reject**. Continue through the returned Learned rule into **Memory**. Without live access this sample action honestly saves a literal local correction; do not call it live AI extraction.
4. **1:00–1:35** Open **Progress**, show the unchanged2/6,0/6,0/6,1/6 rates and original ring-rule evidence:18 later prompts plus18 monitor outputs.
5. **1:35–2:00** Show the real prompt/check trace and explain persistent memory, separate image generation/monitoring, and unverified visual improvement. Close on “Every correction carries forward.”

This is the safe existing UI path. It will be replaced with the new Studio/Review/Memory/Eval click path after Design integration and public verification. Do not record a route that has not shipped.

## Remaining before freeze / human actions

- Main: integrate completed Design page commits, build/test, deploy and verify the public URL. Studio checkpoint exists; Review/Memory is being completed, then new-production/Progress/Eval/developers.
- Main: finalize this file at8am with actual final commit, exact new two-minute route and remaining limits.
- Founder: enter the private access code in the new UI when available; confirm anatomical left/right in canon suggestions rather than trusting the vision proposal.
- Founder: provide actual blind judgments if presenting checker metrics. No human accuracy or causal visual improvement is established yet.
- Founder: record/upload the final two-minute video, arrange judge access to the private GitHub repo, and submit before11am unless an organizer confirms an extension. No external submission or repository visibility change has been performed.
- No general Undo API, accounts/cross-device recovery, full script/cast management or rule-conflict resolution. UI must not advertise these as complete. Browser ownership lasts30days; clearing the cookie loses access.

[Devpost](../docs/devpost.md) · [video script](../docs/video-script.md) · [pitch](pitch-final.md) · [backend decisions](../docs/backend-decisions.md) · [blockers](../BLOCKED.md).
