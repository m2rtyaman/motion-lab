import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SpecularSurface } from '../materials/SpecularSurface';
import { VectorAvatarPortrait, AvatarStyle } from '../assets/vectors/VectorAvatarPortrait';
import { SpringStaggerGroup } from '../motion/SpringStaggerGroup';
import { useSecondaryMotion } from '../motion/useSecondaryMotion';

export interface ParticipantStudioTileProps {
  name?: string;
  role?: string;
  avatarStyle?: AvatarStyle;
  isSpeaking?: boolean;
  audioQuality?: string;
  pingMs?: number;
  className?: string;
  width?: number | string;
  delayFrames?: number;
}

export const ParticipantStudioTile: React.FC<ParticipantStudioTileProps> = ({
  name = 'Sarah Jenkins',
  role = 'Principal Cryptographer',
  avatarStyle = 'executive',
  isSpeaking = true,
  audioQuality = '48kHz Lossless',
  pingMs = 18,
  className = '',
  width = 380,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();
  const { microPulse } = useSecondaryMotion({ settleFrame: delayFrames + 10 });

  // 8 adet dinamik ses spektrum çubuğu (procedural sinüs)
  const barHeights = Array.from({ length: 8 }).map((_, i) => {
    if (!isSpeaking) return 4;
    const wave = Math.sin(frame * 0.25 + i * 0.8) * 0.5 + 0.5;
    return Math.max(4, Math.round(wave * 20));
  });

  return (
    <SpecularSurface
      preset="frostedDark"
      borderRadius={20}
      className={`p-5 select-none ${className}`}
      style={{ width }}
    >
      <SpringStaggerGroup delayFrames={delayFrames} staggerFrames={3}>
        {/* Üst Satır: Avatar, Canlı Ses Radarı ve Durum */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative">
            {/* Konuşurken yayılan canlı radar dalgası */}
            {isSpeaking && (
              <div
                className="absolute -inset-1.5 rounded-full border border-sky-400/40 bg-sky-500/10 transition-transform"
                style={{ transform: `scale(${microPulse})` }}
              />
            )}
            <VectorAvatarPortrait
              styleVariant={avatarStyle}
              size={54}
              activeStatus={isSpeaking ? 'speaking' : 'online'}
            />
          </div>

          {/* Ses Spektrum Barları & Canlı Sinyal */}
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-700/50">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono tracking-wider text-slate-300 uppercase">
                {audioQuality}
              </span>
            </div>

            {/* Dinamik Ekolayzer */}
            <div className="flex items-end gap-1 h-5 px-1">
              {barHeights.map((h, idx) => (
                <div
                  key={idx}
                  className="w-1 rounded-full bg-sky-400 transition-all duration-75"
                  style={{
                    height: `${h}px`,
                    opacity: 0.6 + (h / 20) * 0.4,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Alt Satır: İsim, Ünvan ve Ağ Telemetrisi */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <h4 className="text-base font-semibold text-slate-100 tracking-tight leading-none">
              {name}
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-medium">{role}</p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
              {pingMs}ms
            </span>
          </div>
        </div>
      </SpringStaggerGroup>
    </SpecularSurface>
  );
};
