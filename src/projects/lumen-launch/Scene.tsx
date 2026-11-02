import { type FC } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { DURATIONS, EASING } from '../../core/tokens';
import { BackdropField, CameraRig } from '../../primitives';
import {
  getTheme,
  transitionWhipPan,
  transitionMaskWipe,
  transitionZoomPunch,
} from '../../core';
import {
  Command,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Sparkles,
  Users,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const theme = getTheme('light');

export const BEATS = [
  { id: 'command', startFrame: 0, endFrame: 199 },
  { id: 'calendar', startFrame: 200, endFrame: 449 },
  { id: 'telemetry', startFrame: 450, endFrame: 639 },
  { id: 'payoff', startFrame: 640, endFrame: 840 },
] as const;

export const Scene: FC<SceneProps> = () => {
  const frame = useCurrentFrame();

  // Deterministik metrik hesaplamaları (Remotion frame kilitli)
  const typingProgress = interpolate(frame, [25, 75], [0, 36], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const fullCommandText = 'Schedule Q4 Strategy with Core Team';
  const displayedCommand = fullCommandText.slice(0, Math.floor(typingProgress));

  // Beat 3 Live Counter (460f - 560f arasında 0 -> 18.4)
  const focusHours = interpolate(frame, [465, 560], [0, 18.4], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  }).toFixed(1);

  // SVG Sparkline path çizim ilerlemesi
  const pathLength = 680;
  const strokeOffset = interpolate(frame, [480, 570], [pathLength, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  useRemotionGSAP((tl) => {
    // =========================================================================
    // 1. MOTİVASYONLU KAMERA KOREOGRAFİSİ (spec.json ile milimetrik uyumlu)
    // =========================================================================
    animateCamera(tl, '.camera-rig', [
      { at: 0.05, duration: 1.0, scale: 1.0, ease: 'power3.out' },
      { at: 3.17, duration: 0.65, scale: 1.02, x: -30, ease: 'expo.inOut' },
      { at: 7.33, duration: 0.65, scale: 1.0, x: 0, y: -20, ease: 'expo.inOut' },
      { at: 10.5, duration: 0.7, scale: 1.05, ease: 'expo.inOut' },
      { at: 11.5, duration: 1.0, scale: 1.0, ease: 'power2.out' },
    ]);

    // =========================================================================
    // 2. BEAT 1: OMNI-COMMAND BAR (0.0s - 3.32s)
    // =========================================================================
    tl.fromTo(
      '.b1-badge',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      0.15
    );

    tl.fromTo(
      '.b1-command-container',
      { opacity: 0, y: 40, scale: 0.94, filter: 'blur(12px)' },
      { opacity: 1, y: 0, scale: 1.0, filter: 'blur(0px)', duration: DURATIONS.camera, ease: EASING.expoOut },
      0.25
    );

    tl.fromTo(
      '.b1-participant-chips',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      1.35
    );

    tl.fromTo(
      '.b1-auto-slot-pill',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1.0, duration: DURATIONS.panel, ease: EASING.backOut },
      1.75
    );

    // =========================================================================
    // GEÇİŞ 1: DIRECTIONAL WHIP-PAN & KİNETİK ŞERİT (3.17s)
    // =========================================================================
    transitionWhipPan(tl, '.scene-beat-1', '.scene-beat-2', {
      at: 3.17,
      direction: 'left',
      distance: 1400,
      duration: DURATIONS.panel,
      streakSelector: '.whip-streak',
    });

    // =========================================================================
    // 3. BEAT 2: AKILLI TAKVİM & OTONOM ÇAKIŞMA ÇÖZÜMÜ (3.33s - 7.48s)
    // =========================================================================
    tl.fromTo(
      '.b2-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      3.35
    );

    tl.fromTo(
      '.b2-calendar-card',
      { opacity: 0, y: 40, scale: 0.96 },
      { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut },
      3.45
    );

    // Çakışan blok alana iner
    tl.fromTo(
      '.b2-conflict-block',
      { opacity: 0, x: 80, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1.0, duration: DURATIONS.panel, ease: EASING.expoOut },
      3.85
    );

    // Çakışma uyarı rozeti görünür
    tl.fromTo(
      '.b2-conflict-badge',
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1.0, duration: DURATIONS.micro, ease: EASING.backOut },
      4.15
    );

    // Otonom Çözüm Hareketi: Blok aşağı kayar, uyarı başarıya döner (4.85s)
    tl.to(
      '.b2-conflict-block',
      { y: 95, duration: DURATIONS.scene, ease: 'power3.inOut' },
      4.85
    );

    tl.to(
      '.b2-conflict-badge',
      { opacity: 0, scale: 0.8, duration: DURATIONS.micro, ease: 'power2.in' },
      4.85
    );

    tl.fromTo(
      '.b2-resolved-badge',
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1.0, duration: DURATIONS.panel, ease: EASING.backOut },
      5.35
    );

    // =========================================================================
    // GEÇİŞ 2: SPEKÜLER KENARLI PERDE GEÇİŞİ (7.33s)
    // =========================================================================
    transitionMaskWipe(tl, '.scene-beat-3', {
      at: 7.33,
      type: 'horizontal',
      duration: DURATIONS.scene,
      outgoingSelector: '.scene-beat-2',
      specularSelector: '.mask-specular-beam',
    });

    // =========================================================================
    // 4. BEAT 3: KAZANILAN ZAMAN TELEMETRİSİ (7.50s - 10.65s)
    // =========================================================================
    tl.fromTo(
      '.b3-header',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      7.55
    );

    tl.fromTo(
      '.b3-kpi-main',
      { opacity: 0, y: 40, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut },
      7.65
    );

    tl.fromTo(
      '.b3-chart-card',
      { opacity: 0, y: 40, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut },
      7.85
    );

    // =========================================================================
    // GEÇİŞ 3: ZOOM-PUNCH PORTAL DALIŞI (10.50s)
    // =========================================================================
    transitionZoomPunch(tl, '.scene-beat-3', '.scene-beat-4', {
      at: 10.5,
      duration: DURATIONS.camera,
      zoomScale: 2.4,
      portalRingSelector: '.portal-ring-outer',
    });

    // =========================================================================
    // 5. BEAT 4: ZİRVE MARKA VAADİ & EYLEM ÇAĞRISI (10.67s - 14.0s)
    // =========================================================================
    tl.fromTo(
      '.b4-emblem',
      { opacity: 0, scale: 0.7, filter: 'blur(16px)' },
      { opacity: 1, scale: 1.0, filter: 'blur(0px)', duration: DURATIONS.scene, ease: EASING.expoOut },
      10.7
    );

    tl.fromTo(
      '.b4-eyebrow',
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      10.95
    );

    tl.fromTo(
      '.b4-headline',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      11.15
    );

    tl.fromTo(
      '.b4-subheadline',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut },
      11.35
    );

    tl.fromTo(
      '.b4-cta-button',
      { opacity: 0, scale: 0.9, y: 20 },
      { opacity: 1, scale: 1.0, y: 0, duration: DURATIONS.panel, ease: EASING.backOut },
      11.65
    );
  }, []);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.colors.bgPrimary,
        color: theme.colors.textPrimary,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Kinetik Hız Şeridi (Whip-pan esnasında ekranı boydan boya süpürür) */}
      <div
        className="whip-streak pointer-events-none absolute inset-y-0 w-[420px]"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(37, 99, 235, 0.15), rgba(37, 99, 235, 0.4), transparent)',
          opacity: 0,
          zIndex: 90,
        }}
      />

      {/* Speküler Işık Bıçağı (Mask-wipe esnasında kenarı aydınlatır) */}
      <div
        className="mask-specular-beam pointer-events-none absolute -inset-y-32 w-[160px] -rotate-12"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), rgba(37, 99, 235, 0.6), transparent)',
          opacity: 0,
          zIndex: 95,
        }}
      />

      {/* Portal Dalış Halkası (Zoom-punch esnasında genişler) */}
      <div
        className="portal-ring-outer pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 900,
          height: 900,
          border: '2px solid rgba(37, 99, 235, 0.25)',
          boxShadow: '0 0 80px rgba(37, 99, 235, 0.1)',
          opacity: 0,
          zIndex: 85,
        }}
      />

      <CameraRig className="camera-rig absolute inset-0">
        {/* ================================================================= */}
        {/* BEAT 1: LUMEN OMNI-COMMAND BAR                                    */}
        {/* ================================================================= */}
        <section
          className="scene-beat-1 absolute inset-0 flex flex-col items-center justify-center px-24"
          style={{ opacity: 1 }}
        >
          <BackdropField theme={theme} variant="mesh" intensity={0.5} />

          <div className="flex flex-col items-center gap-10 max-w-[1200px] w-full z-10">
            {/* Üst Rozet */}
            <div
              className="b1-badge inline-flex items-center gap-3 px-6 py-2.5 rounded-full border shadow-sm"
              style={{
                backgroundColor: theme.colors.bgSurface,
                borderColor: theme.colors.borderSubtle,
              }}
            >
              <Sparkles className="w-5 h-5" style={{ color: theme.colors.accentPrimary }} />
              <span className="text-[18px] font-mono font-semibold uppercase tracking-[0.16em]" style={{ color: theme.colors.accentPrimary }}>
                LUMEN COMMAND • AUTONOMOUS OS
              </span>
            </div>

            {/* Hero Başlık */}
            <h1
              className="text-[64px] font-black tracking-[-0.035em] leading-[1.08] text-center"
              style={{ color: theme.colors.textPrimary }}
            >
              Instant Intent. Zero Coordination Drag.
            </h1>

            {/* Omni-Command Card (Single Container olarak takvime evrilir) */}
            <div
              className="b1-command-container w-[980px] rounded-[24px] border p-8 shadow-xl backdrop-blur-md"
              style={{
                backgroundColor: theme.colors.bgSurface,
                borderColor: theme.colors.borderFocus,
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
              }}
            >
              {/* Arama Girişi */}
              <div
                className="flex items-center gap-4 px-6 py-5 rounded-[16px] border"
                style={{
                  backgroundColor: theme.colors.bgSurfaceSubtle,
                  borderColor: theme.colors.borderSubtle,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.colors.accentPrimary }}
                >
                  <Command className="w-5 h-5" />
                </div>

                <div className="flex-1 flex items-center text-[28px] font-medium tracking-tight">
                  <span style={{ color: theme.colors.textPrimary }}>{displayedCommand}</span>
                  <span
                    className="inline-block w-[3px] h-[32px] ml-1.5 animate-pulse"
                    style={{ backgroundColor: theme.colors.accentPrimary }}
                  />
                </div>

                <div
                  className="px-3.5 py-1.5 rounded-lg border text-[18px] font-mono"
                  style={{
                    backgroundColor: theme.colors.bgSurface,
                    borderColor: theme.colors.borderSubtle,
                    color: theme.colors.textMuted,
                  }}
                >
                  ↵ EXECUTE
                </div>
              </div>

              {/* Katılımcı Çipleri ve Akıllı Zaman Yuvası */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t" style={{ borderColor: theme.colors.borderSubtle }}>
                <div className="b1-participant-chips flex items-center gap-3">
                  <Users className="w-5 h-5" style={{ color: theme.colors.textMuted }} />
                  <span className="text-[19px] font-medium mr-2" style={{ color: theme.colors.textMuted }}>
                    Auto-Discovered:
                  </span>
                  {['Alex R. (Product)', 'Elena K. (Engineering)', 'Marcus V. (Design)'].map((name, i) => (
                    <div
                      key={i}
                      className="px-4 py-1.5 rounded-full border text-[18px] font-medium"
                      style={{
                        backgroundColor: theme.colors.bgSurfaceSubtle,
                        borderColor: theme.colors.borderSubtle,
                        color: theme.colors.textPrimary,
                      }}
                    >
                      {name}
                    </div>
                  ))}
                </div>

                <div
                  className="b1-auto-slot-pill inline-flex items-center gap-2.5 px-5 py-2 rounded-full border"
                  style={{
                    backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    borderColor: 'rgba(37, 99, 235, 0.3)',
                    color: theme.colors.accentPrimary,
                  }}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-[18px] font-mono font-semibold">
                    Optimal Focus Window: Tue 14:00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* BEAT 2: AKILLI TAKVİM & OTONOM ÇAKIŞMA ÇÖZÜMÜ                     */}
        {/* ================================================================= */}
        <section
          className="scene-beat-2 absolute inset-0 flex flex-col items-center justify-center px-20"
          style={{ opacity: 0 }}
        >
          <BackdropField theme={theme} variant="grid" intensity={0.45} />

          <div className="flex flex-col items-center gap-8 max-w-[1440px] w-full z-10">
            {/* Üst Başlık & Eylem Durumu */}
            <div className="b2-header flex items-center justify-between w-full px-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                  style={{ backgroundColor: theme.colors.accentPrimary }}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-[38px] font-extrabold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                    AUTONOMOUS REALIGNMENT
                  </h2>
                  <p className="text-[20px]" style={{ color: theme.colors.textMuted }}>
                    Lumen Neural Scheduler • Multi-Participant Conflict Resolver
                  </p>
                </div>
              </div>

              {/* Durum Rozetleri (Çakışma -> Başarı evrimi) */}
              <div className="relative h-12 w-[340px] flex items-center justify-end">
                <div
                  className="b2-conflict-badge absolute inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border"
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: 'rgba(245, 158, 11, 0.4)',
                    color: theme.colors.statusWarning,
                  }}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <span className="text-[18px] font-mono font-bold uppercase tracking-wider">
                    Collision: Overlapping Review
                  </span>
                </div>

                <div
                  className="b2-resolved-badge absolute inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: 'rgba(16, 185, 129, 0.4)',
                    color: theme.colors.statusSuccess,
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="text-[18px] font-mono font-bold uppercase tracking-wider">
                    Resolved: Preserved Deep Focus
                  </span>
                </div>
              </div>
            </div>

            {/* 5 Günlük Haftalık Takvim Matrisi */}
            <div
              className="b2-calendar-card w-full rounded-[24px] border p-8 shadow-2xl backdrop-blur-md"
              style={{
                backgroundColor: theme.colors.bgSurface,
                borderColor: theme.colors.borderSubtle,
                boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
              }}
            >
              {/* Gün Sütunları Başlığı */}
              <div className="grid grid-cols-5 gap-6 pb-6 border-b" style={{ borderColor: theme.colors.borderSubtle }}>
                {[
                  { day: 'MON', date: 'OCT 14' },
                  { day: 'TUE', date: 'OCT 15', active: true },
                  { day: 'WED', date: 'OCT 16' },
                  { day: 'THU', date: 'OCT 17' },
                  { day: 'FRI', date: 'OCT 18' },
                ].map((col, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-5 py-3 rounded-xl border"
                    style={{
                      backgroundColor: col.active ? 'rgba(37, 99, 235, 0.06)' : theme.colors.bgSurfaceSubtle,
                      borderColor: col.active ? 'rgba(37, 99, 235, 0.3)' : theme.colors.borderSubtle,
                    }}
                  >
                    <span className="text-[18px] font-mono font-bold" style={{ color: col.active ? theme.colors.accentPrimary : theme.colors.textPrimary }}>
                      {col.day}
                    </span>
                    <span className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>
                      {col.date}
                    </span>
                  </div>
                ))}
              </div>

              {/* Saat Dilimleri Izgarası */}
              <div className="grid grid-cols-5 gap-6 pt-6 relative min-h-[460px]">
                {/* Pazartesi */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.colors.bgSurfaceSubtle, borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.textMuted }}>09:30 - 10:30</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Executive Standup</p>
                  </div>
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(37, 99, 235, 0.04)', borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.accentPrimary }}>13:00 - 15:30</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Protected Deep Work</p>
                  </div>
                </div>

                {/* Salı (Aksiyonun Olduğu Odak Sütunu) */}
                <div className="flex flex-col gap-4 relative">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.colors.bgSurfaceSubtle, borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.textMuted }}>10:00 - 11:30</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Architecture Sync</p>
                  </div>

                  {/* Statik Sabit Blok (14:00) */}
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(15, 23, 42, 0.04)', borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.textMuted }}>14:00 - 15:00</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Customer Advisory Call</p>
                  </div>

                  {/* Dinamik Otonom Çözülen Blok (14:00'dan 15:30'a kayar) */}
                  <div
                    className="b2-conflict-block absolute top-[110px] inset-x-0 p-5 rounded-2xl border shadow-lg z-20"
                    style={{
                      backgroundColor: theme.colors.bgSurface,
                      borderColor: theme.colors.accentPrimary,
                      boxShadow: '0 12px 30px rgba(37, 99, 235, 0.15)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] font-mono font-bold" style={{ color: theme.colors.accentPrimary }}>
                        15:30 - 17:00
                      </span>
                      <span className="px-2.5 py-0.5 rounded text-[16px] font-mono font-bold uppercase" style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', color: theme.colors.accentPrimary }}>
                        OPTIMIZED
                      </span>
                    </div>
                    <p className="text-[22px] font-bold mt-2" style={{ color: theme.colors.textPrimary }}>
                      Q4 Strategy with Core Team
                    </p>
                    <p className="text-[18px] mt-1" style={{ color: theme.colors.textMuted }}>
                      3 Invitees Synced • 0 Conflicts
                    </p>
                  </div>
                </div>

                {/* Çarşamba */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(37, 99, 235, 0.04)', borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.accentPrimary }}>09:00 - 12:30</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Focus Flow Sprint</p>
                  </div>
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.colors.bgSurfaceSubtle, borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.textMuted }}>14:00 - 15:00</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Design Crit</p>
                  </div>
                </div>

                {/* Perşembe */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: theme.colors.bgSurfaceSubtle, borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.textMuted }}>11:00 - 12:00</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Product Review</p>
                  </div>
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(37, 99, 235, 0.04)', borderColor: theme.colors.borderSubtle }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.accentPrimary }}>13:30 - 16:30</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Deep Synthesis</p>
                  </div>
                </div>

                {/* Cuma */}
                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl border" style={{ backgroundColor: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.25)' }}>
                    <p className="text-[18px] font-mono font-semibold" style={{ color: theme.colors.statusSuccess }}>14:00 - 16:00</p>
                    <p className="text-[20px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>Team Retro & Wrap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* BEAT 3: KAZANILAN ZAMAN TELEMETRİSİ & SVG SPARKLINE               */}
        {/* ================================================================= */}
        <section
          className="scene-beat-3 absolute inset-0 flex flex-col items-center justify-center px-20"
          style={{ opacity: 0 }}
        >
          <BackdropField theme={theme} variant="rings" intensity={0.45} />

          <div className="flex flex-col items-center gap-8 max-w-[1440px] w-full z-10">
            {/* Üst Başlık */}
            <div className="b3-header flex items-center justify-between w-full px-4">
              <div>
                <h2 className="text-[38px] font-extrabold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                  FOCUS METRICS
                </h2>
                <p className="text-[20px]" style={{ color: theme.colors.textMuted }}>
                  Measurable Operational Telemetry • Zero Hallucinations
                </p>
              </div>

              <div
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border shadow-sm"
                style={{
                  backgroundColor: theme.colors.bgSurface,
                  borderColor: theme.colors.borderSubtle,
                  color: theme.colors.accentPrimary,
                }}
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="text-[18px] font-mono font-bold">VERIFIED RECLAIMED TIME</span>
              </div>
            </div>

            {/* 3'lü Bento Telemetri Paneli */}
            <div className="grid grid-cols-12 gap-8 w-full">
              {/* Sol: Büyük Sayaç Kartı (Col 5) */}
              <div
                className="b3-kpi-main col-span-5 rounded-[24px] border p-8 flex flex-col justify-between shadow-xl"
                style={{
                  backgroundColor: theme.colors.bgSurface,
                  borderColor: theme.colors.borderSubtle,
                  boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[18px] font-mono font-bold uppercase tracking-wider" style={{ color: theme.colors.textMuted }}>
                      TIME RECOVERED / WEEK
                    </span>
                    <span className="px-3 py-1 rounded-full text-[16px] font-mono font-bold" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: theme.colors.statusSuccess }}>
                      +42.8% YoY
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 mt-8">
                    <span className="text-[96px] font-black tracking-[-0.04em] leading-none" style={{ color: theme.colors.accentPrimary }}>
                      +{focusHours}
                    </span>
                    <span className="text-[36px] font-bold" style={{ color: theme.colors.textMuted }}>
                      hours
                    </span>
                  </div>

                  <p className="text-[20px] font-medium mt-4 leading-relaxed" style={{ color: theme.colors.textMuted }}>
                    Reclaimed directly from fragmented context switching and meeting friction.
                  </p>
                </div>

                <div className="pt-6 border-t mt-8 flex items-center justify-between" style={{ borderColor: theme.colors.borderSubtle }}>
                  <span className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>Target: 20 hrs/week</span>
                  <div className="w-[180px] h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: '92%', backgroundColor: theme.colors.accentPrimary }} />
                  </div>
                </div>
              </div>

              {/* Sağ: SVG Sparkline Çizim Grafiği (Col 7) */}
              <div
                className="b3-chart-card col-span-7 rounded-[24px] border p-8 flex flex-col justify-between shadow-xl"
                style={{
                  backgroundColor: theme.colors.bgSurface,
                  borderColor: theme.colors.borderSubtle,
                  boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.08)',
                }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingDown className="w-6 h-6" style={{ color: theme.colors.statusSuccess }} />
                      <span className="text-[22px] font-bold" style={{ color: theme.colors.textPrimary }}>
                        Meeting Fatigue Reduction
                      </span>
                    </div>
                    <span className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>
                      30-Day Rolling Velocity
                    </span>
                  </div>

                  {/* Dinamik SVG Sparkline */}
                  <div className="mt-6 w-full h-[180px] relative">
                    <svg viewBox="0 0 680 180" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
                          <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Alan Dolgusu */}
                      <path
                        d="M 20 160 Q 140 140 240 90 T 440 60 T 660 25 L 660 170 L 20 170 Z"
                        fill="url(#chartGradient)"
                      />

                      {/* Ana Vektör Eğrisi */}
                      <path
                        d="M 20 160 Q 140 140 240 90 T 440 60 T 660 25"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="5"
                        strokeLinecap="round"
                        strokeDasharray={pathLength}
                        strokeDashoffset={strokeOffset}
                      />

                      {/* Veri Noktaları */}
                      <circle cx="20" cy="160" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="4" />
                      <circle cx="240" cy="90" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="4" />
                      <circle cx="440" cy="60" r="7" fill="#ffffff" stroke="#2563eb" strokeWidth="4" />
                      <circle cx="660" cy="25" r="9" fill="#2563eb" stroke="#ffffff" strokeWidth="4" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t mt-4" style={{ borderColor: theme.colors.borderSubtle }}>
                  <div>
                    <p className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>Initial Friction</p>
                    <p className="text-[26px] font-bold mt-1" style={{ color: theme.colors.textPrimary }}>32.4 hrs</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>Autonomous Solved</p>
                    <p className="text-[26px] font-bold mt-1" style={{ color: theme.colors.accentPrimary }}>18.4 hrs</p>
                  </div>
                  <div>
                    <p className="text-[18px] font-mono" style={{ color: theme.colors.textMuted }}>Net Free Velocity</p>
                    <p className="text-[26px] font-bold mt-1" style={{ color: theme.colors.statusSuccess }}>14.0 hrs</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* BEAT 4: ZİRVE MARKA VAADİ & EYLEM ÇAĞRISI                         */}
        {/* ================================================================= */}
        <section
          className="scene-beat-4 absolute inset-0 flex flex-col items-center justify-center px-24"
          style={{ opacity: 0 }}
        >
          <BackdropField theme={theme} variant="rays" intensity={0.5} />

          <div className="flex flex-col items-center text-center gap-8 max-w-[1100px] z-10">
            {/* Monolitik Dual-Prizma Marka Amblemi */}
            <div
              className="b4-emblem w-28 h-28 rounded-[32px] flex items-center justify-center shadow-2xl relative"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 25px 60px -10px rgba(37, 99, 235, 0.4)',
              }}
            >
              <Zap className="w-14 h-14 text-white" />
              <div
                className="absolute inset-0 rounded-[32px] border-2 pointer-events-none"
                style={{ borderColor: 'rgba(255, 255, 255, 0.35)' }}
              />
            </div>

            {/* Üst Kanca */}
            <p
              className="b4-eyebrow text-[22px] font-mono font-bold uppercase tracking-[0.22em]"
              style={{ color: theme.colors.accentPrimary }}
            >
              TIME IS YOUR HIGHEST LEVERAGE
            </p>

            {/* Marka Adı & Başlık */}
            <h1
              className="b4-headline text-[88px] font-black tracking-[-0.04em] leading-[0.98]"
              style={{ color: theme.colors.textPrimary }}
            >
              LUMEN
            </h1>

            {/* Alt Başlık */}
            <p
              className="b4-subheadline text-[26px] font-medium max-w-[820px] leading-relaxed"
              style={{ color: theme.colors.textMuted }}
            >
              The autonomous schedule for high-velocity teams. Zero coordination overhead.
            </p>

            {/* Eylem Çağrısı Butonu */}
            <div
              className="b4-cta-button mt-4 inline-flex items-center gap-5 px-10 py-5 rounded-full shadow-2xl border cursor-pointer"
              style={{
                backgroundColor: theme.colors.accentPrimary,
                borderColor: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                boxShadow: '0 20px 50px -10px rgba(37, 99, 235, 0.45)',
              }}
            >
              <span className="text-[24px] font-bold tracking-tight">
                RECLAIM YOUR FOCUS
              </span>
              <ArrowRight className="w-7 h-7" />
            </div>
          </div>
        </section>
      </CameraRig>
    </AbsoluteFill>
  );
};

export default Scene;
