import React, { useMemo } from 'react';

export type WorkflowPhase = 'button' | 'waveform' | 'note' | 'calendar' | 'badge';

export interface ProductWorkflowChainProps {
  /** Mevcut aşama ('button' | 'waveform' | 'note' | 'calendar' | 'badge') */
  phase?: WorkflowPhase;
  /** Aşama içi geçiş ilerlemesi (0.0 – 1.0) */
  progress?: number;
  /** Ana marka vurgu rengi (Varsayılan: '#ea580c' turuncu) */
  accentColor?: string;
  /** Not metni */
  noteText?: string;
  /** Çıkarılan görev başlığı */
  taskText?: string;
  /** Takvim saat hücresi */
  calendarTime?: string;
  /** CSS sınıfı */
  className?: string;
}

/**
 * <ProductWorkflowChain>
 * 
 * Opus 5.5 Master Rehber — Sayfa 9-11 (Prompt 5: Ürün Videosu):
 * "TEK KAP İLKESİ: Tek bir nesne kesilmeden şekil değiştiriyor:
 * Buton -> Ses Dalgası -> Yazıya dökülen Not -> Görev Kartı -> Takvim Hücresi -> Logo Onayı.
 * Göz bir nesneyi takip ettiği sürece izleyici kaybolmaz."
 */
export const ProductWorkflowChain: React.FC<ProductWorkflowChainProps> = ({
  phase = 'button',
  progress = 1.0,
  accentColor = '#ea580c',
  noteText = 'Yarın saat üçte ekiple ürün lansmanı toplantısı var.',
  taskText = 'Lansman Sunumu Hazırla',
  calendarTime = 'Yarın 15:00',
  className = '',
}) => {
  // Aşama bazlı konteyner geometrisi ve tarzı
  const containerStyle = useMemo(() => {
    switch (phase) {
      case 'button':
        return {
          width: '260px',
          height: '64px',
          borderRadius: '32px',
          bg: accentColor,
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 40px -15px rgba(234, 88, 12, 0.35)',
        };
      case 'waveform':
        return {
          width: '380px',
          height: '84px',
          borderRadius: '24px',
          bg: 'rgba(24, 24, 27, 0.92)',
          border: '1px solid rgba(234, 88, 12, 0.3)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        };
      case 'note':
        return {
          width: '540px',
          height: '220px',
          borderRadius: '20px',
          bg: 'rgba(24, 24, 27, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)',
        };
      case 'calendar':
        return {
          width: '460px',
          height: '160px',
          borderRadius: '20px',
          bg: 'rgba(24, 24, 27, 0.95)',
          border: `1px solid ${accentColor}44`,
          boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.6)',
        };
      case 'badge':
      default:
        return {
          width: '96px',
          height: '96px',
          borderRadius: '48px',
          bg: accentColor,
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 20px 40px -10px rgba(234, 88, 12, 0.45)',
        };
    }
  }, [phase, accentColor]);

  return (
    <div className={`flex items-center justify-center p-6 ${className}`}>
      <div
        className="workflow-container relative flex items-center justify-center overflow-hidden transition-all duration-300 backdrop-blur-xl"
        style={{
          width: containerStyle.width,
          height: containerStyle.height,
          borderRadius: containerStyle.borderRadius,
          backgroundColor: containerStyle.bg,
          border: containerStyle.border,
          boxShadow: containerStyle.boxShadow,
        }}
      >
        {/* AŞAMA 1: Buton Görünümü */}
        {phase === 'button' && (
          <div className="flex items-center gap-3 px-6 text-white font-medium text-[19px]">
            <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
            <span>Konuşmaya Başla</span>
          </div>
        )}

        {/* AŞAMA 2: Ses Dalgası */}
        {phase === 'waveform' && (
          <div className="flex items-center gap-1.5 px-6">
            {[24, 48, 32, 60, 40, 54, 28, 44, 58, 36, 50, 26].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full"
                style={{
                  height: `${h * Math.min(1, 0.4 + progress * 0.6)}px`,
                  backgroundColor: i % 2 === 0 ? accentColor : '#f1f5f9',
                  opacity: 0.85,
                }}
              />
            ))}
          </div>
        )}

        {/* AŞAMA 3: Not Kartı */}
        {phase === 'note' && (
          <div className="flex flex-col justify-between w-full h-full p-6 text-left">
            <div>
              <span className="text-[18px] uppercase tracking-wider text-zinc-400 font-semibold">
                Çözümlenen Sesli Not
              </span>
              <p className="mt-2 text-[22px] text-zinc-100 font-medium line-clamp-2 leading-relaxed">
                "{noteText}"
              </p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
              <span className="text-[18px] text-zinc-300">Otomatik Görev:</span>
              <span
                className="px-3 py-1 rounded-md text-[18px] font-medium text-white"
                style={{ backgroundColor: accentColor }}
              >
                {taskText}
              </span>
            </div>
          </div>
        )}

        {/* AŞAMA 4: Takvim Hücresi */}
        {phase === 'calendar' && (
          <div className="flex items-center justify-between w-full h-full px-8">
            <div className="flex flex-col text-left">
              <span className="text-[18px] text-zinc-400 font-medium">Takvime Eklendi</span>
              <span className="text-[26px] font-bold text-white mt-1">{taskText}</span>
              <span className="text-[20px] text-emerald-400 font-semibold mt-1">
                ✓ {calendarTime}
              </span>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-[24px] font-bold"
              style={{ backgroundColor: accentColor }}
            >
              📅
            </div>
          </div>
        )}

        {/* AŞAMA 5: Başarı / Onay Rozeti */}
        {phase === 'badge' && (
          <div className="flex items-center justify-center text-white text-[42px] font-bold">
            ✓
          </div>
        )}
      </div>
    </div>
  );
};
