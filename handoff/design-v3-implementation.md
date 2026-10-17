# Scripty — light v3 implementation handoff

This replaces the v1/v2 layouts. Main owns all application code, tests and release. The designer changed Figma and handoff documents only. The founder’s latest brief takes precedence over the dark three-pane layout in AGENTS.md.

**File:** https://www.figma.com/design/M6a6owg9izgReM2ejauaos

Verified destination: ajcowan's team → Team folder, Education Full seat.

- `After / Light v3`, page `17:5`: final screens; original editable text, vectors, auto-layout and component instances.
- `Design System / Light v3`, page `17:4`: semantic variables, type, components and interaction contract.
- `Before`, page `24:65`: the earlier regular localhost screenshot, uncropped. This is a reference image, not an editable capture.
- Old designs remain in the archive pages. Retained source-image uploads are assets, not proposed interface panels.

## Implementation order

1. **P0 — replace the layout, not just its colors.** Remove the persistent Memory rail, inspector, chart, trace panels, step bar, badges and explanatory cards. Implement separate Batch → Review → Learned views. Keep working backend contracts, recorded images and storage.
2. **P0 — shared system and real content.** Apply the tokens/grid/type below; reuse the 24 existing Mara images. Counts, flags, rule content and review queues derive from actual state. Keep full-frame evidence and source-coordinate annotations.
3. **P0 — both entry paths.** Landing has Start a new production and the quieter Mara sample. New production is a sequence of single-question screens. The default paid-capacity branch saves the production and offers Mara; it does not launch a paid call.
4. **P0 — persistence and truth.** Success follows a successful save. A saved local review never changes historical cached results. Do not show a ring rule after rejecting a scar; render the returned rule, including merges. Existing history remains 2/6, 0/6, 0/6, 1/6.
5. **P1 — Memory drawer, separate Progress and exact-take comparison.** Add keyboard/focus behavior and states together, not later. Preserve the inspectable underlying evidence through Progress, outside the review decision.
6. **P1 — mobile, motion, favicon and titles.** Match the 390px frames and the motion contract. Verify public desktop/mobile screenshots side by side with the Figma screens before release.

## The product model

There are three jobs: find shots that need attention, decide on one shot, see that a correction was remembered. Batch, Review and Learned each serve one job. Memory and Progress are optional destinations. No route contains the old three-pane dashboard.

One filled black pill is the primary action. Secondary actions are quiet text buttons with real hit targets. No persistent timestamps, confidence badges, numbered steps, technical traces, tabs, category counters or additional summaries in the main flow. Body copy stays under roughly twelve words, excluding user-entered content, rule text and image-review evidence. Rationale and evidence documents are exempt.

## Shared geometry and tokens

| Foundation | Exact contract |
|---|---|
| Desktop | 1440px reference width; centered max-width 1296; 72px outer margins; 12 columns; 24px gutters. Columns are 86px. Span 4=416, 6=636, 8=856, 10=1076. Grid-derived widths need not be multiples of eight. |
| Vertical rhythm | 8px base. Use 8/16/24/32/40/48/64/72/80/96. Standard header 80px. Standard content starts 72px below the header. |
| Mobile | 390px reference width; 24px margins; inner width342; two 163px image columns with a16px gutter. Stack every other content group. At narrower widths, allow normal document scrolling. |
| Canvas/card/image | `#F5F3EE` / `#FFFFFF` / `#E8E5DF`. No gradients, panel outlines or decorative textures. Warm canvas supplies the editorial quality; real images supply the texture. |
| Text/secondary | `#171714` / `#615E58`. Contrast against canvas:16.20:1 /5.83:1. |
| Meaning | Drift `#B4232C`; monitor pass `#147A42`; memory ink `#8A5D00`, memory fill `#FFF0C2`. Red is exclusively shot drift, gold exclusively memory. Ordinary validation uses near-black copy. |
| Focus | `#2858B8`, a functional accessibility outline, never a decorative accent. Contrast against canvas5.96:1. |
| Type | Inter Regular400 and Medium500. Headline56/64, tracking−3px; Section24/32; Body16/24; Action16/24 Medium. No other UI sizes or weights. Mobile titles use24/32. Geist Mono16/24 Regular only for an actual frame number when exposed on focus; no mono dates, navigation, counters or charts. |
| Radius | Soft16px for cards/images/inputs; fully rounded999px for pill actions. This is one soft-corner family plus the explicitly required pill shape. |
| Shadow | One Lift: x0,y8,blur32,spread0, rgba(23,20,15,.08). Use only when Memory overlays the canvas. Images, buttons and ordinary cards have none. |
| Buttons | Height56; horizontal inset24; type16/24 Medium. Default near-black/white, hover approximately`#32322F`; disabled35% opacity and actual disabled semantics. Visible blue focus; no positional hover jump. Secondary transparent with near-black text. Minimum interactive hit target48×48. |
| Images | White-free gray image bed; consistent crop in Batch, full source aspect ratio in Review. Never mirror an image or infer anatomical side from screen-left alone. |

