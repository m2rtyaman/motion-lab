import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const framesDir = path.join(rootDir, "out", "frames");
if (!fs.existsSync(framesDir)) {
  fs.mkdirSync(framesDir, { recursive: true });
}

// 4 Representative Keyframes across 360-frame (6.0s) timeline:
// 45 (0.75s - Run in), 130 (2.16s - Roar 1), 210 (3.5s - Depth Run), 285 (4.75s - Roar 2)
const targetFrames = [45, 130, 210, 285];

console.log("\n====================================================");
console.log("   VISUAL SELF-AUDIT CONTACT-SHEET GENERATOR V2.0   ");
console.log("====================================================");

for (let i = 0; i < targetFrames.length; i++) {
  const frame = targetFrames[i];
  const outputPath = path.join(framesDir, `frame-${frame}.png`);
  process.stdout.write(`[${i + 1}/${targetFrames.length}] Kare ${frame} render ediliyor... `);
  execSync(
    `npx remotion still src/remotion/index.ts RepoNews-9x16 "${outputPath}" --frame=${frame} --gl=angle`,
    { cwd: rootDir, stdio: "pipe" }
  );
  console.log(`✓`);
}

// Stitch 4 frames into a single 2x2 Visual Audit Grid (1080x1920 total, each quadrant 540x960)
const quadW = 540;
const quadH = 960;
const gridPng = new PNG({ width: quadW * 2, height: quadH * 2 });

targetFrames.forEach((frame, idx) => {
  const fileBuf = fs.readFileSync(path.join(framesDir, `frame-${frame}.png`));
  const srcPng = PNG.sync.read(fileBuf);

  const col = idx % 2;
  const row = Math.floor(idx / 2);
  const offsetX = col * quadW;
  const offsetY = row * quadH;

  for (let y = 0; y < quadH; y++) {
    for (let x = 0; x < quadW; x++) {
      const srcX = Math.min(srcPng.width - 1, Math.floor((x / quadW) * srcPng.width));
      const srcY = Math.min(srcPng.height - 1, Math.floor((y / quadH) * srcPng.height));
      const srcIdx = (srcPng.width * srcY + srcX) << 2;
      const dstIdx = (gridPng.width * (offsetY + y) + (offsetX + x)) << 2;

      gridPng.data[dstIdx] = srcPng.data[srcIdx];
      gridPng.data[dstIdx + 1] = srcPng.data[srcIdx + 1];
      gridPng.data[dstIdx + 2] = srcPng.data[srcIdx + 2];
      gridPng.data[dstIdx + 3] = 255;
    }
  }
});

const gridOutPath = path.join(rootDir, "out", "visual-audit-grid.png");
fs.writeFileSync(gridOutPath, PNG.sync.write(gridPng));
console.log(`\n[GÖRSEL ÖZ-DENETİM PAFTASI HAZIR] -> out/visual-audit-grid.png\n`);
