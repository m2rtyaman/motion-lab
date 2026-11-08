---
name: motion-playbook
description: Optional reference for producing professional motion graphics in this repo - transition grammar, theme selection, beat structure and camera discipline. RULES.md is the only mandatory rule file.
---

> Optional reference. RULES.md wins on any conflict.

# Motion Playbook (optional reference)

This repository is not a "slide presentation" generator or static UI screen recorder; it is a **continuous, cinematic, and editorial motion graphics studio**. A video is not a sequential list of boxes fading in; it is an orchestrated perceptual journey guiding the viewer's eye across the canvas with deliberate momentum and choreography.

---

## 0.5. Storyboard guidelines (soft)
> **Comprehensive Guide:** `references/MASTER_STORYBOARD_RULES.md`

Every project (`src/projects/<slug>/`) during the storyboard phase should follow these guidelines where they fit:
1. **Zero Traditional Cuts (Continuous Kinetic Handoff):** Avoid slide-deck crossfades as the only transition. Prefer a single hero element (`TheHeroActor`) lives from frame 0 through the final frame, evolving dynamically to carry the scene.
2. **1.0 – 1.5s Micro-Beat Pulse & 1.2s Stillness Hold:** Visual action pivots in depth/direction every 60–90 frames; the final takeaway receives at least 1.2s (72 frames) of unblurred stillness for retention.
3. **Three-Layer Depth Architecture (3-Layer Depth System):** Reject flat 2D designs in favor of Background Base (atmospheric grid) $\to$ Secondary Depth (ghost outlines, trailing lag) $\to$ Foreground Hero (crystalline typography, solid accents).
4. **Spatial & Luminosity Contrast:** Construct intentional shifts between focused dark editing environments and warm, inviting brand spaces.
5. **Three-Input Separation of Concerns (3-Input Rule):** Decouple Script (*What/Why*), Storyboard (*Visual Anatomy & Depth*), and Motion Reference (*Spring Physics & Momentum*).

---

## 1. Three questions to ask yourself (optional)
1. **Where is the viewer's eye focused right now?**
   - Two primary actions cannot compete simultaneously. Focus transfers at beat boundaries via *directional momentum and kinetic handoff*, never via abrupt hard cuts.
2. **Which transition carries this boundary, and why?**
   - Transitions are not decorative; they emerge from narrative motivation:
     - Velocity, launch, forward step → `transitionWhipPan`
     - Layer reveal, curtain opening → `transitionMaskWipe`
     - Macro-to-micro dive / portal jump → `transitionZoomPunch`
     - Object metamorphosis, container expansion → `transitionContainerMorph` / `flipContainerTransition`
3. **Why is this video dark or light?**
   - Defaulting to "dark glass" is banned. Choose themes intentionally based on product identity (`light` for B2B SaaS / Fintech, `editorial-warm` for manifestos, `dark` for infrastructure/cyber core), applying full-bleed color blocking (`beatPalettes`) between beats.

---

## 1.5. Optional research
If you have web access and the user supplied a brand, searching can help; it is never required. Useful topics:

1. **Official Brand & Exact SVG `<path>` Coordinates:**
   - Sourced from `simpleicons.org`, `github.com/simple-icons`, raw SVG sources, `lucide.dev`, and official brand guidelines for exact hex codes and `<path d="...">` strings.
2. **Authentic Product UI Anatomy (UI Tear-Down):**
   - Extract authentic UI components (e.g. speech bubble tails `tail-in`/`tail-out`, encryption badges, participant video grids) from official changelogs, `mobbin.com`, or `pageflows.com`.
3. **Elite Studio Case Studies (Creative Breakdowns):**
   - Learn transition metaphors (**Match-Cut**, **3D Exploded Layer**, **Macro-to-Wide Camera Pull**) from breakdowns by *Ordinary Folk*, *Buck.co*, *ManvsMachine*, *Ravie.co*, and *Giant Ant*.
4. **Technical SVG Filters & 3D Depth Patterns:**
   - Reference *Codrops*, *GSAP Showcase*, and *Frontend Horse* for `<feGaussianBlur>` + `<feColorMatrix>` gooey liquid filters, multi-stop gradients, and CSS 3D `preserve-3d` layer separations.

---

## 2. Disney's 12 Principles of Animation Adapted for UI & Motion Design

Traditional Disney animation principles form the foundation of elite digital motion design:

### 1. Squash & Stretch (Volume Conservation)
- UI cards and buttons do not behave like rigid plastic. Volume is always conserved ($scaleX \times scaleY \approx 1.0$).
- When pressed: `scaleY: 0.90, scaleX: 1.08`.
- When rebounding: `scaleY: 1.08, scaleX: 0.94`.

