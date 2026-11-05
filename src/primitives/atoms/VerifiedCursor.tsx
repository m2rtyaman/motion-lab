import type { FC } from 'react';
import { MacOSCursor, type CursorType } from '../../assets/vectors/MacOSCursorSet';

export interface VerifiedCursorProps {
  id?: string;
  className?: string;
  cursorId?: string;
  label?: string;
  variant?: CursorType;
}

export const VerifiedCursor: FC<VerifiedCursorProps> = ({
  id,
  className = '',
  cursorId = 'active-cursor',
  label,
  variant = 'pointer',
}) => {
  return (
    <div
      id={id || cursorId}
      className={`absolute top-0 left-0 pointer-events-none z-50 flex items-start gap-2 select-none ${className}`}
      style={{ willChange: 'transform' }}
    >
      <div className="relative">
        <MacOSCursor type={variant} size={28} />
      </div>
      {label && (
        <span className="px-3 py-1 rounded bg-black/80 border border-white/20 text-white font-mono text-[18px] backdrop-blur-md shadow-xl whitespace-nowrap">
          {label}
        </span>
      )}
    </div>
  );
};
