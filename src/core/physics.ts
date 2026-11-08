/**
 * Deterministic classic-animation helpers (squash & stretch, anticipation, follow-through,
 * arcs, walk cycles). Same contract as presets.ts: only transform/opacity tweens, options are
 * named enums or small clamped numbers, no randomness, every tween is tagged
 * `data.preset = 'physics:<name>'` so timeline-audit counts them as presets.
 *
 * Conventions: `at` is seconds; x/y moves are RELATIVE to the current position; the rest pose has
 * scale 1 and rotate 0; `bounce` expects the rest position (y = 0) to be the ground.
 * Every helper has a `*Seconds(opts)` twin so a scene can schedule the next thing exactly.
 */
import type { PresetTarget } from './presets.ts';

type Timeline = gsap.core.Timeline;
type Vars = gsap.TweenVars;
const FPS = 60;
const F = 1 / FPS;

/* ------------------------------ helpers ------------------------------ */
const num = (v: unknown, min: number, max: number, fallback: number): number =>
  typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
const pick = <K extends string, V>(map: Record<K, V>, key: unknown, fallback: K): V =>
  typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key) ? map[key as K] : map[fallback];
/** GSAP relative-value string for a signed delta. */
const rel = (v: number): string => `${v < 0 ? '-=' : '+='}${Math.abs(+v.toFixed(3))}`;

function tagged(tl: Timeline, id: string, build: () => void): Timeline {
  const before = new Set(tl.getChildren(false));
  build();
  for (const child of tl.getChildren(false)) {
    if (!before.has(child)) child.data = { ...(child.data ?? {}), preset: id };
  }
  return tl;
}

type Dir = 'up' | 'down' | 'left' | 'right';
type Level = 'soft' | 'normal' | 'strong';
const DIRS = {
  up: { axis: 'y', along: 'scaleY', perp: 'scaleX', s: -1, origin: '50% 100%' },
  down: { axis: 'y', along: 'scaleY', perp: 'scaleX', s: 1, origin: '50% 0%' },
  left: { axis: 'x', along: 'scaleX', perp: 'scaleY', s: -1, origin: '100% 50%' },
  right: { axis: 'x', along: 'scaleX', perp: 'scaleY', s: 1, origin: '0% 50%' },
} as const;

/* ------------------------------ bounce ------------------------------ */
export interface BounceOpts {
  /** Drop height in px, 40..600 (default 300). */
  height?: number;
  /** Rebounds after the first landing, 1..6 (default 3). */
  bounces?: number;
  /** Height multiplier per bounce, 0.3..0.9 (default 0.6). Duration scales by sqrt of it. */
  restitution?: number;
  squash?: 'none' | 'soft' | 'normal' | 'strong';
  /** Constant sideways travel over the whole bounce, px, -1400..1400 (default 0). */
  travel?: number;
}
const BOUNCE_REF_H = 300; // px
const BOUNCE_REF_FALL = 0.5; // s to fall 300 px (30 f); t = ref * sqrt(h / 300), i.e. free fall
const SQUASH_AMOUNT = { none: 0, soft: 0.12, normal: 0.22, strong: 0.26 } as const;
const STRETCH_RATIO = 0.4; // stretch before impact = 0.4 x squash
const CONTACT_S = 0.05; // 3 f squash hold on contact
const RECOVER_S = 0.15; // 9 f return to round

export function bounceModel(opts?: BounceOpts) {
  const h = num(opts?.height, 40, 600, 300);
  const bounces = Math.round(num(opts?.bounces, 1, 6, 3));
  const r = num(opts?.restitution, 0.3, 0.9, 0.6);
  const fall = BOUNCE_REF_FALL * Math.sqrt(h / BOUNCE_REF_H);
  const squash = pick(SQUASH_AMOUNT, opts?.squash, 'normal');
  const hold = squash > 0 ? CONTACT_S : 0; // the ball stays on the ground while it squashes
  const apexes = [h];
  const legs = [fall]; // leg i: duration of the fall INTO contact i
  const contacts = [fall]; // absolute time (from `at`) of contact i
  const impact = [1]; // impact speed as a fraction of the first impact
  for (let n = 1; n <= bounces; n++) {
    const hn = h * r ** n;
    const tn = fall * Math.sqrt(r ** n);
    apexes.push(hn);
    legs.push(tn);
    contacts.push(contacts[n - 1] + hold + 2 * tn);
    impact.push(Math.sqrt(hn / h));
  }
  return { h, bounces, r, fall, apexes, legs, contacts, impact, squash, hold };
}
export const bounceSeconds = (o?: BounceOpts): number => {
  const m = bounceModel(o);
  return m.contacts[m.bounces] + (m.squash > 0 ? CONTACT_S + RECOVER_S : 0);
};

/** Ball centre offset (x, y) at t seconds after `at`: the exact path of bounce(), for spacing dots. y is 0 on the ground. */
export function bouncePoint(t: number, opts?: BounceOpts): { x: number; y: number } {
  const m = bounceModel(opts);
  const total = m.contacts[m.bounces];
  const x = (num(opts?.travel, -1400, 1400, 0) * Math.min(Math.max(t, 0), total)) / total;
  if (t <= 0) return { x, y: -m.h };
  if (t < m.fall) return { x, y: -m.h * (1 - (t / m.fall) ** 2) };
  for (let n = 1; n <= m.bounces; n++) {
    const t0 = m.contacts[n - 1] + m.hold;
    const leg = m.legs[n];
    if (t < t0) return { x, y: 0 };
    if (t < t0 + leg) return { x, y: -m.apexes[n] * (1 - (1 - (t - t0) / leg) ** 2) };
    if (t < t0 + 2 * leg) return { x, y: -m.apexes[n] * (1 - ((t - t0 - leg) / leg) ** 2) };
  }
  return { x, y: 0 };
}

/**
 * Ball drops from `height` above rest, rebounds with decaying height; squashes on contact, stretches on fast falls.
 * The ball waits at its apex from t = 0 (set), then three tweens run: y keyframes, scale keyframes, optional x travel.
 */
