import React from 'react';
import { useCurrentFrame } from 'remotion';
import { SpecularSurface } from '../materials/SpecularSurface';
import { ThreeStageCanvas } from '../three/ThreeStageCanvas';
import { StudioLightingRig3D } from '../three/StudioLightingRig3D';
import { ExtrudedVector3D, MaterialPreset3D } from '../three/ExtrudedVector3D';
import { SpringStaggerGroup } from '../motion/SpringStaggerGroup';

export interface ExtrudedHeroBadge3DProps {
  title?: string;
  subtitle?: string;
  pathD?: string;
  materialPreset?: MaterialPreset3D;
  color?: string;
  className?: string;
  width?: number | string;
  height?: number;
  delayFrames?: number;
}

// Varsayılan kalkan SVG yolu (doğrulanmış bezier koordinatları)
const DEFAULT_SHIELD_PATH =
  'M 0 -22 C 14 -22 24 -16 26 -6 C 26 14 12 28 0 36 C -12 28 -26 14 -26 -6 C -24 -16 -14 -22 0 -22 Z';

export const ExtrudedHeroBadge3D: React.FC<ExtrudedHeroBadge3DProps> = ({
  title = 'Zero-Knowledge Encryption',
  subtitle = 'Hardware-isolated enclave & cryptographic signature',
  pathD = DEFAULT_SHIELD_PATH,
  materialPreset = 'frostedGlass',
  color = '#38bdf8',
  className = '',
  width = 420,
  height = 360,
  delayFrames = 0,
}) => {
  const frame = useCurrentFrame();

  // Deterministik 3B dönüş: Remotion frame üzerinden hesaplanır (asla delta değil!)
  const rotationY = (frame * 0.025) % (Math.PI * 2);
  const rotationX = Math.sin(frame * 0.03) * 0.15;

  return (
    <SpecularSurface
      preset="frostedDark"
      borderRadius={24}
      className={`overflow-hidden select-none ${className}`}
      style={{ width, minHeight: height }}
    >
      <div className="relative flex flex-col items-center p-6 text-center">
        {/* 1. Üst 3B WebGL Sahnesi */}
        <div className="relative w-full h-[200px]">
          <ThreeStageCanvas
            width={typeof width === 'number' ? width - 48 : 372}
            height={200}
            cameraPosition={[0, 0, 50]}
            cameraFov={38}
          >
            <StudioLightingRig3D
              keyLightColor="#ffffff"
              keyLightIntensity={2.8}
              rimLightColor={color}
              rimLightIntensity={2.2}
            />

            <ExtrudedVector3D
              pathD={pathD}
              depth={2.2}
              bevelThickness={0.6}
              bevelSize={0.4}
              materialPreset={materialPreset}
              color={color}
              rotation={[rotationX, rotationY, 0]}
              scale={1.2}
            />
          </ThreeStageCanvas>
        </div>

        {/* 2. Alt Başlık ve Açıklama (SpringStaggerGroup) */}
        <SpringStaggerGroup delayFrames={delayFrames + 8} staggerFrames={4} className="mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/50 border border-sky-800/40 text-sky-400 text-xs font-semibold tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
            Verified Hardware Enclave
          </div>

          <h3 className="text-xl font-bold text-slate-100 tracking-tight mt-3">
            {title}
          </h3>

          <p className="text-sm text-slate-400 max-w-[320px] mx-auto mt-1 leading-relaxed">
            {subtitle}
          </p>
        </SpringStaggerGroup>
      </div>
    </SpecularSurface>
  );
};