### 2. Anticipation (Anticipatory Stillness — 300–500ms)
- Prior to major impacts, whip-pans, or modal reveals, hold the scene in 300–500 ms (18–30 frames @ 60 FPS) of micro-windup or anticipatory breath.
- Cursors compress (`scale: 0.88`) before clicking; windows spring (`scale: 0.97, y: +6px`) before launching.

### 3. Staging (Single Focal Hierarchy)
- The human eye tracks only one dominant action at a time.
- Direct viewer attention across the canvas using directional momentum—an outgoing card's exit vector triggers the incoming element's trajectory.

### 4. Straight Ahead Action & Pose to Pose
- Primary narrative beats and key poses are planned frame-by-frame in `spec.json` (Pose to Pose).
- Secondary procedural dynamics (dust, sparks, particles, micro-shakes) compute dynamically using seeded Mulberry32 math (Straight Ahead).

### 5. Follow Through & Overlapping Action
- When a container halts, internal headlines, charts, and buttons do not stop simultaneously.
- Children settle sequentially with an intentional stagger (`staggerInterval: TIMING.itemStagger`).

### 6. Slow In & Slow Out (Natural Damping)
- No physical object moves at `linear` velocity.
- Employ `expoOut` (`expo.out`), `powerOut` (`power3.out`), or `backOut` (`back.out(1.6)`) across all UI tweening.

### 7. Arcs (Bézier Trajectories)
- Cursors and flying elements never travel in straight Euclidean lines.
- Incorporate subtle parabolic arcs (`curvature: 0.22`) via `bezier-trajectories` reflecting natural human biomechanics.

### 8. Secondary Action
- Reinforce primary actions with subtle secondary accents: softening contact shadows, specular edge sweeps (`specularGlintGlance`).

### 9. Timing & Spacing (Rhythm & Frame Budgets)
- Vary beat durations; avoid a metronome of equal beats.
- Staccato impacts: 35–55 frames (0.6s–0.9s).
- Deep data reading holds: 75–120 frames (1.25s–2.0s).

### 10. Exaggeration
- Controlled overshoot on spring settlements (`scale: 1.06 -> 1.00`), subtle bank tilt on fast cursor moves (`rotateZ: 3.5°`).

### 11. Solid Drawing / Clean Surfaces
- Replace muddy neon glows with physical light separation: 1px specular highlights (`specularRimTop`), soft ambient contact shadows (`ambientShadow`).

### 12. Appeal
- Pristine typographic hierarchy, global glyph support, and zero illegible micro-fonts.

---

## 3. Eye Tracking & Cognitive Readability Standards (WPM)

1. **Visual Trajectory:**
   - Viewers scan in F-patterns or Z-patterns. Connect the exit coordinates of beat $N$ to the entry coordinates of beat $N+1$.
2. **Minimum Hold Duration:**
   - Every primary headline or core data point must remain stable and crisp on screen for **at least 1.2 seconds (72 frames @ 60 FPS)**.
3. **Cognitive Word Budget (WPM):**
   - The ceiling for on-screen text consumption is 220–240 WPM:
     $$\text{WPM} = \frac{\text{Word Count}}{\text{Duration (seconds)}} \times 60 \le 240$$
   - A 4-word heading requires at least 1.0s – 1.2s of dedicated screen time.

---

## 4. Single Container Principle & FLIP Architecture

Abrupt scene jumps break cognitive continuity. High-end motion design anchors the canvas with a central hero container (Container / Shell):

```tsx
// Single Container Architecture with GPU-Pure FLIP Transform
<ContainerMorph
  stages={[
    {
      id: 'search-pill',
      startFrame: 0,
      endFrame: 120,
      width: 480,
      height: 64,
      borderRadius: 32,
      content: <CommandSearchBar />,
    },
    {
      id: 'dashboard-card',
      startFrame: 120,
      endFrame: 300,
      width: 920,
      height: 540,
      borderRadius: 20,
      content: <DashboardAnalytics />,
    },
  ]}
  transitionFrames={28}
/>
```

- Using container morphing (`width`, `height`, `borderRadius`, `strokeDashoffset`) or FLIP (`scaleX`, `scaleY`), elements evolve continuously across scenes without cutting.

---

## 4.5. `SvgFilterLab` & `LayeredStage3D` (Multi-Layer Vector & 3D Depth)

1. **`SvgFilterLab` (`src/primitives/SvgFilterLab.tsx`):**
   - Every scene incorporates `<SvgFilterLab />` for rich graphic definitions:
     - `url(#gooey-liquid-morph)`: Organic fluid merging/splitting via `<feGaussianBlur>` + `<feColorMatrix>`.
     - `url(#specular-rim-glow)`: Crystalline specular edge highlights and depth shadows.
     - Multi-stop metallic, emerald, and glass `<linearGradient>` / `<radialGradient>` stops.
     - Verified vector assets (`SpeechBubbleTailSVG`, official brand icons).
