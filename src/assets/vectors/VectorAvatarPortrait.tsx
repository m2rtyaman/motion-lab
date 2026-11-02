import React from 'react';

export type AvatarStyle =
  | 'executive'
  | 'engineer'
  | 'designer'
  | 'analyst'
  | 'lead'
  | 'noirAgent';

export interface VectorAvatarPortraitProps {
  styleVariant?: AvatarStyle;
  size?: number;
  className?: string;
  glowColor?: string;
  activeStatus?: 'online' | 'busy' | 'speaking' | 'none';
}

const AVATAR_PALETTES: Record<
  AvatarStyle,
  {
    bgGrad: [string, string];
    skin: string;
    hair: string;
    clothes: string;
    accent: string;
  }
> = {
  executive: {
    bgGrad: ['#3b82f6', '#1d4ed8'],
    skin: '#fcd34d',
    hair: '#1e293b',
    clothes: '#0f172a',
    accent: '#60a5fa',
  },
  engineer: {
    bgGrad: ['#10b981', '#047857'],
    skin: '#fbcfe8',
    hair: '#78350f',
    clothes: '#1e293b',
    accent: '#34d399',
  },
  designer: {
    bgGrad: ['#8b5cf6', '#6d28d9'],
    skin: '#fed7aa',
    hair: '#c084fc',
    clothes: '#312e81',
    accent: '#f43f5e',
  },
  analyst: {
    bgGrad: ['#06b6d4', '#0e7490'],
    skin: '#fef08a',
    hair: '#334155',
    clothes: '#0f766e',
    accent: '#38bdf8',
  },
  lead: {
    bgGrad: ['#f59e0b', '#d97706'],
    skin: '#fed7aa',
    hair: '#18181b',
    clothes: '#1c1917',
    accent: '#fbbf24',
  },
  noirAgent: {
    bgGrad: ['#1e293b', '#090d16'],
    skin: '#94a3b8',
    hair: '#020617',
    clothes: '#0f172a',
    accent: '#38bdf8',
  },
};

export const VectorAvatarPortrait: React.FC<VectorAvatarPortraitProps> = ({
  styleVariant = 'executive',
  size = 56,
  className = '',
  activeStatus = 'none',
}) => {
  const p = AVATAR_PALETTES[styleVariant];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className="w-full h-full rounded-full overflow-hidden"
      >
        <defs>
          <linearGradient id={`bgGrad-${styleVariant}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={p.bgGrad[0]} />
            <stop offset="100%" stopColor={p.bgGrad[1]} />
          </linearGradient>
          <linearGradient id={`specular-${styleVariant}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
          </linearGradient>
        </defs>

        {/* 1. Arka Plan Çemberi */}
        <circle cx="60" cy="60" r="58" fill={`url(#bgGrad-${styleVariant})`} />

        {/* 2. Gövde ve Giysi */}
        <path
          d="M 20 120 C 20 95, 38 82, 60 82 C 82 82, 100 95, 100 120 Z"
          fill={p.clothes}
        />
        {/* Yaka / V-Neck Detayı */}
        <path d="M 50 82 L 60 96 L 70 82 Z" fill={p.accent} opacity="0.85" />

        {/* 3. Boyun */}
        <rect x="52" y="68" width="16" height="18" rx="4" fill={p.skin} />

        {/* 4. Kafa / Yüz */}
        <circle cx="60" cy="52" r="24" fill={p.skin} />

        {/* 5. Saç / Şapka Tarzı */}
        {styleVariant === 'noirAgent' ? (
          /* Fötr Şapka Silüeti */
          <g fill={p.hair}>
            <ellipse cx="60" cy="40" rx="34" ry="6" />
            <path d="M 40 40 C 42 24, 48 20, 60 20 C 72 20, 78 24, 80 40 Z" />
            <path d="M 42 36 L 78 36" stroke={p.accent} strokeWidth="3" />
          </g>
        ) : styleVariant === 'designer' ? (
          /* Dalgalı Modern Saç */
          <path
            d="M 34 50 C 32 30, 44 22, 60 22 C 76 22, 88 30, 86 52 C 86 42, 82 34, 74 32 C 64 30, 52 34, 44 42 C 40 46, 36 50, 34 50 Z"
            fill={p.hair}
          />
        ) : (
          /* Klasik Kısa / Şık Saç */
          <path
            d="M 36 52 C 34 32, 45 24, 60 24 C 75 24, 85 32, 84 52 C 80 38, 72 32, 60 32 C 48 32, 40 38, 36 52 Z"
            fill={p.hair}
          />
        )}

        {/* 6. Gözler & İfade Detayı */}
        {styleVariant !== 'noirAgent' ? (
          <g fill="#0f172a">
            <circle cx="52" cy="52" r="2.5" />
            <circle cx="68" cy="52" r="2.5" />
            <path
              d="M 54 62 Q 60 66, 66 62"
              fill="none"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>
        ) : (
          /* Noir Tarzı Keskin Göz Işığı */
          <g fill="#e0f2fe">
            <polygon points="50,50 56,52 51,54" />
            <polygon points="70,50 64,52 69,54" />
          </g>
        )}

        {/* 7. Tepe Specular Halka */}
        <ellipse
          cx="60"
          cy="24"
          rx="44"
          ry="18"
          fill={`url(#specular-${styleVariant})`}
          opacity="0.6"
        />

        {/* 8. Dış 1px İnce Kenar */}
        <circle
          cx="60"
          cy="60"
          r="58"
          fill="none"
          stroke="rgba(255, 255, 255, 0.25)"
          strokeWidth="2"
        />
      </svg>

      {/* Durum Rozeti */}
      {activeStatus !== 'none' && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-slate-950 ${
            activeStatus === 'online'
              ? 'bg-emerald-500'
              : activeStatus === 'busy'
              ? 'bg-amber-500'
              : 'bg-indigo-500 animate-pulse'
          }`}
          style={{ width: size * 0.26, height: size * 0.26 }}
        />
      )}
    </div>
  );
};
