import type { FC, ReactNode } from 'react';

export interface VirtualCanvasProps {
  children: ReactNode;
  /** Sanal masaüstü genişliği (varsayılan: 1440px) */
  width?: number;
  /** Sanal masaüstü yüksekliği (varsayılan: 900px) */
  height?: number;
  className?: string;
}

/**
 * VIRTUAL CANVAS (Universal Engine v6.0)
 *
 * Sanal Tuval ile Çıktı Çözünürlüğünü Ayırma (Virtual Canvas Decoupling)
 * 9:16 dikey veya 1:1 kare videolara masaüstü arayüz sıkıştırıldığında sütunların
 * ezilmesini veya sağdan/soldan kesilmesini (clipping) kesin olarak önler.
 * Arayüz tam masaüstü ölçeğinde (1440x900) render edilir;
 * <SpatialCamera> aktif aksiyonun olduğu koordinata (targetX, targetY) pürüzsüzce pan/zoom yapar.
 * %100 Proje-Agnostiktir.
 */
export const VirtualCanvas: FC<VirtualCanvasProps> = ({
  children,
  width = 1440,
  height = 900,
  className = '',
}) => {
  return (
    <div
      className={`virtual-canvas relative flex items-center justify-center shrink-0 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
};
