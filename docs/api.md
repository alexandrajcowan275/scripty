# Scripty API

Base URL: `https://getscripty.vercel.app`. Responses use JSON; private evidence is `Cache-Control: no-store`. Errors return `{error}` with 400 validation, 401 missing access code, 404 owner-scoped not found, 409 unsupported operation, 429 capacity, or 503 provider/storage unavailable.

## Access

Set `SCRIPTY_ACCESS_CODE` in `~/canon/.env.local` for local development and [Vercel Production environment variables](https://vercel.com/archer-rag-dev/canon/settings/environment-variables) for production. Set `CANON_PUBLIC_GENERATION_ENABLED=true` and redeploy. Neither variable is public client configuration.

`POST /api/access` body `{code:string}` returns `{authorized:true}` and a signed HttpOnly cookie. Access attempts are throttled. `GET /api/access` returns `{authorized,configured}`. Browser requests send the cookie automatically. API clients may use `Authorization: Bearer YOUR_ACCESS_CODE`; ownership cookies are still required for private productions.

## Production and reference

- `POST /api/productions/reference/upload`: multipart `reference` file. Returns `{ticket,imageUrl}`; ticket is signed, owner-bound and expires in an hour.
- `POST /api/production/canon`: `{referenceTicket,characterName?}`. Paid vision call returns `{attributes:[{key,label,expected,weight,laterality,confidence}],requiresLateralityConfirmation:true,suggestedOnly:true,usage,provenance:"live_vision"}`. Laterality is left/right/unclear/none. No fabricated bounding boxes. User must confirm or change side-sensitive suggestions before using them as canon.
- `POST /api/productions`: multipart `production` JSON `{name,characterName,attributes:(string|{key,label,expected,weight})[],scenePrompts:string[1..6],description?}` plus `referenceTicket` or an uploaded `reference`. Structured side-sensitive attributes require `lateralityConfirmations:{attributeKey:"left"|"right"}`. Expected wording must agree with the confirmed side; stable keys, labels and manual weights (0.1–5) are retained. Returns `{project}` with status 201; owner cookie binds subsequent access.
- `GET /api/productions`: `{productions:[{project_id,created_at,projects:{name}}]}`, newest owned productions, at most 12.
- `PATCH /api/productions/:id`: existing scene-list or immutable character-version editing contract.
- `GET /api/productions/sample`: opens Mara's complete original four-take history and establishes the sample-review session.

## Generate, review and memory

`POST /api/batch`:

```json
{"projectId":"YOUR_PRODUCTION_ID","scenePrompts":["A portrait beside a train window."]}
```

Live requests accept 1–6 scenes. Omitting scenes uses the saved production list. Response: `{batch,shots,mode,provenance,imageProvenance,usage,configuration,warning?}`. Inspect provenance and warnings; a fallback is not successful new generation. Mara's ordinary free take navigation returns its existing original takes.

`POST /api/shot/:id/review`:

```json
{"projectId":"YOUR_PRODUCTION_ID","decision":"reject","reason":"Keep the red wool scarf tied in one loose knot."}
```

Returns `{shot,newRule?,merged?,provenance,usage?,warning?}`. `decision:"accept"` needs no reason. With paid access, rejection extracts one constraint and semantically deduplicates existing memory. Without paid access, a literal correction is stored and identified as such. Sample notes remain browser-local. There is no general Undo endpoint: navigation must not pretend it reverses persisted learning.

`POST /api/project/:id/recheck` body `{shotIds?:string[],ruleIds?:string[]}`. Up to 24 selected existing shots. All active memory remains enforced; supplied rule IDs are validated. Returns `{results:[{shotId,id,checks,flagged,driftScore,rulesApplied,provenance}|{shotId,error}],usage,imageRequests:0,completed,failed,originalHistoryUnchanged:true}`. Results append monitor runs; original rates/checks stay intact.

`POST /api/project/:id/fix` body `{shotIds?:string[]}`. Up to six selected **currently flagged** shots, or all flagged sources if omitted. Explicit unflagged IDs return 409. Returns `{batch?,shots,repaired,usage,originalHistoryUnchanged:true,warning?}`. Each successful repair has a new shot ID and `sourceShotId` lineage. Partial failures preserve the source image. A new image is rechecked; repair is not guaranteed to improve it.

`GET /api/project/:id` preserves `{project,rules,batches,shots,traces}` and adds `generationEnabled`, separate `monitorRuns` (latest first) and `repairs`. For Mara, `repairShots` holds this owner's newly generated replacements; the original 24 shots and four counts remain unchanged. UI can use the newest matching run for a current verdict while labeling original historical evidence honestly.

## Blind human labels and evaluation

`GET /api/project/:id/labels` returns `{questions,labels}`. A question has `{shotId,attributeKey,expected,imageUrl,referenceImageUrl}` and **no monitor verdict**.

`POST /api/project/:id/labels`:

```json
{"shotId":"SHOT_ID","attributeKey":"scarf_color","pass":true,"note":"Visible red scarf."}
```

`pass:true` means the expected attribute is met; false means visible drift; null means unclear. A new submission is appended and the then-current prediction frozen. Changing a judgment preserves the previous submission. Labels are scoped to this browser's production/session. Automated tests must never insert invented human truth.

`POST /api/eval` body `{projectId}` returns precision, recall, f1, accuracy, `confusionMatrix:{truePositives,falsePositives,trueNegatives,falseNegatives}`, evaluated/eligible counts, `humanLabels`, `uncertainHumanLabels`, `metricsReady`, rows and a small-sample caveat. Positive class is drift. Undefined denominators are null. Human unclear labels are excluded; seed drafts are never included. Headline metrics should stay “—” until at least 20 scored human judgments. This route makes no AI calls. Use the explicit recheck route when requesting new monitor inference.

## Models, budget and receipts

`GET /api/config` returns real `imageModel`, `imageQuality`, `monitorModel`, `monitorVersion`, access status and `observedImageCostUsd` (null until measured). `reservationPerShotUsd` is a conservative preflight hold, **not** a per-image price. Authorized requests also receive `{budget:{baselineUsd,usageEstimatedUsd,heldUsd,limitUsd,remainingUsd,reservedUsd}}`. Usage estimates are based on returned tokens; actual provider billing may differ.

Current controls: $30 global cap, $2.23 founder-reported baseline, a separate $12 operator verification ceiling, per-owner/IP hourly throttles, and per-production generation lease/attempt cap. Never retry an ambiguous paid call merely because a UI timed out; refresh the saved production first.

`GET /api/project/:id/locations` returns reviewed location metadata. Mara has one existing World Labs capture and a real private Marble link (`marbleAccess:"permission_required"`); owned productions currently return an empty array. The captured PNG is available through `GET /api/locations/mara-platform/image`; the external viewer requires permission. This read-only route performs no generation or location continuity checking.

Mara's blind question list now starts with the12controlled A/B shots (48canon questions), before the original history. Ring/scar checks come first within each study shot. Question payloads contain no condition, prediction, confidence or drift flag. Submitted labels for those study shot IDs are saved normally and included in free human-only evaluation; production take counts remain unchanged.

`GET /api/eval?projectId=mara` is the read-only equivalent of `POST /api/eval {projectId}`. It uses the same owner-scoped human labels and frozen predictions, sets no-store, and never runs a model or writes labels. GET accepts only `projectId`; recheck/draft options are rejected. POST remains compatible.
