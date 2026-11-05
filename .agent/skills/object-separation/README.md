# object-separation

Deterministic, lightweight object and product separation for Remotion 60 FPS motion graphics without external PyTorch or SAM model dependencies.

## Overview
Isolates foreground subjects (products, mobile devices, UI components, characters) from the background in Remotion using:
1. **Alpha Channel & Cutout Assets:** Transparent PNG/WebP or SVG assets stored in `public/assets/` or fetched via `pnpm harvest`.
2. **SVG & CSS Clip-Paths:** Procedural masks, geometric wipe angles, and Bezier paths.
3. **Layered 3D DOM Separation:** `<LayeredStage3D>` and `<LayerPlane z={...}>` to sandwich typography and effects between background and foreground actors.

## Usage in Remotion
```tsx
import { AbsoluteFill } from 'remotion';

export const ProductHero = () => (
  <AbsoluteFill>
    {/* Layer 1: Background & Radial Glow */}
    <div className="absolute inset-0 bg-neutral-950" />

    {/* Layer 2: Typography behind subject */}
    <div className="absolute inset-0 flex items-center justify-center z-10">
      <span className="text-8xl font-black text-white/20">VELOCE</span>
    </div>

    {/* Layer 3: Isolated Foreground Subject */}
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
      <img src="/assets/product-cutout.png" className="w-[600px] h-auto drop-shadow-2xl" />
    </div>
  </AbsoluteFill>
);
```

## Requirements
- 100% API-key-free and local.
- Zero external GPU / 1GB PyTorch models required.
- Remotion & GSAP 60 FPS deterministic execution.
