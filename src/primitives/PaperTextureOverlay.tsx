import React from 'react';

export interface PaperTextureOverlayProps {
  /** Kağıt tonu / zemin rengi sıcaklığı (Varsayılan: 'warm-parchment') */
  tone?: 'warm-parchment' | 'blackboard-chalk' | 'drafting-vellum';
  /** Prosedürel lif ve gren yoğunluğu (0.0 – 1.0, Varsayılan: 0.35) */
  fiberIntensity?: number;
  /** Mum ışığı / köşe karartma (vignetting) yoğunluğu (0.0 – 1.0, Varsayılan: 0.45) */
  candlelightVignette?: number;
  /** Titreşimli mum alevi efekti katsayısı */
  flickerSpeed?: number;
  /** CSS sınıfı */
  className?: string;
}

/**
 * <PaperTextureOverlay>
 * 
 * Opus Animasyon Rehberi Prompt 03 & 04:
 * "Sıcak krem kâğıt, prosedürel kâğıt dokusu ve lif, mum ışığı radyal gradyanla,
 * kenarlar kararıyor. Mükemmel düz çizgi bilgisayarın imzasıdır, hafif organik
 * doku ise zanaatın."
 * 
 * GPU saflığını bozmadan SVG filtreleri ve radyal gradyan ile katmanlı doku sunar.
 */
export const PaperTextureOverlay: React.FC<PaperTextureOverlayProps> = ({
  tone = 'warm-parchment',
  fiberIntensity = 0.35,
  candlelightVignette = 0.45,
  className = 'w-full h-full absolute inset-0 pointer-events-none select-none z-50',
}) => {
  const getToneStyle = () => {
    switch (tone) {
      case 'blackboard-chalk':
        return {
          vignette: `radial-gradient(circle at 50% 50%, rgba(30, 35, 42, 0) 50%, rgba(5, 7, 10, ${candlelightVignette * 1.2}) 100%)`,
          tint: 'rgba(15, 23, 42, 0.08)',
        };
      case 'drafting-vellum':
        return {
          vignette: `radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0) 60%, rgba(15, 23, 42, ${candlelightVignette * 0.8}) 100%)`,
          tint: 'rgba(241, 245, 249, 0.04)',
        };
      case 'warm-parchment':
      default:
        return {
          vignette: `radial-gradient(circle at 50% 50%, rgba(254, 243, 199, 0.02) 40%, rgba(30, 18, 8, ${candlelightVignette}) 100%)`,
          tint: 'rgba(217, 119, 6, 0.03)',
        };
    }
  };

  const styleConfig = getToneStyle();

  return (
    <div className={className}>
      {/* SVG Prosedürel Lif ve Gren Katmanı */}
      <svg
        className="w-full h-full absolute inset-0 opacity-[var(--fiber-opacity)] mix-blend-overlay"
        style={{ '--fiber-opacity': fiberIntensity } as React.CSSProperties}
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="opus-paper-fibers" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04 0.008"
            numOctaves={3}
            result="noise"
          />
          <feColorMatrix
            type="matrix"
            values="
              0.1 0 0 0 0.8
              0 0.1 0 0 0.75
              0 0 0.1 0 0.65
              0 0 0 0.9 0"
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#opus-paper-fibers)" fill="none" />
      </svg>

      {/* Sıcak Mum Işığı / Kenar Karartma Vignetting */}
      <div
        className="w-full h-full absolute inset-0 mix-blend-multiply"
        style={{
          background: styleConfig.vignette,
        }}
      />

      {/* Ton Yumuşatma */}
      <div
        className="w-full h-full absolute inset-0"
        style={{
          backgroundColor: styleConfig.tint,
        }}
      />
    </div>
  );
};
