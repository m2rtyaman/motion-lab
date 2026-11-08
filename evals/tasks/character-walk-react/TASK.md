# Brief: walk, notice, react

**Client:** an animation course, final exercise.
**Format:** 16:9, 6 seconds, 60 fps. No dialogue; at most one symbol such as "!".

**The shot:** a simple character built from flat shapes (no sprites or files) walks in from the left, stops, notices something ahead on the ground, and reacts with surprise.

**Must have:**
- A real walk: the feet, body and arms move like a walk, the character does not just slide.
- A pause where it stops and clearly looks at the thing before it reacts (not a frozen freeze).
- A surprised reaction that starts with the head and then passes through the body.
- The thing it noticed is visible on screen. The last moment is calm.

**Do not:** use emoji; slide the character without leg movement.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Character:** use the rig, not hand-built limbs: `<RigCharacter id="..." left groundY />` from `src/primitives` (docs/CHARACTER_ANIMATION.md) and drive it with the helpers in `src/core/physics.ts`.

**Delivery spec (the scorer checks exactly this):**
- 3-5 beats in spec.json; 5.8-6.2 s; the last 1.2 s is a still hold (the reaction has fully settled before it).
- Walk with `rigWalk` (the root travels at least 12% of the frame width in one move).
- A hold of at least 0.3 s after the walk and before the reaction: `idleBreath` (minimum 1.6 s) or `movingHold`.
- The eyes and head lead: `lookAt` at the thing (pupils, then head) must start after the walk ends and before the reaction starts.
- `react` for the reaction: it must start with an anticipation, a crouch (downward move) right before the hop.
- At least 14 tweens, 80% or more presets/physics helpers (1 raw tween at most), Scene.tsx 150 lines or fewer, T014 clean: every selector the timeline targets (e.g. `.<id>-root`) is rendered by the JSX.
