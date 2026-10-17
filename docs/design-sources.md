# Design source provenance

The founder supplied [Claude's design handoff](../design/claude/DESIGN_HANDOFF.md), HTML screens, a runnable prototype, logos, cover and compressed copies of real Mara images. Those original files are retained under `design/claude/`; none were removed during repository cleanup.

The HTML/prototype is a visual and interaction target, with illustrative counts, costs and evaluation numbers. It is not the application backend or an experimental result. The shipped React pages use shared UI primitives/tokens and real API data; absent values stay absent. [Measured results](results.md) and [live verification](verification-ui-live-loop.json) describe the actual evidence.

Main owns the backend, data, docs and releases; Design owns pages, components, styles and public assets. Design compares1440px/390px screenshots with the supplied sources and sends tested page commits for Main integration. Original artifacts are preserved so judges can inspect the design-to-product work.
