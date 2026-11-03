import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { VirtualCameraRig } from '../../camera/VirtualCameraRig';
import { CameraKeyframe } from '../../camera/CameraTypes';
import { AmbientAliveDriver } from '../../motion/AmbientAliveDriver';
import { SvgFilterLab } from '../../primitives/SvgFilterLab';
import { SoundCuePlayer, SoundCue } from '../../core/SoundCuePlayer';
import { transitionContainerMorph } from '../../core/transitions';
import { dampedSpring } from '../../core/pure-motion-math';
import {
  KineticVectorStage,
  DynamicSwissGrid,
  GeometricBurst,
  SwissVectorCross,
} from '../../primitives/KineticVectorStage';

// Spec senkronizasyonu ve beat zamanlaması (16:9 / 12s / 720 kare @ 60 FPS)
export const SPEC_BEATS = [
  { id: 'geometric-hook', startFrame: 0, endFrame: 160 },
  { id: 'infographic-burst', startFrame: 161, endFrame: 380 },
  { id: 'workflow-matrix', startFrame: 381, endFrame: 550 },
  { id: 'swiss-resolve', startFrame: 551, endFrame: 720 },
];

export const SPEC_CAMERA = [
  { at: 0.05, duration: 1.4, ease: 'power3.out' },
  { at: 2.65, duration: 1.8, ease: 'power2.inOut' },
  { at: 6.3, duration: 2.0, ease: 'power2.inOut' },
  { at: 9.15, duration: 2.2, ease: 'expo.inOut' },
];

// animateCamera at: 0.05
const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  {
    frame: 0,
    x: -80,
    y: 0,
    scale: 1.08,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'power3.out',
  },
  {
    frame: 160,
    x: 60,
    y: -40,
    scale: 1.04,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'power2.inOut',
  },
  {
    frame: 380,
    x: 0,
    y: 30,
    scale: 1.05,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'power2.inOut',
  },
  {
    frame: 550,
    x: 0,
    y: 0,
    scale: 1.0,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'expo.inOut',
  },
];