export function bounce(tl: Timeline, target: PresetTarget, at: number, opts?: BounceOpts): Timeline {
  const t = target as string;
  const m = bounceModel(opts);
  return tagged(tl, 'physics:bounce', () => {
    tl.set(t, { y: -m.h }, 0);
    const y: Vars[] = [{ y: 0, duration: m.fall, ease: 'power1.in' }];
    for (let n = 1; n <= m.bounces; n++) {
      if (m.hold > 0) y.push({ y: 0, duration: m.hold, ease: 'none' }); // contact: grounded for 3 f
      y.push({ y: -m.apexes[n], duration: m.legs[n], ease: 'power1.out' }, { y: 0, duration: m.legs[n], ease: 'power1.in' });
    }
    tl.to(t, { keyframes: y } as Vars, at);
    const travel = num(opts?.travel, -1400, 1400, 0);
    if (travel !== 0) tl.to(t, { x: rel(travel), duration: m.contacts[m.bounces], ease: 'none' } as Vars, at);
    if (m.squash === 0) return;
    const s: Vars[] = [];
    let cursor = 0; // time already covered by the scale keyframes
    const push = (v: Vars, duration: number, ease: string) => { s.push({ ...v, duration, ease }); cursor += duration; };
    for (let i = 0; i <= m.bounces; i++) {
      const a = m.squash * m.impact[i];
      const sy = 1 - a;
      const st = 1 + STRETCH_RATIO * a;
      const leg = m.legs[i];
      const sd = Math.min(0.4 * leg, leg - (i > 0 ? Math.min(RECOVER_S, 0.45 * leg) : 0));
      const wait = m.contacts[i] - sd - cursor;
      if (wait > 1e-9) push({ scaleX: 1, scaleY: 1 }, wait, 'none'); // round while rising / hovering
      push({ scaleY: st, scaleX: 1 / st }, sd, 'power2.in'); // stretch while accelerating
      push({ scaleY: sy, scaleX: 1 / sy }, CONTACT_S, 'power2.out'); // squash on contact
      push({ scaleY: 1, scaleX: 1 }, i < m.bounces ? Math.min(RECOVER_S, 0.45 * m.legs[i + 1]) : RECOVER_S, 'power2.out'); // recover to round
    }
    tl.to(t, { transformOrigin: '50% 100%', keyframes: s } as Vars, at); // origin set here: enter:pop would otherwise reset it
  });
}

/* --------------------- anticipate / launch (wind-up, action, settle) --------------------- */
export interface AnticipateOpts {
  /** Direction of the UPCOMING action; the wind-up goes the opposite way. */
  direction?: Dir;
  amount?: Level;
  /** Duration of the action in s, 0.15..0.6 (default 0.27). Wind-up = one third of it. */
  actionSeconds?: number;
}
const WIND = { soft: { px: 10, sq: 0.08, ov: 0.05 }, normal: { px: 20, sq: 0.14, ov: 0.08 }, strong: { px: 36, sq: 0.22, ov: 0.12 } } as const;
const windup = (o?: AnticipateOpts) => {
  const action = num(o?.actionSeconds, 0.15, 0.6, 0.27);
  return { d: pick(DIRS, o?.direction, 'up'), a: pick(WIND, o?.amount, 'normal'), action, dw: action / 3 };
};
export const anticipationSeconds = (o?: AnticipateOpts): number => windup(o).dw;

function windupTween(tl: Timeline, t: string, at: number, w: ReturnType<typeof windup>) {
  const crouch = 1 - w.a.sq;
  tl.to(t, { [w.d.axis]: rel(-w.d.s * w.a.px), [w.d.along]: crouch, [w.d.perp]: 1 / crouch, transformOrigin: w.d.origin, duration: w.dw, ease: 'power2.out' } as Vars, at);
}
/** Wind-up opposite to the action: a short crouch (squash along the action axis, volume kept). Ends at `at + anticipationSeconds`. */
export function anticipate(tl: Timeline, target: PresetTarget, at: number, opts?: AnticipateOpts): Timeline {
  const w = windup(opts);
  return tagged(tl, 'physics:anticipate', () => windupTween(tl, target as string, at, w));
}

export interface LaunchOpts extends AnticipateOpts {
  distance?: 'short' | 'mid' | 'far';
}
const LAUNCH = { short: { px: 120, action: 0.22 }, mid: { px: 220, action: 0.27 }, far: { px: 340, action: 0.36 } } as const;
const SETTLE_RATIO = 1.5; // settle = 1.5 x action (measured 1.3-1.7)
const launchModel = (o?: LaunchOpts) => {
  const l = pick(LAUNCH, o?.distance, 'mid');
  const w = windup({ ...o, actionSeconds: l.action });
  return { ...w, dist: l.px, da: l.action, ds: l.action * SETTLE_RATIO };
};
export const launchSeconds = (o?: LaunchOpts): number => {
  const m = launchModel(o);
  return m.dw + m.da + m.ds;
};

/** Wind-up -> fast action with stretch -> overshoot -> settle. Moves the target `distance` px in `direction`. */
export function launch(tl: Timeline, target: PresetTarget, at: number, opts?: LaunchOpts): Timeline {
  const t = target as string;
  const m = launchModel(opts);
  const { d, a } = m;
  return tagged(tl, 'physics:launch', () => {
    windupTween(tl, t, at, m);
    const stretch = 1 + a.sq;
    const over = m.dist * a.ov;
    const t1 = at + m.dw;
    tl.to(t, { [d.axis]: rel(d.s * (m.dist + over + a.px)), [d.along]: stretch, [d.perp]: 1 / stretch, duration: m.da, ease: 'power1.out' } as Vars, t1);
    const t2 = t1 + m.da;
    tl.to(t, { [d.axis]: rel(-d.s * over), duration: m.ds, ease: 'sine.inOut' } as Vars, t2);
    const land = 1 - a.sq * 0.5;
    tl.to(t, { [d.along]: land, [d.perp]: 1 / land, duration: m.ds * 0.3, ease: 'power2.out' } as Vars, t2);
    tl.to(t, { [d.along]: 1, [d.perp]: 1, duration: m.ds * 0.7, ease: 'sine.inOut' } as Vars, t2 + m.ds * 0.3);
  });
}

