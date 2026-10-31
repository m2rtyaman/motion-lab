import type { FC } from 'react';
import { useCurrentFrame } from 'remotion';

export interface ShockwaveRoarProps {
  /** Whether the roar VFX is active on the current frame */
  active: boolean;
  /** Frame when the current roar started (for expanding wave calculation) */
  roarStartFrame: number;
  /** Character X position in px */
  originX: number;
  /** Character Y position in px */
  originY: number;
  /** Character depth scale */
  actorScale: number;
  /** Battle-cry text */
  text: string;
}

const SPIKE_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/**
 * ShockwaveRoar — Sonik Şok Dalgası Halkaları, Radyal Darbe Çizgileri ve Savaş Çığlığı VFX
 * - Karakterin göğüs/ağız merkezinden yayılan 3 katmanlı ses dalgası halkası.
 * - Karakterin yüzünü asla kapatmayan, tam tepe noktasına (head-top clearance) hizalı savaş çığlığı.
 */
export const ShockwaveRoar: FC<ShockwaveRoarProps> = ({
  active,
  roarStartFrame,
  originX,
  originY,
  actorScale,
  text,
}) => {
  const frame = useCurrentFrame();
  if (!active) return null;

  const localFrame = Math.max(0, frame - roarStartFrame);
  const entranceScale = Math.min(1, localFrame / 5);

  // 3 staggered sonic wave rings (repeating every 20 frames)
  const rings = [0, 7, 14].map((offset) => {
    const t = ((localFrame + offset) % 21) / 21;
    return {
      scale: 0.45 + t * 2.6,
      opacity: (1 - t) * 0.72,
    };
  });

  const chars = text.split('');
  // Dwarf head clearance offset based on current depth scale
  const headClearanceY = -78 * actorScale;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 w-0 h-0 z-30 will-change-transform"
      style={{
        transform: `translate(${originX}px, ${originY}px)`,
      }}
    >
      {/* 1. GENİŞLEYEN SONİK ŞOK DALGASI HALKALARI (3 Katmanlı) */}
      {rings.map((ring, idx) => (
        <div
          key={idx}
          className="absolute left-0 top-0 rounded-full border-[3px] border-amber-200/80 will-change-transform"
          style={{
            width: `${150 * (actorScale / 2.2)}px`,
            height: `${150 * (actorScale / 2.2)}px`,
            opacity: ring.opacity,
            transform: `translate(-50%, -50%) scale(${ring.scale.toFixed(3)})`,
          }}
        />
      ))}

      {/* 2. RADYAL ANİME / OYUN DARBE ÇİZGİLERİ (12 Açılı Impact Spikes) */}
      <svg
        viewBox="-200 -200 400 400"
        className="absolute left-0 top-0 w-[420px] h-[420px] overflow-visible"
        style={{
          transform: `translate(-50%, -50%) scale(${
            (actorScale / 2.2) * (0.92 + (localFrame % 6) * 0.035)
          }) rotate(${(localFrame % 4) * 3}deg)`,
        }}
      >
        {SPIKE_ANGLES.map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const innerR = 72 + ((i + localFrame) % 3) * 14;
          const outerR = 148 + ((i * 2 + localFrame) % 4) * 20;
          const x1 = Math.cos(rad) * innerR;
          const y1 = Math.sin(rad) * innerR;
          const x2 = Math.cos(rad) * outerR;
          const y2 = Math.sin(rad) * outerR;

          return (
            <line
              key={angle}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={i % 2 === 0 ? '#fef3c7' : '#f59e0b'}
              strokeWidth={i % 3 === 0 ? '4.5' : '2.5'}
              strokeLinecap="round"
              opacity={0.75}
            />
          );
        })}
      </svg>

      {/* 3. KARAKTERİN BAŞ ÜSTÜNE HİZALI SAVAŞ ÇIĞLIĞI TİPOGRAFİSİ (Yüzü Asla Kapatmaz) */}
      <div
        className="absolute left-0 will-change-transform"
        style={{
          top: `${headClearanceY}px`,
          transform: `translate(-50%, -100%) scale(${
            entranceScale * Math.min(1.05, Math.max(0.76, actorScale / 2.35))
          }) rotate(${Math.sin(localFrame * 1.7) * 2.2}deg)`,
        }}
      >
        <div
          className="relative px-7 py-3 bg-[#b91c1c] border-[3px] border-amber-200"
          style={{
            transform: 'skewX(-8deg)',
            boxShadow: '8px 10px 0px rgba(0,0,0,0.88)',
          }}
        >
          <div
            className="flex items-center justify-center whitespace-nowrap text-[38px] font-black uppercase tracking-[-0.02em] leading-none"
            style={{ transform: 'skewX(8deg)' }}
          >
            {chars.map((ch, idx) => {
              const jitterY = Math.sin(localFrame * 2.4 + idx * 1.3) * 3.8;
              const jitterRot = Math.cos(localFrame * 2.1 + idx * 0.9) * 3.0;
              return (
                <span
                  key={idx}
                  className="inline-block text-[#fef3c7] will-change-transform"
                  style={{
                    transform: `translateY(${jitterY.toFixed(1)}px) rotate(${jitterRot.toFixed(1)}deg)`,
                    textShadow: '0 4px 0 #450a0a, 0 8px 14px rgba(0,0,0,0.9)',
                  }}
                >
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              );
            })}
          </div>

          {/* Alt Şimşek Çentiği (Roar Pointer) */}
          <div className="absolute left-1/2 -bottom-3 -translate-x-1/2 w-5 h-5 bg-[#b91c1c] rotate-45 border-r-[3px] border-b-[3px] border-amber-200" />
        </div>
      </div>
    </div>
  );
};
