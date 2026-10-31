import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../core/useRemotionGSAP';
import { animateCamera } from '../core/choreography';
import { blurScaleReveal, impactShake, maskWipeReveal, springSettle } from '../core/recipes';
import { PALETTE } from '../core/tokens';

/**
 * ALTIN STANDART #2 — kinetic-poster paradigması (tam ekran tipografi).
 * Tarifleri birleştirir: derinlikten gelen başlık, maske silmeli çizgi, aşırı-atışlı vurgu, darbe sarsıntısı.
 * Kayıtlı bir kompozisyon DEĞİLDİR; src/examples tsc + AST linter ile doğrulanır.
 */
export const KineticPosterExample: FC = () => {
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.poster-rig', [{ at: 0, duration: 0, scale: 1 }]);
    blurScaleReveal(tl, '.poster-h1', 0.1);
    maskWipeReveal(tl, '.poster-rule', 0.55);
    springSettle(tl, '.poster-stamp', 0.9);
    impactShake(tl, '.poster-rig', 0.9);
    return tl;
  }, []);

  return (
    <AbsoluteFill style={{ backgroundColor: PALETTE.bgBase }}>
      <div className="poster-rig absolute inset-0 flex flex-col items-center justify-center px-16">
        <h1
          className="poster-h1 text-[160px] font-extrabold tracking-tighter leading-[0.95] text-center"
          style={{ color: PALETTE.textPrimary }}
        >
          SHIP IT
        </h1>
        <div className="poster-rule mt-10 h-[6px] w-[640px]" style={{ backgroundColor: PALETTE.semanticSuccess }} />
        <div
          className="poster-stamp mt-14 font-mono uppercase text-[32px] tracking-[0.18em]"
          style={{ color: PALETTE.textMuted }}
        >
          zero slop
        </div>
      </div>
    </AbsoluteFill>
  );
};