/* ------------------------- overlap: pendulum / followThrough ------------------------- */
const LAG_F = { tight: 2, normal: 3, loose: 4 } as const; // frames of delay per joint
export interface PendulumOpts {
  swing?: Level; // first swing 8 / 16 / 28 deg at the root joint
  drag?: keyof typeof LAG_F;
  /** Number of swings before rest, 1..5 (default 3). */
  swings?: number;
  direction?: 'left' | 'right';
  pivot?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
const SWING_DEG = { soft: 8, normal: 16, strong: 28 } as const;
const PIVOT = { top: '50% 0%', bottom: '50% 100%', left: '0% 50%', right: '100% 50%', center: '50% 50%' } as const;
const HALF_SWING = 0.18; // s (11 f) per half period
const FIRST_SWING = 0.7 * HALF_SWING; // s (7.5 f) driven onset
const SWING_DECAY = 0.55; // each swing keeps 55% of the previous amplitude
const TIP_GAIN = 0.2; // each joint further from the root swings 20% wider
export const pendulumSeconds = (n: number, o?: PendulumOpts): number =>
  (Math.max(1, n) - 1) * pick(LAG_F, o?.drag, 'normal') * F + FIRST_SWING + (Math.round(num(o?.swings, 1, 5, 3)) - 1) * HALF_SWING + HALF_SWING;

/** A chain of joints (root first) swings and settles; each joint starts 2-4 f after its parent and swings wider (whip). */
export function pendulum(tl: Timeline, joints: PresetTarget[], at: number, opts?: PendulumOpts): Timeline {
  const swings = Math.round(num(opts?.swings, 1, 5, 3));
  const deg = pick(SWING_DEG, opts?.swing, 'normal');
  const lag = pick(LAG_F, opts?.drag, 'normal') * F;
  const side = opts?.direction === 'left' ? -1 : 1;
  const origin = pick(PIVOT, opts?.pivot, 'top');
  return tagged(tl, 'physics:pendulum', () => {
    joints.forEach((joint, j) => {
      const amp = deg * (1 + TIP_GAIN * j) * side;
      const keyframes: Vars[] = [{ rotate: amp, duration: FIRST_SWING, ease: 'power2.out' }];
      for (let k = 1; k < swings; k++) keyframes.push({ rotate: amp * (-SWING_DECAY) ** k, duration: HALF_SWING, ease: 'sine.inOut' });
      keyframes.push({ rotate: 0, duration: HALF_SWING, ease: 'sine.inOut' });
      tl.to(joint as string, { transformOrigin: origin, keyframes } as Vars, at + j * lag);
    });
  });
}

export interface FollowOpts {
  direction?: Dir;
  /** Parent travel in px, 20..600 (default 200). */
  distance?: number;
  drag?: keyof typeof LAG_F;
  /** Extra overshoot per child index: 4% / 8% / 14% of the travel. */
  amount?: Level;
}
const FOLLOW_MOVE = 0.3; // s (18 f)
const FOLLOW_OVERSHOOT = { soft: 0.04, normal: 0.08, strong: 0.14 } as const;
export const followSeconds = (n: number, o?: FollowOpts): number =>
  (Math.max(1, n) - 1) * pick(LAG_F, o?.drag, 'normal') * F + FOLLOW_MOVE + (n > 1 ? FOLLOW_MOVE * SETTLE_RATIO : 0);

/** Parent (index 0) moves and stops dead; each following element starts 2-4 f later, overshoots a bit more, then settles. */
export function followThrough(tl: Timeline, targets: PresetTarget[], at: number, opts?: FollowOpts): Timeline {
  const d = pick(DIRS, opts?.direction, 'right');
  const dist = num(opts?.distance, 20, 600, 200);
  const lag = pick(LAG_F, opts?.drag, 'normal') * F;
  const ov = pick(FOLLOW_OVERSHOOT, opts?.amount, 'normal');
  return tagged(tl, 'physics:followThrough', () => {
    targets.forEach((el, i) => {
      const t0 = at + i * lag;
      const extra = dist * ov * i;
      tl.to(el as string, { [d.axis]: rel(d.s * (dist + extra)), duration: FOLLOW_MOVE, ease: 'power1.out' } as Vars, t0);
      if (i > 0) tl.to(el as string, { [d.axis]: rel(-d.s * extra), duration: FOLLOW_MOVE * SETTLE_RATIO, ease: 'sine.inOut' } as Vars, t0 + FOLLOW_MOVE);
    });
  });
}

/* ------------------------------ arcMove ------------------------------ */
export interface ArcOpts {
  dx?: number; // px, -1200..1200
  dy?: number;
  arc?: 'low' | 'mid' | 'high'; // apex offset = 12% / 25% / 40% of the straight distance
  bulge?: 'up' | 'down';
  pace?: 'quick' | 'normal' | 'slow'; // 0.3 / 0.5 / 0.8 s
}
const ARC_BULGE = { low: 0.12, mid: 0.25, high: 0.4 } as const;
const ARC_PACE = { quick: 0.3, normal: 0.5, slow: 0.8 } as const;
export const arcSeconds = (o?: ArcOpts): number => pick(ARC_PACE, o?.pace, 'normal');

const sineInOut = (p: number): number => -(Math.cos(Math.PI * p) - 1) / 2;
const arcGeometry = (o?: ArcOpts) => {
  const dx = num(o?.dx, -1200, 1200, 300);
  const dy = num(o?.dy, -1200, 1200, 0);
  const bulge = pick(ARC_BULGE, o?.arc, 'mid') * Math.hypot(dx, dy) * (o?.bulge === 'down' ? 1 : -1);
  return { dx, dy, bulge }; // bulge = signed y offset of the apex from the straight line (reached at the middle)
};
/**
 * Offset (x, y) from the start at progress p (0..1) of arcMove, the same formula the tweens use (spacing charts).
 * u = sine.inOut(p) is the position along the move; the path is a parabola: x = dx u, y = dy u + 4 bulge u (1 - u).
 */
export function arcPoint(p: number, opts?: ArcOpts): { x: number; y: number } {
  const { dx, dy, bulge } = arcGeometry(opts);
  const u = sineInOut(Math.min(1, Math.max(0, p)));
  return { x: dx * u, y: dy * u + 4 * bulge * u * (1 - u) };
}

/**
 * A -> B along a parabolic arc with slow-in / slow-out along the path: x eases on sine.inOut and y follows the
 * same eased progress u (custom ease below), so the frame-to-frame spacing is tight at both ends and widest mid-arc.
 */
export function arcMove(tl: Timeline, target: PresetTarget, at: number, opts?: ArcOpts): Timeline {
  const t = target as string;
  const { dx, dy, bulge } = arcGeometry(opts);
  const T = arcSeconds(opts);
  const D = Math.abs(dy) >= 1 ? dy : 1; // tween end value; the ease below rescales so that y(1) = dy exactly
  const yEase = (p: number): number => { const u = sineInOut(p); return (dy * u + 4 * bulge * u * (1 - u)) / D; };
  return tagged(tl, 'physics:arcMove', () => {
    tl.to(t, { x: rel(dx), duration: T, ease: 'sine.inOut' }, at);
    tl.to(t, { y: rel(D), duration: T, ease: yEase } as Vars, at);
  });
}

/* ------------------------------ movingHold ------------------------------ */
export interface HoldOpts {
  /** 0.3..1.5 s (default 0.5; measured holds are 0.3-0.7 s). */
  seconds?: number;
  intensity?: Level;
}
const HOLD_DRIFT = { soft: { y: -2, s: 1.008 }, normal: { y: -4, s: 1.015 }, strong: { y: -7, s: 1.025 } } as const;
export const holdSeconds = (o?: HoldOpts): number => num(o?.seconds, 0.3, 1.5, 0.5);

/** A pose that never freezes: tiny drift + scale creep (relative y, absolute scale) for the whole hold. Not for the final hold (T003). */
export function movingHold(tl: Timeline, target: PresetTarget, at: number, opts?: HoldOpts): Timeline {
  const h = pick(HOLD_DRIFT, opts?.intensity, 'normal');
  return tagged(tl, 'physics:movingHold', () => {
    tl.to(target as string, { y: rel(h.y), scale: h.s, duration: holdSeconds(opts), ease: 'sine.inOut' }, at);
  });
}

/* ------------------------------ walkCycle ------------------------------ */
export interface WalkRig {
  /** Optional: receives the forward travel (x). Omit to walk on the spot. */
  root?: PresetTarget;
  body: PresetTarget;
  head?: PresetTarget;
  legL: PresetTarget;
  legR: PresetTarget;
  armL?: PresetTarget;
  armR?: PresetTarget;
}
export interface WalkOpts {
  pace?: 'walk' | 'run';
  /** Steps (not cycles), 1..8 (default 4). Two steps = one 60 f walk cycle. */
  steps?: number;
  direction?: 'left' | 'right';
  /** px travelled per step, 40..400 (default 150 walk / 260 run). */
  stride?: number;
}
/** Per pace: step seconds (30 f / 20 f), body bob px, leg swing deg, foot lift px, arm swing deg, lean deg, default stride px. */
const PACE = {
  walk: { step: 0.5, bob: 18, leg: 24, lift: 14, arm: 18, lean: 2, stride: 150 },
  run: { step: 1 / 3, bob: 30, leg: 38, lift: 26, arm: 40, lean: 8, stride: 260 },
} as const;
/** Poses in a step: q0 contact, q1 down, q2 passing, q3 up. Fractions of bob / swing. */
const BODY_Y = [0, 0.45, -0.33, -1] as const; // + is down; lowest at "down", highest at "up"
const BODY_SY = [1, 0.94, 1.02, 1.05] as const; // squash on down, stretch on up; scaleX = 1/scaleY
const LEAD_LEG = [1, 0.6, 0, -0.6, -1] as const; // support leg: forward at contact -> back at next contact
const TRAIL_LEG = [-1, -0.9, 0, 0.7, 1] as const; // swing leg: back -> passes under the body -> forward
const TRAIL_LIFT = [0, 0.3, 1, 0.6, 0] as const; // swing foot lifted most at passing
const ARM_LAG_F = 2;
const HEAD_LAG_F = 3;
const walkModel = (o?: WalkOpts) => {
  const p = pick(PACE, o?.pace, 'walk');
  const steps = Math.round(num(o?.steps, 1, 8, 4));
  return { p, steps, q: p.step / 4, stride: num(o?.stride, 40, 400, p.stride), dir: o?.direction === 'left' ? -1 : 1 };
};
export const walkSeconds = (o?: WalkOpts): number => {
  const m = walkModel(o);
  return (4 * m.steps + 1) * m.q + m.p.step / 2 + HEAD_LAG_F * F;
};

/** Walk/run on a flat-shape rig: 4 poses per step (contact, down, passing, up), arms 2 f and head 3 f behind the legs, then a stop. */
export function walkCycle(tl: Timeline, rig: WalkRig, at: number, opts?: WalkOpts): Timeline {
  const { p, steps, q, stride, dir } = walkModel(opts);
  const n = 4 * steps; // keyframes 0..n, the last one is the closing contact
  const frames = (make: (k: number, ph: number) => Vars): Vars[] => {
    const out: Vars[] = [];
    for (let i = 0; i <= n; i++) out.push({ ...make(Math.floor(i / 4), i % 4), duration: q, ease: 'sine.inOut' });
    out.push({ ...make(steps, 0), duration: p.step / 2, ease: 'power1.out', neutral: true });
    return out;
  };
  const neutral = { rotate: 0, y: 0, scaleX: 1, scaleY: 1 };
  const strip = (v: Vars): Vars => { const { neutral: isNeutral, ...rest } = v as Vars & { neutral?: boolean }; return isNeutral ? { ...rest, ...neutral } : rest; };
  const run = (target: PresetTarget | undefined, delay: number, list: Vars[]) =>
    target !== undefined && tl.to(target as string, { keyframes: list.map(strip) } as Vars, at + delay);
  const leg = (isLeft: boolean) => frames((k, ph) => {
    const lead = (k + (isLeft ? 0 : 1)) % 2 === 0;
    const f = lead ? LEAD_LEG[ph] : TRAIL_LEG[ph];
    return { rotate: -dir * p.leg * f, y: lead ? 0 : -p.lift * TRAIL_LIFT[ph] };
  });
  const arm = (isLeft: boolean) => frames((k, ph) => {
    const lead = (k + (isLeft ? 0 : 1)) % 2 === 0; // same-side leg role; the arm swings the other way
    return { rotate: dir * p.arm * (lead ? LEAD_LEG[ph] : TRAIL_LEG[ph]) };
  });
  const body = frames((_k, ph) => ({ y: p.bob * BODY_Y[ph], scaleY: BODY_SY[ph], scaleX: 1 / BODY_SY[ph], rotate: dir * p.lean }));
  const head = frames((_k, ph) => ({ y: p.bob * BODY_Y[ph] * 0.5, rotate: -dir * p.lean * 0.5 }));
  tagged(tl, 'physics:walkCycle', () => {
    run(rig.body, 0, body);
    run(rig.legL, 0, leg(true));
    run(rig.legR, 0, leg(false));
    run(rig.armL, ARM_LAG_F * F, arm(true));
    run(rig.armR, ARM_LAG_F * F, arm(false));
    run(rig.head, HEAD_LAG_F * F, head);
    if (rig.root !== undefined) {
      const v = (dir * stride) / p.step; // px per second at cruise
      tl.to(rig.root as string, {
        keyframes: [
          { x: rel((v * q) / 2), duration: q, ease: 'power1.in' },
          { x: rel(v * steps * p.step), duration: steps * p.step, ease: 'none' },
          { x: rel((v * p.step) / 4), duration: p.step / 2, ease: 'power1.out' },
        ],
      } as Vars, at);
    }
  });
  return tl;
}

/* ------------------------------ character rig ------------------------------ */
/** Geometry of `<RigCharacter>` in px (rig box 360 x 680, ground = bottom edge). Angles are CSS degrees, clockwise positive, character facing RIGHT. */
export const RIG_GEOM = {
  w: 360, h: 680, hipX: 180, hipY: 358, legOff: 10, thigh: 150, shin: 150, ankle: 22, footBack: 16, footFront: 62,
} as const;
const D2R = Math.PI / 180;
export interface RigParts {
  root: PresetTarget; flip: PresetTarget; hips: PresetTarget; torso: PresetTarget; head: PresetTarget; brows: PresetTarget;
  eyes: PresetTarget; pupils: PresetTarget; armL: PresetTarget; armR: PresetTarget; forearmL: PresetTarget; forearmR: PresetTarget;
  thighL: PresetTarget; thighR: PresetTarget; shinL: PresetTarget; shinR: PresetTarget; footL: PresetTarget; footR: PresetTarget;
}
const RIG_PART_NAMES: Record<keyof RigParts, string> = {
  root: 'root', flip: 'flip', hips: 'hips', torso: 'torso', head: 'head', brows: 'brows', eyes: 'eyes', pupils: 'pupils',
  armL: 'arm-l', armR: 'arm-r', forearmL: 'forearm-l', forearmR: 'forearm-r', thighL: 'thigh-l', thighR: 'thigh-r',
  shinL: 'shin-l', shinR: 'shin-r', footL: 'foot-l', footR: 'foot-r',
};
/** Selectors of one rig: `rigParts('hero').armL === '.hero-arm-l'`. L = near side (in front), R = far side. */
export const rigParts = (id: string): RigParts =>
  Object.fromEntries(Object.entries(RIG_PART_NAMES).map(([k, v]) => [k, `.${id}-${v}`])) as unknown as RigParts;
type PartsArg = RigParts | string;
const partsOf = (p: PartsArg): RigParts => (typeof p === 'string' ? rigParts(p) : p);
const smooth = (u: number): number => { const c = Math.min(1, Math.max(0, u)); return c * c * (3 - 2 * c); };
const clamp = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));
const r3 = (v: number): number => +v.toFixed(3);

