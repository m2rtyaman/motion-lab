import { type FC } from "react";
import { RotateCcw, Gauge } from "lucide-react";
import type { PlaybackSpeed } from "../core/types";

interface ControlsProps {
  onReplay: () => void;
  speed: PlaybackSpeed;
  onSpeedChange: (speed: PlaybackSpeed) => void;
}

export const Controls: FC<ControlsProps> = ({ onReplay, speed, onSpeedChange }) => {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-[#0b0c10]/80 border border-white/10 backdrop-blur-lg shadow-xl text-xs">
      {/* Replay Button */}
      <button
        onClick={onReplay}
        className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/10 text-white/90 hover:text-white transition-all font-medium text-xs shadow-sm cursor-pointer"
        title="Sahneyi Baştan Oynat"
      >
        <RotateCcw className="w-3.5 h-3.5 text-white/70 group-hover:rotate-[-45deg] group-hover:text-white transition-transform duration-300" />
        <span>Yeniden Oynat</span>
      </button>

      {/* Speed Controls */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-white/50 text-[11px] mr-1">
          <Gauge className="w-3.5 h-3.5" />
          <span>Hız:</span>
        </div>

        <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10">
          <button
            onClick={() => onSpeedChange(1)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              speed === 1
                ? "bg-white/15 text-white font-semibold shadow-inner"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            1x
          </button>
          <button
            onClick={() => onSpeedChange(0.5)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer ${
              speed === 0.5
                ? "bg-white/15 text-white font-semibold shadow-inner"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            0.5x (Ağır Çekim)
          </button>
        </div>
      </div>
    </div>
  );
};