Figma variable collection `VariableCollectionId:17:6`. Reusable components: Button set`18:19` (primary`18:6`, secondary`18:9`, hover`18:12`, focus`18:15`, disabled`18:18`); dots`18:24`; Rule`18:27`; Image`18:30`; Input specimens`24:20`,`24:23`,`24:26`; original favicon`24:64`. Foundations`18:31`; state contract`24:4`.

## Screen-by-screen

Figma node links use the same file key above with `?node-id=19-17`, for example.

### 01 Landing — node19:4, 1440×1080

Job: choose a first production. Brand-only80px header. Hero has72px insets, two636px columns and24px gutter. Words are vertically centered against a636×640px Mara portrait; its photo is the existing genuine cafe shot. No borrowed reference assets.

Headline56/64: **Your AI script supervisor.** Subtitle24/32: **Catch drift. Keep your character.** Primary304×56: **Start a new production**. Secondary432×56: **Explore a sample production: Mara**. Related groups use24px gaps. Sample entry identifies the recorded project; direct links must retain sample provenance in the document title/Memory or Progress context.

Start opens02 Setup name; sample opens the actual selected cached take, with all four takes available in Progress. Do not put an additional dashboard between the landing and the shots.

### 02 Batch — node19:17, 1440×1080

Job: identify which shots need attention. Header contains scripty, Memory and Progress only. Content margin72, headline56/64 **1 of 6 shots drifted.** This exact frame shows actual Take4, whose fifth image is flagged.

Grid:1296×584, three416×280 images per row, two rows,24px column/row gaps. No text below shots. The8px dot sits24px from the image's right and bottom edges (center is20px from each). Hollow red versus solid green with a white halo; announce the result on the whole image button. Review it is208×56,32px after the grid. Retain the quiet empty area below.

Review it opens the first unresolved flagged shot. A shot itself is a full-card hit target and can be inspected. Review counters/queue state remain separate from original monitor metrics; accepting a recorded flag does not rewrite its recorded classification. After resolving the queue, the primary can advance to the next recorded take. At the last take, show the real exhausted/capacity state.

### 03 Review / scar — node19:54, 1440×1080

Job: one human decision. No navigation chrome or attribute panel. Center a1076×640px image bed,182px from each side,72px from the top. Full image uses contain; letterbox areas remain neutral gray. Image→sentence gap32; sentence→buttons gap32.

Sentence24/32, centered: **Scar seems on her right. Canon says left.** Primary288×56 **Reject & remember**; secondary224×56 **Looks right**;24px gap, group centered. This is a checker claim awaiting human judgment, not a verified defect.

Scar ellipse in the1076×640 image bed: x550,y120,w96,h80. This maps to the eye in the full image, not to its thumbnail crop. Use normalized coordinates within the rendered source image so the marker survives resize/contain letterboxing. Drift stroke2px; do not paint the area red.

