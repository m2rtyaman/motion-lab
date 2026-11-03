import React, { useMemo } from 'react';
import {
  computeWavyRibbonSpline,
  calculateRibbonDashOffset,
  computeCircularAperture,
  computeTiltedPhoneMatrix,
  type WavyRibbonParams,
  type WavyRibbonResult,
  type CircularApertureParams,
  type CircularApertureResult,
  type TiltedPhoneParams,
  type TiltedPhoneResult,
} from '../core/mobile-sting-math.ts';

// Re-export math functions and types for convenience
export {
  computeWavyRibbonSpline,
  calculateRibbonDashOffset,
  computeCircularAperture,
  computeTiltedPhoneMatrix,
  type WavyRibbonParams,
  type WavyRibbonResult,
  type CircularApertureParams,
  type CircularApertureResult,
  type TiltedPhoneParams,
  type TiltedPhoneResult,
};

/**
 * Mobile App Sting & 16:9 Playful Vector Color Tokens
 */
export const MOBILE_STING_PALETTE = {
  lavenderSoft: '#EBE6FF',
  violetPrimary: '#7C5CFC',
  violetDark: '#5436DC',
  midnightCharcoal: '#12131A',
  charcoalCard: '#1E202B',
  electricLemon: '#F6FF60',
  coralAccent: '#FF8C78',
  mintSplash: '#44E5BA',
  white: '#FFFFFF',
  subtleBorder: 'rgba(255, 255, 255, 0.12)',
  cardBorderDark: 'rgba(0, 0, 0, 0.08)',
  dropShadowSoft: '0 24px 48px -12px rgba(18, 19, 26, 0.25)',
} as const;

/**
 * 9:16 Vertical Pastel 3D Editorial Color Tokens
 */
export const PASTEL_EDITORIAL_PALETTE = {
  warmPaper: '#FAF8F5',
  slateMist: '#D5DCE2',
  softSage: '#C2D5C8',
  warmClay: '#EAD5C3',
  crimsonInk: '#C93B2B',
  deepInk: '#1B1E24',
  cardSubstrate: '#FFFFFF',
  divider: 'rgba(27, 30, 36, 0.08)',
} as const;

// ==========================================
// 1. WAVY RIBBON
// ==========================================

export interface WavyRibbonProps {
  progress?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  waveCount?: number;
  amplitude?: number;
  strokeWidth?: number;
  strokeColor?: string;
  glowColor?: string;
  glowBlur?: number;
  customPath?: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Continuous rounded stroke / ribbon flowing across canvas with dynamic strokeDashoffset
 * and parametric Bézier path that guides the viewer's eye across scene transitions.
 */
export const WavyRibbon: React.FC<WavyRibbonProps> = ({
  progress = 1,
  startX = 0,
  startY = 540,
  endX = 1920,
  endY = 540,
  waveCount = 3,
  amplitude = 120,
  strokeWidth = 14,
  strokeColor = MOBILE_STING_PALETTE.violetPrimary,
  glowColor,
  glowBlur = 0,
  customPath,
  viewBoxWidth,
  viewBoxHeight,
  className = '',
  style = {},
}) => {
  const spline = useMemo(() => {
    if (customPath) {
      return { path: customPath, totalLength: 2000, points: [] };
    }
    return computeWavyRibbonSpline({
      startX,
      startY,
      endX,
      endY,
      waveCount,
      amplitude,
    });
  }, [customPath, startX, startY, endX, endY, waveCount, amplitude]);

  const offset = calculateRibbonDashOffset(progress, spline.totalLength);

  // Otomatik 9:16 dikey ya da 16:9 yatay viewBox tespiti
  const isVerticalFlow = endY > endX && endY > 1080;
  const vbWidth = viewBoxWidth ?? (isVerticalFlow ? 1080 : Math.max(endX, startX, 1920));
  const vbHeight = viewBoxHeight ?? (isVerticalFlow ? 1920 : Math.max(startY, endY, 1080));

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 10,
        ...style,
      }}
    >
      <svg
        className="w-full h-full"
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {glowBlur > 0 && glowColor && (
          <path
            d={spline.path}
            stroke={glowColor}
            strokeWidth={strokeWidth + 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={spline.totalLength}
            strokeDashoffset={offset}
            style={{
              opacity: 0.35,
              filter: `blur(${glowBlur}px)`,
            }}
          />
        )}
        <path
          d={spline.path}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={spline.totalLength}
          strokeDashoffset={offset}
        />
      </svg>
    </div>
  );
};

