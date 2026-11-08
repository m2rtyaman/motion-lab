# Brief: the bouncing ball

**Client:** an animation course that opens every module with this exercise.
**Format:** 16:9, 4 seconds, 60 fps. No text needed.

**The shot:** a ball drops onto a floor and bounces until it comes to rest. We should *feel* gravity: the ball is heavy when it lands and has less energy with every bounce. It should look like a soft rubber ball, not a hard marble. The ball travels across the frame while it bounces (left to right), so its path is a chain of arcs, not a ball bouncing in place.

**Must have:**
- A visible floor and the ball's contact with it.
- The ball ends at rest, and the last moment is calm.

**Do not:** use the same bounce height twice; make the ball float at the top of each arc.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-4 beats in spec.json; the last 1.2 s is a still hold.
- At least 3 rebounds, each lower than the one before, with a visible squash; the ball ends at least 25% of the frame width away from where it started.
- Build it with the `bounce` physics helper (options `travel`, `squash`). 80% or more of the tweens are presets/physics helpers, no raw tweens, Scene.tsx 80 lines or fewer.
