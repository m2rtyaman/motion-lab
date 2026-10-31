import { Composition } from "remotion";
import { Scene } from "../components/Scene";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 Dikey 6 Saniyelik Ofis Diyalog Kompozisyonu (360 Frame @ 60 FPS) */}
      <Composition
        id="RepoNews-9x16"
        component={Scene}
        durationInFrames={360}
        fps={60}
        width={1080}
        height={1920}
        defaultProps={{
          aspect: "9:16" as const,
        }}
      />

      {/* 16:9 Yatay Kompozisyon */}
      <Composition
        id="RepoNews-16x9"
        component={Scene}
        durationInFrames={360}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{
          aspect: "16:9" as const,
        }}
      />
    </>
  );
};
