/**
 * PROMO 20-SECOND MATH & DYNAMIC WRITE-ON TRAJECTORIES (v1.0)
 *
 * Kaynak: references/PROMO_20S_WORKFLOW_GUIDE.md
 * (20-Second App Promo: Script Funnel, Dynamic Handwriting & Warp Geometry)
 *
 * Canlı el yazısı (Write-On Script), organik warp şekil koordinatları ve
 * dikey panel geçiş süpürmesini deterministik olarak hesaplar.
 */

export interface WriteOnStylusState {
  dashOffset: number;
  totalLength: number;
  stylusX: number;
  stylusY: number;
  stylusAngle: number;
  underlineProgress: number;
}

export interface WarpShapePoint {
  x: number;
  y: number;
}

/**
 * Canlı El Yazısı ve Stylus Uç Koordinatları Hesaplayıcı
 * Yay uzunluğuna göre strokeDashoffset ve kalemin anlık ucunu türetir.
 */
export function computeWriteOnProgress(
  progress: number,
  totalLength: number = 720,
  startPoint: { x: number; y: number } = { x: 120, y: 180 },
  endPoint: { x: number; y: number } = { x: 580, y: 190 }
): WriteOnStylusState {
  const p = Math.max(0, Math.min(1, progress));
  // S-eğrisi ivmelenmesi (yazı akıcılığı)
  const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
  const dashOffset = totalLength * (1 - eased);

  // Kalem ucu doğrusal/kavisli interpolasyonu
  const midY = startPoint.y - Math.sin(eased * Math.PI * 3) * 25;
  const stylusX = startPoint.x + (endPoint.x - startPoint.x) * eased;
  const stylusY = startPoint.y + (endPoint.y - startPoint.y) * eased + (midY - startPoint.y) * 0.4;
  const stylusAngle = -15 + Math.sin(eased * Math.PI * 4) * 12;

  // Alt çizgi yazının %70'inden sonra devreye girer
  const underlineProgress = Math.max(0, Math.min(1, (p - 0.7) / 0.3));

  return {
    dashOffset: Number(dashOffset.toFixed(2)),
    totalLength,
    stylusX: Number(stylusX.toFixed(2)),
    stylusY: Number(stylusY.toFixed(2)),
    stylusAngle: Number(stylusAngle.toFixed(2)),
    underlineProgress: Number(underlineProgress.toFixed(3)),
  };
}

/**
 * Organik Warp Şekil Eğrisi (CTA / Payoff Çerçevesi)
 * 8-noktalı yumuşak dalgalanan Bézier poligonu üretir.
 */
export function computeWarpShapePath(
  frame: number,
  baseRadius: number = 240,
  centerX: number = 400,
  centerY: number = 300,
  amplitude: number = 24
): string {
  const points: WarpShapePoint[] = [];
  const segments = 8;

  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    // Deterministik sinüs dalgası dalgalanması
    const wave = Math.sin(frame * 0.08 + i * 1.3) * amplitude + Math.cos(frame * 0.05 - i * 0.9) * (amplitude * 0.5);
    const r = baseRadius + wave;
    points.push({
      x: centerX + Math.cos(theta) * r,
      y: centerY + Math.sin(theta) * r,
    });
  }

  // Kapalı pürüzsüz SVG yolu oluştur
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < segments; i++) {
    const curr = points[i];
    const next = points[(i + 1) % segments];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += ` Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
  }
  d += ' Z';

  return d;
}

/**
 * Dikey Panel Süpürmesi (Vertical Color Panels Wipe)
 * 09-12s görsel sıfırlaması için basamaklanan dikey panellerin X/Y durumunu hesaplar.
 */
export function computeVerticalPanelWipe(
  progress: number,
  panelIndex: number,
  totalPanels: number = 4
): {
  translateYPercent: number;
  opacity: number;
} {
  const p = Math.max(0, Math.min(1, progress));
  const stagger = (panelIndex / Math.max(1, totalPanels)) * 0.35;
  const localP = Math.max(0, Math.min(1, (p - stagger) / 0.65));

  // Üstten girip aşağıdan çıkan dikey panel
  let translateY = -100;
  if (localP < 0.5) {
    const enterP = localP / 0.5;
    translateY = -100 + 100 * (1 - Math.pow(2, -10 * enterP));
  } else {
    const exitP = (localP - 0.5) / 0.5;
    translateY = 0 + 100 * Math.pow(exitP, 3);
  }

  const opacity = localP > 0 && localP < 1 ? 1 : 0;
  return {
    translateYPercent: Number(translateY.toFixed(2)),
    opacity,
  };
}
