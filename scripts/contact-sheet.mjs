import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { PNG } from "pngjs";
import { parseArgs, resolveProject, rel, rootDir, buildCss } from "./lib/projects.mjs";

/**
 * VISION LOOP v3 (Çok Projeli)
 * - Örnekleme projenin spec.json beat'lerinden türetilir.
 * - Kareler tek seferlik derlenen bundle üzerinden hızlıca render edilir.
 * - Çıktı: out/<slug>/visual-audit-grid.png + out/<slug>/vision/manifest.json
 * - Kare-farkı (frame-diff) metriği: beat içinde hareket yoksa hata raporlar.
 *
 * Kullanım:
 *   node scripts/contact-sheet.mjs [--project <slug>]
 */

const args = parseArgs();
const project = resolveProject(args);
const spec = JSON.parse(fs.readFileSync(project.spec, "utf-8").replace(/^\uFEFF/, ""));

const framesDir = path.join(project.visionDir, "frames");
const COMP_ID = project.slug;
const is16by9 = spec.aspect === "16:9";
const MAX_FRAMES = 16, COLS = 4;
const TILE_W = is16by9 ? 480 : 270;
const TILE_H = is16by9 ? 270 : 480;
const MIN_MOTION = 0.8;

// CSS güncelliğini garanti et
buildCss();

// ---- Örnekleme Planı ----
const plan = [];
for (const b of spec.beats) {
  const len = b.endFrame - b.startFrame;
  const picks = new Set([b.startFrame + 3, b.endFrame - 3]);
  if (b.action === "shout" || b.action === "stamp") {
    picks.add(b.startFrame + Math.min(12, Math.max(3, Math.floor(len / 2))));
  } else if (len > 40) {
    picks.add(Math.round((b.startFrame + b.endFrame) / 2));
  }
  [...picks].sort((a, c) => a - c).forEach((f) => {
    plan.push({
      frame: Math.max(0, Math.min(f, spec.durationInSeconds * 60 - 1)),
      beat: b.id,
    });
  });
}

const frames = plan.slice(0, MAX_FRAMES);

if (fs.existsSync(project.visionDir)) {
  fs.rmSync(project.visionDir, { recursive: true, force: true });
}
fs.mkdirSync(framesDir, { recursive: true });

const fileOf = (f) => path.join(framesDir, `f${String(f).padStart(3, "0")}.png`);

console.log(`\nVISION LOOP v3 [${project.slug}] — ${frames.length} kare, ${spec.beats.length} beat`);
console.log("Remotion paketi derleniyor (tek seferlik bundle)...");
const bundleLocation = await bundle({ entryPoint: path.resolve(rootDir, "src/remotion/index.ts") });
const composition = await selectComposition({ serveUrl: bundleLocation, id: COMP_ID });

let done = 0;
for (const item of frames) {
  await renderStill({
    composition,
    serveUrl: bundleLocation,
    output: fileOf(item.frame),
    frame: item.frame,
    scale: 0.5,
    chromiumOptions: { gl: "angle" },
  });
  process.stdout.write(`\r  render: ${++done}/${frames.length} (kare ${item.frame})`);
}
console.log();

// ---- Izgara Birleştirme & Hareket Analizi ----
const load = (f) => PNG.sync.read(fs.readFileSync(fileOf(f)));
const rows = Math.ceil(frames.length / COLS);
const grid = new PNG({ width: TILE_W * COLS, height: TILE_H * rows });
grid.data.fill(0);
for (let i = 3; i < grid.data.length; i += 4) grid.data[i] = 255;

const smallGray = (png) => {
  const w = Math.floor(png.width / 4);
  const h = Math.floor(png.height / 4);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * 4 * png.width + x * 4) * 4;
      out[y * w + x] = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
    }
  }
  return out;
};

const meanAbsDiff = (a, b) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i] - b[i]);
  return s / a.length;
};

const grays = [];
frames.forEach((item, idx) => {
  const src = load(item.frame);
  grays.push(smallGray(src));
  const ox = (idx % COLS) * TILE_W;
  const oy = Math.floor(idx / COLS) * TILE_H;
  for (let y = 0; y < TILE_H; y++) {
    for (let x = 0; x < TILE_W; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / TILE_W));
      const sy = Math.min(src.height - 1, Math.floor((y * src.height) / TILE_H));
      const si = (sy * src.width + sx) * 4;
      const di = ((oy + y) * grid.width + ox + x) * 4;
      grid.data[di] = src.data[si];
      grid.data[di + 1] = src.data[si + 1];
      grid.data[di + 2] = src.data[si + 2];
      grid.data[di + 3] = 255;
    }
  }
});

fs.mkdirSync(project.outDir, { recursive: true });
fs.writeFileSync(project.grid, PNG.sync.write(grid));

const beatReports = spec.beats.map((b) => {
  const idxs = frames.map((f, i) => (f.beat === b.id ? i : -1)).filter((i) => i >= 0);
  const diffs = [];
  for (let k = 1; k < idxs.length; k++) {
    diffs.push(+meanAbsDiff(grays[idxs[k - 1]], grays[idxs[k]]).toFixed(2));
  }
  const motion = diffs.length ? Math.max(...diffs) : 0;
  return {
    beat: b.id,
    frames: idxs.map((i) => frames[i].frame),
    diffs,
    motion,
    static: motion < MIN_MOTION,
  };
});

const manifest = {
  project: project.slug,
  generatedAt: new Date().toISOString(),
  spec: rel(project.spec),
  layout: { cols: COLS, rows, tile: `${TILE_W}x${TILE_H}`, order: "row-major" },
  frames: frames.map((f, i) => ({ index: i, ...f })),
  beats: beatReports,
  minMotion: MIN_MOTION,
};

fs.writeFileSync(project.manifest, JSON.stringify(manifest, null, 2));

console.log(`Izgara Paftası : ${rel(project.grid)} (${COLS}x${rows}, soldan sağa)`);
console.log(`Kare Manifest  : ${rel(project.manifest)}`);
beatReports.forEach((r) =>
  console.log(`  ${r.static ? "⚠ STATİK BEAT" : "✓"} ${r.beat.padEnd(12)} kareler: [${r.frames.join(", ")}] fark: [${r.diffs.join(", ")}]`)
);
console.log(`İnceleme: out/${project.slug}/visual-audit-grid.png dosyasını açıp değerlendir.\n`);
