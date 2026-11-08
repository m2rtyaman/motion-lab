# Brief: Halcyon logo sting

**Client:** Halcyon, a calm project-planning app.
**Where it plays:** the last seconds of every product video, 16:9.
**Format:** 16:9, 4 seconds, 60 fps.

**Brand name:** Halcyon
**Tagline:** Calm software.

**Feeling:** quiet, premium, settling into place. Nothing flashy.

**Must have:**
- A simple mark built from basic shapes (no logo file exists yet) next to the name and the tagline.
- The name and tagline are perfectly clear at the end.

**Do not:** imitate another company's logo, add extra slogans.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 2-3 beats in spec.json; during the last 1.2 s hold both "Halcyon" and "Calm software." are on screen.
- The mark builds with `enter` `wipe`, `pop`, `stagger` or `blurIn`; the wordmark resolves with `blurIn`, `pop`, `rise` or `words`. No `transition` presets.
- At least 5 tweens, 75% or more presets (1 raw tween at most), Scene.tsx 90 lines or fewer.
