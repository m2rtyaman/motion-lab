import fs from "node:fs";
import path from "node:path";
import { ASPECT_DIMS, SLUG_RE, listProjects, projectPaths, projectsDir, rel } from "./lib/projects.mjs";

/**
 * Proje kayıt defteri üreticisi (Faz 6).
 * src/projects/<slug>/spec.json dosyalarını tarar ve Remotion Root'un okuduğu
 * src/projects/registry.generated.ts dosyasını üretir. Elle düzenleme; her check/render öncesi yeniden üretilir.
 */
const out = path.join(projectsDir, "registry.generated.ts");
const slugs = listProjects();
const problems = [];
const entries = [];

for (const slug of slugs) {
  const p = projectPaths(slug);
  if (!SLUG_RE.test(slug)) problems.push(`${slug}: geçersiz slug (küçük harf/rakam/tire)`);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(p.spec, "utf-8").replace(/^\uFEFF/, ""));
  } catch (e) {
    problems.push(`${rel(p.spec)}: JSON okunamadı (${e.message})`);
    continue;
  }
  if (!ASPECT_DIMS[spec.aspect]) problems.push(`${rel(p.spec)}: geçersiz aspect "${spec.aspect}"`);
  if (!Number.isFinite(spec.durationInSeconds) || spec.durationInSeconds <= 0) problems.push(`${rel(p.spec)}: geçersiz durationInSeconds`);
  if (!fs.existsSync(p.scene)) problems.push(`${rel(p.dir)}: Scene.tsx yok`);
  else if (!/export\s+const\s+Scene\b/.test(fs.readFileSync(p.scene, "utf-8")))
    problems.push(`${rel(p.scene)}: "export const Scene" bulunamadı (kayıt defteri bunu içe aktarır)`);
  const [width, height] = ASPECT_DIMS[spec.aspect] ?? [1080, 1920];
  entries.push({
    slug,
    ident: slug.replace(/-/g, "_"),
    title: String(spec.title ?? slug),
    aspect: spec.aspect,
    mode: spec.mode,
    fps: spec.fps ?? 60,
    durationInFrames: Math.round(spec.durationInSeconds * (spec.fps ?? 60)),
    width,
    height,
  });
}

if (problems.length) {
  console.error(`\x1b[31m\x1b[1m[REGISTRY] ${problems.length} sorun:\x1b[0m\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

const body = `// OTOMATİK ÜRETİLDİ: scripts/gen-registry.mjs — elle düzenleme.
import type { FC } from 'react';
${entries.map((e) => `import { Scene as Scene_${e.ident} } from './${e.slug}/Scene';`).join("\n")}

export type ProjectAspect = '9:16' | '16:9';
export type ProjectMode = 'cinematic-world' | 'editorial-ui' | 'kinetic-poster';

export interface ProjectEntry {
  slug: string;
  title: string;
  mode: ProjectMode;
  aspect: ProjectAspect;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  Scene: FC<{ aspect?: ProjectAspect }>;
}

export const PROJECTS: ProjectEntry[] = [
${entries
  .map(
    (e) => `  {
    slug: ${JSON.stringify(e.slug)},
    title: ${JSON.stringify(e.title)},
    mode: ${JSON.stringify(e.mode)},
    aspect: ${JSON.stringify(e.aspect)},
    fps: ${e.fps},
    durationInFrames: ${e.durationInFrames},
    width: ${e.width},
    height: ${e.height},
    Scene: Scene_${e.ident},
  },`
  )
  .join("\n")}
];
`;

const prev = fs.existsSync(out) ? fs.readFileSync(out, "utf-8") : "";
if (prev !== body) fs.writeFileSync(out, body);
console.log(`[REGISTRY] ${entries.length} proje: ${entries.map((e) => e.slug).join(", ") || "(yok)"}${prev === body ? " (güncel)" : " (yazıldı)"}`);
