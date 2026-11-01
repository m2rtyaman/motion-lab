import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

/**
 * Ortak proje yardımcıları (Faz 6). Tüm script'ler proje yollarını BURADAN alır; hiçbir script
 * proje adı/yolu sabit kodlamaz. Tek doğruluk kaynağı: src/projects/<slug>/spec.json
 */
export const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const projectsDir = path.join(rootDir, "src", "projects");
export const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
/** Paylaşılan motor klasörleri (tüm projelerin bağımlı olduğu kod) */
export const ENGINE_DIRS = ["engine", "core", "primitives", "world", "vfx", "archetypes", "remotion"];
export const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster"];
export const ASPECT_DIMS = { "9:16": [1080, 1920], "16:9": [1920, 1080] };

export const rel = (p) => path.relative(rootDir, p).replaceAll("\\", "/");

export function listProjects() {
  if (!fs.existsSync(projectsDir)) return [];
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && fs.existsSync(path.join(projectsDir, e.name, "spec.json")))
    .map((e) => e.name)
    .sort();
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
  console.error(`\x1b[31m\x1b[1m[PROJE]\x1b[0m ${msg}`);
  process.exit(1);
};

/** Tek proje çöz: --project verilmişse onu; yoksa projeler arasında tek varsa onu; aksi halde hata. */
export function resolveProject(args = parseArgs()) {
  const all = listProjects();
  let slug = args.project;
  if (!slug) {
    if (all.length === 1) slug = all[0];
    else die(`Birden fazla proje var (${all.join(", ") || "yok"}). --project <slug> ver. Yeni proje: pnpm new <slug>`);
  }
  if (!SLUG_RE.test(slug)) die(`Geçersiz slug "${slug}" (küçük harf, rakam, tire).`);
  if (!all.includes(slug)) die(`Proje bulunamadı: "${slug}". Mevcut: ${all.join(", ") || "yok"}. Oluştur: pnpm new ${slug}`);
  return projectPaths(slug);
}

/** Çoklu hedef: --project verilmişse tek proje, yoksa tüm projeler. */
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

/** Lint/hash kapsamı: paylaşılan motor + seçilen projelerin klasörleri (başka proje etkilemez). */
export function scopeDirs(targets) {
  return [...ENGINE_DIRS.map((d) => path.join(rootDir, "src", d)), ...targets.map((t) => t.dir)];
}

export function buildCss() {
  const r = spawnSync("npx", ["@tailwindcss/cli", "-i", "src/index.css", "-o", "src/output.css"], {
    cwd: rootDir,
    stdio: "pipe",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) die(`Tailwind CSS derlenemedi:\n${r.stdout}${r.stderr}`);
}

export function runNode(script, args = [], inherit = false) {
  const r = spawnSync(process.execPath, [path.join(rootDir, "scripts", script), ...args], {
    cwd: rootDir,
    encoding: "utf-8",
    stdio: inherit ? "inherit" : "pipe",
  });
  return { code: r.status ?? 1, out: `${r.stdout ?? ""}${r.stderr ?? ""}` };
}
