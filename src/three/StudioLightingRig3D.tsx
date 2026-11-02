import React from 'react';

export interface StudioLightingRig3DProps {
  keyLightColor?: string;
  keyLightIntensity?: number;
  keyLightPosition?: [number, number, number];
  rimLightColor?: string;
  rimLightIntensity?: number;
  rimLightPosition?: [number, number, number];
  ambientIntensity?: number;
  ambientColor?: string;
}

export const StudioLightingRig3D: React.FC<StudioLightingRig3DProps> = ({
  keyLightColor = '#ffffff',
  keyLightIntensity = 2.4,
  keyLightPosition = [5, 8, 6],
  rimLightColor = '#38bdf8',
  rimLightIntensity = 1.8,
  rimLightPosition = [-6, -4, -4],
  ambientIntensity = 0.35,
  ambientColor = '#ffffff',
}) => {
  return (
    <>
      {/* 1. Ortam Dolgu Işığı */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* 2. Ana Tepe Işığı (Key Light) - Pahları parlatan odaklı spot */}
      <spotLight
        color={keyLightColor}
        intensity={keyLightIntensity}
        position={keyLightPosition}
        angle={0.65}
        penumbra={0.7}
        decay={1.2}
      />

      {/* 3. Kontur / Arkadan Işık (Rim Light) - Sinematik derinlik ve kenar parıltısı */}
      <pointLight
        color={rimLightColor}
        intensity={rimLightIntensity}
        position={rimLightPosition}
        decay={1.5}
      />

      {/* 4. Alt Yumuşak Yansıma Işığı */}
      <directionalLight position={[0, -5, 3]} intensity={0.2} color="#94a3b8" />
    </>
  );
};
