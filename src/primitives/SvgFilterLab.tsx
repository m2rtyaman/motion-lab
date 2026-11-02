import { type FC, type ReactNode } from 'react';

export interface SvgFilterLabProps {
  idPrefix?: string;
  accentPrimary?: string;
  accentSecondary?: string;
}

/**
 * SvgFilterLab — Prosedürel SVG Filtre, Gradyan ve Vektör Efekt Laboratuvarı
 *
 * Sahneye görünmez bir `<svg><defs>...</defs></svg>` bloğu enjekte eder:
 * 1. `#gooey-liquid-morph`   : Codrops tarzı sıvı (gooey) birleşme/ayrılma filtresi (`feGaussianBlur` + `feColorMatrix`).
 * 2. `#specular-rim-glow`    : Kristal iç kenar parlaması ve katmanlı derinlik gölgesi.
 * 3. `#soft-elevation-shadow`: 3D süzülen katmanlar için yumuşak fiziksel gölge.
 * 4. Çok duraklı `<linearGradient>` ve `<radialGradient>` tanımları (`#emerald-brand-grad`, `#obsidian-surface-grad`, `#specular-glass-sheen`, `#crimson-alert-grad`, `#azure-read-grad`).
 */
export const SvgFilterLab: FC<SvgFilterLabProps> = ({
  idPrefix = '',
  accentPrimary = '#25D366',
  accentSecondary = '#00A884',
}) => {
  const p = idPrefix ? `${idPrefix}-` : '';

  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute h-0 w-0 overflow-hidden"
      width="0"
      height="0"
    >
      <defs>
        {/* 1. Gooey Liquid Morph Filter (Codrops / Motion Studio Alpha Threshold) */}
        <filter id={`${p}gooey-liquid-morph`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="11" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 21 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>

        {/* 2. Specular Rim & Ambient Elevation Filter */}
        <filter id={`${p}specular-rim-glow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#000000" floodOpacity="0.48" />
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={accentPrimary} floodOpacity="0.22" />
        </filter>

        {/* 3. Soft 3D Plane Shadow */}
        <filter id={`${p}soft-elevation-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="20" stdDeviation="22" floodColor="#000000" floodOpacity="0.55" />
        </filter>

        {/* 4. Multi-Stop Brand Linear Gradient */}
        <linearGradient id={`${p}emerald-brand-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38EF7D" />
          <stop offset="52%" stopColor={accentPrimary} />
          <stop offset="100%" stopColor={accentSecondary} />
        </linearGradient>

        {/* 5. Deep Obsidian Surface Gradient */}
        <linearGradient id={`${p}obsidian-surface-grad`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#233138" />
          <stop offset="45%" stopColor="#141F26" />
          <stop offset="100%" stopColor="#0B141A" />
        </linearGradient>

        {/* 6. Specular Glass Diagonal Sheen */}
        <linearGradient id={`${p}specular-glass-sheen`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
          <stop offset="42%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
        </linearGradient>

        {/* 7. Crimson Warning Gradient */}
        <linearGradient id={`${p}crimson-alert-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="50%" stopColor="#EF4444" />
          <stop offset="100%" stopColor="#991B1B" />
        </linearGradient>

        {/* 8. Read Receipt Azure Gradient */}
        <linearGradient id={`${p}azure-read-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="55%" stopColor="#53BDEB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* 9. Radial Spotlight Halo */}
        <radialGradient id={`${p}emerald-radial-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accentPrimary} stopOpacity="0.42" />
          <stop offset="65%" stopColor={accentSecondary} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export interface SpeechBubbleTailSVGProps {
  variant: 'incoming' | 'outgoing';
  fill?: string;
  className?: string;
}

/**
 * SpeechBubbleTailSVG — Gerçek WhatsApp Mesaj Balonu Köşe Kuyruğu (`tail-in` / `tail-out`)
 * Resmi WhatsApp Web SVG geometrisine (`8x13` viewBox) sadık vektör kuyruğu.
 */
export const SpeechBubbleTailSVG: FC<SpeechBubbleTailSVGProps> = ({
  variant,
  fill = variant === 'incoming' ? '#202C33' : '#005C4B',
  className = '',
}) => (
  <svg
    className={`pointer-events-none select-none ${className}`}
    width="12"
    height="18"
    viewBox="0 0 8 13"
    fill="none"
  >
    {variant === 'incoming' ? (
      <path
        d="M1.533 3.568L8 12.193V1H2.812C1.042 1 0.474 2.156 1.533 3.568Z"
        fill={fill}
      />
    ) : (
      <path
        d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1Z"
        fill={fill}
      />
    )}
  </svg>
);

export interface GooeyMorphGroupProps {
  children: ReactNode;
  filterId?: string;
  className?: string;
}

/**
 * GooeyMorphGroup — İçindeki SVG veya UI düğümlerini sıvı (gooey) eşik filtresiyle birleştirir.
 */
export const GooeyMorphGroup: FC<GooeyMorphGroupProps> = ({
  children,
  filterId = 'gooey-liquid-morph',
  className = '',
}) => (
  <div
    className={`gooey-morph-group relative ${className}`}
    style={{ filter: `url(#${filterId})` }}
  >
    {children}
  </div>
);
