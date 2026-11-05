import type { FC, CSSProperties } from 'react';
import { Audio, OffthreadVideo, staticFile } from 'remotion';
import { KineticBurstWord } from '../primitives/kinetic/KineticBurstWord';
import {
  type HarvestWordTiming,
  type HarvestManifest,
  getActiveOrLastWordIndex,
  calculateWordProgress,
  computeHarvestKenBurns,
} from './harvest-math';

export * from './harvest-math';

// ============================================================================
// ASSET PATH RESOLVER
// ============================================================================

/**
 * Resolves a harvest asset URI safely for both local Remotion public/ files
 * and external network URLs without double-prefixing.
 */
export function resolveHarvestAsset(
  filePathOrUrl: string,
  projectSlug?: string
): string {
  if (!filePathOrUrl) return '';

  // Return remote or data URIs as-is
  if (
    filePathOrUrl.startsWith('http://') ||
    filePathOrUrl.startsWith('https://') ||
    filePathOrUrl.startsWith('data:') ||
    filePathOrUrl.startsWith('blob:')
  ) {
    return filePathOrUrl;
  }

  const clean = filePathOrUrl.replace(/^\/+/, '');
  if (clean.startsWith('harvest/')) {
    return staticFile(clean);
  }

  if (projectSlug) {
    return staticFile(`harvest/${projectSlug}/${clean}`);
  }

  return staticFile(clean);
}

// ============================================================================
// REACT & REMOTION PRIMITIVES
// ============================================================================

export interface HarvestVoiceOverProps {
  manifest?: HarvestManifest;
  projectSlug?: string;
  audioFile?: string;
  volume?: number;
}

/**
 * Broadcast voice-over player that resolves harvested audio from public/harvest/<slug>.
 */
export const HarvestVoiceOver: FC<HarvestVoiceOverProps> = ({
  manifest,
  projectSlug,
  audioFile,
  volume = 1.0,
}) => {
  const slug = projectSlug || manifest?.project;
  const rawFile = audioFile || manifest?.audio?.file || 'audio.wav';
  const resolved = resolveHarvestAsset(rawFile, slug);

  return <Audio src={resolved} volume={volume} />;
};

export type HarvestHighlightTone = 'gold' | 'neon' | 'white' | 'emerald' | 'cyan';

export interface HarvestKineticSubtitlesProps {
  words: readonly HarvestWordTiming[];
  currentFrame: number;
  className?: string;
  activeTone?: HarvestHighlightTone;
  maxVisibleWords?: number;
}

const TONE_STYLES: Record<HarvestHighlightTone, { activeColor: string; shadow: string }> = {
  gold: {
    activeColor: '#FFD700',
    shadow: '0 0 20px rgba(255, 215, 0, 0.45)',
  },
  neon: {
    activeColor: '#CCFF00',
    shadow: '0 0 24px rgba(204, 255, 0, 0.5)',
  },
  white: {
    activeColor: '#FFFFFF',
    shadow: '0 0 16px rgba(255, 255, 255, 0.4)',
  },
  emerald: {
    activeColor: '#10B981',
    shadow: '0 0 20px rgba(16, 185, 129, 0.45)',
  },
  cyan: {
    activeColor: '#38BDF8',
    shadow: '0 0 22px rgba(56, 189, 248, 0.5)',
  },
};

/**
 * 60 FPS deterministic kinetic subtitles with word-by-word highlight punch.
 * Strictly adheres to GPU purity (only transform, opacity, filter styling).
 * Employs stable window tracking during pauses to eliminate sudden layout snapping.
 */
export const HarvestKineticSubtitles: FC<HarvestKineticSubtitlesProps> = ({
  words,
  currentFrame,
  className = '',
  activeTone = 'gold',
  maxVisibleWords = 6,
}) => {
  if (!words || words.length === 0) {
    return null;
  }

  const state = getActiveOrLastWordIndex(words, currentFrame);
  const activeIndex = state.activeIndex;
  const pivot = Math.max(0, state.pivotIndex);

  // Sliding window of words centered near the pivot index
  const halfWindow = Math.floor(maxVisibleWords / 2);
  const maxStart = Math.max(0, words.length - maxVisibleWords);
  const startIndex = Math.max(0, Math.min(maxStart, pivot - halfWindow));
  const endIndex = Math.min(words.length, startIndex + maxVisibleWords);
  const visibleWords = words.slice(startIndex, endIndex);

  const toneConfig = TONE_STYLES[activeTone] || TONE_STYLES.gold;

  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-4 gap-y-2 select-none ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {visibleWords.map((w) => {
        const isActive = w.index === activeIndex;
        const isPast = state.activeIndex >= 0
          ? w.index < activeIndex
          : state.isAfter
            ? true
            : state.isBefore
              ? false
              : w.index <= state.pivotIndex;

        // Word progress for punch physics
        const wordProg = isActive ? calculateWordProgress(w, currentFrame) : 0;
        // Punch scale starts at 1.14 and settles smoothly to 1.04
        const punchScale = isActive ? 1.04 + (1.0 - wordProg) * 0.1 : 1.0;
        const opacity = isActive ? 1.0 : isPast ? 0.35 : 0.6;

        const wordStyle: CSSProperties = {
          color: isActive ? toneConfig.activeColor : '#E2E8F0',
          textShadow: isActive ? toneConfig.shadow : 'none',
          transform: `scale(${punchScale.toFixed(3)})`,
          opacity,
          willChange: 'transform, opacity',
        };

        return (
          <div key={`${w.index}-${w.word}`} style={wordStyle} className="transition-none">
            <KineticBurstWord text={w.word} />
          </div>
        );
      })}
    </div>
  );
};

export interface HarvestBRollBackgroundProps {
  src: string;
  currentFrame: number;
  projectSlug?: string;
  durationFrames?: number;
  opacity?: number;
  kenBurns?: boolean;
  fadeInFrames?: number;
  className?: string;
  style?: CSSProperties;
}

/**
 * Offthread B-Roll stock video layer with deterministic Ken Burns drift and safe cover sizing.
 */
export const HarvestBRollBackground: FC<HarvestBRollBackgroundProps> = ({
  src,
  currentFrame,
  projectSlug,
  durationFrames = 300,
  opacity = 0.85,
  kenBurns = true,
  fadeInFrames = 12,
  className = '',
  style = {},
}) => {
  const kb = kenBurns
    ? computeHarvestKenBurns(currentFrame, durationFrames, 1.06, fadeInFrames)
    : { scale: 1.0, opacity: 1.0 };

  const combinedOpacity = opacity * kb.opacity;
  const resolvedSrc = resolveHarvestAsset(src, projectSlug);

  return (
    <div
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        ...style,
        opacity: combinedOpacity,
        transform: `scale(${kb.scale.toFixed(4)})`,
        willChange: 'transform, opacity',
      }}
    >
      <OffthreadVideo
        src={resolvedSrc}
        className="w-full h-full object-cover"
        muted
      />
    </div>
  );
};
