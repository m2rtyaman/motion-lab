import React from 'react';
import { ThreeCanvas } from '@remotion/three';
import { useVideoConfig } from 'remotion';

export interface ThreeStageCanvasProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  cameraPosition?: [number, number, number];
  cameraFov?: number;
  className?: string;
  style?: React.CSSProperties;
}

export const ThreeStageCanvas: React.FC<ThreeStageCanvasProps> = ({
  children,
  width,
  height,
  cameraPosition = [0, 0, 45],
  cameraFov = 45,
  className = '',
  style = {},
}) => {
  const videoConfig = useVideoConfig();
  const renderWidth = width ?? videoConfig.width;
  const renderHeight = height ?? videoConfig.height;

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      style={{ width: renderWidth, height: renderHeight, ...style }}
    >
      <ThreeCanvas
        width={renderWidth}
        height={renderHeight}
        camera={{
          position: cameraPosition,
          fov: cameraFov,
          near: 0.1,
          far: 1000,
        }}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      >
        {children}
      </ThreeCanvas>
    </div>
  );
};
