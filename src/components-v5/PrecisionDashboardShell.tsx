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
  morphProgress?: number;
  leftPane?: React.ReactNode;
  rightPane?: React.ReactNode;
  footerLeft?: React.ReactNode;
  footerRight?: React.ReactNode;
}

export const PrecisionDashboardShell: React.FC<PrecisionDashboardShellProps> = ({
  children,
  title = 'Dashboard',
  subtitle,
  statusBadge,
  width = 920,
  height = 1120,
  className = '',
  tiltX = 0,
  tiltY = 0,
  borderRadius = 24,
  morphProgress = 1,
  leftPane,
  rightPane,
  footerLeft,
  footerRight,
}) => {
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
      <div className="h-14 px-6 flex items-center justify-between border-b border-white/[0.08] bg-zinc-950/90 backdrop-blur-xl shrink-0">
        {/* macOS Sequoia Traffic Lights */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/80 shadow-sm" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/80 shadow-sm" />
            <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]/80 shadow-sm" />
          </div>
          {subtitle && (
            <>
              <div className="h-4 w-px bg-white/10 mx-1" />
              <span className="text-[18px] font-mono text-zinc-400 truncate max-w-[260px]">
                {subtitle}
              </span>
            </>
          )}
        </div>

        {/* Center Title Pill */}
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-zinc-900/80 border border-white/[0.07] text-[18px] font-sans font-semibold text-zinc-200 max-w-[440px] truncate">
          <span className="truncate">{title}</span>
        </div>

        {/* Right Status Badge (only rendered if provided) */}
        <div className="flex items-center gap-2 min-w-[80px] justify-end">
          {statusBadge && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              <span className="text-[18px] font-mono text-emerald-300 font-medium tracking-wide">
                {statusBadge}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Subgrid Shared 1px Hairline Container */}
      {leftPane || rightPane ? (
        <div className="relative flex-1 w-full grid grid-cols-12 gap-[1px] bg-white/[0.08] overflow-hidden">
          <div className="col-span-5 bg-zinc-950/90 p-5 flex flex-col justify-between">
            {leftPane}
          </div>
          <div className="col-span-7 bg-zinc-950/90 p-5 flex flex-col gap-4 justify-between">
            {rightPane}
          </div>
        </div>
      ) : (
        <div className="relative flex-1 w-full overflow-hidden bg-zinc-950/90 p-6">
          {children}
        </div>
      )}

      {/* Optional Footer Status Strip (only rendered when explicitly provided) */}
      {(footerLeft || footerRight) && (
        <div className="h-11 px-6 flex items-center justify-between border-t border-white/[0.06] bg-zinc-950/90 text-[18px] font-mono text-zinc-300 shrink-0">
          <div className="flex items-center gap-2">{footerLeft}</div>
          <div className="flex items-center gap-3">{footerRight}</div>
        </div>
      )}
    </SpecularSurface>
  );
};