/** Two-bone leg IK. dx = ankle forward of the hip (px), gap = hip to ankle, downwards (px). Knee bends forward. Returns CSS degrees (shin is relative to the thigh). */
export function rigLegIK(dx: number, gap: number): { thigh: number; shin: number } {
  const L1 = RIG_GEOM.thigh, L2 = RIG_GEOM.shin;
  const D = clamp(Math.hypot(dx, gap), 1, L1 + L2);
  const alpha = Math.acos(clamp((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D), -1, 1));
  const knee = Math.acos(clamp((L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2), -1, 1));
  return { thigh: (Math.atan2(-dx, gap) - alpha) / D2R, shin: (Math.PI - knee) / D2R };
}
/** Ankle x and lift for a foot whose flat-foot ankle is at `spot`, pitched p degrees (toe pivot for p >= 0, heel pivot for p < 0): the sole contact point stays put. */
function footAnkle(spot: number, p: number): { x: number; lift: number } {
  const { ankle: A, footBack: B, footFront: T } = RIG_GEOM;
  const c = Math.cos(p * D2R), s = Math.sin(p * D2R);
  if (p >= 0) return { x: spot + T - (T * c - A * s), lift: T * s + A * c - A };
  return { x: spot - B - (-B * c - A * s), lift: -B * s + A * c - A };
}

