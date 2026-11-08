# Direction - Component Gallery

## Message (one-sentence goal)
This living gallery shows every curated primitive at broadcast scale so people and models can see what they are choosing.

## Audience
Authors and small models picking primitives from `src/primitives/curated.ts`; stills are rendered by `node scripts/gallery.mjs`, not watched as a video.

## Look
- Dark page, light or dark tiles per component, captions at 20px
- Tiles are positioned from `manifest.json` (page, x, y, w, h, zoom); thumbnails in `docs/gallery/` are cropped from the same coordinates

## Beats
| id | what happens | presets |
|---|---|---|
| p0 to p7 | one page of tiles per beat (shells, widgets, overlays, atoms, type, legacy sample, depth); the last page holds still | beat, rise |
