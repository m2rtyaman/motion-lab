import { type FC } from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { DURATIONS, EASING } from '../../core/tokens';
import {
  transitionWhipPan,
  transitionMaskWipe,
  transitionZoomPunch,
} from '../../core';
import { SpotlightStage, CameraRig } from '../../primitives';
import {
  Cpu,
  Zap,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  Radio,
  Sparkles,
  Server,
  Layers,
  Lock,
} from 'lucide-react';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

export const BEATS = [
  { id: 'awakening', startFrame: 0, endFrame: 129 },
  { id: 'neural-pipeline', startFrame: 130, endFrame: 279 },
  { id: 'global-matrix', startFrame: 280, endFrame: 429 },
  { id: 'apex-climax', startFrame: 430, endFrame: 600 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    // ==========================================
    // 1. MOTİVE 3D KAMERA KOREOGRAFİSİ (spec.json ile tam uyumlu)
    // ==========================================
    // İçerik okunurken kaya gibi sabit; geçiş anlarında hız ve yön ile kilitli hareket
    animateCamera(tl, '.camera-rig', [
      { at: 0.1, duration: 0.8, scale: 1.0, y: 0, ease: EASING.powerOut },
      { at: 2.0, duration: 0.65, scale: 1.03, x: -80, ease: EASING.expoInOut },
      { at: 4.55, duration: 0.7, scale: 1.0, x: 0, ease: EASING.expoInOut },
      { at: 6.95, duration: 0.8, scale: 1.1, ease: EASING.expoInOut },
      { at: 8.0, duration: 1.0, scale: 1.0, ease: 'power2.out' },
    ]);

    // ==========================================
    // 2. BEAT 1: KUANTUM ÇEKİRDEK UYANIŞI (0.0s - 2.17s)
    // ==========================================
    tl.fromTo(
      '.beat1-system-row',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      0.15
    );

    tl.fromTo(
      '.beat1-title',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      0.25
    );

    tl.fromTo(
      '.beat1-desc',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      0.45
    );

    tl.fromTo(
      '.beat1-spectrum',
      { opacity: 0, scaleY: 0.2 },
      { opacity: 1, scaleY: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      0.55
    );

    tl.fromTo(
      '.beat1-telemetry',
      { opacity: 0, scale: 0.9, x: 40, filter: 'blur(16px)' },
      { opacity: 1, scale: 1, x: 0, filter: 'blur(0px)', duration: DURATIONS.scene, ease: EASING.expoOut },
      0.35
    );

    // ==========================================
    // GEÇİŞ 1: YÜKSEK HIZLI WHIP-PAN & KİNETİK ŞERİT (2.0s)
    // ==========================================
    transitionWhipPan(tl, '.scene-beat-1', '.scene-beat-2', {
      at: 2.0,
      direction: 'left',
      distance: 1200,
      duration: DURATIONS.panel,
      streakSelector: '.whip-streak',
    });

    // ==========================================
    // 3. BEAT 2: OTONOM MODEL BORU HATTI (2.17s - 4.67s)
    // ==========================================
    tl.fromTo(
      '.beat2-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      2.3
    );

    tl.fromTo(
      '.pipeline-flow-beam',
      { opacity: 0, scaleX: 0 },
      { opacity: 1, scaleX: 1, duration: DURATIONS.camera, ease: EASING.expoOut },
      2.45
    );

    tl.fromTo(
      '.pipeline-node-1',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      2.4
    );

    tl.fromTo(
      '.pipeline-node-2',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      2.55
    );

    tl.fromTo(
      '.pipeline-node-3',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      2.7
    );

    // ==========================================
    // GEÇİŞ 2: SPEKÜLER KENARLI DİYAGONAL PERDE (4.55s)
    // ==========================================
    transitionMaskWipe(tl, '.scene-beat-3', {
      at: 4.55,
      type: 'diagonal',
      duration: DURATIONS.scene,
      outgoingSelector: '.scene-beat-2',
      specularSelector: '.mask-specular-beam',
    });

    // ==========================================
    // 4. BEAT 3: KÜRESEL DAĞITIK UÇ MATRİSİ (4.67s - 7.17s)
    // ==========================================
    tl.fromTo(
      '.beat3-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      4.8
    );

    tl.fromTo(
      '.beat3-radar',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: DURATIONS.camera, ease: EASING.expoOut },
      4.9
    );

    tl.fromTo(
      '.region-card-0',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      5.05
    );

    tl.fromTo(
      '.region-card-1',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      5.18
    );

    tl.fromTo(
      '.region-card-2',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      5.31
    );

    tl.fromTo(
      '.region-card-3',
      { opacity: 0, y: 30, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
      5.44
    );

    tl.fromTo(
      '.beat3-bottom-bar',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      5.55
    );

    // ==========================================
    // GEÇİŞ 3: ZOOM-PUNCH DİFERANSİYEL PORTAL DALIŞI (6.95s)
    // ==========================================
    transitionZoomPunch(tl, '.scene-beat-3', '.scene-beat-4', {
      at: 6.95,
      duration: DURATIONS.camera,
      zoomScale: 2.8,
      portalRingSelector: '.portal-ring-outer',
    });

    // ==========================================
    // 5. BEAT 4: ZİRVE OTORİTE & İCRA KİLİDİ (7.17s - 10.0s)
    // ==========================================
    tl.fromTo(
      '.beat4-emblem',
      { opacity: 0, scale: 0.7, filter: 'blur(16px)' },
      { opacity: 1, scale: 1, filter: 'blur(0px)', duration: DURATIONS.scene, ease: EASING.expoOut },
      7.2
    );

    tl.fromTo(
      '.beat4-headline',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      7.4
    );

    tl.fromTo(
      '.beat4-subheadline',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      7.6
    );

    tl.fromTo(
      '.beat4-cta-button',
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
      7.85
    );

    tl.fromTo(
      '.beat4-cta-shimmer',
      { x: -300, opacity: 0 },
      { x: 500, opacity: 0.8, duration: DURATIONS.camera, ease: EASING.powerOut },
      8.3
    );

    tl.fromTo(
      '.beat4-trust-badges',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      8.1
    );
  });

  // Deterministik metrik hesaplamaları (kare tabanlı)
  const coreRotation = (frame * 0.6) % 360;
  const pulseScale = 1 + Math.sin(frame * 0.12) * 0.03;
  const beamOffset = interpolate(frame, [130, 280], [0, 480], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const radarSweep = (frame * 1.5) % 360;

  return (
    <SpotlightStage aspect={aspect} clean={true}>
      <CameraRig className="camera-rig w-full h-full flex items-center justify-center">
        {/* Ana Sahne Kabuğu (Master Shell) */}
        <div className="relative w-[1720px] h-[940px] rounded-[36px] bg-[#0c1222]/90 border border-white/[0.12] shadow-[0_32px_100px_rgba(0,0,0,0.85)] overflow-hidden flex items-center justify-center backdrop-blur-2xl">
          {/* Ortam Işıklandırması */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-[25%] -left-[15%] w-[900px] h-[900px] rounded-full bg-[#1d4ed8]/15 blur-[130px]" />
            <div className="absolute -bottom-[20%] -right-[10%] w-[950px] h-[950px] rounded-full bg-[#4f46e5]/15 blur-[140px]" />
            <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#10b981]/10 blur-[150px]" />
          </div>

          {/* Geçiş 1 için Kinetik Hız Şeridi */}
          <div className="whip-streak pointer-events-none absolute inset-y-0 w-[600px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent skew-x-[-24deg] opacity-0 z-50" />

          {/* Geçiş 2 için Speküler Işık Bıçağı */}
          <div className="mask-specular-beam pointer-events-none absolute inset-y-0 w-[6px] bg-gradient-to-b from-transparent via-cyan-300 via-white to-transparent opacity-0 z-50" />

          {/* Geçiş 3 için Portal Halka Dalgaları */}
          <div className="portal-ring-outer pointer-events-none absolute inset-0 m-auto w-[720px] h-[720px] rounded-full border-2 border-indigo-400/50 shadow-[0_16px_60px_rgba(99,102,241,0.3)] opacity-0 z-50" />

          {/* ========================================================= */}
          {/* BEAT 1: KUANTUM ÇEKİRDEK UYANIŞI                         */}
          {/* ========================================================= */}
          <div className="scene-beat-1 absolute inset-0 flex flex-col justify-between p-20 z-20">
            {/* Üst Sistem Bilgi Satırı */}
            <div className="beat1-system-row flex items-center justify-between border-b border-white/[0.08] pb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[18px] font-mono font-bold tracking-[0.18em] uppercase text-zinc-300">
                  KORTEX // ÇEKİRDEK v4.8
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[18px] text-zinc-400">
                <span>DETERMİNİSTİK MOTOR: AKTİF</span>
                <span className="text-emerald-400">GECİKME: &lt; 0.5 MS</span>
              </div>
            </div>

            {/* Orta İçerik: Sol Başlık + Sağ Telemetri Paneli */}
            <div className="grid grid-cols-12 gap-12 items-center my-auto">
              {/* Sol Taraf (7 Kolon) */}
              <div className="col-span-7 flex flex-col">
                <h1 className="beat1-title text-[68px] font-black tracking-[-0.035em] leading-[1.08] text-white mb-6">
                  YAPAY ZEKA İŞLEM GÜCÜ, <br />
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                    YENİDEN TANIMLANDI.
                  </span>
                </h1>

                <p className="beat1-desc text-[24px] text-zinc-300 font-normal leading-relaxed max-w-2xl mb-8">
                  Sıfır gecikmeyle çalışan küresel dağıtık model altyapısı ve otonom çıkarım motoru.
                </p>

                {/* Dinamik Frekans Spektrumu (16 Bar) */}
                <div className="beat1-spectrum flex items-end gap-2.5 h-16">
                  {Array.from({ length: 18 }).map((_, i) => {
                    const h = 20 + Math.abs(Math.sin((frame * 0.15) + (i * 0.45))) * 42;
                    return (
                      <div
                        key={i}
                        className="w-3 rounded-full bg-gradient-to-t from-blue-600 to-emerald-400"
                        style={{ height: `${h}px` }}
                      />
                    );
                  })}
                  <span className="ml-4 font-mono text-[18px] text-zinc-400 tracking-wider">
                    CANLI FREKANS AKIŞI
                  </span>
                </div>
              </div>

              {/* Sağ Taraf (5 Kolon): Canlı Kuantum İşlemci Telemetri Kartı */}
              <div className="col-span-5 flex justify-end">
                <div className="beat1-telemetry w-[480px] rounded-3xl bg-[#141b30]/90 border border-white/[0.12] p-8 shadow-2xl flex flex-col gap-6">
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg"
                        style={{ transform: `rotate(${coreRotation}deg)` }}
                      >
                        <Cpu className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-[20px] font-bold text-white">Nöral İşlem Çekirdeği</div>
                        <div className="text-[18px] font-mono text-zinc-400">4,096 Tensor Core</div>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[18px]">
                      AKTİF
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-[#0e1424] border border-white/[0.06] flex flex-col">
                      <div className="flex items-center gap-2 text-[18px] font-mono text-zinc-400 mb-1">
                        <Activity className="w-4 h-4 text-emerald-400" />
                        <span>GECİKME</span>
                      </div>
                      <span className="text-[36px] font-mono font-extrabold text-white">0.4 ms</span>
                    </div>

                    <div className="p-5 rounded-2xl bg-[#0e1424] border border-white/[0.06] flex flex-col">
                      <div className="flex items-center gap-2 text-[18px] font-mono text-zinc-400 mb-1">
                        <Zap className="w-4 h-4 text-blue-400" />
                        <span>HACİM</span>
                      </div>
                      <span className="text-[36px] font-mono font-extrabold text-white">14.8M</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alt Telif / Mod Satırı */}
            <div className="text-[18px] font-mono text-zinc-500">
              KORTEX DAĞITIK MİMARİ // TÜM HAKLARI SAKLIDIR 2026
            </div>
          </div>

          {/* ========================================================= */}
          {/* BEAT 2: OTONOM MODEL BORU HATTI                           */}
          {/* ========================================================= */}
          <div className="scene-beat-2 absolute inset-0 flex flex-col items-center justify-center p-20 z-20 opacity-0">
            <div className="beat2-header text-center mb-16">
              <h2 className="text-[56px] font-black tracking-tight text-white mb-3">
                OTONOM MODEL BORU HATTI
              </h2>
              <p className="text-[22px] text-zinc-300 font-normal">
                Semantik algıdan dağıtık konsensüse 3 aşamalı kesintisiz veri yolu
              </p>
            </div>

            {/* 3 Düğümlü Fotonik Ajan Mimarisi */}
            <div className="relative w-full max-w-6xl flex items-center justify-between">
              {/* Düğümler Arası Fotonik Veri Yolu (SVG) */}
              <svg className="pipeline-flow-beam absolute inset-0 w-full h-full pointer-events-none z-0">
                <line
                  x1="18%"
                  y1="50%"
                  x2="82%"
                  y2="50%"
                  stroke="rgba(59, 130, 246, 0.4)"
                  strokeWidth="4"
                  strokeDasharray="10 10"
                  strokeDashoffset={-beamOffset}
                />
              </svg>

              {/* Düğüm 1 */}
              <div className="pipeline-node-1 relative z-10 w-[340px] p-8 rounded-3xl bg-[#141b30]/95 border border-white/[0.12] shadow-xl flex flex-col text-left">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center mb-6">
                  <Radio className="w-8 h-8 text-blue-400" />
                </div>
                <span className="text-[18px] font-mono text-blue-400 uppercase tracking-wider mb-2">
                  01 / YÖNLENDİRME
                </span>
                <h3 className="text-[26px] font-bold text-white mb-3">
                  Semantic Router
                </h3>
                <p className="text-[18px] text-zinc-400 leading-normal mb-5">
                  Gelen isteklerin çoklu model havuzuna 0.12 ms içinde otomatik yönlendirilmesi.
                </p>
                <div className="mt-auto pt-4 border-t border-white/[0.08] flex items-center justify-between text-[18px] font-mono text-zinc-300">
                  <span>Hassasiyet</span>
                  <span className="text-emerald-400 font-bold">%99.9</span>
                </div>
              </div>

              {/* Düğüm 2: Ana Kahraman Düğüm */}
              <div
                className="pipeline-node-2 relative z-10 w-[370px] p-9 rounded-3xl bg-gradient-to-b from-[#1e2748] to-[#12182c] border-2 border-indigo-400/50 shadow-2xl flex flex-col text-left"
                style={{ transform: `scale(${pulseScale})` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/25 border border-indigo-400/60 flex items-center justify-center mb-6 shadow-lg">
                  <Zap className="w-8 h-8 text-indigo-300" />
                </div>
                <span className="text-[18px] font-mono text-indigo-300 uppercase tracking-wider mb-2">
                  02 / PARALEL ÇIKARIM
                </span>
                <h3 className="text-[28px] font-extrabold text-white mb-3">
                  Neural Inference
                </h3>
                <p className="text-[18px] text-zinc-300 leading-normal mb-5">
                  14.8M TFLOPS paralel hesaplama gücüyle 0.4 ms içinde deterministik model icrası.
                </p>
                <div className="mt-auto pt-4 border-t border-white/[0.1] flex items-center justify-between text-[18px] font-mono text-zinc-300">
                  <span>Yük Durumu</span>
                  <span className="text-emerald-400 font-bold">14.8M TFLOPS</span>
                </div>
              </div>

              {/* Düğüm 3 */}
              <div className="pipeline-node-3 relative z-10 w-[340px] p-8 rounded-3xl bg-[#141b30]/95 border border-white/[0.12] shadow-xl flex flex-col text-left">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-8 h-8 text-emerald-400" />
                </div>
                <span className="text-[18px] font-mono text-emerald-400 uppercase tracking-wider mb-2">
                  03 / KONSENSÜS KİLİDİ
                </span>
                <h3 className="text-[26px] font-bold text-white mb-3">
                  Consensus Lock
                </h3>
                <p className="text-[18px] text-zinc-400 leading-normal mb-5">
                  Kriptografik yanıt doğrulaması ile sıfır halüsinasyon güvencesi ve icra onayı.
                </p>
                <div className="mt-auto pt-4 border-t border-white/[0.08] flex items-center justify-between text-[18px] font-mono text-zinc-300">
                  <span>Doğruluk</span>
                  <span className="text-emerald-400 font-bold">%99.98</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BEAT 3: KÜRESEL DAĞITIK UÇ MATRİSİ                        */}
          {/* ========================================================= */}
          <div className="scene-beat-3 absolute inset-0 flex flex-col items-center justify-between p-20 z-20 opacity-0">
            <div className="beat3-header text-center">
              <h2 className="text-[54px] font-black tracking-tight text-white mb-3">
                KÜRESEL 48 BÖLGEDE EŞ ZAMANLI İŞLEM
              </h2>
              <p className="text-[22px] text-zinc-300 font-normal">
                Tüm kıtalarda anlık senkronizasyon, sıfır veri kaybı ve mikrosaniye gecikme
              </p>
            </div>

            {/* Orta Kısım: Küresel Radar Ağı (SVG) ve 4 Bölge Kartı */}
            <div className="relative w-full max-w-6xl my-auto">
              {/* Radar Dairesel Izgara Arka Planı */}
              <div className="beat3-radar absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div
                  className="w-[600px] h-[600px] rounded-full border border-blue-400/40 relative flex items-center justify-center"
                  style={{ transform: `rotate(${radarSweep}deg)` }}
                >
                  <div className="w-[400px] h-[400px] rounded-full border border-indigo-400/40" />
                  <div className="w-[200px] h-[200px] rounded-full border border-emerald-400/40" />
                  <div className="absolute top-0 bottom-0 w-[1px] bg-gradient-to-b from-blue-400 to-transparent" />
                </div>
              </div>

              {/* 4 Küresel Bölge Kartı */}
              <div className="grid grid-cols-4 gap-6 relative z-10">
                {[
                  { city: 'TOKYO', code: 'HND-1', ping: '0.8 ms', status: 'Optimal', load: '98.4%' },
                  { city: 'FRANKFURT', code: 'FRA-2', ping: '1.2 ms', status: 'Optimal', load: '99.1%' },
                  { city: 'SAN FRANCISCO', code: 'SFO-1', ping: '0.4 ms', status: 'Optimal', load: '99.8%' },
                  { city: 'İSTANBUL', code: 'IST-1', ping: '1.4 ms', status: 'Optimal', load: '97.9%' },
                ].map((item, idx) => (
                  <div
                    key={item.city}
                    className={`region-card-${idx} p-7 rounded-3xl bg-[#141b30]/95 border border-white/[0.12] shadow-xl flex flex-col`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-[20px] font-bold text-white">{item.city}</div>
                        <div className="text-[18px] font-mono text-zinc-400">{item.code}</div>
                      </div>
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm" />
                    </div>

                    <div className="text-[40px] font-mono font-black text-blue-400 mb-2">
                      {item.ping}
                    </div>

                    {/* Canlı Mini Sparkline */}
                    <div className="h-6 w-full mb-4 flex items-end gap-1">
                      {Array.from({ length: 12 }).map((_, sIdx) => {
                        const h = 6 + Math.abs(Math.sin((frame * 0.2) + (sIdx * 0.8) + idx)) * 16;
                        return (
                          <div
                            key={sIdx}
                            className="flex-1 rounded-sm bg-blue-500/40"
                            style={{ height: `${h}px` }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[18px] text-zinc-300 font-mono pt-3 border-t border-white/[0.08]">
                      <span>Yük: {item.load}</span>
                      <span className="text-emerald-400 font-semibold">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alt Canlı Telemetri Özeti */}
            <div className="beat3-bottom-bar flex items-center justify-between w-full max-w-6xl px-8 py-4 rounded-2xl bg-[#101626]/80 border border-white/[0.08] font-mono text-[18px] text-zinc-300">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-blue-400" />
                <span>TOPLAM AKTİF KÜME: 4,096 DÜĞÜM</span>
              </div>
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-indigo-400" />
                <span>CANLI BANT GENİŞLİĞİ: 84.6 TBPS</span>
              </div>
              <div className="flex items-center gap-3 text-emerald-400 font-bold">
                <Lock className="w-5 h-5" />
                <span>SLA GÜVENCESİ: %99.999</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BEAT 4: ZİRVE OTORİTE & İCRA KİLİDİ                       */}
          {/* ========================================================= */}
          <div className="scene-beat-4 absolute inset-0 flex flex-col items-center justify-center p-20 z-30 opacity-0">
            {/* Luminous Brand Emblem */}
            <div className="beat4-emblem relative mb-8">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-emerald-400 p-[2px] shadow-[0_16px_50px_rgba(37,99,235,0.35)]">
                <div className="w-full h-full rounded-[22px] bg-[#0c1222] flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-indigo-300" />
                </div>
              </div>
            </div>

            <h2 className="beat4-headline text-[68px] font-black tracking-[-0.035em] text-center text-white mb-6 max-w-5xl leading-tight">
              GELECEĞİN İŞLEM ALTYAPISI, <br />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-200 to-emerald-400 bg-clip-text text-transparent">
                BUGÜN BURADA.
              </span>
            </h2>

            <p className="beat4-subheadline text-[26px] text-zinc-300 max-w-2xl text-center font-normal leading-relaxed mb-12">
              KORTEX ile otonom zekanın sınırlarını kaldırın.
            </p>

            {/* Speküler Işıltılı CTA Butonu */}
            <div className="beat4-cta-button relative overflow-hidden px-12 py-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white font-bold text-[24px] shadow-[0_16px_50px_rgba(37,99,235,0.45)] flex items-center gap-4 cursor-pointer">
              <div className="beat4-cta-shimmer pointer-events-none absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-[-20deg]" />
              <span>ERİŞİM TALEP EDİN</span>
              <span className="font-mono text-indigo-100">→ kortex.ai</span>
              <ArrowUpRight className="w-7 h-7 ml-1 text-white" />
            </div>

            {/* Güvenilirlik Rozetleri */}
            <div className="beat4-trust-badges flex items-center gap-8 mt-12 text-[18px] font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> SOC2 Type II Sertifikalı
              </span>
              <span>•</span>
              <span>ISO 27001 Uyumlu</span>
              <span>•</span>
              <span>Kurumsal Seviye Güvenlik</span>
            </div>
          </div>
        </div>
      </CameraRig>
    </SpotlightStage>
  );
};
