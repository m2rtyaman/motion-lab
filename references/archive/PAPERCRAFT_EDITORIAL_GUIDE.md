> Optional reference. RULES.md wins on any conflict.

# PAPERCRAFT EDITORIAL GUIDE: 10-Beat Motion & Edition Blueprint

A comprehensive motion design grammar and architectural system for tactile papercraft editorial videos, physical 2.5D paper layering, jagged tear bursts, and metronome-paced educational / SaaS storytelling.

---

## 1. System Philosophy & Core Rule

> **Guiding principle:**  
> **"Copy the reference as a motion/edition blueprint, not as a content blueprint."**

- **Motion & Edition Blueprint (What we adopt):** The 10-beat storyboard rhythm, the 14 named motion techniques, the tactile physical paper aesthetics, the overshoot physics, the radial object scatter vectors, the harmonic metronome pendulum oscillations, and the soft foreground occlusion wipes.
- **Content Blueprint (What we NEVER copy):** Do NOT copy verbatim reference brand assets, copyrighted illustration artwork, or third-party trademark texts. All copy, UI cards, and brand badges must adapt natively to the user's brief.

---

## 2. Color Tokens & Substrate Materiality (`PAPERCRAFT_PALETTE`)

The papercraft aesthetic is grounded in warm, organic, tactile materials—distancing the viewer from sterile digital neon slop:

| Token Name | Hex Value | Semantic Role in Scene |
|---|---|---|
| `warmCream` | `#FBF9F5` | Primary warm paper substrate canvas |
| `softPeach` | `#FCEADE` | Secondary tactile paper sheet & tear layer A |
| `terracotta` | `#E86D48` | Primary focal accent, active tracker dots, hero highlights |
| `sageMint` | `#C4DBCF` | Secondary calm editorial accent, completed badge states |
| `pastelYellow` | `#F9E7A2` | Tertiary sticker accent, sunny highlight tags |
| `warmCharcoal` | `#2D282A` | Deep ink typography, contact shadows, metronome needle |
| `softWhite` | `#FFFFFF` | Elevated physical 2.5D cards (`PaperCard`) |

---

## 3. The 10-Beat Master Sequence

The definitive 10-beat editorial timeline engineered for 12–18s vertical (9:16) or horizontal (16:9) motion videos at 60 FPS:

```
[01 Landing] ──> [02 Pop-up] ──> [03 Type Build] ──> [04 Tear Burst] ──> [05 UI Enter]
      │
      └───> [06 Scrub] ──> [07 Liquid Warp] ──> [08 Practice Metronome] ──> [09 Encore Whip] ──> [10 Bubble Occlusion]
```

### Detailed Beat Breakdown

| Beat | Name | Frame Span (60 FPS) | Primary Primitive | Visual Action & Physical Kinetics |
|---|---|---|---|---|
| **01** | **Landing** | `f0 – f30` (0.5s) | `ScribbleAnchor` + `PaperCard` | Organic hand-drawn scribble draws in beneath an elliptical contact shadow; base paper plinth settles with subtle downward spring bounce (`y: -80 -> 0`, `overshoot: 1.05`). |
| **02** | **Pop-up** | `f30 – f75` (0.75s) | `PaperCard` | 2.5D paper card pops upward (`scale: 0 -> 1.10 -> 1.0`, `rotateZ: -3deg -> 0deg`) revealing headline plinth with layered multi-elevation shadow. |
| **03** | **Type Build** | `f75 – f135` (1.0s) | Kinetic Headline / Type | Typographic phrase reveals word-by-word with stepped rhythm or mask wipe; baseline remains rock-solid without layout shifting. |
| **04** | **Tear Burst** | `f135 – f195` (1.0s) | `JaggedPaperTear` + `ObjectScatter` | Canvas splits along high-frequency irregular jagged tear edge (`progress: 0 -> 1`); split halves pull apart while 8–16 2D sticker badges explode radially outward. |
| **05** | **UI Enter** | `f195 – f255` (1.0s) | `ChecklistScrubber` / `PaperCard` | A clean physical checklist UI card glides in smoothly from bottom with subtle 2.5D perspective tilt (`rotateX: 4deg`, `rotateY: -3deg`). |
| **06** | **Scrub** | `f255 – f330` (1.25s) | `ChecklistScrubber` | Terracotta orange dot scrubs down the vertical connecting track line; rows check off sequentially with micro-pulse feedback. |
| **07** | **Liquid Warp** | `f330 – f390` (1.0s) | SVG Filter / Morph | UI transitions with fluid mesh or organic liquid squash-and-stretch before the next beat lands, preventing rigid PowerPoint cuts. |
| **08** | **Practice Metronome** | `f390 – f480` (1.5s) | `MetronomeGauge` | Circular gauge enters; metronome needle swings back and forth with realistic pendulum harmonic physics, easing gently at left/right turnaround peaks. |
| **09** | **Encore Whip** | `f480 – f540` (1.0s) | Camera Rig / Whip | Dynamic directional whip pan across canvas; directional motion blur sweeps across paper layers, resetting the visual stage. |
| **10** | **Bubble Occlusion End Card** | `f540 – f660` (2.0s) | `PastelBubbleOcclusion` + Logo | Large translucent pastel depth bubbles swell from canvas edges (`blur: 40px`, `progress: 0 -> 1`), meeting softly at center for final brand lockup and CTA hold (min 72 frames). |

