import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface BroadcastPackageStrapProps {
  /** Category tag text (e.g. "BREAKING REPORT", "INVESTIGATION", "VERIFIED") */
  category?: string;
  /** Category badge background color (default: '#FF4A2E') */
  categoryColor?: string;
  /** Main lower-third headline */
  headline: string;
  /** Subtitle or second line details */
  subline?: string;
  /** Location or facility code (e.g. "LAKEHURST NAVAL AIR STATION") */
  location?: string;
  /** Broadcast timecode or mission clock (e.g. "18:25:00 EST · T+04.2s") */
  timecode?: string;
  /** Station / Channel badge code (e.g. "B-01 INVESTIGATION") */
  badgeText?: string;
  /** Manual progress override [0.0 - 1.0]. If undefined, driven by useCurrentFrame */
  progress?: number;
  /** Starting frame for the 3D flip-in animation (default: 0) */
  startFrame?: number;
  /** Duration of 3D entrance in frames (default: 24 frames @ 60fps) */
  durationFrames?: number;
  /** Whether to render headline characters inside split-flap airport cell tiles */
  useSplitFlap?: boolean;
  /** Container CSS classes */
  className?: string;
}

/**
 * BroadcastPackageStrap — TV News & Tactical Lower-Third Strap
 * 
 * Based on Opus 5.5 Sports Telestrator & Visual Investigation packaging:
 * - 3D vertical perspective flip-in (rotateX 90deg -> 0deg)
 * - Parallelogram category pill (-14deg skew)
 * - Split-flap text cell grid for key findings
 * - Live broadcast badge & timecode clock
 */
export const BroadcastPackageStrap: React.FC<BroadcastPackageStrapProps> = ({
  category = 'VERIFIED EVIDENCE',
  categoryColor = '#FF4A2E',
  headline,
  subline,
  location = 'SECTOR 4 · MAIN CAMERA A',
  timecode = '18:25:04 EST · F106',
  badgeText = 'NEWS ARCHIVE · CH-01',
  progress: customProgress,
  startFrame = 0,
  durationFrames = 24,
  useSplitFlap = false,
  className = '',
}) => {
  const currentFrame = useCurrentFrame();

  const progress =
    customProgress !== undefined
      ? Math.max(0, Math.min(1, customProgress))
      : Math.max(0, Math.min(1, (currentFrame - startFrame) / Math.max(1, durationFrames)));

  // Smooth ease-out curve for 3D flip-in
  const flipEase = Math.sin(progress * Math.PI * 0.5);
  const rotateX = (1 - flipEase) * -90; // -90deg to 0deg
  const opacity = Math.min(1, progress * 1.5);

  // Split-flap characters array
  const headlineChars = (headline || '').split('');

  return (
    <div
      className={`absolute bottom-10 left-12 right-12 pointer-events-none will-change-transform ${className}`}
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="flex flex-col origin-bottom"
        style={{
          transform: `rotateX(${rotateX}deg)`,
          opacity,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* 1. Top Badges & Parallelogram Pill */}
        <div className="flex items-center gap-3 mb-1.5">
          {/* Parallelogram Category Pill */}
          <div
            className="px-4 py-1 text-[18px] font-black tracking-widest uppercase text-white shadow-lg flex items-center gap-2"
            style={{
              backgroundColor: categoryColor,
              transform: 'skewX(-14deg)',
              transformOrigin: 'left bottom',
            }}
          >
            <div
              className="flex items-center gap-1.5"
              style={{ transform: 'skewX(14deg)' }}
            >
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{category}</span>
            </div>
          </div>

          {/* Broadcast Bug / Badge */}
          <div className="px-3 py-1 bg-black/85 backdrop-blur-md border border-white/10 rounded-sm text-[18px] font-mono tracking-wider text-zinc-300 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>{badgeText}</span>
          </div>

          {/* Timecode Readout */}
          {timecode && (
            <div className="ml-auto px-3 py-1 bg-black/85 backdrop-blur-md border border-white/10 rounded-sm text-[18px] font-mono tracking-wider text-amber-400">
              {timecode}
            </div>
          )}
        </div>

        {/* 2. Main Strap Surface (High-Craft Bar with 1px Accent Rim) */}
        <div className="relative rounded-lg bg-zinc-950/92 backdrop-blur-xl border border-white/15 px-7 py-4 shadow-2xl flex flex-col justify-center overflow-hidden">
          {/* Left vertical indicator accent bar */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[5px]"
            style={{ backgroundColor: categoryColor }}
          />

          {/* Top specular reflection rim */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-white/30 via-white/10 to-transparent" />

          {/* Headline (Split-flap grid or Bold Serif/Sans) */}
          {useSplitFlap ? (
            <div className="flex flex-wrap items-center gap-1 my-0.5">
              {headlineChars.map((char, i) => (
                <span
                  key={i}
                  className="inline-flex items-center justify-center min-w-[22px] h-[34px] bg-black/90 border border-zinc-700/80 rounded-xs font-mono font-bold text-[18px] text-zinc-100 shadow-inner px-1"
                >
                  {char === ' ' ? '\u00A0' : char}
                </span>
              ))}
            </div>
          ) : (
            <h1 className="text-[26px] font-black tracking-tight text-white leading-tight font-sans drop-shadow-sm">
              {headline}
            </h1>
          )}

          {/* Subline and Location Row */}
          {(subline || location) && (
            <div className="mt-1 flex items-center justify-between text-[18px] font-medium text-zinc-400">
              {subline && <span className="text-zinc-300">{subline}</span>}
              {location && (
                <span className="font-mono text-[18px] text-zinc-400 uppercase tracking-wider ml-auto">
                  {location}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
