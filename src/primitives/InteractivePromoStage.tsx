import { type FC, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import {
  computeWriteOnProgress,
  computeWarpShapePath,
  computeVerticalPanelWipe,
} from '../core/promo-20s-math';

/**
 * INTERACTIVE PROMO PALETTE
 * Kaynak: references/PROMO_20S_WORKFLOW_GUIDE.md
 */
export const PROMO_PALETTE = {
  editorBg: '#07090e',
  editorGrid: 'rgba(255, 255, 255, 0.06)',
  workspaceBg: '#f7f4ed',
  workspaceGrid: 'rgba(0, 0, 0, 0.05)',
  accentCoral: '#ff6363',
  accentViolet: '#6c5ce7',
  accentTeal: '#00cec9',
  accentYellow: '#ffeaa7',
  textDark: '#1e1e24',
  textLight: '#f4f4f5',
} as const;

// -----------------------------------------------------------------------------
// 1. WRITE-ON SCRIPT (Canlı El Yazısı ve Stylus İmleci)
// -----------------------------------------------------------------------------

export interface WriteOnScriptProps {
  progress: number; // 0..1
  scriptText?: string;
  className?: string;
  color?: string;
}

/** @deprecated legacy look — not for v2 */
export const WriteOnScript: FC<WriteOnScriptProps> = ({
  progress,
  scriptText = 'remyframe',
  className = '',
  color = '#ffffff',
}) => {
  const { dashOffset, totalLength, stylusX, stylusY, underlineProgress } =
    computeWriteOnProgress(progress, 720);

  return (
    <div className={`relative w-[640px] h-[260px] flex items-center justify-center select-none ${className}`}>
      <svg
        width="640"
        height="260"
        viewBox="0 0 640 260"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="scriptGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff7675" />
            <stop offset="50%" stopColor={color} />
            <stop offset="100%" stopColor="#74b9ff" />
          </linearGradient>
        </defs>

        {/* Yazılan Script Metin (Daktilo / Kaligrafi Yolu) */}
        <text
          x="320"
          y="155"
          textAnchor="middle"
          fill="none"
          stroke="url(#scriptGlow)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset}
          className="font-serif italic font-bold text-7xl tracking-wide"
          style={{
            fontFamily: "'Brush Script MT', 'Dancing Script', 'Caveat', cursive, serif",
          }}
        >
          {scriptText}
        </text>

        {/* Dinamik Alt Çizgi Vurgusu (Underline Strike) */}
        {underlineProgress > 0 && (
          <path
            d="M 160 185 Q 320 205 480 185"
            fill="none"
            stroke="#ff7675"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={340}
            strokeDashoffset={340 * (1 - underlineProgress)}
          />
        )}

        {/* Kalem / Stylus İmleç Ucu (Canlı Yazma Noktası) */}
        {progress > 0 && progress < 0.98 && (
          <g transform={`translate(${stylusX}, ${stylusY})`}>
            {/* Kalem ucu parlaması */}
            <circle cx="0" cy="0" r="10" fill="#ff7675" opacity="0.3" />
            <circle cx="0" cy="0" r="4" fill="#ffffff" />
            {/* Sanal Stylus Gövdesi */}
            <line x1="0" y1="0" x2="35" y2="-55" stroke="rgba(255,255,255,0.7)" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
      </svg>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. WARP SHAPE FRAME (Organik Dalgalanan CTA & Payoff Çerçevesi)
// -----------------------------------------------------------------------------

export interface WarpShapeFrameProps {
  children?: ReactNode;
  frame?: number;
  width?: number;
  height?: number;
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const WarpShapeFrame: FC<WarpShapeFrameProps> = ({
  children,
  frame: frameProp,
  width = 680,
  height = 420,
  className = '',
}) => {
  const currentFrame = useCurrentFrame();
  const f = frameProp ?? currentFrame;
  const pathD = computeWarpShapePath(f, 210, width / 2, height / 2, 22);

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width, height }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="absolute inset-0 pointer-events-none overflow-visible"
      >
        <defs>
          <linearGradient id="warpFluidGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff7675" />
            <stop offset="30%" stopColor="#6c5ce7" />
            <stop offset="70%" stopColor="#00cec9" />
            <stop offset="100%" stopColor="#ffeaa7" />
          </linearGradient>
        </defs>

        {/* Sıvı Organik Dalgalanan Arka Plan Şekli */}
        <path
          d={pathD}
          fill="url(#warpFluidGrad)"
          style={{
            filter: 'drop-shadow(0 20px 50px rgba(108, 92, 231, 0.45))',
            opacity: 0.92,
          }}
        />
        {/* İç Şeffaf Odak Alanı */}
        <circle cx={width / 2} cy={height / 2} r="150" fill="#07090e" opacity="0.85" />
      </svg>

      {/* Merkezdeki CTA / Payoff İçeriği */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center p-8">
        {children}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. VERTICAL PANEL RESET (Dikey Renk Panelleri Sıfırlaması)
// -----------------------------------------------------------------------------

export interface VerticalPanelResetProps {
  progress: number; // 0..1
  panels?: string[];
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const VerticalPanelReset: FC<VerticalPanelResetProps> = ({
  progress,
  panels = ['#ff7675', '#6c5ce7', '#00cec9', '#07090e'],
  className = '',
}) => {
  if (progress <= 0 || progress >= 1) return null;

  return (
    <div className={`absolute inset-0 pointer-events-none flex z-40 overflow-hidden ${className}`}>
      {panels.map((color, i) => {
        const { translateYPercent, opacity } = computeVerticalPanelWipe(progress, i, panels.length);

        return (
          <div
            key={i}
            className="flex-1 h-full shadow-2xl"
            style={{
              backgroundColor: color,
              transform: `translateY(${translateYPercent}%)`,
              opacity,
            }}
          />
        );
      })}
    </div>
  );
};

// -----------------------------------------------------------------------------
// 4. INTERACTIVE PROMO STAGE (Koyu Editör / Sıcak Çalışma Alanı Sahnesi)
// -----------------------------------------------------------------------------

export interface InteractivePromoStageProps {
  children?: ReactNode;
  mode?: 'dark-editor' | 'warm-workspace';
  aspect?: '16:9' | '9:16';
  className?: string;
}

/** @deprecated legacy look — not for v2 */
export const InteractivePromoStage: FC<InteractivePromoStageProps> = ({
  children,
  mode = 'dark-editor',
  aspect = '16:9',
  className = '',
}) => {
  const isDark = mode === 'dark-editor';
  const isVertical = aspect === '9:16';

  const bgColor = isDark ? PROMO_PALETTE.editorBg : PROMO_PALETTE.workspaceBg;
  const gridColor = isDark ? PROMO_PALETTE.editorGrid : PROMO_PALETTE.workspaceGrid;

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center select-none ${isVertical ? 'px-8' : 'px-20'} ${className}`}
      style={{
        backgroundColor: bgColor,
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}
    >
      {/* İnce Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(3,4,6,0.8) 100%)'
            : 'radial-gradient(circle at 50% 50%, transparent 70%, rgba(210,200,185,0.4) 100%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
};
