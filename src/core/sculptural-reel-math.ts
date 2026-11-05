/**
 * SCULPTURAL MOTION REEL MATH & GEOMETRIC CALCULATIONS (v1.0)
 *
 * Kaynak: references/SCULPTURAL_REEL_GUIDE.md
 * (Gemini Omni Flash 10-Second Sculptural Motion Reel Paradigm)
 *
 * Çapraz renk süpürmesi (Diagonal Sweep), basamaklanan 3D disk perspektifi (Disc Cascade)
 * ve pahlı metalik halka matrislerini deterministik olarak hesaplar.
 */

export interface DiagonalSweepPolygon {
  pathD: string;
  fillOpacity: number;
}

export interface CascadeDiscState {
  index: number;
  x: number;
  y: number;
  z: number;
  scale: number;
  rotation: number;
  opacity: number;
}

/**
 * Çapraz Renk Geçiş Bandı Poligonu (Diagonal Colored Bands Sweep)
 * Açılı (35-45 derece) hareket eden şeritlerin koordinatlarını hesaplar.
 */
export function computeDiagonalSweepPath(
  progress: number,
  bandIndex: number,
  totalBands: number,
  width: number = 1920,
  height: number = 1080
): DiagonalSweepPolygon {
  const p = Math.max(0, Math.min(1, progress));
  const angleRad = (38 * Math.PI) / 180;
  const slope = Math.tan(angleRad);
  
  // Bandın ekranı tarama ofseti
  const bandOffset = (bandIndex / Math.max(1, totalBands)) * 0.35;
  const localP = Math.max(0, Math.min(1, (p - bandOffset) / 0.65));
  
  // -width'den width * 2'ye doğru kayan X koordinatı
  const totalTravel = width + height / slope;
  const currentX = -height / slope + totalTravel * localP;
  const bandThickness = (width / totalBands) * 1.2;

  const x0 = currentX;
  const x1 = currentX + bandThickness;
  const x2 = x1 + height / slope;
  const x3 = x0 + height / slope;

  const pathD = `M ${x0.toFixed(1)} 0 L ${x1.toFixed(1)} 0 L ${x2.toFixed(1)} ${height} L ${x3.toFixed(1)} ${height} Z`;
  const fillOpacity = Math.sin(localP * Math.PI) * 0.92;

  return { pathD, fillOpacity: Number(fillOpacity.toFixed(3)) };
}

/**
 * Perspektif Disk Basamaklanması (Perspective Disc Cascade)
 * 3D uzayda basamaklanan n adet diskin koordinat ve sönümünü hesaplar.
 */
export function computeDiscCascadePositions(
  count: number,
  progress: number,
  spacing: number = 55,
  elevationZ: number = 28
): CascadeDiscState[] {
  const p = Math.max(0, Math.min(1, progress));

  return Array.from({ length: count }).map((_, i) => {
    // Kademeli gecikme
    const stagger = (i / Math.max(1, count - 1)) * 0.4;
    const itemP = Math.max(0, Math.min(1, (p - stagger) / 0.6));

    // Sönümlü yerleşim (expo.out)
    const eased = 1 - Math.pow(2, -10 * itemP);
    const x = (i - (count - 1) / 2) * spacing * eased;
    const y = (i - (count - 1) / 2) * (spacing * 0.35) * eased;
    const z = (count - i) * elevationZ * eased;
    const scale = 0.8 + 0.2 * eased;
    const rotation = -15 + i * 4 * eased;
    const opacity = itemP > 0.05 ? 1 : itemP * 20;

    return {
      index: i,
      x: Number(x.toFixed(1)),
      y: Number(y.toFixed(1)),
      z: Number(z.toFixed(1)),
      scale: Number(scale.toFixed(3)),
      rotation: Number(rotation.toFixed(1)),
      opacity: Number(opacity.toFixed(2)),
    };
  });
}

/**
 * Pahlı Şampanya Halka 3D Matrisi
 */
export function computeBeveledRingTransform(
  frame: number,
  baseAngleX: number = 24,
  baseAngleY: number = -18
): {
  transform: string;
  lightReflectionAngle: number;
} {
  const rotY = baseAngleY + Math.sin(frame * 0.04) * 16;
  const rotX = baseAngleX + Math.cos(frame * 0.03) * 10;
  const rotZ = Math.sin(frame * 0.02) * 8;
  const lightReflectionAngle = ((frame * 1.5) % 360);

  return {
    transform: `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) rotateZ(${rotZ.toFixed(2)}deg)`,
    lightReflectionAngle: Number(lightReflectionAngle.toFixed(1)),
  };
}
