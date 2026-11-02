import React from 'react';
import { SpecularSurface } from '../materials/SpecularSurface';

export interface PrecisionDashboardShellProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  statusBadge?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  tiltX?: number;
  tiltY?: number;
  borderRadius?: number;
  morphProgress?: number; // 0 = compact shield anchor, 1 = full expanded dashboard
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
}

export const PrecisionDashboardShell: React.FC<PrecisionDashboardShellProps> = ({
  children,
  title = 'Signal Protocol v4 — Cryptographic Multi-Device Enclave',
  subtitle = 'Zero-Knowledge Distributed Hardware Ratchet',
  statusBadge = 'E2EE Ratified #4092',
  width = 920,
  height = 1120,
  className = '',
  tiltX = 0,
  tiltY = 0,
  borderRadius = 24,
  morphProgress = 1,
  leftPane,
  rightPane,
}) => {
  void subtitle;
  void morphProgress;
  return (
    <SpecularSurface
      preset="titanium"
      borderRadius={borderRadius}
      tiltX={tiltX}
      tiltY={tiltY}
      showCatchlight={true}
      showGradientBorder={true}
      className={`flex flex-col shadow-2xl overflow-hidden select-none border border-white/10 ${className}`}
      style={{
        width,
        height,
        transformOrigin: 'center center',
      }}
    >
      {/* macOS Sequoia Window Header Bar */}
      <div className="h-14 px-5 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/80 backdrop-blur-xl shrink-0">
        {/* macOS Sequoia Traffic Lights */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/80 shadow-sm flex items-center justify-center group">
              <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/80 shadow-sm flex items-center justify-center group">
              <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 4H6.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]/80 shadow-sm flex items-center justify-center group">
              <svg className="w-2 h-2 text-black/40 opacity-0 group-hover:opacity-100" viewBox="0 0 8 8" fill="none">
                <path d="M1.5 1.5L6.5 6.5M6.5 1.5V6.5H1.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </span>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1" />

          {/* Secure Lock Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[18px] font-mono font-medium">
            <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>SECURE ENCLAVE</span>
          </div>
        </div>

        {/* Center Title Pill */}
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-zinc-900/70 border border-white/[0.06] text-[18px] font-mono text-zinc-300 max-w-[440px] truncate">
          <svg className="w-4 h-4 text-sky-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span className="truncate">{title}</span>
        </div>

        {/* Right Telemetry Badge */}
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <span className="text-[18px] font-mono text-zinc-300 tracking-wider uppercase">
            {statusBadge}
          </span>
        </div>
      </div>

      {/* Subgrid Shared 1px Hairline Container */}
      {leftPane || rightPane ? (
        <div className="relative flex-1 w-full grid grid-cols-12 gap-[1px] bg-white/[0.08] overflow-hidden">
          {/* Left Studio Pane (5 Cols) */}
          <div className="col-span-5 bg-zinc-950/90 p-5 flex flex-col justify-between">
            {leftPane}
          </div>

          {/* Right Telemetry & Stream Pane (7 Cols) */}
          <div className="col-span-7 bg-zinc-950/90 p-5 flex flex-col gap-4 justify-between">
            {rightPane}
          </div>
        </div>
      ) : (
        <div className="relative flex-1 w-full overflow-hidden bg-zinc-950/90 p-6">
          {children}
        </div>
      )}

      {/* Window Footer Status Strip */}
      <div className="h-10 px-5 flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/90 text-[18px] font-mono text-zinc-300 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Node:</span>
          <span className="text-zinc-200">enclave-lon1-v4</span>
          <span className="text-zinc-500">/</span>
          <span className="text-zinc-400">Ratchet:</span>
          <span className="text-emerald-400">Continuous Stream</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Latency:</span>
          <span className="text-sky-400 font-bold">14ms</span>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-300">Zero-Copy Buffer</span>
        </div>
      </div>
    </SpecularSurface>
  );
};
