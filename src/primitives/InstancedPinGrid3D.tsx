import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface InstancedPinGrid3DProps {
  /** Izgara satır sayısı (Varsayılan: 24) */
  rows?: number;
  /** Izgara sütun sayısı (Varsayılan: 24) */
  cols?: number;
  /** Pinler arası mesafe (Varsayılan: 0.42) */
  spacing?: number;
  /** Dalga frekansı (Varsayılan: 0.85) */
  frequency?: number;
  /** Dalga genliği (Varsayılan: 0.65) */
  amplitude?: number;
  /** Dalga hız çarpanı (Varsayılan: 4.2) */
  speed?: number;
  /** Pin gövde rengi */
  pinColor?: string;
  /** Pin tepe specular rengi */
  pinSpecular?: string;
  /** Metaliklik (0.0 - 1.0) */
  metalness?: number;
  /** Pürüzlülük (0.0 - 1.0) */
  roughness?: number;
  /** Kamera pozisyonu [x, y, z] */
  cameraPosition?: [number, number, number];
  /** Kamera görüş açısı (FOV) */
  cameraFov?: number;
  /** Konteyner stil sınıfı */
  className?: string;
}

/**
 * Three.js sahnesi içinde çalışan deterministik InstancedMesh yöneticisi.
 * Remotion'ın useCurrentFrame() kancasına sıkı sıkıya bağlıdır.
 */
const PinScene: React.FC<{
  rows: number;
  cols: number;
  spacing: number;
  frequency: number;
  amplitude: number;
  speed: number;
  pinColor: string;
  pinSpecular: string;
  metalness: number;
  roughness: number;
}> = ({
  rows,
  cols,
  spacing,
  frequency,
  amplitude,
  speed,
  pinColor,
  pinSpecular,
  metalness,
  roughness,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const totalCount = rows * cols;
  const time = (frame / fps) * speed;

  // Deterministik matris güncellemesi (Render frame anında senkron hesaplanır)
  useLayoutEffect(() => {
    if (!meshRef.current) return;

    let index = 0;
    const halfW = (cols * spacing) / 2;
    const halfH = (rows * spacing) / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * spacing - halfW;
        const z = r * spacing - halfH;
        const dist = Math.sqrt(x * x + z * z);

        // Konsantrik sinüs dalgası
        const wave = Math.sin(dist * frequency - time) * amplitude;
        const yPos = wave;
        const scaleY = Math.max(0.2, 1 + wave * 0.8);

        dummy.position.set(x, yPos, z);
        dummy.scale.set(1, scaleY, 1);
        dummy.rotation.set(0, 0, 0);
        dummy.updateMatrix();

        meshRef.current.setMatrixAt(index, dummy.matrix);
        index++;
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [frame, fps, rows, cols, spacing, frequency, amplitude, speed, dummy, time]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 18, 12]} intensity={2.5} color={pinSpecular} />
      <directionalLight position={[-12, -6, -8]} intensity={0.8} color={pinColor} />
      <pointLight position={[0, 6, 0]} intensity={1.5} color={pinSpecular} />

      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, totalCount]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.08, 0.08, 0.8, 16]} />
        <meshStandardMaterial
          color={pinColor}
          metalness={metalness}
          roughness={roughness}
        />
      </instancedMesh>
    </>
  );
};

/**
 * <InstancedPinGrid3D>
 * 
 * Opus 5.5 / shneural ilhamlı dokunsal 3D Voxel Pin matrisi.
 * Remotion ThreeCanvas ve instancedMesh ile tek GPU çağrısında deterministik 60 FPS çalışır.
 */
export const InstancedPinGrid3D: React.FC<InstancedPinGrid3DProps> = ({
  rows = 24,
  cols = 24,
  spacing = 0.38,
  frequency = 0.95,
  amplitude = 0.55,
  speed = 3.8,
  pinColor = '#181b22',
  pinSpecular = '#c4ff00',
  metalness = 0.9,
  roughness = 0.15,
  cameraPosition = [0, 8, 11],
  cameraFov = 42,
  className = 'w-full h-full absolute inset-0 pointer-events-none',
}) => {
  const { width, height } = useVideoConfig();

  return (
    <div className={className}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: cameraPosition, fov: cameraFov }}
      >
        <PinScene
          rows={rows}
          cols={cols}
          spacing={spacing}
          frequency={frequency}
          amplitude={amplitude}
          speed={speed}
          pinColor={pinColor}
          pinSpecular={pinSpecular}
          metalness={metalness}
          roughness={roughness}
        />
      </ThreeCanvas>
    </div>
  );
};
