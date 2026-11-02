import React from 'react';

export interface SecurityShieldLockProps {
  size?: number;
  className?: string;
  isLocked?: boolean;
  shackleOffset?: number; // 0 (kapalı) - 1 (açık/yukarı kalkık)
  glowColor?: string;
  strokeProgress?: number; // 0 - 1 (canlı çizilme efekti için)
  fillOpacity?: number;
}

export const SecurityShieldLock: React.FC<SecurityShieldLockProps> = ({
  size = 64,
  className = '',
  shackleOffset = 0,
  glowColor = '#38bdf8',
  strokeProgress = 1,
  fillOpacity = 0.15,
}) => {
  const shackleY = -shackleOffset * 10;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 120"
        width={size}
        height={size * 1.2}
        className="overflow-visible"
      >
        <defs>
          <filter id="shield-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>

        {/* 1. Dış Kalkan Katmanı */}
        <path
          d="M 50 8 C 72 8, 88 18, 92 36 C 92 72, 70 98, 50 112 C 30 98, 8 72, 8 36 C 12 18, 28 8, 50 8 Z"
          fill={glowColor}
          fillOpacity={fillOpacity}
          stroke={glowColor}
          strokeWidth="3.5"
          strokeLinejoin="round"
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={(1 - strokeProgress) * 100}
          filter="url(#shield-glow)"
        />

        {/* 2. İç İnce Koruma Hattı */}
        <path
          d="M 50 18 C 66 18, 78 26, 82 40 C 82 68, 65 88, 50 100 C 35 88, 18 68, 18 40 C 22 26, 34 18, 50 18 Z"
          fill="none"
          stroke="rgba(255, 255, 255, 0.35)"
          strokeWidth="1.5"
        />

        {/* 3. Kilit Halkası (Shackle - Animasyonlu Yukarı/Aşağı) */}
        <g transform={`translate(0, ${shackleY})`} style={{ transition: 'transform 0.3s ease' }}>
          <path
            d="M 38 56 L 38 42 C 38 35, 43 30, 50 30 C 57 30, 62 35, 62 42 L 62 56"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>

        {/* 4. Kilit Gövdesi */}
        <rect
          x="32"
          y="54"
          width="36"
          height="28"
          rx="6"
          fill="url(#shieldGrad)"
          stroke="#ffffff"
          strokeWidth="2"
        />

        {/* 5. Anahtar Deliği */}
        <circle cx="50" cy="65" r="3" fill="#0f172a" />
        <polygon points="48.5,65 51.5,65 52.5,74 47.5,74" fill="#0f172a" />
      </svg>
    </div>
  );
};
