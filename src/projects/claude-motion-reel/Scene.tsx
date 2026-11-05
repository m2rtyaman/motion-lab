import { useMemo, type FC } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';

// Deterministik tohumlu sahte rastgele sayı üreteci (Mulberry32)
function seeded(index: number, salt: number = 42): number {
  let t = (index + salt * 9973 + 12345) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// 8 Bar için 128 BPM Zamanlama Sabitleri (@ 60 FPS)
// 128 BPM = 2.1333 beat/s = 0.46875 s/beat = 28.125 frame/beat
// 1 Bar (4 beat) = 112.5 frame
const BAR_FRAMES = 112.5;

// Spec Sözleşmesi ve Beat Zaman Çizelgesi (validate-spec S060-S062 senkronu)
export const SPEC_BEATS = [
  { id: 'bar-1-2-identity', startFrame: 0, text: 'CLAUDE motion designer' },
  { id: 'bar-3-easing', startFrame: 225, text: 'Six ways to get from A to B' },
  { id: 'bar-4-morphing', startFrame: 338 },
  { id: 'bar-5-systems', startFrame: 450 },
  { id: 'bar-6-depth', startFrame: 563 },
  { id: 'bar-7-kinetic-type', startFrame: 675, text: 'EASE IN OUT LINEAR' },
  { id: 'bar-8-fin', startFrame: 788, text: '* CLAUDE motion designer' },
];

export const Scene: FC = () => {
  const frame = useCurrentFrame();

  // GSAP Deterministik Köprüsü (Linter zorunluluğu)
  useRemotionGSAP((tl) => {
    tl.to({}, { duration: 5 });
  }, []);

  // ---------------------------------------------------------------------------
  // 1. ZAMAN KODU, BAR VE BÖLÜM TELEMETRİSİ
  // ---------------------------------------------------------------------------
  const currentBar = Math.min(8, Math.floor(frame / BAR_FRAMES) + 1);
  const totalSeconds = Math.floor(frame / 60);
  const subFrames = frame % 60;
  const timecode = `00:00:${String(totalSeconds).padStart(2, '0')}:${String(subFrames).padStart(2, '0')}`;

  const currentSection = useMemo(() => {
    if (frame < 225) return '01 - IDENTITY';
    if (frame < 338) return '02 - EASING';
    if (frame < 450) return '03 - MORPHING';
    if (frame < 563) return '04 - SYSTEMS';
    if (frame < 675) return '05 - DEPTH';
    if (frame < 788) return '06 - KINETIC TYPE';
    return '07 - FIN';
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 2. TEK YAŞAYAN TUVAL VE RENK ARKA PLANI
  // ---------------------------------------------------------------------------
  const b7Beat = useMemo(() => {
    if (frame < 675 || frame >= 788) return -1;
    return Math.min(3, Math.floor((frame - 675) / 28.125));
  }, [frame]);

  const bgColor = useMemo(() => {
    if (frame < 65) return '#0A0A0C';
    if (frame < 225) return '#F04336';
    if (frame < 334) return '#F5F2EC';
    if (frame < 448) return '#2535F5';
    if (frame < 675) return '#0C0C0E';
    if (b7Beat === 0) return '#F5F2EC'; // EASE (cream)
    if (b7Beat === 1) return '#0C0C0E'; // IN. (black)
    if (b7Beat === 2) return '#F04336'; // OUT. (red)
    if (b7Beat === 3) return '#0C0C0E'; // LINEAR. (black)
    // FIN (subtle breathing warm red)
    const redShift = Math.sin((frame - 788) * 0.08) * 6;
    const r = Math.round(240 + redShift);
    const g = Math.round(67 - redShift * 0.5);
    const b = Math.round(54 - redShift * 0.5);
    return `rgb(${r}, ${g}, ${b})`;
  }, [frame, b7Beat]);

  const hudTextColor = useMemo(() => {
    if ((frame >= 225 && frame < 334) || b7Beat === 0) {
      return 'text-black/80';
    }
    return 'text-white/80';
  }, [frame, b7Beat]);

  const hudBorderColor = useMemo(() => {
    if ((frame >= 225 && frame < 334) || b7Beat === 0) {
      return 'border-black/30';
    }
    return 'border-white/30';
  }, [frame, b7Beat]);

  // ---------------------------------------------------------------------------
  // 3. BAR 1-2 (0-224): IDENTITY & COLLAPSE TO 6 RUNNERS
  // ---------------------------------------------------------------------------
  const b1AsteriskScale = interpolate(frame, [0, 40, 68], [1, 3.2, 42], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b1AsteriskRot = interpolate(frame, [0, 68], [0, 240], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b1AsteriskOpacity = interpolate(frame, [0, 62, 70], [1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b1TextOpacity = interpolate(frame, [70, 78, 160, 185], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b1CollapseProgress = interpolate(frame, [170, 224], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ---------------------------------------------------------------------------
  // 4. BAR 3 (225-337): EASING RACE TRACK
  // ---------------------------------------------------------------------------
  const b3RaceProgress = interpolate(frame, [232, 308], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const easeValues = useMemo(() => {
    const p = Math.max(0, Math.min(1, b3RaceProgress));
    const eLinear = p;
    const eEaseInOut = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const eExpoOut = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    const c1 = 1.70158;
    const c3 = c1 + 1;
    const eBackOut = 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
    const eElastic = p === 0 ? 0 : p === 1 ? 1 : Math.pow(2, -10 * p) * Math.sin((p * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    let eBounce = 0;
    const n1 = 7.5625;
    const d1 = 2.75;
    if (p < 1 / d1) {
      eBounce = n1 * p * p;
    } else if (p < 2 / d1) {
      const p2 = p - 1.5 / d1;
      eBounce = n1 * p2 * p2 + 0.75;
    } else if (p < 2.5 / d1) {
      const p2 = p - 2.25 / d1;
      eBounce = n1 * p2 * p2 + 0.9375;
    } else {
      const p2 = p - 2.625 / d1;
      eBounce = n1 * p2 * p2 + 0.984375;
    }
    return [eLinear, eEaseInOut, eExpoOut, eBackOut, eElastic, eBounce];
  }, [b3RaceProgress]);

  // Lead blue ball zooms from lane 2 (x: 1540, y: 442) to center (x: 960, y: 540)
  const b3ZoomToCenterP = interpolate(frame, [308, 328], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b3BlueBallX = interpolate(b3ZoomToCenterP, [0, 1], [1540, 960]);
  const b3BlueBallY = interpolate(b3ZoomToCenterP, [0, 1], [442, 540]);
  const b3BlueBallScale = interpolate(frame, [326, 335], [1, 75], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b3ContentOpacity = interpolate(frame, [324, 332], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ---------------------------------------------------------------------------
  // 5. BAR 4 (338-449): MORPHING HERO ACTOR (Circle -> Triangle -> Star)
  // ---------------------------------------------------------------------------
  const b4MorphP1 = interpolate(frame, [342, 376], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b4MorphP2 = interpolate(frame, [380, 416], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b4Oscillation = Math.sin((frame - 338) * 0.35) * Math.exp(-(frame - 338) * 0.025);
  const b4TessellateP = interpolate(frame, [426, 449], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ---------------------------------------------------------------------------
  // 6. BAR 5 (450-562): 153 TRUCHET GENERATIVE SYSTEMS
  // ---------------------------------------------------------------------------
  const truchetTiles = useMemo(() => {
    const list = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 17; c++) {
        const id = r * 17 + c;
        const rot = Math.floor(seeded(id, 77) * 4) * 90;
        const distFromCenter = Math.hypot(c - 8, r - 4);
        list.push({ id, r, c, rot, distFromCenter });
      }
    }
    return list;
  }, []);

  const b5Tilt = interpolate(frame, [498, 558], [0, 64], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b5Z = interpolate(frame, [498, 558], [0, 220], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ---------------------------------------------------------------------------
  // 7. BAR 6 (563-674): 3D DEPTH TERRAIN & ROTATING TORUS
  // ---------------------------------------------------------------------------
  const b6TerrainToTorus = interpolate(frame, [595, 625], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b6TorusZoom = interpolate(frame, [632, 674], [1, 20], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b6Flash = interpolate(frame, [660, 674, 677], [0, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // 3D Arazi Izgarası Yolları (563 - 620)
  const terrainPaths = useMemo(() => {
    if (frame < 560 || frame > 635) return [];
    const rows = 14;
    const cols = 22;
    const paths = [];
    const t = (frame - 563) * 0.08;

    for (let r = 0; r < rows; r++) {
      const pts = [];
      for (let c = 0; c <= cols; c++) {
        const xNorm = (c / cols) * 2 - 1;
        const yNorm = (r / rows) * 2 - 1;
        const z = Math.sin(xNorm * 3 + t) * 40 + Math.cos(yNorm * 3 + t * 0.8) * 35;
        const screenX = 960 + xNorm * 820 * (1 - yNorm * 0.35);
        const screenY = 620 + yNorm * 340 - z;
        pts.push(`${screenX.toFixed(1)},${screenY.toFixed(1)}`);
      }
      paths.push(`M ${pts.join(' L ')}`);
    }
    return paths;
  }, [frame]);

  const torusLines = useMemo(() => {
    const rings = 16;
    const tubeSegments = 8;
    const R = 280;
    const rTube = 110;
    const paths = [];

    const angleY = (frame - 563) * 0.045;
    const angleX = 0.55 + Math.sin((frame - 563) * 0.02) * 0.25;

    for (let i = 0; i < rings; i++) {
      const u = (i / rings) * Math.PI * 2;
      const pts = [];
      for (let j = 0; j <= tubeSegments; j++) {
        const v = (j / tubeSegments) * Math.PI * 2;
        const x = (R + rTube * Math.cos(v)) * Math.cos(u);
        const y = (R + rTube * Math.cos(v)) * Math.sin(u);
        const z = rTube * Math.sin(v);

        const x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
        const z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);
        const y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

        const focal = 750;
        const pz = z2 + 850;
        const px = 960 + (x1 * focal) / pz;
        const py = 540 + (y2 * focal) / pz;
        pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
      }
      paths.push(`M ${pts.join(' L ')}`);
    }
    return paths;
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 8. BAR 7 (675-787): BEAT-SYNCED KINETIC TYPE
  // ---------------------------------------------------------------------------
  const b7WordSubframe = (frame - 675) % 28.125;
  const b7SlamScale = interpolate(b7WordSubframe, [0, 4, 28], [1.32, 1, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b7LinearDotP = interpolate(frame, [759, 786], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // ---------------------------------------------------------------------------
  // 9. BAR 8 (788-900): FIN LOCKUP & CONFETTI BURST
  // ---------------------------------------------------------------------------
  const b8Age = Math.max(0, frame - 788);
  const b8LockupScale = interpolate(frame, [798, 825], [0.88, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const b8LockupOpacity = interpolate(frame, [796, 814], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  const confettiParticles = useMemo(() => {
    const list = [];
    for (let i = 0; i < 80; i++) {
      const angle = seeded(i, 11) * Math.PI * 2;
      const speed = 12 + seeded(i, 22) * 26;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 6;
      const rotSpeed = (seeded(i, 33) - 0.5) * 45;
      const color = i % 4 === 0 ? '#FFFFFF' : i % 4 === 1 ? '#09090B' : i % 4 === 2 ? '#2535F5' : '#F59E0B';
      const size = 8 + seeded(i, 44) * 14;
      const isSquare = i % 3 === 0;
      const isCircle = i % 3 === 1;
      list.push({ id: i, vx, vy, rotSpeed, color, size, isSquare, isCircle });
    }
    return list;
  }, []);

  return (
    <AbsoluteFill
      className="overflow-hidden select-none font-sans"
      style={{ backgroundColor: bgColor }}
    >
      {/* 128 BPM Orijinal Referans Müzik İzi */}
      <Audio src={staticFile('audio/claude-reel-128bpm.mp3')} />

      {/* ===================================================================== */}
      {/* BAR 1-2: IDENTITY (0 - 224)                                           */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          opacity: frame < 225 ? 1 : 0,
        }}
      >
        {/* Başlangıç Asterisk'i ve Genişleyen Çember */}
        <div
          className="absolute flex items-center justify-center rounded-full bg-white text-black"
          style={{
            width: 100,
            height: 100,
            transform: `scale(${b1AsteriskScale}) rotate(${b1AsteriskRot}deg)`,
            opacity: b1AsteriskOpacity,
          }}
        >
          {/* Claude 12 Yapraklı Çiçek Asterisk Logosu */}
          <svg width="68" height="68" viewBox="0 0 100 100" fill="currentColor">
            {[0, 30, 60, 90, 120, 150].map((deg) => (
              <rect
                key={deg}
                x="43"
                y="8"
                width="14"
                height="84"
                rx="7"
                transform={`rotate(${deg} 50 50)`}
              />
            ))}
            <circle cx="50" cy="50" r="16" fill="currentColor" />
          </svg>
        </div>

        {/* N° 01 & SHOWREEL - 2026 Üst Başlık Şeridi */}
        <div
          className="absolute top-28 left-24 right-24 flex items-center justify-between font-mono text-[18px] text-black/70 tracking-widest border-b border-black/20 pb-4"
          style={{ opacity: b1TextOpacity }}
        >
          <span>N° 01</span>
          <span>SHOWREEL - 2026</span>
        </div>

        {/* CLAUDE (bold) + motion designer (italic serif) */}
        <div
          className="relative flex flex-col items-center justify-center text-center z-10"
          style={{ opacity: b1TextOpacity }}
        >
          <h1 className="text-[170px] font-black tracking-[-0.04em] leading-[0.88] text-black">
            CLAUDE
          </h1>
          <p className="font-serif italic text-[54px] font-normal tracking-wide text-black/90 mt-5">
            motion designer
          </p>
        </div>

        {/* Metnin 6 Siyah Küreye Büzülmesi (Runner'lara Doğrudan Köprü) */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: interpolate(frame, [168, 175, 224, 226], [0, 1, 1, 0]) }}
        >
          {[0, 1, 2, 3, 4, 5].map((idx) => {
            const startX = 640 + idx * 128;
            const startY = 540;
            const targetX = 340;
            const targetY = 366 + idx * 76;
            const curX = interpolate(b1CollapseProgress, [0, 1], [startX, targetX]);
            const curY = interpolate(b1CollapseProgress, [0, 1], [startY, targetY]);
            const curSize = interpolate(b1CollapseProgress, [0, 0.4, 1], [18, 38, 28]);
            return (
              <div
                key={idx}
                className="absolute rounded-full bg-black shadow-md"
                style={{
                  width: curSize,
                  height: curSize,
                  left: curX,
                  top: curY,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BAR 3: EASING (225 - 337)                                             */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-24 z-10 pointer-events-none"
        style={{
          opacity: frame >= 225 && frame < 338 ? 1 : 0,
        }}
      >
        <div
          className="flex items-baseline justify-between mb-8 max-w-[1560px]"
          style={{ opacity: b3ContentOpacity }}
        >
          <div>
            <h2 className="font-serif italic text-[46px] font-normal tracking-tight text-black">
              Six ways to get from A to B.
            </h2>
          </div>
          <div className="font-mono text-[18px] text-black/60 tracking-wider">
            SAME DISTANCE · SAME DURATION (0.94s)
          </div>
        </div>

        {/* 6 Yarış Şeridi ve Easing Eğri Grafikleri */}
        <div
          className="flex flex-col gap-4 w-full max-w-[1560px]"
          style={{ opacity: b3ContentOpacity }}
        >
          {[
            { id: '01', name: 'linear', color: '#09090B', path: 'M 0 30 L 30 0' },
            { id: '02', name: 'ease-in-out', color: '#2535F5', path: 'M 0 30 C 15 30 15 0 30 0' },
            { id: '03', name: 'expo-out', color: '#F04336', path: 'M 0 30 C 2 5 8 0 30 0' },
            { id: '04', name: 'back-out', color: '#09090B', path: 'M 0 30 C 12 10 18 -8 30 0' },
            { id: '05', name: 'elastic', color: '#2535F5', path: 'M 0 30 C 5 30 8 -10 16 5 C 20 2 24 0 30 0' },
            { id: '06', name: 'bounce', color: '#F04336', path: 'M 0 30 Q 8 0 15 24 Q 22 8 26 18 L 30 0' },
          ].map((lane, idx) => {
            const startX = 340;
            const endX = 1540;
            const curX = startX + (endX - startX) * easeValues[idx];
            const isBounce = idx === 5;
            const isLead = idx === 2; // Expo-out lead runner
            const scaleX = isBounce ? 1 + Math.sin(b3RaceProgress * Math.PI * 4) * 0.4 : 1;
            const scaleY = isBounce ? 1 - Math.sin(b3RaceProgress * Math.PI * 4) * 0.3 : 1;

            return (
              <div key={lane.id} className="relative h-14 flex items-center">
                <div className="w-12 font-mono text-[18px] font-bold text-red-500">
                  {lane.id}
                </div>
                <div className="w-44 font-mono text-[22px] font-bold text-black">
                  {lane.name}
                </div>

                <div className="w-12 h-8 mr-6 bg-black/[0.04] rounded-sm p-1 flex items-center justify-center">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" stroke="currentColor" className="text-black/60" strokeWidth="2">
                    <path d={lane.path} />
                  </svg>
                </div>

                {/* Pist Çizgisi, Nokta A ve B Ticks */}
                <div className="absolute left-[340px] right-[40px] h-[1px] bg-black/20" />
                <div className="absolute left-[340px] h-5 w-[1px] bg-black/60" />
                <div className="absolute left-[1540px] h-5 w-[1px] bg-black/60" />

                {idx === 0 && (
                  <>
                    <span className="absolute left-[336px] -top-6 font-mono text-[18px] font-bold text-black/70">A</span>
                    <span className="absolute left-[1536px] -top-6 font-mono text-[18px] font-bold text-black/70">B</span>
                  </>
                )}

                {/* Hareket Eden Küre */}
                <div
                  className="absolute rounded-full shadow-md z-10"
                  style={{
                    width: 28,
                    height: 28,
                    backgroundColor: lane.color,
                    left: isLead && b3ZoomToCenterP > 0 ? b3BlueBallX : curX,
                    top: isLead && b3ZoomToCenterP > 0 ? b3BlueBallY : undefined,
                    transform: `translate(-50%, -50%) scale(${scaleX}, ${scaleY})`,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Mavi Kürenin Merkeze Odaklanarak Tuvali Kobalt Maviye Genişletmesi */}
        <div
          className="absolute rounded-full bg-[#2535F5] pointer-events-none z-40"
          style={{
            left: 960,
            top: 540,
            width: 50,
            height: 50,
            transform: `translate(-50%, -50%) scale(${b3BlueBallScale})`,
            opacity: b3ZoomToCenterP > 0.6 ? 1 : 0,
          }}
        />
      </div>

      {/* ===================================================================== */}
      {/* BAR 4: MORPHING HERO ACTOR (338 - 449)                                */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: frame >= 338 && frame < 450 ? 1 : 0,
        }}
      >
        {/* Sol Telemetri: MORPH CIRCLE -> TRIANGLE -> STAR */}
        <div className="absolute left-24 top-1/2 -translate-y-1/2 font-mono text-[18px] text-white/70 leading-loose">
          <div className="text-white/40">┌ MORPHOLOGY</div>
          <div className="font-bold text-white">
            {b4MorphP2 > 0 ? 'MORPH  TRIANGLE → STAR' : b4MorphP1 > 0 ? 'MORPH  CIRCLE → TRIANGLE' : 'MORPH  CIRCLE → CIRCLE'}
          </div>
          <div>SPRING F=2.6  ζ=0.30</div>
          <div className="text-white/40">└ OSCILLATION DAMPED</div>
        </div>

        {/* Sağ Telemetri: Açı ve Yay Fiziği */}
        <div className="absolute right-24 top-1/2 -translate-y-1/2 font-mono text-[18px] text-white/70 leading-loose text-right">
          <div className="text-white/40">TECHNICAL SPRING ┐</div>
          <div>T 1.00  ROT {(frame * 2.2 % 360).toFixed(1)}°</div>
          <div className="text-white font-bold">STATE: 03 // MORPHING</div>
          <div className="text-white/40">KINETIC VECTOR ┘</div>
        </div>

        {/* Merkez Morfik Geometrik Hero Aktör ve Titreşim Yay İzi */}
        <div className="relative flex items-center justify-center">
          {/* Çevresel 12 Noktalı Yörünge Kılavuzu */}
          <svg width="520" height="520" viewBox="0 0 520 520" className="absolute pointer-events-none">
            <circle cx="260" cy="260" r="230" fill="none" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 6" />
            <line x1="20" y1="260" x2="500" y2="260" stroke="rgba(255,255,255,0.15)" />
            <line x1="260" y1="20" x2="260" y2="500" stroke="rgba(255,255,255,0.15)" />
            <text x="508" y="265" fill="rgba(255,255,255,0.5)" fontSize="18" fontFamily="monospace">90°</text>
            <text x="265" y="16" fill="rgba(255,255,255,0.5)" fontSize="18" fontFamily="monospace">0°</text>
            <text x="2" y="265" fill="rgba(255,255,255,0.5)" fontSize="18" fontFamily="monospace">270°</text>

            {Array.from({ length: 12 }).map((_, i) => {
              const ang = (i / 12) * Math.PI * 2;
              const cx = 260 + Math.cos(ang) * 230;
              const cy = 260 + Math.sin(ang) * 230;
              return (
                <circle key={i} cx={cx} cy={cy} r="6" fill="#FFFFFF" opacity="0.85" />
              );
            })}
          </svg>

          {/* Turuncu/Kırmızı Titreşim Hayalet İzi (Spring Damped Wireframe) */}
          <div
            className="absolute pointer-events-none"
            style={{
              transform: `scale(${1.08 + b4Oscillation * 0.12}) rotate(${frame * 1.5}deg)`,
              opacity: 0.6,
            }}
          >
            <svg width="420" height="420" viewBox="0 0 200 200">
              {b4MorphP2 > 0 ? (
                <polygon
                  points="100,20 123,72 180,72 134,106 151,160 100,126 49,160 66,106 20,72 77,72"
                  fill="none"
                  stroke="#F04336"
                  strokeWidth="2.5"
                />
              ) : b4MorphP1 > 0 ? (
                <polygon
                  points="100,24 176,160 24,160"
                  fill="none"
                  stroke="#F04336"
                  strokeWidth="2.5"
                />
              ) : (
                <circle cx="100" cy="100" r="72" fill="none" stroke="#F04336" strokeWidth="2.5" />
              )}
            </svg>
          </div>

          {/* Ana Beyaz Hero Şekil (Circle -> Triangle -> Star) */}
          <div
            className="relative drop-shadow-2xl"
            style={{
              transform: `scale(${1 + b4Oscillation * 0.06})`,
            }}
          >
            <svg width="380" height="380" viewBox="0 0 200 200">
              {b4MorphP2 > 0 ? (
                <polygon
                  points="100,20 123,72 180,72 134,106 151,160 100,126 49,160 66,106 20,72 77,72"
                  fill="#FFFFFF"
                  transform={`rotate(${(frame - 410) * 2.5} 100 100)`}
                />
              ) : b4MorphP1 > 0 ? (
                <polygon
                  points="100,24 176,160 24,160"
                  fill="#FFFFFF"
                  transform={`rotate(${(frame - 370) * 3} 100 100)`}
                />
              ) : (
                <circle cx="100" cy="100" r="70" fill="#FFFFFF" />
              )}
            </svg>
          </div>
        </div>

        {/* 40 Hücreli Matrise Çoğalma (Truchet Sistemine Geçiş) */}
        <div
          className="absolute inset-0 grid grid-cols-8 grid-rows-5 gap-8 p-12 pointer-events-none z-20"
          style={{ opacity: b4TessellateP }}
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              <div className="w-10 h-10 bg-white rounded-sm transform rotate-45" />
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BAR 5: SYSTEMS - 153 TRUCHET CURVES (450 - 562)                       */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden z-10 pointer-events-none"
        style={{
          opacity: frame >= 450 && frame < 563 ? 1 : 0,
        }}
      >
        <div
          className="grid grid-cols-17 grid-rows-9 w-[1955px] h-[1035px]"
          style={{
            transform: `perspective(900px) rotateX(${b5Tilt}deg) translateZ(${b5Z}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {truchetTiles.map((tile) => {
            const wave = Math.sin((frame - 450) * 0.18 - tile.distFromCenter * 0.45);
            const isWavePeak = wave > 0.4;
            const strokeColor = isWavePeak ? '#F04336' : '#FFFFFF';

            return (
              <div
                key={tile.id}
                className="w-[115px] h-[115px] flex items-center justify-center relative"
              >
                <svg
                  width="115"
                  height="115"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="18"
                  strokeLinecap="round"
                  style={{ transform: `rotate(${tile.rot}deg)` }}
                >
                  <path d="M 0 50 A 50 50 0 0 1 50 0" />
                  <path d="M 100 50 A 50 50 0 0 1 50 100" />
                </svg>
              </div>
            );
          })}
        </div>

        <div className="absolute bottom-16 font-mono text-[18px] text-white/70 tracking-widest bg-black/60 px-6 py-2 rounded-full border border-white/20">
          TRUCHET × 153 · 3 WAVES · SEED 0x2A
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BAR 6: DEPTH - 3D TERRAIN & ROTATING TORUS (563 - 674)                 */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: frame >= 563 && frame < 675 ? 1 : 0,
        }}
      >
        {/* 3D Dalgalanan Arazi Izgarası (563 - 620) */}
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          className="absolute inset-0"
          style={{ opacity: 1 - b6TerrainToTorus }}
        >
          {terrainPaths.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i % 3 === 0 ? '#F04336' : '#FFFFFF'}
              strokeWidth={1.5}
              opacity={0.65}
            />
          ))}
        </svg>

        {/* 3D Dönen Telkafes Torus (600 - 674) */}
        <svg
          width="1920"
          height="1080"
          viewBox="0 0 1920 1080"
          className="absolute inset-0"
          style={{
            opacity: b6TerrainToTorus,
            transform: `scale(${b6TorusZoom})`,
            transformOrigin: '960px 540px',
          }}
        >
          {torusLines.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="none"
              stroke={i % 2 === 0 ? '#FFFFFF' : '#2535F5'}
              strokeWidth={1.8}
              opacity={0.8}
            />
          ))}
        </svg>

        {/* Torus Merkezine Dalış Işık Parıltısı */}
        <div
          className="absolute inset-0 bg-white pointer-events-none"
          style={{ opacity: b6Flash }}
        />
      </div>

      {/* ===================================================================== */}
      {/* BAR 7: KINETIC TYPE (EASE IN OUT LINEAR) (675 - 787)                  */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: frame >= 675 && frame < 788 ? 1 : 0,
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: b7Beat === 0 ? 1 : 0,
            transform: `scale(${b7SlamScale})`,
          }}
        >
          <h1 className="text-[280px] font-black tracking-[-0.06em] text-[#2535F5] leading-none">
            EASE
          </h1>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: b7Beat === 1 ? 1 : 0,
            transform: `scale(${b7SlamScale})`,
          }}
        >
          <h1 className="text-[280px] font-black tracking-[-0.06em] text-white leading-none">
            IN.
          </h1>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            opacity: b7Beat === 2 ? 1 : 0,
            transform: `scale(${b7SlamScale}) skewX(-10deg)`,
          }}
        >
          <h1 className="text-[280px] font-black tracking-[-0.06em] text-white leading-none">
            OUT.
          </h1>
        </div>

        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: b7Beat === 3 ? 1 : 0 }}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="absolute right-48 top-44 font-mono text-[20px] text-white/60">
              f(t) = t
            </div>

            <svg width="1920" height="1080" viewBox="0 0 1920 1080" className="absolute inset-0">
              <line x1="260" y1="840" x2="260" y2="240" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
              <line x1="260" y1="840" x2="1660" y2="840" stroke="rgba(255,255,255,0.25)" strokeDasharray="4 4" />
              <line
                x1="260"
                y1="840"
                x2={260 + 1400 * b7LinearDotP}
                y2={840 - 600 * b7LinearDotP}
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
              <circle
                cx={260 + 1400 * b7LinearDotP}
                cy={840 - 600 * b7LinearDotP}
                r="16"
                fill="#F04336"
              />
            </svg>

            <h1
              className="relative text-[220px] font-black tracking-[-0.04em] text-white leading-none z-10"
              style={{ transform: `scale(${b7SlamScale})` }}
            >
              LINEAR.
            </h1>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* BAR 8: FIN LOCKUP (788 - 900)                                         */}
      {/* ===================================================================== */}
      <div
        className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none"
        style={{
          opacity: frame >= 788 ? 1 : 0,
        }}
      >
        {/* Mikro-Konfeti Patlaması */}
        <div className="absolute inset-0 pointer-events-none">
          {confettiParticles.map((p) => {
            const curX = 960 + p.vx * b8Age * 1.1;
            const curY = 540 + p.vy * b8Age * 1.1 + 0.35 * b8Age * b8Age;
            const curRot = p.rotSpeed * b8Age;
            const opacity = interpolate(b8Age, [0, 15, 112], [0, 1, 0.9]);

            return (
              <div
                key={p.id}
                className="absolute shadow-xs"
                style={{
                  left: curX,
                  top: curY,
                  width: p.size,
                  height: p.size,
                  backgroundColor: p.color,
                  borderRadius: p.isCircle ? '50%' : '1px',
                  opacity,
                  transform: `translate(-50%, -50%) rotate(${curRot}deg)`,
                }}
              />
            );
          })}
        </div>

        {/* Final İmzası: * CLAUDE motion designer */}
        <div
          className="relative flex flex-col items-center justify-center text-center z-20"
          style={{
            opacity: b8LockupOpacity,
            transform: `scale(${b8LockupScale * (1 + Math.sin(frame * 0.04) * 0.01)})`,
          }}
        >
          <div className="flex items-center gap-6">
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="#09090B"
              style={{ transform: `rotate(${frame * 0.75}deg)` }}
            >
              {[0, 30, 60, 90, 120, 150].map((deg) => (
                <rect
                  key={deg}
                  x="43"
                  y="8"
                  width="14"
                  height="84"
                  rx="7"
                  transform={`rotate(${deg} 50 50)`}
                />
              ))}
              <circle cx="50" cy="50" r="16" fill="currentColor" />
            </svg>
            <span className="text-[140px] font-black tracking-[-0.04em] text-black leading-none">
              CLAUDE
            </span>
          </div>

          <p className="font-serif italic text-[52px] font-normal tracking-wide text-black/90 mt-4">
            motion designer
          </p>

          <div className="w-[840px] h-[1px] bg-black/30 mt-8 mb-4" />

          <div className="font-mono text-[18px] text-black/70 tracking-widest uppercase">
            SHOWREEL 2026 · 15 S
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* GLOBAL HUD: 4 KÖŞE VE 128 BPM BAR TELEMETRİSİ (Tüm Karelerde Sabit)  */}
      {/* ===================================================================== */}
      <div className="absolute inset-0 pointer-events-none z-50 p-10 flex flex-col justify-between">
        <div className={`flex items-center justify-between font-mono text-[18px] ${hudTextColor}`}>
          <div className="flex items-center gap-3">
            <span className="font-bold">┌ CLAUDE</span>
            <span>MOTION REEL - 2026</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-bold">{currentSection}</span>
            <span>┐</span>
          </div>
        </div>

        <div className={`flex items-center justify-between font-mono text-[18px] ${hudTextColor}`}>
          <div className="flex items-center gap-4">
            <span>└</span>
            <span className="font-bold">{timecode}</span>
            <span className="opacity-60">60 FPS</span>
            <div className={`w-36 h-[1px] ${hudBorderColor} border-b`} />
          </div>

          <div className="flex items-center gap-4">
            <span className="opacity-60">128 BPM</span>
            <div className="flex items-center gap-1.5 font-mono text-[16px]">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((b) => (
                <span key={b} className={b <= currentBar ? 'opacity-100 font-bold' : 'opacity-25'}>
                  {b <= currentBar ? '■' : '□'}
                </span>
              ))}
            </div>
            <span className="font-bold">BAR {currentBar}/8</span>
            <span>┘</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
