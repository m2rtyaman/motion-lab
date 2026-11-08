# Brief: "How we work" list

**Client:** Fernway Studio, a small design studio.
**Where it plays:** about-page video, 16:9, usually muted.
**Format:** 16:9, 5 seconds, 60 fps.

**Title:** How we work

**Five steps, in this order:**
1. Listen
2. Sketch
3. Prototype
4. Animate
5. Ship

(A short note under or beside each step is welcome, write your own.)

**Feel:** the steps arrive with a *rhythm*, like a drummer: phrases and pauses, not one item every half second. "Animate" is the step we are proudest of, so it should feel like the important one.

**Must have:**
- All five steps readable together at the end.
- The finished list stays still and clear at the end.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-5 beats in spec.json; the last 1.2 s is a still hold.
- Items arrive with `enter` `rise` or `stagger`; "Animate" gets an `emphasize` (or a `camera` push-in).
- Rhythm: at least 7 separate entrance moments (title included) whose gaps are uneven (standard deviation of the gaps 8 frames or more).
- At least 8 tweens, 80% or more presets (1 raw tween at most), Scene.tsx 110 lines or fewer.
