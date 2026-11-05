import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';

export interface CapsulePillProps {
  id?: string;
  className?: string;
  label?: string;
  icon?: ReactNode;
  tone?: 'neutral' | 'accent' | 'emerald' | 'amber';
  pulseDot?: boolean;
}

const TONE_STYLES: Record<string, string> = {
  neutral: 'bg-white/[0.04] border-white/[0.12] text-white/90',
  accent: 'bg-indigo-500/[0.12] border-indigo-500/30 text-indigo-200',
  emerald: 'bg-emerald-500/[0.12] border-emerald-500/30 text-emerald-300',
  amber: 'bg-amber-500/[0.12] border-amber-500/30 text-amber-300',
};

export const CapsulePill: FC<CapsulePillProps> = ({
  id,
  className = '',
  label,
  icon,
  tone = 'neutral',
  pulseDot = false,
}) => {
  const frame = useCurrentFrame();
  const pulsePhase = (Math.sin(frame * 0.14) + 1) * 0.5;
  const ringScale = 1 + pulsePhase * 0.85;
  const ringOpacity = 0.65 * (1 - pulsePhase * 0.7);

  return (
    <div
      id={id}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full border backdrop-blur-md font-mono text-[18px] tracking-wide select-none ${TONE_STYLES[tone] || TONE_STYLES.neutral} ${className}`}
    >
      {pulseDot && (
        <span className="relative flex h-3 w-3 items-center justify-center">
          <span
            className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
            style={{
              transform: `scale(${ringScale.toFixed(3)})`,
              opacity: ringOpacity.toFixed(3),
            }}
          />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
      )}
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {label && <span>{label}</span>}
    </div>
  );
};