/* ------------------------------ rigWalk ------------------------------ */
export interface RigWalkOpts {
  pace?: 'stroll' | 'walk' | 'brisk';
  /** Walking steps before the stopping step, 1..6 (default 3). */
  steps?: number;
  /** Cruise px per step, 120..210 (default 180). */
  stride?: number;
  /** Travel direction of the root. The rig itself must be built with the same `facing`. */
  direction?: 'left' | 'right';
}
const RW_PACE = { stroll: 0.6, walk: 0.5, brisk: 0.4 } as const;
const RW_ARCH = 36; // px swing foot clearance
const RW_SETTLE = 0.4; // s weight settle after the closing foot lands
const RW_LEAD = 0.15; // s weight shift (hips dip) before the first foot leaves the ground
const rwModel = (o?: RigWalkOpts) => {
  const S = pick(RW_PACE, o?.pace, 'walk');
  const n = Math.round(num(o?.steps, 1, 6, 3));
  const stride = num(o?.stride, 120, 210, 180);
  const vmax = stride / S;
  const tc = (k: number): number => (k + 1.4) * S; // stance centre of step k
  const tStop = (n + 0.4) * S; // hip stops over the last planted foot
  const tu = Math.min(1.4 * S, tStop / 2);
  const total = (n + 0.8) * S + RW_SETTLE + RW_LEAD;
  const v = (t: number): number => (t <= 0 || t >= tStop ? 0 : vmax * Math.min(smooth(t / tu), smooth((tStop - t) / tu)));
  const DT = 1 / 600, N = Math.ceil((total + 0.1) / DT) + 1;
  const cum = new Float64Array(N);
  for (let i = 1; i < N; i++) cum[i] = cum[i - 1] + ((v((i - 1) * DT) + v(i * DT)) / 2) * DT;
  const H = (t: number): number => { const x = clamp(t / DT, 0, N - 1), i = Math.min(N - 2, Math.floor(x)); return cum[i] + (cum[i + 1] - cum[i]) * (x - i); };
  const off = [RIG_GEOM.legOff, -RIG_GEOM.legOff];
  const pitch = (s: number): number => (s < 0.2 ? -14 * (1 - smooth(s / 0.2)) : s < 0.55 ? 0 : 30 * smooth((s - 0.55) / 0.45));
  const spot = (k: number): number => (k >= n ? H(tStop) : H(tc(k))) + off[k % 2];
  const stance = (k: number, s: number) => { const p = pitch(s); return { ...footAnkle(spot(k), p), p }; };
  /** Ankle x (walk frame), lift and world pitch of foot f (0 = near/L, 1 = far/R) at time t. */
  const foot = (f: number, t: number) => {
    for (let k = f; k <= n; k += 2) {
      const sw0 = tc(k) - 1.4 * S, sw1 = tc(k) - 0.6 * S;
      const A = k === f ? { x: off[f], lift: 0, p: 0 } : stance(k - 2, 1);
      if (t < sw0) return A;
      if (t < sw1) {
        const u = (t - sw0) / (sw1 - sw0), e = smooth(u), B = stance(k, 0);
        return { x: A.x + (B.x - A.x) * e, lift: A.lift + (B.lift - A.lift) * e + RW_ARCH * Math.sin(Math.PI * u) ** 2, p: A.p + (B.p - A.p) * e };
      }
      const end = k + 2 <= n ? tc(k + 2) - 1.4 * S : Infinity;
      if (t < end) return stance(k, Math.min((t - sw1) / (1.2 * S), end === Infinity ? 0.5 : 1));
    }
    return stance(n - ((n - f) % 2), 0.5);
  };
  return { S, n, stride, vmax, total, v, H, foot, off, tStop };
};
export const rigWalkSeconds = (o?: RigWalkOpts): number => rwModel(o).total;

