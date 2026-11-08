/**
 * Closed motion-preset vocabulary.
 * A scene only CHOOSES and SCHEDULES presets; duration, ease and values are baked in
 * (taken from tokens.ts / recipes.ts / transitions.ts). Options are a tiny whitelist.
 * Every tween created here carries `data.preset = '<kind>:<name>'` for audits.
 */
import { DURATIONS, EASING, MOTION_OFFSET, RECIPE, SCALE_CONTRAST, TIMING } from './tokens.ts';
import {
  blurScaleReveal,
  chromaticAberrationPulse,
  depthStaggerReveal,
  impactShake,
  kineticWordDrop,
  maskWipeReveal,
  specularGlintGlance,
  springSettle,
} from './recipes.ts';
import {
  transitionCameraDive,
  transitionContainerMorph,
  transitionElementTakeover,
  transitionMaskWipe,
  transitionWhipPan,
  transitionZoomPunch,
  type CameraDiveOptions,
  type ContainerMorphOptions,
  type ElementTakeoverOptions,
  type MaskWipeOptions,
  type WhipPanOptions,
  type ZoomPunchOptions,
} from './transitions.ts';

type Timeline = gsap.core.Timeline;
/** Selector string or element(-like) object. */
export type PresetTarget = string | object;

export type EnterPreset = 'rise' | 'pop' | 'blurIn' | 'wipe' | 'stagger' | 'words';
export type ExitPreset = 'sink' | 'shrink' | 'wipeOut';
export type EmphasizePreset = 'punch' | 'shake' | 'glint';
export type CameraPreset = 'pushIn' | 'pullOut' | 'drift' | 'settle';
export type TransitionPreset = 'whip' | 'maskWipe' | 'morph' | 'zoomPunch' | 'takeover' | 'dive';

/** The ONLY options a scene may pass. No raw durations, eases or numbers. */
export interface PresetOpts {
  stagger?: 'tight' | 'normal' | 'loose';
  intensity?: 'soft' | 'normal' | 'strong';
  direction?: 'up' | 'down' | 'left' | 'right';
}

type Strip<T> = Omit<T, 'at'>;

/** Selector + option objects for each transition (passed through to transitions.ts). */
export type TransitionArgs = {
  whip: { outgoing: string; incoming: string } & Strip<WhipPanOptions>;
  maskWipe: { incoming: string } & Strip<MaskWipeOptions>;
  morph: { container: string; outgoing: string; incoming: string } & Strip<ContainerMorphOptions>;
  zoomPunch: { outgoing: string; incoming: string } & Strip<ZoomPunchOptions>;
  takeover: { trigger: string; outgoing: string; incoming: string } & Strip<ElementTakeoverOptions>;
  dive: { rig: string; outgoing: string; incoming: string } & Strip<CameraDiveOptions>;
};

/* ---- internal constants (named, derived from tokens where possible) ---- */
const STAGGER_MAP = {
  tight: TIMING.charStagger,
  normal: TIMING.itemStagger,
  loose: TIMING.digitStagger,
} as const;
const PUNCH_SCALE = { soft: 1.02, normal: 1.04, strong: 1.07 } as const;
const SHAKE_PX = {
  soft: RECIPE.shakeAmplitudePx * 0.5,
  normal: RECIPE.shakeAmplitudePx,
  strong: RECIPE.shakeAmplitudePx * 1.6,
} as const;
const PUSH_SCALE = { soft: 1.05, normal: 1.1, strong: 1.18 } as const;
const PULL_SCALE = { soft: 0.96, normal: 0.92, strong: SCALE_CONTRAST.wideOverview } as const;
const DRIFT_SCALE = { soft: 1.01, normal: 1.02, strong: 1.035 } as const;
const DRIFT_PX = { soft: 8, normal: 16, strong: 28 } as const;
const DRIFT_SECONDS = 2.4;
const SETTLE_FROM = { soft: 1.02, normal: 1.04, strong: 1.07 } as const;
const RISE_PX = {
  soft: MOTION_OFFSET.itemY,
  normal: MOTION_OFFSET.surfaceY * 0.5,
  strong: MOTION_OFFSET.surfaceY,
} as const;
const SHRINK_SCALE = 0.6;
const HOLD_DEFAULT_SECONDS = 1.2;
/** [x, y] unit vector of the entering motion's START offset sign. */
const DIR_VEC = { up: [0, 1], down: [0, -1], left: [1, 0], right: [-1, 0] } as const;

/** Whitelist lookup: unknown / invalid values silently fall back to the default. */
const pick = <K extends string, V>(map: Record<K, V>, key: unknown, fallback: K): V =>
  typeof key === 'string' && Object.prototype.hasOwnProperty.call(map, key)
    ? map[key as K]
    : map[fallback];

