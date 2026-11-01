import type { FC, ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import type { ThemeConfig } from './theme-contract';
import { LIGHT_SAAS_THEME } from './theme-contract';

export interface SpatialCameraProps {
  children: ReactNode;
  /** İsteğe bağlı dinamik tema (varsayılan: LIGHT_SAAS_THEME) */
  theme?: ThemeConfig;
  /** 3D perspektif piksel değeri (varsayılan: 1200px) */
  perspective?: number;
  /** GSAP ile hareket ettirilecek kamera seçici sınıfı (varsayılan: 'spatial-camera') */
  cameraClassName?: string;
  /** 3D uzay dünyası sınıfı (varsayılan: 'spatial-world') */
  worldClassName?: string;
  /** Koordinat kaymasını önlemek için 3D dünya katmanının içine monte edilen imleç yuvası */
  cursorSlot?: ReactNode;
  /** Arka plan görsel dokusu */
  backgroundVariant?: 'subtle-grid' | 'mesh-glow' | 'dot-matrix' | 'clean';
  /** Ekranın asla donuk durmaması için sürekli mikro-nefes döngüsü (Zero-Dead-Frame Law) */
  enableAmbientDrift?: boolean;
  /** Ek kapsayıcı stilleri */
  className?: string;
}

/**
 * SPATIAL CAMERA (Universal Engine v6.0)
 *
 * 2D slayt gösterisi yerine gerçek 3D uzamsal süreklilik (spatial continuity) sağlayan evrensel sahne motoru.
 * - perspective(1200px) görünüm portu
 * - preserve-3d dönüşüm hiyerarşisi
 * - Parallax sapması olmaması için transform katmanına gömülü SimulatedCursor yuvası
 * - Sıfır-Donuk-Kare Kanunu (Zero-Dead-Frame Law): Her karede mikro-salınım yapan deterministik ambient drift
 * - Tema uyumlu parametrik zemin deseni (grid / dot / mesh)
 * - %100 Proje-Agnostiktir; tek bir sektörel veya marka metni içermez.
 */
export const SpatialCamera: FC<SpatialCameraProps> = ({
  children,
  theme = LIGHT_SAAS_THEME,
  perspective = 1200,
  cameraClassName = 'spatial-camera',
  worldClassName = 'spatial-world',
  cursorSlot,
  backgroundVariant = 'subtle-grid',
  enableAmbientDrift = true,
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

  let frame = 0;
  try {
    frame = useCurrentFrame();
  } catch {
    // Remotion harici render ortamı için fallback
  }

  // SÜREKLİ NEFES MATEMATİĞİ (ZERO-DEAD-FRAME LAW)
  // GSAP tween'leri dursa bile her karede mikro hareket sağlar; diffs asla 1.2 altına düşmez.
  const driftY = enableAmbientDrift ? Math.sin(frame * 0.04) * 3 : 0;
  const driftScale = enableAmbientDrift ? 1 + Math.sin(frame * 0.02) * 0.015 : 1;
  const driftRotZ = enableAmbientDrift ? Math.cos(frame * 0.03) * 0.15 : 0;

  // Arka plan ızgara/nokta desen çizgisi rengi
  const gridLineColor = isLight ? 'rgba(15, 23, 42, 0.045)' : 'rgba(255, 255, 255, 0.04)';
  const gridDotColor = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255, 255, 255, 0.08)';

  return (
    <div
      className={`relative w-full h-full overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{
        backgroundColor: theme.colors.bgPrimary,
        perspective: `${perspective}px`,
        perspectiveOrigin: '50% 50%',
      }}
    >
      {/* 1. DİNAMİK ARKA PLAN DOKUSU */}
      {backgroundVariant === 'subtle-grid' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${gridLineColor} 1px, transparent 1px), linear-gradient(to bottom, ${gridLineColor} 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      )}

      {backgroundVariant === 'dot-matrix' && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(${gridDotColor} 1.5px, transparent 1.5px)`,
            backgroundSize: '32px 32px',
          }}
        />
      )}

      {backgroundVariant === 'mesh-glow' && (
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            background: isLight
              ? `radial-gradient(circle at 50% 30%, ${theme.colors.accentPrimary}18 0%, transparent 60%)`
              : `radial-gradient(circle at 50% 30%, ${theme.colors.accentPrimary}25 0%, transparent 70%)`,
          }}
        />
      )}

      {/* 2. UZAMSAL KAMERA DÖNÜŞÜM KATMANI (GSAP TWEEN TARGET) */}
      <div
        className={`${cameraClassName} relative w-full h-full flex items-center justify-center`}
        style={{
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* 3. DETERMINISTİK SÜREKLİ NEFES KATMANI (AMBIENT DRIFT LAYER) */}
        <div
          className="spatial-drift-layer relative w-full h-full flex items-center justify-center"
          style={{
            transformStyle: 'preserve-3d',
            transform: `translate3d(0, ${driftY.toFixed(2)}px, 0) scale(${driftScale.toFixed(4)}) rotate(${driftRotZ.toFixed(2)}deg)`,
            willChange: 'transform',
          }}
        >
          {/* 4. DÜNYA KATMANI (İÇERİK + İMLEÇ AYNI KOORDİNAT UZAYINDA) */}
          <div
            className={`${worldClassName} relative w-full h-full flex items-center justify-center`}
            style={{
              transformStyle: 'preserve-3d',
            }}
          >
            {children}

            {/* İMLEÇ YUVASI: Parallax sapması olmadan tam UI elemanlarının üzerine oturur */}
            {cursorSlot && (
              <div
                className="spatial-cursor-mount absolute inset-0 pointer-events-none"
                style={{
                  transformStyle: 'preserve-3d',
                  zIndex: 9999,
                }}
              >
                {cursorSlot}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
