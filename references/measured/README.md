# Measured reference statistics

These files are **derived timing statistics only** (numbers, a category label and a credit). No video,
frame, thumbnail or other creative content from the sources is stored in this repository.

## What is here

- `<short-id>.json` — one file per measured clip: native fps/duration, motion-energy summary, hard cuts and
  shot lengths, holds and final hold, motion events (onset→peak vs peak→rest, asymmetry, duration), and
  approximate block-matching speed in px/frame normalised to 1080 short-side at 60 fps. Every duration is
  given in seconds and in frames@60.
- `SUMMARY.md` — per-category median / p25 / p75 and the calibration recommendations for the harness.

Short-id prefixes: `kin-` kinetic typography / editorial, `ui-` UI / product, `sting-` title / logo / reveal
stings, `char-` character and creature animation, `spat-` camera / spatial / material pieces.

## Credits

The clips measured are short preview videos from the third-party catalog "Awesome Claude Opus 5.5 Video"
(`awesome-claude-opus-5.5-video-main/`, kept untracked, not redistributed here). Each JSON carries
`meta.creator` and `meta.creditLink` (the creator's original page as listed in the catalog's
`README.md` and `ATTRIBUTION.md`) plus `meta.catalogCaseId` / `meta.catalogFile` so the clip can be located again.
All creative work belongs to those creators; only measurements of timing are kept here.

## Re-running

```bash
# one clip, printed to stdout
pnpm ref:measure -- path/to/video.mp4

# write a result file with credit metadata
pnpm ref:measure -- path/to/video.mp4 --out references/measured/x.json \
  --meta '{"id":"x","category":"character","creator":"name","creditLink":"https://..."}'
```

Options: `--width 192` analysis width, `--still 0.3` near-still threshold (mean abs gray diff, 0-255),
`--min-hold 0.25` minimum hold in seconds, `--series` also dump per-frame energy/speed.
ffmpeg is taken from Remotion's bundled compositor (`node_modules/@remotion/compositor-*`), else from PATH.
Frames are decoded in memory as downscaled grayscale PNGs; nothing is written to disk.

## Read with care

Previews are 480-640 px wide, mostly 24 fps and 6-10 s long (cropped excerpts), so timings are quantised to
41.7 ms (2.5 frames@60), final holds are often cut off, and compression noise sets the "still" floor. See
`SUMMARY.md` for limits.
