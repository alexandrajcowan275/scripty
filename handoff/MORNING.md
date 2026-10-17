# Scripty — final morning handoff

```sh
cd ~/canon && npm run dev
```

Open http://localhost:3000. [Public production](https://getscripty.vercel.app/) · [Home](https://getscripty.vercel.app/dashboard) · [Private GitHub](https://github.com/alexandrajcowan275/scripty).

**Final refinement candidate: integration `9943935`, Design application commits `b5632ce` (Memory reopen), `2ae7143` (empty reference zone), and `28955b2` (landing product story), following the shared shell `9ea34f8`. All92 tests, typecheck and build pass for this exact combined checkout. Production is held on the verified e83f899 release until this candidate is READY; public verification is recorded separately below after release. The lead, judge-panel and QA heartbeats remain paused. Founder’s final checkpoint: stable by9:40am PT, all work stops9:45am PT.**

**Confirmed submission deadline: October 17, 11:00am PT/PDT.** The founder confirmed the official Devpost cutoff; earlier 2pm estimates are superseded. [Official source](https://sephacks-2026.devpost.com/) · [recorded verification](../docs/verification-deadline.json).

## What is live

The final candidate’s shared sidebar and breadcrumb/title/action header connect all eight in-app pages, with the actual production nested under Productions. The old Studio top navigation is removed. Route content fades150ms with reduced-motion protection. Sidebar Memory preserves the selected take; the fixed direct action is queued for rapid public reopen verification after Escape. The working **Home** leads with pending flagged shots, then Productions, Recently learned, Agents and Activity. The review queue uses compact3:2 images in3/2/1 desktop/tablet/mobile columns, with short failed-attribute/confidence labels; full monitor notes stay in Review. The landing hero offers **Explore the sample: Mara →** directly to Mara Studio alongside **Start a production**. The historical chart is on **Evidence**. Recorded agent run times are real; live agent status is explicitly unavailable. Studio, Review and Evidence use the final restrained workspace styling. The landing has four credited cinematic photographs, the founder’s exact headline, pause/resume and a reduced-motion fallback; Mara remains the product content below it. No fashion imagery renders on landing/Home.

**92 tests, typecheck, production build and CI pass.** The preceding cinematic application `ea366f2` was verified READY as `dpl_HCcBbNgwSATzi4NGJTQdhRNpq3zB`; the final two UI changes are `610a133`, released through the same Main Git integration. Both `getscripty.vercel.app` and `canon-woad.vercel.app` remain attached to that production project. Home/Studio/Review/Evidence were verified at 1440px and 390px; all four have no document overflow. Review/Evidence images have no editorial filter or transform. Landing verified at both sizes, all four responsive photos load, pause/resume works, and Open studio reaches Home. [Final design receipt](../docs/verification-design-final.json) · [green CI](https://github.com/alexandrajcowan275/scripty/actions/runs/39046238685).

Browser ownership/access/labels are hostname-scoped. **Keep the existing blind-eval session on [the old hostname](https://canon-woad.vercel.app/p/mara/eval)**; the URL rebrand does not transfer its cookies. The old app URL and old GitHub URL continue working. No paid requests or human labels were submitted during the design pass. Before the shell release, the original-host Eval showed48/210 saved answers, question49, TN48 and TP/FP/FN0, with no uncertainty. Those are agreements on clean examples; precision/recall remain undefined without drift-positive cases. Main recorded this baseline without changing answers and compares it after deployment.

### Historical 6:18am checkpoint

The following overnight receipt predates the URL and visual releases above.

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

Latest checked Codex usage: **22% weekly remaining**; five-hour figure unavailable; **0 resets used**, two available. No reset threshold was reached at that check.

## Exact two-minute sample path

1. **0:00–0:15:** Landing → **Explore the sample: Mara →** → **Take 1** → **T1·S02**, the frontal portrait with the ring-hand finding. The hero opens Mara directly; **Open studio** remains the Home entry.
2. **0:15–0:35:** **With reference**. Explain the finding as model-reported; visually verify the ring before filming.
3. **0:35–1:00:** Edit **Your note** to “Keep the silver ring on Mara’s anatomical RIGHT hand.” → **Reject & remember**. Show the actual returned new/merged rule in **Memory update**. Future-take scope is already saved. Do not select recheck/fix unless intentionally spending.
4. **1:00–1:20:** **Save to memory** → Studio. Show the original ring rule’s **18 prompts / 18 checks**, separately from today’s note: a new visitor note did not cause historical images.
5. **1:20–1:45:** **Evidence**. Show original history and the matched **0/6 vs 0/6** result. Memory transfer is demonstrated; extra visual improvement is not.
6. **1:45–2:00:** **Eval**. Show the study images queued first and whatever human metrics are actually available in that browser; undefined denominators can remain blank. Close on “Every correction carries forward.”

[235-word narration and recording plan](../docs/video-script.md). Use a separate private/incognito session for a clean sample; the shared in-app browser retains QA notes under the no-deletion instruction. Enter the private code before recording if narrating live extraction. Without it a free sample correction is a literal saved creator note, not live AI extraction.

The existing in-app browser owns **Night Train — workflow check**, with two real saved takes and live learned-rule history. Do not clear that browser’s cookies. It has one attempt remaining under the existing three-attempt limit.

## What you must do by hand

1. **Submit by the confirmed 11am PDT deadline.** No external submission was performed.
2. **Finish or verify the blind judgments in your original eval browser/hostname.** Use its saved-answer count to confirm progress through the first 48 questions for all 12 study images. No agent-created ground truth exists. Undefined metric denominators can remain blank even after 20 judgments.
3. **Rehearse, record and upload the two-minute video.** Confirm it opens without login; replace README’s video placeholder with the real link.
4. **Arrange judge access to the private GitHub repository**, then submit the working app, repository and video links. The repo was not made public.

The private access code is in **`~/canon/.env.local` → `SCRIPTY_ACCESS_CODE`**. Production: [Vercel → canon → Environment Variables → Production](https://vercel.com/archer-rag-dev/canon/settings/environment-variables). Its value is absent from docs/screenshots. Live use also requires the existing enable switch; it was enabled for the verified authorized loop.

## Limits and optional follow-up

The **three-take lifetime attempt limit remains**. Automatic approval review rejected Main’s proposed hourly replacement as an expansion of persistent paid capacity; no migration or limit expansion ran. Expanding it is an optional morning approval decision, not an overnight workaround. Mara’s original four takes remain available.

Compare-takes, advanced cast/script features, accounts/cross-device recovery and general Undo are outside this release. Reference generation has an endpoint; setup is upload-first. Disabled controls are not advertised as implemented.

The optional external Marble viewer reported permission denied. The captured still works; no sharing permissions were changed. Share that world later only if desired. This does not block the core loop.

No more paid repetition or new feature work is planned. A stronger future experiment using a novel correction absent from the initial canon is proposed in `internal/IDEAS.md`; it is not a measured result or a submission blocker. Final judge/QA reports remain attributed in `handoff/judge-log.md` and `handoff/demo-safety.md`. [Judge questions and short answers](judge-prep.md) are ready for rehearsal; these are inferred panel reactions, not actual judges’ scores.
