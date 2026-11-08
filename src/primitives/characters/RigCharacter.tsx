import { type CSSProperties, type FC } from 'react';
import { RIG_GEOM } from '../../core/physics';

/**
 * A flat-vector character built from nested divs with named, separately transformable parts.
 * Drive it with the helpers in src/core/physics.ts (rigWalk, idleBreath, lookAt, react, turn) using the same `id`.
 *
 * Classes (prefix `<id>-`): root, flip, shadow, hips, torso, head, brows, eyes, pupils,
 * arm-l / arm-r (upper), forearm-l / forearm-r, thigh-l / thigh-r (alias leg-l / leg-r), shin-l / shin-r, foot-l / foot-r.
 * `-l` is the NEAR side (drawn in front), `-r` the far side (darker). Rest pose = every rotation 0, legs straight, facing `facing`.
 * Rig box 360 x 680 px, character 658 px tall, sole on the bottom edge: place it with `left` and `groundY`.
 */
export interface RigPalette {
  skin: string; hair: string; shirt: string; sleeve: string; pants: string; shoes: string; outline: string;
}
export const DEFAULT_RIG_PALETTE: RigPalette = {
  skin: '#F2B58F', hair: '#3A2A24', shirt: '#F4C84A', sleeve: '#E8604C', pants: '#4D6FA8', shoes: '#F3F4F6', outline: '#121826',
};
export interface RigCharacterProps {
  id: string;
  /** Left edge of the rig box, px. */
  left: number;
  /** y of the ground line (the soles), px. */
  groundY: number;
  facing?: 'left' | 'right';
  palette?: Partial<RigPalette>;
  shadow?: boolean;
}

const G = RIG_GEOM;
const TORSO = { x: 124, y: 150, w: 112, h: 230 }; // page coordinates of the torso box
const SHOULDER_Y = 172;
const HEAD = { r: 62, cy: 84 };
const far = (c: string): string => `color-mix(in srgb, ${c} 70%, #000)`;
const box = (l: number, t: number, w: number, h: number, extra: CSSProperties = {}): CSSProperties => ({ position: 'absolute', left: l, top: t, width: w, height: h, boxSizing: 'border-box', ...extra });

const Leg: FC<{ id: string; side: 'l' | 'r'; p: RigPalette }> = ({ id, side, p }) => {
  const near = side === 'l', x = G.hipX + (near ? G.legOff : -G.legOff);
  const pants = near ? p.pants : far(p.pants), line = `4px solid ${p.outline}`;
  return (
    <div className={`${id}-thigh-${side} ${id}-leg-${side}`} style={box(x - 21, G.hipY, 42, G.thigh + 8, { backgroundColor: pants, border: line, borderRadius: 21, transformOrigin: '21px 0px' })}>
      <div className={`${id}-shin-${side}`} style={box(0, G.thigh, 42, G.shin + 6, { backgroundColor: pants, border: line, borderRadius: 18, transformOrigin: '21px 0px', filter: 'brightness(0.94)' })}>
        <div className={`${id}-foot-${side}`} style={box(21 - G.footBack - 4, G.shin, G.footBack + G.footFront, G.ankle, { backgroundColor: near ? p.shoes : far(p.shoes), border: line, borderRadius: '8px 26px 8px 8px', transformOrigin: `${G.footBack}px 0px` })} />
      </div>
    </div>
  );
};

const Arm: FC<{ id: string; side: 'l' | 'r'; p: RigPalette }> = ({ id, side, p }) => {
  const near = side === 'l', line = `4px solid ${p.outline}`, top = SHOULDER_Y - TORSO.y - 12;
  return (
    <div className={`${id}-arm-${side}`} style={box(TORSO.w / 2 - 17, top, 34, 100, { backgroundColor: near ? p.sleeve : far(p.sleeve), border: line, borderRadius: 14, transformOrigin: "17px 14px" })}>
      <div className={`${id}-forearm-${side}`} style={box(3, 82, 28, 92, { backgroundColor: near ? p.skin : far(p.skin), border: line, borderRadius: 12, transformOrigin: "14px 12px" })} />
    </div>
  );
};

