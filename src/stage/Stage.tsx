import { useState, type FC } from "react";
import { Player } from "@remotion/player";
import { PROJECTS } from "../projects/registry.generated";

/** Tarayıcı önizleme sahnesi (video çıktısına girmez). Projeyi kayıt defterinden seçer. */
export const Stage: FC = () => {
  const [slug, setSlug] = useState(PROJECTS[0]?.slug ?? "");
  const project = PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return <div className="text-zinc-400 font-mono text-sm">src/projects altında proje yok. Oluştur: pnpm new &lt;slug&gt;</div>;
  }

  const { width, height, fps, durationInFrames, Scene } = project;
  const portrait = height > width;

  return (
    <div className="relative w-full max-w-[1080px] flex flex-col gap-4 mx-auto select-none">
      <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#121215] border border-white/[0.08] shadow-lg text-xs font-mono">
        <div className="flex items-center gap-3 text-zinc-300">
          <select
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-md px-2 py-1 text-[11px] text-zinc-200"
          >
            {PROJECTS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.slug} ({p.mode})
              </option>
            ))}
          </select>
          <span className="text-zinc-500">
            {project.aspect} ({width}x{height}) • {fps} FPS • {durationInFrames} kare
          </span>
        </div>
        <span className="text-zinc-500">{project.title}</span>
      </div>

      <div className="relative w-full min-h-[580px] max-h-[720px] rounded-2xl border border-white/[0.08] bg-[#09090b] overflow-hidden shadow-2xl flex items-center justify-center p-4">
        <div
          style={{ width: portrait ? "380px" : "100%", aspectRatio: `${width}/${height}`, maxHeight: "680px" }}
          className="rounded-xl overflow-hidden shadow-2xl border border-white/[0.08]"
        >
          <Player
            key={slug}
            component={Scene}
            inputProps={{ aspect: project.aspect }}
            durationInFrames={durationInFrames}
            compositionWidth={width}
            compositionHeight={height}
            fps={fps}
            controls
            loop
            autoPlay
            style={{ width: "100%", height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};
