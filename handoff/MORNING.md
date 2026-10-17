# Scripty — final morning handoff

```sh
cd ~/canon && npm run dev
```

Open http://localhost:3000. [Public production](https://canon-woad.vercel.app/) · [Private GitHub](https://github.com/alexandrajcowan275/canon).

**Finalized at 6:18am PT, on the first heartbeat after the scheduled 6:15am checkpoint. The overnight lead heartbeat is being paused, not deleted.**

**Deadline conflict:** your latest target is October 17, **2:00pm PT**. The current official Devpost listing says **11:00am PDT today**. Submit by 11am unless you have an organizer-confirmed extension. [Official source](https://sephacks-2026.devpost.com/) · [recorded verification](../docs/verification-deadline.json).

## What is live

All eight application pages, final error/empty states and the optional location card are integrated. Production was READY on **main / c73a3a945b633a160720c1836b5396c648b4dfc2** for the final check; application changes are **c4c69d9**. [Verified deployment](https://canon-bsh2ki5tw-archer-rag-dev.vercel.app) · [green CI](https://github.com/alexandrajcowan275/canon/actions/runs/39031673533) · [final check receipt](../docs/verification-morning-final.json). The final handoff commit changes documentation only.

**74 tests pass; production build passes.** The final check returned 200 for landing, Studio, Evidence, Eval, API, productions, setup and the sample/labels/metrics/location endpoints. Mara still has **24 real original images and four takes**; its study queue has **210 questions**, with all 12 controlled-study images first. One bundled study PNG matched the saved original exactly. Public Studio had 10 loaded visible images, no broken visible image and no horizontal overflow. No rollback was required. No paid calls or human labels were submitted during this check.

- **Mara:** instant original production history, image/reference review, editable rejection notes, deduplicated Memory, original rule reach, Evidence and blind Eval.
- **New productions:** private reference upload, real vision suggestions, explicit corrected LEFT/RIGHT confirmation, weighted canon, one to six scenes, live generation behind the private code and saved-production navigation. The real public UI Generate → Review → Learn → Regenerate loop saved two images and a rule, then demonstrated that rule in a later prompt/check.
- **Rule reach:** monitor-only recheck creates no images; flagged-only repair preserves the source and adds lineage. The tested repair remained flagged, so repair is not claimed as guaranteed visual correction.
- **Blind Eval:** conditions and monitor verdicts stay hidden on cards. GET/POST metrics use human labels and frozen predictions only. Precision/recall/F1 remain blank without eligible labels; no agent-created ground truth exists.
- **Locations:** exact existing World Labs platform still and metadata are public. The card honestly marks the external Marble world private. No location checking, reference injection or new world generation is claimed.
- **Repository:** README, architecture, API, results, Devpost and video docs are updated; MIT license, green CI and `scripty` package name are in place. Only CODEX_TASKS moved into `docs/process/`. Main owned backend/docs/releases; Design owned UI.

The exact local startup above was independently verified at port 3000 with the sample and study image, then Main stopped its temporary server. [Local receipt](../docs/verification-local-startup.json). New checkouts need Node 24, `npm ci` and `.env.example` copied to `.env.local`; Mara requires no AI credentials.

## Real results and cost

**Controlled six-pair A/B:** canon only **0/6** targeted flagged shots; canon + learned rule **0/6**. Each arm had 0/12 ring/scar failures and 0/24 overall failures, no uncertainty. Scenes, reference, generation settings and checker were identical. **No additional measured reduction.** All 12 images and 24 settled receipts remain in `seed/experiments/ab-test/`; human validation is pending. Estimated returned-usage cost: **$0.710364**.

Original history remains **2/6 → 0/6 → 0/6 → 1/6** flagged. One ring rule reached **18 later prompts and 18 checks**. Models, scenes, references and monitoring requirements changed across those takes; that curve is not causal evidence.

The separate public new-production UI loop had two real images, a new scarf-knot rule and **1 later prompt / 1 rule check**. Both takes were 0/1 flagged; no improvement claim. Additional usage estimate **$0.121538**, plus **$0.000404** for changed-Memory merge verification without another image. [Receipts](../docs/verification-ui-live-loop.json).

Founder-reported OpenAI baseline **$2.23**; credit balance **$32.29 at that checkpoint**. Post-baseline usage estimate **$0.832306**, total estimate **$3.062306**, not an invoice or a new dashboard reading. App cap **$30**; Main testing cap **$12**; A/B cap **$3** within testing. Old receipts survive reconciliation; stale holds release after 30 minutes, including before preflight. No purchase was made. [Operations](../docs/operations.md).

Final Codex checkpoint: **35% weekly remaining**; five-hour figure unavailable; **0 resets used**, two available. No reset threshold was reached.

## Exact two-minute sample path

1. **0:00–0:15:** Landing → **Watch it on Mara** → **Take 1**. Open **T1·S02**, the frontal portrait with the ring-hand finding.
2. **0:15–0:35:** **With reference**. Explain the finding as model-reported; visually verify the ring before filming.
3. **0:35–1:00:** Edit **Your note** to “Keep the silver ring on Mara’s anatomical RIGHT hand.” → **Reject & remember**. Show the actual returned new/merged rule in **Memory update**. Future-take scope is already saved. Do not select recheck/fix unless intentionally spending.
4. **1:00–1:20:** **Save to memory** → Studio. Show the original ring rule’s **18 prompts / 18 checks**, separately from today’s note: a new visitor note did not cause historical images.
5. **1:20–1:45:** **Evidence**. Show original history and the matched **0/6 vs 0/6** result. Memory transfer is demonstrated; extra visual improvement is not.
6. **1:45–2:00:** **Eval**. Show the study images queued first and human metrics awaiting judgments. Close on “Every correction carries forward.”

[235-word narration and recording plan](../docs/video-script.md). Use a separate private/incognito session for a clean sample; the shared in-app browser retains QA notes under the no-deletion instruction. Enter the private code before recording if narrating live extraction. Without it a free sample correction is a literal saved creator note, not live AI extraction.

The existing in-app browser owns **Night Train — workflow check**, with two real saved takes and live learned-rule history. Do not clear that browser’s cookies. It has one attempt remaining under the existing three-attempt limit.

## What you must do by hand

1. **Check the deadline/extension now; plan to submit by 11am PDT.** No external submission was performed.
2. **Add actual blind judgments.** Save one and refresh to confirm persistence first, then complete the first 48 questions for all 12 study images. Do not call model results human truth. Undefined metric denominators can legitimately remain blank even after 20 judgments.
3. **Rehearse, record and upload the two-minute video.** Confirm it opens without login; replace README’s video placeholder with the real link.
4. **Arrange judge access to the private GitHub repository**, then submit the working app, repository and video links. The repo was not made public.

The private access code is in **`~/canon/.env.local` → `SCRIPTY_ACCESS_CODE`**. Production: [Vercel → canon → Environment Variables → Production](https://vercel.com/archer-rag-dev/canon/settings/environment-variables). Its value is absent from docs/screenshots. Live use also requires the existing enable switch; it was enabled for the verified authorized loop.

## Limits and optional follow-up

The **three-take lifetime attempt limit remains**. Automatic approval review rejected Main’s proposed hourly replacement as an expansion of persistent paid capacity; no migration or limit expansion ran. Expanding it is an optional morning approval decision, not an overnight workaround. Mara’s original four takes remain available.

Compare-takes, advanced cast/script features, accounts/cross-device recovery and general Undo are outside this release. Reference generation has an endpoint; setup is upload-first. Disabled controls are not advertised as implemented.

The optional external Marble viewer reported permission denied. The captured still works; no sharing permissions were changed. Share that world later only if desired. This does not block the core loop.

No more paid repetition or new feature work is planned. A stronger future experiment using a novel correction absent from the initial canon is proposed in `internal/IDEAS.md`; it is not a measured result or a submission blocker. Final judge/QA reports remain attributed in `handoff/judge-log.md` and `handoff/demo-safety.md`.
