import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { PNG } from "pngjs";
import { parseArgs, resolveProject, rel, rootDir, buildCss } from "./lib/projects.mjs";
import { writeRenderManifest, manifestPathFor } from "./lib/render-manifest.mjs";

/**
 * POSE-TO-POSE: render the key pose (still) at the start and the end of every beat, then a labeled grid.
 *
 * Workflow: write the storyboard (spec.json beats[].board) -> build the static layout -> pnpm render:poses -> check the
 * poses against the board (focal in its zone, text readable, story order) -> only then add motion.
 *
 * Usage:
 *   node scripts/render-poses.mjs --project <slug> [--scale 0.5]
 * Output:
 *   out/<slug>/poses/<beat>-start.png, <beat>-end.png   (one still per key pose)
 *   out/<slug>/poses/poses-grid.png                      (rows = beats, columns = start | end, labeled, 3x3 zone marked)
 *   out/<slug>/poses/manifest.json
 * Set REMOTION_BROWSER_EXECUTABLE=<path to chrome/edge> to avoid the Chrome Headless Shell download.
 */

const argv = process.argv.slice(2);
const args = parseArgs(argv);
const scaleIdx = argv.indexOf("--scale");
const SCALE = scaleIdx >= 0 ? Math.min(1, Math.max(0.1, Number(argv[scaleIdx + 1]) || 0.5)) : 0.5;
const project = resolveProject(args);
const spec = JSON.parse(fs.readFileSync(project.spec, "utf-8").replace(/^﻿/, ""));
const posesDir = path.join(project.outDir, "poses");
const totalFrames = Math.round(spec.durationInSeconds * (spec.fps ?? 60));
const [aw, ah] = String(spec.aspect ?? "16:9").split(":").map(Number);
const TILE_W = aw > ah ? 480 : aw < ah ? 270 : 360;
const TILE_H = aw > ah ? 270 : aw < ah ? 480 : 360;
const LABEL_H = 22, GAP = 6;

const ZONES = ["top-left", "top-center", "top-right", "middle-left", "middle-center", "middle-right", "bottom-left", "bottom-center", "bottom-right"];
const ALIAS = { center: "middle-center", top: "top-center", bottom: "bottom-center", left: "middle-left", right: "middle-right", middle: "middle-center" };
const zoneIndex = (z) => {
  const s = String(z ?? "").toLowerCase();
  const n = ZONES.includes(s) ? s : ALIAS[s];
  return n ? ZONES.indexOf(n) : -1;
};

const poses = [];
for (const b of spec.beats) {
  poses.push({ beat: b.id, kind: "start", frame: Math.min(b.startFrame, totalFrames - 1), board: b.board });
  poses.push({ beat: b.id, kind: "end", frame: Math.min(b.endFrame, totalFrames - 1), board: b.board });
}
const fileOf = (p) => path.join(posesDir, `${p.beat}-${p.kind}.png`);

buildCss();
fs.rmSync(posesDir, { recursive: true, force: true });
fs.mkdirSync(posesDir, { recursive: true });

