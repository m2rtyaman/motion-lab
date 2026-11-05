---
name: audio-motion-conductor
description: Guide for connecting music_map.json beat, downbeat, RMS and spectral data to Remotion GSAP timelines and procedural sound design.
---

# Skill: Audio-Motion Conductor (Sound & Rhythm Orchestration Director)

> **Read `motion-playbook` first.** Transition grammar, theme selection, camera discipline, and forbidden patterns are defined there; it supersedes all else in case of conflict.

---

## 1. ROLE & RESPONSIBILITY
You are the Audio-Motion Conductor transforming music, sound effects, and visual dynamics into a unified deterministic orchestra. In a motion piece, audio is not merely background wallpaper; it is the physical driving force of the visual animation. Every impact, transition, camera punch, and typographic burst locks frame-accurately to the rhythmic map (`music_map.json`).

---

## 2. RHYTHM MAP ARCHITECTURE (`music_map.json`)

Before entering production, audio tracks undergo spectral and transient analysis:

```json
{
  "bpm": 128,
  "timeSignature": [4, 4],
  "fps": 60,
  "downbeats": [0, 112, 225, 337, 450, 562],
  "beats": [0, 28, 56, 84, 112, 140, 168, 196, 225],
  "energyBands": {
    "subBass": [0.1, 0.85, 0.12, 0.95],
    "snareClap": [0.0, 0.0, 0.9, 0.0],
    "highHat": [0.3, 0.4, 0.5, 0.3]
  },
  "rmsEnvelope": [0.15, 0.22, 0.65, 0.88, 0.3]
}
```

---

## 3. FREQUENCY & BEAT MAPPING RULES (Audio-to-Visual Grammar)

| Audio Event (Trigger) | Musical Element | Visual Action | GSAP Recipe |
|---|---|---|---|
| **Downbeat (Bar Start - 1)** | Heavy Kick + Bass | Scene / Beat Transition or Major Camera Push | `transitionWhipPan` / `transitionZoomPunch` |
| **Snare / Clap (2 and 4)** | Sharp Mid-Frequency | Impact Shake & Chromatic Accents | `impactShake` / `chromaticAberrationPulse` |
| **Sub-Bass Drop** | Deep Bass (30–80Hz) | Stage Atmosphere Vibration (`scale: 1.02 -> 1.0`) | `dollyZoomVertigo` / `springSettle` |
| **Hi-Hat / Percussion** | High-Frequency (8kHz+) | Glyph Scramble or Cursor Click Impulses | `scrambleTextDecode` / `cursorClickImpulse` |
| **Silence / Pre-Drop** | Musical Rest | Anticipatory Stillness | 300–500 ms zero camera movement |

---

## 4. DETERMINISTIC TIMELINE INTEGRATION (`useRemotionGSAP`)

In Remotion's video rendering pipeline, audio locks to visuals with `tl.seek(frame / fps)` determinism:

```tsx
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { impactShake, chromaticAberrationPulse } from '../../core/recipes';
import musicMap from './music_map.json';

export const AudioReactiveStage: React.FC = () => {
  const fps = 60;

  const { timeline, scopeRef } = useRemotionGSAP((tl) => {
    // 1. Camera impact on every downbeat frame
    musicMap.downbeats.forEach((downbeatFrame) => {
      const atSeconds = downbeatFrame / fps;
      impactShake(tl, '.stage-camera', atSeconds, 8);
    });

    // 2. Chromatic pulse on snare / clap beats
    musicMap.beats.forEach((beatFrame, index) => {
      // 2nd and 4th beats (snare)
      if (index % 2 === 1) {
        const atSeconds = beatFrame / fps;
        chromaticAberrationPulse(tl, '.hero-metric', atSeconds, 1.05);
      }
    });
  }, [fps]);

  return (
    <div ref={scopeRef} className="relative w-full h-full">
      {/* Scene components */}
    </div>
  );
};
```

---

## 5. SOUND EFFECT (SFX) & MOTION TIMING RULES

1. **Audio Born With Motion, Never Trailing:**
   - The moment a card impacts (`y: 0`), trigger the resonant impact sound ("thud / impact").
   - Playing the sound 3 frames later creates noticeable latency and destroys punch.
2. **Whip-Pan Whoosh Dynamics:**
   - Start the crescendo **3–5 frames before** the whip transition begins, peaking exactly at the boundary crossing between scenes.
3. **Muted UI Clicks:**
   - When an odometer or counter (`rollingNumberOdometer`) spins, generate micro-clicks on each digit rollover via procedural sound generation.
