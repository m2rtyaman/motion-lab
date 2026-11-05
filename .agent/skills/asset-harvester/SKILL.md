---
name: asset-harvester
description: Keyless media harvesting engine for Remotion. Harvests neural voice narration with sub-millisecond word timings via open EdgeTTS (100% API-key-free) and orientation-matched local/offline B-roll with SHA-256 caching. Explains CLI usage (pnpm harvest), keyless media workflows, and Remotion consumption with HarvestVoiceOver, HarvestKineticSubtitles, and HarvestBRollBackground.
---

# ASSET HARVESTER (API-KEY-FREE VOICE TIMINGS, LOCAL B-ROLL & DISK CACHING)

You are the Asset Harvesting Specialist and Keyless Media Pipeline Engineer for `motion-lab`.
Your mission is to supply real, frame-accurate audio, sub-millisecond word timing maps, and orientation-matched B-Roll video or procedural visual backdrops to Remotion compositions without requiring any API keys, paid tokens, or external authentication.

---

## 1. STUDIO MANDATE: 100% API-KEY-FREE PIPELINE

Our studio operates entirely **API-KEY-FREE**:
- **Zero API Key Requirement**: No feature, script, or component requires an API key. Never ask the user for an API key, tokens, or credentials.
- **Zero Configuration Neural Speech**: Spoken narration uses open EdgeTTS synthesis directly over WebSocket with sub-millisecond `WordBoundary` timestamps and zero configuration.
- **Keyless Media & Offline Cache**: Stock and B-roll footage relies on local assets (`public/assets/`, `src/projects/<slug>/harvest/`), content-addressed SHA-256 disk cache (`.cache/broll/`), or deterministic procedural backdrops (`SpotlightStage`, `AtmosphereParticles`, SVG/CSS gradients).
- **Graceful Determinism**: Missing remote media never halts production. The system seamlessly falls back to procedural visual stages and local audio without interruption.

---

## 2. WHEN TO USE THIS SKILL

Trigger this skill immediately whenever:
- A user brief, storyboard, or script contains voice narration or spoken text.
- Synchronized word-by-word kinetic typography, subtitles, or karaoke highlights are needed in Remotion.
- A project requires background video footage or B-roll motion texture.
- A new project is created (`pnpm new <slug>`) and requires real audio-visual timing contracts rather than static placeholder divs.

---

## 3. THE CLI INTERFACE (`pnpm harvest`)

Asset harvesting is driven by `scripts/harvest/cli.py` via npm/pnpm shortcuts defined in `package.json`:

```bash
# Full harvest (Voice narration + Local/Cached B-Roll)
pnpm harvest --project <slug> --text "Your voice narration script here." --query "high tech server room"

# Voice narration only (100% keyless EdgeTTS)
pnpm harvest:voice --text "Your voice narration script here." --out-dir public/harvest/<slug>

# B-roll video harvest / cache check
pnpm harvest:broll --query "modern architecture glass" --out-dir public/harvest/<slug> --aspect 16:9
```

### CLI Parameters & Auto-Inference
- `--project <slug>`: The target project slug. Automatically reads `src/projects/<slug>/spec.json` to infer `--aspect` (16:9 vs 9:16) and `--fps` (defaults to 60).
- `--text <string>` or `--script-file <path>`: Narration script text.
- `--voice <voice-id>`: EdgeTTS neural voice (zero configuration, open access). Default: `en-US-BrianMultilingualNeural`. Recommended voices:
  - Turkish: `tr-TR-AhmetNeural` (male), `tr-TR-EmelNeural` (female)
  - English: `en-US-BrianMultilingualNeural`, `en-US-ChristopherNeural`, `en-US-JennyNeural`
  - German: `de-DE-FlorianMultilingualNeural`, `de-DE-SeraphinaMultilingualNeural`
- `--rate <rate>`: Speech rate modifier, e.g. `+5%`, `+10%`, `-5%`.
- `--query <string>`: Stock search query for B-roll footage.
- `--aspect <16:9|9:16>`: Video orientation. Inferred automatically from `spec.json`.
- `--fps <int>`: Target composition frame rate (default: `60`).

