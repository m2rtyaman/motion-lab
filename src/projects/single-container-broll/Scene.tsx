import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING, TIMING, SPRING } from '../../core/tokens';
import { createSpringEase } from '../../core/spring-solver';
import { transitionContainerMorph, transitionZoomPunch } from '../../core/transitions';
import { animateCamera } from '../../core/choreography';
import {
  createCurvedCursorTrajectory,
  animateCursorAlongBezier,
  generateCurvedCursorTrajectory,
} from '../../core/bezierTrajectories';
import { SpotlightStage, CameraRig } from '../../primitives';
import { MacOSCursor } from '../../assets/vectors/MacOSCursorSet';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

// COLOR_BLOCK: Dynamic color blocking across stages (#0B0F19 obsidian -> #FFFFFF clean white)
export const BEATS = [
  { id: 'hook', startFrame: 0, endFrame: 150, text: 'Gemini 3.8 Flash Live' },
  { id: 'proof', startFrame: 151, endFrame: 320, text: 'Gemini Streaming Runtime' },
  { id: 'flow', startFrame: 321, endFrame: 520, text: 'Adaptive Thinking Controller' },
  { id: 'verdict', startFrame: 521, endFrame: 720, text: 'Gemini 3.8 Flash Native Multimodal' },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  // Subtle organic ambient life pulse for natural presence
  const ambientPulse = Math.sin(frame * 0.05) * 0.003;

  useRemotionGSAP((tl) => {
    // 0. Liquid / Smooth Dynamic Camera Depth Orchestration (Spring physics: stiffness: 120, damping: 24)
    // Reactive dynamic camera responds to container morphs: intimate focus on compact elements (scale: 1.06),
    // smooth fluid pull-back on wide windows (scale: 1.0). Zero arbitrary x/y wobble.
    const cameraSpringEase = createSpringEase(SPRING.smooth);

    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0.35, scale: 1.06, ease: cameraSpringEase },
      { at: 2.5, duration: 0.85, scale: 1.0, ease: cameraSpringEase },
      { at: 5.33, duration: 0.85, scale: 1.05, ease: cameraSpringEase },
      { at: 8.64, duration: 0.8, scale: 1.0, ease: cameraSpringEase },
    ]);

    // 1. Continuous Living Container Morphing (#the-morph-container)
    // The canvas is rock-solid stationary; only the central living container moves & morphs!

    // Stage 1 -> Stage 2: Capsule springs into Google GenAI Terminal at 2.50s (frame 150)
    tl.to(
      '#the-morph-container',
      {
        width: 940,
        height: 480,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 32px 72px -16px rgba(11, 15, 25, 0.12), 0 0 0 1px rgba(0,0,0,0.04)',
        duration: 0.85,
        ease: 'back.out(1.25)',
      },
      2.5
    );

    // Stage 2 -> Stage 3: Terminal morphs into Thinking Segmented Controller at 5.33s (frame 320)
    tl.to(
      '#the-morph-container',
      {
        width: 880,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 24px 56px -12px rgba(11, 15, 25, 0.1), 0 0 0 1px rgba(0,0,0,0.04)',
        duration: 0.85,
        ease: 'back.out(1.3)',
      },
      5.33
    );

    // Stage 3 -> Stage 4: Controller transforms into Telemetry Card at 8.64s (frame 518)
    tl.to(
      '#the-morph-container',
      {
        width: 960,
        height: 480,
        borderRadius: 28,
        backgroundColor: '#FFFFFF',
        borderColor: 'rgba(0,0,0,0.08)',
        boxShadow: '0 40px 90px -20px rgba(11, 15, 25, 0.16), 0 0 0 1px rgba(0,0,0,0.04)',
        duration: 0.5,
        ease: EASING.expoOut,
      },
      8.64
    );

    // Transitions across layers inside the living container
    transitionContainerMorph(tl, '#the-morph-container', '.stage-layer-1', '.stage-layer-2', {
      at: 2.5,
      duration: 0.85,
      ease: EASING.expoInOut,
    });
    transitionContainerMorph(tl, '#the-morph-container', '.stage-layer-2', '.stage-layer-3', {
      at: 5.33,
      duration: 0.85,
      ease: EASING.expoInOut,
    });
    transitionZoomPunch(tl, '.stage-layer-3', '.stage-layer-4', {
      at: 8.64,
      duration: 0.08,
      ease: EASING.expoOut,
    });

    // 2. Element Entrances & Micro-Choreography
    // Stage 1 Entrance (immediate from frame 0 so frame 3 is fully composed)
    tl.fromTo(
      '#the-morph-container',
      { scale: 0.92, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.35,
        ease: 'back.out(1.4)',
      },
      0.0
    );

    tl.fromTo(
      '.stage-1-item',
      { opacity: 0, y: 8 },
      {
        opacity: 1,
        y: 0,
        duration: DURATIONS.item,
        stagger: TIMING.streakStagger,
        ease: EASING.expoOut,
      },
      0.0
    );

    // Specular light sheen sweeping across obsidian capsule in Beat 1
    tl.fromTo(
      '.specular-sweep',
      { x: -350, opacity: 0 },
      {
        x: 520,
        opacity: 0.5,
        duration: 1.4,
        ease: EASING.powerInOut,
      },
      0.4
    );

    // Celestial Gemini sparkle rotation
    tl.fromTo(
      '.stage-1-sparkle',
      { rotate: -15 },
      {
        rotate: 15,
        duration: 1.8,
        ease: EASING.sineInOut,
      },
      0.2
    );

    // Stage 2 Code Stream Stagger
    tl.fromTo(
      '.code-line',
      { opacity: 0, x: -14 },
      {
        opacity: 1,
        x: 0,
        duration: 0.45,
        stagger: 0.07,
        ease: EASING.powerOut,
      },
      2.65
    );

    // Stage 4 Telemetry Metrics Stagger
    tl.fromTo(
      '.telemetry-cell',
      { opacity: 0, y: 16, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.28,
        stagger: 0.04,
        ease: 'back.out(1.2)',
      },
      8.64
    );

    // 3. Realistic Organic Curved Cursor Choreography
    // Trajectory 1: Enter & swoop into Stage 1 badge along natural curved Bézier arc
    // Hotspot precision under camera scale 1.06: Target container at (1122.5, 536.5) lands pointer tip exactly on Flash Live badge center (1127.5, 540)
    const traj1 = generateCurvedCursorTrajectory({
      start: { x: 1440, y: 860 },
      end: { x: 1122.5, y: 536.5 },
      curvature: 0.26,
      direction: 'auto',
    });

    tl.fromTo(
      '.simulated-cursor',
      { x: traj1.p0.x, y: traj1.p0.y, opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.35, ease: EASING.powerOut },
      0.5
    );

    animateCursorAlongBezier(tl, '.simulated-cursor', traj1, 0.5, 1.4, {
      steps: 16,
      easeFn: (p) => 1 - Math.pow(1 - p, 3),
    });

    // Pre-click anticipation: subtle recoil
    tl.to(
      '.simulated-cursor',
      { y: 528.5, scale: 1.05, duration: 0.16, ease: EASING.powerInOut },
      2.26
    );

    // Click Squash & Ripple at Badge (Triggering Stage 2)
    tl.to(
      '.simulated-cursor',
      { y: 536.5, scale: 0.84, duration: 0.12, ease: EASING.powerOut },
      2.46
    ).to(
      '.simulated-cursor',
      { scale: 1.0, duration: 0.2, ease: 'back.out(1.5)' },
      2.58
    );

    tl.fromTo(
      '.cursor-ripple',
      { scale: 0.3, opacity: 0.8 },
      { scale: 2.2, opacity: 0, duration: 0.45, ease: EASING.expoOut },
      2.46
    );

    // Badge click tactile response
    tl.to('.stage-1-badge', { scale: 0.88, duration: 0.1, ease: EASING.powerOut }, 2.46)
      .to('.stage-1-badge', { scale: 1.0, duration: 0.2, ease: 'back.out(1.4)' }, 2.56);

    // Trajectory 2 (Beat 2): Cursor inspects stream
    const traj2 = createCurvedCursorTrajectory({
      start: { x: 1122.5, y: 536.5 },
      end: { x: 860, y: 480 },
      curvature: 0.18,
      direction: 'cw',
    });
    animateCursorAlongBezier(tl, '.simulated-cursor', traj2, 3.2, 0.9, {
      steps: 12,
      easeFn: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
    });

    // Trajectory 3 (Beat 2 -> Beat 3): Cursor swoops to initial slider stop (Low handle at x: 616, y: 536.5)
    const traj3 = createCurvedCursorTrajectory({
      start: { x: 860, y: 480 },
      end: { x: 616, y: 536.5 },
      curvature: 0.22,
      direction: 'auto',
    });
    animateCursorAlongBezier(tl, '.simulated-cursor', traj3, 4.6, 1.0, {
      steps: 14,
      easeFn: (p) => 1 - Math.pow(1 - p, 2),
    });

    // Beat 3: Segmented Slider Interaction (Low -> Medium -> High -> Argon)
    // 1. Cursor grabs handle at 5.75s
    tl.to(
      '.simulated-cursor',
      { scale: 0.86, duration: 0.12, ease: EASING.powerOut },
      5.75
    ).to(
      '.simulated-cursor',
      { scale: 0.96, duration: 0.15, ease: 'back.out(1.4)' },
      5.87
    );

    tl.fromTo(
      '.cursor-ripple',
      { scale: 0.3, opacity: 0.8 },
      { scale: 2.0, opacity: 0, duration: 0.4, ease: EASING.expoOut },
      5.75
    );

    // 2. Drag 1: Stop 0 (Low, x: 0, cursor: 616) -> Stop 2 (High, pill x: 426, cursor: 1063)
    tl.to(
      '.active-slider-pill',
      { x: 426, duration: 0.7, ease: 'back.out(1.6)' },
      5.95
    );
    tl.to(
      '.simulated-cursor',
      { x: 1063, duration: 0.7, ease: 'back.out(1.6)' },
      5.95
    );

    // Text state transitions during Drag 1:
    tl.to('#stop-label-low', { color: '#71717A', duration: 0.3, ease: EASING.powerOut }, 6.05);
    tl.to('#stop-label-high', { color: '#FFFFFF', duration: 0.35, ease: EASING.powerOut }, 6.25);

    // Tactile micro-pause at Stop 2 (anticipatory hold, 6.65s - 6.95s)
    tl.to('.simulated-cursor', { scale: 0.9, duration: 0.1, ease: EASING.powerInOut }, 6.9);

    // 3. Drag 2: Stop 2 (High, pill x: 426, cursor: 1063) -> Stop 3 (Argon, pill x: 639, cursor: 1287)
    tl.to(
      '.active-slider-pill',
      { x: 639, duration: 0.65, ease: 'back.out(1.8)' },
      7.0
    );
    tl.to(
      '.simulated-cursor',
      { x: 1287, duration: 0.65, ease: 'back.out(1.8)' },
      7.0
    );

    // Text state transitions during Drag 2:
    tl.to('#stop-label-high', { color: '#71717A', duration: 0.25, ease: EASING.powerOut }, 7.1);
    tl.to('#stop-label-argon', { color: '#FFFFFF', duration: 0.3, ease: EASING.powerOut }, 7.25);

    // Click snap & release on Stop 3 (Argon)
    tl.to('.simulated-cursor', { scale: 0.84, duration: 0.1, ease: EASING.powerOut }, 7.65)
      .to('.simulated-cursor', { scale: 1.0, duration: 0.2, ease: 'back.out(1.5)' }, 7.75);

    tl.fromTo(
      '.cursor-ripple',
      { scale: 0.3, opacity: 0.8 },
      { scale: 2.2, opacity: 0, duration: 0.45, ease: EASING.expoOut },
      7.65
    );

    // Trajectory 4: Cursor exits along Bézier arc toward bottom-right
    const traj4 = createCurvedCursorTrajectory({
      start: { x: 1287, y: 536.5 },
      end: { x: 1540, y: 820 },
      curvature: 0.2,
      direction: 'cw',
    });
    animateCursorAlongBezier(tl, '.simulated-cursor', traj4, 8.0, 0.7, {
      steps: 10,
      easeFn: (p) => p * p,
    });
    tl.to(
      '.simulated-cursor',
      { opacity: 0, duration: 0.35, ease: EASING.powerOut },
      8.35
    );
  }, []);

  return (
    <SpotlightStage aspect={aspect} background="#EAE8E3" clean={true} showCrosshairs={false}>
      {/* 1. Subtle Paper Texture & Architectural Grid Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.035]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="paper-grid" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#000000" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#paper-grid)" />
        </svg>
      </div>

      {/* 2. Sinematik Sahne Taşıyıcı (Liquid Reactive Camera Canvas) */}
      <CameraRig className="camera-rig">
        {/*
          Continuous morphing container across 720 frames.
          Physically morphs width, height, borderRadius, background and box-shadow.
        */}
        <div
          id="the-morph-container"
          className="morph-container relative flex items-center justify-center overflow-hidden transition-none select-none"
          style={{
            width: 500,
            height: 104,
            borderRadius: 52,
            backgroundColor: '#0B0F19',
            border: '1px solid rgba(66, 133, 244, 0.25)',
            boxShadow: '0 24px 60px -12px rgba(11, 15, 25, 0.4), 0 0 0 1px rgba(66, 133, 244, 0.1)',
            transform: `scale(${1 + ambientPulse})`,
            willChange: 'width, height, border-radius, background-color, transform',
          }}
        >
          {/* =========================================================
              STAGE 1: Sleek Gemini Obsidian Capsule (0 - 150 frames)
             ========================================================= */}
          <div className="stage-layer-1 absolute inset-0 flex items-center justify-between px-7 pointer-events-none">
            {/* Specular sheen sweep reflection */}
            <div
              className="specular-sweep absolute -inset-y-4 -left-20 w-44 bg-gradient-to-r from-transparent via-[#4285F4]/20 to-transparent -skew-x-12 pointer-events-none"
              style={{ willChange: 'transform' }}
            />

            {/* Sparkle Icon & Title */}
            <div className="stage-1-item flex items-center gap-3.5">
              <div className="stage-1-sparkle w-11 h-11 rounded-full bg-[#1A73E8]/15 border border-[#1A73E8]/30 flex items-center justify-center shadow-[0_0_16px_rgba(26,115,232,0.25)]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                    fill="#1A73E8"
                  />
                </svg>
              </div>

              {/* Title & Brand */}
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold text-white tracking-tight">
                  Gemini
                </span>
                <span className="text-[28px] font-bold text-[#4285F4] tracking-tight whitespace-nowrap">
                  3.8 Flash
                </span>
              </div>
            </div>

            {/* Glowing Interactive Electric Blue Badge */}
            <div className="stage-1-item stage-1-badge flex items-center gap-2 bg-[#1A73E8] text-white px-4 py-2 rounded-full shadow-[0_4px_16px_rgba(26,115,232,0.4)] border border-white/20 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span className="text-[18px] font-bold tracking-wide">Flash Live</span>
            </div>
          </div>

          {/* =========================================================
              STAGE 2: Google GenAI Streaming Terminal (151 - 320 frames)
             ========================================================= */}
          <div className="stage-layer-2 absolute inset-0 flex flex-col p-7 opacity-0 pointer-events-none">
            {/* macOS Style Window Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-black/[0.08]">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#F59E0B]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#10B981]" />
                <span className="ml-3 text-[18px] font-mono font-medium text-zinc-700">
                  gemini.stream.ts
                </span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/80 rounded-md border border-blue-200/60 text-[#1A73E8] text-[18px] font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-[#1A73E8] animate-pulse" />
                <span>Streaming · 12ms TTFT</span>
              </div>
            </div>

            {/* Code Body */}
            <div className="flex-1 pt-5 font-mono text-[19px] leading-relaxed text-zinc-800 space-y-2">
              <div className="code-line flex items-center gap-2">
                <span className="text-zinc-400 select-none w-8 text-right">01</span>
                <span className="text-[#1A73E8] font-semibold">import</span>
                <span>{`{ GoogleGenAI }`}</span>
                <span className="text-[#1A73E8] font-semibold">from</span>
                <span className="text-[#0B57D0] font-medium">'@google/genai'</span>;
              </div>

              <div className="code-line flex items-center gap-2">
                <span className="text-zinc-400 select-none w-8 text-right">02</span>
                <span className="text-[#1A73E8] font-semibold">const</span>
                <span className="font-bold text-zinc-900">ai</span>
                <span>=</span>
                <span className="text-[#1A73E8] font-semibold">new</span>
                <span className="font-bold text-zinc-900">GoogleGenAI()</span>;
              </div>

              <div className="code-line flex items-center gap-2">
                <span className="text-zinc-400 select-none w-8 text-right">03</span>
                <span className="text-[#1A73E8] font-semibold">const</span>
                <span className="font-bold text-zinc-900">response</span>
                <span>=</span>
                <span className="text-[#1A73E8] font-semibold">await</span>
                <span className="text-zinc-900">ai.models.generateContentStream({`{`}</span>
              </div>

              <div className="code-line flex items-center gap-2 pl-8">
                <span className="text-zinc-400 select-none w-8 text-right">04</span>
                <span>model:</span>
                <span className="text-[#0B57D0] font-medium">'gemini-3.8-flash'</span>,
                <span>thinkingBudget:</span>
                <span className="text-[#10B981] font-medium">8192</span>
              </div>

              <div className="code-line flex items-center gap-2">
                <span className="text-zinc-400 select-none w-8 text-right">05</span>
                <span>{`});`}</span>
              </div>

              {/* Status Output Line */}
              <div className="code-line mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span className="text-[18px] font-semibold text-zinc-900">
                    Multimodal Stream · 12ms TTFT
                  </span>
                </div>
                <span className="text-[18px] text-[#1A73E8] font-sans font-bold">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* =========================================================
              STAGE 3: Adaptive Thinking Segmented Slider (321 - 520 frames)
             ========================================================= */}
          <div className="stage-layer-3 absolute inset-0 flex items-center px-3.5 opacity-0 pointer-events-none">
            {/* Active Sliding Pill: Minimal obsidian pill with blue accent */}
            <div
              className="active-slider-pill absolute left-3.5 top-3 h-[96px] w-[206px] rounded-full bg-[#0B0F19] shadow-lg flex items-center justify-center border border-[#1A73E8]/40"
              style={{ willChange: 'transform' }}
            />

            {/* 4 Segmented Stops: Low -> Medium -> High -> Argon */}
            <div className="relative w-full grid grid-cols-4 text-center select-none z-10 pointer-events-none">
              {/* Stop 0: Low (Initial Active) */}
              <div className="flex flex-col items-center justify-center">
                <span
                  id="stop-label-low"
                  className="text-[24px] font-bold tracking-tight transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  Low
                </span>
                <span className="text-[18px] font-mono text-zinc-400">0.5x Effort</span>
              </div>

              {/* Stop 1: Medium */}
              <div className="flex flex-col items-center justify-center">
                <span
                  id="stop-label-med"
                  className="text-[24px] font-bold text-zinc-500 tracking-tight transition-colors"
                >
                  Medium
                </span>
                <span className="text-[18px] font-mono text-zinc-400">1.0x Effort</span>
              </div>

              {/* Stop 2: High (First Drag Stop) */}
              <div className="flex flex-col items-center justify-center">
                <span
                  id="stop-label-high"
                  className="text-[24px] font-bold text-zinc-500 tracking-tight transition-colors"
                >
                  High
                </span>
                <span className="text-[18px] font-mono text-zinc-400">2.0x Effort</span>
              </div>

              {/* Stop 3: Argon (Final Drag Stop) */}
              <div className="flex flex-col items-center justify-center">
                <span
                  id="stop-label-argon"
                  className="text-[24px] font-bold text-zinc-500 tracking-tight transition-colors"
                >
                  Argon
                </span>
                <span className="text-[18px] font-mono text-zinc-400">4.0x Effort</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              STAGE 4: Gemini Telemetry Matrix & DeepMind Lockup (521 - 720 frames)
             ========================================================= */}
          <div className="stage-layer-4 absolute inset-0 flex flex-col p-8 justify-between opacity-0 pointer-events-none">
            {/* Top Heading */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[#1A73E8] shadow-sm" />
                <span className="text-[18px] font-mono font-bold tracking-wider text-zinc-800">
                  GEMINI 3.8 FLASH TELEMETRY MATRIX
                </span>
              </div>
              <span className="text-[18px] font-mono text-[#1A73E8] bg-blue-50 px-3 py-1 rounded-md border border-blue-200 font-semibold">
                DEEPMIND ENGINE
              </span>
            </div>

            {/* 1px Shared Subgrid Borders */}
            <div className="grid grid-cols-3 gap-[1px] bg-zinc-200 rounded-2xl overflow-hidden border border-zinc-200 my-4">
              <div className="telemetry-cell bg-white p-5 flex flex-col justify-between">
                <span className="text-[18px] font-mono text-zinc-500 uppercase tracking-wider">
                  MULTIMODAL REASONING
                </span>
                <div className="text-[44px] font-bold text-zinc-900 tracking-tight my-2">
                  99.4%
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-semibold text-[#1A73E8] bg-blue-50 px-2.5 py-0.5 rounded-full">
                    +1.8% vs Baseline
                  </span>
                </div>
              </div>

              <div className="telemetry-cell bg-white p-5 flex flex-col justify-between">
                <span className="text-[18px] font-mono text-zinc-500 uppercase tracking-wider">
                  TIME TO FIRST TOKEN
                </span>
                <div className="text-[44px] font-bold text-zinc-900 tracking-tight my-2">
                  12 ms
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                    Sub-15ms Latency
                  </span>
                </div>
              </div>

              <div className="telemetry-cell bg-white p-5 flex flex-col justify-between">
                <span className="text-[18px] font-mono text-zinc-500 uppercase tracking-wider">
                  ZERO CUTS
                </span>
                <div className="text-[44px] font-bold text-zinc-900 tracking-tight my-2">
                  12.0 s
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[18px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                    Single Living Shape
                  </span>
                </div>
              </div>
            </div>

            {/* Final Brand Lockup */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-200">
              <div className="flex flex-col">
                <div className="text-[34px] font-extrabold tracking-tight text-zinc-950 flex items-center gap-3">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
                      fill="#1A73E8"
                    />
                  </svg>
                  <span>GEMINI 3.8 FLASH</span>
                </div>
                <div className="text-[20px] font-medium text-[#1A73E8] tracking-wide">
                  Multimodal Intelligence Engine
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-5 py-2.5 bg-[#0B0F19] text-white rounded-xl font-bold text-[18px] shadow-sm tracking-wide border border-[#1A73E8]/30 flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A73E8]" />
                  <span>Google DeepMind</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CameraRig>

      {/* 3. Realistic Organic Bezier Simulated Cursor (Direct child of SpotlightStage: full 1920x1080 canvas reference) */}
      <div
        className="simulated-cursor absolute pointer-events-none select-none z-50"
        style={{
          left: 0,
          top: 0,
          transform: 'translate3d(1440px, 860px, 0)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Click Ripple Indicator - Centered right on pointer tip (5px, 3.5px) */}
        <div
          className="cursor-ripple absolute w-14 h-14 rounded-full bg-[#1A73E8]/40 pointer-events-none opacity-0"
          style={{
            left: 5,
            top: 3.5,
            transform: 'translate(-50%, -50%)',
            willChange: 'transform, opacity',
          }}
        />
        <MacOSCursor type="pointer" size={34} />
      </div>
    </SpotlightStage>
  );
};

export default Scene;
