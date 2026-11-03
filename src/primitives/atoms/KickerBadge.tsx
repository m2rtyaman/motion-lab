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
  return (
    <div
      id={id}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.12] text-white/70 font-mono text-[18px] uppercase tracking-widest ${className}`}
    >
      {stepNumber && (
        <span className="text-white/40 font-bold">[{stepNumber}]</span>
      )}
      <span>{text}</span>
    </div>
  );
};
