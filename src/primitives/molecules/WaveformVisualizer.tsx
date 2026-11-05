import type { FC } from 'react';

export interface ProceduralWaveformProps {
  id?: string;
  className?: string;
  barCount?: number;
  height?: number;
  frame?: number;
  color?: string;
}

export const ProceduralWaveform: FC<ProceduralWaveformProps> = ({
  id,
  className = '',
  barCount = 24,
  height = 48,
  frame = 0,
  color = 'bg-white/80',
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-end gap-1.5 px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] backdrop-blur-md select-none ${className}`}
      style={{ height: height + 16 }}
    >
      {Array.from({ length: barCount }).map((_, index) => {
        // Deterministik sinüs dalgası
        const wave = Math.sin(frame * 0.12 + index * 0.45);
        const wave2 = Math.cos(frame * 0.08 - index * 0.25);
        const normalized = (wave * 0.6 + wave2 * 0.4 + 1) / 2;
        const barHeight = Math.max(6, Math.floor(normalized * height));

        return (
          <div
            key={index}
            className={`w-1 rounded-full ${color}`}
            style={{ height: `${barHeight}px` }}
          />
        );
      })}
    </div>
  );
};
