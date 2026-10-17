# Backend decisions — October 17, 2026

- Founder reassigned UI to Design and backend/repo/docs/deploys to Main. Main does not modify Design-owned application pages, components, styles or public assets.
- Separate monitor rechecks from generation. Rechecks append evidence and make zero image requests; repairs create replacements only for flagged sources. Preserve originals and source lineage, including failed repairs.
- Use signed private paid-access sessions. The access code is generated privately in `.env.local` and scoped to Vercel Production; never copied into browser bundles, URLs, logs or this repository.
- Preserve the old reservation ledger and add a new usage-settlement ledger. The $2.05 baseline comes from the founder's dashboard report. $40 is the global cap; a separate $6 transactionally enforced verification ceiling limits Main's test run. Missing usage/failures retain conservative holds rather than assuming a refund.
- Settle from returned input/output tokens with the actual model rate; image/text input modalities differ. Do not display $0.75 preflight holds as per-image prices. Never claim usage estimates equal invoice receipts.
- Save blind labels append-only and freeze monitor predictions. Only owner-scoped human submissions feed public eval; uncertainty is excluded and absent denominators return null. Headline metrics require 20 judgments. Automated tests must never generate human truth.
- Keep exact note fallback when AI extraction fails. Live extraction deduplicates semantically; serialized SQL additionally deduplicates normalized equal rules from concurrent requests and preserves application counts.
- No Undo endpoint: reversing a merged rule safely requires versioned memory revisions. Disable or omit Undo rather than implying a navigation action erases persisted learning.
- Real verification: initial and later scenes passed monitoring, a learned scarf-knot constraint reached the later prompt/check, repeat extraction merged, recheck made zero images, and a flagged sample repair created a new image. The repair remained monitor-flagged. Professional cinematic appearance was visually inspected, but visual correction and human accuracy remain unverified.

- Human/model disagreements supply inspection-calibration context to later monitors. They do not overwrite canon, change the flag threshold or retroactively alter evaluated predictions. Unclear human judgments never become calibration facts.

- The new-production API accepts structured weighted canon and1–6 scenes, while legacy plain-text/six-scene callers remain supported. Structured side-sensitive canon requires explicit matching creator confirmation. A real zero-spend save/reload test preserved keys, expected values, weights and the character version.
