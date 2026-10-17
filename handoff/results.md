# Real experiment results — Scripty

Four genuine six-shot batches are complete and cached. These are operational monitor results, **not human-verified image improvement**. No failed, flat, or worse batch was removed.

| Batch | Generator / conditions | Flagged shots | Uncertain checks | Unavailable checks |
| --- | --- | --- | --- | --- |
| 1, rechecked v3 | GPT Image1.5 medium, original scenes, two seed rules | 2/6 (33.3%) | 4/36 | 0 |
| 2 | GPT Image2.5 Sunburst high, cinematic style, six new scenes, learned ring rule | 0/6 | 6/42 | 0 |
| 3 | Same final settings/checker, six different new scenes; generated through local browser | 0/6 | 8/42 | 0 |
| 4 | Same final settings/checker, six different new scenes; accepted portrait added; deployed Vercel run | 1/6 (16.7%) | 6/42 | 0 |

The final rate worsened from0/6 to1/6. Batch4's profile-side scar flag itself may reflect anatomical-side checker error; it needs human review. No further tuning followed the three-attempt time box.

## Frozen criteria and confounds

Reference: real generated raster, with the misplaced ring corrected **before** baseline. Its hash and four criteria are frozen in `experiments/protocol.json`: red wool scarf; scar over anatomicalLEFT eye; short black hair; silver ring on anatomicalRIGHT hand. The baseline was never deliberately weakened. Scene sets are recorded in `seed/experiment-scenes.json`.

Baseline-to-later comparison changes image model/quality/style and scene composition, while learned rules add monitor checks. Batch4 also adds an accepted image reference. This is not a controlled memory-only experiment. Operational flags, uncertainty, and draft evaluation do not establish reduced true drift, causal improvement, or calibrated confidence.

## Three calibration attempts, preserved honestly

1. Monitor v1 (GPT4.1mini) flagged6/6 baseline shots. Visual inspection found systematic anatomical-side false positives and invisible features treated as failures. Original response: `experiments/batch-01-response.json`.
2. Monitor v2 added orientation/uncertainty wording but still flagged6/6. Original recheck: `experiments/batch-01-recheck-v2.json`.
3. Monitor v3 uses GPT5.4mini, explicit canonical-reference IMAGE1 versus scored SHOT IMAGE2, and the same0.6 flag threshold/fixed criteria. A known close-up spot check, then five remaining baseline rechecks, returned2/6 flagged. V3 was frozen for batches2–4. Original predictions remain; the stored baseline is transparently the v3 recheck, not a claimed learning gain. See `calibration-v3-spotcheck.json` and `batch-01-recheck-v3.json`.

Two Sunburst high-quality samples were visually inspected before scaling: consistent Super35/35mm/f2.8 language, motivated lighting, restrained cinematic grade. All final batch contact sheets were visually inspected. Model/style upgrade improved the desired professional appearance by agent visual judgment, without a quantified quality claim or verified continuity guarantee. Quality samples are excluded from batch rates.

## Real learning-loop proof

- A real baseline close-up correction became rule `ca721c45-1e5d-412c-83ba-9a566443c44b`: “Mara always wears a silver ring on her RIGHT hand.” A repeated correction merged into that same ID, leaving three total rules. Fresh Supabase reads preserved the rejected shot and rule. Evidence: `experiments/review-01.json`, `review-01-dedupe.json`, `after-review-refresh.json`.
- That rule appears in **all18 later generation prompts** and **all18 later monitor outputs**, on18 different new scenes. Cache preserves IDs, original applied-rule traces, real images, and checks.
- Batch3 was triggered once through the local browser scene editor. Read-only polling showed durable partial progress; final batch contains6 images and no unavailable checks. Evidence: `experiments/batch-03-ui-response.json`.
- The inspected cafe portrait was accepted through the local browser; refresh preserved it. All6 batch4 generation traces record `accepted_reference=true`. Evidence: `experiments/accept-positive-reference.json`, `batch-04-deployed-response.json`, and cache traces.
- Preview live GET independently returned real state with the persisted rule; batch4 completed on the deployed server. Preview URL and status are recorded in `preview-persistence-check.json` and `batch-04-deployed-response.json`.

These review decisions are agent/engineer decisions, not human ground truth. A second agent found the original close-up ring laterality uncertain; the map shot is the clearer candidate wrong-hand failure. Keep both judgments visible and have a human verify before presenting either as ground truth.

## Ten-shot draft evaluation

`seed/labels.json` and `handoff/label-review.md` cover10 distinct real shots,40 fixed-criterion cells: **35 DRAFT agent booleans and5 uncertain/occluded cells excluded from boolean scoring**. Mapping records contained monitor outputs, so this is not a formally blinded study. No human `verifiedBy`/`verifiedAt` exists.

Default stored-check eval:0 verified labels, precision/recall/F1/accuracy **null**. Explicit draft-only exploratory eval scored35 cells: TP1,FP0,TN34,FN0 (precision/recall/F1100%). This tiny, selected, overwhelmingly pass-heavy agent sample is **not validated accuracy** and must not be used as a headline. No fresh paid rechecks were needed. Exact report: `experiments/eval-stored-final.json`.

## Budget and cache

**$20.58 reserved** against the persistent$24 cap; remaining reservation allowance$3.42. This is a pessimistic application ledger, not a provider billing receipt. Includes reference/correction, two quality samples,24 batch images, calibration/checking, and rule extraction. Paid generation is finished.

Cache:4 batches,24 genuine PNGs,52,921,564 image bytes; every SHA256/byte count verified. Read-only export made no new AI calls. All5 API route bundles trace the manifest and all24 images. Final summary: `experiments/final-summary.json`.

Local four-batch replay passed exact hashes, local review/accept refresh persistence, independent-session isolation, and actionable409 exhaustion. Independent reviewer passed real-cache1440px/390px layout and full-frame keyboard behavior on the earlier two-batch snapshot; root extends verification to final assets/release. Final public status is in `MORNING.md` and production replay report.
