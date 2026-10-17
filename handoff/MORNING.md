# Scripty — morning handoff

```sh
cd ~/canon && npm run dev
```

Open http://localhost:3000. Public: **https://canon-woad.vercel.app/**. Latest founder-supplied submission deadline: **October17,2026,2:00pm PT**. Final overnight handoff: **6:15am PT**.

Updated3:40am PT. Interim checkpoint. Current verified public UI release: `241f899` on private `main`. All eight pages, the controlled A/B blind queue, Studio/Review refinements and the generated-take navigation fix are live. Main is finishing same-origin study-image resilience and stale-hold preflight cleanup; Design is refining Memory and remaining pages.

## What works

Mara loads its original24real images/four takes without paid calls. Studio→one-shot Review→editable rejection note→deduplicated Memory→return to the same take is implemented. Saved-production navigation, removable weighted canon chips, explicit anatomical confirmation, private reference uploads and signed live access are present. Live backend verification exercised generation→live rule extraction→merge→new-scene generation, monitor-only recheck and flagged-only repair. The repair remained flagged; no visual-success claim follows from the request succeeding.

The left/right suggestion fix is live: provisional sides stay out of stable keys/headings. A fresh public vision call returned neutral keys/headings; its anatomical guesses still required creator correction and explicit LEFT/RIGHT confirmation, which the live form preserved.

## Evidence

Original history stays **2/6,0/6,0/6,1/6** flagged; one learned ring rule reached18later prompts and18checks. These four takes are confounded and are not causal A/B evidence. Human checker accuracy is unverified. Controlled A/B: A0/6 and B0/6 targeted flagged shots,0/12 ring/scar failed checks each,0/24 overall failed checks each, no uncertainty. No additional reduction from the learned rule. Estimated cost$0.710364, all24attempts settled. Human validation is pending; the12images are first in blind Eval.

Founder-reported OpenAI baseline **$2.23**, credit balance **$32.29** at that checkpoint. App cap **$30**, Main tests **$12**, A/B **$3** inside testing. New usage settles from returned tokens; old receipts are retained and stale holds release after30minutes. These are estimates, not invoices.

## Two-minute sample path

Open public landing → Explore Mara → Studio Take1 → flagged shot → Review with reference → edit a relevant rejection note → Reject → Memory update → save/return → inspect learned rule and its original18/18reach → Evidence → briefly show blind Eval pending human labels. Use a clean independent recording session so old QA notes do not appear. No new paid generation is needed for that sample walkthrough. The final exact labels/path will be checked against the final UI release.

## Access and human actions

The private access code is in project-root `.env.local` under `SCRIPTY_ACCESS_CODE`; production settings are in Vercel canon → Environment Variables → Production. Its value is deliberately absent here. See [operations](../docs/operations.md).

Founder: supply real blind labels (the new12 A/B images will be first), record/upload a final two-minute video, arrange judge access to the private GitHub repo, and submit by2pm PT. Agents have supplied no human labels and made no external submission. [Live verification](../docs/verification-live.json) records its actual scope and costs.

## In progress

A/B blind queue verified on publiccb84f34:210cards, first48cover all12studyimages, conditions/predictions hidden, zero human labels. Public new-production UI loop also passed generation→editednote→live memory→regeneration, with1prompt/1checkreach and$0.121538estimated additional usage. The selected-take navigation defect is fixed in241f899; oldTake1 correctly offers GenerateTake3, and Take2 selection updates the URL. Remaining: same-origin study-image release and incremental Design refinements and a read-only card for the existing World Labs location. No new paid world generation or accounts/cross-device recovery is promised.
