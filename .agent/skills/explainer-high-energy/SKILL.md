---
name: explainer-high-energy
description: Make a 12–20 second high-energy motion-graphics promo for any product, rendered with Remotion & GSAP to MP4. Fast beat-locked scene changes, kinetic typography, a shape that carries across every transition, a HUD frame. Use when someone wants a hype reel, teaser, launch sting or showreel-style promo for a product, app or brand.
---

# High-Energy Kinetic Reel & Teaser (Remotion & GSAP)

A fast-paced, high-velocity teaser promo engineered for 60 FPS deterministic render using **Remotion & GSAP**.

## 1. Principles

1. **Beat-Locked Rhythm:** Every transition lands on a musical downbeat or 120/140 BPM grid. Staccato punches (15–30 frames) give raw kinetic impact.
2. **Kinetic Typography:** Words punch onto the screen with masks, tracking expansion, and character offsets (`KineticText`, split lines, staggered reveals).
3. **Shape Carrier Transitions:** A geometric element, brand emblem, or graphic anchor carries momentum across each beat transition, morphing between scenes rather than using simple fades.
4. **Viewfinder & HUD Accents:** Precision borders, crosshairs, and corner ticks provide cinematic technical depth without degenerate DevOps slop.
5. **Impact Anticipation:** 150–300ms of stillness before maximum scale impact and shake.

## 2. Remotion Implementation

### Step 1: Scaffold
```bash
pnpm new <slug> --mode kinetic-poster --aspect 9:16 --duration 12
```

### Step 2: Spec & Timeline (`spec.json`)
Structure rapid 20–45 frame beats with camera shockwaves:
```json
{
  "mode": "kinetic-poster",
  "aspect": "9:16",
  "fps": 60,
  "durationInSeconds": 12,
  "beats": [
    { "id": "punch-1", "startFrame": 0, "endFrame": 45, "intent": "SPEED INTRO", "text": "INSTANT" },
    { "id": "punch-2", "startFrame": 46, "endFrame": 110, "intent": "PRODUCT BURST", "text": "INTELLIGENCE" }
  ]
}
```

### Step 3: Implement `Scene.tsx`
```tsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/deterministic';
import { KineticText } from '../../primitives/KineticText';

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  const containerRef = useRemotionGSAP((tl) => {
    // Beat 1: Slam zoom & scale punch
    tl.fromTo('.kinetic-title-1', { scale: 3.0, opacity: 0, filter: 'blur(12px)' }, { scale: 1.0, opacity: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power4.out' }, 0);
    // Beat 2: Mask wipe & typography exchange
    tl.to('.kinetic-title-1', { y: -80, opacity: 0, duration: 0.25, ease: 'power2.in' }, 0.7);
    tl.fromTo('.kinetic-title-2', { y: 80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: 'back.out(2.0)' }, 0.75);
    // Radial impact shake
    tl.fromTo('.viewport-frame', { scale: 1.05 }, { scale: 1.0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }, 0.75);
  });

  return (
    <AbsoluteFill ref={containerRef} className="bg-black text-white flex items-center justify-center overflow-hidden">
      <div className="viewport-frame relative w-full h-full flex flex-col items-center justify-center p-12">
        <h1 className="kinetic-title-1 font-black text-8xl tracking-tighter uppercase">INSTANT</h1>
        <h1 className="kinetic-title-2 font-black text-8xl tracking-tighter uppercase text-amber-400">SPEED</h1>
      </div>
    </AbsoluteFill>
  );
};
```

### Step 4: Quality Checks & Render
```bash
pnpm check --project <slug>
pnpm render --project <slug>
```
Output: `out/<slug>/<slug>.mp4`
