import type { FC } from 'react';
import { interpolate, useCurrentFrame } from 'remotion';

export interface CodeLineItem {
  number: number;
  tokens: { text: string; color?: string }[];
}

export interface CodeStreamBlockProps {
  id?: string;
  className?: string;
  lines?: CodeLineItem[];
  promptPath?: string;
  cursorBlink?: boolean;
  startFrame?: number;
  lineStaggerFrames?: number;
}

const DEFAULT_LINES: CodeLineItem[] = [
  {
    number: 1,
    tokens: [
      { text: 'import', color: 'text-purple-400' },
      { text: ' { orchestrate } ', color: 'text-white/90' },
      { text: 'from', color: 'text-purple-400' },
      { text: " '@engine/core'", color: 'text-emerald-400' },
    ],
  },
  {
    number: 2,
    tokens: [
      { text: 'const', color: 'text-indigo-400' },
      { text: ' stream = ', color: 'text-white/90' },
      { text: 'await', color: 'text-purple-400' },
      { text: ' orchestrate.connect({', color: 'text-sky-300' },
    ],
  },
  {
    number: 3,
    tokens: [
      { text: '  target: ', color: 'text-white/70' },
      { text: "'cluster-gpu-node-01'", color: 'text-amber-300' },
      { text: ',', color: 'text-white/50' },
    ],
  },
  {
    number: 4,
    tokens: [
      { text: '  mode: ', color: 'text-white/70' },
      { text: "'low-latency-stream'", color: 'text-emerald-400' },
    ],
  },
  {
    number: 5,
    tokens: [{ text: '});', color: 'text-white/90' }],
  },
];

export const CodeStreamBlock: FC<CodeStreamBlockProps> = ({
  id,
  className = '',
  lines = DEFAULT_LINES,
  promptPath = '~/runtime/pipeline',
  cursorBlink = true,
  startFrame = 0,
  lineStaggerFrames = 8,
}) => {
  const frame = useCurrentFrame();
  const cursorOpacity = Math.sin(frame * 0.22) >= 0 ? 1 : 0.15;

  return (
    <div
      id={id}
      className={`font-mono text-[19px] leading-relaxed select-none flex flex-col justify-between h-full ${className}`}
    >
      <div>
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-white/[0.08] text-white/50 text-[18px]">
          <span className="text-emerald-400">user@host</span>
          <span>:</span>
          <span className="text-sky-400">{promptPath}</span>
          <span className="text-white/40">$</span>
        </div>

        <div className="space-y-3">
          {lines.map((line, idx) => {
            const lineStart = startFrame + idx * lineStaggerFrames;
            const progress = interpolate(frame, [lineStart, lineStart + 10], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const translateY = (1 - progress) * 10;

            return (
              <div
                key={line.number}
                className="flex items-center gap-5 py-1 px-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                style={{
                  opacity: progress,
                  transform: `translateY(${translateY.toFixed(1)}px)`,
                }}
              >
                <span className="w-6 text-right text-white/30 select-none font-bold">
                  {String(line.number).padStart(2, '0')}
                </span>
                <div className="flex-1 whitespace-pre">
                  {line.tokens.map((token, i) => (
                    <span key={i} className={token.color || 'text-white/80'}>
                      {token.text}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/[0.08]">
        <div className="flex items-center gap-4">
          <span className="w-6 text-right text-emerald-400/70 select-none font-bold">&gt;</span>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <span>stream Lock verified</span>
            {cursorBlink && (
              <span
                className="w-2.5 h-5 bg-emerald-400 inline-block ml-1"
                style={{ opacity: cursorOpacity }}
              />
            )}
          </div>
        </div>
        <span className="text-[18px] text-white/40 font-mono">60.0 FPS // SYNC</span>
      </div>
    </div>
  );
};
