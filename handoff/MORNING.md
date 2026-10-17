# Scripty — morning handoff

```sh
cd ~/canon && npm run dev
```

Open http://localhost:3000. Public: **https://canon-woad.vercel.app/**. Private GitHub: **https://github.com/alexandrajcowan275/canon**. Latest founder-supplied submission deadline: **October17,2026,2:00pm PT**. Final overnight handoff: **6:15am PT**.

**Deadline discrepancy — current official listing is11:00am PDT today**, verified again in the public browser. Your latest target is2:00pm PT; an extension is not publicly confirmed. Submit by11am unless you have organizer confirmation. [Official source](https://sephacks-2026.devpost.com/) / [verification](../docs/verification-deadline.json).

Updated **5:13am PT**, release candidate complete. Production is READY on **3817d1775d3f503ce267b4703acf3546378c111c**, branch **main**; application changes are **c4c69d9**. [Deployment](https://canon-9bxt7xng6-archer-rag-dev.vercel.app) · [green CI](https://github.com/alexandrajcowan275/canon/actions/runs/39031477347) · [verification receipt](../docs/verification-final-candidate.json). All eight pages, final recovery states and the optional location card are live. **74 tests pass; production build passes.** No rollback was required. Main owns backend/docs/releases; Design owns UI. One final bounded readiness check remains scheduled for 6:15am.

## What works

- Mara:24real original images/four takes, instant sample history, image/reference review, editable notes, deduplicated memory, original rule reach, Evidence and blind Eval.
- New productions: private reference upload, real vision suggestions, explicit corrected LEFT/RIGHT confirmation, weighted canon,1–6scenes, live generation behind the private code, editable rejection→live rule extraction/merge→later generation and checking. Saved-production navigation and private reference previews survive refresh.
- Rule reach: monitor-only recheck (zero new images) and flagged-only replacement with source lineage; original shots/history stay available. The tested repair remained flagged.
- Blind Eval:12controlled-study images first,48canon questions before the original162; conditions/verdicts hidden on cards. GET/POST evaluation agree on human-only frozen predictions and never generate or write labels.
- Read-only World Labs metadata, exact captured platform PNG and the Memory location card are live. The external Marble world is marked private. No location checking, reference injection or new world generation is claimed.
- Local exact `npm run dev` at3000 was verified (landing,24/4sample,210questions and exact study PNG bytes), then Main stopped its temporary servers. CI is green, MIT license added, package name `scripty`, only CODEX_TASKS moved to `docs/process/`. README/architecture/API/pitch/video docs are updated.

## Real results and cost

**Controlled six-pair A/B:** A canon-only0/6 and B canon+learned rule0/6targeted flagged shots;0/12ring/scar failed checks and0/24overall failed checks per arm, no uncertainty. Same scenes/reference/settings/fixed checker. **No additional measured reduction.** All12images and24settled receipts retained; human validation pending. Cost estimate **$0.710364**.

Original history stays **2/6,0/6,0/6,1/6** flagged. One ring rule reached **18later prompts and18checks**. Models/scenes/references/monitor requirements changed, so that curve is not causal evidence.

The public new-production UI loop saved two real images and a new scarf-knot rule, with1later prompt/1rule check. Both takes0/1flagged; no improvement claim. Additional estimate **$0.121538**; changed-Memory merge verification **$0.000404**, zero extra images. [Receipts](../docs/verification-ui-live-loop.json).

Founder-reported OpenAI baseline **$2.23**, credit balance **$32.29 at that checkpoint**. New post-baseline usage estimate **$0.832306** (total estimate **$3.062306**, not an invoice). App cap **$30**, Main tests **$12**, A/B **$3** inside testing. Old receipts survive reconciliation; stale holds release after30minutes, including before preflight. [Operations](../docs/operations.md).

Codex checkpoint at 5:09am PT: **36% weekly remaining**,5-hour figure unavailable, **0resets used**,2available. Check again only at a meaningful checkpoint.

## Exact two-minute sample path — rehearse on final release

1. **0:00–0:15:** Landing → **Watch it on Mara**. Wait for real images; stay on **Take1** and open **T1·S02**, the frontal portrait with the ring-hand finding.
2. **0:15–0:35:** Open **T1·S02** (or **Review2flagged**, which starts there) → **With reference**. Describe the ring-hand finding as model-reported; the founder should visually verify it before filming.
3. **0:35–1:00:** Edit **Your note** to “Keep the silver ring on Mara’s anatomical RIGHT hand.” → **Reject & remember**. Show the actual new/merged rule in **Memory update**; future-take scope is already saved. Do not select recheck/fix unless intentionally spending.
4. **1:00–1:20:** **Save to memory** → Studio. Point out the original ring rule's **18prompts/18checks**, separate from today's note; new visitor notes did not cause old images.
5. **1:20–1:45:** **Evidence**: original four-take history and the controlled0/6vs0/6result. Say memory transfer is demonstrated, extra visual improvement is not.
6. **1:45–2:00:** **Eval**:12study images queued first; human metrics stay blank pending judgments. Close on “Every correction carries forward.”

For a clean recording use a separate private/incognito session; existing shared IAB has retained QA notes. Enter the private code before capture if narrating live extraction. Without it a free sample correction is a literal saved creator note, not live AI extraction. [235-word narration](../docs/video-script.md). The existing IAB also owns **Night Train — workflow check**, with two real saved takes and the live learned-rule history; do not clear that browser's cookies.

## Access, limits and human actions

The private code is in project-root **`.env.local` → `SCRIPTY_ACCESS_CODE`**. Production: [Vercel → canon → Environment Variables → Production](https://vercel.com/archer-rag-dev/canon/settings/environment-variables). The value is deliberately absent from docs/screenshots. Live use also requires the existing enable switch.

Founder must provide actual blind judgments (save one and refresh to confirm persistence before the full set), record/upload the final two-minute video, arrange judge access to the private GitHub repo and submit by the earlier public 11:00am PDT cutoff unless an organizer confirms the 2:00pm PT extension. Agents supplied no human labels and made no external submission. Human submissions are not independent expert certification; undefined precision/recall denominators can remain blank even after20judgments.

The **three-take lifetime attempt limit** remains. Automatic approval review rejected Main's proposed hourly replacement as an expansion of persistent paid capacity; no such migration ran. Night Train has2of3attempts used, one remaining. Expanding that limit is an optional morning approval decision; Mara's four original takes remain available.

Advanced Studio/cast/script features, compare-takes control, accounts/cross-device recovery and general Undo are outside the current release. Reference generation has a backend endpoint; the new setup is upload-first. Do not advertise disabled controls as implemented.

## Remaining overnight

Verify the final bounded state-fix release, then run one bounded final public readiness check and finalize this file at 6:15am. No paid repetitions are planned without a concrete changed-flow need. A stronger future experiment using a novel correction absent from initial canon is proposed in `internal/IDEAS.md`; it is not a new measured result or submission blocker.

Optional location note: the captured still is publicly verified, but the linked Marble viewer reports permission denied in the verification browser. No permissions were changed. Design is marking that external world private/requiring permission; founder can share it later if desired. It does not block Mara or the learning loop.
