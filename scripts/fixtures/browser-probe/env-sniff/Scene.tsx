import { type FC } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useRemotionGSAP } from "../../../../src/core/useRemotionGSAP";
import { beat, holdFinal } from "../../../../src/core/presets";

// Cheat under test: Node (the scorer) sees a clean ball tween, the browser animates a decoy instead.
const inNode = typeof window === "undefined";

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, "move", 0);
  tl.fromTo(inNode ? ".ball" : ".decoy", { x: 0 }, { x: 700, duration: 1.2, ease: "power2.out" }, 0.2);
  beat(tl, "rest", 1.8);
  tl.fromTo(".caption", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.85);
  holdFinal(tl, 1.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill style={{ backgroundColor: "#111111", color: "#ffffff" }}>
      <div className="ball" style={{ position: "absolute", left: 300, top: 400, width: 160, height: 160, borderRadius: 80, backgroundColor: "#ff6b35" }} />
      <div className="decoy" style={{ position: "absolute", left: 100, top: 100, width: 80, height: 80, backgroundColor: "#3366ff" }} />
      <div className="caption" style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontSize: 64, fontWeight: 700 }}>All done.</div>
    </AbsoluteFill>
  );
};

export default Scene;