2. **`LayeredStage3D` (`src/primitives/LayeredStage3D.tsx`):**
   - Replaces flat 2D boxes with 3D stages featuring `perspective: 1400px` and `transformStyle: 'preserve-3d'`.
   - Distribute elements along `<LayerPlane z={0}>` (base chassis), `<LayerPlane z={45}>` (cards/bubbles), `<LayerPlane z={85}>` (shields/waveforms), and `<LayerPlane z={120}>` (cursors/badges) to produce authentic 3D parallax on camera tilts.

---

## 5. Transition Grammar Dictionary (`src/core/transitions.ts`)

| Function | Signature Character | Required Parameters |
|---|---|---|
| `transitionWhipPan` | High velocity, directional inertia, dynamic wipe | `(tl, outgoing, incoming, { at, direction: 'left'\|'right'\|'up'\|'down', duration })` |
| `transitionMaskWipe` | Architectural reveal, precision wipe | `(tl, incoming, { at, type: 'diagonal'\|'horizontal'\|'vertical'\|'iris', outgoingSelector })` |
| `transitionZoomPunch` | Macro/micro depth dive, portal jump | `(tl, outgoing, incoming, { at, duration, zoomScale, portalRingSelector })` |
| `transitionContainerMorph` | Single-container metamorphosis | `(tl, container, outContent, inContent, { at, duration })` |

### Transition Rules:
- Every beat boundary must feature an intentional transition (`M001 / M004`).
- Projects with 3+ beats must combine at least 2 distinct transition families (`M003`).
- Beats must never unmount (`{isBeat && <X/>}` is forbidden, `M002`).

---

## 6. Production Reference Pattern

```tsx
import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING, TIMING, RECIPE } from '../../core/tokens';
import { blurScaleReveal, kineticBaselineWipe, cursorClickImpulse } from '../../core/recipes';
import { transitionWhipPan } from '../../core/transitions';

export const MasterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const fps = 60;

  // Real signature: useRemotionGSAP(timelineFactory, deps?) -> { timeline, frame, fps }.
  // There is no scopeRef; target elements with plain selectors.
  const { timeline } = useRemotionGSAP((tl) => {
    // 1. Beat 1: Headline reveal
    kineticBaselineWipe(tl, '.hero-headline', 0.2);

    // 2. Cursor click impulse
    cursorClickImpulse(tl, '.cursor-pointer', 1.4, { rippleSelector: '.click-ripple' });

    // 3. Beat 1 -> Beat 2 Transition (Whip-Pan)
    transitionWhipPan(tl, '.beat-1-view', '.beat-2-view', {
      at: 2.1,
      direction: 'left',
      duration: DURATIONS.panel,
    });

    // 4. Beat 2: Card focal reveal
    blurScaleReveal(tl, '.analytics-card', 2.3);
  }, [fps]);

  useMemo(() => {
    if (timeline) {
      timeline.seek(frame / fps);
    }
  }, [frame, fps, timeline]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#09090b] text-[#fafafa]">
      {/* Beat 1 Layer */}
      <div className="beat-1-view absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="hero-headline text-[64px] font-bold tracking-tight">Autonomous Motion Studio</h1>
        <div className="cursor-pointer absolute top-1/2 left-1/2 w-6 h-6 bg-white rounded-full pointer-events-none" />
        <div className="click-ripple absolute top-1/2 left-1/2 w-16 h-16 rounded-full border border-white pointer-events-none opacity-0" />
      </div>

      {/* Beat 2 Layer */}
      <div className="beat-2-view absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <div className="analytics-card w-[800px] h-[480px] bg-[#17171d] border border-white/10 rounded-2xl p-8">
          <h2 className="text-[36px] font-semibold">Telemetry Dashboard</h2>
        </div>
      </div>
    </div>
  );
};
```

---

## 6.5. Hybrid Template Engine (html-video & Native Remotion)

The studio supports a two-tier hybrid template architecture:
1. **Native Remotion Templates (RFC-08 Phase 2):**
   - `<TemplateFrame templateId="frame-data-rollup" data={{ items: [...] }} theme={LIGHT_SAAS_THEME} />`
   - Numeric counter interpolation and spring bars compute deterministically within Remotion.
2. **Deterministic HTML Frame Driver (RFC-08 Phase 1 / `HtmlFrameDriver`):**
   - 22 editorial, data-viz, and manifesto templates run within sandboxed iframes.
   - All CSS `@keyframes` and GSAP timelines lock to `(frame / fps) * 1000` ms via `doc.getAnimations()` and `tl.time()`.
   - Font loading is neutralized via `neutralizeBlockingResources` to prevent black frames or FOUT.
