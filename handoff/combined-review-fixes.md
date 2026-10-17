# Combined review fixes — October 17, 2026

User authorized intro/trace fixes, coordination with Main, combined testing, unchanged landing design, and no deployment. Main confirmed file ownership and navigation commit954b28c. This local integration combines a783863,2f23949,and954b28c. Pending v4 public-page designs are deliberately outside this baseline.

## Fixes

- Landing intro checks actual reduced-motion preference before starting, clears overlay state when skipping, and removes the global intro marker on cleanup. Preserved all existing landing markup/content, imagery, CSS, and2600ms normal intro timeout; Main's existing navigation href changes are included.
- Cached visitor traces say `Browser-saved sample correction` without asserting whether AI was used. Existing signed cookie/schema, rule IDs, timestamps and recorded traces are unchanged. Regression assertions cover refresh in free and authorized fallback paths without paid/network calls.
- Earlier fixes retain separation between visitor and historical sample rules, omit unsupported fifth-take sample actions, and remove three confirmed unused legacy implementations.
- Navigation keeps API/Evidence public and routes Open studio to Dashboard. Resolved the package.json merge conflict by keeping BOTH sample-review and navigation suites.

## Combined verification

- `npm test`:95pass,0fail,0skip.
- `npm run build`:pass, including TypeScript.
- `git diff --check`:pass.
- Landing CSS/assets unchanged; diff is lifecycle logic plus Main's already-reviewed navigation hrefs.
- Reproduced stuck reduced-motion intro against Main's pre-fix local preview3006. Final intro checks on3007 pass at1440x1000 and390x1000: fresh reduced-motion load, normal timeout and session replay, preference change during intro, pointer dismissal, wheel dismissal, and client navigation cleanup/return.12 lifecycle cases passed; no browser exceptions.
- Combined public/sample flow passes at1440 and390: public API/Evidence outside Studio shell, Open studio -> Dashboard,24 Mara shots, reject/save/learned/return/reload, same-note deduplication, acceptance/reload, neutral persisted trace, second-browser isolation, unchanged historical rules/IDs/prompts/checks/images/batches/rates, and no unavailable sample generation action. Zero page exceptions and HTTPresponses>=400; no Evidence horizontal overflow.
- Landing's existing mobile design hides non-Studio header links. Their hrefs were checked in DOM; the public API page was opened directly on mobile, then its visible public navigation was exercised. No mobile landing layout/navigation design was changed.
- Configured database used only for GET evidence queries; all visitor review writes are browser-cookie state. No paid calls, database mutations, labels, push or deployment.

## Evidence and reproduction

Machine-readable results: `docs/verification-combined-fixes.json`. Full local browser scripts/screenshots: `/private/tmp/scripty-combined-evidence/check-intro.cjs` and`check-demo.cjs`. Logs: `/private/tmp/scripty-combined-tests.log`,`/private/tmp/scripty-combined-build.log`. Scripts use bundled Playwright and installed Chrome against the local production build on3007; paid generation is disabled.

## Release limits

This is a tested recorded-sample/navigation baseline, not certification of paid live generation/extraction/repair/rechecking. Those paths were not exercised. Any later public-page/design integration requires another verification pass on its actual final source. Main retains release ownership; nothing has been pushed or deployed. Root checkout's unrelated documentation and design WIP was preserved.