Reject uses the reviewed canonical attribute as the proposed reason, saves it through the existing review route, then displays the exact returned rule. Looks right saves acceptance and advances/returns to the queue. No success moment before persistence. Escape returns without a decision; restore the originating shot's focus. R/A hints appear on keyboard focus only and are suppressed while editing text.

### 04 Review / original ring — node19:64, 1440×1080

Same geometry and actions. Genuine Take1 close-up. Sentence **Ring seems on her left. Canon says right.** Ellipse x672,y548,w96,h80 in the1076×640 bed; it surrounds the silver band, not the knuckles. This correction really produced the stored ring rule, but its anatomical interpretation remains unverified. Do not market it as human ground truth.

### 05 Learned — node19:74, 1440×960

Job: confirm what was remembered. Centered group; top begins224px. Headline1076×64,56/64: **Noted. On the next take.** Then48px gap; gold Rule640×104; then48px gap; primary256×56 **Back to shots**.

Shown historical example: **Silver ring stays on the RIGHT hand.** Actual live content must come from the saved rule response. A repeated rule is merged, not duplicated. This copy promises reuse and does not guarantee perfect future images. In cached mode this action returns to shots; never imply the visitor's new note changed historical cached generation. A future live generation can use it when capacity is enabled.

### 06 Comparison — node19:80, 1440×1040

Job: inspect a later take. Quiet header,72px content inset,56/64 headline **Same character. New scene.** Two636×432 images with24px gutter. Labels16/24 below: **Take 1** and **Take 3**.32px groups; one Back to shots action224×56.

These are the actual original close-up and later cafe image. This is a historical comparison, not an edited original, immediate next batch or proof the ring moved correctly. For live results, substitute the actual previous/new take IDs and images. Keep crop treatment equal. The short wipe reveals the new image; it is not an image-repair animation.

### 07 Memory — node19:99, 440×960 drawer

Job: recall character and saved rules without occupying the workspace. Right slide-out, white,32px side padding,48px top padding. Memory title56/64; close48×48 aligned at right. Learned gold card first376×144 with24px inset and24/32 text;32px gaps. Character reference120×144 alongside name24/32 and the compact defining details16/24. For owned productions only, Edit character is240×56 below. The Mara sample omits that action entirely; see the amendment below.

Overlay uses the single Lift shadow. Escape and close dismiss, focus is trapped while modal and restored on close; clicking the backdrop dismisses without changing data. At390 use full width with24px insets; all long rule/name content wraps and the drawer scrolls. Empty memory uses one quiet sentence, no empty gold card: **Nothing noted yet.**

### 08 Progress — node19:111, 1440×960

Job: inspect actual history. Header,72px content inset,56/64 title **Shots flagged, take by take.** Four equal216px chart columns,64px gaps; chart container1296×320. Baseline alignment shared. Actual red bars represent2/6 (192px),0/6,0/6,1/6 (96px). Zero has no pretend bar. Values24/32, take labels16/24. One nearby line: **Models, scenes and checks changed. Human verification pending.** Back to shots224×56.

Chart values are the frozen-v3 operational monitor counts, not accuracy, true drift or human-reviewed outcomes. Keep detailed provenance available here through an evidence disclosure, not in Review: models/quality/style/scenes changed; the last batch added an accepted reference; uncertain checks4/36,6/42,8/42,6/42; no verified labels. Preserve final worsening. No33%→0% hero, no100% accuracy claim. The persisted ring rule appears in18 later prompts/checks; that is the demonstrated memory transfer. Evidence content can be longer than primary-screen body copy.

### 09–13 New production — nodes20:26,20:35,20:49,20:58,20:78

Each frame1440×960. Brand-only80px header; centered content with72px top inset. One56/64 question;40px section gaps. Inputs white, radius16, inset16,16/24 type. Do not render a numbered step bar. Preserve values across Back/Escape and errors.

