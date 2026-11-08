# Brief: Harbor Line, riders this month

**Client:** Harbor Line, a city ferry and tram operator.
**Where it plays:** vertical feed (Reels / Shorts), usually muted.
**Format:** 9:16, 5 seconds, 60 fps.

**The stat:** 48,200 riders this month.

**Copy:**
- Brand line: Harbor Line
- Number: 48,200 (counts up from 0)
- Label: riders this month

**Feel:** one big number is the hero. It counts up quickly, lands with a little weight, then the label settles in beneath it. The finished number should be easy to read and hold still at the end.

**Must have:**
- The number counts up on screen (do not just fade in the final value).
- Digits do not jitter sideways while counting.
- Respect the vertical safe areas of a phone feed.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-4 beats in spec.json; during the last 1.2 s hold "Harbor Line" and "riders this month" are on screen.
- The count is a pure function of the frame (`useCurrentFrame` + `interpolate`, or `<AnimatedCounter>`), set in tabular numerals (`tabular-nums` or a monospaced font).
- The number arrives with an `enter` preset and lands with `emphasize` `punch`/`glint` or a `camera` push-in; the label enters separately.
- At least 7 tweens, 80% or more presets (1 raw tween at most), Scene.tsx 100 lines or fewer.