type RwModel = ReturnType<typeof rwModel>;
const rwSettle = (m: RwModel, t: number): number => { const u = (t - (m.n + 0.8) * m.S) / RW_SETTLE; return u > 0 && u < 1 ? Math.sin(Math.PI * u) ** 2 : 0; };
const rwTorso = (m: RwModel, t: number): number => 3 * (m.v(t) / m.vmax) + 3 * rwSettle(m, t);
function rwFrame(m: RwModel, tAbs: number) {
  const { S, stride, vmax, v, H, foot, off } = m;
  const t = tAbs - RW_LEAD; // gait time
  const sf = v(t) / vmax;
  const prep = 9 * (t < 0 ? smooth(tAbs / RW_LEAD) : 1 - smooth(t / 0.3));
  const drop = sf * (8 + 0.1 * stride + 8 * Math.cos(2 * Math.PI * (t / S - 0.8))) + 12 * rwSettle(m, t) + prep;
  const hip = H(t);
  const legs = [0, 1].map((f) => {
    const F = foot(f, t);
    const ik = rigLegIK(F.x - (hip + off[f]), RIG_GEOM.thigh + RIG_GEOM.shin - drop - F.lift);
    return { thigh: ik.thigh, shin: ik.shin, foot: F.p - ik.thigh - ik.shin };
  });
  const tl2 = Math.max(0, t - 2 / FPS);
  const arm = (f: number) => { // near arm (0) pairs with the far leg (1)
    const g = 1 - f, F = foot(g, tl2);
    const up = -30 * clamp((F.x - (H(tl2) + off[g])) / (0.7 * stride), -1, 1);
    return { up, fore: -(6 + 24 * clamp(-up / 30, 0, 1)) * (v(tl2) / vmax) };
  };
  return {
    rootX: hip, hipsY: drop, torso: rwTorso(m, t), head: -0.6 * rwTorso(m, Math.max(0, t - 3 / FPS)) * clamp((m.total - RW_LEAD - t) * FPS / 4, 0, 1),
    thighL: legs[0].thigh, shinL: legs[0].shin, footL: legs[0].foot, thighR: legs[1].thigh, shinR: legs[1].shin, footR: legs[1].foot,
    armL: arm(0).up, forearmL: arm(0).fore, armR: arm(1).up, forearmR: arm(1).fore,
  };
}
/** Part values of the walk at `t` seconds after `at` (rig frame, root travel as `rootX`). Used by tests. */
export const rigWalkFrame = (o: RigWalkOpts | undefined, t: number) => rwFrame(rwModel(o), t);
/** Walk on a `<RigCharacter>`: per-frame IK keyframes, planted feet never slide, hip bob, counter-swinging arms (2 f late), head 3 f late, stop with a weight settle. */
export function rigWalk(tl: Timeline, parts: PartsArg, at: number, opts?: RigWalkOpts): Timeline {
  const P = partsOf(parts), m = rwModel(opts), dir = opts?.direction === 'left' ? -1 : 1;
  const frames = Math.ceil(m.total * FPS);
  const rows = Array.from({ length: frames }, (_, i) => rwFrame(m, Math.min((i + 1) / FPS, m.total))); // keyframe i ends on frame i + 1
  type Row = (typeof rows)[number];
  const kf = (make: (r: Row) => Vars): Vars[] => rows.map((r) => ({ ...make(r), duration: F, ease: 'none' }));
  const run = (target: PresetTarget, list: Vars[]) => tl.to(target as string, { keyframes: list } as Vars, at);
  return tagged(tl, 'physics:rigWalk', () => {
    let prev = 0;
    run(P.root, kf((r) => { const d = dir * (r.rootX - prev); prev = r.rootX; return { x: rel(r3(d)) }; }));
    run(P.hips, kf((r) => ({ y: r3(r.hipsY) })));
    run(P.torso, kf((r) => ({ rotate: r3(r.torso) })));
    run(P.head, kf((r) => ({ rotate: r3(r.head) })));
    for (const s of ['L', 'R'] as const) {
      run(P[`thigh${s}`], kf((r) => ({ rotate: r3(r[`thigh${s}`]) })));
      run(P[`shin${s}`], kf((r) => ({ rotate: r3(r[`shin${s}`]) })));
      run(P[`foot${s}`], kf((r) => ({ rotate: r3(r[`foot${s}`]) })));
      run(P[`arm${s}`], kf((r) => ({ rotate: r3(r[`arm${s}`]) })));
      run(P[`forearm${s}`], kf((r) => ({ rotate: r3(r[`forearm${s}`]) })));
    }
  });
}