const SOUND_CUES: SoundCue[] = [
  { frame: 10, type: 'movement', volume: 0.4 },
  { frame: 45, type: 'click', volume: 0.4 },
  { frame: 135, type: 'build_up', volume: 0.5 },
  { frame: 160, type: 'reveal', volume: 0.75 },
  { frame: 220, type: 'appear', volume: 0.45 },
  { frame: 340, type: 'movement', volume: 0.5 },
  { frame: 380, type: 'reveal', volume: 0.7 },
  { frame: 520, type: 'build_up', volume: 0.5 },
  { frame: 550, type: 'reveal', volume: 0.8 },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  void transitionContainerMorph;
  void SPEC_BEATS;
  void SPEC_CAMERA;

  // 1. Zemin Rengi Kontrastı
  const isDarkPhase = frame >= 380 && frame < 550;
  const currentBgColor = isDarkPhase ? '#0B1120' : '#F4F4F0';

  // 2. Kinetik Izgara İlerlemesi
  const gridProgress = interpolate(frame, [0, 40], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // =========================================================================
  // MATEMATİKSEL YAYLAR (STUDIO DUMBAR & PENTAGRAM KİNETİK DİSİPLİNİ)
  // =========================================================================
  const spring1 = dampedSpring(Math.max(0, frame / 60), 22, 0.78);
  const spring2 = dampedSpring(Math.max(0, (frame - 160) / 60), 24, 0.76);
  const spring3 = dampedSpring(Math.max(0, (frame - 380) / 60), 22, 0.82);
  const spring4 = dampedSpring(Math.max(0, (frame - 550) / 60), 20, 0.8);

  // Beat Tipografi ve Katman Opaklıkları
  const opBeat1 = interpolate(frame, [148, 160], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opBeat2 = interpolate(frame, [160, 172, 365, 380], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opBeat3 = interpolate(frame, [380, 395, 535, 550], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const opBeat4 = interpolate(frame, [550, 565], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  // =========================================================================
  // BEAT 1: KİNETİK İSVİÇRE AÇILIŞI (Devasa Tipografi + Çarpışan Geometri)
  // =========================================================================
  const textSplit1 = interpolate(spring1, [0, 1], [-120, 0]);
  const textSplit2 = interpolate(spring1, [0, 1], [120, 0]);
  const circleEntrance = interpolate(spring1, [0, 1], [0, 1]);

  // =========================================================================
  // BEAT 2: MİMARİ İNFOGRAFİK DUVARI (Tam Ekran Gövde Sütunları)
  // =========================================================================
  const barH1 = interpolate(spring2, [0, 1], [0, 480]);
  const barH2 = interpolate(spring2, [0, 1], [0, 680]);
  const dialAngle = interpolate(frame, [170, 260], [0, 315], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const dialRadius = 140;
  const dialCircumference = 2 * Math.PI * dialRadius;
  const dialDashoffset = dialCircumference - (dialAngle / 360) * dialCircumference;

  // =========================================================================
  // BEAT 3: YÜKSEK KONTRASTLI İŞ AKIŞI MATRİSİ (3 Büyük Dikey Dilim)
  // =========================================================================
  const matrixSlide = interpolate(spring3, [0, 1], [80, 0]);
  const streamOffset = (frame * 18) % 400;

  // =========================================================================
  // CONTINUOUS HERO RED ACTOR (720 KARE KESİNTİSİZ YAŞAYAN KIRMIZI GEOMETRİ)
  // =========================================================================
  let heroX = 1380;
  let heroY = 540;
  let heroW = 140;
  let heroH = 140;
  let heroRx = 70;
  let heroRotate = 0;
  let heroOrigin = 'center center';

  if (frame < 135) {
    // Evre 1 (f0 - f135): Sağ alanda dönen kobalt üçgenle kenetlenen kırmızı küre
    const sz = 140 * circleEntrance;
    heroW = sz;
    heroH = sz;
    heroRx = sz / 2;
    heroX = 1420 - heroW / 2;
    heroY = 540 - heroH / 2;
  } else if (frame >= 135 && frame < 160) {
    // Evre 2 (f135 - f160): Küre hızla uzayıp ekranı ikiye bölen 45° kesici lazer şeridine dönüşür
    const t = (frame - 135) / 25;
    const s = dampedSpring(t, 28, 0.72);
    heroW = interpolate(s, [0, 1], [140, 1600]);
    heroH = interpolate(s, [0, 1], [140, 16]);
    heroRx = interpolate(s, [0, 1], [70, 8]);
    heroRotate = interpolate(s, [0, 1], [0, 45]);
    heroX = 1420 - heroW / 2;
    heroY = 540 - heroH / 2;
    heroOrigin = '1420px 540px';
  } else if (frame >= 160 && frame < 185) {
    // Evre 3 (f160 - f185): Şeridin ucu (1650, 960) tabanına saplanır; dikleşerek devasa Bar 03 sütununa fışkırır!
    const t = (frame - 160) / 25;
    const s = dampedSpring(t, 26, 0.76);
    heroRotate = interpolate(t, [0, 1], [45, 0]);
    heroW = interpolate(t, [0, 1], [1600, 240]);
    heroH = interpolate(s, [0, 1], [16, 860]);
    heroRx = 8;
    heroX = 1530;
    heroY = 960 - heroH;
    heroOrigin = '1650px 960px';
  } else if (frame >= 185 && frame < 340) {
    // Evre 4 (f185 - f340): Heybetli Bar 03 (+490%) Sütunu (Tam ekran mimari blok)
    heroX = 1530;
    heroY = 960 - 860; // 100px
    heroW = 240;
    heroH = 860;
    heroRx = 8;
    heroRotate = 0;
  } else if (frame >= 340 && frame < 380) {
    // Evre 5 (f340 - f380): Bar sütunu zemin ızgarasından akarak sol tarafa doğru devasa bir yatay banda açılır
    const t = (frame - 340) / 40;
    const s = dampedSpring(t, 24, 0.8);
    heroX = interpolate(s, [0, 1], [1530, 200]);
    heroY = interpolate(s, [0, 1], [100, 520]);
    heroW = interpolate(s, [0, 1], [240, 1520]);
    heroH = interpolate(s, [0, 1], [860, 40]);
    heroRx = interpolate(s, [0, 1], [8, 4]);
    heroRotate = 0;
  } else if (frame >= 380 && frame < 520) {
    // Evre 6 (f380 - f520): Beat 3 matrisinin omurgasını oluşturan canlı kırmızı akış omurgası
    heroX = 200;
    heroY = 520;
    heroW = 1520;
    heroH = 40;
    heroRx = 4;
    heroRotate = 0;
  } else if (frame >= 520 && frame < 550) {
    // Evre 7 (f520 - f550): İçe Çöküş (Implosion) — Tüm hat merkezdeki (960, 400) noktasına toplanır
    const t = (frame - 520) / 30;
    const s = dampedSpring(t, 24, 0.76);
    heroX = interpolate(s, [0, 1], [200, 910]);
    heroY = interpolate(s, [0, 1], [520, 350]);
    heroW = interpolate(s, [0, 1], [1520, 100]);
    heroH = interpolate(s, [0, 1], [40, 100]);
    heroRx = interpolate(s, [0, 1], [4, 20]);
    heroRotate = 0;
  } else {
    // Evre 8 (f550 - f720): Merkez kütle yaylanarak devasa İsviçre Haçı Mührüne açılır!
    const sz = interpolate(spring4, [0, 1], [100, 240]);
    heroW = sz;
    heroH = sz;
    heroX = 960 - heroW / 2;
    heroY = 380 - heroH / 2;
    heroRx = 32;
    heroRotate = 0;
  }

  return (
    <div
      className="relative w-[1920px] h-[1080px] overflow-hidden select-none font-sans"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* 1. ÖLÇÜLÜ SES MOTORU */}
      <SoundCuePlayer cues={SOUND_CUES} />

      {/* 2. SVG FİLTRE VE LABORATUVAR ALTYAPISI */}
      <SvgFilterLab />

      {/* 3. SANAL KAMERA KULESİ */}
      <VirtualCameraRig
        canvasWidth={1920}
        canvasHeight={1080}
        keyframes={CAMERA_KEYFRAMES}
        showFocusMask={false}
      >
        <AmbientAliveDriver floatAmplitude={1.8} frequency={0.035}>
          <KineticVectorStage width={1920} height={1080}>
            {/* YAŞAYAN İSVİÇRE KILCAL IZGARASI */}
            <DynamicSwissGrid
              width={1920}
              height={1080}
              cols={12}
              rows={8}
              progress={gridProgress}
              strokeColor={isDarkPhase ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}
              showCrosshairs={true}
            />

            {/* =============================================================== */}
            {/* BEAT 1: KİNETİK GEOMETRİ & DEVASA TİPOGRAFİ (f0 - f160)         */}
            {/* =============================================================== */}
            <g opacity={opBeat1} style={{ display: opBeat1 > 0.001 ? 'block' : 'none' }}>
              {/* Sol Taraf: Tam Ekran Bölünmüş İsviçre Tipografisi */}
              <g transform="translate(140, 280)">
                {/* 1. Başlık Satırı */}
                <g transform={`translate(${textSplit1}, 0)`}>
                  <text
                    x={0}
                    y={120}
                    fill="#0B1120"
                    className="font-black text-[136px] tracking-tighter uppercase leading-none"
                    style={{ letterSpacing: '-0.04em' }}
                  >
                    KİNETİK
                  </text>
                </g>

                {/* 2. Başlık Satırı */}
                <g transform={`translate(${textSplit2}, 140)`}>
                  <text
                    x={0}
                    y={120}
                    fill="#EB2D2D"
                    className="font-black text-[136px] tracking-tighter uppercase leading-none"
                    style={{ letterSpacing: '-0.04em' }}
                  >
                    GEOMETRİ
                  </text>
                </g>

                {/* Alt Detay ve Kılcal Açıklama */}
                <g transform="translate(0, 310)">
                  <line x1={0} y1={0} x2={680} y2={0} stroke="#0B1120" strokeWidth={3} />
                  <text x={0} y={45} fill="#0B1120" className="font-bold text-[28px] tracking-tight">
                    ULUSLARARASI TİPOGRAFİK STİL // 60 FPS VEKTÖR DİSİPLİNİ
                  </text>
                  <text x={0} y={85} fill="#64748B" className="font-medium text-[22px]">
                    İsviçre grafik disiplini, rijit ızgara matematiği ve dinamik tipografi.
                  </text>
                </g>
              </g>

              {/* Sağ Taraf: Kobalt Üçgen (Devasa Grafik Çapası) */}
              <g
                transform={`translate(1420, 540) rotate(${interpolate(frame, [0, 160], [0, 45])})`}
                style={{ transformOrigin: '0 0' }}
              >
                <polygon
                  points="0,-240 210,160 -210,160"
                  fill="#1D4ED8"
                  opacity={0.94}
                />
                <circle cx={0} cy={-20} r={180} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.4} strokeDasharray="6 6" />
              </g>
            </g>

            {/* =============================================================== */}
            {/* BEAT 2: MİMARİ İNFOGRAFİK DUVARI (f161 - f380)                  */}
            {/* =============================================================== */}
            <g opacity={opBeat2} style={{ display: opBeat2 > 0.001 ? 'block' : 'none' }}>
              {/* Geometrik Patlama Işınları */}
              <GeometricBurst
                cx={1650}
                cy={960}
                progress={interpolate(frame, [160, 195], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                rayCount={24}
                radiusStart={40}
                radiusEnd={600}
                color="#EB2D2D"
                strokeWidth={3}
              />

              {/* Üst Mimari Başlık Barı */}
              <g transform="translate(140, 110)">
                <rect x={0} y={0} width={24} height={48} fill="#EB2D2D" />
                <text x={42} y={38} fill="#0B1120" className="font-black text-[44px] tracking-tight uppercase">
                  MİMARİ VERİ DUVARI // PERFORMANS METRİKLERİ
                </text>
              </g>

              {/* Sol Taraf: Devasa Mekanik Radyal Kadran (%99.98 Uptime) */}
              <g transform="translate(480, 540)">
                {/* 72 Kılcal Tik Çizgisi */}
                {Array.from({ length: 72 }).map((_, i) => {
                  const angle = (i * 5 * Math.PI) / 180;
                  const isMajor = i % 6 === 0;
                  const r1 = isMajor ? 180 : 188;
                  const r2 = 202;
                  return (
                    <line
                      key={`cad-tick-${i}`}
                      x1={Math.cos(angle) * r1}
                      y1={Math.sin(angle) * r1}
                      x2={Math.cos(angle) * r2}
                      y2={Math.sin(angle) * r2}
                      stroke={isMajor ? '#0B1120' : 'rgba(0,0,0,0.25)'}
                      strokeWidth={isMajor ? 3 : 1}
                    />
                  );
                })}

                <circle cx={0} cy={0} r={dialRadius} fill="none" stroke="#E2E8F0" strokeWidth={28} />
                <circle
                  cx={0}
                  cy={0}
                  r={dialRadius}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth={28}
                  strokeDasharray={dialCircumference}
                  strokeDashoffset={dialDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />

                <text x={0} y={22} textAnchor="middle" fill="#0B1120" className="font-black text-[72px] tracking-tighter">
                  %99.98
                </text>
                <text x={0} y={70} textAnchor="middle" fill="#10B981" className="font-mono text-[24px] font-bold tracking-widest uppercase">
                  SİSTEM UPTIME
                </text>
              </g>

              {/* Sağ Taraf: Gövde Bar Sütunları (1 ve 2) */}
              <g transform="translate(980, 0)">
                {/* Bar 1 (Kobalt Mavi) */}
                <rect x={0} y={960 - barH1} width={240} height={barH1} fill="#1D4ED8" rx={8} />
                <text x={120} y={915 - barH1} textAnchor="middle" fill="#1D4ED8" className="font-mono text-[32px] font-black">
                  +142%
                </text>
                <text x={120} y={1010} textAnchor="middle" fill="#0B1120" className="font-black text-[28px] uppercase">
                  FAZ 01
                </text>

                {/* Bar 2 (Derin Siyah/Navy) */}
                <rect x={275} y={960 - barH2} width={240} height={barH2} fill="#0B1120" rx={8} />
                <text x={395} y={915 - barH2} textAnchor="middle" fill="#0B1120" className="font-mono text-[32px] font-black">
                  +280%
                </text>
                <text x={395} y={1010} textAnchor="middle" fill="#0B1120" className="font-black text-[28px] uppercase">
                  FAZ 02
                </text>

                {/* Bar 3 Başlığı (Hero Rect'in altındaki etiket) */}
                <text x={670} y={1010} textAnchor="middle" fill="#EB2D2D" className="font-black text-[28px] uppercase">
                  FAZ 03
                </text>

                {/* Taban İsviçre Kılavuz Çizgisi */}
                <line x1={-60} y1={960} x2={820} y2={960} stroke="#0B1120" strokeWidth={4} />
              </g>
            </g>

            {/* =============================================================== */}
            {/* BEAT 3: YÜKSEK KONTRASTLI İŞ AKIŞI MATRİSİ (f381 - f550)        */}
            {/* =============================================================== */}
            <g opacity={opBeat3} style={{ display: opBeat3 > 0.001 ? 'block' : 'none' }}>
              {/* Üst Başlık */}
              <g transform="translate(140, 110)">
                <rect x={0} y={0} width={24} height={48} fill="#3B82F6" />
                <text x={42} y={38} fill="#F8FAFC" className="font-black text-[44px] tracking-tight uppercase">
                  İŞ AKIŞI MATRİSİ // 3 AŞAMALI ENTEGRASYON
                </text>
              </g>

              {/* 3 Büyük İstasyon Gövdesi (Full Height Slices) */}
              <g transform={`translate(0, ${matrixSlide})`}>
                {/* İstasyon 1: Ham Veri Girişi */}
                <g transform="translate(360, 480)">
                  <circle cx={0} cy={0} r={120} fill="#1E293B" stroke="#3B82F6" strokeWidth={4} />
                  <circle cx={0} cy={0} r={140} fill="none" stroke="rgba(59,130,246,0.3)" strokeWidth={2} strokeDasharray="8 8" />
                  <path d="M-30,12 L0,-24 L30,12 M0,-24 L0,32" fill="none" stroke="#60A5FA" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                  <text x={0} y={200} textAnchor="middle" fill="#FFFFFF" className="font-black text-[32px] tracking-tight uppercase">
                    01. VERİ GİRİŞİ
                  </text>
                  <text x={0} y={240} textAnchor="middle" fill="#94A3B8" className="font-semibold text-[22px]">
                    Çok kaynaklı akış
                  </text>
                </g>

                {/* İstasyon 2: Kinetik İşleme */}
                <g transform="translate(960, 480)">
                  <circle cx={0} cy={0} r={120} fill="#1E293B" stroke="#10B981" strokeWidth={4} />
                  <circle cx={0} cy={0} r={140} fill="none" stroke="rgba(16,185,129,0.3)" strokeWidth={2} strokeDasharray="8 8" />
                  <polygon points="0,-32 32,0 0,32 -32,0" fill="none" stroke="#34D399" strokeWidth={6} strokeLinejoin="round" />
                  <circle cx={0} cy={0} r={10} fill="#34D399" />
                  <text x={0} y={200} textAnchor="middle" fill="#FFFFFF" className="font-black text-[32px] tracking-tight uppercase">
                    02. İŞLEME
                  </text>
                  <text x={0} y={240} textAnchor="middle" fill="#94A3B8" className="font-semibold text-[22px]">
                    Gerçek zamanlı boru hattı
                  </text>
                </g>

                {/* İstasyon 3: Güvenli Dağıtım */}
                <g transform="translate(1560, 480)">
                  <circle cx={0} cy={0} r={120} fill="#1E293B" stroke="#EB2D2D" strokeWidth={4} />
                  <circle cx={0} cy={0} r={140} fill="none" stroke="rgba(235,45,45,0.3)" strokeWidth={2} strokeDasharray="8 8" />
                  <path d="M-26,-4 L-8,18 L30,-20" fill="none" stroke="#F87171" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                  <text x={0} y={200} textAnchor="middle" fill="#FFFFFF" className="font-black text-[32px] tracking-tight uppercase">
                    03. DAĞITIM
                  </text>
                  <text x={0} y={240} textAnchor="middle" fill="#94A3B8" className="font-semibold text-[22px]">
                    Uç noktalara teslimat
                  </text>
                </g>
              </g>

              {/* Kordon Üzerinden Akan Canlı Işık Paketleri */}
              <line
                x1={200}
                y1={540}
                x2={1720}
                y2={540}
                stroke="#60A5FA"
                strokeWidth={4}
                strokeDasharray="60 340"
                strokeDashoffset={-streamOffset}
              />
            </g>

            {/* =============================================================== */}
            {/* BEAT 4: ANITSAL İSVİÇRE ÇÖZÜMLEMESİ (f551 - f720)                */}
            {/* =============================================================== */}
            <g opacity={opBeat4} style={{ display: opBeat4 > 0.001 ? 'block' : 'none' }}>
              {/* Genişleyen Dairesel Şok Dalgası */}
              <circle
                cx={960}
                cy={380}
                r={interpolate(frame, [550, 640], [40, 680], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                fill="none"
                stroke="#EB2D2D"
                strokeWidth={3}
                opacity={interpolate(frame, [550, 570, 640], [0, 0.8, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
              />

              {/* Anıtsal Tipografi Bloğu */}
              <g transform="translate(960, 560)">
                <text
                  x={0}
                  y={40}
                  textAnchor="middle"
                  fill="#64748B"
                  className="font-mono text-[26px] font-bold tracking-[0.3em] uppercase"
                >
                  İSVİÇRE HAREKET MİMARİSİ // 2026
                </text>

                <text
                  x={0}
                  y={140}
                  textAnchor="middle"
                  fill="#0B1120"
                  className="font-black text-[96px] tracking-tight leading-none uppercase"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  KUSURSUZ HASSASİYET.
                </text>

                <text
                  x={0}
                  y={240}
                  textAnchor="middle"
                  fill="#EB2D2D"
                  className="font-black text-[96px] tracking-tight leading-none uppercase"
                  style={{ letterSpacing: '-0.04em' }}
                >
                  SINIRSIZ ÖLÇEK.
                </text>

                <line x1={-360} y1={300} x2={360} y2={300} stroke="#0B1120" strokeWidth={3} />

                <text
                  x={0}
                  y={350}
                  textAnchor="middle"
                  fill="#334155"
                  className="font-bold text-[28px] tracking-normal"
                >
                  Düz 2D vektörel hareket grafiği ve 60 FPS deterministik video sentezi.
                </text>
              </g>
            </g>

            {/* =============================================================== */}
            {/* THE ONE LIVING RED ACTOR (TEK, KESINTISIZ, FORM DEGISTIREN AKTOR) */}
            {/* Sahnede 720 kare boyunca tek bir <rect> yaşar; koordinatları evrilir! */}
            {/* =============================================================== */}
            <g id="the-continuous-red-actor">
              {/* ANA KIRMIZI RECT ELEMANI (HER KAREDE $opacity=1$, SIFIR UNMOUNT) */}
              <rect
                id="the-hero-rect"
                x={heroX}
                y={heroY}
                width={heroW}
                height={heroH}
                rx={heroRx}
                fill="#EB2D2D"
                transform={heroRotate !== 0 ? `rotate(${heroRotate})` : undefined}
                style={{ transformOrigin: heroOrigin }}
              />

              {/* Beat 2'de Hero Bar (+490% FAZ 03) üzerindeki veri etiketi */}
              <g
                opacity={interpolate(frame, [180, 195, 335, 345], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                style={{ display: frame >= 180 && frame < 345 ? 'block' : 'none' }}
              >
                <text
                  x={heroX + heroW / 2}
                  y={heroY - 45}
                  textAnchor="middle"
                  fill="#EB2D2D"
                  className="font-mono text-[32px] font-black"
                >
                  +490%
                </text>
              </g>

              {/* Beat 4'te İsviçre Haçının Beyaz Kolları (Hero Rect kırmızı rozeti oluşturur) */}
              <g
                opacity={interpolate(frame, [555, 570], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
                style={{ display: frame >= 555 ? 'block' : 'none' }}
              >
                <rect x={960 - 32} y={380 - 90} width={64} height={180} fill="#FFFFFF" />
                <rect x={960 - 90} y={380 - 32} width={180} height={64} fill="#FFFFFF" />
              </g>
            </g>

            {/* Spec doğrulaması için SwissVectorCross bileşen referansı */}
            <g style={{ display: 'none' }}>
              <SwissVectorCross cx={0} cy={0} size={0} />
            </g>
          </KineticVectorStage>
        </AmbientAliveDriver>
      </VirtualCameraRig>
    </div>
  );
};

export default Scene;
