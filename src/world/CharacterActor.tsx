import type { FC } from 'react';
import { staticFile, useCurrentFrame } from 'remotion';

export type ActorActionState = 'run' | 'shout' | 'leap' | 'idle';

export interface ActorMotionSegment {
  startFrame: number;
  endFrame: number;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  fromScale: number;
  toScale: number;
  facingRight: boolean;
  action: ActorActionState;
}

export interface CharacterActorProps {
  segments: ActorMotionSegment[];
  /** Sprite klasörü (public/ köküne göre); proje başına verilir. */
  spriteBase?: string;
  /** Run cycle sprite filenames inside spriteBase */
  runSprites?: string[];
  shoutSprite?: string;
  idleSprite?: string;
  leapSprite?: string;
}

export interface ComputedActorPose {
  x: number;
  y: number;
  scale: number;
  facingRight: boolean;
  action: ActorActionState;
  segmentProgress: number;
}

/**
 * Verilen karedeki aktör konumunu ve durumunu hesaplar (Kamera veya VFX senkronu için dışa açık)
 */
export const evaluateActorPose = (
  frame: number,
  segments: ActorMotionSegment[]
): ComputedActorPose => {
  const active =
    segments.find((s) => frame >= s.startFrame && frame <= s.endFrame) ??
    segments[segments.length - 1];

  const span = Math.max(1, active.endFrame - active.startFrame);
  const rawP = Math.min(1, Math.max(0, (frame - active.startFrame) / span));

  // Smooth step easing for natural acceleration/deceleration at segment boundaries
  const easedP =
    active.action === 'run'
      ? rawP < 0.15
        ? (rawP / 0.15) * (rawP / 0.15) * 0.15
        : rawP > 0.85
        ? 1 - ((1 - rawP) / 0.15) * ((1 - rawP) / 0.15) * 0.15
        : rawP
      : rawP;

  // Parabolic arc offset when running along curved arena floor
  const curveArcY =
    active.action === 'run' ? Math.sin(rawP * Math.PI) * 24 : 0;

  return {
    x: active.fromX + (active.toX - active.fromX) * easedP,
    y: active.fromY + (active.toY - active.fromY) * easedP + curveArcY,
    scale: active.fromScale + (active.toScale - active.fromScale) * easedP,
    facingRight: active.facingRight,
    action: active.action,
    segmentProgress: rawP,
  };
};

/**
 * CharacterActor — 60 FPS Prosedürel Kukla Fiziği & 12 Animasyon Prensibi Motoru
 * Sadece 2-3 karelik sprite sheet'leri bile 60 FPS akıcı animasyona dönüştürür:
 * 1. Squash & Stretch (Adım darbesinde basılma, sıçramada uzama)
 * 2. Step Arc Bobbing (Her adımda parabolik dikey yaylanma)
 * 3. Velocity Lean & Shoulder Sway (Koşu yönüne eğilme ve omuz salınımı)
 * 4. Braking Anticipation (Durmadan hemen önce çömelme ve geriye esneme)
 * 5. Motion Trail & Footstep Dust (Hız izi ve taş zemin adım tozu)
 */
