import fs from "node:fs";
import path from "node:path";
import { ASPECT_DIMS, SLUG_RE, listProjects, projectPaths, projectsDir, rel } from "./lib/projects.mjs";

/**
 * Project registry generator (Phase 6).
 * Scans src/projects/<slug>/spec.json files and produces
 * src/projects/registry.generated.ts consumed by Remotion Root.
 * Do not edit manually; regenerated automatically before each check/render.
 */
const out = path.join(projectsDir, "registry.generated.ts");
const slugs = listProjects();
const problems = [];
const entries = [];

for (const slug of slugs) {
  const p = projectPaths(slug);
  if (!SLUG_RE.test(slug)) problems.push(`${slug}: invalid slug (lowercase letters/digits/hyphens)`);
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(p.spec, "utf-8").replace(/^\uFEFF/, ""));
  } catch (e) {
    problems.push(`${rel(p.spec)}: could not parse JSON (${e.message})`);
    continue;
  }
  if (!ASPECT_DIMS[spec.aspect]) problems.push(`${rel(p.spec)}: invalid aspect "${spec.aspect}"`);
  if (!Number.isFinite(spec.durationInSeconds) || spec.durationInSeconds <= 0) problems.push(`${rel(p.spec)}: invalid durationInSeconds`);
  if (!fs.existsSync(p.scene)) problems.push(`${rel(p.dir)}: Scene.tsx missing`);
  else if (!/export\s+const\s+Scene\b/.test(fs.readFileSync(p.scene, "utf-8")))
    problems.push(`${rel(p.scene)}: "export const Scene" not found (required for registry import)`);
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
  console.error(`\x1b[31m\x1b[1m[REGISTRY] ${problems.length} issues:\x1b[0m\n- ${problems.join("\n- ")}`);
  process.exit(1);
}

const body = `// AUTO-GENERATED: scripts/gen-registry.mjs — do not edit manually.
import type { FC } from 'react';
${entries.map((e) => `import { Scene as Scene_${e.ident} } from './${e.slug}/Scene';`).join("\n")}

export type ProjectAspect = '9:16' | '16:9' | '1:1';
export type ProjectMode = 'cinematic-world' | 'editorial-ui' | 'kinetic-poster' | 'creative-motion-reel' | 'hybrid-orchestrated';

export interface ProjectEntry {
  slug: string;
  title: string;
  mode: ProjectMode;
  aspect: ProjectAspect;
  fps: number;
  durationInFrames: number;
  width: number;
  height: number;
  Scene: FC<any>;
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
console.log(`[REGISTRY] ${entries.length} projects: ${entries.map((e) => e.slug).join(", ") || "(none)"}${prev === body ? " (up to date)" : " (written)"}`);
