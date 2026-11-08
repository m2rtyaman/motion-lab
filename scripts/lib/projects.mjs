import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Shared project helpers (Phase 6). All scripts obtain project paths HERE;
 * no script hardcodes project slugs or paths. Single source of truth: src/projects/<slug>/spec.json
 */
export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const projectsDir = path.join(rootDir, "src", "projects");
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
/** Shared engine directories (code on which all projects depend) */
export const ENGINE_DIRS = ["engine", "core", "primitives", "world", "vfx", "archetypes", "remotion"];
export const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster", "creative-motion-reel", "hybrid-orchestrated"];
export const ASPECT_DIMS = { "9:16": [1080, 1920], "16:9": [1920, 1080], "1:1": [1440, 1440] };

export const rel = (p) => path.relative(rootDir, p).replaceAll("\\", "/");

function matchGlobPattern(pattern, target) {
  const clean = pattern.replace(/\/+$/, "").replace(/^\/+/, "");
  const escaped = clean
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");
  return new RegExp(`^${escaped}(/.*)?$`).test(target);
}

export function isProjectIgnored(slug) {
  try {
    const res = spawnSync("git", ["check-ignore", "-q", `src/projects/${slug}`], { cwd: rootDir });
    if (res.status === 0) return true;
  } catch {
    // Git binary not available or not inside git worktree; fallback to reading .gitignore
  }

  // Fallback: parse .gitignore directly
  const gitignorePath = path.join(rootDir, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    try {
      const lines = fs.readFileSync(gitignorePath, "utf-8").split(/\r?\n/);
      const targetRel = `src/projects/${slug}`;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        if (trimmed === targetRel || trimmed === `${targetRel}/`) return true;
        if (matchGlobPattern(trimmed, targetRel) || matchGlobPattern(trimmed, slug)) return true;
      }
    } catch {
      // Ignore read errors
    }
  }

  return false;
}

export function listProjects(options = {}) {
  const includeIgnored = options.includeIgnored ?? false;
  if (!fs.existsSync(projectsDir)) return [];
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((e) => {
      if (!e.isDirectory()) return false;
      if (!fs.existsSync(path.join(projectsDir, e.name, "spec.json"))) return false;
      if (!includeIgnored && isProjectIgnored(e.name)) return false;
      return true;
    })
    .map((e) => e.name)
    .sort();
}

/**
 * Harness v2 opt-in: spec.json has `"harness": 2`. Accepts a project object (reads project.spec),
 * a spec path string, or an already-parsed spec object. v2 projects are checked by behavior
 * (scripts/timeline-audit.mjs) instead of source-keyword audits.
 */
export function isHarnessV2(projectOrSpec) {
  try {
    let spec = projectOrSpec;
    if (typeof projectOrSpec === "string") spec = JSON.parse(fs.readFileSync(projectOrSpec, "utf-8").replace(/^﻿/, ""));
    else if (projectOrSpec && typeof projectOrSpec.spec === "string")
      spec = JSON.parse(fs.readFileSync(projectOrSpec.spec, "utf-8").replace(/^﻿/, ""));
    return spec?.harness === 2;
  } catch {
    return false;
  }
}

export function projectPaths(slug) {
  const dir = path.join(projectsDir, slug);
  const outDir = path.join(rootDir, "out", slug);
  return {
    slug,
    dir,
    spec: path.join(dir, "spec.json"),
    scene: path.join(dir, "Scene.tsx"),
    direction: path.join(dir, "direction.md"),
    notes: path.join(dir, "vision-notes.md"),
    outDir,
    grid: path.join(outDir, "visual-audit-grid.png"),
    visionDir: path.join(outDir, "vision"),
    manifest: path.join(outDir, "vision", "manifest.json"),
    video: path.join(outDir, `${slug}.mp4`),
    studioDir: path.join(rootDir, ".studio", slug),
  };
}

/** argv → { project, all, specOverride, positional } (--project x | -p x | --all | --spec file) */
export function parseArgs(argv = process.argv.slice(2)) {
  const out = { project: process.env.STUDIO_PROJECT, all: false, spec: undefined, positional: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--project" || a === "-p") out.project = argv[++i];
    else if (a.startsWith("--project=")) out.project = a.split("=")[1];
    else if (a === "--all") out.all = true;
    else if (a === "--spec") out.spec = argv[++i];
    else out.positional.push(a);
  }
  return out;
}

const die = (msg) => {
  console.error(`\x1b[31m\x1b[1m[PROJECT]\x1b[0m ${msg}`);
  process.exit(1);
};

/** Resolve single project: --project if provided; else if only one project exists, that one; else error. */
export function resolveProject(args = parseArgs()) {
  const all = listProjects();
  let slug = args.project;
  if (!slug) {
    if (all.length === 1) slug = all[0];
    else die(`Multiple projects found (${all.join(", ") || "none"}). Provide --project <slug>. New project: pnpm new <slug>`);
  }
  if (!SLUG_RE.test(slug)) die(`Invalid slug "${slug}" (lowercase letters, numbers, hyphens).`);
  if (!all.includes(slug)) die(`Project not found: "${slug}". Available: ${all.join(", ") || "none"}. Create: pnpm new ${slug}`);
  return projectPaths(slug);
}

/** Multi-target: single project if --project is provided, else all projects. */
export function resolveTargets(args = parseArgs()) {
  if (args.project) return [resolveProject(args)];
  return listProjects().map(projectPaths);
}

export function walk(dir, exts) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walk(full, exts);
    return exts.has(path.extname(e.name)) ? [full] : [];
  });
}

/** Lint/hash scope: shared engine + selected project directories (does not touch other projects). */
export function scopeDirs(targets) {
  return [...ENGINE_DIRS.map((d) => path.join(rootDir, "src", d)), ...targets.map((t) => t.dir)];
}

export function buildCss() {
  const r = spawnSync("npx", ["@tailwindcss/cli", "-i", "src/index.css", "-o", "src/output.css"], {
    cwd: rootDir,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) die(`Failed to compile Tailwind CSS:\n${r.stdout}${r.stderr}`);
}

export function runNode(script, args = [], inherit = false) {
  const r = spawnSync(process.execPath, [path.join(rootDir, "scripts", script), ...args], {
    cwd: rootDir,
    encoding: "utf-8",
    stdio: inherit ? "inherit" : "pipe",
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
