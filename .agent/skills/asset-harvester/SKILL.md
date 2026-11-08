---
name: asset-harvester
description: Generate narration audio with word-level frame timings (EdgeTTS, no API key) and pick local B-roll for a project via `pnpm harvest`, then consume them in a v2 scene with the Harvest primitives. Use when a brief has voice-over, karaoke-style word timing or background footage. Skip it for silent pieces. RULES.md wins on any conflict.
---

# Asset harvester

Optional guide. No API key is needed anywhere in this pipeline. Never ask the user for one.
Workflow: write a storyboard board per beat in `spec.json` (`docs/STORYBOARD.md`), build the static layout, `pnpm render:poses --project <slug>` and fix it, only then add motion.
Requires `uv` (scripts declare their own Python dependencies) and, for the WAV copy, ffmpeg.

## Commands (`scripts/harvest/cli.py`)
```bash
pnpm harvest --project <slug> --text "Your narration script." [--query "office desk"]
pnpm harvest --project <slug> --script-file narration.txt --voice en-US-JennyNeural --rate +5%
pnpm harvest:voice --text "..." --out-dir public/harvest/<slug>
pnpm harvest:broll --query "office desk" --out-dir public/harvest/<slug> --aspect 9:16
```
- `--project` reads `src/projects/<slug>/spec.json` to infer aspect and fps (60).
- `--voice` is any EdgeTTS voice id; default `en-US-ChristopherNeural`. Examples: `en-US-JennyNeural`, `tr-TR-EmelNeural`,
  `de-DE-SeraphinaMultilingualNeural`. Speech synthesis calls Microsoft's free EdgeTTS service, so it needs internet access.
- B-roll is local only: the script picks an `.mp4` from `public/assets/` or `.cache/broll/videos/` whose file name contains
  the query (or "broll"). If none exists it writes a `broll.json` marking a procedural fallback; drop your own clip in
  `public/assets/` first when you want footage. Only use footage you have the rights to.

## Output
`public/harvest/<slug>/` (mirrored to `src/projects/<slug>/harvest/`): `audio.mp3`, `audio.wav` (when ffmpeg exists),
`words.json` (`word`, `startMs`, `endMs`, `startFrame`, `endFrame`, `durationFrames`), `broll.mp4` + `broll.json` (when found),
`manifest.json` (audio meta incl. `durationFrames`, words, broll).
Frames are `round(ms / 1000 x fps)`, so words are sorted and deterministic.

## Plan the spec around the audio
1. Read `manifest.audio.durationFrames`. `durationInSeconds` in `spec.json` must cover the audio plus a 1.2 s final hold
   (and stay at or under 60 s).
2. Start beats on significant word clusters from `words.json` and keep beat lengths uneven.
3. Schedule motion with presets at the second where the word starts (`startFrame / 60`), keep literal numbers in a
   constant at the top of the file, and finish with `holdFinal(tl, durationSeconds - 1.2, 1.2)`.

## Use in a v2 scene
The Harvest components are exported from `src/primitives/curated.ts`; the manifest is a JSON file inside your own project folder.
```tsx
import { type FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import type { HarvestManifest } from '../../core/harvest-math';
import { HarvestVoiceOver, HarvestKineticSubtitles } from '../../primitives/curated';
import harvestManifest from './harvest/manifest.json';

const manifest = harvestManifest as unknown as HarvestManifest;
const END = manifest.audio?.durationFrames ? manifest.audio.durationFrames / 60 + 1.2 : 8;

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'say', 0);
  enter(tl, '.caption-wrap', 'rise', 0.2);
  holdFinal(tl, END - 1.2, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill className="bg-zinc-950">
      <HarvestVoiceOver manifest={manifest} />
      <div className="caption-wrap absolute inset-x-0 bottom-[320px] flex justify-center px-16 text-[56px] font-black">
        <HarvestKineticSubtitles words={manifest.words} currentFrame={frame} activeTone="white" maxVisibleWords={5} />
      </div>
    </AbsoluteFill>
  );
};
export default Scene;
```
`HarvestBRollBackground` takes `src`, `currentFrame`, `projectSlug`, `opacity`, `kenBurns` and plays the local clip
deterministically; render it only when `manifest.broll?.file` exists, otherwise keep the normal backdrop.
Note that `HarvestKineticSubtitles` highlights per word from `currentFrame`; run `pnpm render:contact-sheet` and confirm the
active word is legible (18 px or larger, inside the 9:16 safe zone) before accepting it.

## Self-check
`pnpm check --project <slug>`, then the contact sheet: does the caption match the spoken words, is it inside the safe zone,
and does the final frame hold? Answer with the generic block of `evals/VISUAL_RUBRIC.md`.
