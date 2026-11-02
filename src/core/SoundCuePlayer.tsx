import React from 'react';
import { Sequence, Audio, staticFile } from 'remotion';

export type SoundCueType =
  | 'movement'
  | 'scene_cut'
  | 'appear'
  | 'click'
  | 'typing'
  | 'build_up'
  | 'reveal'
  | 'success'
  | 'error_or_tech'
  | 'hover_or_small_ui';

export interface SoundCue {
  id?: string;
  frame: number;
  type: SoundCueType;
  file?: string;
  volume?: number;
  durationInFrames?: number;
}

const DEFAULT_KIT_MAP: Record<SoundCueType, string> = {
  movement: 'sfx/kit/whoosh.ogg',
  scene_cut: 'sfx/kit/whoosh.ogg',
  appear: 'sfx/kit/pop.ogg',
  click: 'sfx/kit/click.ogg',
  typing: 'sfx/typing/fs-323432-typing.ogg',
  build_up: 'sfx/kit/riser.ogg',
  reveal: 'sfx/kit/impact.ogg',
  success: 'sfx/kit/pop.ogg',
  error_or_tech: 'sfx/kit/tick.ogg',
  hover_or_small_ui: 'sfx/kit/tick.ogg',
};

const DEFAULT_VOLUME_MAP: Record<SoundCueType, number> = {
  movement: 0.35,
  scene_cut: 0.35,
  appear: 0.45,
  click: 0.5,
  typing: 0.3,
  build_up: 0.4,
  reveal: 0.6,
  success: 0.5,
  error_or_tech: 0.4,
  hover_or_small_ui: 0.25,
};

interface SoundCuePlayerProps {
  cues: SoundCue[];
  masterVolume?: number;
}

/**
 * SoundCuePlayer
 * CC0 ölçülü ses tasarım kütüphanesini (sound-effects becerisi) Remotion zaman çizgisine
 * kare-kilitli olarak bağlayan deterministik bileşen.
 */
export const SoundCuePlayer: React.FC<SoundCuePlayerProps> = ({ cues, masterVolume = 1.0 }) => {
  return (
    <>
      {cues.map((cue, idx) => {
        const filePath = cue.file ?? DEFAULT_KIT_MAP[cue.type] ?? 'sfx/kit/click.ogg';
        const vol = (cue.volume ?? DEFAULT_VOLUME_MAP[cue.type] ?? 0.5) * masterVolume;
        const duration = cue.durationInFrames ?? (cue.type === 'typing' ? 90 : 60);

        return (
          <Sequence
            key={cue.id ?? `${cue.type}-${cue.frame}-${idx}`}
            from={Math.max(0, Math.round(cue.frame))}
            durationInFrames={duration}
          >
            <Audio src={staticFile(filePath)} volume={vol} />
          </Sequence>
        );
      })}
    </>
  );
};