---

## 4. The 14 Named Motion Techniques

Every motion designer and agent working in the papercraft paradigm must master these 14 named techniques:

1. **Kinetic Typography:** Word-by-word or character-level stepped reveals locked to audio transients; minimum hold of 1.2s (72 frames) for primary message readability.
2. **2D Cutout:** Clean silhouette-cut paper elements with crisp edges, simulating precision scissors without digital feathered halo artifacts.
3. **2.5D Parallax:** Multi-planar depth where background paper textures, middle-ground UI cards, and foreground stickers move at distinct depth rates (`perspective: 1200px`).
4. **Overshoot + Settle:** Physical spring damping (`stiffness: 180`, `damping: 14`) producing an initial 8–12% overshoot followed by a controlled 2-cycle settle into rest.
5. **Squash & Stretch:** Dynamic deformation along the vector of motion; elements compress by 8–15% upon sudden impact and stretch along trajectory during peak velocity.
6. **Jagged Paper-Tear Mask:** Deterministic high-frequency irregular SVG polygonal path dividing a canvas into two interlocking pieces that split apart along vector offsets.
7. **Object Scatter:** Small independent sticker tags, pills, and badges launched radially from a tear/impact locus along cosine/sine trajectories with randomized angular velocity.
8. **Directional Motion Blur:** Controlled horizontal or angled streak filter applied strictly during high-velocity transitions (>800 px/sec) to soften camera whip transitions.
9. **UI Path Animation:** Linked vector dot traveling continuously along a defined polyline or Bézier curve, visually guiding the viewer's eye through structured information.
10. **Mesh / Liquid Warp:** SVG displacement map or cubic Bézier deformation applied momentarily to bridge structural state changes between disparate card shapes.
11. **Oscillation:** Periodic harmonic pendulum kinetics ($\theta(t) = \theta_{\max} \cdot \sin(\omega t)$) exhibiting zero angular velocity at reversal vertices and maximum kinetic velocity at center.
12. **Foreground Occlusion:** Organic depth spheres or soft wipe sheets swelling from viewport edges to cover the canvas without harsh cuts or linear crossfades.
13. **Depth Blur:** Selective focal plane simulation using Gaussian blur filters on out-of-focus background or foreground layers while keeping the hero card pin-sharp.
14. **Graphic Contact Shadow:** Multi-level soft elliptical contact shadow pinned directly beneath an element to root it physically to the paper stage floor.

---

## 5. Architectural Primitives Reference (`src/primitives/PapercraftCutoutStage.tsx`)

### `JaggedPaperTear`
- High-frequency irregular SVG jagged paper-tear edge mask dividing the canvas.
- Dynamically splits into two independently animated SVG clipped polygons (`pieceAPath`, `pieceBPath`) with customizable `amplitude`, `roughness`, and `tearGap`.
- Math engine: `computeJaggedPaperTear(...)` from `src/core/papercraft-math.ts`.

### `ObjectScatter`
- Radially exploding stickers, tag pills, or icons triggered at peak tear velocity.
- Each particle follows a deterministic radial trajectory with independent rotation, scale overshoot, and gravitational drift.
- Math engine: `computeScatterTrajectories(...)` and `evaluateScatterParticle(...)`.

### `MetronomeGauge`
- Circular cadence meter featuring a physical swinging metronome needle with realistic harmonic pendulum oscillation.
- Visual turnaround bead indicators highlight when the pendulum reaches maximum excursion angles.
- Math engine: `computeMetronomeOscillation(...)`.

### `ScribbleAnchor`
- Hand-drawn SVG doodle/scribble vector paired with an elliptical blurred contact shadow that anchors floating cards to the ground plane.
- Supports `loop`, `zigzag`, `spiral`, and `spring` organic line variants with animated `strokeDashoffset` draw-in.

### `PastelBubbleOcclusion`
- Large translucent pastel depth circles swelling from viewport corners to execute a soft, luxurious transition wipe without jarring cuts.

### `ChecklistScrubber`
- Tactile paper checklist card with an orange (`#E86D48`) scrubber dot tracking along a vertical connecting line, dynamically updating row completion states.
- Math engine: `computeChecklistProgress(...)`.

### `PaperCard`
- 2.5D physical paper substrate with slight 3D perspective rotation, warm charcoal contact shadow, and subtle border framing.
- Math engine: `computePaperCardMatrix(...)`.

---

## 6. Implementation Recipe: GSAP Timeline Integration

```tsx
import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import {
  PapercraftCutoutStage,
  JaggedPaperTear,
  ObjectScatter,
  MetronomeGauge,
  ChecklistScrubber,
  PastelBubbleOcclusion,
  PAPERCRAFT_PALETTE,
} from '../../primitives';

export const PapercraftScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Real signature: useRemotionGSAP(timelineFactory, deps?) -> { timeline, frame, fps }.
  // The hook takes no ref; target elements with plain selectors.
  const { timeline: tl } = useRemotionGSAP((timeline) => {
    // Beat 04: Tear Burst (frames 135 -> 180)
    timeline.to('.paper-tear-target', {
      duration: 0.75,
      ease: 'power3.out',
    }, 2.25);
  });

  return (
    <PapercraftCutoutStage width={1920} height={1080}>
      {/* Scene content mapped deterministically to frame */}
    </PapercraftCutoutStage>
  );
};
```
