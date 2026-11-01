import { useCurrentFrame, useVideoConfig } from "remotion";
import { useLayoutEffect, useRef, type DependencyList } from "react";
import gsap from "gsap";

/**
 * Deterministic Remotion-to-GSAP Frame Bridge (Universal Engine v6.0)
 * Synchronizes GSAP Master Timeline with Remotion frame index instead of wall-clock time.
 */
export const useRemotionGSAP = (
  timelineFactory: (tl: gsap.core.Timeline) => gsap.core.Timeline | void,
  dependencies: DependencyList = []
) => {
  let frame = 0;
  let fps = 60;

  try {
    frame = useCurrentFrame();
    fps = useVideoConfig().fps;
  } catch {
    // Fallback when rendered outside Remotion composition context
  }

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    // Initialize Master Timeline in paused state with deterministic child handling
    const defaultTl = gsap.timeline({
      paused: true,
      autoRemoveChildren: false,
    });

    const userTl = timelineFactory(defaultTl);
    const tl = userTl instanceof gsap.core.Timeline ? userTl : defaultTl;

    tl.pause();
    tl.seek(frame / fps);
    timelineRef.current = tl;

    return () => {
      tl.kill();
      timelineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useLayoutEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.seek(frame / fps);
    }
  }, [frame, fps]);

  return { timeline: timelineRef.current, frame, fps };
};
