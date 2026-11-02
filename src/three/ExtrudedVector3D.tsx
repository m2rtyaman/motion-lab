import React, { useMemo } from 'react';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import {
  createFrostedGlassMaterial,
  createTitaniumMaterial,
  createEmissiveCoreMaterial,
} from './PBRMaterialLab';

export type MaterialPreset3D = 'frostedGlass' | 'titanium' | 'emissive' | 'chrome';

export interface ExtrudedVector3DProps {
  pathD: string;
  depth?: number;
  bevelThickness?: number;
  bevelSize?: number;
  bevelSegments?: number;
  materialPreset?: MaterialPreset3D;
  color?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

export const ExtrudedVector3D: React.FC<ExtrudedVector3DProps> = ({
  pathD,
  depth = 2.0,
  bevelThickness = 0.5,
  bevelSize = 0.35,
  bevelSegments = 4,
  materialPreset = 'frostedGlass',
  color = '#ffffff',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  // 1. SVG Yolundan THREE.Shape dizisi üretme
  const shapes = useMemo(() => {
    try {
      // SVGLoader createShapes SVG Path d dizesini parse eder
      const path = SVGLoader.createShapes(
        // @ts-expect-error Three.js SVGLoader path objesi veya string uyumu
        typeof pathD === 'string' ? { currentPath: pathD } : pathD
      );
      if (Array.isArray(path) && path.length > 0) return path;

      // Manuel fallback: SVG node parse
      const parser = new SVGLoader();
      const svgData = parser.parse(`<svg><path d="${pathD}" /></svg>`);
      return svgData.paths.flatMap((p) => SVGLoader.createShapes(p));
    } catch {
      // Basit yedek şekil (dikdörtgen)
      const fallbackShape = new THREE.Shape();
      fallbackShape.moveTo(-10, -10);
      fallbackShape.lineTo(10, -10);
      fallbackShape.lineTo(10, 10);
      fallbackShape.lineTo(-10, 10);
      fallbackShape.closePath();
      return [fallbackShape];
    }
  }, [pathD]);

  // 2. Extrude Konfigürasyonu
  const extrudeSettings = useMemo(
    () => ({
      depth,
      bevelEnabled: true,
      bevelThickness,
      bevelSize,
      bevelSegments,
      curveSegments: 16,
    }),
    [depth, bevelThickness, bevelSize, bevelSegments]
  );

  // 3. Geometriyi merkezleme
  const geometry = useMemo(() => {
    const geo = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
    geo.center();
    // Y eksenini SVG koordinatlarına göre ters çevir (SVG'de Y aşağı, Three'de Y yukarı)
    geo.scale(1, -1, 1);
    return geo;
  }, [shapes, extrudeSettings]);

  // 4. Malzeme Seçimi
  const material = useMemo(() => {
    if (materialPreset === 'titanium') {
      return createTitaniumMaterial({ color });
    }
    if (materialPreset === 'emissive') {
      return createEmissiveCoreMaterial({ color, intensity: 2.0 });
    }
    if (materialPreset === 'chrome') {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        metalness: 0.98,
        roughness: 0.05,
      });
    }
    // frostedGlass varsayılan
    return createFrostedGlassMaterial({ color });
  }, [materialPreset, color]);

  const scaleArray: [number, number, number] = Array.isArray(scale)
    ? scale
    : [scale, scale, scale];

  return (
    <mesh
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={scaleArray}
      castShadow
      receiveShadow
    />
  );
};