export const RigCharacter: FC<RigCharacterProps> = ({ id, left, groundY, facing = 'right', palette, shadow = true }) => {
  const p: RigPalette = { ...DEFAULT_RIG_PALETTE, ...palette }, line = `4px solid ${p.outline}`;
  const white = { backgroundColor: '#FFFFFF', border: `3px solid ${p.outline}`, borderRadius: '50%' } as const;
  return (
    <div className={`${id}-root`} style={box(left, groundY - G.h, G.w, G.h, { transformOrigin: '50% 100%' })}>
      <div className={`${id}-flip`} style={box(0, 0, G.w, G.h, { transform: facing === 'left' ? 'scaleX(-1)' : undefined })}>
        {shadow && <div className={`${id}-shadow`} style={box(40, G.h - 14, 280, 26, { backgroundColor: 'rgba(0,0,0,0.38)', borderRadius: '50%', filter: 'blur(6px)' })} />}
        <div className={`${id}-hips`} style={box(0, 0, G.w, G.h, { transformOrigin: `${G.hipX}px ${G.hipY}px` })}>
          <Leg id={id} side="r" p={p} />
          <Leg id={id} side="l" p={p} />
          <div className={`${id}-torso`} style={box(TORSO.x, TORSO.y, TORSO.w, TORSO.h, { transformOrigin: `${TORSO.w / 2}px ${G.hipY - TORSO.y}px` })}>
            <Arm id={id} side="r" p={p} />
            <div style={box(0, 0, TORSO.w, 200, { backgroundColor: p.shirt, border: line, borderRadius: '46px 46px 22px 22px' })} />
            <div style={box(0, 188, TORSO.w, 42, { backgroundColor: p.pants, border: line, borderRadius: '10px 10px 24px 24px' })} />
            <div style={box(TORSO.w / 2 - 15, -12, 30, 36, { backgroundColor: far(p.skin), border: line, borderRadius: 12 })} />
            <div className={`${id}-head`} style={box(TORSO.w / 2 - HEAD.r, HEAD.cy - HEAD.r - TORSO.y, HEAD.r * 2, HEAD.r * 2, { transformOrigin: `${HEAD.r}px ${HEAD.r * 2 + 4}px` })}>
              <div style={box(0, 0, HEAD.r * 2, HEAD.r * 2, { backgroundColor: p.skin, border: line, borderRadius: '50%' })} />
              <div style={box(HEAD.r * 2 - 8, 62, 18, 20, { backgroundColor: p.skin, border: line, borderRadius: '50%' })} />
              <div style={box(28, 56, 26, 28, { backgroundColor: far(p.skin), border: line, borderRadius: '50%' })} />
              <div style={box(-4, -8, 104, 66, { backgroundColor: p.hair, border: line, borderRadius: '60px 52px 14px 52px' })} />
              <div className={`${id}-eyes`} style={box(62, 52, 54, 30, { transformOrigin: '50% 50%' })}>
                <div style={box(0, 0, 22, 30, white)} />
                <div style={box(32, 0, 22, 30, white)} />
                <div className={`${id}-pupils`} style={box(0, 0, 54, 30)}>
                  <div style={box(8, 9, 12, 12, { backgroundColor: p.outline, borderRadius: '50%' })} />
                  <div style={box(40, 9, 12, 12, { backgroundColor: p.outline, borderRadius: '50%' })} />
                </div>
              </div>
              <div className={`${id}-brows`} style={box(58, 36, 60, 8)}>
                <div style={box(0, 0, 24, 8, { backgroundColor: p.hair, borderRadius: 4 })} />
                <div style={box(32, 0, 24, 8, { backgroundColor: p.hair, borderRadius: 4 })} />
              </div>
              <div style={box(76, 100, 26, 10, { borderBottom: `5px solid ${p.outline}`, borderRadius: '0 0 16px 16px' })} />
            </div>
            <Arm id={id} side="l" p={p} />
          </div>
        </div>
      </div>
    </div>
  );
};