// ==========================================
// 2. CIRCULAR APERTURE WIPE
// ==========================================

export interface CircularApertureWipeProps {
  progress: number;
  maxRadius?: number;
  minRadius?: number;
  centerX?: number | string;
  centerY?: number | string;
  backgroundColor?: string;
  invert?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Expanding radial circular aperture / disc that punches through a solid card or viewport
 * to reveal the product stage beneath without an unmount cut.
 */
export const CircularApertureWipe: React.FC<CircularApertureWipeProps> = ({
  progress,
  maxRadius = 1400,
  minRadius = 0,
  centerX = '50%',
  centerY = '50%',
  backgroundColor = MOBILE_STING_PALETTE.lavenderSoft,
  invert = false,
  children,
  className = '',
  style = {},
}) => {
  const aperture = useMemo(() => {
    return computeCircularAperture({
      progress,
      maxRadius,
      minRadius,
      centerX,
      centerY,
    });
  }, [progress, maxRadius, minRadius, centerX, centerY]);

  if (invert) {
    // Reveal inside the expanding circle
    return (
      <div
        className={`absolute inset-0 overflow-hidden ${className}`}
        style={{
          clipPath: aperture.clipPath,
          ...style,
        }}
      >
        {children}
      </div>
    );
  }

  // Punch hole through solid background
  const cxStr = typeof centerX === 'number' ? `${centerX}px` : centerX;
  const cyStr = typeof centerY === 'number' ? `${centerY}px` : centerY;

  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        zIndex: 15,
        ...style,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor,
          maskImage: `radial-gradient(circle at ${cxStr} ${cyStr}, transparent ${aperture.radius}px, black ${aperture.radius + 1}px)`,
          WebkitMaskImage: `radial-gradient(circle at ${cxStr} ${cyStr}, transparent ${aperture.radius}px, black ${aperture.radius + 1}px)`,
          opacity: aperture.isFullyRevealed ? 0 : 1,
        }}
      />
      {children}
    </div>
  );
};

// ==========================================
// 3. TILTED PHONE STAGE
// ==========================================

