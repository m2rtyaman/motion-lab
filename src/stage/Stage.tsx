import { useState, type FC } from "react";
import { Player } from "@remotion/player";
import { Scene } from "../components/Scene";
import { Smartphone, Monitor } from "lucide-react";

export const Stage: FC = () => {
  const [aspect, setAspect] = useState<"9:16" | "16:9">("9:16");

  const width = aspect === "9:16" ? 1080 : 1920;
  const height = aspect === "9:16" ? 1920 : 1080;

  return (
    <div className="relative w-full max-w-[1080px] flex flex-col gap-4 mx-auto select-none">
      {/* Studio Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#121215] border border-white/[0.08] shadow-lg text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 text-zinc-300 font-semibold uppercase tracking-wider text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Remotion Player Stage
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">
            {aspect} ({width}x{height}) • 60 FPS • 1500 Frames
          </span>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-black/40 border border-white/[0.06]">
          <button
            onClick={() => setAspect("9:16")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              aspect === "9:16"
                ? "bg-white/15 text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>9:16 (Dikey)</span>
          </button>
          <button
            onClick={() => setAspect("16:9")}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              aspect === "16:9"
                ? "bg-white/15 text-white font-semibold"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>16:9 (Yatay)</span>
          </button>
        </div>
      </div>

      {/* Studio Canvas Viewport */}
      <div className="relative w-full min-h-[580px] max-h-[720px] rounded-2xl border border-white/[0.08] bg-[#09090b] overflow-hidden shadow-2xl flex items-center justify-center p-4">
        <div
          style={{
            width: aspect === "9:16" ? "380px" : "100%",
            aspectRatio: aspect === "9:16" ? "9/16" : "16/9",
            maxHeight: "680px",
          }}
          className="rounded-xl overflow-hidden shadow-2xl border border-white/[0.08]"
        >
          <Player
            key={aspect}
            component={Scene}
            inputProps={{ aspect }}
            durationInFrames={1500}
            compositionWidth={width}
            compositionHeight={height}
            fps={60}
            controls
            loop
            autoPlay
            style={{
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 text-[11px] font-mono text-zinc-500">
        <span>Deterministic Remotion & GSAP Core</span>
        <span>Default: 9:16 (1080x1920 @ 60 FPS)</span>
      </div>
    </div>
  );
};
