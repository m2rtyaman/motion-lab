import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera, enterSurface, animateWordBurst } from '../../core/choreography';
import { SpotlightStage, CameraRig, KineticText } from '../../primitives';
import { MetricTelemetryCard } from '../../archetypes/MetricTelemetryCard';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'headline', startFrame: 0, endFrame: 89 },
  { id: 'metric', startFrame: 90, endFrame: 179 },
  { id: 'settle', startFrame: 180, endFrame: 240 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '9:16' }) => {
  const frame = useCurrentFrame();
  const beat = BEATS.find((b) => frame >= b.startFrame && frame <= b.endFrame) ?? BEATS[BEATS.length - 1];

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.94, rotateX: 6 },
      { at: 0.05, duration: 1.4, scale: 1, rotateX: 0, ease: 'expo.inOut' },
      { at: 1.5, duration: 0.9, scale: 1.05, y: -50, rotateX: -2, ease: 'expo.out' },
      { at: 2.6, duration: 1.35, scale: 1.08, y: -30, rotateX: 0, ease: 'power2.inOut' },
    ]);

    animateWordBurst(tl, '.hero-word', 0.2);

    enterSurface(tl, '.telemetry-surface', 1.5, {
      itemSelector: '.telemetry-item',
      yFrom: 60,
    });
  }, []);

  return (
    <SpotlightStage aspect={aspect} data-beat={beat.id}>
      <CameraRig className="camera-rig">
        <div className="flex flex-col items-center justify-center gap-12 w-full max-w-[940px] mx-auto px-6">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="text-[20px] font-mono uppercase tracking-[0.24em] text-zinc-400">
              CLUSTER SYSTEM // TELEMETRY
            </span>
            <KineticText
              text="CORE KERNEL"
              wordClassName="hero-word"
              variant="hero"
              className="text-center font-extrabold tracking-tighter"
            />
          </div>

          <div className="telemetry-surface w-full">
            <MetricTelemetryCard
              cardClassName="telemetry-card"
              itemClassName="telemetry-item"
              categoryLabel="UPTIME METRIC"
              title="Global Availability"
              fromValue={0}
              toValue={99.98}
              decimals={2}
              suffix="%"
              deltaBadge="+0.14% WoW"
              tone="emerald"
              startAtSec={1.5}
            />
          </div>
        </div>
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
