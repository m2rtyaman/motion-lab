import type { FC, ReactNode } from 'react';
import type { ThemeConfig } from '../core/theme-contract';
import { LIGHT_SAAS_THEME } from '../core/theme-contract';

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
  /** Ek kapsayıcı stilleri */
  className?: string;
}

/**
 * SPATIAL CAMERA (v5)
 *
 * 2D slayt gösterisi yerine gerçek 3D uzamsal süreklilik (spatial continuity) sağlayan evrensel sahne motoru.
 * - perspective(1200px) görünüm portu
 * - preserve-3d dönüşüm hiyerarşisi
 * - Parallax sapması olmaması için transform katmanına gömülü SimulatedCursor yuvası
 * - Tema uyumlu parametrik zemin deseni (grid / dot / mesh)
 */
export const SpatialCamera: FC<SpatialCameraProps> = ({
  children,
  theme = LIGHT_SAAS_THEME,
  perspective = 1200,
  cameraClassName = 'spatial-camera',
  worldClassName = 'spatial-world',
  cursorSlot,
  backgroundVariant = 'subtle-grid',
  className = '',
}) => {
  const isLight = theme.surfaceMode === 'light';

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
        {/* 3. DÜNYA KATMANI (İÇERİK + İMLEÇ AYNI KOORDİNAT UZAYINDA) */}
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
  );
};
