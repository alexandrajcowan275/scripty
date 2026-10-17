# Public navigation fix — local, not deployed

- Isolated checkout: `/private/tmp/scripty-final-release`, branch `codex/public-navigation`, based on published `935e7d4`. The separate `a783863` local bug-fix commit is excluded.
- Running production-build preview: http://localhost:3006/ ; API http://localhost:3006/developers ; Evidence http://localhost:3006/evidence . Only Open studio enters `/dashboard`; explicit sample links enter Mara.
- Landing changes are href-only. Its source CSS, copy, structure, images and animation are untouched.
- Public pages live in `components/public-site/`, `app/developers/page.tsx` and `app/evidence/page.tsx`. Claude can replace their presentation without restoring the app shell. Keep `lib/navigation.ts`'s public/studio boundary.
- Existing `/p/:id/evidence` and all production work remain inside Studio. No API, database, seed, original image or label changes.
- `npm test`:94 pass; `npm run build`:pass; `git diff --check`:pass.
- Local browser 1440x1000 and390x844: all3landingStudiohrefs/dashboard, API+Evidencepublic,24originalframes, preserved dashboard/productionEvidence shell, Product/#how, nooverflow/pageerrors/mutatingrequests. Proof `/private/tmp/scripty-navigation-verification/results.json` and screenshots.
- Existing landing accessibility issue observed while testing reduced motion: on a fresh session, the intro effect can start with the hook's initial false value, then reduced-motion detection cancels its timeout without clearing intro state. The opening title can remain over the page. This is unchanged by the navigation patch; report to the landing owner before release. Normal-motion behavior has not been rechecked in this pass; do not claim the reduced-motion opening passes.
- No push/deployment: founder's newer instruction in `Explain Codex code review` says “Don't deploy yet.” Production remains at the prior frozen app release until explicitly approved.
