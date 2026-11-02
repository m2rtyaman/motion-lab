import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export interface PuppetJointAngles {
  head?: number;
  jaw?: number;
  shoulderL?: number;
  elbowL?: number;
  shoulderR?: number;
  elbowR?: number;
}

export interface CutoutPuppetStageProps {
  /** Optional custom head sprite image URL or custom SVG node */
  headContent?: React.ReactNode;
  /** Optional custom torso sprite image URL or custom SVG node */
  torsoContent?: React.ReactNode;
  /** Optional left upper arm node */
  armLeftUpperContent?: React.ReactNode;
  /** Optional left forearm node */
  armLeftLowerContent?: React.ReactNode;
  /** Optional right upper arm node */
  armRightUpperContent?: React.ReactNode;
  /** Optional right forearm node */
  armRightLowerContent?: React.ReactNode;
  /** Joint rotation angles in degrees */
  angles?: PuppetJointAngles;
  /** Whether to quantize motion to 12 FPS stop-motion stepped holds (default: true) */
  stepped12Fps?: boolean;
  /** Whether to add subtle handheld stop-motion jitter (default: true) */
  microShake?: boolean;
  /** White paper cutout stroke border width in pixels (default: 3px) */
  whiteCutoutBorder?: number;
  /** Container CSS classes */
  className?: string;
  /** Custom overlay/children */
  children?: React.ReactNode;
}

/**
 * CutoutPuppetStage — NOGGIN & Terry Gilliam Articulated Paper Cutout Puppet
 * 
 * Based on Opus 5.5 Case NOGGIN & Surreal Collage:
 * - 2-4px white paper cutout edge (analog scissor aesthetic)
 * - Articulated joint hierarchy (neck/head, jaw, shoulder, elbow)
 * - 12 FPS stepped stop-motion quantization
 * - Handheld frame-to-frame micro-shake
 */
