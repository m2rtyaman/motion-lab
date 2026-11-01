import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { projectTesseractTo3D } from '../core/camera-math';

export interface TesseractWireframe3DProps {
  /** 4D XW düzlemi dönme hızı çarpanı (Varsayılan: 1.0) */
  speedXW?: number;
  /** 4D ZW düzlemi dönme hızı çarpanı (Varsayılan: 0.7) */
  speedZW?: number;
  /** Perspektif projeksiyon mesafesi d (Varsayılan: 3.0) */
  perspectiveD?: number;
  /** Küp boyutu / ölçeği (Varsayılan: 2.2) */
  scale?: number;
  /** Yakın derinlik (w > 0) sıcak renk (Varsayılan: '#f59e0b' altın) */
  warmColor?: string;
  /** Uzak derinlik (w < 0) soğuk renk (Varsayılan: '#38bdf8' çelik mavi) */
  coldColor?: string;
  /** Köşe nokta boyutu (Varsayılan: 0.08) */
  nodeSize?: number;
  /** Çizgi kalınlığı / saydamlığı */
  opacity?: number;
  /** Kamera pozisyonu */
  cameraPosition?: [number, number, number];
  /** Konteyner CSS sınıfı */
  className?: string;
}

const TesseractMesh: React.FC<{
  speedXW: number;
  speedZW: number;
  perspectiveD: number;
  scale: number;
  warmColor: string;
  coldColor: string;
  nodeSize: number;
  opacity: number;
}> = ({
  speedXW,
  speedZW,
  perspectiveD,
  scale,
  warmColor,
  coldColor,
  nodeSize,
  opacity,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const angleXW = t * speedXW;
  const angleZW = t * speedZW;

  const { vertices3D, edges, wDepths } = useMemo(() => {
    return projectTesseractTo3D(angleXW, angleZW, perspectiveD);
  }, [angleXW, angleZW, perspectiveD]);

  const warmCol = useMemo(() => new THREE.Color(warmColor), [warmColor]);
  const coldCol = useMemo(() => new THREE.Color(coldColor), [coldColor]);

  // 32 Kenar için LineSegments geometrisi ve köşe renkleri
  const { lineGeometry } = useMemo(() => {
    const positions: number[] = [];
    const colors: number[] = [];

    edges.forEach(([i, j]) => {
      const vA = vertices3D[i];
      const vB = vertices3D[j];
      const wA = wDepths[i];
      const wB = wDepths[j];

      positions.push(vA[0] * scale, vA[1] * scale, vA[2] * scale);
      positions.push(vB[0] * scale, vB[1] * scale, vB[2] * scale);

      // w derinliği [-1, 1] aralığını [0, 1] aralığına normalize et
      const factorA = Math.max(0, Math.min(1, (wA + 1.2) / 2.4));
      const factorB = Math.max(0, Math.min(1, (wB + 1.2) / 2.4));

      const colA = coldCol.clone().lerp(warmCol, factorA);
      const colB = coldCol.clone().lerp(warmCol, factorB);

      colors.push(colA.r, colA.g, colA.b);
      colors.push(colB.r, colB.g, colB.b);
    });

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return { lineGeometry: geom };
  }, [vertices3D, edges, wDepths, scale, coldCol, warmCol]);

  return (
    <group>
      {/* 32 Bağlantı Kenarı */}
      <lineSegments geometry={lineGeometry}>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={opacity}
          linewidth={2}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>

      {/* 16 Köşe Düğümü */}
      {vertices3D.map((pos, idx) => {
        const factor = Math.max(0, Math.min(1, (wDepths[idx] + 1.2) / 2.4));
        const col = coldCol.clone().lerp(warmCol, factor);
        return (
          <mesh
            key={idx}
            position={[pos[0] * scale, pos[1] * scale, pos[2] * scale]}
          >
            <sphereGeometry args={[nodeSize * (0.8 + factor * 0.4), 16, 16]} />
            <meshBasicMaterial color={col} />
          </mesh>
        );
      })}
    </group>
  );
};

/**
 * <TesseractWireframe3D>
 * 
 * Opus Animasyon Rehberi Prompt 09:
 * "16 köşe, 32 kenar. Köşeler dördüncü boyutta döndürülür, sonra lambanın duvara
 * gölge düşürmesi gibi üç boyuta indirilir: k = d / (d - w)."
 * 
 * Deterministik 4D Tesseract hiperküp izdüşümü.
 */
export const TesseractWireframe3D: React.FC<TesseractWireframe3DProps> = ({
  speedXW = 0.85,
  speedZW = 0.55,
  perspectiveD = 3.0,
  scale = 1.8,
  warmColor = '#f59e0b',
  coldColor = '#38bdf8',
  nodeSize = 0.07,
  opacity = 0.85,
  cameraPosition = [0, 2.5, 6.5],
  className = 'w-full h-full absolute inset-0 pointer-events-none',
}) => {
  const { width, height } = useVideoConfig();

  return (
    <div className={className}>
      <ThreeCanvas
        width={width}
        height={height}
        camera={{ position: cameraPosition, fov: 45 }}
      >
        <ambientLight intensity={0.5} />
        <TesseractMesh
          speedXW={speedXW}
          speedZW={speedZW}
          perspectiveD={perspectiveD}
          scale={scale}
          warmColor={warmColor}
          coldColor={coldColor}
          nodeSize={nodeSize}
          opacity={opacity}
        />
      </ThreeCanvas>
    </div>
  );
};
