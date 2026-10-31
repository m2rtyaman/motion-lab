import { useRef, type FC } from "react";
import gsap from "gsap";
import { Activity, ShieldCheck, ArrowUpRight, Terminal } from "lucide-react";
import { useRemotionGSAP } from "../../../../src/core/useRemotionGSAP";
import { EASING, DURATIONS, PALETTE } from "../../../../src/core/tokens";

/**
 * Gold Standard Example 1: High-Velocity Multi-Beat Telemetry Sequence
 * Demonstrates IN -> ACTION -> OUT cycle, overlapping beat transitions,
 * 60 FPS numeric counter interpolation, and zero-slop monochrome aesthetics.
 */
export const KineticTelemetryLaunch: FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sparklineRef = useRef<SVGPathElement>(null);
  const metricCounterRef = useRef<HTMLSpanElement>(null);

  useRemotionGSAP((tl) => {
    tl.defaultEase = EASING.expoOut;

    if (sparklineRef.current) {
      const length = sparklineRef.current.getTotalLength();
      gsap.set(sparklineRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });
    }

    // =========================================================================
    // BEAT 1 [0.0s – 2.8s]: IN -> ACTION -> OUT (Masked Title + Live Counter)
    // =========================================================================
    // IN (0.0s – 0.45s): Multi-layer staggered entry
    tl.fromTo(
      ".beat-1-surface",
      { y: 45, scale: 0.95, opacity: 0, filter: "blur(12px)" },
      { y: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: DURATIONS.panel },
      0
    )
      .fromTo(
        ".masked-word",
        { y: "110%", opacity: 0 },
        { y: "0%", opacity: 1, duration: 0.42, stagger: 0.05 },
        0.08
      )
      .fromTo(
        ".beat-1-item",
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.38, stagger: 0.05 },
        0.15
      );

    // ACTION (0.45s – 2.45s): Continuous SVG draw + 60 FPS numeric counter + micro-drift
    tl.fromTo(
      ".beat-1-surface",
      { y: 0 },
      { y: -10, duration: 2.4, ease: "none" },
      0.45
    ).to(
      sparklineRef.current,
      { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" },
      0.45
    );

    const counterState = { val: 0 };
    tl.to(
      counterState,
      {
        val: 99.98,
        duration: 1.5,
        ease: EASING.expoOut,
        onUpdate: () => {
          if (metricCounterRef.current) {
            metricCounterRef.current.textContent = `${counterState.val.toFixed(2)}%`;
          }
        },
      },
      0.5
    ).fromTo(
      ".telemetry-log-row",
      { x: -16, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, stagger: 0.18, ease: EASING.powerOut },
      0.7
    );

    // OUT (2.45s – 2.80s): Fast exit (35% faster than entrance)
    tl.to(
      ".beat-1-surface",
      {
        y: -35,
        scale: 0.96,
        opacity: 0,
        filter: "blur(8px)",
        duration: 0.32,
        ease: EASING.quickIn,
      },
      2.45
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center w-full h-full p-12 select-none overflow-hidden"
      style={{ backgroundColor: PALETTE.bgBase, color: PALETTE.textPrimary }}
    >
      {/* Beat 1 Surface Card */}
      <div className="beat-1-surface relative w-full max-w-2xl rounded-xl bg-[#121215] border border-white/[0.06] p-8">
        {/* Micro Tag */}
        <div className="beat-1-item flex items-center justify-between mb-4 pb-3 border-b border-white/[0.06]">
          <span className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>SYS_TELEMETRY // CLUSTER_04</span>
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
            60 FPS LOCK
          </span>
        </div>

        {/* Masked Kinetic Headline */}
        <h2 className="text-3xl font-extrabold tracking-tighter text-zinc-100 flex items-center gap-2 mb-6">
          <span className="inline-block overflow-hidden py-0.5">
            <span className="masked-word inline-block">Deterministic</span>
          </span>
          <span className="inline-block overflow-hidden py-0.5">
            <span className="masked-word inline-block text-zinc-400">Throughput</span>
          </span>
        </h2>

        {/* Live Counter & Sparkline */}
        <div className="beat-1-item rounded-md bg-[#09090b] border border-white/[0.06] p-5 mb-4">
          <div className="flex items-baseline justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Uptime Integrity
              </span>
            </div>
            <div className="flex items-center gap-1 text-emerald-500 font-mono text-2xl font-bold">
              <ArrowUpRight className="w-5 h-5" />
              <span ref={metricCounterRef}>0.00%</span>
            </div>
          </div>

          <div className="relative w-full h-20">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 400 80" fill="none">
              <line x1="0" y1="20" x2="400" y2="20" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <line x1="0" y1="60" x2="400" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
              <path
                ref={sparklineRef}
                d="M 0,68 Q 70,60 130,38 T 240,42 T 330,16 L 400,12"
                stroke={PALETTE.textPrimary}
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Sequential Action Log Stream */}
        <div className="beat-1-item space-y-1.5 font-mono text-[11px] text-zinc-400">
          <div className="telemetry-log-row flex items-center justify-between px-3 py-1.5 rounded bg-[#18181b] border border-white/[0.06]">
            <span className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-zinc-500" />
              <span>[01] edge-node-fra-01 verified</span>
            </span>
            <span className="text-emerald-500">1.2ms</span>
          </div>
          <div className="telemetry-log-row flex items-center justify-between px-3 py-1.5 rounded bg-[#18181b] border border-white/[0.06]">
            <span className="flex items-center gap-2">
              <Terminal className="w-3 h-3 text-zinc-500" />
              <span>[02] zero-slop-audit pipeline locked</span>
            </span>
            <span className="text-emerald-500">0.8ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KineticTelemetryLaunch;
