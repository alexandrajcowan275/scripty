# Design source provenance

The founder supplied [Claude's design handoff](../design/claude/DESIGN_HANDOFF.md), HTML screens, a runnable prototype, logos, cover and compressed copies of real Mara images. Those original files are retained under `design/claude/`; none were removed during repository cleanup.

The HTML/prototype is a visual and interaction target, with illustrative counts, costs and evaluation numbers. It is not the application backend or an experimental result. The shipped React pages use shared UI primitives/tokens and real API data; absent values stay absent. [Measured results](results.md) and [live verification](verification-ui-live-loop.json) describe the actual evidence.

Main owns the backend, data, docs and releases; Design owns pages, components, styles and public assets. Design compares1440px/390px screenshots with the supplied sources and sends tested page commits for Main integration. Original artifacts are preserved so judges can inspect the design-to-product work.


## Final frozen release

The final application is5e0bb6d, integrating six Design commits through413c750 with the cinematic Claude landing. [Dark tokens](../design/dark/dark-tokens.css), [workspace styles](../styles/dark-app.css), and [landing source](../components/landing-claude/landing.tsx) describe what is shipped. Earlier prototypes remain historical references. The final [Studio screenshot](images/scripty-studio-dark.png) uses actual public Mara data; no source evidence was edited.
