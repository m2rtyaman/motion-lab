/**
 * COMPONENT GALLERY RENDERER
 *
 * Renders one still per page of src/projects/zz-gallery (end of each beat), then crops every tile listed in
 * src/projects/zz-gallery/manifest.json into a small PNG thumbnail.
 *
 * Usage:
 *   node scripts/gallery.mjs                 render pages -> out/zz-gallery/gallery/page-N.png
 *   node scripts/gallery.mjs --thumbs        also write docs/gallery/<Primitive>.png (<= 640 px wide, <= 60 KB)
 *   node scripts/gallery.mjs --only A,B      thumbnails only for those primitive ids
 * Set REMOTION_BROWSER_EXECUTABLE=<chrome/edge path> to avoid the Chrome Headless Shell download.
 */
import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { PNG } from "pngjs";
import { rootDir, buildCss } from "./lib/projects.mjs";

const argv = process.argv.slice(2);
const THUMBS = argv.includes("--thumbs");
const onlyIdx = argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? new Set(argv[onlyIdx + 1].split(",")) : null;
const SLUG = "zz-gallery";
const dir = path.join(rootDir, "src", "projects", SLUG);
const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json"), "utf-8"));
const spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf-8"));
const outDir = path.join(rootDir, "out", SLUG, "gallery");
const thumbDir = path.join(rootDir, "docs", "gallery");
const MAX_W = 640, MAX_BYTES = 60 * 1024;

fs.mkdirSync(outDir, { recursive: true });
buildCss();
const serveUrl = await bundle({ entryPoint: path.resolve(rootDir, "src/remotion/index.ts") });
const browserExecutable = process.env.REMOTION_BROWSER_EXECUTABLE || undefined;
const composition = await selectComposition({ serveUrl, id: SLUG, browserExecutable });
const pageFile = (i) => path.join(outDir, `page-${i}.png`);
for (let i = 0; i < spec.beats.length; i++) {
  await renderStill({ composition, serveUrl, output: pageFile(i), frame: Math.min(spec.beats[i].endFrame, composition.durationInFrames - 1), browserExecutable, chromiumOptions: { gl: "angle" } });
  console.log(`page ${i} (${manifest.pages[i]}) rendered at frame ${spec.beats[i].endFrame}`);
}

/** Crop + box-downsample (+ optional colour posterising to keep the PNG small). */
function thumb(png, x, y, w, h, outW, levels) {
  const outH = Math.round((h * outW) / w);
  const out = new PNG({ width: outW, height: outH });
  const sx = w / outW, sy = h / outH;
  const q = levels ? 255 / (levels - 1) : 0;
  for (let oy = 0; oy < outH; oy++) for (let ox = 0; ox < outW; ox++) {
    const x0 = Math.floor(x + ox * sx), x1 = Math.max(x0 + 1, Math.floor(x + (ox + 1) * sx));
    const y0 = Math.floor(y + oy * sy), y1 = Math.max(y0 + 1, Math.floor(y + (oy + 1) * sy));
    let r = 0, g = 0, b = 0, n = 0;
    for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) { const i = (yy * png.width + xx) * 4; r += png.data[i]; g += png.data[i + 1]; b += png.data[i + 2]; n++; }
    const o = (oy * outW + ox) * 4;
    const f = (v) => { const a = v / n; return q ? Math.round(Math.round(a / q) * q) : Math.round(a); };
    out.data[o] = f(r); out.data[o + 1] = f(g); out.data[o + 2] = f(b); out.data[o + 3] = 255;
  }
  return out;
}

if (THUMBS) {
  fs.mkdirSync(thumbDir, { recursive: true });
  const pages = manifest.pages.map((_, i) => PNG.sync.read(fs.readFileSync(pageFile(i))));
  for (const t of manifest.tiles) {
    if (ONLY && !ONLY.has(t.id)) continue;
    let buf = null, w = MAX_W;
    for (const levels of [0, 48, 32, 24, 16]) {
      for (w = MAX_W; w >= 400; w -= 40) {
        buf = PNG.sync.write(thumb(pages[t.page], t.x, t.y, t.thumbW ?? t.w, t.h, w, levels), { colorType: 2, deflateLevel: 9 });
        if (buf.length <= MAX_BYTES) break;
      }
      if (buf.length <= MAX_BYTES) break;
    }
    fs.writeFileSync(path.join(thumbDir, `${t.id}.png`), buf);
    console.log(`thumb ${t.id}.png ${w}px ${(buf.length / 1024).toFixed(1)}KB`);
  }
}
