# Scripty — read-only judge panel

Reviewed October 16, 2026, 8:27 p.m. Pacific. These are four simulated judge perspectives, not actual judges’ opinions. Scores assess this checkpoint, not the eventual finished submission. No application code, experiment data, labels, or deployment protection was changed. The separately authorized public URL verification was added to MORNING.md.

## Observed build and scope

Production: https://canon-woad.vercel.app/ — opened in the same logged-out browser that encounters Vercel login on the old preview. Independent cookie-free request returned HTTP 200 without a login redirect. Production deployment listed READY, commit 82c2550469d30ed4b3f09a22102b419b7578a046 at inspection.

Actual desktop UI inspected: Scripty header and cinematic dark three-pane layout; Mara reference loads; character sheet is readable; empty filmstrip/inspector; generation and playback disabled with “Cache not installed”; 0 batches, 0 shots, 0 learned rules, 0 traces. The curve correctly says operational flags do not verify improvement. Mobile and keyboard review were not re-tested in this read-only audit. No generation/review POST requests were made.

Sources read: AGENTS.md, MORNING.md, handoff/results.md, docs/video-script.md, docs/devpost.md, and saved persistence records in the preceding check. Pitch scores evaluate the written script, not a delivered presentation.

Local evidence reports six real baseline shots; rejection-to-rule persistence and deduplication; six new scenes with the learned ring rule in all prompts and monitor outputs. Frozen v3 baseline flags 2/6 versus later batch 0/6, with 6 uncertain checks among 42 later checks. Model/quality/style changed between batches, so that comparison does not establish a memory-only causal improvement. Labels remain unverified by a human. The public build does not yet expose these records as a usable demonstration.

## Scores against requested criteria

| Simulated judge perspective | Functionality /10 | Continual Learning /10 | Pitch /10 | Rationale |
|---|---:|---:|---:|---|
| Ex-OpenAI ChatGPT lead / AI evals | 3 | 5 | 7 | Real persistent prompt memory and new-scene application are documented, and caveats are unusually explicit. Public demo cannot exercise the loop; confounded generation settings and absent human labels prevent a verified improvement claim. |
| Apple/Luma/Pika designer | 4 | 5 | 8 | Cinematic hierarchy, restrained palette, real reference and workspace structure feel purposeful. Empty panels and disabled primary action prevent assessing the real creative workflow; large inspectable before/after detail is essential. Brand metaphor is clear. |
| VC/professor | 3 | 4 | 6 | Recurring-character production is a specific buyer hypothesis and seats/usage is plausible as a proposal. No customer, pricing, saved review time or cost-per-approved-shot evidence establishes willingness to pay or a credible billion-dollar outcome yet. |
| Lemma CEO / silent failures | 3 | 5 | 7 | Successful generation can conceal wrong-hand continuity failure; rule persistence and traces are sensible. Checker anatomical-side errors and uncertain visibility show why monitor reliability needs separate validation. Prevention is not automatic repair, and the public trace drawer is empty. |

Scale: 1 = absent/unusable, 5 = partial credible proof, 8 = convincing integrated demo, 10 = exceptional evidence and execution. These are provisional checkpoint judgments; missing public evidence caps Functionality.

## Five highest-impact fixes, ranked

1. **Ship real cache to the public production domain and rehearse it logged out.** Acceptance: a first-time visitor sees/loads actual recorded shots and can inspect baseline, correction, memory, later scene and traces. Assets resolve; there is no Vercel login, disabled playback or missing cache. Label recorded playback. MORNING.md should retain the stable production URL at the top. This is the largest immediate Functionality gap for every judge.
2. **Separate observed output changes from causal learning claims.** Acceptance: display 2/6 versus 0/6 only with sample counts, monitor version, uncertainty and changed model/style settings. Say this is an observed, confounded comparison, not a measured memory-only gain. If time/budget allow a controlled comparison, keep generator, quality, checker and scene difficulty matched and vary only memory. Do not delay a working demo merely to chase a downward chart. Human validation remains required.
3. **Make the learning event auditable on screen.** Acceptance: one visible wrong-hand detail -> actual correction -> persisted/deduplicated rule ID -> different scene’s final prompt and monitor rule check -> actual resulting image. Show live versus recorded state, timestamps and model versions. Do not imply a browser-local cached review retroactively changed a historical generation.
4. **Make uncertain findings distinct from failures and distinguish prevention from repair.** Acceptance: occluded/unavailable checks remain visibly uncertain, excluded from false success claims; anatomy reasoning is inspectable and human-overridable. Say the MVP applies feedback to future generations; do not promise it repairs an existing image unless that operation is actually demonstrated. Use a large inspector so judges can see the claimed defect themselves.
5. **Anchor the pitch in one buyer and an economically testable outcome.** Acceptance: retain the two-minute script and opening before/after, then identify recurring-character production teams and propose measuring reviewer minutes and generation spend per approved shot. Explain project memory portability as the differentiation hypothesis. Label pricing, market scale and defensibility as unvalidated; no invented savings, customers or $1B certainty.

## Handoff

Send this checkpoint review and the five fixes to Set up the canon project. The current accessible-build review is complete; improvements can be judged in a subsequent user-requested review.
