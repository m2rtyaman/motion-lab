---
name: explainer-engaging
description: Make a 10–30 second continuous-shot explainer for any product, rendered with Remotion & GSAP to MP4 with sound. One hero element (TheHeroActor) travels through the product's workflow laid out as stations on one big canvas; the camera follows it, each station reacts as it passes, then the camera pulls out to reveal the whole journey. Use when someone wants an engaging, story-driven, one-take explainer or a loopable product animation.
---

> Optional reference. RULES.md wins on any conflict.

# Engaging One-Take Explainer (Remotion & GSAP Architecture)

A continuous-shot visual story built entirely in **Remotion & GSAP**. A single **hero element** (`TheHeroActor`) travels through a chain of interface "stations", with the camera following its path continuously without cutting.

## 1. Principles

1. **One Canvas, No Slide Cuts:** All interface stations are mounted on a single continuous spatial canvas (`SpotlightStage`, `VirtualCanvas`, or `FullBleedStage`). Slices and transitions are achieved via camera travel (`CameraRig`), scale expansion, or peak-velocity container morphing.
2. **Hero Continuity (`TheHeroActor`):** The hero element (a cursor, token, glowing badge, or data packet) stays physically mounted throughout the entire animation and morphs across stations.
3. **Reactive Stations:** Each station visibly responds as the hero passes: buttons press, toggle knobs slide, progress bars fill, lists sort, or cards expand.
4. **Climax Pull-Out:** The camera pulls out to reveal the full journey before settling on the hero conclusion and call to action.

## 2. Remotion & Studio Lifecycle

### Step 1: Initialize Project
```bash
pnpm new <slug> --mode editorial-ui --aspect 16:9 --duration 15
```

### Step 2: Define Spec & Direction
- `src/projects/<slug>/direction.md`: Document the single-sentence goal, the hero element form, and each station's reaction.
- `src/projects/<slug>/spec.json`: Define beat timings (1.0–1.5s per station), camera keyframes (`camera`), and SFX triggers (`sfx`).

### Step 3: Implement `Scene.tsx`
Use `useRemotionGSAP` for 60 FPS deterministic frame seeking:

```tsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { TheHeroActor } from '../../primitives/bridges/TheHeroActor';
import { CameraRig } from '../../primitives/CameraRig';

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    // 1. Station 1 interaction
    tl.to('#hero-actor', { x: 300, y: 150, duration: 1.2, ease: 'power2.out' }, 0);
    tl.to('#station-toggle', { backgroundColor: '#10B981', duration: 0.4 }, 0.8);

    // 2. Station 2 travel
    tl.to('#hero-actor', { x: 800, y: 350, duration: 1.5, ease: 'power3.inOut' }, 1.5);
    tl.to('#station-progress', { width: '100%', duration: 1.0 }, 2.0);

    // 3. Camera pull-out climax
    tl.to('.camera-rig', { scale: 0.65, x: 0, y: 0, duration: 2.0, ease: 'expo.out' }, 6.0);
  });

  return (
    <AbsoluteFill className="bg-neutral-950 text-white overflow-hidden">
      <CameraRig className="camera-rig w-full h-full">
        <TheHeroActor id="hero-actor" className="absolute z-30" />
        {/* Spatial Stations */}
        <div id="station-toggle" className="absolute left-[200px] top-[150px] ..." />
        <div id="station-progress" className="absolute left-[700px] top-[350px] ..." />
      </CameraRig>
    </AbsoluteFill>
  );
};
```

### Step 4: Quality Gate & Render
```bash
pnpm check --project <slug>
pnpm render --project <slug>
```
Output: `out/<slug>/<slug>.mp4`