console.log(`\nPOSE-TO-POSE [${project.slug}] - ${poses.length} key poses, ${spec.beats.length} beats`);
console.log("Bundling Remotion (one-time bundle)...");
const bundleLocation = await bundle({ entryPoint: path.resolve(rootDir, "src/remotion/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const composition = await selectComposition({ serveUrl: bundleLocation, id: project.slug, browserExecutable });

let done = 0;
for (const p of poses) {
  await renderStill({ composition, serveUrl: bundleLocation, output: fileOf(p), frame: p.frame, scale: SCALE, browserExecutable, chromiumOptions: { gl: "angle" } });
  process.stdout.write(`\r  render: ${++done}/${poses.length} (${p.beat} ${p.kind}, frame ${p.frame})`);
}
console.log();

/* ---------- labeled grid (5x7 bitmap font, uppercase) ---------- */

const FONT = {
  A: "01110 10001 10001 11111 10001 10001 10001", B: "11110 10001 10001 11110 10001 10001 11110", C: "01110 10001 10000 10000 10000 10001 01110",
  D: "11110 10001 10001 10001 10001 10001 11110", E: "11111 10000 10000 11110 10000 10000 11111", F: "11111 10000 10000 11110 10000 10000 10000",
  G: "01110 10001 10000 10111 10001 10001 01111", H: "10001 10001 10001 11111 10001 10001 10001", I: "01110 00100 00100 00100 00100 00100 01110",
  J: "00111 00010 00010 00010 00010 10010 01100", K: "10001 10010 10100 11000 10100 10010 10001", L: "10000 10000 10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10101 10001 10001 10001", N: "10001 11001 10101 10011 10001 10001 10001", O: "01110 10001 10001 10001 10001 10001 01110",
  P: "11110 10001 10001 11110 10000 10000 10000", Q: "01110 10001 10001 10001 10101 10010 01101", R: "11110 10001 10001 11110 10100 10010 10001",
  S: "01111 10000 10000 01110 00001 00001 11110", T: "11111 00100 00100 00100 00100 00100 00100", U: "10001 10001 10001 10001 10001 10001 01110",
  V: "10001 10001 10001 10001 10001 01010 00100", W: "10001 10001 10001 10101 10101 11011 10001", X: "10001 10001 01010 00100 01010 10001 10001",
  Y: "10001 10001 01010 00100 00100 00100 00100", Z: "11111 00001 00010 00100 01000 10000 11111",
  0: "01110 10001 10011 10101 11001 10001 01110", 1: "00100 01100 00100 00100 00100 00100 01110", 2: "01110 10001 00001 00010 00100 01000 11111",
  3: "11110 00001 00001 01110 00001 00001 11110", 4: "00010 00110 01010 10010 11111 00010 00010", 5: "11111 10000 11110 00001 00001 10001 01110",
  6: "00110 01000 10000 11110 10001 10001 01110", 7: "11111 00001 00010 00100 01000 01000 01000", 8: "01110 10001 10001 01110 10001 10001 01110",
  9: "01110 10001 10001 01111 00001 00010 01100",
  " ": "00000 00000 00000 00000 00000 00000 00000", ".": "00000 00000 00000 00000 00000 01100 01100", "-": "00000 00000 00000 11111 00000 00000 00000",
  ":": "00000 01100 01100 00000 01100 01100 00000", _: "00000 00000 00000 00000 00000 00000 11111", "/": "00001 00001 00010 00100 01000 10000 10000",
  "#": "01010 01010 11111 01010 11111 01010 01010", "+": "00000 00100 00100 11111 00100 00100 00000", ",": "00000 00000 00000 00000 01100 00100 01000",
};

function fillRect(png, x, y, w, h, [r, g, b]) {
  for (let yy = Math.max(0, y); yy < Math.min(png.height, y + h); yy++)
    for (let xx = Math.max(0, x); xx < Math.min(png.width, x + w); xx++) {
      const i = (yy * png.width + xx) * 4;
      png.data[i] = r; png.data[i + 1] = g; png.data[i + 2] = b; png.data[i + 3] = 255;
    }
}
function drawText(png, text, x, y, color, px = 2, maxW = Infinity) {
  let cx = x;
  for (const ch of String(text).toUpperCase()) {
    const rows = (FONT[ch] ?? FONT[" "]).split(" ");
    if (cx + 6 * px > x + maxW) break;
    rows.forEach((row, ry) => [...row].forEach((bit, rx) => { if (bit === "1") fillRect(png, cx + rx * px, y + ry * px, px, px, color); }));
    cx += 6 * px;
  }
}
function outline(png, x, y, w, h, color, t = 2) {
  fillRect(png, x, y, w, t, color); fillRect(png, x, y + h - t, w, t, color);
  fillRect(png, x, y, t, h, color); fillRect(png, x + w - t, y, t, h, color);
}

const COLS = 2;
const rowH = LABEL_H + TILE_H + GAP;
const grid = new PNG({ width: COLS * TILE_W + (COLS + 1) * GAP, height: spec.beats.length * rowH + GAP });
fillRect(grid, 0, 0, grid.width, grid.height, [24, 24, 28]);

spec.beats.forEach((b, row) => {
  for (let c = 0; c < COLS; c++) {
    const p = poses[row * 2 + c];
    const src = PNG.sync.read(fs.readFileSync(fileOf(p)));
    const ox = GAP + c * (TILE_W + GAP), oy = GAP + row * rowH + LABEL_H;
    for (let y = 0; y < TILE_H; y++)
      for (let x = 0; x < TILE_W; x++) {
        const sx = Math.min(src.width - 1, Math.floor((x * src.width) / TILE_W)), sy = Math.min(src.height - 1, Math.floor((y * src.height) / TILE_H));
        const si = (sy * src.width + sx) * 4, di = ((oy + y) * grid.width + ox + x) * 4;
        grid.data[di] = src.data[si]; grid.data[di + 1] = src.data[si + 1]; grid.data[di + 2] = src.data[si + 2]; grid.data[di + 3] = 255;
      }
    // 3x3 zone guides, the board zone highlighted
    const cw = TILE_W / 3, ch = TILE_H / 3;
    for (let k = 1; k < 3; k++) { fillRect(grid, Math.round(ox + k * cw), oy, 1, TILE_H, [255, 255, 255]); fillRect(grid, ox, Math.round(oy + k * ch), TILE_W, 1, [255, 255, 255]); }
    const zi = zoneIndex(p.board?.zone);
    if (zi >= 0) outline(grid, Math.round(ox + (zi % 3) * cw), Math.round(oy + Math.floor(zi / 3) * ch), Math.round(cw), Math.round(ch), [255, 64, 160]);
    const label = `${p.beat} ${p.kind} F${p.frame}${p.board?.focal ? ` ${p.board.focal}` : ""}${p.board?.zone ? ` ${p.board.zone}` : ""}`;
    drawText(grid, label, ox + 2, oy - LABEL_H + 4, p.kind === "start" ? [120, 220, 255] : [255, 210, 90], 2, TILE_W - 4);
  }
});

const gridPath = path.join(posesDir, "poses-grid.png");
fs.writeFileSync(gridPath, PNG.sync.write(grid));
fs.writeFileSync(path.join(posesDir, "manifest.json"), JSON.stringify({
  project: project.slug, scale: SCALE, layout: { cols: COLS, rows: spec.beats.length, tile: `${TILE_W}x${TILE_H}`, order: "row per beat: start | end" },
  poses: poses.map((p) => ({ beat: p.beat, kind: p.kind, frame: p.frame, file: rel(fileOf(p)), focal: p.board?.focal ?? null, zone: p.board?.zone ?? null, expected: p.board ? p.board[p.kind] ?? null : null })),
}, null, 2));

writeRenderManifest({ manifestFile: manifestPathFor(project.slug), slug: project.slug, projectDir: project.dir, kind: "poses", imageFile: gridPath, tool: "scripts/render-poses.mjs", extra: { scale: SCALE } });
console.log(`Manifest: ${rel(manifestPathFor(project.slug))} (signed: image + project source + harness lock)`);
console.log(`Poses : ${rel(posesDir)}/<beat>-start|end.png`);
console.log(`Grid  : ${rel(gridPath)} (rows = beats, left = start, right = end; pink cell = board zone)`);
for (const b of spec.beats) if (b.board) console.log(`  ${b.id.padEnd(12)} start: ${b.board.start}\n  ${"".padEnd(12)} end  : ${b.board.end}`);
console.log(`Review: open the grid and check each pose against its board (focal in its zone, text readable, cause before effect), then add motion.\n`);