/** Run `build`, then tag every tween it added to `tl` with the preset id. */
function tagged(tl: Timeline, id: string, build: () => void): Timeline {
  const before = new Set(tl.getChildren(false));
  build();
  for (const child of tl.getChildren(false)) {
    if (!before.has(child)) child.data = { ...(child.data ?? {}), preset: id };
  }
  return tl;
}

/* ---------------------------- public API ---------------------------- */

/** Marks a spec beat: adds label `beat:<id>` at `at`. */
export function beat(tl: Timeline, id: string, at: number): Timeline {
  return tl.addLabel(`beat:${id}`, at);
}

/** Final stillness hold: labels only, no tweens. */
export function holdFinal(
  tl: Timeline,
  at: number,
  seconds: number = HOLD_DEFAULT_SECONDS
): Timeline {
  return tl.addLabel('hold:start', at).addLabel('hold:end', at + seconds);
}

export function enter(
  tl: Timeline,
  target: PresetTarget,
  preset: EnterPreset,
  at: number,
  opts?: PresetOpts
): Timeline {
  const t = target as string;
  const stagger = pick(STAGGER_MAP, opts?.stagger, 'normal');
  return tagged(tl, `enter:${preset}`, () => {
    switch (preset) {
      case 'rise': {
        const dir = pick(DIR_VEC, opts?.direction, 'up');
        const d = pick(RISE_PX, opts?.intensity, 'normal');
        tl.fromTo(
          t,
          { x: dir[0] * d, y: dir[1] * d, opacity: 0 },
          { x: 0, y: 0, opacity: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
          at
        );
        break;
      }
      case 'pop': springSettle(tl, t, at); break;
      case 'blurIn': blurScaleReveal(tl, t, at); break;
      case 'wipe': maskWipeReveal(tl, t, at); break;
      case 'stagger': depthStaggerReveal(tl, t, at, stagger); break;
      case 'words': kineticWordDrop(tl, t, at, stagger); break;
    }
  });
}

export function exit(
  tl: Timeline,
  target: PresetTarget,
  preset: ExitPreset,
  at: number,
  _opts?: PresetOpts
): Timeline {
  const t = target as string;
  return tagged(tl, `exit:${preset}`, () => {
    switch (preset) {
      case 'sink':
        tl.to(
          t,
          {
            y: -MOTION_OFFSET.exitY,
            scale: MOTION_OFFSET.exitScale,
            opacity: 0,
            filter: `blur(${MOTION_OFFSET.exitBlur}px)`,
            duration: DURATIONS.exit,
            ease: EASING.quickIn,
          },
          at
        );
        break;
      case 'shrink':
        tl.to(
          t,
          { scale: SHRINK_SCALE, opacity: 0, duration: DURATIONS.exit, ease: EASING.quickIn },
          at
        );
        break;
      case 'wipeOut':
        tl.to(
          t,
          { scaleX: 0, transformOrigin: 'right center', duration: DURATIONS.exit, ease: EASING.quickIn },
          at
        );
        break;
    }
  });
}

export function emphasize(
  tl: Timeline,
  target: PresetTarget,
  preset: EmphasizePreset,
  at: number,
  opts?: PresetOpts
): Timeline {
  const t = target as string;
  return tagged(tl, `emphasize:${preset}`, () => {
    switch (preset) {
      case 'punch': chromaticAberrationPulse(tl, t, at, pick(PUNCH_SCALE, opts?.intensity, 'normal')); break;
      case 'shake': impactShake(tl, t, at, pick(SHAKE_PX, opts?.intensity, 'normal')); break;
      case 'glint': specularGlintGlance(tl, t, at); break;
    }
  });
}

export function camera(
  tl: Timeline,
  target: PresetTarget,
  preset: CameraPreset,
  at: number,
  opts?: PresetOpts
): Timeline {
  const t = target as string;
  return tagged(tl, `camera:${preset}`, () => {
    switch (preset) {
      case 'pushIn':
        tl.to(t, { scale: pick(PUSH_SCALE, opts?.intensity, 'normal'), duration: DURATIONS.camera, ease: EASING.expoOut }, at);
        break;
      case 'pullOut':
        tl.to(t, { scale: pick(PULL_SCALE, opts?.intensity, 'normal'), duration: DURATIONS.camera, ease: EASING.expoOut }, at);
        break;
      case 'drift': {
        const dir = pick(DIR_VEC, opts?.direction, 'left');
        const px = pick(DRIFT_PX, opts?.intensity, 'normal');
        tl.to(
          t,
          {
            x: dir[0] * px,
            y: -dir[1] * px,
            scale: pick(DRIFT_SCALE, opts?.intensity, 'normal'),
            duration: DRIFT_SECONDS,
            ease: EASING.sineInOut,
          },
          at
        );
        break;
      }
      case 'settle':
        tl.fromTo(
          t,
          { scale: pick(SETTLE_FROM, opts?.intensity, 'normal') },
          { scale: 1, duration: DURATIONS.camera, ease: EASING.expoOut },
          at
        );
        break;
    }
  });
}

/** Thin wrapper over transitions.ts; option objects are passed through. */
export function transition<P extends TransitionPreset>(
  tl: Timeline,
  preset: P,
  at: number,
  opts: TransitionArgs[P]
): Timeline {
  return tagged(tl, `transition:${preset}`, () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const o = opts as any;
    switch (preset) {
      case 'whip': transitionWhipPan(tl, o.outgoing, o.incoming, { ...o, at }); break;
      case 'maskWipe': transitionMaskWipe(tl, o.incoming, { ...o, at }); break;
      case 'morph': transitionContainerMorph(tl, o.container, o.outgoing, o.incoming, { ...o, at }); break;
      case 'zoomPunch': transitionZoomPunch(tl, o.outgoing, o.incoming, { ...o, at }); break;
      case 'takeover': transitionElementTakeover(tl, o.trigger, o.outgoing, o.incoming, { ...o, at }); break;
      case 'dive': transitionCameraDive(tl, o.rig, o.outgoing, o.incoming, { ...o, at }); break;
    }
  });
}