export interface TiltedPhoneStageProps {
  children?: React.ReactNode;
  screenContent?: React.ReactNode;
  showBackdropDiscs?: boolean;
  backdropColors?: [string, string, string];
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  perspective?: number;
  floatPhase?: number;
  floatAmplitude?: number;
  scale?: number;
  translateY?: number;
  translateX?: number;
  bezelRadius?: number;
  chassisColor?: string;
  screenBackground?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 3/4 tilted perspective phone mockup with floating screen UI, parallax concentric backdrop discs,
 * and subtle floating idle tilt (default rotateY: -16deg, rotateX: 8deg, perspective: 1200px).
 */
export const TiltedPhoneStage: React.FC<TiltedPhoneStageProps> = ({
  children,
  screenContent,
  showBackdropDiscs = true,
  backdropColors = [
    'rgba(124, 92, 252, 0.08)',
    'rgba(124, 92, 252, 0.15)',
    'rgba(124, 92, 252, 0.22)',
  ],
  rotateX = 8,
  rotateY = -16,
  rotateZ = 0,
  perspective = 1200,
  floatPhase = 0,
  floatAmplitude = 1.2,
  scale = 1,
  translateY = 0,
  translateX = 0,
  bezelRadius = 44,
  chassisColor = '#171821',
  screenBackground = '#FFFFFF',
  className = '',
  style = {},
}) => {
  const matrix = useMemo(() => {
    return computeTiltedPhoneMatrix({
      rotateX,
      rotateY,
      rotateZ,
      perspective,
      floatPhase,
      floatAmplitude,
      scale,
      translateY,
      translateX,
      includePerspective: false,
    });
  }, [rotateX, rotateY, rotateZ, perspective, floatPhase, floatAmplitude, scale, translateY, translateX]);

  return (
    <div
      className={`relative flex items-center justify-center w-full h-full select-none ${className}`}
      style={{
        perspective: `${perspective}px`,
        transformStyle: 'preserve-3d',
        ...style,
      }}
    >
      {/* Concentric Parallax Backdrop Discs */}
      {showBackdropDiscs && (
        <div
          className="absolute flex items-center justify-center pointer-events-none"
          style={{
            zIndex: 1,
            transform: `translate3d(${matrix.effectiveTranslateX * 0.3}px, ${matrix.effectiveTranslateY * 0.3}px, -120px)`,
          }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: 780,
              height: 780,
              background: backdropColors[0],
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 580,
              height: 580,
              background: backdropColors[1],
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              width: 400,
              height: 400,
              background: backdropColors[2],
            }}
          />
        </div>
      )}

      {/* 3/4 Tilted Phone Chassis */}
      <div
        className="relative flex flex-col items-center justify-start overflow-hidden"
        style={{
          width: 380,
          height: 760,
          borderRadius: `${bezelRadius}px`,
          backgroundColor: chassisColor,
          padding: '12px',
          boxShadow:
            '0 32px 64px -16px rgba(18, 19, 26, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
          transform: matrix.transformWithoutPerspective,
          transformStyle: 'preserve-3d',
          zIndex: 5,
        }}
      >
        {/* Dynamic Island / Speaker Pill */}
        <div
          className="absolute top-5 z-20 flex items-center justify-center bg-black rounded-full"
          style={{
            width: 108,
            height: 28,
            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.1)',
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#1A1A24] mr-3"
            style={{ boxShadow: 'inset 0 0 2px #000' }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-[#131622]" />
        </div>

        {/* Screen Viewport */}
        <div
          className="relative w-full h-full overflow-hidden flex flex-col"
          style={{
            borderRadius: `${bezelRadius - 10}px`,
            backgroundColor: screenBackground,
          }}
        >
          {screenContent}
          {children}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. WORD BURST SWAP
// ==========================================

export interface WordSwapItem {
  text: string;
  icon?: React.ReactNode;
  color?: string;
  badge?: string;
}

export interface WordBurstSwapProps {
  words: WordSwapItem[];
  activeIndex: number;
  popProgress?: number;
  cardBackground?: string;
  textColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Single centered card with rapid beat-locked word + icon replacements.
 * Features a rock-solid stable baseline and punchy scale pop to eliminate layout jumping.
 */
export const WordBurstSwap: React.FC<WordBurstSwapProps> = ({
  words,
  activeIndex,
  popProgress = 1,
  cardBackground = '#FFFFFF',
  textColor = MOBILE_STING_PALETTE.midnightCharcoal,
  className = '',
  style = {},
}) => {
  const safeIndex = Math.min(Math.max(0, activeIndex), Math.max(0, words.length - 1));
  const activeWord = words[safeIndex] || { text: '' };

  // Pop scale bounce: 0 -> 0.85 -> 1.05 -> 1.0
  const clampedPop = Math.min(1, Math.max(0, popProgress));
  const popScale = 0.92 + 0.16 * Math.sin(clampedPop * Math.PI);

  return (
    <div
      className={`relative inline-flex items-center justify-center px-10 py-5 rounded-3xl ${className}`}
      style={{
        backgroundColor: cardBackground,
        boxShadow: MOBILE_STING_PALETTE.dropShadowSoft,
        border: '1px solid rgba(0, 0, 0, 0.06)',
        transform: `scale(${popScale.toFixed(3)})`,
        minHeight: 88,
        minWidth: 260,
        ...style,
      }}
    >
      <div className="flex items-center gap-4">
        {activeWord.icon && (
          <div
            className="flex items-center justify-center w-12 h-12 rounded-2xl"
            style={{
              backgroundColor: activeWord.color || MOBILE_STING_PALETTE.violetPrimary,
              color: '#FFFFFF',
            }}
          >
            {activeWord.icon}
          </div>
        )}
        <div className="flex flex-col items-start justify-center">
          {activeWord.badge && (
            <span
              className="font-mono uppercase tracking-widest text-[#7C5CFC]"
              style={{ fontSize: '18px', fontWeight: 700 }}
            >
              {activeWord.badge}
            </span>
          )}
          <span
            className="font-bold tracking-tight"
            style={{
              color: textColor,
              fontSize: '36px',
              lineHeight: 1.1,
            }}
          >
            {activeWord.text}
          </span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. VOICE CONTROL CARD
// ==========================================

export interface VoiceControlCardProps {
  title?: string;
  languagePrompt?: string;
  isListening?: boolean;
  waveProgress?: number;
  waveformBars?: number;
  accentColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Floating dark rounded voice feature card ("HOLD TO TALK", speaker avatar, language prompt, audio wave indicator).
 */
export const VoiceControlCard: React.FC<VoiceControlCardProps> = ({
  title = 'HOLD TO TALK',
  languagePrompt = 'English (US)',
  isListening = true,
  waveProgress = 0,
  waveformBars = 7,
  accentColor = MOBILE_STING_PALETTE.mintSplash,
  className = '',
  style = {},
}) => {
  const bars = useMemo(() => {
    return Array.from({ length: waveformBars }, (_, i) => {
      // Deterministik per-bar boy oranı
      const offset = (i / waveformBars) * Math.PI * 2;
      const height = 14 + 26 * Math.abs(Math.sin(waveProgress * 3 + offset));
      return Math.round(height);
    });
  }, [waveformBars, waveProgress]);

  return (
    <div
      className={`flex flex-col items-center justify-between p-6 rounded-3xl ${className}`}
      style={{
        width: 320,
        backgroundColor: MOBILE_STING_PALETTE.charcoalCard,
        color: '#FFFFFF',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        ...style,
      }}
    >
      {/* Top Header & Speaker Prompt */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-10 h-10 rounded-full"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)' }}
          >
            {/* Clean SVG Speaker Avatar Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#FFFFFF' }}>{languagePrompt}</span>
            <span style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {isListening ? 'Listening...' : 'Ready'}
            </span>
          </div>
        </div>

        {/* Live Audio Waveform Bars */}
        <div className="flex items-center gap-1.5 h-10 px-2">
          {bars.map((h, i) => (
            <div
              key={i}
              className="rounded-full"
              style={{
                width: 4,
                height: isListening ? `${h}px` : '8px',
                backgroundColor: accentColor,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Hold to Talk Trigger Pill */}
      <div
        className="flex items-center justify-center w-full py-4 rounded-2xl"
        style={{
          backgroundColor: MOBILE_STING_PALETTE.violetPrimary,
          boxShadow: '0 8px 16px -4px rgba(124, 92, 252, 0.5)',
        }}
      >
        <span
          className="font-bold tracking-wider uppercase"
          style={{ fontSize: '18px', color: '#FFFFFF' }}
        >
          {title}
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 6. CREATOR LOG PANEL
// ==========================================

export interface CreatorLogItem {
  id: string;
  label: string;
  timestamp?: string;
  status?: 'done' | 'processing' | 'pending';
}

export interface CreatorLogPanelProps {
  title?: string;
  statusPills?: Array<{ label: string; active?: boolean; color?: string }>;
  progress?: number;
  occlusionProgress?: number;
  items?: CreatorLogItem[];
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Vertical 9:16 floating card with segmented status pills, striped progress bar, and occlusion wipe rise.
 */
export const CreatorLogPanel: React.FC<CreatorLogPanelProps> = ({
  title = 'PRODUCTION PIPELINE',
  statusPills = [
    { label: '3D SCENE', active: true, color: '#C93B2B' },
    { label: 'AUDIO SFX', active: true, color: '#7C5CFC' },
    { label: 'COLOR GRADE', active: false },
  ],
  progress = 0.68,
  occlusionProgress = 1,
  items = [
    { id: '1', label: 'Bézier camera trajectory locked', timestamp: '00:04.12', status: 'done' },
    { id: '2', label: 'Spatial audio mix calibrated (-16 LUFS)', timestamp: '00:08.50', status: 'done' },
    { id: '3', label: 'Specular card reflections baking', timestamp: '00:11.20', status: 'processing' },
  ],
  className = '',
  style = {},
}) => {
  const wipeClip = `inset(0 0 ${((1 - Math.max(0, Math.min(1, occlusionProgress))) * 100).toFixed(1)}% 0)`;

  return (
    <div
      className={`flex flex-col p-8 rounded-3xl ${className}`}
      style={{
        width: 440,
        backgroundColor: PASTEL_EDITORIAL_PALETTE.cardSubstrate,
        border: `1px solid ${PASTEL_EDITORIAL_PALETTE.divider}`,
        boxShadow: '0 24px 60px -15px rgba(27, 30, 36, 0.12)',
        clipPath: wipeClip,
        ...style,
      }}
    >
      {/* Title & Badge */}
      <div className="flex items-center justify-between mb-5">
        <span
          className="font-mono uppercase tracking-wider"
          style={{ fontSize: '18px', fontWeight: 700, color: PASTEL_EDITORIAL_PALETTE.deepInk }}
        >
          {title}
        </span>
        <span
          className="font-mono text-[#C93B2B]"
          style={{ fontSize: '18px', fontWeight: 700 }}
        >
          {Math.round(progress * 100)}%
        </span>
      </div>

      {/* Segmented Status Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {statusPills.map((pill, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full font-mono font-medium"
            style={{
              fontSize: '18px',
              backgroundColor: pill.active ? (pill.color ? `${pill.color}15` : '#1B1E2412') : 'rgba(0,0,0,0.04)',
              color: pill.active ? (pill.color || '#1B1E24') : 'rgba(27, 30, 36, 0.4)',
              border: `1px solid ${pill.active ? (pill.color || '#1B1E24') : 'transparent'}`,
            }}
          >
            {pill.label}
          </span>
        ))}
      </div>

      {/* Striped Progress Bar */}
      <div
        className="relative w-full h-4 rounded-full overflow-hidden mb-6"
        style={{ backgroundColor: 'rgba(27, 30, 36, 0.08)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${Math.round(progress * 100)}%`,
            backgroundColor: PASTEL_EDITORIAL_PALETTE.crimsonInk,
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.25) 0px, rgba(255, 255, 255, 0.25) 8px, transparent 8px, transparent 16px)',
          }}
        />
      </div>

      {/* Log Entries */}
      <div className="flex flex-col gap-3">
        {items.map((it) => (
          <div
            key={it.id}
            className="flex items-center justify-between py-2 border-b"
            style={{ borderColor: PASTEL_EDITORIAL_PALETTE.divider }}
          >
            <div className="flex items-center gap-3">
              {it.status === 'done' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : it.status === 'processing' ? (
                <div className="w-4 h-4 rounded-full border-2 border-[#C93B2B] border-t-transparent animate-spin" />
              ) : (
                <div className="w-3 h-3 rounded-full bg-black/20" />
              )}
              <span
                style={{
                  fontSize: '18px',
                  color: it.status === 'pending' ? 'rgba(27, 30, 36, 0.4)' : PASTEL_EDITORIAL_PALETTE.deepInk,
                }}
              >
                {it.label}
              </span>
            </div>
            {it.timestamp && (
              <span
                className="font-mono text-black/40"
                style={{ fontSize: '18px' }}
              >
                {it.timestamp}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 7. CLAPPERBOARD CTA
// ==========================================

export interface ClapperboardCTAProps {
  label?: string;
  clapperAngle?: number;
  accentColor?: string;
  bounceScale?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Action button with playful mini clapperboard graphic and impact bounce.
 */
export const ClapperboardCTA: React.FC<ClapperboardCTAProps> = ({
  label = 'HIT RENDER',
  clapperAngle = 0,
  accentColor = PASTEL_EDITORIAL_PALETTE.crimsonInk,
  bounceScale = 1,
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl select-none ${className}`}
      style={{
        backgroundColor: accentColor,
        color: '#FFFFFF',
        boxShadow: '0 16px 32px -8px rgba(201, 59, 43, 0.4)',
        transform: `scale(${bounceScale.toFixed(3)})`,
        ...style,
      }}
    >
      {/* Mini Clapperboard SVG with Hinged Arm */}
      <div className="relative w-8 h-8 flex items-center justify-center">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main Board Body */}
          <rect x="2" y="10" width="24" height="16" rx="3" fill="#FFFFFF" fillOpacity="0.2" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="2" y1="16" x2="26" y2="16" stroke="#FFFFFF" strokeWidth="1.5" />
          
          {/* Hinged Clapper Stick */}
          <g
            style={{
              transformOrigin: '2px 10px',
              transform: `rotate(${-clapperAngle}deg)`,
            }}
          >
            <rect x="2" y="4" width="24" height="6" rx="2" fill="#FFFFFF" />
            <line x1="8" y1="4" x2="6" y2="10" stroke={accentColor} strokeWidth="2" />
            <line x1="14" y1="4" x2="12" y2="10" stroke={accentColor} strokeWidth="2" />
            <line x1="20" y1="4" x2="18" y2="10" stroke={accentColor} strokeWidth="2" />
          </g>
        </svg>
      </div>

      <span
        className="font-bold tracking-wider uppercase"
        style={{ fontSize: '20px', letterSpacing: '0.05em' }}
      >
        {label}
      </span>
    </div>
  );
};

// ==========================================
// 8. WAVEFORM PULSE
// ==========================================

export interface WaveformPulseProps {
  progress?: number;
  width?: number;
  height?: number;
  color?: string;
  pulsePosition?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Minimal horizontal heartbeat/signal line with pulse accent.
 */
export const WaveformPulse: React.FC<WaveformPulseProps> = ({
  progress = 1,
  width = 600,
  height = 80,
  color = MOBILE_STING_PALETTE.violetPrimary,
  pulsePosition = 0.5,
  strokeWidth = 3,
  className = '',
  style = {},
}) => {
  const centerY = height / 2;
  const pulseX = width * Math.min(1, Math.max(0, pulsePosition));

  // Single clean heartbeat pulse path with boundary margin protection
  const p1 = Math.max(0, Math.min(width, pulseX - 40));
  const p2 = Math.max(0, Math.min(width, pulseX - 25));
  const p3 = Math.max(0, Math.min(width, pulseX - 10));
  const p4 = Math.max(0, Math.min(width, pulseX));
  const p5 = Math.max(0, Math.min(width, pulseX + 10));
  const p6 = Math.max(0, Math.min(width, pulseX + 25));
  const p7 = Math.max(0, Math.min(width, pulseX + 40));

  const path = `M 0 ${centerY} L ${p1} ${centerY} L ${p2} ${centerY - 10} L ${p3} ${centerY + 25} L ${p4} ${centerY - 35} L ${p5} ${centerY + 15} L ${p6} ${centerY - 5} L ${p7} ${centerY} L ${width} ${centerY}`;

  return (
    <div
      className={`relative ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background track line */}
        <line
          x1="0"
          y1={centerY}
          x2={width}
          y2={centerY}
          stroke={color}
          strokeOpacity="0.15"
          strokeWidth={strokeWidth}
        />
        {/* Animated active pulse */}
        <path
          d={path}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={width * 1.5}
          strokeDashoffset={(width * 1.5) * (1 - Math.min(1, Math.max(0, progress)))}
        />
        {/* Focal pulse bead */}
        {progress > 0 && (
          <circle
            cx={pulseX}
            cy={centerY}
            r={5}
            fill={color}
          />
        )}
      </svg>
    </div>
  );
};
