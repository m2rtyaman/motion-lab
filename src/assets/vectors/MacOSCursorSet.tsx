import React from 'react';

export type CursorType = 'pointer' | 'hand' | 'text' | 'crosshair';

export interface MacOSCursorProps {
  type?: CursorType;
  size?: number;
  className?: string;
  showClickRipple?: boolean;
  rippleProgress?: number; // 0 -> 1
  label?: string;
}

export const MacOSCursor: React.FC<MacOSCursorProps> = ({
  type = 'pointer',
  size = 28,
  className = '',
  showClickRipple = false,
  rippleProgress = 0,
  label,
}) => {
  return (
    <div className={`relative inline-block pointer-events-none select-none ${className}`}>
      {/* Tıklama Dalgası */}
      {showClickRipple && rippleProgress > 0 && (
        <div
          className="absolute rounded-full border border-sky-400 bg-sky-400/20"
          style={{
            top: 2,
            left: 2,
            width: size * 2.2,
            height: size * 2.2,
            transform: `translate(-50%, -50%) scale(${rippleProgress})`,
            opacity: 1 - rippleProgress,
          }}
        />
      )}

      {/* İmleç SVG'si */}
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
      >
        {type === 'pointer' && (
          <path
            d="M 3.5 2.5 L 3.5 19.5 L 8.2 15.2 L 12.8 22.8 L 15.5 21.2 L 11.0 13.8 L 17.5 13.8 Z"
            fill="#090d16"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {type === 'hand' && (
          <path
            d="M 9 2 C 7.9 2 7 2.9 7 4 L 7 11.5 L 6.2 10.7 C 5.4 9.9 4.1 9.9 3.3 10.7 C 2.5 11.5 2.5 12.8 3.3 13.6 L 8.5 18.8 C 10.2 20.5 12.5 21.5 14.9 21.5 L 17 21.5 C 19.8 21.5 22 19.3 22 16.5 L 22 11 C 22 9.9 21.1 9 20 9 C 19.7 9 19.5 9.1 19.2 9.2 C 18.9 8.5 18.2 8 17.4 8 C 17.1 8 16.8 8.1 16.5 8.2 C 16.2 7.5 15.5 7 14.7 7 C 14.4 7 14.1 7.1 13.8 7.2 L 13.8 4 C 13.8 2.9 12.9 2 11.8 2 C 11.5 2 11.2 2.1 11 2.2 C 10.7 2.1 10.4 2 10 2 Z"
            fill="#090d16"
            stroke="#ffffff"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        )}

        {type === 'text' && (
          <g stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round">
            <line x1="7" y1="3" x2="17" y2="3" />
            <line x1="12" y1="3" x2="12" y2="21" />
            <line x1="7" y1="21" x2="17" y2="21" />
            <g stroke="#090d16" strokeWidth="1.5">
              <line x1="7" y1="3" x2="17" y2="3" />
              <line x1="12" y1="3" x2="12" y2="21" />
              <line x1="7" y1="21" x2="17" y2="21" />
            </g>
          </g>
        )}
      </svg>

      {/* Kullanıcı Etiketi (Linear / Figma tarzı imleç ismi) */}
      {label && (
        <div
          className="absolute left-6 top-3 px-2 py-0.5 rounded text-[11px] font-semibold text-white whitespace-nowrap shadow-md"
          style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
