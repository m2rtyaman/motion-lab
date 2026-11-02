import React from 'react';
import { useCurrentFrame } from 'remotion';

export interface LedgerEntry {
  id?: string;
  date?: string;
  description: string;
  ref?: string;
  amount?: string | number;
  balance?: string | number;
  /** Whether this row has an amber redaction/erasure block */
  isErased?: boolean;
  /** Optional replacement text over the erasure */
  erasureNote?: string;
  /** Status tag or auditor tick */
  status?: 'verified' | 'disputed' | 'settled';
}

export interface LedgerCardStageProps {
  /** Folio or ledger title (e.g. "GENERAL LEDGER · ACCOUNTS AUDIT") */
  title?: string;
  /** Archival reference code (e.g. "FOLIO 1937-B / DISPATCH 04") */
  ledgerCode?: string;
  /** Ledger timestamp or accounting date */
  date?: string;
  /** Ledger row entries */
  entries?: LedgerEntry[];
  /** Currently highlighted row index (-1 for none) */
  activeRowIndex?: number;
  /** Horizontal rule row height in pixels (default: 54px) */
  ruleHeight?: number;
  /** Left margin line offset in pixels (default: 96px) */
  marginOffset?: number;
  /** Amber erasure highlight color (default: '#FFC21A') */
  erasureColor?: string;
  /** Double vertical margin rule color (default: '#C4332B') */
  marginRuleColor?: string;
  /** Card container CSS classes */
  className?: string;
  /** Custom children injected into the ledger stage */
  children?: React.ReactNode;
}

/**
 * LedgerCardStage — Archival Accounting Ledger Stage
 * 
 * Based on Opus 5.5 Archive, Forensic Investigation & Printed Long Take:
 * - High-craft #151512 slate-black ground with 54px faint horizontal rules
 * - Double red vertical margin rules (#C4332B) at the debit/credit fold
 * - Amber #FFC21A word erasure / correction blocks
 * - Fixed-width tabular numeric typography for forensic precision
 */
