import React from 'react';
import { useCurrentFrame, interpolate, Easing } from 'remotion';

export interface MorphStage {
  id: string;
  startFrame: number;
  endFrame: number;
  width: number;
  height: number;
  borderRadius?: number;
  backgroundColor?: string;
  borderColor?: string;
  x?: number;
  y?: number;
  content: React.ReactNode;
}

export interface ContainerMorphProps {
  /** Geçiş evreleri listesi */
  stages: MorphStage[];
  /** Geçiş süresi (kare cinsinden, varsayılan: 24 kare) */
  transitionFrames?: number;
  /** Konteyner CSS sınıfı */
  className?: string;
}

/**
 * <ContainerMorph>
 * 
 * Opus Animasyon Rehberi Tek Kap İlkesi (Single Container Principle).
 * Sahneler arası zıplamak yerine; tek bir merkezi kabın (buton, kart, panel)
 * kesintisiz olarak boyut, konum, köşe yarıçapı ve dolgu değiştirerek evrilmesini sağlar.
 * İzleyicinin gözü nesneyi takip ettiği için odak asla kaybolmaz.
 * 
 * FLIP (First, Last, Invert, Play) mantığı ile GPU saflığında (scaleX, scaleY, x, y)
 * çalışır; layout-reflow ve CSS transition içermez.
 */
export const ContainerMorph: React.FC<ContainerMorphProps> = ({
  stages,
  transitionFrames = 24,
  className = 'relative flex items-center justify-center pointer-events-none',
}) => {
  const frame = useCurrentFrame();

  if (!stages.length) return null;

  // Aktif veya en yakın evreyi bul
  let currentStageIndex = 0;
  for (let i = 0; i < stages.length; i++) {
    if (frame >= stages[i].startFrame) {
      currentStageIndex = i;
    }
  }

  const currentStage = stages[currentStageIndex];
  const nextStage = stages[currentStageIndex + 1];

  // Temel layout boyutları (reflow engellemek için mevcut evre boyutunda sabitlenir)
  const baseWidth = currentStage.width;
  const baseHeight = currentStage.height;

  // GPU FLIP dönüşüm parametreleri
  let scaleX = 1;
  let scaleY = 1;
  let posX = currentStage.x ?? 0;
  let posY = currentStage.y ?? 0;
  let radius = currentStage.borderRadius ?? 16;
  let bg = currentStage.backgroundColor ?? '#ffffff';
  let border = currentStage.borderColor ?? 'rgba(0,0,0,0.1)';

  let contentOpacity = 1;
  let nextContentOpacity = 0;

  if (nextStage && frame >= nextStage.startFrame - transitionFrames) {
    const progress = interpolate(
      frame,
      [nextStage.startFrame - transitionFrames, nextStage.startFrame],
      [0, 1],
      {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
        easing: Easing.bezier(0.16, 1, 0.3, 1),
      }
    );

    const targetWidth = interpolate(progress, [0, 1], [currentStage.width, nextStage.width]);
    const targetHeight = interpolate(progress, [0, 1], [currentStage.height, nextStage.height]);

    scaleX = targetWidth / (baseWidth || 1);
    scaleY = targetHeight / (baseHeight || 1);

    radius = interpolate(
      progress,
      [0, 1],
      [currentStage.borderRadius ?? 16, nextStage.borderRadius ?? 16]
    );
    posX = interpolate(progress, [0, 1], [currentStage.x ?? 0, nextStage.x ?? 0]);
    posY = interpolate(progress, [0, 1], [currentStage.y ?? 0, nextStage.y ?? 0]);

    contentOpacity = interpolate(progress, [0, 0.45], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    nextContentOpacity = interpolate(progress, [0.55, 1], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });

    if (progress >= 0.5) {
      bg = nextStage.backgroundColor ?? bg;
      border = nextStage.borderColor ?? border;
    }
  }

  // İçeriğin oran bozulmasını önlemek için ters ölçekleme (counter-scale)
  const invScaleX = scaleX !== 0 ? 1 / scaleX : 1;
  const invScaleY = scaleY !== 0 ? 1 / scaleY : 1;

  return (
    <div className={className}>
      <div
        className="relative overflow-hidden shadow-2xl flex items-center justify-center will-change-transform"
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          borderRadius: `${radius / (scaleX || 1)}px / ${radius / (scaleY || 1)}px`,
          backgroundColor: bg,
          border: `1.5px solid ${border}`,
          transform: `translate3d(${posX}px, ${posY}px, 0) scale(${scaleX}, ${scaleY})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Mevcut Evre İçeriği (Deformasyonu önlemek için counter-scale ile sarılı) */}
        <div
          className="absolute inset-0 flex items-center justify-center p-6 w-full h-full pointer-events-auto"
          style={{
            opacity: contentOpacity,
            transform: `scale(${invScaleX}, ${invScaleY})`,
            transformOrigin: 'center center',
          }}
        >
          {currentStage.content}
        </div>

        {/* Sonraki Evre İçeriği (Cross-fade & counter-scale) */}
        {nextStage && nextContentOpacity > 0 && (
          <div
            className="absolute inset-0 flex items-center justify-center p-6 w-full h-full pointer-events-auto"
            style={{
              opacity: nextContentOpacity,
              transform: `scale(${invScaleX}, ${invScaleY})`,
              transformOrigin: 'center center',
            }}
          >
            {nextStage.content}
          </div>
        )}
      </div>
    </div>
  );
};
