import { type FC, type ReactNode } from 'react';
import { useCurrentFrame } from 'remotion';
import { computeEqualizerBarHeight } from '../core/procedural-audio';

export { computeEqualizerBarHeight };

/**
 * DARK RED AUDIO / WAVEFORM PALETTE
 * Kaynak: references/OPUS_5.5_STYLE_GUIDE.md & Gemini Omni Flash Reference Breakdown
 */
export const DARK_RED_AUDIO_PALETTE = {
  bg: '#07080a',
  bgRadial: 'radial-gradient(circle at 50% 40%, rgba(139, 0, 0, 0.35) 0%, rgba(7, 8, 10, 0.95) 70%, #07080a 100%)',
  panelBg: 'rgba(24, 10, 14, 0.65)',
  panelBorder: 'rgba(229, 9, 20, 0.28)',
  accentRed: '#e50914',
  deepRed: '#8b0000',
  glowRed: 'rgba(229, 9, 20, 0.45)',
  textWhite: '#f4f4f5',
  textMuted: '#94959b',
  textAccent: '#ff4d52',
} as const;

// -----------------------------------------------------------------------------
// 1. WAVEFORM VISUALIZER (Koyu Kırmızı Panel İçinde Ekolayzır)
// -----------------------------------------------------------------------------

export interface WaveformVisualizerProps {
  barCount?: number;
  width?: number;
  height?: number;
  frame?: number;
  accentColor?: string;
  glow?: boolean;
  className?: string;
}

