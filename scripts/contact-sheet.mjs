import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

/**
 * VISION LOOP v2 (Faz 3)
 * - Örnekleme motion-spec beat'lerinden türetilir (sabit kare listesi yok).
 * - Kareler paralel render edilir (yarım çözünürlük), tek ızgarada birleştirilir.
 * - Kare-farkı (frame-diff) metriği: beat içinde hareket yoksa HATA üretir.
 * - Çıktı: out/visual-audit-grid.png + out/vision/manifest.json (kare↔beat eşlemesi).
 */
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const specPath = path.resolve(rootDir, process.argv[2] ?? "specs/scene.motion-spec.json");
const framesDir = path.join(rootDir, "out", "vision", "frames");
const gridPath = path.join(rootDir, "out", "visual-audit-grid.png");
const manifestPath = path.join(rootDir, "out", "vision", "manifest.json");
const COMP_ID = process.env.COMP_ID ?? "RepoNews-9x16";
const MAX_FRAMES = 16, COLS = 4, TILE_W = 270, TILE_H = 480, CONCURRENCY = 4;
const MIN_MOTION = 0.8; // 0-255 ölçeğinde ardışık örnekler arası ortalama mutlak fark

const spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));

// ---- örnekleme planı ----
const plan = [];
for (const b of spec.beats) {
  const len = b.endFrame - b.startFrame;
  const picks = new Set([b.startFrame + 3, b.endFrame - 3]);
  if (b.action === "shout") picks.add(b.startFrame + 12); // darbe tepe anı
  else if (len > 40) picks.add(Math.round((b.startFrame + b.endFrame) / 2));
  [...picks].sort((a, c) => a - c).forEach((f) => plan.push({ frame: Math.min(f, spec.durationInSeconds * 60 - 1), beat: b.id }));
}
const frames = plan.slice(0, MAX_FRAMES);
fs.rmSync(path.join(rootDir, "out", "vision"), { recursive: true, force: true });
fs.mkdirSync(framesDir, { recursive: true });

const fileOf = (f) => path.join(framesDir, `f${String(f).padStart(3, "0")}.png`);
const renderOne = (f) =>
  new Promise((resolve, reject) => {
    const args = ["remotion", "still", "src/remotion/index.ts", COMP_ID, fileOf(f), `--frame=${f}`, "--scale=0.5", "--gl=angle"];
    const p = spawn("npx", args, { cwd: rootDir, shell: process.platform === "win32", stdio: "pipe" });
    let log = "";
    p.stdout.on("data", (d) => (log += d));
    p.stderr.on("data", (d) => (log += d));
    p.on("close", (c) => (c === 0 ? resolve() : reject(new Error(`kare ${f} render hatası:\n${log.slice(-600)}`))));
  });

console.log(`\nVISION LOOP v2 — ${frames.length} kare, ${spec.beats.length} beat, paralellik ${CONCURRENCY}`);
const queue = [...frames];
let done = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await renderOne(item.frame);
      process.stdout.write(`\r  render ${++done}/${frames.length}`);
    }
  })
);
console.log();

// ---- ızgara + metrik ----
const load = (f) => PNG.sync.read(fs.readFileSync(fileOf(f)));
const rows = Math.ceil(frames.length / COLS);
const grid = new PNG({ width: TILE_W * COLS, height: TILE_H * rows });
grid.data.fill(0);
for (let i = 3; i < grid.data.length; i += 4) grid.data[i] = 255;

const smallGray = (png) => {
  // 1/4 çözünürlük gri (kare farkı için)
  const w = Math.floor(png.width / 4), h = Math.floor(png.height / 4), out = new Float32Array(w * h);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((y * 4) * png.width + x * 4) * 4;
      out[y * w + x] = 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
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
  const ox = (idx % COLS) * TILE_W, oy = Math.floor(idx / COLS) * TILE_H;
  for (let y = 0; y < TILE_H; y++)
    for (let x = 0; x < TILE_W; x++) {
      const sx = Math.min(src.width - 1, Math.floor((x * src.width) / TILE_W));
      const sy = Math.min(src.height - 1, Math.floor((y * src.height) / TILE_H));
      const si = (sy * src.width + sx) * 4, di = ((oy + y) * grid.width + ox + x) * 4;
      grid.data[di] = src.data[si]; grid.data[di + 1] = src.data[si + 1]; grid.data[di + 2] = src.data[si + 2]; grid.data[di + 3] = 255;
    }
});
fs.writeFileSync(gridPath, PNG.sync.write(grid));

const beatReports = spec.beats.map((b) => {
  const idxs = frames.map((f, i) => (f.beat === b.id ? i : -1)).filter((i) => i >= 0);
  const diffs = [];
  for (let k = 1; k < idxs.length; k++) diffs.push(+meanAbsDiff(grays[idxs[k - 1]], grays[idxs[k]]).toFixed(2));
  const motion = diffs.length ? Math.max(...diffs) : 0;
  return { beat: b.id, frames: idxs.map((i) => frames[i].frame), diffs, motion, static: motion < MIN_MOTION };
});

const manifest = {
  generatedAt: new Date().toISOString(),
  spec: path.relative(rootDir, specPath).replaceAll("\\", "/"),
  layout: { cols: COLS, rows, tile: `${TILE_W}x${TILE_H}`, order: "row-major" },
  frames: frames.map((f, i) => ({ index: i, ...f })),
  beats: beatReports,
  minMotion: MIN_MOTION,
};
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`Izgara: ${path.relative(rootDir, gridPath)} (${COLS}x${rows}, sıra: soldan sağa, yukarıdan aşağı)`);
beatReports.forEach((r) =>
  console.log(`  ${r.static ? "⚠ STATİK" : "✓"} ${r.beat.padEnd(10)} kareler [${r.frames.join(", ")}] fark [${r.diffs.join(", ")}]`));
console.log(`Tek tek kareler: out/vision/frames/fNNN.png — notlarda kareleri "f130" biçiminde an.`);
