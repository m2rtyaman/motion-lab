import React from 'react';
import { SpecularSurface } from '../materials/SpecularSurface';

export type DeviceType = 'mobile' | 'desktop';

export interface DeviceMockupStageProps {
  children?: React.ReactNode;
  deviceType?: DeviceType;
  title?: string;
  width?: number;
  height?: number;
  className?: string;
  tiltX?: number;
  tiltY?: number;
}

export const DeviceMockupStage: React.FC<DeviceMockupStageProps> = ({
  children,
  deviceType = 'mobile',
  title = 'OctoSift Cloud Terminal',
  width,
  height,
  className = '',
  tiltX = 0,
  tiltY = 0,
}) => {
  if (deviceType === 'desktop') {
    const desktopWidth = width ?? 840;
    const desktopHeight = height ?? 520;

    return (
      <SpecularSurface
        preset="titanium"
        borderRadius={16}
        tiltX={tiltX}
        tiltY={tiltY}
        className={`flex flex-col shadow-2xl overflow-hidden select-none ${className}`}
        style={{ width: desktopWidth, height: desktopHeight }}
      >
        {/* macOS Pencere Başlık Çubuğu */}
        <div className="h-10 px-4 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-md">
          {/* Pencere Düğmeleri */}
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#dea123]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1aab29]" />
          </div>

          {/* Başlık / Adres Çubuğu */}
          <div className="px-6 py-1 rounded-md bg-zinc-800/60 border border-zinc-700/50 text-xs font-mono text-zinc-300">
            {title}
          </div>

          <div className="w-12" />
        </div>

        {/* Ekran İçeriği */}
        <div className="relative flex-1 w-full overflow-hidden bg-zinc-950/90 p-6">
          {children}
        </div>
      </SpecularSurface>
    );
  }

  // Mobile Shell (iPhone Titanium)
  const mobileWidth = width ?? 380;
  const mobileHeight = height ?? 720;

  return (
    <SpecularSurface
      preset="titanium"
      borderRadius={48}
      tiltX={tiltX}
      tiltY={tiltY}
      className={`relative p-3 flex flex-col shadow-2xl overflow-hidden select-none ${className}`}
      style={{ width: mobileWidth, height: mobileHeight }}
    >
      {/* İç Ekran Çerçevesi */}
      <div className="relative w-full h-full rounded-[38px] overflow-hidden bg-slate-950 flex flex-col border border-zinc-800">
        {/* Dynamic Island */}
        <div className="h-10 w-full flex items-center justify-center pt-2 px-6">
          <div className="w-28 h-7 rounded-full bg-black border border-zinc-800/80 flex items-center justify-between px-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-zinc-700" />
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>

        {/* Mobil Ekran İçeriği */}
        <div className="relative flex-1 w-full overflow-hidden p-4">{children}</div>

        {/* Ana Ekran Çubuğu (Home Indicator) */}
        <div className="h-6 w-full flex items-center justify-center pb-2">
          <div className="w-32 h-1 rounded-full bg-zinc-600/70" />
        </div>
      </div>
    </SpecularSurface>
  );
};
