import { type FC } from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { blurScaleReveal, impactShake, maskWipeReveal, springSettle } from '../../core/recipes';
import { PALETTE } from '../../core/tokens';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

/**
 * ALTIN STANDART — kinetic-poster paradigması (tam ekran tipografi).
 * Beat'ler spec.json ile birebir aynıdır (validate-spec kayma kontrolü bunu doğrular).
 * Tarifler: derinlikten gelen başlık, maske silmeli çizgi, aşırı-atışlı damga, darbe sarsıntısı.
 */
const BEATS = [
  { id: 'reveal', startFrame: 0, endFrame: 59 },
  { id: 'stamp', startFrame: 60, endFrame: 119 },
  { id: 'hold', startFrame: 120, endFrame: 180 },
] as const;

export const Scene: FC<SceneProps> = () => {
  const frame = useCurrentFrame();
  const beat = BEATS.find((b) => frame >= b.startFrame && frame <= b.endFrame) ?? BEATS[BEATS.length - 1];

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.poster-rig', [
      { at: 0, duration: 0, scale: 1.08 },
      { at: 0.05, duration: 1.2, scale: 1, ease: 'power2.out' },
      { at: 1.5, duration: 1.4, scale: 1.06, ease: 'power2.inOut' },
    ]);
    blurScaleReveal(tl, '.poster-h1', 0.1);
    maskWipeReveal(tl, '.poster-rule', 0.55);
    springSettle(tl, '.poster-stamp', 0.9);
    impactShake(tl, '.poster-shake', 0.9);
    return tl;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bgBase }} data-beat={beat.id}>
      <div className="poster-rig absolute inset-0">
        <div className="poster-shake absolute inset-0 flex flex-col items-center justify-center px-16">
          <h1
            className="poster-h1 text-[200px] font-extrabold tracking-tighter leading-[0.92] text-center"
            style={{ color: PALETTE.textPrimary }}
          >
            SHIP
            <br />
            IT
          </h1>
          <div
            className="poster-rule mt-12 h-[8px] w-[640px]"
            style={{ backgroundColor: PALETTE.semanticSuccess }}
          />
          <div
            className="poster-stamp mt-16 font-mono uppercase text-[36px] tracking-[0.18em]"
            style={{ color: PALETTE.textSecondary }}
          >
            zero slop
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
