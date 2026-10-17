# Real experiment results

## Status

No real image experiment has run yet. OpenAI key is pending. No learning, accuracy, precision, recall, or F1 result is claimed.

## Protocol

- Six shots per batch; preserve the same scene prompt set across at least three measured batches.
- Character sheet and real raster reference stay fixed; record accepted extra references and every learned rule.
- Review visible failures with explicit reasons. Record that these are engineer/creator-style decisions, not independent human ground truth.
- Keep actual model checks, confidence, prompt, rules, provider, request IDs, fallback/error traces, and timestamps.
- `driftRate = flagged / total`; show uncertain/failed monitoring separately so an API failure cannot look like an improvement.
- Cache actual resulting images and metadata. Do not rearrange batch order to improve the curve.
- Draft 10 shot labels from visible evidence, mark all as needs human verification, and report draft eval separately.

## Budget

API spending limit: strictly below$25. The implementation will reserve pessimistic costs in a persistent server-only ledger before model calls; reservations are an upper bound, not a receipt. Reconcile actual returned token/image usage where available. No model calls made by subagents.

## Attempts / tuning

None yet. Append actual attempts and their measured outcomes here, including flat or worsening rates.
