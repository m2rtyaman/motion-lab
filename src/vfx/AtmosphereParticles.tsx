import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';

export interface AtmosphereParticlesProps {
  count?: number;
  variant?: 'embers' | 'dust';
}

interface ParticleSeed {
  id: number;
  startX: number;
  startY: number;
  size: number;
  speedY: number;
  swayAmp: number;
  swayFreq: number;
  phase: number;
}

const generateSeeds = (count: number): ParticleSeed[] =>
  Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: ((i * 137.5) % 94) + 3,
    startY: ((i * 73.1) % 92) + 4,
    size: 4 + (i % 4) * 2.5,
    speedY: 0.14 + (i % 5) * 0.045,
    swayAmp: 14 + (i % 4) * 8,
    swayFreq: 0.04 + (i % 3) * 0.02,
    phase: i * 1.7,
  }));

/**
 * AtmosphereParticles — Deterministik Kor Kıvılcımları (Embers) ve Zindan Tozu
 * Sahneye derinlik ve yaşayan atmosfer katan kare-kilitli partikül sistemi.
 */
export const AtmosphereParticles: FC<AtmosphereParticlesProps> = ({
  count = 24,
  variant = 'embers',
}) => {
  const frame = useCurrentFrame();
  const seeds = generateSeeds(count);

  return (
    <div className="pointer-events-none absolute inset-0 z-25 overflow-hidden">
      {seeds.map((p) => {
        const yPercent = (p.startY - frame * p.speedY + 200) % 100;
        const xOffset = Math.sin(frame * p.swayFreq + p.phase) * p.swayAmp;
        const flicker = 0.4 + 0.55 * Math.abs(Math.sin(frame * 0.15 + p.phase));

        const colorClass =
          variant === 'embers'
            ? p.id % 2 === 0
              ? 'bg-amber-400'
              : 'bg-orange-500'
            : 'bg-stone-300';

        return (
          <span
            key={p.id}
            className={`absolute rounded-full ${colorClass} will-change-transform`}
            style={{
              left: `${p.startX}%`,
              top: `${yPercent}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              opacity: flicker * 0.75,
              transform: `translate3d(${xOffset.toFixed(1)}px, 0, 0)`,
              filter: 'blur(0.8px)',
            }}
          />
        );
      })}
    </div>
  );
};