/* ---------------------------- catalog ---------------------------- */

export interface CatalogEntry {
  description: string;
  /** Seconds from `at` until the last tween ends, for a single target. */
  duration: number;
}

/** Transition durations are measured from the default options of transitions.ts. */
/** Stagger presets add (children - 1) * interval on top of the listed duration. */
export const PRESET_CATALOG = {
  enter: {
    rise: { description: 'Fades in while sliding a short distance from `direction` (default up).', duration: DURATIONS.panel },
    pop: { description: 'Scales from 0 with a small overshoot, then settles.', duration: RECIPE.settleIn + RECIPE.settleOut },
    blurIn: { description: 'Arrives large and blurred, resolves sharp and in place.', duration: DURATIONS.camera },
    wipe: { description: 'Reveals left-to-right with a scaleX wipe.', duration: RECIPE.wipeDuration },
    stagger: { description: 'Children rise out of depth one after another (use a group selector).', duration: DURATIONS.panel },
    words: { description: 'Headline words drop in with a springy kinetic stagger.', duration: DURATIONS.word },
  },
  exit: {
    sink: { description: 'Drops slightly, shrinks and blurs out fast.', duration: DURATIONS.exit },
    shrink: { description: 'Scales down to a small size while fading out.', duration: DURATIONS.exit },
    wipeOut: { description: 'Collapses to the right edge with a scaleX wipe.', duration: DURATIONS.exit },
  },
  emphasize: {
    punch: { description: 'Quick scale pulse with a brightness flash.', duration: DURATIONS.instant + DURATIONS.micro },
    shake: { description: 'Decaying impact shake, then settles to rest.', duration: RECIPE.shakeSteps * RECIPE.shakeStep + DURATIONS.panel },
    glint: { description: 'Diagonal specular glint sweeps across the element.', duration: DURATIONS.panel * 0.75 + DURATIONS.micro },
  },
  camera: {
    pushIn: { description: 'Camera pushes in to a slightly larger scale.', duration: DURATIONS.camera },
    pullOut: { description: 'Camera pulls back to a wider view.', duration: DURATIONS.camera },
    drift: { description: 'Slow, subtle sideways drift with a faint scale creep.', duration: DRIFT_SECONDS },
    settle: { description: 'Starts slightly zoomed and eases to rest at scale 1.', duration: DURATIONS.camera },
  },
  transition: {
    whip: { description: 'High-speed directional whip pan between scenes (transitionWhipPan).', duration: 0.74 },
    maskWipe: { description: 'Mask wipe reveals the incoming scene (transitionMaskWipe).', duration: 0.6 },
    morph: { description: 'Container morphs while content swaps (transitionContainerMorph).', duration: 0.8 },
    zoomPunch: { description: 'Portal zoom punch into the next scene (transitionZoomPunch).', duration: 0.8125 },
    takeover: { description: 'A trigger element scales up to take over the screen (transitionElementTakeover).', duration: 0.663 },
    dive: { description: 'Camera dives into the target, then settles on the next scene (transitionCameraDive).', duration: 0.8112 },
  },
} satisfies {
  enter: Record<EnterPreset, CatalogEntry>;
  exit: Record<ExitPreset, CatalogEntry>;
  emphasize: Record<EmphasizePreset, CatalogEntry>;
  camera: Record<CameraPreset, CatalogEntry>;
  transition: Record<TransitionPreset, CatalogEntry>;
};
