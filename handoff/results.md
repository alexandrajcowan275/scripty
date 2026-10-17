# Real experiment results — in progress

## Setup / protocol

Actual OpenAI credential authenticated200 and is synced to Vercel production+preview. Real reference generated, then its misplaced ring corrected BEFORE baseline. Reference hash and fixed criteria are frozen in `experiments/protocol.json`. Four documented scene sets are in `seed/experiment-scenes.json`; later scenes differ while the four canonical attributes stay fixed. No baseline constraint was weakened.

## Baseline, original monitor v1

- Six real image requests and six real monitor calls completed, no fallbacks.
- Batch1 originally flagged **6/6 (100%)**. Preserve this diagnostic result in `experiments/batch-01-response.json`.
- Reserved upper bound for batch1: **$3.18**; reference generation+correction reserved$1.00. Reservations are not provider billing receipts.
- Agent visual inspection found a genuine silver-ring placement failure in scene2, but also systematic monitor confusion between image-side and anatomical-side scars. Scene5 invisibility was incorrectly treated as a rule failure. These are checker defects, not output improvement.
- Root is calibrating explicit orientation/uncertainty wording without relaxing the fixed criteria or0.6 threshold. Original checks remain in the experiment record. Any recheck will be labeled and recorded separately. Later batches must use the same frozen calibrated checker.

## Review / memory proof

Root is inspecting and rejecting the visibly misplaced ring, saving one testable rule through the real LLM+Supabase path, then verifying refresh and duplicate correction merging. Exact responses are in `experiments/review-01*.json`. These are agent/engineer-style visual review decisions, not human-verified ground truth.

## Interpretation

No verified improvement or monitor-accuracy claim exists yet. Human labels must use the fixed four criteria and disclose uncertain/occluded evidence. Agent labels remain draft until human verification. Changing scene composition and monitor calibration are confounds and must stay visible in the final report.

## Remaining work

Freeze checkerv2, recheck baseline transparently, generate different scenes with the saved rule, inspect actual failures, produce3–4 complete real batches, capture hashes/provenance, create10-shot draft-label worksheet, evaluate drafts separately, and verify public cached deployment.