### Harvest Artifact Outputs
All files are saved directly into `public/harvest/<slug>/` (accessible via Remotion's `staticFile()`) and automatically mirrored into `src/projects/<slug>/harvest/`:
```
public/harvest/<slug>/
  ├── audio.mp3         # Broadcast MP3 narration
  ├── audio.wav         # Uncompressed 16-bit PCM WAV (via ffmpeg)
  ├── words.json        # Sub-millisecond word timings & 60 FPS frame ranges
  ├── broll.mp4         # Optimal resolution video matching aspect ratio (if available)
  ├── broll.json        # Media metadata (dimensions, creator, source, duration)
  └── manifest.json     # Master harvest manifest combining audio, words & broll
```

---

## 4. EDGETTS WORD TIMING & 60 FPS KINETIC SYNC

Unlike traditional Whisper transcription (which suffers from hallucinations and ±0.2s drift), EdgeTTS reports raw `WordBoundary` events directly from the neural speech synthesis engine with 100-nanosecond timestamp precision, completely without API keys.

### Schema of `words.json`:
```json
[
  {
    "index": 0,
    "word": "Gemini",
    "startMs": 100,
    "endMs": 620,
    "startFrame": 6,
    "endFrame": 37,
    "durationFrames": 31
  },
  {
    "index": 1,
    "word": "3.8",
    "startMs": 620,
    "endMs": 1510,
    "startFrame": 37,
    "endFrame": 91,
    "durationFrames": 54
  }
]
```

### Mathematical Guarantee:
$$\text{startFrame} = \operatorname{round}\left(\frac{\text{startMs}}{1000} \times \text{fps}\right)$$
$$\text{endFrame} = \operatorname{round}\left(\frac{\text{endMs}}{1000} \times \text{fps}\right)$$
$$\text{durationFrames} = \max(1, \text{endFrame} - \text{startFrame})$$

Word timings are perfectly deterministic and monotonically non-decreasing.

---

## 5. KEYLESS B-ROLL & LOCAL ASSET WORKFLOW

Stock and background footage works seamlessly without API keys:
1. **Aspect Ratio Enforcement**:
   - For `16:9` (`landscape`): Searches landscape videos and selects $\ge 1920 \times 1080$ renditions.
   - For `9:16` (`portrait`): Searches portrait videos and selects $\ge 1080 \times 1920$ renditions.
2. **Local Storage & SHA-256 Content-Addressed Caching**:
   - Query metadata is cached in `.cache/broll/search/<sha256-query-aspect>.json`.
   - Video files are cached in `.cache/broll/videos/vid-<sha256-url>.mp4` or placed directly in `public/assets/` or `public/harvest/<slug>/broll.mp4`.
   - Once a video is downloaded or added locally, subsequent runs hit the local cache instantly with zero network overhead.
3. **Procedural Background Fallback**:
   - When no external B-Roll video file is present, the pipeline generates a valid `broll.json` marking keyless procedural status.
   - Remotion scenes seamlessly utilize procedural stages (`SpotlightStage`, `AtmosphereParticles`, `SpecularCard`) to deliver broadcast-quality visuals without missing a beat.

---

## 6. CONSUMING HARVESTED ASSETS IN REMOTION

In your project's `Scene.tsx`:

```tsx
import { useCurrentFrame } from 'remotion';
import {
  HarvestVoiceOver,
  HarvestKineticSubtitles,
  HarvestBRollBackground,
  type HarvestManifest,
} from '../../core/harvest';

import harvestManifest from './harvest/manifest.json';

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const manifest = harvestManifest as HarvestManifest;

  return (
    <div className="relative w-full h-full bg-[#050706] overflow-hidden">
      {/* 1. Voice Narration (Keyless, 100% deterministic) */}
      <HarvestVoiceOver manifest={manifest} volume={1.0} />

      {/* 2. B-Roll Video or Procedural Fallback */}
      {manifest.broll?.file ? (
        <HarvestBRollBackground
          src={manifest.broll.file}
          currentFrame={frame}
          projectSlug={manifest.project}
          opacity={0.7}
          kenBurns={true}
        />
      ) : (
        <div className="absolute inset-0 bg-radial from-[#131b2e] to-[#050706]" />
      )}

      {/* 3. Foreground Kinetic Subtitles */}
      <div className="absolute bottom-24 inset-x-0 flex justify-center z-20">
        <HarvestKineticSubtitles
          words={manifest.words}
          currentFrame={frame}
          activeTone="gold"
          maxVisibleWords={6}
        />
      </div>
    </div>
  );
};
```

### Strict GPU Purity Rule
All Remotion primitives (`<HarvestBRollBackground>`, `<HarvestKineticSubtitles>`) adhere strictly to GPU purity:
- Only `transform`, `opacity`, and `filter` are tweened.
- No layout thrashing (no changes to `top`, `left`, `width`, `height`, `margin`, or `padding`).
- No CSS `transition` or `animation` classes. All timing is derived deterministically from `useCurrentFrame()`.

---

## 7. STORYBOARD & BEAT SPEC HARMONIZATION

When voice narration is harvested:
1. Note the total audio duration in frames: `manifest.audio.durationFrames`.
2. Ensure `spec.json`'s total frames match or comfortably contain the audio duration, leaving at least **1.2s (72 frames @ 60 FPS)** at the end for the mandatory **Stillness Hold**.
3. Align storyboard beats (`spec.json` beats) with significant word clusters from `words.json`.
4. Run `pnpm check --project <slug>` to verify AST, craft, and specification integrity.
