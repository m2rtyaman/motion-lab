# explainer-default

Measured, clean product demo explainer engine for Remotion & GSAP.

## Overview
Produces a clean 45–90 second product demo video on an airy canvas with authentic product UI interactions (typing, real tables, clicks, drawer transitions) and a crisp closing brand card.

- **Principles:** Never invent fake server stats or DevOps slop; showcase authentic UI components (`DataTable`, `SlideOverDrawer`, `AppShell`, `ModalDialog`).
- **Engine:** Remotion + GSAP (`useRemotionGSAP`) at 60 FPS deterministic playback.
- **Audio:** Measured CC0 sound effects via `SoundCuePlayer` normalized to -16 LUFS.

## Studio Commands
- New scene: `pnpm new <slug> --mode editorial-ui --aspect 16:9`
- Validate: `pnpm check --project <slug>`
- Render: `pnpm render --project <slug>`

## Requirements
- Node 18+, Remotion, GSAP.
- 100% API-key-free and local. Zero Playwright dependencies.
