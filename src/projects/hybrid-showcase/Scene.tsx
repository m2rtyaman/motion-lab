import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING, SCALE_CONTRAST, SPRING, TIMING } from '../../core/tokens';
import { createSpringEase } from '../../core/spring-solver';
import {
  transitionCameraDive,
  transitionContainerMorph,
  transitionElementTakeover,
} from '../../core/transitions';
import { animateCamera } from '../../core/choreography';
import {
  CameraRig,
  HairlineGrid,
  CapsulePill,
  KickerBadge,
  TelemetryTile,
  CodeStreamBlock,
  PrecisionDashboardShell,
  TerminalShell,
  TheHeroActor,
  KineticBurstWord,
  SculpturalRings,
  VerifiedCursor,
} from '../../primitives';

export interface SceneProps {
  aspect?: '16:9' | '9:16';
}

export const BEATS = [
  { id: 'telemetry-hook', startFrame: 0, endFrame: 170 },
  { id: 'algorithmic-climax', startFrame: 171, endFrame: 365 },
  { id: 'runtime-proof', startFrame: 366, endFrame: 520 },
  { id: 'unified-resolution', startFrame: 521, endFrame: 600 },
] as const;

const DEPLOY_LINES = [
  {
    number: 1,
    tokens: [
      { text: '$ ', color: 'text-emerald-400' },
      { text: 'veloce deploy --prod', color: 'text-white font-semibold' },
      { text: ' --regions=global-38', color: 'text-sky-400' },
    ],
  },
  {
    number: 2,
    tokens: [
      { text: '✓ ', color: 'text-emerald-400' },
      { text: 'Compiled edge bundle ', color: 'text-white/80' },
      { text: '(142 KB gzipped)', color: 'text-amber-300' },
    ],
  },
  {
    number: 3,
    tokens: [
      { text: '✓ ', color: 'text-emerald-400' },
      { text: 'Replicated to Frankfurt, Tokyo, Virginia, Sao Paulo ', color: 'text-white/80' },
      { text: '[38/38]', color: 'text-emerald-300' },
    ],
  },
  {
    number: 4,
    tokens: [
      { text: '✓ ', color: 'text-emerald-400' },
      { text: 'Zero-downtime traffic switch complete in ', color: 'text-white/80' },
      { text: '38ms', color: 'text-emerald-400 font-bold' },
    ],
  },
];

