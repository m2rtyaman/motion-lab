import React from 'react';

export interface ChalkboardStageProps {
  /** Tebeşir tozu ve leke yoğunluğu (0.0 – 1.0, Varsayılan: 0.35) */
  chalkDustIntensity?: number;
  /** Tahta çerçevesi gösterilsin mi? (Ahşap / minimalist sınır) */
  frameBorder?: boolean;
  /** Ana vurgu tebeşir rengi (Varsayılan: '#fde047' tebeşir sarısı) */
  accentColor?: string;
  /** İçerik bileşenleri */
  children?: React.ReactNode;
  /** CSS sınıfı */
  className?: string;
}

/**
 * <ChalkboardStage>
 * 
 * Opus 5.5 Master Rehber — Sayfa 8-9 (Prompt 4: Eğitici Animasyon):
 * "SANAT YÖNÜ: koyu kara tahta arka planı, tebeşir hissi veren hafif pürüzlü çizgi,
 * tek vurgu: sarı. İzleyici formülü bilmeden önce mantığı görmeli."
 * 
 * Eğitici, matematiksel ve bilimsel animasyonlar için tebeşir tozu ve tahta patinası sunar.
 */
export const ChalkboardStage: React.FC<ChalkboardStageProps> = ({
  chalkDustIntensity = 0.35,
  frameBorder = true,
  accentColor = '#fde047',
  children,
  className = 'w-full h-full relative overflow-hidden bg-[#10141a]',
}) => {
  return (
    <div
      className={className}
      style={
        {
          '--chalk-accent': accentColor,
        } as React.CSSProperties
      }
    >
      {/* SVG Tebeşir Gren Filtresi */}
      <svg className="hidden" aria-hidden="true">
        <defs>
          <filter id="chalk-roughness" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.065 0.04"
              numOctaves={3}
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="2.5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Kara Tahta Dokusu & Silgi İzleri Patinası */}
      <div
        className="w-full h-full absolute inset-0 pointer-events-none select-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.5) 100%),
            radial-gradient(ellipse at 80% 20%, rgba(253, 224, 71, 0.02) 0%, transparent 60%)
          `,
        }}
      />

      {/* Tebeşir Tozu Gren Katmanı */}
      <div
        className="w-full h-full absolute inset-0 pointer-events-none opacity-[var(--dust-opacity)] mix-blend-screen"
        style={
          {
            '--dust-opacity': chalkDustIntensity,
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          } as React.CSSProperties
        }
      />

      {/* İsteğe Bağlı Minimalist Çerçeve */}
      {frameBorder && (
        <div className="w-full h-full absolute inset-0 pointer-events-none border-[12px] border-[#1e232b] shadow-inner" />
      )}

      {/* Ana Sahne İçeriği */}
      <div className="w-full h-full relative z-10">{children}</div>
    </div>
  );
};
