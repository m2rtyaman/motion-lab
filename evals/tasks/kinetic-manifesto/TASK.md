# Brief: Signal Lab manifesto

**Client:** Signal Lab, an independent newsletter about clear writing.
**Where it plays:** vertical feed (Reels / Shorts), usually muted.
**Format:** 9:16, 6 seconds, 60 fps.

**Copy, exactly, in this order:**

1. Less noise.
2. More signal.
3. Say it once.

**Tone:** confident, blunt, no decoration. Typography is the whole piece: no photos, no icons, no logo.

**Must have:**
- One line owns the screen at a time; the viewer can read each one.
- The last line stays still and readable at the end.
- Respect the vertical safe areas of a phone feed.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-4 beats in spec.json; the last 1.2 s is a still hold in which "Say it once." is visible (not exited, not faded).
- Lines arrive with `enter` `words` or `stagger`, at least one `emphasize`/`camera` move, and the lines hand over with `exit` or `transition` presets.
- At least 8 tweens, 80% or more presets (1 raw tween at most), Scene.tsx 100 lines or fewer.
