/**
 * Contact sheet for ANY folder holding spec.json + Scene.tsx (an eval reference solution, a fixture), without touching the project registry.
 * Same sampling plan and tile layout as scripts/contact-sheet.mjs, so a candidate sheet and a reference sheet can be compared side by side.
 * A throw-away Remotion entry (out/ref-sheets/<id>/entry.tsx) registers only this Scene, the way scripts/browser-probe.mjs does.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { PNG } from "pngjs";
import { rootDir, buildCss, ASPECT_DIMS } from "./projects.mjs";
import { writeRenderManifest, MANIFEST_NAME } from "./render-manifest.mjs";

export const SHEET_VERSION = 1; // bump when the sampling plan or tile layout changes (invalidates cached reference sheets)
const posix = (p) => p.replaceAll("\\", "/");
const MAX_FRAMES = 16, COLS = 4;

/** Frames to sample: the same plan as contact-sheet.mjs (beat start+3, end-3, middle of long beats, spec "samples"). */
export function samplePlan(spec) {
  const fps = Number(spec.fps) || 60, total = Math.round(spec.durationInSeconds * fps);
  const plan = [];
  for (const b of spec.beats ?? []) {
    const len = b.endFrame - b.startFrame;
    const picks = new Set([b.startFrame + 3, b.endFrame - 3]);
    if (b.action === "shout" || b.action === "stamp") picks.add(b.startFrame + Math.min(12, Math.max(3, Math.floor(len / 2))));
    else if (len > 40) picks.add(Math.round((b.startFrame + b.endFrame) / 2));
    if (Array.isArray(b.samples)) b.samples.forEach((f) => { if (Number.isInteger(f) && f >= b.startFrame && f <= b.endFrame) picks.add(f); });
    [...picks].sort((a, c) => a - c).forEach((f) => plan.push(Math.max(0, Math.min(f, total - 1))));
  }
  let frames = [...new Set(plan)];
  if (frames.length > MAX_FRAMES) {
    const step = (frames.length - 1) / (MAX_FRAMES - 1);
    frames = Array.from({ length: MAX_FRAMES }, (_, i) => frames[Math.round(i * step)]);
  }
  return frames;
}

/** SHA-256 over every source file of a folder (sorted), so a cached sheet is reused only while the solution is unchanged. */
export function folderHash(dir) {
  const h = crypto.createHash("sha256");
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).forEach((e) => {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full);
    else { h.update(`${posix(path.relative(dir, full))}\0`); h.update(fs.readFileSync(full).toString("utf-8").replace(/^﻿/, "").replace(/\r\n/g, "\n")); }
  });
  walk(dir);
  h.update(`v${SHEET_VERSION}`);
  return h.digest("hex");
}

/**
 * Renders the sheet. Returns { grid, framesDir, frames }.
 * @param {{dir: string, outDir: string, id?: string, log?: (m: string) => void}} o
 */
export async function renderSheet({ dir, outDir, id = "sheet", log = () => {} }) {
  const spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf-8").replace(/^﻿/, ""));
  const fps = Number(spec.fps) || 60, total = Math.round(spec.durationInSeconds * fps);
  const [width, height] = ASPECT_DIMS[spec.aspect] ?? [1920, 1080];
  const work = path.join(rootDir, "out", "ref-sheets", crypto.createHash("sha1").update(dir).digest("hex").slice(0, 10));
  fs.mkdirSync(work, { recursive: true });
  const framesDir = path.join(outDir, "frames");
  fs.rmSync(framesDir, { recursive: true, force: true });
  fs.mkdirSync(framesDir, { recursive: true });

  log("compiling Tailwind...");
  buildCss();
  const entry = path.join(work, "entry.tsx");
  fs.writeFileSync(entry, `import React from "react";
import { registerRoot, Composition } from "remotion";
import * as SceneModule from "${posix(path.join(dir, "Scene"))}";
import "${posix(path.join(rootDir, "src", "output.css"))}";
const Scene: any = (SceneModule as any).Scene ?? (SceneModule as any).default;
const Root = () => <Composition id="${id}" component={Scene} durationInFrames={${total}} fps={${fps}} width={${width}} height={${height}} defaultProps={{ aspect: ${JSON.stringify(spec.aspect ?? "16:9")} }} />;
registerRoot(Root);
`);
  const { bundle } = await import("@remotion/bundler");
  const { renderStill, selectComposition } = await import("@remotion/renderer");
  log("bundling...");
  const origLog = console.log;
  console.log = (...a) => console.error(...a);
  let serveUrl;
  try { serveUrl = await bundle({ entryPoint: entry, outDir: path.join(work, "bundle"), publicDir: path.join(rootDir, "public"), enableCaching: true }); } finally { console.log = origLog; }
  const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const frames = samplePlan(spec);
  const fileOf = (f) => path.join(framesDir, `f${String(f).padStart(3, "0")}.png`);
  let n = 0;
  for (const frame of frames) {
    await renderStill({ composition, serveUrl, output: fileOf(frame), frame, scale: 0.5, browserExecutable, chromiumOptions: { gl: "angle" } });
    log(`frame ${frame} (${++n}/${frames.length})`);
  }

  const landscape = spec.aspect === "16:9", square = spec.aspect === "1:1";
  const TILE_W = landscape ? 480 : square ? 360 : 270, TILE_H = landscape ? 270 : square ? 360 : 480;
  const rows = Math.ceil(frames.length / COLS);
  const grid = new PNG({ width: TILE_W * COLS, height: TILE_H * rows });
  for (let i = 0; i < grid.data.length; i += 4) { grid.data[i] = grid.data[i + 1] = grid.data[i + 2] = 0; grid.data[i + 3] = 255; }
  frames.forEach((frame, idx) => {
    const src = PNG.sync.read(fs.readFileSync(fileOf(frame)));
    const ox = (idx % COLS) * TILE_W, oy = Math.floor(idx / COLS) * TILE_H;
    for (let y = 0; y < TILE_H; y++) for (let x = 0; x < TILE_W; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / TILE_W)), sy = Math.min(src.height - 1, Math.floor((y * src.height) / TILE_H));
      const si = (sy * src.width + sx) * 4, di = ((oy + y) * grid.width + ox + x) * 4;
      grid.data[di] = src.data[si]; grid.data[di + 1] = src.data[si + 1]; grid.data[di + 2] = src.data[si + 2]; grid.data[di + 3] = 255;
    }
  });
  const gridFile = path.join(outDir, "visual-audit-grid.png");
  fs.writeFileSync(gridFile, PNG.sync.write(grid));
  writeRenderManifest({ manifestFile: path.join(outDir, MANIFEST_NAME), slug: id, projectDir: dir, kind: "contactSheet", imageFile: gridFile, tool: "scripts/lib/render-sheet.mjs" });
  fs.rmSync(path.join(work, "bundle"), { recursive: true, force: true });
  return { grid: gridFile, framesDir, frames };
}
