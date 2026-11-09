# Beach Padel Cover — Sunset 2v2 (Direction)

## Tek Cümlelik Hedef
Bu videonun tek cümlelik hedefi şu: İzleyiciye, gün batımında cam duvarlı kum sahada oynanan yüksek tempolu 2v2 plaj padel maçının enerjisini, tek bir kesintisiz ve kusursuz döngüde hissettirmek.

## Concept
A 16-second seamless arcade cover for a high-tempo 2v2 beach padel match: four players trade sixteen racket contacts inside a glass-walled sand court while the sun drops into a violet ocean.

## What the viewer must feel
Speed, heat and control. The frame is calm and symmetric — sunset, palms, pennants — while the rally is relentless: one contact every second, sand kicking up at every bounce, a jumping smash and a diving dig. No text, no logo, no cut: the loop is the product.

## Frame
- 1920x1080, 60 fps, 960 frames, 16:9.
- Native 384x216 pixel canvas upscaled exactly 5x; integer coordinates, `shapeRendering="crispEdges"`, flat palette only.
- Single continuous take. Every animated value is periodic over 960 frames, so frame 960 equals frame 0 and the MP4 loops without a seam.
- Audio: a 120 bpm electro bed (trimmed and rate-matched to exactly 16 s) plus frame-locked whooshes, contact plucks, smash impacts and two glass pings.

## Depth architecture
1. **Backdrop** — fourteen banded sunset strips, dithered seams, a stepped raster sun with an ocean glitter path, pixel clouds, three gulls, palms and beach props (towel, kit bag, surfboard).
2. **Architecture** — three glass walls in side 3/4: dark steel posts, a lit top rail, sparse diagonal reflections and pennants on the back beam. A dark mesh padel net with a cream top tape and centre strap divides the court.
3. **Hero action** — the four players and the yellow ball. Far team in coral on navy; near team in teal on cream; amber and lavender padel bats.

## Rally beats (one second each)
1. `rally-serve` — far-left serve drops into the sand.
2. `near-drive` — near-left steps in and drives flat.
3. `net-volley-clash` — far-right volley, near-right counter.
4. `deep-glass-rebound` — lob pulled down by a jumping near-left smash; right-glass ripple.
5. `aerial-bandeja` — leaping near-right overhead.
6. `wall-bajada-recovery` — low dig becomes a counter drop.
7. `diving-corner-save` — far-left scoops out of the corner.
8. `loop-reset-climax` — final lob returns ball and bodies to the frame-0 pose.

## Rules kept
No text, no emoji, no brand logos, no random values, no timers. Palette colours only. The final beat is a held wide frame so the loop lands cleanly.
