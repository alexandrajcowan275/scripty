# Scripty — designer research, October 16, 2026

Scope: a short live-browser pass, begun approximately 8:58 p.m. PT, capped at 30 minutes. Founder priorities: Runway for workspace, Natural for landing and learning moments. This is the consolidated designer report for Main; app implementation and its side-by-side comparisons belong to Main.

These are observed public pages and guest interfaces, not claims about every authenticated state. No generations, paid actions, account creation or private projects were used. Screenshots preserve actual websites; their assets/logos must not be used in Scripty. Font names and RGB values below are read from rendered DOM styles; other palette descriptions are visual observations. Motion descriptions are observed behaviors, not measured animation timings.

## Screenshot inventory

Files are in `handoff/screenshots/research/`. Measurements were taken from live rendered DOM at the research browser's approximately 1280 × 720 viewport; font sizes are responsive and must not be treated as universal brand tokens.

| Reference | Public website | Product evidence | Access limit |
| --- | --- | --- | --- |
| Runway | `runway-web.png` | `runway-app.png`, `runway-tool.png` | Real guest UI; no private project |
| Luma | `luma-web.png`, `luma-dream-machine.png` | `luma-app.png` | Signup gate with official product animation; not a usable signed-in canvas |
| Pika | `pika-web.png` | `pika-video-studio.png` | Real guest Video Studio controls; generation requires signup |
| Krea | `krea-home.png` | `krea-image-tool.png` | Real guest image workspace; no generation |
| Higgsfield | `higgsfield-home.png` | `higgsfield-cinema-clean.png` | Real guest Cinema Studio; cookie/promo overlays dismissed |
| LTX Studio | `ltx-web.png` | `ltx-workflow-preview.png`, `ltx-storyboard-preview.png` | Official embedded product previews, not an operated editor |
| Frame.io | `frameio-web.png` | Product mockup visible in hero | Main lead extending product research |
| Linear | `linear-web.png` | Embedded interactive product demonstration | Main lead extending product research |
| Natural | `natural-web.png` | `natural-product-story.png` | Public marketing interaction; no payment app interaction |

## Runway — primary workspace reference

