import { type FC } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { useRemotionGSAP } from "../../../../src/core/useRemotionGSAP";
import { beat, holdFinal } from "../../../../src/core/presets";

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, "move", 0);
  tl.fromTo(".ball", { x: 0 }, { x: 700, duration: 1.2, ease: "power2.out" }, 0.2);
  beat(tl, "rest", 1.8);
  tl.fromTo(".caption", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.0);
  holdFinal(tl, 1.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill style={{ backgroundColor: "#111111", color: "#ffffff" }}>
      <div className="ball" style={{ position: "absolute", left: 300, top: 400, width: 160, height: 160, borderRadius: 80, backgroundColor: "#ff6b35" }} />
      {[0,1,2,3,4,5,6,7].map((i) => <div key={i} style={{ position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "rgba(17,17,17,0.45)" }} />)}
      <div className="caption" style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", fontSize: 64, fontWeight: 700 }}>All done.</div>
    </AbsoluteFill>
  );
};

export default Scene;
