import type { FC } from 'react';

export interface KickerBadgeProps {
  id?: string;
  className?: string;
  text: string;
  stepNumber?: string;
}

export const KickerBadge: FC<KickerBadgeProps> = ({
  id,
  className = '',
  text,
  stepNumber,
}) => {
  void stepNumber;
  return (
    <div
      id={id}
      className={`inline-flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-white/[0.05] border border-white/[0.12] text-white/75 font-mono text-[18px] uppercase tracking-widest ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-400/80 inline-block" />
      <span>{text}</span>
    </div>
  );
};