export const LedgerCardStage: React.FC<LedgerCardStageProps> = ({
  title = 'AUDIT RECORD & ASSET LEDGER',
  ledgerCode = 'FOLIO NO. 448-E / RESTRICTED',
  date = '1937-05-06 · 18:25 EST',
  entries = [
    {
      date: 'MAY 04',
      description: 'TELETYPE DISPATCH: DOCKING CLEARANCE GRANTED',
      ref: 'RAD-01',
      amount: '$14,250.00',
      balance: '$14,250.00',
      status: 'verified',
    },
    {
      date: 'MAY 05',
      description: 'TELEMETRY SENSOR MATRIX RECALIBRATION',
      ref: 'LOG-88',
      amount: '–$2,400.00',
      balance: '$11,850.00',
      isErased: true,
      erasureNote: 'DISPUTED VARIANCE',
      status: 'disputed',
    },
    {
      date: 'MAY 06',
      description: 'FINAL APPROACH DESCENT & HARBOR MAST CONTACT',
      ref: 'NAV-99',
      amount: '–$8,150.00',
      balance: '$3,700.00',
      status: 'settled',
    },
  ],
  activeRowIndex = 1,
  ruleHeight = 54,
  marginOffset = 110,
  erasureColor = '#FFC21A',
  marginRuleColor = '#C4332B',
  className = '',
  children,
}) => {
  const frame = useCurrentFrame();

  return (
    <div
      className={`relative w-full max-w-[1100px] rounded-xl border border-zinc-800/80 overflow-hidden shadow-2xl ${className}`}
      style={{
        backgroundColor: '#151512',
        color: '#ECEAE4',
      }}
    >
      {/* 1. Header & Archival Folio Banner */}
      <div className="relative border-b border-zinc-800/80 px-8 py-5 flex items-center justify-between bg-zinc-900/40">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-xs"
              style={{ backgroundColor: marginRuleColor }}
            />
            <h2 className="text-[18px] font-bold tracking-wider font-mono uppercase text-zinc-100">
              {title}
            </h2>
          </div>
          <p className="text-[18px] font-mono tracking-widest text-zinc-400 mt-0.5">
            {ledgerCode}
          </p>
        </div>

        <div className="text-right font-mono">
          <span className="text-[18px] text-zinc-400 block tracking-wide">{date}</span>
          <span className="inline-block mt-1 text-[18px] font-semibold tracking-widest px-2.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300">
            RECORD AUTHENTICATED
          </span>
        </div>
      </div>

      {/* 2. Ledger Content Stage with 54px Rules and Double Red Margins */}
      <div
        className="relative min-h-[380px] p-0"
        style={{
          backgroundImage: `linear-gradient(to bottom, transparent ${ruleHeight - 1}px, rgba(255, 255, 255, 0.04) ${ruleHeight - 1}px, rgba(255, 255, 255, 0.04) ${ruleHeight}px)`,
          backgroundSize: `100% ${ruleHeight}px`,
        }}
      >
        {/* Double Red Vertical Margin Lines */}
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-[1px]"
          style={{
            left: `${marginOffset}px`,
            backgroundColor: marginRuleColor,
            opacity: 0.75,
          }}
        />
        <div
          className="pointer-events-none absolute top-0 bottom-0 w-[1px]"
          style={{
            left: `${marginOffset + 4}px`,
            backgroundColor: marginRuleColor,
            opacity: 0.75,
          }}
        />

        {/* Column Headers */}
        <div
          className="flex items-center border-b border-zinc-800/80 text-[18px] font-mono uppercase tracking-widest text-zinc-400 font-semibold"
          style={{ height: `${ruleHeight}px` }}
        >
          <div style={{ width: `${marginOffset}px` }} className="px-4 text-center">
            DATE
          </div>
          <div className="flex-1 px-6">TRANSACTION / EVIDENCE DESCRIPTION</div>
          <div className="w-[110px] text-center">REF NO.</div>
          <div className="w-[150px] text-right pr-6">DEBIT / CREDIT</div>
          <div className="w-[140px] text-right pr-8">BALANCE</div>
        </div>

        {/* Ledger Rows */}
        {entries.map((entry, idx) => {
          const isActive = idx === activeRowIndex;
          return (
            <div
              key={entry.id || idx}
              className={`flex items-center text-[18px] font-mono ${
                isActive ? 'bg-white/[0.04]' : ''
              }`}
              style={{
                height: `${ruleHeight}px`,
                borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
              }}
            >
              {/* Date Column */}
              <div
                style={{ width: `${marginOffset}px` }}
                className="px-4 text-center font-bold text-zinc-400 text-[18px]"
              >
                {entry.date || '—'}
              </div>

              {/* Description Column (With Amber Erasure Block support) */}
              <div className="flex-1 px-6 flex items-center gap-3 overflow-hidden">
                <span className="truncate text-zinc-200 font-medium">
                  {entry.description}
                </span>

                {entry.isErased && (
                  <span
                    className="shrink-0 px-2 py-0.5 text-[18px] font-bold tracking-wider rounded-xs shadow-sm uppercase font-mono"
                    style={{
                      backgroundColor: erasureColor,
                      color: '#0B0C0E',
                    }}
                  >
                    {entry.erasureNote || 'STRIKE / OVERRIDE'}
                  </span>
                )}
              </div>

              {/* Ref Code */}
              <div className="w-[110px] text-center text-zinc-500 text-[18px]">
                {entry.ref || '—'}
              </div>

              {/* Amount (Tabular figures) */}
              <div className="w-[150px] text-right pr-6 font-semibold tabular-nums text-zinc-300">
                {entry.amount || '—'}
              </div>

              {/* Balance (Rolling digits / Tabular figures) */}
              <div className="w-[140px] text-right pr-8 font-bold tabular-nums text-emerald-400">
                {entry.balance || '—'}
              </div>
            </div>
          );
        })}

        {/* Custom Children Projection */}
        {children && <div className="p-6">{children}</div>}
      </div>

      {/* 3. Archival Bottom Status Bar */}
      <div className="border-t border-zinc-800/80 px-8 py-3 bg-zinc-950/60 flex items-center justify-between text-[18px] font-mono text-zinc-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            VERIFIED INTEGRITY
          </span>
          <span>FRAME: {frame}</span>
        </div>
        <div className="tracking-widest uppercase">
          FORENSIC ARCHIVAL STANDARD · LEMOMO SPEC
        </div>
      </div>
    </div>
  );
};
