import type { FC } from 'react';
import { SpecularCard, type CardAccentTone } from '../primitives/SpecularCard';

export interface PipelineStep {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'active';
  detail: string;
}

export interface PipelineTerminalCardProps {
  cardClassName: string;
  itemClassName: string;
  headerTag: string;
  title: string;
  steps: PipelineStep[];
  logs: string[];
  accent?: CardAccentTone;
}

const STEP_STYLES: Record<PipelineStep['status'], { badge: string; dot: string; text: string }> = {
  pass: {
    badge: 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/35',
    dot: 'bg-[#10b981]',
    text: 'PASSED',
  },
  fail: {
    badge: 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/40',
    dot: 'bg-[#ef4444]',
    text: 'FAILED',
  },
  active: {
    badge: 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/35',
    dot: 'bg-[#f59e0b]',
    text: 'RUNNING',
  },
};

/**
 * PipelineTerminalCard (S4 + S7 Arketipi)
 * Lazer boru hattı düğümleri ve altında satır satır akan monospace terminal log penceresi.
 */
export const PipelineTerminalCard: FC<PipelineTerminalCardProps> = ({
  cardClassName,
  itemClassName,
  headerTag,
  title,
  steps,
  logs,
  accent = 'red',
}) => {
  return (
    <SpecularCard cardClassName={cardClassName} tone="active" accent={accent}>
      <div className={`${itemClassName} flex items-center justify-between pb-6 mb-6 border-b border-white/[0.08]`}>
        <span className="text-[19px] font-mono font-bold uppercase tracking-[0.16em] text-zinc-400">
          {headerTag}
        </span>
        <span className="text-[18px] font-mono text-zinc-500">SYS_PIPE // v4.2</span>
      </div>

      <h3 className={`${itemClassName} text-[44px] font-extrabold tracking-[-0.03em] text-white mb-7`}>
        {title}
      </h3>

      {/* Pipeline Düğümleri */}
      <div className="space-y-4 mb-8">
        {steps.map((step) => {
          const st = STEP_STYLES[step.status];
          return (
            <div
              key={step.id}
              className={`${itemClassName} flex items-center justify-between p-5 rounded-xl bg-[#0d0d11] border border-white/[0.08]`}
            >
              <div className="flex items-center gap-4">
                <span className={`w-3 h-3 rounded-full ${st.dot}`} />
                <span className="text-[22px] font-mono font-bold text-zinc-400">{step.id}</span>
                <span className="text-[26px] font-bold text-zinc-100">{step.label}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-[19px] font-mono text-zinc-400">{step.detail}</span>
                <span
                  className={`px-3.5 py-1 rounded-md border text-[17px] font-mono font-bold uppercase tracking-[0.12em] ${st.badge}`}
                >
                  {st.text}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monospace Terminal Akışı */}
      <div className="rounded-xl bg-[#09090b] border border-white/[0.08] p-6 space-y-2.5 font-mono text-[20px]">
        {logs.map((line, i) => (
          <div key={i} className={`${itemClassName} flex items-center gap-3 text-zinc-300`}>
            <span className="text-zinc-600 select-none">{String(i + 1).padStart(2, '0')}</span>
            <span className="truncate">{line}</span>
          </div>
        ))}
      </div>
    </SpecularCard>
  );
};
