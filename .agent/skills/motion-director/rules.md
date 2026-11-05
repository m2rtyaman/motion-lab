# Anti-Slop Design, Kinetic Rhythm & Engineering Invariants (Zero-Tolerance)

This file defines the studio's aesthetic, rhythm, and engineering constitution. It must be strictly enforced across all generated code without exception.

### 1. Visual Invariants (Visual Slop — Zero-Tolerance)
- **FORBIDDEN:** Purple (`#7c3aed`, `#8b5cf6`), indigo (`#6366f1`), cyan (`#06b6d4`, `#38bdf8`), pink (`#ec4899`) neon gradients, `box-shadow` and `drop-shadow` neon glow vomiting.
- **FORBIDDEN:** Background radial ambient blurred blobs and meaningless mesh gradients.
- **FORBIDDEN:** Bento-grid boilerplate (arbitrarily segmenting the viewport into 3-4 symmetrical card mockups without purpose).
- **FORBIDDEN:** Primitive SVG circles/boxes attempting to draw human faces, hair, mustaches, or mascots.
- **FORBIDDEN:** Decorative icons trapped inside colored circular badges without functional meaning.

### 2. Kinetic Rhythm Invariants (Anti-Sluggishness)
- **FORBIDDEN (Dead Hold / Stagnant Frames):** No visual state may persist statically on screen for longer than 2.5–3.2 seconds, and no individual element may remain motionless for longer than 1.5 seconds.
- **MANDATORY (Triple Kinetic Cycle — `IN -> ACTION -> OUT`):**
  * **IN (`0.35s – 0.50s`):** Sharp entry with `expo.out` + `0.04s – 0.06s` micro-stagger for child elements (maximum aggregate stagger ceiling `0.30s`).
  * **ACTION (`1.50s – 2.20s`):** In-scene live data stream (60 FPS counter interpolation, `strokeDashoffset` draw-in, `scaleX`/`scaleY` laser progress, sequential terminal log lines, or card stack push) + continuous micro-drift (`y: 0 -> -10px` or `scale: 1 -> 1.02`).
  * **OUT (`0.28s – 0.38s`):** 30%–40% faster departure than entry (`power2.in`) and a **0.15s – 0.20s overlap** with the subsequent beat.

### 3. Typography & Visual Hierarchy
- All telemetry, metrics, code blocks, timestamps, and technical kickers must use `font-mono`.
- Primary headlines must use `tracking-tighter` (-0.04em) or `tracking-tight` (-0.03em) with high contrast (`#f4f4f5`).
- Micro-labels: `text-[10px] uppercase tracking-widest font-mono text-zinc-500`.

### 4. Layer, Border & 9:16 Broadcast Safe Zone Architecture
- Default vertical format is **9:16 (`1080×1920 @ 60 FPS`)**; upper `250px` and lower `300px` platform safe zones must be preserved.
- Borders are always 1px hairline boundaries (`border-white/[0.06]` or `border-white/[0.08]`).
- Radius limits: Child components use `rounded-md` (6px), primary surfaces use at most `rounded-xl` (12px). Massive pill shapes (`rounded-3xl`) are strictly avoided.

### 5. GPU Layer Purity & Deterministic Performance
- Only `transform` (`x`, `y`, `scale`, `scaleX`, `scaleY`, `rotate`) and `opacity` (plus controlled `filter: blur()` during transitions) may be animated.
- Tweening `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, or `padding` is **STRICTLY PROHIBITED**.
- Raw `setTimeout`, `setInterval`, and CSS `@keyframes` are forbidden; all animations must be locked to frame indices via `useRemotionGSAP` (`tl.seek(frame / fps)`).