/* ------------------------------ idleBreath ------------------------------ */
export interface IdleOpts {
  /** 0.4..4 s, rounded to whole breaths of 1.6 s (default 1.6). */
  seconds?: number;
  intensity?: Level;
  /** Add one blink at 60% of the hold. */
  blink?: boolean;
}
const IDLE = { soft: 0.6, normal: 1, strong: 1.5 } as const;
const BREATH = 1.6; // s per breath
const breaths = (o?: IdleOpts): number => Math.max(1, Math.round(num(o?.seconds, 0.4, 4, BREATH) / BREATH));
export const idleBreathSeconds = (o?: IdleOpts): number => breaths(o) * BREATH;
/** A living pose: chest rises and falls (torso scaleY +1.6%), head 3 f and arms 4 f behind, optional blink. Use on a standing rig. */
export function idleBreath(tl: Timeline, parts: PartsArg, at: number, opts?: IdleOpts): Timeline {
  const P = partsOf(parts), k = pick(IDLE, opts?.intensity, 'normal'), n = breaths(opts), h = BREATH / 2;
  const cyc = (up: Vars, down: Vars): Vars[] => Array.from({ length: n * 2 }, (_, i) => ({ ...(i % 2 === 0 ? up : down), duration: h, ease: 'sine.inOut' }));
  return tagged(tl, 'physics:idleBreath', () => {
    tl.to(P.torso as string, { keyframes: cyc({ scaleY: r3(1 + 0.016 * k) }, { scaleY: 1 }) } as Vars, at);
    tl.to(P.head as string, { keyframes: cyc({ y: r3(-2 * k) }, { y: 0 }) } as Vars, at + 3 * F);
    for (const s of ['L', 'R'] as const) tl.to(P[`arm${s}`] as string, { keyframes: cyc({ rotate: rel(r3(1.2 * k)) }, { rotate: rel(r3(-1.2 * k)) }) } as Vars, at + 4 * F);
    if (opts?.blink) {
      const t = at + idleBreathSeconds(opts) * 0.6;
      tl.to(P.eyes as string, { keyframes: [{ scaleY: 0.1, duration: 0.05, ease: 'power2.in' }, { scaleY: 1, duration: 0.09, ease: 'power2.out' }] } as Vars, t);
    }
  });
}

/* ------------------------------ lookAt ------------------------------ */
export interface LookOpts {
  look?: 'rest' | 'front' | 'up' | 'down' | 'behind';
  amount?: 'subtle' | 'normal' | 'strong';
}
/** Per look: pupil x/y px, head deg, torso deg. */
const LOOKS = {
  rest: { px: 0, py: 0, head: 0, torso: 0 }, front: { px: 5, py: 0, head: 5, torso: 1 }, up: { px: 3, py: -5, head: -12, torso: -2 },
  down: { px: 3, py: 5, head: 14, torso: 3 }, behind: { px: -5, py: 0, head: -7, torso: -4 },
} as const;
const LOOK_AMOUNT = { subtle: 0.5, normal: 1, strong: 1.4 } as const;
export const lookAtSeconds = (_o?: LookOpts): number => 6 * F + 0.35;
/** Eyes first, head 3 f later, torso 6 f later (eyes/head lead the body). Absolute poses: `look: 'rest'` returns to neutral. */
export function lookAt(tl: Timeline, parts: PartsArg, at: number, opts?: LookOpts): Timeline {
  const P = partsOf(parts), L = pick(LOOKS, opts?.look, 'front'), k = pick(LOOK_AMOUNT, opts?.amount, 'normal');
  return tagged(tl, 'physics:lookAt', () => {
    tl.to(P.pupils as string, { x: r3(L.px * k), y: r3(L.py * k), duration: 0.12, ease: 'power2.out' }, at);
    tl.to(P.head as string, { rotate: r3(L.head * k), duration: 0.28, ease: 'power2.out' }, at + 3 * F);
    tl.to(P.torso as string, { rotate: r3(L.torso * k), duration: 0.35, ease: 'power2.out' }, at + 6 * F);
  });
}

