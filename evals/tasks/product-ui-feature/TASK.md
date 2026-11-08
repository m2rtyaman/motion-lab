# Brief: Tidemark, "Sort into collections"

**Client:** Tidemark, a save-for-later app for web links.
**Where it plays:** landing page hero and launch post, 16:9.
**Format:** 16:9, 8 seconds, 60 fps.

**The one feature to show:** a button called "Sort into collections". One click and the saved links group themselves into collections (Design, Reading list, Recipes, Nature).

**Copy:**
- Headline: Saves that sort themselves
- Call to action: Try Tidemark free

**Must have:**
- The feature actually happens on screen: we see the inbox, the click, the result. Do not only describe it in words.
- The app UI sits inside a believable window (it must not float in empty space).
- A closing frame with the call to action that stays still and readable at the end.

**Do not:** copy a real product's interface or logo; invent server telemetry or fake metrics.

**Deliver:** a Motion Lab project that passes `pnpm check`.

**Delivery spec (the scorer checks exactly this):**
- 3-4 beats in spec.json. During the last 1.2 s hold the closing frame shows BOTH the headline "Saves that sort themselves" and the call to action "Try Tidemark free" (the headline must not be covered or faded out).
- Put the UI inside `<BrowserFrame>` or `<AppShell>` (from `src/primitives`). All four collection names appear.
- The click gets `emphasize` `punch` or `glint`; a `camera` push-in/settle or a `transition` supports it; the sorted items arrive as a group with `enter` `stagger` or `words`.
- At least 12 tweens, 65% or more presets (3 raw tweens at most), Scene.tsx 150 lines or fewer.
