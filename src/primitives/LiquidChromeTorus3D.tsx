import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ThreeCanvas } from '@remotion/three';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export type ChromeGeometryType = 'torus' | 'torusKnot' | 'inflatedStar' | 'sphere';

export interface LiquidChromeTorus3DProps {
  /** Geometri şekli: 'torus' | 'torusKnot' | 'inflatedStar' | 'sphere' */
  shape?: ChromeGeometryType;
  /** Ana metal rengi (Varsayılan: #e2e8f0 ayna gümüş) */
  metalColor?: string;
  /** Krom üzerine vuran kenar/vurgu ışık rengi (Örn: #c4ff00 Acid Lime) */
  accentColor?: string;
  /** Metaliklik katsayısı (0.0 - 1.0, ayna için 0.98) */
  metalness?: number;
  /** Pürüzlülük katsayısı (0.0 - 1.0, ayna için 0.05) */
  roughness?: number;
  /** Şeffaf koruyucu cila katmanı (0.0 - 1.0) */
  clearcoat?: number;
  /** Ölçek çarpanı (Varsayılan: 1.0) */
  scale?: number;
  /** Dönüş hızı çarpanı (Varsayılan: 1.0) */
  rotationSpeed?: number;
  /** X, Y, Z başlangıç rotasyon ofseti */
  initialRotation?: [number, number, number];
  /** Kamera pozisyonu */
  cameraPosition?: [number, number, number];
  /** Kamera FOV */
  cameraFov?: number;
  /** Konteyner CSS sınıfı */
  className?: string;
}

/**
 * Prosedürel 4 Köşeli Şişirilmiş Yıldız Geometrisi Üreticisi
 */
function createInflatedStarGeometry(): THREE.BufferGeometry {
  const geo = new THREE.OctahedronGeometry(1.6, 4);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // 4 eksende şişkinlik ve yumuşak kıvrım
    const len = v.length();
    const nx = Math.abs(v.x);
    const ny = Math.abs(v.y);
    const nz = Math.abs(v.z);
    const pinch = Math.pow(nx * ny * nz, 0.33) * 0.45;
    v.normalize().multiplyScalar(len * (1.1 - pinch));
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Three.js Sahne Çekirdeği
 */
const ChromeScene: React.FC<{
  shape: ChromeGeometryType;
  metalColor: string;
  accentColor: string;
  metalness: number;
  roughness: number;
  clearcoat: number;
  scale: number;
  rotationSpeed: number;
  initialRotation: [number, number, number];
}> = ({
  shape,
  metalColor,
  accentColor,
  metalness,
  roughness,
  clearcoat,
  scale,
  rotationSpeed,
  initialRotation,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const time = (frame / fps) * rotationSpeed;

  // Deterministik dönme açıları
  const rotX = initialRotation[0] + time * 0.45;
  const rotY = initialRotation[1] + time * 0.65;
  const rotZ = initialRotation[2] + Math.sin(time * 0.5) * 0.2;

  // Şekil geometrisini bellekte önbelleğe al
  const geometry = useMemo(() => {
    switch (shape) {
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(1.4, 0.42, 128, 32, 2, 3);
      case 'inflatedStar':
        return createInflatedStarGeometry();
      case 'sphere':
        return new THREE.SphereGeometry(1.5, 64, 64);
      case 'torus':
      default:
        return new THREE.TorusGeometry(1.5, 0.52, 32, 100);
    }
  }, [shape]);

  return (
    <>
      <ambientLight intensity={0.6} />
      {/* Güçlü beyaz ana spot */}
      <directionalLight position={[6, 8, 8]} intensity={3.5} color="#ffffff" />
      {/* Karşıt köşeden vuran renkli rim lazer ışığı */}
      <directionalLight position={[-8, -5, -6]} intensity={4.2} color={accentColor} />
      {/* Derinlik veren alt dolgu */}
      <pointLight position={[0, -6, 2]} intensity={2.0} color="#64748b" />
      {/* Tepeden odak pırıltısı */}
      <pointLight position={[2, 6, 4]} intensity={2.5} color={accentColor} />

      <mesh
        geometry={geometry}
        rotation={[rotX, rotY, rotZ]}
        scale={[scale, scale, scale]}
      >
        <meshPhysicalMaterial
          color={metalColor}
          metalness={metalness}
          roughness={roughness}
          clearcoat={clearcoat}
          clearcoatRoughness={0.06}
          reflectivity={1.0}
        />
      </mesh>
    </>
  );
};

/**
 * <LiquidChromeTorus3D>
 * 
 * shneural "Make It Loud" ve Apple horizon estetiğinde gerçek sıvı krom torus/düğüm/yıldız.
 * Remotion saatine bağlı deterministik dönüş ve gerçek zamanlı ayna yansımaları sunar.
 */
export const LiquidChromeTorus3D: React.FC<LiquidChromeTorus3DProps> = ({
  shape = 'torusKnot',
  metalColor = '#f1f5f9',
  accentColor = '#c4ff00',
  metalness = 0.98,
  roughness = 0.04,
  clearcoat = 1.0,
  scale = 1.0,
  rotationSpeed = 1.0,
  initialRotation = [0.35, 0.2, 0.1],
  cameraPosition = [0, 0, 5.2],
  cameraFov = 44,
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
        <ChromeScene
          shape={shape}
          metalColor={metalColor}
          accentColor={accentColor}
          metalness={metalness}
          roughness={roughness}
          clearcoat={clearcoat}
          scale={scale}
          rotationSpeed={rotationSpeed}
          initialRotation={initialRotation}
        />
      </ThreeCanvas>
    </div>
  );
};
