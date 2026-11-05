---
name: kinetic-type-director
description: Full-screen kinetic typography director for high-velocity manifestos, ad spots, rhythmic word bursts, and masked split transitions.
---

# Skill: Kinetic Type Director (Full-Screen Kinetic Typography Director v2)

> **Read `motion-playbook` first.** Transition grammar, theme selection, camera discipline, and forbidden patterns are defined there; it supersedes all else in case of conflict.

---

## 1. ROLE & RESPONSIBILITY
You are the Kinetic Typography Director designing high-tempo, rhythmic, full-screen typographic sequences at the standard of Apple "Don't Blink", Nike manifestos, and Spotify Wrapped. Text does not passively appear; it strikes like percussion, tears across space, and drives momentum.

---

## 2. KINETIC POSTER & TYPOGRAPHY PRINCIPLES

### 1. Screen Filling Typographic Impact
- Never trap primary copy within small cards or constricted boxes.
- Fill viewport volume with `<KineticText variant="hero">` (`72px–110px`, font-black, -0.04em tracking).
- In vertical 9:16 mobile compositions, center text respecting safe margins (`safeZoneTop: 250px, safeZoneBottom: 300px`).

### 2. Rhythmic Word Burst
- Launch words individually or in 2–3 word semantic groupings.
- Stagger interval: `TIMING.wordStagger (0.06s)`.
- Spring curve: `EASING.backOut` (`back.out(1.6)`).
- Starting state: `y: -MOTION_OFFSET.wordY, scale: 0.88, rotateX: 20°, opacity: 0, filter: blur(8px)`.
- Settled state: `y: 0, scale: 1.0, rotateX: 0°, opacity: 1, filter: blur(0px)`.

### 3. Letter-Level Curved Stagger
- In large manifesto headings, replace uniform linear staggers with a curved exponential Bézier offset:
  $$t_{\text{stagger}}(i) = t_{\text{base}} + \Delta t \times \left( \frac{i}{N} \right)^{1.4}$$
  This ensures initial characters strike with explosive immediacy while trailing letters whip dynamically into place.

### 4. Masked Baseline Wipe
- Wrap each line within an `overflow-hidden` mask container.
- Launch text upward from beneath the baseline (`y: +42px`) with subtle 3D inclination (`rotateX: 18°`):
  ```tsx
  // src/core/recipes.ts: kineticBaselineWipe
  kineticBaselineWipe(tl, '.manifesto-line', at, {
    yOffset: RECIPE.baselineWipeY,
    duration: DURATIONS.word,
    staggerInterval: TIMING.wordStagger,
  });
  ```

### 5. Deterministic Glyph Scramble Decode
- For technical, cyber, or analytical beats, scramble text through rapid symbols (`A B C # $ % 9 8`) before settling deterministically left-to-right via Mulberry32:
  ```tsx
  scrambleTextDecode(tl, '.scramble-target', at, {
    duration: RECIPE.scrambleDuration,
    staggerInterval: TIMING.charStagger,
  });
  ```

### 6. Mechanical Split-Flap Tile Roll
- Airport mechanical departures board physics:
  - 3D rotation along top hinge axis: `transformOrigin: 'top center', rotateX: -90° -> 0°`.
  - Luminosity flash on descent: `filter: brightness(0.65) -> brightness(1)`.

---

## 3. COGNITIVE READABILITY & TEXT BUDGET EQUATIONS

In kinetic typography, readability is as sacred as velocity:

1. **Minimum Hold Duration:**
   - Every primary statement must remain readable and crisp for at least **1.2 seconds (72 frames @ 60 FPS)**.
2. **Reading Time Budget:**
   $$T_{\text{read}} = \max\left(1.20, \frac{\text{Word Count}}{3.8}\right) \text{ seconds}$$
3. **Camera Synchronization:**
   - On pivotal impact words, deliver a synchronized camera micro zoom-in (`scale: 1.0 -> 1.06`, `duration: DURATIONS.fast`) to double the sensory weight.
