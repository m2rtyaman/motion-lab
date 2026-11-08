# Brief: the jump

**Client:** an animation course, module two.
**Format:** 16:9, 3 seconds, 60 fps. No text needed.

**The shot:** a small block-character sits on a floor. A marked spot is above it. It jumps up and lands exactly on the marked spot. The jump must read as powerful: the viewer should sense the effort *before* the leap, and the landing should feel like it has weight, not like the block stopped dead.

**Must have:**
- The character is alive before it jumps (it is not a frozen shape).
- It ends exactly on the marked spot, calm and still for the last moment.

**Do not:** teleport; start the jump with no preparation.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-4 beats in spec.json; the last 1.2 s is a still hold.
- The jump starts with a short wind-up in the opposite direction (a small dip down) directly before the move up. Use `launch` or `anticipate`.
- The idle before the jump uses `movingHold`. 80% or more of the tweens are presets/physics helpers, no raw tweens, Scene.tsx 90 lines or fewer, at least 8 tweens.
