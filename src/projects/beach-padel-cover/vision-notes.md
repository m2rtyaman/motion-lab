# Vision Notes: Beach Padel Cover — Sunset 2v2

## What is on screen
- **Canvas**: 384x216 native pixels shown at 1920x1080 (exact 5x). Every rectangle, path point, player limb and ball pixel sits on the integer grid; `shapeRendering="crispEdges"` keeps all edges as hard 5 px blocks. No filters, no gradients, no anti-aliasing.
- **Sky**: fourteen flat sunset bands from near-black indigo through magenta to hot coral, with ordered dither ticks at each band seam. A stepped pixel sun (five warm tones, three raster gaps) sits above the right end of the back wall, with a dashed glitter path on the sea below it.
- **Sea and beach**: two-tone swell lines, cream foam at the shore, wet-sand strip, then warm beach bands with grain dots. Left foreground carries a folded coral towel, a teal kit bag and a cream surfboard; two dark palm silhouettes frame the top corners.
- **Court**: sand in five depth bands with dithered seams and scattered grains, cream boundary/service/centre lines, a dark padel net with cream top tape and a visible centre strap, and three glass walls. The glass is a 7% cyan pane with steel posts, a lit top rail and sparse hard diagonal reflections; nine small pennants hang from the back beam.

## Character and action evidence
- **Far team** (coral jersey, navy shorts, white shoes, amber bats) and **near team** (teal jersey, cream shorts, dark shoes, lavender bats) stand in a 3/4 side view, each with a dark 1 px silhouette, a team headband and a visible eye.
- **Rally**: sixteen contacts on the one-per-second music grid. Contact poses swing the bat through the ball (wind-up before, follow-through after), with a white/warm starburst at the ball. Smashes and bandejas lift the player 11-14 px off the sand; digs crouch and split the legs; the run cycle steps the feet.
- **Ball**: yellow 5x5 sprite with a dark contour, a highlight pixel, two trailing pixels and a ground shadow that shrinks with height. It bounces off the sand at the marked rally points, throwing sand puffs.
- **FX**: sand puffs on bounces, two expanding glass ripples on the right wall, a one-pixel camera shake on the two smashes, and a slow parallax drift on clouds, foam, gulls and palms.

## Loop and motion audit
- All cycles use `angle(f) = 2π f / 960` with integer multipliers, so clouds, gulls, foam, palm sway and player idle are identical at frame 0 and 960. Ball and player tables wrap through the final 930→30 lob.
- Every selector-free tween is computed per frame from `useCurrentFrame`; motion is deterministic and safe for Remotion stills.
- Audio: 15 s source trimmed to 900 frames at 0.9375 playback = 16.0 s at 120 bpm, plus 16 whooshes, 16 contact cues, two smash impacts and two glass pings.