3. **RFC-07 Three-Layer Provenance:**
   - Every template tracks L1 origin, L2 via_skill, and L3 transformation metadata.

---

## 6.8. Visual Styles & Mastering Standards

### 1. Visual Style Taxonomy
1. **Surreal Collage (Terry Gilliam / Cutout):** 2–4px paper-cut borders, stepped stop-motion holds, articulated puppets (`CutoutPuppetStage`).
2. **Papercraft & Paper Theater:** Layered dioramas, 3D plane depth, light slit shadows.
3. **Hand-drawn & Whiteboard:** Procedural stroke paths, eraser dust, pen scratch audio.
4. **Painting & Ink:** Oil/watercolor diffusion, procedural brush strokes, ink bleed.
5. **Printmaking & Halftone:** Dot matrix, halftone screening, S-curve print mapping (`printToneCurve`).
6. **Continuous Line:** Unbroken vector stroke navigating space to form icons.
7. **Mosaic & Stained Glass:** Luminous glass cells divided by 1px lead solder lines.
8. **Flat Geometry:** Euclidean geometry, Bauhaus and Swiss grid discipline.
9. **Kinetic Typography:** Word bursts, split masks, variable-font weight interpolation.
10. **Charts & Maps (Telestrator):** Homography plane transformation (`homography-math`), tactical routes, radar pulses.
11. **Pixel Art & HD-2D:** Low-res sprites combined with modern 3D depth and lighting.
12. **Retro Neon:** CRT scanlines, phosphor glow, analog curve distortion.
13. **Sci-fi HUD:** Tactical telemetry, corner crosshairs, 18px mono readouts.
14. **Particles & Light Fields:** Vector flow fields, magnetic dispersion, particle emission.
15. **Glass & Liquid (Gooey Morph):** Fluid SVG filters, 1px crystalline specular refraction.
16. **2D Animation & Anime:** 12 animation principles, speedlines, impact frames.
17. **Clay & Toys:** Tactile clay textures, fingerprint noise, low-framerate stutters.
18. **Products & Exploded Views:** 3D exploded hardware assemblies, callout leader lines.
19. **Miniature & Isometric:** Tilt-shift depth of field, 30°/60° isometric perspective.
20. **Nature & Cosmos:** Volumetric atmosphere, orbital paths, fractal particles.
21. **Blueprints & Cutaways:** Drafting blue surfaces, white hairline dimension arrows.
22. **Cinematography & Editing:** 2.39:1 anamorphic ratio, rack focus, motivated camera acceleration.
23. **Forensic Desk & Archives:** Cold research slate (`#0B0C0E`), loupe inspection (`LoupeMagnifier`), ledger sheets (`LedgerCardStage`), broadcast strap (`BroadcastPackageStrap`).
24. **Product Interfaces:** Apple/Linear style micro-interactions, FLIP container morphing, smooth Bézier cursor trajectories.

### 2. Negative Constraints (Adversarial Anti-Slop Gates)
- **No Floating Unanchored Bento Slop:** Floating disconnected boxes are banned. UI must be anchored within defined hardware shells (`AppShell`, `BrowserFrame`, `PrecisionDashboardShell`) or a 1px shared hairline grid (`gap-[1px] bg-white/[0.08]`).
- **Single Container Continuity:** Prefer a single hero container that morphs across scene boundaries over crossfade dissolves (`transitionContainerMorph`).
- **Forensic Restraint:** In investigative and disaster reconstructions, cheap fire graphics or exaggerated slow-motion are banned; communicate via quantified data points and verified geometry.

### 3. Audio Mastering & AAC Standards
- **-16 LUFS Normalization:** Integrated audio normalized to about -16 LUFS, true peak below -4 dBFS.
- **AAC Sample-0 Guard (`applySample0Guard`):** To eliminate AAC/MP3 MDCT filter clipping at t=0, apply a 2.0 ms Hann window fade-in locking sample 0 to zero.
- **Dynamic Audio Ducking:** Automatically duck background music by -9 dB to -12 dB during voiceover or spoken dialogue.

---

## 7. Zero-Tolerance Quality Gate

```bash
# 1. Dynamic registry & spec contract verification
node scripts/gen-registry.mjs
node scripts/validate-spec.mjs

# 2. Shift-Left Storyboard and motion quality audits
node scripts/audit-storyboard.mjs
node scripts/motion-audit.mjs

# 3. AST Syntax and anti-slop scan
node scripts/ast-lint.mjs
node scripts/slop-linter.mjs

# 4. Motion Lab director evaluation and typography audits
node scripts/critic-audit.mjs
node scripts/glyph-audit.mjs

# 5. TypeScript typecheck
npx tsc --noEmit
```

A task is complete only when all audits pass **100% green** and the physical MP4 video file is verified on disk.
