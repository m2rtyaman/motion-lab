import { Composition } from "remotion";
import { PROJECTS } from "../projects/registry.generated";

/**
 * Her proje (src/projects/<slug>) otomatik olarak bir Composition olur; id = slug.
 * Kayıt defteri scripts/gen-registry.mjs tarafından üretilir.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {PROJECTS.map((p) => (
        <Composition
          key={p.slug}
          id={p.slug}
          component={p.Scene}
          durationInFrames={p.durationInFrames}
          fps={p.fps}
          width={p.width}
          height={p.height}
          defaultProps={{ aspect: p.aspect }}
        />
      ))}
    </>
  );
};