export const CutoutPuppetStage: React.FC<CutoutPuppetStageProps> = ({
  headContent,
  torsoContent,
  armLeftUpperContent,
  armLeftLowerContent,
  armRightUpperContent,
  armRightLowerContent,
  angles = {},
  stepped12Fps = true,
  microShake = true,
  whiteCutoutBorder = 3,
  className = '',
  children,
}) => {
  const currentFrame = useCurrentFrame();
  const { fps = 60 } = useVideoConfig();

  // Quantize frame to 12fps if enabled (at 60fps, 1 step every 5 frames)
  const stepRate = Math.max(1, Math.round(fps / 12));
  const effectiveFrame = stepped12Fps ? Math.floor(currentFrame / stepRate) * stepRate : currentFrame;

  // Handheld micro-shake offsets
  const shakeX = microShake ? Math.sin(effectiveFrame * 1.337) * 1.8 : 0;
  const shakeY = microShake ? Math.cos(effectiveFrame * 1.719) * 1.4 : 0;
  const shakeRot = microShake ? Math.sin(effectiveFrame * 0.912) * 0.75 : 0;

  // Default joint angles combined with frame-driven breathing
  const headAngle = (angles.head ?? 0) + Math.sin(effectiveFrame * 0.1) * 2;
  const jawAngle = angles.jaw ?? 0;
  const shoulderLAngle = (angles.shoulderL ?? 0) + Math.cos(effectiveFrame * 0.08) * 3;
  const elbowLAngle = (angles.elbowL ?? 0) + Math.sin(effectiveFrame * 0.08) * 2;
  const shoulderRAngle = (angles.shoulderR ?? 0) - Math.cos(effectiveFrame * 0.08) * 3;
  const elbowRAngle = (angles.elbowR ?? 0) - Math.sin(effectiveFrame * 0.08) * 2;

  // White paper cutout filter
  const bw = Math.max(0, whiteCutoutBorder);
  const cutoutFilter = `drop-shadow(${bw}px 0 0 white) drop-shadow(-${bw}px 0 0 white) drop-shadow(0 ${bw}px 0 white) drop-shadow(0 -${bw}px 0 white) drop-shadow(0 6px 12px rgba(0,0,0,0.4))`;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        transform: `translate3d(${shakeX}px, ${shakeY}px, 0) rotate(${shakeRot}deg)`,
        filter: cutoutFilter,
      }}
    >
      <div className="relative w-[320px] h-[480px]">
        {/* 1. TORSO (Central Anchor) */}
        <div className="absolute left-[85px] top-[140px] w-[150px] h-[210px] z-20">
          {torsoContent || (
            <div className="w-full h-full bg-[#3E3835] rounded-t-[30px] rounded-b-md border border-black/30 flex flex-col items-center justify-center shadow-inner">
              <div className="w-12 h-1 bg-[#C4332B] mb-2 rounded-full" />
              <div className="w-8 h-8 rounded-full bg-[#1D1D1B] border border-amber-400/40" />
            </div>
          )}
        </div>

        {/* 2. HEAD & JAW (Pivots at neck) */}
        <div
          className="absolute left-[95px] top-[20px] w-[130px] h-[130px] z-30 origin-bottom"
          style={{
            transform: `rotate(${headAngle}deg)`,
            transformOrigin: '50% 90%',
          }}
        >
          {headContent || (
            <div className="w-full h-full bg-[#EAE3D2] rounded-full border border-black/40 flex flex-col items-center justify-center relative overflow-hidden shadow-md">
              <div className="flex gap-6 mt-[-10px]">
                <div className="w-3.5 h-3.5 bg-black rounded-full" />
                <div className="w-3.5 h-3.5 bg-black rounded-full" />
              </div>
              {/* Articulated Jaw */}
              <div
                className="absolute bottom-2 w-12 h-4 bg-[#B53A2E] rounded-full origin-top"
                style={{
                  transform: `translateY(${Math.max(0, jawAngle * 0.5)}px) scaleY(${1 + jawAngle * 0.05})`,
                }}
              />
            </div>
          )}
        </div>

        {/* 3. LEFT ARM HIERARCHY (Shoulder -> Elbow) */}
        <div
          className="absolute left-[35px] top-[150px] w-[60px] h-[100px] z-15 origin-top-right"
          style={{
            transform: `rotate(${shoulderLAngle}deg)`,
            transformOrigin: '80% 15%',
          }}
        >
          {armLeftUpperContent || (
            <div className="w-[36px] h-[90px] bg-[#2E2927] rounded-full border border-black/30 mx-auto" />
          )}

          {/* Left Forearm */}
          <div
            className="absolute left-0 top-[70px] w-[50px] h-[100px] origin-top"
            style={{
              transform: `rotate(${elbowLAngle}deg)`,
              transformOrigin: '50% 10%',
            }}
          >
            {armLeftLowerContent || (
              <div className="w-[28px] h-[85px] bg-[#EAE3D2] rounded-full border border-black/30 mx-auto" />
            )}
          </div>
        </div>

        {/* 4. RIGHT ARM HIERARCHY (Shoulder -> Elbow) */}
        <div
          className="absolute right-[35px] top-[150px] w-[60px] h-[100px] z-25 origin-top-left"
          style={{
            transform: `rotate(${shoulderRAngle}deg)`,
            transformOrigin: '20% 15%',
          }}
        >
          {armRightUpperContent || (
            <div className="w-[36px] h-[90px] bg-[#2E2927] rounded-full border border-black/30 mx-auto" />
          )}

          {/* Right Forearm */}
          <div
            className="absolute right-0 top-[70px] w-[50px] h-[100px] origin-top"
            style={{
              transform: `rotate(${elbowRAngle}deg)`,
              transformOrigin: '50% 10%',
            }}
          >
            {armRightLowerContent || (
              <div className="w-[28px] h-[85px] bg-[#EAE3D2] rounded-full border border-black/30 mx-auto" />
            )}
          </div>
        </div>

        {/* Additional custom props/overlays */}
        {children && <div className="absolute inset-0 z-40 pointer-events-none">{children}</div>}
      </div>
    </div>
  );
};
