# Learning-loop verification budget — awaiting founder spending approval

No paid requests, cap changes or generation enablement are authorized by this plan. Current ledger: $20.58 reserved, $24 cap, $3.42 remaining. These are application reservations, not confirmed provider charges.

Use an existing uploaded reference, not a newly generated reference. A complete functional check needs initial generation and monitor → creator rejection → rule save → fresh generation and monitor → verify saved rule ID/text in the later prompt/check. This proves the path, not causal image improvement.

| App reservation | One attempt | Including one retry |
| --- | ---: | ---: |
| One generated image | $0.75 | $1.50 |
| One monitor | $0.05 | $0.10 |
| One rule extraction | $0.01 | $0.02 |

## Smallest verification option

One newly generated shot, one rejection/rule and one regenerated/new shot: 2 × ($1.50 + $0.10) + $0.02 = **$3.22** maximum app reservation. **$0 additional budget above the current cap**; uses up to$3.22 of the existing$3.42 remainder. A one-shot generation mode is NOT implemented yet: the current route requires six scenes and a$9.60 preflight. Adding a bounded one-shot mode would be a separate implementation step before any paid test. Public generation remains off. First-attempt-only reservation would be$1.61, but retry-inclusive$3.22 is the useful approval bound. Neither guarantees provider success.

## Existing six-shot workflow

Two six-shot takes and one rule: 12 × ($1.50 + $0.10) + $0.02 = **$19.22** retry-inclusive headroom. Additional headroom above the existing$3.42: **$15.80**. This would increase the total app cap from$24 to$39.80 and exceed the earlier$25 constraint; it needs explicit founder approval and a reviewed migration, not simply an environment switch.

First-attempt-only reservation is$9.61 ($6.19 above the remaining allowance), but this does not satisfy the unchanged retry/preflight policy or guarantee completion. Under the existing$9.60-per-batch preflight, even two all-first-attempt batches need$14.41 initial headroom to admit the second batch, because the guard reserves for retries. Do not present$6.19 as sufficient for the unchanged implementation.

Official OpenAI pricing is token-based and varies with image/text inputs and outputs. The figures above come from current source reservation constants and retry loops, not a fixed-price quote. Sources checked: https://developers.openai.com/api/docs/models/gpt-image-2.5-sunburst and https://developers.openai.com/api/docs/models/gpt-5.4-mini. No account billing receipt was queried.
