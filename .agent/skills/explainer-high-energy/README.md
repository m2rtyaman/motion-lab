# explainer-high-energy

High-energy motion graphics promo engine for Remotion & GSAP.

## Overview
Produces a 12–20 second high-energy hype promo or showreel sting featuring fast beat-locked scene changes, kinetic typography bursts, carrying transition shapes, and HUD viewfinder overlays.

- **Principles:** Beat punch, dramatic scale explosions, kinetic word splits, and carry-over shapes across scene cuts.
- **Engine:** Remotion + GSAP (`useRemotionGSAP`) at 60 FPS deterministic playback.
- **Audio:** Beat grid alignment with audio motion conductor and sonic impacts.

## Studio Commands
- New scene: `pnpm new <slug> --mode kinetic-poster --aspect 9:16`
- Validate: `pnpm check --project <slug>`
- Render: `pnpm render --project <slug>`

## Requirements
- Node 18+, Remotion, GSAP.
- 100% API-key-free and local. Zero Playwright dependencies.
