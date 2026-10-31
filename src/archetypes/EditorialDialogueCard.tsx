import type { FC } from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { SpecularCard, type CardAccentTone } from '../primitives/SpecularCard';
import { KineticText, type KineticHighlightTone } from '../primitives/KineticText';

export interface EditorialDialogueCardProps {
  /** GSAP card selector class (e.g. "card-deniz") */
  cardClassName: string;
  /** GSAP inner item selector class (e.g. "card-deniz-item") */
  itemClassName: string;
  /** GSAP word selector class for KineticText (e.g. "deniz-word") */
  wordClassName: string;
  /** Monogram initials (e.g. "DN", "AL") */
  initials: string;
  speakerName: string;
  roleBadge: string;
  handleMeta: string;
  timestamp: string;
  message: string;
  highlights?: Record<string, KineticHighlightTone>;
  accent?: CardAccentTone;
  /** Start time (seconds) when speaker voice waveform is active */
  speakStartSec?: number;
  /** End time (seconds) when speaker voice waveform settles */
  speakEndSec?: number;
  /** Optional bottom status badge text */
  statusBadgeText?: string;
  statusBadgeTone?: 'emerald' | 'red' | 'amber' | 'zinc';
  className?: string;
}

const STATUS_BADGE_MAP: Record<
  NonNullable<EditorialDialogueCardProps['statusBadgeTone']>,
  { wrap: string; dot: string }
> = {
  emerald: {
    wrap: 'bg-[#10b981]/12 border-[#10b981]/35 text-[#10b981]',
    dot: 'bg-[#10b981]',
  },
  red: {
    wrap: 'bg-[#ef4444]/14 border-[#ef4444]/40 text-[#ef4444]',
    dot: 'bg-[#ef4444]',
  },
  amber: {
    wrap: 'bg-[#f59e0b]/14 border-[#f59e0b]/40 text-[#f59e0b]',
    dot: 'bg-[#f59e0b]',
  },
  zinc: {
    wrap: 'bg-white/[0.05] border-white/[0.14] text-zinc-300',
    dot: 'bg-zinc-300',
  },
};

/**
 * EditorialDialogueCard (S1 + S9 Arketipi)
 * 1080p yayın ölçeğinde (76px monogram, 32px isim, 58px kelime-bazlı mesaj,
 * canlı ses frekans barları ve durum mührü) üst düzey diyalog/olay kartı.
 */
export const EditorialDialogueCard: FC<EditorialDialogueCardProps> = ({
  cardClassName,
  itemClassName,
  wordClassName,
  initials,
  speakerName,
  roleBadge,
  handleMeta,
  timestamp,
  message,
  highlights,
  accent = 'emerald',
  speakStartSec = 0,
  speakEndSec = 2.2,
  statusBadgeText,
  statusBadgeTone = 'emerald',
  className = '',
}) => {
  let frame = 0;
  let fps = 60;

  try {
    frame = useCurrentFrame();
    fps = useVideoConfig().fps;
  } catch {
    // Fallback
  }

  const currentSec = frame / fps;
  const isSpeaking = currentSec >= speakStartSec && currentSec <= speakEndSec;

  // Deterministic 5-bar voice waveform heights
  const waveBars = [0, 1, 2, 3, 4].map((idx) => {
    if (!isSpeaking) return 0.25;
    const phase = currentSec * 14 + idx * 1.35;
    return 0.3 + 0.7 * Math.abs(Math.sin(phase));
  });

  const statusStyle = STATUS_BADGE_MAP[statusBadgeTone];

  return (
    <SpecularCard
      cardClassName={cardClassName}
      tone="active"
      accent={accent}
      className={className}
    >
      {/* 1. ÜST KONUŞMACI META & SES DALGASI SATIRI */}
      <div
        className={`${itemClassName} flex items-center justify-between pb-7 mb-7 border-b border-white/[0.09]`}
      >
        <div className="flex items-center gap-5">
          {/* 76x76 Yayın Ölçekli Monogram Rozeti */}
          <div className="relative w-[76px] h-[76px] rounded-2xl bg-[#18181f] border border-white/[0.16] flex items-center justify-center font-mono font-black text-[28px] tracking-tight text-white shadow-inner">
            {initials}
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#121216] ${
                accent === 'red'
                  ? 'bg-[#ef4444]'
                  : accent === 'amber'
                  ? 'bg-[#f59e0b]'
                  : 'bg-[#10b981]'
              }`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3.5">
              <span className="text-[34px] font-bold tracking-[-0.025em] text-white leading-none">
                {speakerName}
              </span>
              <span className="px-3 py-1 rounded-md text-[18px] font-mono font-bold uppercase tracking-[0.12em] bg-white/[0.08] text-zinc-200 border border-white/[0.12]">
                {roleBadge}
              </span>
            </div>
            <div className="text-[20px] font-mono text-zinc-400 tracking-[0.04em]">
              {handleMeta}
            </div>
          </div>
        </div>

        {/* Sağ Üst: Canlı Ses Dalgası (Waveform) & Zaman Damgası */}
        <div className="flex flex-col items-end gap-2.5">
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-[#0d0d11] border border-white/[0.08]">
            <div className="flex items-center gap-1 h-5">
              {waveBars.map((scale, i) => (
                <span
                  key={i}
                  className="w-1.5 h-full rounded-full bg-zinc-200 origin-center will-change-transform"
                  style={{
                    transform: `scaleY(${scale.toFixed(3)})`,
                    opacity: isSpeaking ? 0.95 : 0.35,
                  }}
                />
              ))}
            </div>
            <span className="text-[18px] font-mono font-semibold text-zinc-300 tracking-[0.08em]">
              {timestamp}
            </span>
          </div>
        </div>
      </div>

      {/* 2. KELİME BAZLI KİNETİK MESAJ GÖVDESİ (58px Broadcast Scale) */}
      <div className={`${itemClassName} py-1`}>
        <KineticText
          text={message}
          wordClassName={wordClassName}
          variant="dialogue"
          highlights={highlights}
          quoted
        />
      </div>

      {/* 3. OPSİYONEL ALT DURUM / ONAY MÜHRÜ */}
      {statusBadgeText && (
        <div className={`${itemClassName} mt-7 pt-5 border-t border-white/[0.06] flex items-center justify-between`}>
          <div
            className={`inline-flex items-center gap-3 px-4 py-2 rounded-lg border font-mono text-[19px] font-bold uppercase tracking-[0.12em] ${statusStyle.wrap}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
            <span>{statusBadgeText}</span>
          </div>

          <span className="text-[18px] font-mono uppercase tracking-[0.14em] text-zinc-500">
            VERIFIED // E2E
          </span>
        </div>
      )}
    </SpecularCard>
  );
};
