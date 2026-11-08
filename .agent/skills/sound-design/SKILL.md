---
name: sound-design
description: Add beat-locked sound effects and a music bed to a Motion Lab video using the bundled CC0 library in public/sfx, SoundCuePlayer and scripts/sound_pass.py, and verify loudness (about -16 LUFS, true peak below -4 dBFS) on the exported MP4. Use when a brief asks for sound, SFX or music. Skip it for silent pieces. RULES.md wins on any conflict.
---

# Sound design

Optional guide. Sound is never required for `pnpm check`. Claude cannot hear, so this skill measures instead of judging:
Workflow: write a storyboard board per beat in `spec.json` (`docs/STORYBOARD.md`), build the static layout, `pnpm render:poses --project <slug>` and fix it, only then add motion.
never write "it sounds good"; report numbers and give a human 5 timestamps to check.

## What exists in this repo
- `public/sfx/` - bundled CC0 library (OGG, 48 kHz) by category: `whoosh`, `transition`, `click`, `pop`, `tick`, `ding`,
  `impact`, `riser`, `glitch`, `typing`, `ui-blip`, `ambience`. `manifest.json` lists every file, duration, source and licence.
- `public/sfx/kit/` - the default kit, one sound per core category: `whoosh.ogg`, `click.ogg`, `pop.ogg`, `riser.ogg`,
  `impact.ogg`, `tick.ogg`. Use it first.
- `public/sfx/LICENSES.md`, `TOP-PICKS.md`, `MUSIC.md` - credits, picks, suggested free music (downloaded at runtime, never committed).
- `src/core/SoundCuePlayer.tsx` - places cues on frames inside a Remotion composition.
- `scripts/sound_pass.py` (with `scripts/report.py`) - measured mix of an exported silent video. Needs ffmpeg and
  Python libs `librosa soundfile numpy scipy matplotlib` (install them in a throwaway venv).
- `pnpm music:map <audio file or slug> [--fps 60]` - beat map of a music track (`music_map.json`).
- `spec.json` may list intent as `"sfx": [{ "frame": 120, "sfx": "whoosh" }]`.

## Rules
1. Use recorded files only. Never synthesise beeps in code.
2. Prefer the bundled kit and library. Only CC0 files go into `public/sfx/`, each with a manifest entry and a `LICENSES.md` row.
   Anything else (Mixkit, Pixabay) is downloaded into the user's project at run time and never committed.
3. Music comes from the user or `public/sfx/MUSIC.md`. Record its source and licence; if unconfirmed, say so plainly.
4. Priority: voiceover > sfx > music. Music sits about 12 dB under the sfx and ducks 8-12 dB under narration.
5. Measure the exported MP4, not an intermediate file.

## Cue map (cue type -> category)
| Moment | Type | Category | Timing |
|---|---|---|---|
| slide, camera move | `movement` | whoosh | start about 2 frames early |
| scene change | `scene_cut` | whoosh or transition | 2 frames early |
| element appears | `appear` | pop | on the frame |
| click | `click` | click | on the frame of the `punch` |
| typing | `typing` | typing | quiet, trimmed to the typing duration |
| build-up | `build_up` | riser | ends on the next hit |
| title or logo lands | `reveal` | impact | the loudest cue |
| done, success | `success` | pop or ding | on the frame |
| small UI | `hover_or_small_ui` | tick | very quiet |
One sound per cue; vary takes inside a category so repeats do not sound robotic.

## Workflow
1. Derive cue frames from the timeline, not by ear: the `beat:<id>` labels and preset start times in `buildTimeline`
   (frame = seconds x 60). Convert each into a cue.
2. In the scene, mount `SoundCuePlayer` with literal frame numbers:
```tsx
import { SoundCuePlayer, type SoundCue } from '../../core/SoundCuePlayer';

const CUES: SoundCue[] = [
  { frame: 6, type: 'appear' },
  { frame: 118, type: 'movement' },
  { frame: 177, type: 'click' },
  { frame: 252, type: 'reveal', volume: 0.6 },
];
// inside <AbsoluteFill> ...
// <SoundCuePlayer cues={CUES} />
```
3. With music: `pnpm music:map public/audio/<track>.mp3 --fps 60`, then move big cuts and reveals onto beats by changing beat
   timings in `spec.json` and `buildTimeline` (not by nudging audio past what is natural).
4. For a measured mix of a rendered video write `cues.json` (`[{"t": 2.0, "type": "scene_cut", "desc": "cut to card"}]`) and run
```bash
python scripts/sound_pass.py --video out/<slug>/<slug>.mp4 --cues cues.json \
  --music public/audio/<track>.mp3 --manifest public/sfx/manifest.json --out out/<slug>/sound/ \
  --music-source "<track, artist, link>" --music-license "<licence>" --use-case "YouTube"
```
   It writes the mixed video, `SOUND.md`, `CREDITS.txt`, a beat-grid plot and per-cue checks.
5. Loudness target: about -16 LUFS integrated, true peak below -4 dBFS. Check:
   `ffmpeg -nostats -i out/<slug>/sound/after.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12`
   Adjust gain or add a limiter and measure again.

## Report
State the sounds used and their licences (all CC0, or name each unknown one), the music source and licence (or "not
confirmed"), cut-to-beat errors in ms, final LUFS and true peak, and the 5 riskiest timestamps for a human to listen to.
