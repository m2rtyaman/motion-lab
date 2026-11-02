import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraKeyframe, CameraState } from './CameraTypes';
import { calculateCameraState } from './cameraInterpolation';
import { FocusSpotlightMask } from './FocusSpotlightMask';

export interface VirtualCameraRigProps {
  children: React.ReactNode;
  /**
   * Kamera hareket anahtar kareleri
   */
  keyframes?: CameraKeyframe[];
  /**
   * Geniş sanal dünya kanvas genişliği (varsayılan: 2400px)
   */
  canvasWidth?: number;
  /**
   * Geniş sanal dünya kanvas yüksekliği (varsayılan: 2400px)
   */
  canvasHeight?: number;
  /**
   * 3D Perspektif mesafesi (px)
   */
  perspective?: number;
  className?: string;
  showFocusMask?: boolean;
}

export const VirtualCameraRig: React.FC<VirtualCameraRigProps> = ({
  children,
  keyframes = [],
  canvasWidth = 2400,
  canvasHeight = 2400,
  perspective = 1400,
  className = '',
  showFocusMask = true,
}) => {
  const frame = useCurrentFrame();
  const { fps, width: viewportWidth, height: viewportHeight } = useVideoConfig();

  const cameraState: CameraState = calculateCameraState(keyframes, frame, fps);

  // Viewport merkezini geniş kanvas merkezine oturtma ve kamera ofsetlerini çıkarma
  const offsetX = -cameraState.x;
  const offsetY = -cameraState.y;

  return (
    <div
      className={`relative w-full h-full overflow-hidden isolate ${className}`}
      style={{
        perspective: `${perspective}px`,
      }}
    >
      {/* 2.5D / 3D Uzamsal Kamera Sahnesi */}
      <div
        className="absolute top-1/2 left-1/2 origin-center"
        style={{
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
          marginLeft: `-${canvasWidth / 2}px`,
          marginTop: `-${canvasHeight / 2}px`,
          transform: `translate3d(${offsetX.toFixed(2)}px, ${offsetY.toFixed(2)}px, 0) scale(${cameraState.scale.toFixed(4)}) rotateX(${cameraState.rotateX.toFixed(2)}deg) rotateY(${cameraState.rotateY.toFixed(2)}deg) rotateZ(${cameraState.rotateZ.toFixed(2)}deg)`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {children}
      </div>

      {/* Dinamik Alan Derinliği & Odak Maskesi */}
      {showFocusMask && (
        <FocusSpotlightMask
          focusX={50}
          focusY={50}
          focusRadius={Math.min(viewportWidth, viewportHeight) * 0.45}
          vignetteOpacity={0.4}
          blurPx={cameraState.dofBlur}
        />
      )}
    </div>
  );
};
