# Anti-Slop Design, Kinetic Rhythm & Engineering Invariants (Zero-Tolerance)

This file defines the studio's aesthetic, rhythm, and engineering constitution. It is optional guidance; RULES.md lists what scripts actually enforce.

### 1. Visual Invariants (Visual Slop — Zero-Tolerance)
- **Avoid:** generic purple/indigo/cyan/pink neon gradients and glow blobs (brand colors are fine; only raw `#00ffff` / `#ff00ff` and cyan/magenta glow shadows are linted).
- **FORBIDDEN:** Background radial ambient blurred blobs and meaningless mesh gradients.
- **FORBIDDEN:** Bento-grid boilerplate (arbitrarily segmenting the viewport into 3-4 symmetrical card mockups without purpose).
- **FORBIDDEN:** Primitive SVG circles/boxes attempting to draw human faces, hair, mustaches, or mascots.
- **FORBIDDEN:** Decorative icons trapped inside colored circular badges without functional meaning.

### 2. Kinetic Rhythm Invariants (Anti-Sluggishness)
- **Avoid (Dead Hold / Stagnant Frames; the final 1.2s hold is the one intended exception):** No visual state may persist statically on screen for longer than 2.5–3.2 seconds, and no individual element may remain motionless for longer than 1.5 seconds.
- **Recommended (Triple Kinetic Cycle — `IN -> ACTION -> OUT`):**
  * **IN (`0.35s – 0.50s`):** Sharp entry with `expo.out` + `0.04s – 0.06s` micro-stagger for child elements (maximum aggregate stagger ceiling `0.30s`).
  * **ACTION (`1.50s – 2.20s`):** In-scene live data stream (60 FPS counter interpolation, `strokeDashoffset` draw-in, `scaleX`/`scaleY` laser progress, sequential terminal log lines, or card stack push) + continuous micro-drift (`y: 0 -> -10px` or `scale: 1 -> 1.02`).
  * **OUT (`0.28s – 0.38s`):** 30%–40% faster departure than entry (`power2.in`) and a **0.15s – 0.20s overlap** with the subsequent beat.

### 3. Typography & Visual Hierarchy
- All telemetry, metrics, code blocks, timestamps, and technical kickers must use `font-mono`.
- Primary headlines must use `tracking-tighter` (-0.04em) or `tracking-tight` (-0.03em) with high contrast (`#f4f4f5`).
- Micro-labels: `text-lg uppercase tracking-widest font-mono text-zinc-500` (never below 18px; the slop linter rejects text-xs, text-sm and text-[8..14px]).

### 4. Layer, Border & 9:16 Broadcast Safe Zone Architecture
- Default vertical format is **9:16 (`1080×1920 @ 60 FPS`)**; upper `250px` and lower `300px` platform safe zones must be preserved.
- Borders are always 1px hairline boundaries (`border-white/[0.06]` or `border-white/[0.08]`).
- Radius limits: Child components use `rounded-md` (6px), primary surfaces use at most `rounded-xl` (12px). Massive pill shapes (`rounded-3xl`) are strictly avoided.

### 5. GPU Layer Purity & Deterministic Performance
- Only `transform` (`x`, `y`, `scale`, `scaleX`, `scaleY`, `rotate`) and `opacity` (plus controlled `filter: blur()` during transitions) may be animated.
- Do not tween `top`, `left`, `right`, `bottom`, `margin`, or `padding` (A003). In v2 projects `width`/`height` are also rejected (T005); prefer scale/FLIP.
- Raw `setTimeout`, `setInterval`, and CSS `@keyframes` are forbidden; all animations must be locked to frame indices via `useRemotionGSAP` (`tl.seek(frame / fps)`).
