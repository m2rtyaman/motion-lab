import type { FC } from 'react';

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
}) => {
  return (
    <div
      id={id}
      className={`font-mono text-[18px] leading-relaxed select-none ${className}`}
    >
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/[0.08] text-white/50 text-[18px]">
        <span className="text-emerald-400">user@host</span>
        <span>:</span>
        <span className="text-sky-400">{promptPath}</span>
        <span className="text-white/40">$</span>
      </div>

      <div className="space-y-1">
        {lines.map((line) => (
          <div key={line.number} className="flex items-center gap-4">
            <span className="w-6 text-right text-white/30 select-none">
              {line.number}
            </span>
            <div className="flex-1 whitespace-pre">
              {line.tokens.map((token, i) => (
                <span key={i} className={token.color || 'text-white/80'}>
                  {token.text}
                </span>
              ))}
            </div>
          </div>
        ))}

        <div className="flex items-center gap-4 mt-3">
          <span className="w-6 text-right text-white/30 select-none">&gt;</span>
          <div className="flex items-center gap-1 text-emerald-400">
            <span>ready</span>
            {cursorBlink && (
              <span className="w-2.5 h-5 bg-emerald-400 inline-block animate-pulse ml-1" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
