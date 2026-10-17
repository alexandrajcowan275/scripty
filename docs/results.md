# Measurements

## Controlled prompt-memory A/B

**Controlled A/B:0/6 targeted-attribute flagged shots with canon only,0/6 with canon + learned memory.** The fixed checker found0/12 ring/scar failures and0/24 overall failures in each arm, with no uncertain checks. Adding the learned ring rule produced no additional reduction in this six-pair test; canon-only generation already passed the rubric. These are monitor judgments, pending human blind validation. The run cost an estimated **$0.710364** from returned usage.

| Measure | A: canon only | B: canon + learned rule |
| --- | --- | --- |
| Generated shots | 6 | 6 |
| Ring/scar flagged shots | 0/6 | 0/6 |
| Ring/scar failed checks | 0/12 | 0/12 |
| All flagged shots | 0/6 | 0/6 |
| All failed checks | 0/24 | 0/24 |
| Uncertain checks | 0/24 | 0/24 |

Protocol: six paired scene prompts deliberately show both hands and both eye regions. Both conditions use the same reference SHA256, image model `gpt-image-2.5-sunburst-2026-09-08`, high quality,1536×1024, no accepted-shot reference, and monitor `gpt-5.4-mini-2026-03-17` / `canon-monitor-v3`. Within-pair generation order alternates A/B and B/A. B adds the real historical ring correction; A omits learned rules. Canon already contains the ring constraint in both arms. Both are scored against the same four canon attributes, confidence threshold0.6, no learned-rule checks and no calibration context.

Interpretation: no extra measured reduction from repeating that constraint. This is a small stochastic comparison with a baseline floor, not evidence that memory is universally ineffective or that anatomy is verified. The model exposes no fixed image seed here. No tuning or rerolling discarded a less favorable pair. The original12PNGs, full prompts, checks, settings, reference hash and per-request usage receipts are saved in [the experiment](../seed/experiments/ab-test/result.json). The runner requires explicit paid opt-in and refuses to overwrite an existing experiment.

All12shots are first in Mara's blind-eval queue; ring and scar questions come first within each shot. Conditions, confidence and model verdicts are absent from the question payload. Only actual human submissions count. No agent has supplied human ground truth; precision/recall/F1 remain unverified.

## Original production history

| Take | Flagged shots | Uncertain checks |
| --- | --- | --- |
| 1, final checker | 2/6 | 4/36 |
| 2 | 0/6 | 6/42 |
| 3 | 0/6 | 8/42 |
| 4 | 1/6 | 6/42 |

One learned ring rule reached18later prompts and18monitor outputs. This verifies memory transfer. The takes changed generation models/settings, scenes, references and monitor requirements, so the series does not isolate visual improvement. The final rate rose and remains preserved. Earlier monitor versions flagged6/6 before disclosed calibration. Some side judgments may be false alarms.

## Functional verification

The live backend check exercised real generation, editable rejection, extraction, semantic merge, later-scene rule injection, monitor-only recheck and flagged-only repair. Additional estimated cost at that checkpoint:$0.204639. The replacement remained flagged: successful request/persistence is not proof of successful correction. [Receipt](verification-live.json).

## Costs

A/B returned-usage estimate:$0.710364 across12images and12monitor calls; all settled. Founder-reported historical baseline:$2.23. These are distinct from a provider invoice; see [operations](operations.md) for reconciliation and caps. No extra paid world generation was performed for the location card.

A second public-UI verification created a private-reference production, corrected/confirmed anatomical canon, generated one shot, submitted an edited rejection, saved the actual learned-rule sheet, and generated a second shot. The rule reached1later prompt and1rule check; both takes had0/1flags. Additional usage estimate:$0.121538. It exposed a selected-take navigation defect forwarded to Design; that UI issue did not lose the new image or memory. [Public-UI receipt](verification-ui-live-loop.json).
