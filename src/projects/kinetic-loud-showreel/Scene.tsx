import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import {
  SpotlightStage,
  CameraRig,
  InstancedPinGrid3D,
  LiquidChromeTorus3D,
  MobiusTypeRibbon3D,
  TechnicalDraftingStage,
} from '../../primitives';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'pin-matrix', startFrame: 0, endFrame: 119 },
  { id: 'mobius-ribbon', startFrame: 120, endFrame: 299 },
  { id: 'chrome-torus', startFrame: 300, endFrame: 459 },
  { id: 'chrome-star', startFrame: 460, endFrame: 600 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.96, rotateX: 3 },
      // at: 0.05
      { at: 0.05, duration: 1.2, scale: 1.0, rotateX: 0, ease: 'expo.out' },
      // at: 1.6
      { at: 1.6, duration: 1.1, scale: 1.03, y: -20, ease: 'expo.inOut' },
      // at: 3.0
      { at: 3.0, duration: 1.2, scale: 1.08, rotateZ: -1.5, ease: 'expo.inOut' },
      // at: 4.6
      { at: 4.6, duration: 1.2, scale: 1.02, rotateZ: 1.0, ease: 'power3.out' },
      // at: 6.2
      { at: 6.2, duration: 1.2, scale: 1.0, rotateZ: 0, y: -15, ease: 'expo.out' },
      // at: 7.8
      { at: 7.8, duration: 1.2, scale: 1.06, y: -30, ease: 'expo.inOut' },
      // at: 9.2
      { at: 9.2, duration: 0.75, scale: 1.0, y: 0, ease: 'expo.out' },
    ]);
  }, []);

  // Frame aralıklarına göre aktif katmanları seç
  const isBeat1 = frame >= BEATS[0].startFrame && frame <= BEATS[0].endFrame;
  const isBeat2 = frame >= BEATS[1].startFrame && frame <= BEATS[1].endFrame;
  const isBeat3 = frame >= BEATS[2].startFrame && frame <= BEATS[2].endFrame;
  const isBeat4 = frame >= BEATS[3].startFrame && frame <= BEATS[3].endFrame;

  return (
    <SpotlightStage aspect={aspect}>
      <CameraRig className="camera-rig w-full h-full relative">
        {/* BEAT 1: Dokunsal Voxel Pin Matrisi */}
        {isBeat1 && (
          <div className="w-full h-full absolute inset-0 bg-[#08090b]">
            <InstancedPinGrid3D
              rows={24}
              cols={24}
              spacing={0.4}
              pinColor="#14171f"
              pinSpecular="#c4ff00"
              speed={3.6}
            />
            <TechnicalDraftingStage
              sectionIndex={1}
              sectionTotal={4}
              sectionTag="01 / TACTILE PIN MATRIX"
              headline="MAKE IT LOUD."
              subheadline="15 SECONDS. ZERO BORING FRAMES."
              bpm={144}
              badgeText="FRAME-PERFECT"
              gridTheme="acid-dark"
            />
          </div>
        )}

        {/* BEAT 2: Acid Lime Möbius Tipografi Şeridi */}
        {isBeat2 && (
          <div className="w-full h-full absolute inset-0 bg-[#0b0c10]">
            <div className="absolute inset-0 bg-[#08090b]/40 backdrop-blur-xs pointer-events-none" />
            <MobiusTypeRibbon3D
              text="TYPE IN MOTION • LET THE LETTERS DANCE"
              bgColor="#c4ff00"
              textColor="#090a0d"
              speed={1.2}
              radius={2.7}
            />
            <TechnicalDraftingStage
              sectionIndex={2}
              sectionTotal={4}
              sectionTag="02 / KINETIC TYPE"
              headline="TYPE IN MOTION."
              subheadline="DIMENSION IS A DESIGN TOOL."
              bpm={144}
              badgeText="144 BPM SYNC"
              gridTheme="acid-dark"
            />
          </div>
        )}

        {/* BEAT 3: Teknik Çizim Kağıdı & Sıvı Krom Torus */}
        {isBeat3 && (
          <div className="w-full h-full absolute inset-0 bg-[#d6d9ce]">
            <LiquidChromeTorus3D
              shape="torusKnot"
              metalColor="#ffffff"
              accentColor="#0f1115"
              metalness={0.96}
              roughness={0.05}
              rotationSpeed={1.4}
            />
            <TechnicalDraftingStage
              sectionIndex={3}
              sectionTotal={4}
              sectionTag="03 / 3D STUDY"
              headline="FORM. WITHOUT LIMITS."
              subheadline="CHROME / LIGHT / DEPTH."
              bpm={144}
              badgeText="HIT THE BEAT"
              gridTheme="drafting-paper"
            />
          </div>
        )}

        {/* BEAT 4: Şişirilmiş Sıvı Krom Yıldız & Kapanış */}
        {isBeat4 && (
          <div className="w-full h-full absolute inset-0 bg-[#08090b]">
            <LiquidChromeTorus3D
              shape="inflatedStar"
              metalColor="#f8fafc"
              accentColor="#c4ff00"
              metalness={0.98}
              roughness={0.04}
              rotationSpeed={1.1}
            />
            <TechnicalDraftingStage
              sectionIndex={4}
              sectionTotal={4}
              sectionTag="04 / ATTENTION"
              headline="I MOVE ATTENTION."
              subheadline="IDEA • FORM • MOVEMENT."
              bpm={144}
              badgeText="PRECISE"
              gridTheme="acid-dark"
            />
          </div>
        )}
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
