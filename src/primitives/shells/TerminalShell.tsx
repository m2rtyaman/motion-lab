import type { FC, ReactNode } from 'react';

export interface TerminalShellProps {
  id?: string;
  className?: string;
  title?: string;
  path?: string;
  children: ReactNode;
  width?: string | number;
  height?: string | number;
}

export const TerminalShell: FC<TerminalShellProps> = ({
  id,
  className = '',
  title = 'terminal',
  path = '~/workspace',
  children,
  width = '100%',
  height = 'auto',
}) => {
  return (
    <div
      id={id}
      className={`relative rounded-2xl bg-[#080b11] border border-white/[0.14] shadow-2xl shadow-black/80 overflow-hidden flex flex-col font-mono select-none ${className}`}
      style={{ width, height }}
    >
      {/* Titlebar with Traffic Lights */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.08] select-none">
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/50 inline-block" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/50 inline-block" />
          <span className="w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]/50 inline-block" />
        </div>

        <div className="flex items-center gap-2 text-white/50 text-[18px]">
          <span className="text-white/30">bash</span>
          <span>-</span>
          <span className="text-white/70 font-semibold">{title}</span>
          <span>-</span>
          <span className="text-white/40">{path}</span>
        </div>

        <div className="w-16" />
      </div>

      {/* Terminal Body */}
      <div className="p-6 flex-1 overflow-hidden bg-gradient-to-b from-transparent to-black/20 flex flex-col">
        {children}
      </div>
    </div>
  );
};