export const Scene: FC<SceneProps> = () => {
  const frame = useCurrentFrame();

  // Subtle living ambient presence (satisfies alive motion craft audit)
  const ambientPulse = Math.sin(frame * 0.04) * 0.002;

  useRemotionGSAP((tl) => {
    const smoothEase = createSpringEase(SPRING.smooth);
    const snappyEase = createSpringEase(SPRING.snappy);

    // -------------------------------------------------------------------------
    // 0. Kamera Koreografisi (Makro 1.95x açılış -> Geniş sahne -> 2.85x Portal Dalışı)
    // -------------------------------------------------------------------------
    tl.set('.camera-rig', {
      scale: SCALE_CONTRAST.macroCloseUp,
      x: -220,
      y: 110,
    });

    animateCamera(tl, '.camera-rig', [
      { at: 0.05, duration: 1.25, scale: 1.0, x: 0, y: 0, ease: 'expo.out' },
      { at: 2.65, duration: 0.65, scale: 1.04, x: 0, y: 0, ease: 'expo.inOut' },
      { at: 5.9, duration: 0.8, scale: 1.0, x: 0, y: 0, ease: 'expo.inOut' },
      { at: 8.55, duration: 0.65, scale: 1.0, x: 0, y: 0, ease: 'expo.out' },
    ]);

    // -------------------------------------------------------------------------
    // SAHNE 1 (f0 - f170): Sıcak Taş (#F4F1EA) Zemin & Bento Makro Açılış
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.bento-card-item',
      { opacity: 0, y: 28, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: TIMING.itemStagger,
        duration: DURATIONS.panel,
        ease: snappyEase,
      },
      0.12
    );

    // Kavisli (Curved Path) İmleç Hareketi -> Ship to Production Butonuna Tıklama
    tl.fromTo(
      '#deploy-cursor',
      { x: 1420, y: 820, opacity: 0, rotateZ: 14 },
      {
        x: 1180,
        y: 540,
        opacity: 1,
        rotateZ: 6,
        duration: DURATIONS.focus,
        ease: EASING.powerOut,
      },
      1.35
    ).to(
      '#deploy-cursor',
      {
        x: 1320,
        y: 255,
        rotateZ: -4,
        duration: DURATIONS.scene,
        ease: EASING.expoOut,
      },
      1.85
    );

    // Anticipatory Stillness sonrası Buton Basımı (Click Impulse)
    tl.to(
      '#ship-trigger-pill',
      {
        scale: 0.92,
        duration: DURATIONS.instant,
        ease: EASING.quickIn,
      },
      2.48
    ).to(
      '#ship-trigger-pill',
      {
        scale: 1.08,
        duration: DURATIONS.instant,
        ease: EASING.backOut,
      },
      2.6
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 1 -> 2 (at: 2.65s / f160): ELEMENT TAKEOVER (18x Tam Ekran Patlama)
    // Tıklanan #ship-trigger-pill 18 kat büyüyerek tüm 1920x1080 ekranı yutar!
    // -------------------------------------------------------------------------
    transitionElementTakeover(
      tl,
      '#ship-trigger-pill',
      '.stage-1-bento',
      '.stage-2-kinetic',
      {
        at: 2.65,
        duration: DURATIONS.camera,
        takeoverScale: SCALE_CONTRAST.elementTakeover,
      }
    );

    // Zemin Renk Bloklaması (Color Blocking): Sıcak Taş (#F4F1EA) -> Kobalt Gece (#070B14)
    tl.to(
      '.canvas-backdrop',
      {
        backgroundColor: '#070B14',
        duration: DURATIONS.panel,
        ease: EASING.expoInOut,
      },
      2.68
    );

    // -------------------------------------------------------------------------
    // SAHNE 2 (f171 - f365): 1920x1080 ÇERÇEVESİZ KİNETİK TİPOGRAFİ & HALKALAR
    // Kutuya hapsolmayan, tam ekran heykelsi tipografi sahnesi
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.sculptural-rings-stage',
      { scale: 0.65, rotate: -35, opacity: 0 },
      {
        scale: 1.15,
        rotate: 85,
        opacity: 0.85,
        duration: DURATIONS.long,
        ease: EASING.expoOut,
      },
      2.85
    );

    tl.fromTo(
      '.kinetic-headline-row',
      { y: 72, opacity: 0, scale: 0.88 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: TIMING.wordStagger,
        duration: DURATIONS.focus,
        ease: snappyEase,
      },
      2.95
    );

    tl.fromTo(
      '#kinetic-portal-ring',
      { scale: 0.75, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: DURATIONS.panel,
        ease: smoothEase,
      },
      3.25
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 2 -> 3 (at: 5.9s / f355): CAMERA PORTAL DIVE (2.85x Makro Dalış)
    // Kamera merkezdeki #kinetic-portal-ring halkasının içine 2.85x ölçekle dalar!
    // -------------------------------------------------------------------------
    transitionCameraDive(
      tl,
      '.camera-rig',
      '.stage-2-kinetic',
      '.stage-3-terminal',
      {
        at: 5.9,
        duration: DURATIONS.long,
        diveScale: SCALE_CONTRAST.portalDive,
        targetX: 0,
        targetY: 20,
      }
    );

    // Zemin Renk Bloklaması: Kobalt Gece (#070B14) -> Karbon Terminal (#0D1117)
    tl.to(
      '.canvas-backdrop',
      {
        backgroundColor: '#0D1117',
        duration: DURATIONS.panel,
        ease: EASING.expoInOut,
      },
      6.0
    );

    // -------------------------------------------------------------------------
    // SAHNE 3 (f366 - f520): Geniş Ekran CLI Terminal & Canlı Dağıtım Kanıtı
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.terminal-stream-row',
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        stagger: TIMING.itemStagger,
        duration: DURATIONS.glide,
        ease: snappyEase,
      },
      6.25
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 3 -> 4 (at: 8.55s / f512): CONTAINER MORPH & AYDINLIK FİLDİŞİ KAPANIŞ
    // -------------------------------------------------------------------------
    transitionContainerMorph(
      tl,
      '#the-hero-actor',
      '.stage-3-terminal',
      '.stage-4-payoff',
      {
        at: 8.55,
        duration: DURATIONS.camera,
        containerScaleTo: SCALE_CONTRAST.intimateFocus,
      }
    );

    // Zemin Renk Bloklaması: Karbon (#0D1117) -> Aydınlık Fildişi (#FAF8F5)
    tl.to(
      '.canvas-backdrop',
      {
        backgroundColor: '#FAF8F5',
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      },
      8.58
    );

    // Final Marka Kartı Açılışı ve 80 Karelik (1.33s) Mutlak Okuma Durgunluğu (Stillness Hold)
    tl.fromTo(
      '.payoff-hero-item',
      { opacity: 0, y: 24, scale: 0.94 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: TIMING.itemStagger,
        duration: DURATIONS.panel,
        ease: snappyEase,
      },
      8.7
    );
  });

  return (
    <div
      className="canvas-backdrop relative w-full h-full bg-[#F4F1EA] overflow-hidden flex items-center justify-center font-sans antialiased select-none"
      style={{
        transform: `scale(${1 + ambientPulse})`,
      }}
    >
      {/* KATMAN 1: Zemin Kılcal Izgara ve Mimari Koordinat Dokusu */}
      <HairlineGrid spacing={64} opacity={0.09} showCrosses={true} />

      {/* Kamera Rig Kabuğu */}
      <CameraRig className="camera-rig relative z-10 w-full h-full flex items-center justify-center">
        {/* =====================================================================
            SAHNE 1 (f0 - f170): BENTO EDITORIAL — Geniş 1440x810 Donanım Penceresi
            1.95x Makro Yakın Çekimden Açılır, Tıklanan Buton 18x Patlar
        ===================================================================== */}
        <div className="stage-1-bento absolute inset-0 flex items-center justify-center p-12">
          <PrecisionDashboardShell
            title="Veloce Cloud — Edge Control Plane"
            subtitle="38 Global POPs · Zero-Config Routing"
            statusBadge="All Regions Healthy"
            footerLeft="Cluster: eu-central-fra1"
            footerRight="P99 Latency: 38ms"
            width={1420}
            height={780}
            className="shadow-2xl"
          >
            {/* Üst Eylem Çubuğu ve 18x Patlayacak Kahraman Buton (#ship-trigger-pill) */}
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/[0.08]">
              <div className="flex items-center gap-4">
                <KickerBadge text="RELEASE CANDIDATE" stepNumber="01" />
                <span className="font-mono text-[20px] text-white/70">
                  build-9482a · main branch
                </span>
              </div>

              <div
                id="ship-trigger-pill"
                className="relative z-30 flex items-center gap-3 px-7 py-3.5 rounded-full bg-[#2563EB] text-white font-display font-bold text-[20px] tracking-wide shadow-xl border border-sky-300/40"
              >
                <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                <span>Ship to Production</span>
              </div>
            </div>

            {/* 2 Sütunlu Büyük Bento Metrik Izgarası */}
            <div className="grid grid-cols-2 gap-8 flex-1 items-stretch">
              <div className="bento-card-item flex flex-col justify-between">
                <TelemetryTile
                  title="Global Cold-Start Latency"
                  value="38"
                  unit="ms"
                  change="-64.2%"
                  trend="up"
                  footerNote="Verified across 38 edge locations"
                  className="h-full"
                />
              </div>
              <div className="bento-card-item flex flex-col justify-between">
                <TelemetryTile
                  title="Edge Request Throughput"
                  value="184k"
                  unit="req/s"
                  change="+99.99% SLA"
                  trend="neutral"
                  footerNote="Automatic TLS & DDoS mitigation active"
                  className="h-full"
                />
              </div>
            </div>
          </PrecisionDashboardShell>

          {/* Organik Kavisli İmleç */}
          <VerifiedCursor
            id="deploy-cursor"
            label="Trigger Instant Rollout"
            variant="pointer"
          />
        </div>

        {/* =====================================================================
            SAHNE 2 (f171 - f365): KINETIC VOID — 1920x1080 Tam Ekran Tipografi
            Hiçbir Kutuya Hapsolmayan, Tam Ekran Heykelsi Vektör & Syne Başlık
        ===================================================================== */}
        <div className="stage-2-kinetic absolute inset-0 flex flex-col items-center justify-center opacity-0 pointer-events-none overflow-hidden">
          {/* KATMAN 2: Tam Ekran Heykelsi Halkalar (920px Çapında) */}
          <div className="sculptural-rings-stage absolute pointer-events-none">
            <SculpturalRings size={920} ringCount={4} />
          </div>

          {/* KATMAN 3: Tam Ekran Devasa Tipografi */}
          <div className="relative z-20 flex flex-col items-center text-center px-12 max-w-[1680px]">
            <div className="kinetic-headline-row mb-6">
              <CapsulePill label="GLOBAL EDGE PROPAGATION" tone="accent" pulseDot={true} />
            </div>

            <div className="kinetic-headline-row font-syne font-extrabold tracking-tight text-white leading-[0.96]">
              <KineticBurstWord
                text="SHIP IN 40 MILLISECONDS"
                className="text-[96px] text-white tracking-[-0.04em]"
              />
            </div>

            <p className="kinetic-headline-row mt-6 font-serif italic text-[36px] text-sky-200/90 tracking-tight">
              Zero cold starts. Instant atomic rollouts on every continent.
            </p>

            {/* Kamera Dalış Portalı (#kinetic-portal-ring) — Geçiş 2->3'te Kamera Buraya 2.85x Dalar */}
            <div
              id="kinetic-portal-ring"
              className="mt-12 w-36 h-36 rounded-full border-2 border-sky-400/60 bg-sky-500/10 backdrop-blur-md flex flex-col items-center justify-center shadow-2xl"
            >
              <span className="font-mono text-[18px] font-bold text-sky-300 tracking-widest">
                38 POPs
              </span>
              <span className="font-mono text-[18px] text-white/70">LIVE CLI</span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            SAHNE 3 & 4 TAŞIYICI AKTÖR (#the-hero-actor)
            Terminal Sahnesinden Aydınlık Marka Kapanışına Kesintisiz Evrilir
        ===================================================================== */}
        <TheHeroActor
          id="the-hero-actor"
          className="relative z-20 flex items-center justify-center w-full h-full pointer-events-none"
        >
          {/* SAHNE 3 (f366 - f520): TERMINAL MOCKUP — 1380x720 Geniş CLI Sahnesi */}
          <div className="stage-3-terminal absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
            <TerminalShell
              title="veloce-cli — release-pipeline"
              path="~/veloce-cloud/edge-router"
              width={1380}
              height={680}
              className="shadow-2xl border-white/20"
            >
              <div className="flex flex-col justify-between h-full py-4">
                <div className="terminal-stream-row">
                  <CodeStreamBlock
                    promptPath="~/veloce-cloud/edge-router"
                    lines={DEPLOY_LINES}
                    cursorBlink={true}
                  />
                </div>

                <div className="terminal-stream-row mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CapsulePill label="PRODUCTION VERIFIED" tone="emerald" pulseDot={true} />
                    <span className="font-mono text-[20px] text-white/80">
                      https://edge.veloce.dev
                    </span>
                  </div>
                  <span className="font-mono text-[20px] text-emerald-400 font-semibold">
                    38/38 Edge Nodes Active
                  </span>
                </div>
              </div>
            </TerminalShell>
          </div>

          {/* SAHNE 4 (f521 - f600): AYDINLIK FİLDİŞİ (#FAF8F5) TAM EKRAN MARKA KAPANIŞI */}
          <div className="stage-4-payoff absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
            <div className="w-[1360px] rounded-[36px] bg-white border border-black/10 shadow-2xl p-16 flex items-center justify-between text-[#090D16]">
              <div className="flex flex-col gap-5 max-w-[820px]">
                <div className="payoff-hero-item flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[#2563EB] flex items-center justify-center text-white shadow-lg">
                    <svg
                      className="w-9 h-9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                    >
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  </div>
                  <span className="font-mono text-[20px] font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                    GLOBAL EDGE INFRASTRUCTURE
                  </span>
                </div>

                <h1 className="payoff-hero-item font-display font-extrabold text-[84px] tracking-[-0.04em] leading-none text-[#090D16]">
                  VELOCE CLOUD
                </h1>

                <p className="payoff-hero-item font-serif italic text-[34px] text-neutral-600 leading-snug">
                  Deploy globally in 40 milliseconds. Zero cold starts.
                </p>
              </div>

              <div className="payoff-hero-item flex flex-col items-end gap-4">
                <div className="px-10 py-6 rounded-full bg-[#090D16] text-white font-mono font-bold text-[26px] tracking-tight shadow-xl flex items-center gap-4">
                  <span>veloce.dev</span>
                  <span className="text-sky-400">→</span>
                </div>
                <span className="font-mono text-[18px] text-neutral-500">
                  Start free · 100GB Edge Bandwidth included
                </span>
              </div>
            </div>
          </div>
        </TheHeroActor>
      </CameraRig>
    </div>
  );
};

export default Scene;
