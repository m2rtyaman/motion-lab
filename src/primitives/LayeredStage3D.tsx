import { type CSSProperties, type FC, type ReactNode } from 'react';

export interface LayeredStage3DProps {
  children: ReactNode;
  perspective?: number;
  className?: string;
  rigClassName?: string;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  style?: CSSProperties;
}

/**
 * LayeredStage3D — Gerçek 2.5D/3D Perspektif ve Katman Ayrıştırma Sahnesi (Exploded 3D View)
 *
 * Ordinary Folk / Apple / Linear lansman videolarındaki gibi arayüz katmanlarının
 * Z-ekseninde (`translateZ`) birbirinden ayrışarak gerçek 3D uzayda süzülmesini sağlar.
 */
export const LayeredStage3D: FC<LayeredStage3DProps> = ({
  children,
  perspective = 1400,
  className = '',
  rigClassName = 'stage-3d-rig',
  rotateX = 0,
  rotateY = 0,
  rotateZ = 0,
  scale = 1,
  style,
}) => {
  return (
    <div
      className={`layered-stage-3d relative flex items-center justify-center ${className}`}
      style={{
        perspective: `${perspective}px`,
        perspectiveOrigin: '50% 50%',
        ...style,
      }}
    >
      <div
        className={`${rigClassName} relative flex items-center justify-center`}
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export interface LayerPlaneProps {
  children: ReactNode;
  /** Z-ekseni yüksekliği (px): 0 = ana yüzey, 40..120 = havada süzülen ön katmanlar */
  z?: number;
  className?: string;
  elevationShadow?: boolean;
  specularRim?: boolean;
  style?: CSSProperties;
}

/**
 * LayerPlane — `LayeredStage3D` içinde belirli bir `translateZ(px)` yüksekliğinde süzülen 3D düzlem.
 */
export const LayerPlane: FC<LayerPlaneProps> = ({
  children,
  z = 0,
  className = '',
  elevationShadow = false,
  specularRim = false,
  style,
}) => {
  return (
    <div
      className={`layer-plane-3d ${className}`}
      data-plane-z={z}
      style={{
        transformStyle: 'preserve-3d',
        transform: `translateZ(${z}px)`,
        boxShadow: elevationShadow
          ? `0 ${Math.max(8, Math.round(z * 0.45))}px ${Math.max(20, Math.round(z * 0.95))}px -8px rgba(0, 0, 0, 0.52)`
          : undefined,
        borderTop: specularRim ? '1px solid rgba(255, 255, 255, 0.22)' : undefined,
        willChange: 'transform, opacity',
        ...style,
      }}
    >
      {children}
    </div>
  );
};