1. **What's this production called?** One636×64 input (example Night Shift), Continue240×56. Required validation: **Add a production name.** Use a real persistent label accessible to assistive technology; placeholder alone is insufficient.
2. **Add your character.**636px column:64px name input;24px gap;636×216 neutral upload bed, **Drop a reference, or choose a file.**;24px gap; quiet **Or describe them**. Continue remains disabled until a valid reference is saved. The compact identity group is384px high; no unexplained blank space before Continue.
3. Optional **Picture your character.**856×240 description input, Generate reference288×56. With paid generation off, preserve the description and route to the saved/capacity branch or offer the existing upload alternative; never trigger a paid request or pretend a reference exists.
4. **What must stay the same?**856px group, two columns of416×64 editable canonical-detail chips,24px gaps. Add a detail856×64 below; Continue. These are actual user data, not additional analysis labels. Close/remove controls have48px hit targets and accessible names. Data deletion remains subject to Main's existing authorization policy; no delete calls were made by design.
5. **What happens in this take?** Short helper **Write one scene per line.**856×264 scene field with real sample scene content; one Generate button. Validate the existing backend requirement for six scenes inline and preserve every line. When paid capacity is off, save first, then show node23:60 rather than calling generation.

### 14–19 State screens

| Node | State | Exact behavior |
|---|---|---|
|20:88|Empty/first use|**Your first take starts here.** One short line, Add scenes240×56. No blank dashboard modules.|
|20:96|Loading/checking|Same Batch geometry; six416×280 neutral skeletons, no spinner or invented percentage/time. Keep completed images during partial work and announce checking once.|
|20:113|Generation failed|**That take didn't land.** **Your production is safe. Try again.** One Try again primary, quiet Mara alternative. Only claim the production is safe after durable save; otherwise preserve local input and report saving failed.|
|20:123|Zero flags|Actual Take3 images. **0 of 6 shots drifted.** Green dots, Review next take. Not a verified perfect batch; original monitor evidence stays intact.|
|20:160|All flags|**6 of 6 shots need review.** All red dots, Review them. Figma uses real original v1 calibration results as a state specimen ONLY. Never insert this preserved6/6 calibration into the final four-take v3 chart or present it as a learning baseline.|
|20:197|Long name|856×96 field example: The Unreasonably Long Last Night at the Railway Station. Wrap input content where appropriate, never force horizontal page overflow. Full name remains accessible if later truncated in a utility.|
|23:60|Saved/capacity paused|**Your production is saved.** **New takes are paused. Mara is ready.** One432×56 Explore a sample production: Mara. Render only after save; keep private reference and entered scenes; no invented reset time. Also handles exhausted cached replay with contextual saved wording.|

### 20–21 Mobile — nodes20:206,20:244, 390×960

Batch:80px header,24px insets; brand24/32 and Memory/Progress16/24. Title24/32. Grid342×368: two163×112 images, three rows,16px gutters both axes. Exactly the same real Take4 images/flag as desktop. One342×56 Review it button,32px after the grid. No overflowing nested rows.

Review:24px side inset.342×400 neutral bed contains the full image; no crop that conceals the claimed eye. Eye marker x199,y271,w32,h28 in the mobile content container at this reference size. Derive the actual placement from source coordinates, not hardcoded device pixels. The bed begins y144 in this static960px view.32px gap;24/32 sentence in64px, left aligned. Reject & remember342×56;32px gap; Looks right342×56. Allow vertical scrolling and shorter top space on short viewports so actions remain reachable with browser chrome/keyboard.

Landing stacks words then image at mobile;24px margins,24/32 headline, full-width primary and secondary. Forms use342px-wide fields and buttons. Progress scrolls as ordinary content or uses four equal compact columns; keep all four actual values visible. Memory becomes a full-width sheet. Do not shrink type or controls below the system to fit.

## Motion and interaction states

Native Figma keyframes are present; timings are seconds in the API, milliseconds below. Motion endpoints are documented in frame24:201. The UI screenshots show resting states, not video playback verification.

