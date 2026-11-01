import React, { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface SplineCamera3DProps {
  /**
   * CatmullRomCurve3 spline kontrol noktaları ([x, y, z][]).
   * Örn: [[0, 15, 30], [8, 5, 12], [0, 2, 6], [0, 0.8, 3]]
   */
  pathPoints: [number, number, number][];
  /**
   * Kameranın bakacağı hedef yol veya sabit koordinat.
   */
  lookAtPoints?: [number, number, number][] | [number, number, number];
  /**
   * Spline ilerleme katsayısı (0.0 – 1.0).
   * Verilmezse frame / durationInFrames ile deterministik olarak otomatik hesaplanır.
   */
  progress?: number;
  /**
   * Eğri parametrizasyonu: 'catmullrom' | 'centripetal' | 'chordal' (Varsayılan: 'catmullrom')
   */
  curveType?: 'catmullrom' | 'centripetal' | 'chordal';
  /**
   * Eğri kapalı döngü mü? (Varsayılan: false)
   */
  closed?: boolean;
}

/**
 * <SplineCamera3D>
 * 
 * Opus Animasyon Rehberi Prompt 08:
 * "Kamera yolu CatmullRomCurve3 ile, t'nin fonksiyonu.
 * Kamera sahne etrafında anlamsız dönmesin; belirlenen ray üzerinde pürüzsüz aksın."
 * 
 * ThreeCanvas içerisinde Remotion zamanlamasına kilitli 60 FPS sinematik kamera rayıdır.
 */
export const SplineCamera3D: React.FC<SplineCamera3DProps> = ({
  pathPoints,
  lookAtPoints = [0, 0, 0],
  progress,
  curveType = 'catmullrom',
  closed = false,
}) => {
  const { camera } = useThree();
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const pathCurve = useMemo(() => {
    if (!pathPoints || pathPoints.length < 2) return null;
    const vectors = pathPoints.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    return new THREE.CatmullRomCurve3(vectors, closed, curveType);
  }, [pathPoints, closed, curveType]);

  const lookAtCurve = useMemo(() => {
    if (Array.isArray(lookAtPoints) && Array.isArray(lookAtPoints[0])) {
      const pts = lookAtPoints as [number, number, number][];
      if (pts.length < 2) return null;
      const vectors = pts.map(([x, y, z]) => new THREE.Vector3(x, y, z));
      return new THREE.CatmullRomCurve3(vectors, false, curveType);
    }
    return null;
  }, [lookAtPoints, curveType]);

  const p = Math.max(
    0,
    Math.min(1, progress !== undefined ? progress : frame / Math.max(1, durationInFrames - 1))
  );

  useLayoutEffect(() => {
    if (!pathCurve) return;
    const pos = pathCurve.getPointAt(p);
    camera.position.set(pos.x, pos.y, pos.z);

    if (lookAtCurve) {
      const target = lookAtCurve.getPointAt(p);
      camera.lookAt(target.x, target.y, target.z);
    } else if (Array.isArray(lookAtPoints) && typeof lookAtPoints[0] === 'number') {
      const [tx, ty, tz] = lookAtPoints as [number, number, number];
      camera.lookAt(tx, ty, tz);
    }
    camera.updateProjectionMatrix();
  }, [camera, pathCurve, lookAtCurve, lookAtPoints, p]);

  return null;
};