export const CharacterActor: FC<CharacterActorProps> = ({
  segments,
  spriteBase = 'assets/sprites',
  runSprites = ['run_1', 'run_2', 'walk_recover'],
  shoutSprite = 'shout',
  idleSprite = 'idle',
  leapSprite = 'jump',
}) => {
  const frame = useCurrentFrame();
  const pose = evaluateActorPose(frame, segments);
  const prevPose = evaluateActorPose(Math.max(0, frame - 3), segments);

  const dirSign = pose.facingRight ? 1 : -1;

  // ---------------------------------------------------------------------------
  // 12 PRINCIPLES PROCEDURAL PUPPET PHYSICS (60 FPS)
  // ---------------------------------------------------------------------------
  let spriteName = idleSprite;
  let stepBobY = 0;
  let squashX = 1;
  let stretchY = 1;
  let leanDeg = 0;
  let skewDeg = 0;

  // Stride frequency: 1 full step every 10 frames (6 steps per second)
  const strideAngle = (frame * Math.PI) / 10;
  const sinStride = Math.sin(strideAngle);
  const absSin = Math.abs(sinStride); // 0 at ground impact, 1 at mid-air peak

  if (pose.action === 'run') {
    const spriteIdx = Math.floor(frame / 6) % runSprites.length;
    spriteName = runSprites[spriteIdx];

    // Check if braking right before a stop (last 12% of run segment)
    const isBraking = pose.segmentProgress > 0.88;

    if (isBraking) {
      // Anticipation crouch before stopping/shouting
      stepBobY = 8;
      squashX = 1.14;
      stretchY = 0.86;
      leanDeg = -5 * dirSign; // Lean back to brake
    } else {
      // Parabolic step bounce (-22px at peak)
      stepBobY = -absSin * 22;
      // Squash on ground contact (absSin ~ 0), Stretch at peak (absSin ~ 1)
      squashX = 1.09 - absSin * 0.15; // 1.09 -> 0.94
      stretchY = 0.91 + absSin * 0.16; // 0.91 -> 1.07
      // Forward velocity lean + rhythmic stride oscillation
      leanDeg = (7 + Math.cos(strideAngle) * 2.5) * dirSign;
      skewDeg = Math.sin(strideAngle * 2) * 3 * dirSign;
    }
  } else if (pose.action === 'shout') {
    spriteName = shoutSprite;
    // Explosive roar entrance overshoot in first 15% of shout
    const burstEnv = Math.exp(-pose.segmentProgress * 6);
    const tremor = Math.sin(frame * 1.8) * 3.5;
    stepBobY = -burstEnv * 14 + (frame % 2 === 0 ? -2 : 2);
    squashX = 1.06 + burstEnv * 0.12 + Math.sin(frame * 1.4) * 0.03;
    stretchY = 1.04 + burstEnv * 0.14 - Math.sin(frame * 1.4) * 0.03;
    leanDeg = tremor;
  } else if (pose.action === 'leap') {
    spriteName = leapSprite;
    const jumpArc = Math.sin(pose.segmentProgress * Math.PI);
    stepBobY = -jumpArc * 55;
    squashX = 0.92;
    stretchY = 1.12;
    leanDeg = 9 * dirSign;
  }

  // Footstep dust particles when running
  const showDust = pose.action === 'run';
  const dustPhase = (frame % 10) / 10; // 0 -> 1 every step

  return (
    <>
      {/* 1. ZEMİN TEMAS VE YAYILIM GÖLGESİ (Contact + Ambient Shadow) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
        style={{
          width: '140px',
          height: '34px',
          borderRadius: '9999px',
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.45) 50%, rgba(0,0,0,0) 78%)',
          transform: `translate(calc(-50% + ${pose.x}px), calc(-50% + ${
            pose.y + 68 * (pose.scale / 2.4)
          }px)) scale(${pose.scale * 0.52 * (1 - Math.abs(stepBobY) * 0.008)})`,
        }}
      />

      {/* 2. ADIM TOZU PARTİKÜLLERİ (Footstep Stone Dust Puffs) */}
      {showDust && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 will-change-transform"
          style={{
            transform: `translate(calc(-50% + ${
              pose.x - dirSign * (25 + dustPhase * 45)
            }px), calc(-50% + ${pose.y + 58 * (pose.scale / 2.4) - dustPhase * 18}px)) scale(${
              pose.scale * (0.35 + dustPhase * 0.45)
            })`,
            opacity: (1 - dustPhase) * 0.55,
          }}
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-amber-100/35 blur-[2px]" />
            <span className="w-5 h-5 rounded-full bg-stone-300/40 blur-[1px] -mt-3" />
            <span className="w-4 h-4 rounded-full bg-amber-200/30 blur-[1px]" />
          </div>
        </div>
      )}

      {/* 3. KOŞU HIZ İZİ (60 FPS Motion Trail Silhouette) */}
      {pose.action === 'run' && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 w-[160px] h-[160px] will-change-transform flex items-center justify-center"
          style={{
            opacity: 0.22,
            filter: 'blur(3px) brightness(1.3)',
            transform: `translate(calc(-50% + ${prevPose.x}px), calc(-50% + ${
              prevPose.y + stepBobY * 0.7
            }px)) scale(${prevPose.scale * 0.96}) scaleX(${dirSign})`,
          }}
        >
          <img
            src={staticFile(`${spriteBase}/${spriteName}.png`)}
            alt=""
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* 4. ANA KARAKTER SPRITE + SQUASH/STRETCH KUKLA DÖNÜŞÜMÜ */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[160px] h-[160px] will-change-transform flex items-center justify-center origin-bottom"
        style={{
          transform: `translate(calc(-50% + ${pose.x}px), calc(-50% + ${
            pose.y + stepBobY
          }px)) scale(${pose.scale}) rotate(${leanDeg.toFixed(
            2
          )}deg) skewX(${skewDeg.toFixed(2)}deg) scaleX(${
            dirSign * squashX
          }) scaleY(${stretchY})`,
        }}
      >
        <img
          src={staticFile(`${spriteBase}/${spriteName}.png`)}
          alt="Animated Character"
          className="w-full h-full object-contain"
          style={{
            filter:
              pose.action === 'shout'
                ? 'drop-shadow(0 12px 18px rgba(0,0,0,0.85)) drop-shadow(8px -6px 10px rgba(245,158,11,0.32)) contrast(1.08)'
                : 'drop-shadow(0 10px 14px rgba(0,0,0,0.8)) contrast(1.04)',
          }}
        />
      </div>
    </>
  );
};
