import type { FC, ReactNode } from 'react';

export interface CameraRigProps {
  children: ReactNode;
  /** GSAP selector class for camera movements (default: "camera-rig") */
  rigClassName?: string;
  className?: string;
}

/**
 * CameraRig — 3D Perspektifli Sinematik Yönetmen Kamerası
 * Sahneye yakın çekim (scale: 1.25+), takip panı (x/y) ve 3B eğim (rotateX/Y) kazandırır.
 */
export const CameraRig: FC<CameraRigProps> = ({
  children,
  rigClassName = 'camera-rig',
  className = '',
}) => {
  return (
    <div className="camera-3d-stage relative w-full h-full flex items-center justify-center">
      <div
        className={`${rigClassName} camera-3d-rig relative w-full flex flex-col items-center justify-center ${className}`}
      >
        {children}
      </div>
    </div>
  );
};