- Drift draw:200ms ease-out; open vector path trim0→1; image stationary. Desktop paths24:177/24:181 and mobile24:185. Implement equivalent SVG stroke-dashoffset in app coordinates.
- Saved rule:180ms ease-out, translateY8→0 and opacity0→1 on Learned rule19:76 and Memory rule19:107. No bounce, glow loop or confetti. Only animate after successful save.
- New take:220ms ease-out clip reveal. Native cover24:219 rests outside the clipped comparison column; relative translation−636→0. The static comparison remains fully visible. In app, reveal the new image with clip-path/mask rather than scaling/stretching it.
- Drawer:200ms ease-out; return focus on close. Page changes can use150ms opacity; no elaborate stagger.
- Reduced motion: show the final state immediately; retain announcements and focus. Hover/focus changes150ms maximum; avoid motion on repeated rerenders.

State contract board24:4 covers default/hover/focus/disabled input and buttons, loading, success, save/upload failure, partial generation, capacity, empty Memory, keyboard and titles. Save failure copy: **Couldn't save that note. Try again.** Upload failure: **That image didn't load. Choose another.** These are ordinary errors, not red drift indicators. Retain shot/reason/form values and provide one retry action. Block duplicate submits while pending; restore on failure. Use semantic labels, focus outlines, tab order and live-region status; color dots are supplemented by hollow/solid shape and screen-reader status.

## Evidence, decisions and acceptance

Design decisions one-page frame23:68 explains every visible group and the system. Critique log23:113 records three rounds with both first-time-user and Apple/Luma/Pika judge lenses and five addressed priorities per round. Twenty-one initial screen/state frames were screenshot-reviewed in each round; the capacity branch was added in the final round after Main confirmed the real paid gate. Final targeted screenshots checked changed geometry and native-animation resting states. These are simulated critiques, not actual judges' opinions or a user study.

Research comparison board24:223 places captured Runway/Natural screenshots beside scaled, still-editable Scripty frames. Their logos/layout/assets are not reused in Scripty. Reference research and captures are in design-research.md and screenshots/research. Devpost cover23:127 is1200×675. Original typographic s favicon24:64; use32px PNG/SVG exports and a real document title per route: Scripty — Productions; Mara — Shots; Mara — Review; Mara — Progress. Custom productions substitute the real production name. Cached sample provenance belongs in the title/context and Progress, not a permanent warning panel.

Main acceptance: compare actual1440/390 screenshots with the named Figma nodes; run existing build/backend checks and browser review/save/reload tests. Verify no extra persistent panels, no body paragraphs, no hidden action below an unscrollable viewport, no source-coordinate marker drift, no fake paid generation, no local-review/history conflation, and no color-only or pointer-only controls. Figma is the layout source of truth; screenshots/spec document it, and backend records remain the data source of truth.

No app source, database records, paid generation, commits or deployment were changed by the designer. The only blocked optional operation was cleanup of ten imported Figma source-image nodes: automatic approval review rejected deletion, so all assets were retained. This does not block implementation.


## Memory edit amendment — sample versus owned production

Sample drawer19:99 is read-only for character/reference/canon and has no Edit character action, disabled substitute or explanatory label. Existing review notes can persist without changing the recorded sample character or historical results. No browser-local canon fork or implicit production copy. New production remains the explicit landing action. Owned drawer variant28:72 retains Edit character.

For owned productions, reuse character form20:35 with heading **Your character.**, current name and current reference. The existing reference bed displays the current image with an accessible Change reference image hit target. Continue opens prefilled canon form20:58; its primary reads **Save changes**. No production-name/scenes controls are introduced by this character action. Save is enabled only when dirty and valid. Pending **Saving…** blocks duplicate submission. Success returns to Memory with updated character, without a toast or gold learning moment. Escape/back returns to Memory and keeps an unsaved edit draft for this session. No PATCH before Save. Failure copy: **Couldn't save those changes. Try again.** Retain the draft and focus the retry action.

Only future generation/checks use the edited character. Existing images, recorded checks/expected values, reference assets used by history, traces and original counts remain intact. Historical Review uses its stored expected/observed values. No paid call, recheck, source-asset deletion or recalculation follows an edit. The sample and owned drawer variants were screenshot-checked after this amendment.
