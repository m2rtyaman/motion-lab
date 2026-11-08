# explainer-engaging

Continuous-shot explainer video engine for Remotion & GSAP.

## Overview
Turns a product workflow into an engaging, single-take visual story where a single continuous hero element (`TheHeroActor`) travels through UI stations without slide cuts.

- **Workflow:** One continuous living container (`SpotlightStage`, `VirtualCanvas`, `FullBleedStage`).
- **Hero Continuity:** `TheHeroActor` carries velocity across every beat.
- **Engine:** Remotion + GSAP (`useRemotionGSAP`) at 60 FPS deterministic playback.
- **Audio:** Beat-locked sound effects via `SoundCuePlayer` or asset harvester narration.

## Studio Commands
- New scene: `pnpm new <slug> --mode editorial-ui --aspect 16:9`
- Validate: `pnpm check --project <slug>`
- Render: `pnpm render --project <slug>`

## Requirements
- Node 18+, Remotion, GSAP.
- 100% API-key-free and local. Zero Playwright dependencies.
