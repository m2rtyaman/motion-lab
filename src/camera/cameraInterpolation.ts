import { interpolate, spring, Easing } from 'remotion';
import { CameraKeyframe, CameraState } from './CameraTypes';

const DEFAULT_STATE: CameraState = {
  x: 0,
  y: 0,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  dofBlur: 0,
};

export function calculateCameraState(
  keyframes: CameraKeyframe[],
  frame: number,
  fps: number
): CameraState {
  if (!keyframes || keyframes.length === 0) {
    return DEFAULT_STATE;
  }

  // Kare sırasına göre diz
  const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

  if (frame <= sorted[0].frame) {
    const k = sorted[0];
    return {
      x: k.x ?? 0,
      y: k.y ?? 0,
      scale: k.scale ?? 1,
      rotateX: k.rotateX ?? 0,
      rotateY: k.rotateY ?? 0,
      rotateZ: k.rotateZ ?? 0,
      dofBlur: k.dofBlur ?? 0,
      focalTarget: k.focalTarget,
    };
  }

  const lastKey = sorted[sorted.length - 1];
  if (frame >= lastKey.frame) {
    return {
      x: lastKey.x ?? 0,
      y: lastKey.y ?? 0,
      scale: lastKey.scale ?? 1,
      rotateX: lastKey.rotateX ?? 0,
      rotateY: lastKey.rotateY ?? 0,
      rotateZ: lastKey.rotateZ ?? 0,
      dofBlur: lastKey.dofBlur ?? 0,
      focalTarget: lastKey.focalTarget,
    };
  }

  // Aktif aralığı bul
  let i = 0;
  while (i < sorted.length - 1 && sorted[i + 1].frame <= frame) {
    i++;
  }

  const k1 = sorted[i];
  const k2 = sorted[i + 1];

  const duration = k2.frame - k1.frame || 1;
  const localFrame = frame - k1.frame;
  const easingType = k2.easing ?? 'power3.out';

  let progress = 0;
  if (easingType === 'spring') {
    progress = spring({
      frame: localFrame,
      fps,
      config: { mass: 0.9, damping: 18, stiffness: 85 },
    });
  } else if (easingType === 'expo.inOut') {
    progress = interpolate(localFrame, [0, duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.87, 0, 0.13, 1),
    });
  } else {
    // power3.out varsayılan
    progress = interpolate(localFrame, [0, duration], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.bezier(0.215, 0.61, 0.355, 1),
    });
  }

  const clamped = Math.min(1, Math.max(0, progress));

  const interp = (v1?: number, v2?: number, fallback = 0) => {
    const start = v1 ?? fallback;
    const end = v2 ?? fallback;
    return start + (end - start) * clamped;
  };

  return {
    x: interp(k1.x, k2.x, 0),
    y: interp(k1.y, k2.y, 0),
    scale: interp(k1.scale, k2.scale, 1),
    rotateX: interp(k1.rotateX, k2.rotateX, 0),
    rotateY: interp(k1.rotateY, k2.rotateY, 0),
    rotateZ: interp(k1.rotateZ, k2.rotateZ, 0),
    dofBlur: interp(k1.dofBlur, k2.dofBlur, 0),
    focalTarget: clamped > 0.5 ? k2.focalTarget : k1.focalTarget,
  };
}
