import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface MobiusTypeRibbon3DProps {
  /** Şerit üzerinde akan metin */
  text?: string;
  /** Metin rengi (Varsayılan: #000000) */
  textColor?: string;
  /** Şerit zemin rengi (Varsayılan: #c4ff00 Acid Lime) */
  bgColor?: string;
  /** Silindirik şerit yarıçapı */
  radius?: number;
  /** Şerit yüksekliği */
  height?: number;
  /** Dönüş hızı çarpanı */
  speed?: number;
  /** 3D eğim açıları [x, y, z] */
  tilt?: [number, number, number];
  /** Kamera pozisyonu */
  cameraPosition?: [number, number, number];
  /** Kamera görüş açısı */
  cameraFov?: number;
  /** Konteyner CSS sınıfı */
  className?: string;
}

/**
 * Metin şeridini dinamik bir Three.js CanvasTexture haline getirir.
 */
function createRibbonTexture(
  text: string,
  textColor: string,
  bgColor: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = textColor;
    ctx.font = 'bold 88px "Inter", "Helvetica Neue", sans-serif';
    ctx.textBaseline = 'middle';
    ctx.letterSpacing = '2px';

    // Metni şerit boyunca 3 kez tekrarla
    const repeatText = `${text}  •  ${text}  •  ${text}  •  `;
    ctx.fillText(repeatText.toUpperCase(), 32, canvas.height / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

/**
 * Deterministik 3D Şerit Sahnesi
 */
const RibbonScene: React.FC<{
  text: string;
  textColor: string;
  bgColor: string;
  radius: number;
  height: number;
  speed: number;
  tilt: [number, number, number];
}> = ({ text, textColor, bgColor, radius, height, speed, tilt }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const texture = useMemo(
    () => createRibbonTexture(text, textColor, bgColor),
    [text, textColor, bgColor]
  );

  const time = (frame / fps) * speed;
  const rotY = time * 0.75;

  return (
    <>
      <ambientLight intensity={1.0} />
      <directionalLight position={[0, 10, 10]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[0, -10, -10]} intensity={0.8} color="#ffffff" />

      <group rotation={[tilt[0], tilt[1], tilt[2]]}>
        <mesh rotation={[0, rotY, 0]}>
          <cylinderGeometry
            args={[radius, radius, height, 64, 1, true]}
          />
          <meshBasicMaterial
            map={texture}
            side={THREE.DoubleSide}
            transparent={false}
          />
        </mesh>
      </group>
    </>
  );
};

/**
 * <MobiusTypeRibbon3D>
 * 
 * shneural tarzı 3D uzayda dönen, eğilen ve kamerayı saran sonsuz kinetik tipografi şeridi.
 * Deterministik Remotion saatine kilitli, 60 FPS GPU-dostu şerit dönüşü sunar.
 */
export const MobiusTypeRibbon3D: React.FC<MobiusTypeRibbon3DProps> = ({
  text = 'TYPE IN MOTION • LET THE LETTERS DANCE',
  textColor = '#090a0d',
  bgColor = '#c4ff00',
  radius = 2.6,
  height = 0.72,
  speed = 1.0,
  tilt = [0.42, 0.1, -0.28],
  cameraPosition = [0, 0, 4.6],
  cameraFov = 48,
  className = 'w-full h-full absolute inset-0 pointer-events-none',
}) => {
  const { width, height: vidHeight } = useVideoConfig();

  return (
    <div className={className}>
      <ThreeCanvas
        width={width}
        height={vidHeight}
        camera={{ position: cameraPosition, fov: cameraFov }}
      >
        <RibbonScene
          text={text}
          textColor={textColor}
          bgColor={bgColor}
          radius={radius}
          height={height}
          speed={speed}
          tilt={tilt}
        />
      </ThreeCanvas>
    </div>
  );
};
