# Architecture & Design System — Motion Lab

## 1. The Core Determinist Engine (`useRemotionGSAP`)

Traditional web animations rely on requestAnimationFrame and real-time clock loops (`Date.now()`, `performance.now()`), which introduces jitter, dropped frames, and non-reproducible rendering in video export.

Motion Lab bridges Remotion's offline frame server with GSAP:

```typescript
const frame = useCurrentFrame();
const { fps } = useVideoConfig();

useRemotionGSAP(() => {
  const tl = gsap.timeline({ paused: true });
  // Build declarative motion timeline...
  tl.seek(frame / fps);
}, [frame, fps]);
```

- **Zero Frame Drifts:** Every pixel at frame $N$ is mathematically identical regardless of CPU rendering load.
- **Pure GPU Composition:** Animations tween only `transform` (`x`, `y`, `scale`, `rotation`), `opacity`, and `filter`. Layout properties (`width`, `height`, `top`, `left`, `margin`) are forbidden during animation.

---

## 2. Paradigms & Composition Rules

### 1. `editorial-ui`
- **Use Cases:** B2B SaaS launch videos, fintech analytics, developer tool demos.
- **Visuals:** Dark specular glass (`rgba(255, 255, 255, 0.04)`), 1px subtle borders (`rgba(255, 255, 255, 0.08)`), SVG charts, interactive maps, slide-over panels.
- **Camera:** 3D SpatialCamera subtle drift (`rotateX: 12`, `rotateY: -16`, `scale: 1.05`).

### 2. `cinematic-world`
- **Use Cases:** 2.5D game arenas, character actions, narrative shorts.
- **Visuals:** Sprite sheets, torch lighting layers, dynamic ground shadows, particle embers, and radial sonic shockwaves.
- **Animation Principles:** Squash & stretch, braking anticipation, step-arc bobbing, and footstep dust.

### 3. `kinetic-poster`
- **Use Cases:** Brand manifestos, high-impact social teasers, typographic drops.
- **Visuals:** High-contrast typography, split-screen wipes, rhythmic beat-locked cuts, tabular monospaced counters.

---

## 3. The Single Container Principle (Tek Kap İlkesi)

In modern motion design, scene cuts cause cognitive friction. Instead of destroying scene A and creating scene B, Motion Lab promotes continuous morphing:

```
[ Action Button ]
       ↓ (expands & morphs border-radius)
[ Audio Waveform Pulse ]
       ↓ (unfolds into text card)
[ Transcribed Note & AI Task ]
       ↓ (snaps into table grid)
[ Calendar Slot ]
       ↓ (collapses into confirmation badge)
[ Success Checkmark ]
```

The viewer's eye remains locked onto the hero container throughout the entire commercial.