Sources: [website](https://runway.com/), [guest app](https://app.runwayml.com/).

The current site and guest app rendered **light** in this session. The founder's near-black direction is an explicit Scripty choice, not a measured current Runway token. Website: white surround, one enormous rounded cinematic hero, simple nav, medium-weight confident sans headline and one obvious CTA. Guest home: quiet left sidebar, a large central creation prompt, generous empty space, rounded settings chips, restrained blue-violet for action. Tool mode: left navigation, a focused configuration column, and a broad visual/output area; settings are grouped by task rather than dispersed across many panels. Images carry the strongest color and detail. A promo/maintenance strip exists, but should not become a Scripty design precedent.

Measured website family: `abcNormal`; first inspected H1 approximately 38.2/43.9 px, regular; a section heading approximately 53/58.2 px, regular. Website primary CTA is off-white `#F7F7F7`, 8 px radius; nav dark CTA `#262626`, 6 px radius. App uses `Normal, Inter, system-ui`; inspected title 32/36 px, weight 600; action blue `#2C22FA`, white cards, approximately 6–12 px control radii. Transparent body styles are not a dark-canvas measurement: the visible guest app is light.

Copy addresses creation directly. Buttons have short verbs; most UI text is supporting rather than promotional. Preview video moves while surrounding controls remain calm. Premium comes from generous working space, consistent alignment, large visual content and a clearly prioritized creation surface, not from the current theme color alone. Borrow those principles, not Runway's layout or branding.

## Luma Dream Machine / current Luma

Sources: [current product page](https://lumalabs.ai/app), [Dream Machine transition](https://app.lumalabs.ai/dream-machine).

- **Palette:** current public page white/black; Dream Machine transition and signup use black, graphite, white and gray. Do not describe all of Luma as one dark theme.
- **Typography:** current product page uses Graphik (rendered internal family `__graphik_7126cf`); H1 measured 52 px, weight 500. Headlines feel confident without extreme boldness.
- **Media:** large output examples and boards establish creative possibility. Transition page splits an animated board illustration from a simple black copy/CTA area. Signup has a huge rounded animated product preview; it is product evidence, not proof of authenticated editor access.
- **Density/layout:** extremely spacious public hero, only one major CTA. Product preview shows a board-based canvas with small status labels, thumbnails and contextual work in progress.
- **Copy/buttons:** short imperative/value phrases, rounded black/white pill actions. There are long FAQs farther down; do not import that density into Scripty's first view.
- **Motion:** official board animation shows creation events and evolving assets. Precise easing/timing was not measured.
- **Premium lesson:** demonstrate the process visually, let images and state changes explain the capability, keep the surrounding frame quiet.

## Pika

Sources: [website](https://pika.art/), [guest Video Studio](https://create.pika.art/apps/video-studio).

- **Palette:** enormous photographic hero with white type and a translucent dark nav. Video Studio mixes a white tool panel with a dark `#111111` output/content area.
- **Typography:** Telka UI; Telka Extended on big headings. Guest studio H1 measured about 63 px, weight 700; secondary heading 40 px. Wide display type makes a strong identity.
- **Media:** rounded full-width video/photography dominates marketing. Guest studio has a large example video beside the configuration panel, rather than shrinking everything to dashboard thumbnails.
- **Density:** more controls than the website, but consolidated in one left tool panel. Narrow icon navigation; a single unmistakable generation action.
- **Copy/buttons:** expressive, creative, direct. Extended uppercase display headings; white/black pill CTAs; tool controls measured around 12 px radius. A longer explanation is below the media, not above the primary experience.
- **Motion:** large preview and community videos; playback/motion controls are exposed. Timing not measured.
- **Premium lesson:** strong display type can coexist with quiet functional UI. Scripty should use this separation, not copy the typeface or split-pane layout.

## Krea

Sources: [home](https://www.krea.ai/), [guest image workspace](https://www.krea.ai/image).

- **Palette:** image workspace body measured `#101010`, near-white text, black rail, slightly raised graphite composer. Color largely comes from the work.
- **Typography:** Suisse Intl, calm neutral sans. Most control buttons inspected have a 10 px radius. Display hierarchy is strong but the workspace does not need a large marketing headline.
- **Media:** multiple large rounded image examples fill the canvas; image rows are not enclosed in additional boxed dashboard modules. Composer floats at the bottom with compact settings inside it.
- **Density:** sidebar is fairly busy, yet main workspace remains image-first. Top has a small model selector; task controls group near the prompt. Home can be promotion-heavy; it is not the right Scripty density target.
- **Copy/buttons:** concise tool names and creation verbs, little explanatory prose within the working canvas. Soft pill/chip controls; neutral primary treatment.
- **Motion:** home carousel and large media change; no animation timings verified.
- **Premium lesson:** a real image canvas plus one coherent command surface is more convincing than many labeled empty surfaces.

## Higgsfield

Sources: [home](https://higgsfield.ai/), [Cinema Studio](https://higgsfield.ai/generate).

- **Palette:** studio body measured `#131416`, text `#F7F7F8`; bright yellow-green is the action accent. Main public site is much more promotional and denser.
- **Typography:** Inter UI, Space Grotesk headline; studio H1 measured 40 px, weight 700. Inspected controls use 12 px radii.
- **Media:** film-poster thumbnails in the center, preview cards and visual tool icons. Cinematic choices live in a wide rounded composer with references, camera, palette and lighting chips.
- **Density:** visual studio has breathing room around a single composer; this is the useful reference. The public homepage has too many promos, labels and offers for Scripty's goal.
- **Copy/buttons:** energetic filmmaker language, short labels, highly visible Generate. Accent is effective because it clearly identifies the action, but Scripty should not adopt neon or the offer banners.
- **Motion:** auto-changing film-preview carousel; cookie and promo overlays had to be dismissed to inspect the tool. Timing not measured.
- **Premium lesson:** consolidate related choices and protect a strong working focal point. Do not confuse loud sales UI with craft.

## LTX Studio

Source: [Studio page](https://ltx.io/studio), redirected from ltx.studio.

- **Palette:** website body measured `#0B0B0B`, white type, subtle blue/violet in announcement/promotional elements. Product previews show dark slate editor surfaces and large shot imagery.
- **Typography:** Brownllsub body; Miriamlibre display. H1 measured 51.2 px, regular; a large section heading 115.2 px. Tall, distinctive lettering brings editorial personality without decorating every control.
- **Media:** large cinematic cards with tiny captions; public previews show storyboard, elements and timeline. Storyboard references maintain context between frames.
- **Density:** spacious web sections; much denser product demo where production tools are needed. This distinction matters: a landing page need not look like a tool inspector.
- **Copy/buttons:** filmmakers, creative control and production vocabulary. Short uppercase headings and direct light CTA blocks with restrained corners.
- **Motion:** section previews autoplay/cycle across workflow tabs; screenshots caught changing preview content. No frame-timing claims.
- **Premium lesson:** a distinctive editorial headline plus genuine workflow footage conveys professional credibility. Scripty can use continuity-specific vocabulary rather than copying LTX's typography.

## Frame.io and Linear — supporting references

Sources: [Frame.io](https://frame.io/), [Linear](https://linear.app/).

Frame.io's public hero uses violet/indigo atmosphere, oversized clean white type, white pill actions and a very large product/player preview. The visible product mockup combines a narrow navigation rail, asset thumbnails and a large selected asset. Rendered headings inspected use FrameGothic, 48/48.96 px at weight 600; primary CTA has 100 px radius. Body font fallback reported Times, which is not the actual display/UI typography and should not be copied. Copy is professional, delivery/review oriented and more explanatory than the desired Scripty hero. Product media brings movement; precise motion timings were not measured. It feels premium because the creative object and review context stay connected. Scripty should borrow image-linked annotation and review clarity; avoid importing a full asset-manager information architecture. Only the public embedded product mockup was inspected here; no authenticated project was operated.

Linear's measured public body uses `#08090A`, text `#F7F8F8`, Inter Variable with system fallbacks. Hero H1 is 64/64 px, weight 510; next inspected section 40/44 px at 510. Signup uses a pale neutral `#E5E5E6` pill; many nav items have pill hit targets without visible filled boxes. Muted gray supporting type and quiet actions preserve focus. There is substantial space before a large interactive dark product demo. The demo contains dense issue metadata but keeps rows and labels compact; the marketing section does not expose all of it at once. Copy is precise and product-specific. The embedded demo presents in-progress activity without turning the whole page into a moving background; timing not measured. Premium comes from disciplined contrast, repeatable spacing, crisp typography and a clear focal point. Scripty should borrow precision, not its issue-tracker density. This was a public interactive demo, not a signed-in private workspace.

## Natural — primary landing and learning reference

Source: [Natural](https://www.natural.com/).

Measured body: white `#FFFFFF`, warm black `#161514`, family **STK Miso**. H1 at 1280 px viewport measured 40/56 px, weight 360; section headings 32/40 px, weight 400. This reference is not literally a huge bold dark hero: its confidence comes from whitespace, composition and characterful type. The founder's desired bold cinematic expression is our adaptation.

Nav is sparse and quiet. One small announcement, a tiny grainy visual, then an editorial text statement across a wide baseline. Text changes emphasis from dark to pale gray. Scrolling reveals an enormous soft monochrome/grain image, making texture part of the story rather than an all-over noisy UI effect. Pill primary, simple text secondary. The grain is visible in the captured media; it is not proof the whole page uses a paper texture layer. The scroll-sized visual expansion feels deliberate. Do not copy the small square identity, page layout, wording or source media.

For Scripty: use original restrained grain on the landing background only, huge short confident type, a hero image that retains its cinematic fidelity, and compact real state moments. The workspace image must remain clean enough to inspect tiny continuity errors. Learning feedback is a small completed event, not a simulation of activity.

## Shared language and Scripty's distinction

The shared pattern is **creative surface first, command surface second, technical detail on demand**. Theme varies. Large visual examples, few visible decisions, soft rounded geometry, short task labels, strong typographic hierarchy and coherent control clusters recur. The most premium parts use restraint; the noisiest promotions should not be imitated.

Scripty should belong beside these tools through: near-black image-first workspace; real cinematic frames at useful scale; one quiet primary; no permanent triple-dashboard; no paragraph on every shot; subtle transitions. It stays distinct through the script-supervisor metaphor, region-linked drift evidence, a gold learned rule, and film-set voice. Its hero is the exact relationship between a continuity slip and remembered correction.

## Direction to implement

1. Landing: near-black editorial canvas with extremely subtle original grain; 80/88 desktop headline **Your AI script supervisor.**, one supporting line **Every correction carries forward.**, one **Open demo project** button. Large cinematic Mara image. No metric wall, decorative badges or explanation paragraph.
2. Workspace: 64 px quiet header, 64 px icon rail if needed, 40 px content inset. One batch at a time; six large film frames in a horizontal strip or quiet two-row gallery. Select a shot into a spacious review canvas. Memory is a contextual panel/drawer rather than a permanent boxed column consuming the first view. Keep a small Memory entry visible.
3. Review: fitted 16:9/actual-aspect image occupies about 65–75% of content width, compact 320 px decision area. On-image drift marker, **Continuity slip**, one-line expected/observed difference, reason + primary **Reject & remember**, secondary **Accept**. Detailed checks and trace behind **Evidence**.
4. Learning: **Rule learned.** and the real gold chip; 180–220 ms opacity/8 px movement, then settle. A comparative learning view can retain full real four-batch counts in an evidence expansion while showing one accurate concise summary by default.
5. Voice: **Scripty caught a continuity slip.** / **Noted. On the next take.** / **Rule learned.** Avoid promising perfect future output. **Checked 1s ago** only follows a genuine current check, never replay of an old check. Use **Recorded check** for historic data. No fake pulsing live indicator.

Figma After revision is currently blocked by Starter MCP call quota. No workaround, purchase or claim of updated canvas. Main build lead owns real app changes; design agent owns the research/spec. See revised design spec for exact geometry and acceptance checks.