export const WaveformVisualizer: FC<WaveformVisualizerProps> = ({
  barCount = 36,
  width = 640,
  height = 96,
  frame: frameProp,
  accentColor = DARK_RED_AUDIO_PALETTE.accentRed,
  glow = true,
  className = '',
}) => {
  const currentFrame = useCurrentFrame();
  const f = frameProp ?? currentFrame;

  const barWidth = Math.max(3, (width - (barCount - 1) * 4) / barCount);
  const gap = 4;

  return (
    <div
      className={`relative flex items-center justify-center p-6 rounded-2xl border backdrop-blur-md ${className}`}
      style={{
        backgroundColor: DARK_RED_AUDIO_PALETTE.panelBg,
        borderColor: DARK_RED_AUDIO_PALETTE.panelBorder,
        boxShadow: glow
          ? `0 16px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08), 0 0 32px ${DARK_RED_AUDIO_PALETTE.glowRed}`
          : '0 16px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="eqRedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ff6b6b" />
            <stop offset="50%" stopColor={accentColor} />
            <stop offset="100%" stopColor={DARK_RED_AUDIO_PALETTE.deepRed} />
          </linearGradient>
        </defs>

        {Array.from({ length: barCount }).map((_, i) => {
          const barH = computeEqualizerBarHeight(i, barCount, f, height * 0.88);
          const x = i * (barWidth + gap);
          const y = (height - barH) / 2;

          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={barWidth / 2}
              fill="url(#eqRedGrad)"
              style={{
                filter: glow && barH > height * 0.5 ? 'drop-shadow(0 0 6px rgba(229,9,20,0.6))' : 'none',
              }}
            />
          );
        })}
      </svg>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 2. MUSIC PILL INTERFACE (Merkezi Kapsül Müzik Arayüzü)
// -----------------------------------------------------------------------------

export interface MusicPillInterfaceProps {
  title?: string;
  subtitle?: string;
  progress?: number; // 0..1
  isPlaying?: boolean;
  frame?: number;
  className?: string;
  accentColor?: string;
}

export const MusicPillInterface: FC<MusicPillInterfaceProps> = ({
  title = 'Soundtrack of Motion',
  subtitle = 'Lossless Audio Stream • 48 kHz',
  progress = 0.42,
  isPlaying = true,
  frame: frameProp,
  className = '',
  accentColor = DARK_RED_AUDIO_PALETTE.accentRed,
}) => {
  const currentFrame = useCurrentFrame();
  const f = frameProp ?? currentFrame;
  const pulse = Math.sin(f * 0.12) * 0.08 + 1;

  return (
    <div
      className={`inline-flex items-center gap-5 px-6 py-3.5 rounded-full border backdrop-blur-xl select-none ${className}`}
      style={{
        backgroundColor: 'rgba(18, 9, 12, 0.82)',
        borderColor: DARK_RED_AUDIO_PALETTE.panelBorder,
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.7), 0 0 24px rgba(229, 9, 20, 0.22), inset 0 1px 1px rgba(255, 255, 255, 0.12)`,
      }}
    >
      {/* Oynat / Duraklat Mikro İkonu */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: accentColor,
          transform: `scale(${pulse})`,
          boxShadow: `0 0 16px ${DARK_RED_AUDIO_PALETTE.glowRed}`,
        }}
      >
        {isPlaying ? (
          <div className="flex items-center gap-1">
            <span className="w-1 h-3.5 bg-white rounded-full" />
            <span className="w-1 h-3.5 bg-white rounded-full" />
          </div>
        ) : (
          <span className="w-0 h-0 border-y-[6px] border-y-transparent border-l-[10px] border-l-white ml-0.5" />
        )}
      </div>

      {/* Başlık ve İlerleme Çubuğu */}
      <div className="flex flex-col min-w-[280px]">
        <div className="flex items-center justify-between text-xl mb-1.5">
          <span className="font-semibold text-white tracking-tight">{title}</span>
          <span className="text-base font-mono text-zinc-400">
            {Math.floor(progress * 180)}s / 180s
          </span>
        </div>

        {/* İlerleme İzi (Scrubber) */}
        <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden relative">
          <div
            className="h-full rounded-full transition-none"
            style={{
              width: `${Math.max(0, Math.min(1, progress)) * 100}%`,
              backgroundColor: accentColor,
              boxShadow: `0 0 8px ${accentColor}`,
            }}
          />
        </div>

        <span className="text-base text-zinc-400 mt-1.5 font-mono tracking-wider uppercase">
          {subtitle}
        </span>
      </div>

      {/* Mini Canlı Ekolayzır Rozeti */}
      <div className="flex items-end gap-0.5 h-4 px-2 py-1 rounded bg-black/40 border border-white/5">
        {[0, 1, 2, 3].map((barIdx) => {
          const h = 4 + Math.abs(Math.sin(f * 0.2 + barIdx * 1.1)) * 10;
          return (
            <span
              key={barIdx}
              className="w-0.5 rounded-full"
              style={{
                height: `${h}px`,
                backgroundColor: barIdx === 1 ? '#ff6b6b' : accentColor,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// 3. SELECTIVE EMPHASIS TEXT (Kırmızı Vurgulu Metin)
// -----------------------------------------------------------------------------

export interface SelectiveEmphasisTextProps {
  text: string;
  emphasizeWords: string[];
  emphasisColor?: string;
  className?: string;
  emphasisClassName?: string;
}

export const SelectiveEmphasisText: FC<SelectiveEmphasisTextProps> = ({
  text,
  emphasizeWords,
  emphasisColor = DARK_RED_AUDIO_PALETTE.textAccent,
  className = 'text-lg text-zinc-200 tracking-tight leading-relaxed',
  emphasisClassName = 'font-bold',
}) => {
  // Kelimeleri koruyarak tokenize et
  const words = text.split(/(\s+)/);
  const normalizedTargets = new Set(
    emphasizeWords.map((w) => w.toLowerCase().replace(/[^a-z0-9]/gi, ''))
  );

  return (
    <p className={className}>
      {words.map((word, idx) => {
        const clean = word.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const isEmphasized = clean.length > 0 && normalizedTargets.has(clean);

        if (isEmphasized) {
          return (
            <span
              key={idx}
              className={emphasisClassName}
              style={{
                color: emphasisColor,
                textShadow: `0 0 16px rgba(229, 9, 20, 0.4)`,
              }}
            >
              {word}
            </span>
          );
        }

        return <span key={idx}>{word}</span>;
      })}
    </p>
  );
};

// -----------------------------------------------------------------------------
// 4. EQUALIZER WAVEFORM STAGE (Tam Sahne Kapsayıcı)
// -----------------------------------------------------------------------------

export interface EqualizerWaveformStageProps {
  children?: ReactNode;
  aspect?: '16:9' | '9:16';
  className?: string;
}

export const EqualizerWaveformStage: FC<EqualizerWaveformStageProps> = ({
  children,
  aspect = '16:9',
  className = '',
}) => {
  const isVertical = aspect === '9:16';

  return (
    <div
      className={`w-full h-full relative overflow-hidden flex flex-col items-center justify-center select-none ${isVertical ? 'px-6' : 'px-16'} ${className}`}
      style={{
        backgroundColor: DARK_RED_AUDIO_PALETTE.bg,
        backgroundImage: DARK_RED_AUDIO_PALETTE.bgRadial,
      }}
    >
      {/* İnce radyal kırmızı atmosfer ışığı */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full pointer-events-none blur-[140px]"
        style={{
          background: 'radial-gradient(circle, rgba(229, 9, 20, 0.18) 0%, transparent 70%)',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {children}
    </div>
  );
};