/* ------------------------------ react ------------------------------ */
export interface ReactOpts {
  kind?: 'startle' | 'surprise';
  intensity?: Level;
  /** Return to the neutral standing pose at the end instead of holding the surprised pose. */
  recover?: boolean;
}
const REACT_K = { soft: 0.6, normal: 1, strong: 1.4 } as const;
const REACT_T = { anticipate: 0.14, action: 0.12, apex: 0.05, land: 0.1, settle: 0.4 } as const;
export const reactSeconds = (_o?: ReactOpts): number => REACT_T.anticipate + REACT_T.action + REACT_T.apex + REACT_T.land + REACT_T.settle;
/** Legs for a crouch of `d` px with both feet flat and planted under the hips. */
function crouch(d: number) {
  const ik = rigLegIK(0, RIG_GEOM.thigh + RIG_GEOM.shin - d);
  return { y: d, thigh: ik.thigh, shin: ik.shin, foot: -(ik.thigh + ik.shin) };
}
interface Upper { torso: number; head: number; arm: [number, number]; fore: [number, number]; brows: number; eyes: number; toe?: number }
/** Anticipation (crouch + lean in) -> surprise pose (hop, lean back, arms up, brows up, eyes wide) -> landing absorb -> settle. */
export function react(tl: Timeline, parts: PartsArg, at: number, opts?: ReactOpts): Timeline {
  const P = partsOf(parts), k = pick(REACT_K, opts?.intensity, 'normal'), hop = opts?.kind === 'surprise' ? 0 : 34 * k, T = REACT_T;
  const pose = (t: number, dur: number, ease: string, c: ReturnType<typeof crouch>, u: Upper) => {
    const to = (target: PresetTarget, vars: Vars) => tl.to(target as string, { ...vars, duration: dur, ease }, t);
    to(P.hips, { y: r3(c.y) });
    for (const s of ['L', 'R'] as const) {
      const i = s === 'L' ? 0 : 1;
      to(P[`thigh${s}`], { rotate: r3(c.thigh) });
      to(P[`shin${s}`], { rotate: r3(c.shin) });
      to(P[`foot${s}`], { rotate: r3(c.foot + (u.toe ?? 0)) });
      to(P[`arm${s}`], { rotate: r3(u.arm[i]) });
      to(P[`forearm${s}`], { rotate: r3(u.fore[i]) });
    }
    to(P.torso, { rotate: r3(u.torso) });
    to(P.head, { rotate: r3(u.head) });
    to(P.brows, { y: r3(u.brows) });
    to(P.eyes, { scaleY: r3(u.eyes), scaleX: r3(u.eyes) });
  };
  return tagged(tl, 'physics:react', () => {
    const t1 = at + T.anticipate, t2 = t1 + T.action, t3 = t2 + T.apex, t4 = t3 + T.land;
    pose(at, T.anticipate, 'power2.out', crouch(14 * k), { torso: 6 * k, head: 4 * k, arm: [12 * k, 8 * k], fore: [-4, -4], brows: 0, eyes: 1 });
    pose(t1, T.action, 'power3.out', crouch(0), { torso: -10 * k, head: -8 * k, arm: [-62 * k, -46 * k], fore: [-26 * k, -16 * k], brows: -12 * k, eyes: 1 + 0.14 * k, toe: hop > 0 ? 24 : 0 });
    if (hop > 0) tl.to(P.root as string, { y: rel(-hop), duration: T.action, ease: 'power3.out' }, t1);
    if (hop > 0) tl.to(P.root as string, { y: rel(hop), duration: T.land, ease: 'power2.in' }, t3);
    pose(t3, T.land, 'power2.in', crouch(hop > 0 ? 10 * k : 4 * k), { torso: -3 * k, head: -3 * k, arm: [-36 * k, -26 * k], fore: [-20 * k, -12 * k], brows: -12 * k, eyes: 1 + 0.14 * k });
    const held: Upper = { torso: -6 * k, head: -5 * k, arm: [-30 * k, -14 * k], fore: [-14 * k, -8 * k], brows: -10 * k, eyes: 1 + 0.08 * k };
    pose(t4, T.settle, 'power2.out', crouch(0), opts?.recover ? { torso: 0, head: 0, arm: [0, 0], fore: [0, 0], brows: 0, eyes: 1 } : held);
  });
}

/* ------------------------------ turn ------------------------------ */
export interface TurnOpts { to?: 'left' | 'right' }
export const turnSeconds = (_o?: TurnOpts): number => 4 * F + 0.32;
/** Eyes lead, then the whole figure flips about its centre (scaleX through 0, `sine.inOut`). Build the rig with the starting `facing`. */
export function turn(tl: Timeline, parts: PartsArg, at: number, opts?: TurnOpts): Timeline {
  const P = partsOf(parts), s = opts?.to === 'left' ? -1 : 1;
  return tagged(tl, 'physics:turn', () => {
    tl.to(P.pupils as string, { x: r3(-5 * s), duration: 0.08, ease: 'power2.out' }, at);
    tl.to(P.flip as string, { scaleX: s, duration: 0.32, ease: 'sine.inOut' }, at + 4 * F);
    tl.to(P.pupils as string, { x: 0, duration: 0.2, ease: 'power2.out' }, at + 4 * F + 0.32 * 0.6);
  });
}

/* ------------------------------ catalog ------------------------------ */
export const PHYSICS_CATALOG = {
  bounce: { description: 'Drop + decaying rebounds, parabolic arcs, squash on contact, stretch on fast falls.', seconds: bounceSeconds },
  anticipate: { description: 'Wind-up opposite to the action, one third of the action time.', seconds: anticipationSeconds },
  launch: { description: 'Wind-up, fast stretched action, overshoot, 1.5x settle.', seconds: launchSeconds },
  pendulum: { description: 'Chain of joints swings and settles, 2-4 f drag per joint, tip swings wider.', seconds: (o?: PendulumOpts & { joints?: number }) => pendulumSeconds(o?.joints ?? 1, o) },
  followThrough: { description: 'Parent stops, children start 2-4 f later, overshoot more, settle.', seconds: (o?: FollowOpts & { targets?: number }) => followSeconds(o?.targets ?? 1, o) },
  arcMove: { description: 'A to B along an arc instead of a straight line.', seconds: arcSeconds },
  movingHold: { description: 'Hold with a tiny drift so the pose never freezes dead.', seconds: holdSeconds },
  walkCycle: { description: 'Walk (30 f/step) or run (20 f/step) with contact/down/passing/up poses on a shape rig.', seconds: walkSeconds },
  rigWalk: { description: 'IK walk on <RigCharacter>: planted feet never slide, hip bob, counter-swinging arms, stop with weight settle.', seconds: rigWalkSeconds },
  idleBreath: { description: 'Subtle moving hold: chest rises, head and arms follow 3-4 f later, optional blink.', seconds: idleBreathSeconds },
  lookAt: { description: 'Eyes first, head 3 f later, torso 6 f later.', seconds: lookAtSeconds },
  react: { description: 'Anticipation crouch, surprise pose with hop, landing absorb, settle.', seconds: reactSeconds },
  turn: { description: 'Eyes and head lead, then flip the figure about its centre.', seconds: turnSeconds },
} as const;
