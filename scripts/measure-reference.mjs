#!/usr/bin/env node
/**
 * measure-reference.mjs — derive timing statistics from ONE reference video.
 *
 * Only numbers are emitted (no frames or media are written anywhere).
 * Frames are decoded in-memory through the ffmpeg bundled with Remotion
 * (or any ffmpeg on PATH) as downscaled grayscale PNGs piped to stdout.
 *
 *   node scripts/measure-reference.mjs <video.mp4> [--out result.json]
 *        [--width 192] [--still 0.3] [--min-hold 0.25] [--series] [--meta '{"category":"..."}']
 *
 * Output (JSON): native fps, duration, per-frame motion energy summary,
 * hard cuts + shot lengths, holds + final hold, motion events with
 * onset->peak vs peak->rest asymmetry, and approximate block-matching speed
 * normalised to px/frame at 1080 short-side and 60 fps.
 * Every duration is reported in seconds AND frames@60 ({ s, f60 }).
 *
 * Known limits: compression noise sets a floor on "still"; camera moves and
 * object moves are not separated (global = median over blocks, regional =
 * 80th percentile over blocks); speeds under ~2 px/frame@1080/60 are noisy.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ---------- args ----------
const argv = process.argv.slice(2);
const opt = { meta: null, width: 192, still: 0.3, minHold: 0.25, series: false, out: null };
let video = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--out') opt.out = argv[++i];
  else if (a === '--width') opt.width = +argv[++i];
  else if (a === '--still') opt.still = +argv[++i];
  else if (a === '--min-hold') opt.minHold = +argv[++i];
  else if (a === '--series') opt.series = true;
  else if (a === '--meta') opt.meta = JSON.parse(argv[++i]); // extra JSON merged under "meta" (category, credit, ...)
  else if (!a.startsWith('--')) video = a;
}
if (!video) {
  console.error('usage: node scripts/measure-reference.mjs <video> [--out file.json] [--width 192] [--still 0.3] [--min-hold 0.25] [--series]');
  process.exit(2);
}

// ---------- binaries ----------
function findBin(name) {
  const exe = process.platform === 'win32' ? `${name}.exe` : name;
  const rem = path.join(ROOT, 'node_modules', '@remotion');
  if (fs.existsSync(rem)) {
    for (const d of fs.readdirSync(rem)) {
      if (!d.startsWith('compositor-')) continue;
      const p = path.join(rem, d, exe);
      if (fs.existsSync(p)) return p;
    }
  }
  return name; // fall back to PATH
}
const FFMPEG = findBin('ffmpeg');
const FFPROBE = findBin('ffprobe');

// ---------- PNG decode (8-bit gray, non-interlaced) ----------
function splitPngs(buf) {
  const out = [];
  let p = 0;
  while (p + 8 <= buf.length) {
    if (buf[p] !== 137 || buf[p + 1] !== 80) { p++; continue; }
    let q = p + 8;
    while (q + 12 <= buf.length) {
      const len = buf.readUInt32BE(q);
      const t = buf.toString('latin1', q + 4, q + 8);
      q += 12 + len;
      if (t === 'IEND') break;
    }
    if (q > buf.length) break;
    out.push(buf.subarray(p, q));
    p = q;
  }
  return out;
}
function decodeGray(b) {
  let p = 8, w = 0, h = 0;
  const idat = [];
  while (p < b.length) {
    const len = b.readUInt32BE(p);
    const t = b.toString('latin1', p + 4, p + 8);
    const d = b.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); }
    else if (t === 'IDAT') idat.push(d);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (w + 1)];
    const s = y * (w + 1) + 1, o = y * w;
    for (let x = 0; x < w; x++) {
      const a = x ? out[o + x - 1] : 0;
      const u = y ? out[o - w + x] : 0;
      const c = x && y ? out[o - w + x - 1] : 0;
      let v = raw[s + x];
      if (f === 1) v += a;
      else if (f === 2) v += u;
      else if (f === 3) v += (a + u) >> 1;
      else if (f === 4) {
        const pp = a + u - c, pa = Math.abs(pp - a), pb = Math.abs(pp - u), pc = Math.abs(pp - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? u : c;
      }
      out[o + x] = v & 255;
    }
  }
  return { w, h, data: out };
}

// ---------- probe ----------
function probe(file) {
  const j = JSON.parse(execFileSync(FFPROBE, ['-v', 'error', '-select_streams', 'v:0', '-show_entries',
    'stream=width,height,avg_frame_rate,r_frame_rate,nb_frames,duration', '-of', 'json', file]).toString());
  const s = j.streams[0];
  const [n, d] = (s.avg_frame_rate !== '0/0' ? s.avg_frame_rate : s.r_frame_rate).split('/').map(Number);
  return { width: s.width, height: s.height, fps: n / d, duration: parseFloat(s.duration) };
}

// ---------- helpers ----------
const median = (a) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const pct = (a, q) => { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); const i = (s.length - 1) * q; const lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const r = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;

function main() {
  const meta = probe(video);
  const { fps } = meta;
  const aw = opt.width;
  const png = execFileSync(FFMPEG, ['-v', 'error', '-i', video, '-an', '-vf', `scale=${aw}:-2:flags=area`,
    '-pix_fmt', 'gray', '-fps_mode', 'passthrough', '-f', 'image2pipe', '-c:v', 'png', '-'], { maxBuffer: 1e9 });
  const frames = splitPngs(png).map(decodeGray);
  const N = frames.length;
  const W = frames[0].w, H = frames[0].h;
  const dur = N / fps;
  const T = (sec) => ({ s: r(sec), f60: r(sec * 60, 1) });
  const TL = (arr) => ({ s: arr.map((x) => r(x)), f60: arr.map((x) => r(x * 60, 1)) });

  // --- per-frame energy + correlation between consecutive frames ---
  const e = new Float64Array(N); // e[i] = diff(i-1 -> i); e[0]=0
  const corr = new Float64Array(N).fill(1);
  for (let i = 1; i < N; i++) {
    const a = frames[i - 1].data, b = frames[i].data;
    let sd = 0, sa = 0, sb = 0, saa = 0, sbb = 0, sab = 0;
    for (let k = 0; k < a.length; k++) {
      const x = a[k], y = b[k];
      sd += Math.abs(x - y); sa += x; sb += y; saa += x * x; sbb += y * y; sab += x * y;
    }
    const n = a.length;
    e[i] = sd / n;
    const va = saa / n - (sa / n) ** 2, vb = sbb / n - (sb / n) ** 2;
    corr[i] = va > 1e-6 && vb > 1e-6 ? (sab / n - (sa / n) * (sb / n)) / Math.sqrt(va * vb) : (Math.abs(sa - sb) / n < 2 ? 1 : 0);
  }

  // --- hard cuts: energy spike relative to local neighbourhood + low correlation ---
  const cuts = [];
  for (let i = 1; i < N; i++) {
    const nb = [];
    for (let k = Math.max(1, i - 6); k <= Math.min(N - 1, i + 6); k++) if (k !== i) nb.push(e[k]);
    const base = median(nb);
    if (e[i] > 10 && e[i] > 4 * Math.max(base, 0.5) && corr[i] < 0.6) cuts.push(i);
  }
  // collapse adjacent flags
  const cutIdx = cuts.filter((c, k) => k === 0 || c - cuts[k - 1] > 2);
  const bounds = [0, ...cutIdx, N];
  const shotLen = [];
  for (let k = 0; k + 1 < bounds.length; k++) shotLen.push((bounds[k + 1] - bounds[k]) / fps);

  // --- smoothed energy (3-tap), cut frames replaced by neighbour mean ---
  const ec = Float64Array.from(e);
  for (const c of cutIdx) ec[c] = ((ec[c - 1] ?? 0) + (ec[c + 1] ?? 0)) / 2;
  const es = new Float64Array(N);
  for (let i = 0; i < N; i++) {
    const a = ec[Math.max(0, i - 1)], b = ec[i], c = ec[Math.min(N - 1, i + 1)];
    es[i] = (a + 2 * b + c) / 4;
  }
  es[0] = es[1] ?? 0;

  // --- noise-aware still threshold ---
  const noise = pct([...ec].slice(1), 0.03); // low percentile of raw diffs ~ codec/grain noise floor
  const still = Math.min(0.5, Math.max(opt.still, noise * 2));
  const isStill = (i) => es[i] < still && !cutIdx.includes(i);

  // --- holds (runs of still frames, minHold seconds) ---
  const minHoldF = Math.max(3, Math.round(opt.minHold * fps));
  const runs = [];
  let s0 = -1;
  for (let i = 0; i <= N; i++) {
    const st = i < N && isStill(i);
    if (st && s0 < 0) s0 = i;
    if (!st && s0 >= 0) { runs.push([s0, i]); s0 = -1; }
  }
  const holds = runs.filter(([a, b]) => b - a >= minHoldF);
  const holdLens = holds.map(([a, b]) => (b - a) / fps);
  const last = holds.find(([, b]) => b === N);
  const finalHold = last ? (last[1] - last[0]) / fps : 0;
  const stillFrames = [...Array(N).keys()].filter(isStill).length;

  // --- motion events: peak decomposition inside each non-still run ---
  const segs = [];
  let m0 = -1;
  const splitStill = Math.max(2, Math.round(0.08 * fps));
  // runs of motion separated by still runs >= splitStill, or by cuts
  const stillRunsAll = runs.filter(([a, b]) => b - a >= splitStill);
  const isInStillRun = new Uint8Array(N);
  for (const [a, b] of stillRunsAll) for (let i = a; i < b; i++) isInStillRun[i] = 1;
  for (const c of cutIdx) isInStillRun[c] = 1;
  for (let i = 0; i <= N; i++) {
    const mv = i < N && !isInStillRun[i];
    if (mv && m0 < 0) m0 = i;
    if (!mv && m0 >= 0) { segs.push([m0, i]); m0 = -1; }
  }
  const events = [];
  for (const [a, b] of segs) {
    if (b - a < 2) continue;
    const segMax = Math.max(...Array.from({ length: b - a }, (_, k) => es[a + k]));
    const minProm = Math.max(0.8, 0.35 * segMax);
    // local maxima
    const peaks = [];
    for (let i = a; i < b; i++) {
      const l = i > a ? es[i - 1] : -1, rr = i + 1 < b ? es[i + 1] : -1;
      if (es[i] >= l && es[i] > rr) peaks.push(i);
    }
    for (const p of peaks) {
      // prominence: walk outward until a higher peak; track min on each side
      let lmin = es[p], rmin = es[p];
      for (let i = p - 1; i >= a; i--) { if (es[i] > es[p]) break; lmin = Math.min(lmin, es[i]); }
      for (let i = p + 1; i < b; i++) { if (es[i] > es[p]) break; rmin = Math.min(rmin, es[i]); }
      const base = Math.max(lmin, rmin);
      const prom = es[p] - base;
      if (prom < minProm) continue;
      const lvl = Math.min(lmin, rmin) + 0.1 * (es[p] - Math.min(lmin, rmin));
      let on = p; while (on > a && es[on - 1] > lvl) on--;
      let off = p; while (off + 1 < b && es[off + 1] > lvl) off++;
      const rise = (p - on + 1) / fps, fall = (off - p + 1) / fps;
      events.push({ on, peak: p, off, rise, fall, dur: (off - on + 1) / fps, asym: fall / rise, peakEnergy: es[p] });
    }
  }
  // drop secondary bumps that sit inside a larger event's onset..settle window
  for (let k = events.length - 1; k >= 0; k--) {
    const ev = events[k];
    if (events.some((o) => o !== ev && o.peakEnergy > ev.peakEnergy && o.on <= ev.peak && ev.peak <= o.off)) events.splice(k, 1);
  }
  events.sort((x, y) => x.on - y.on);

  // --- speed: block matching on half-res, sub-pixel refinement at full res ---
  const norm = (1080 / Math.min(W, H)) * (fps / 60); // analysis px/native-frame -> px/frame @1080 short side, 60fps
  const half = (f) => {
    const w2 = f.w >> 1, h2 = f.h >> 1, o = new Uint8Array(w2 * h2);
    for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
      const i = 2 * y * f.w + 2 * x;
      o[y * w2 + x] = (f.data[i] + f.data[i + 1] + f.data[i + f.w] + f.data[i + f.w + 1]) >> 2;
    }
    return { w: w2, h: h2, data: o };
  };
  const halves = new Array(N);
  const getHalf = (i) => (halves[i] ??= half(frames[i]));
  const sad = (A, B, w, bx, by, bw, bh, dx, dy) => {
    let s = 0;
    for (let y = 0; y < bh; y++) {
      const ra = (by + y) * w + bx, rb = (by + y + dy) * w + bx + dx;
      for (let x = 0; x < bw; x++) s += Math.abs(A[ra + x] - B[rb + x]);
    }
    return s;
  };
  const R = 8, GX = 4, GY = 3;
  let satBlocks = 0, totBlocks = 0;
  function blockSpeeds(i) {
    const A = getHalf(i - 1), B = getHalf(i);
    const w = A.w, h = A.h;
    const bw = Math.floor((w - 2 * R) / GX), bh = Math.floor((h - 2 * R) / GY);
    const res = [];
    const FA = frames[i - 1], FB = frames[i];
    for (let gy = 0; gy < GY; gy++) for (let gx = 0; gx < GX; gx++) {
      const bx = R + gx * bw, by = R + gy * bh;
      // texture check
      let sm = 0, sq = 0;
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const v = A.data[(by + y) * w + bx + x]; sm += v; sq += v * v; }
      const nn = bw * bh;
      if (sq / nn - (sm / nn) ** 2 < 16) continue; // flat block (std < 4)
      let best = Infinity, bdx = 0, bdy = 0;
      const s00 = sad(A.data, B.data, w, bx, by, bw, bh, 0, 0);
      best = s00;
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (!dx && !dy) continue;
        const s = sad(A.data, B.data, w, bx, by, bw, bh, dx, dy);
        if (s < best - 1e-9) { best = s; bdx = dx; bdy = dy; }
      }
      if (Math.abs(bdx) === R || Math.abs(bdy) === R) { satBlocks++; continue; } // search window saturated: speed unknown (> ~35 px/frame@1080/60 at 24fps)
      totBlocks++;
      // full-res refinement: +-1 around 2*d, then parabola
      const fw = FA.w, fx = 2 * bx, fy = 2 * by, fbw = 2 * bw, fbh = 2 * bh;
      const cdx = 2 * bdx, cdy = 2 * bdy;
      const S = {};
      let fb = Infinity, fdx = cdx, fdy = cdy;
      const inb = (dx, dy) => fx + dx >= 0 && fy + dy >= 0 && fx + dx + fbw <= fw && fy + dy + fbh <= FA.h;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!inb(cdx + dx, cdy + dy)) continue;
        const s = sad(FA.data, FB.data, fw, fx, fy, fbw, fbh, cdx + dx, cdy + dy);
        S[`${dx},${dy}`] = s;
        if (s < fb) { fb = s; fdx = cdx + dx; fdy = cdy + dy; }
      }
      const par = (m, c, p) => (m === undefined || p === undefined ? 0 : (m - p) / (2 * (m - 2 * c + p) || 1));
      const ox = fdx - cdx, oy = fdy - cdy;
      const sx = par(S[`${ox - 1},${oy}`], S[`${ox},${oy}`], S[`${ox + 1},${oy}`]);
      const sy = par(S[`${ox},${oy - 1}`], S[`${ox},${oy}`], S[`${ox},${oy + 1}`]);
      const dxx = fdx + Math.max(-0.5, Math.min(0.5, sx)), dyy = fdy + Math.max(-0.5, Math.min(0.5, sy));
      res.push(Math.hypot(dxx, dyy) * norm);
    }
    return res;
  }
  const gSpeed = new Float64Array(N), rSpeed = new Float64Array(N);
  const cutSet = new Set(cutIdx);
  for (let i = 1; i < N; i++) {
    if (cutSet.has(i) || es[i] < still * 0.8 || corr[i] < 0.7) continue; // low corr = dissolve/wipe, not trackable motion
    const sp = blockSpeeds(i);
    if (sp.length < 3) continue;
    gSpeed[i] = median(sp);
    rSpeed[i] = pct(sp, 0.8);
  }
  const moving = [...Array(N).keys()].filter((i) => gSpeed[i] > 0 || rSpeed[i] > 0);
  // smooth speed (3-tap) before taking peaks to damp matching jitter
  const sm3 = (arr) => Float64Array.from(arr, (_, i) => (arr[Math.max(0, i - 1)] + 2 * arr[i] + arr[Math.min(N - 1, i + 1)]) / 4);
  const gS = sm3(gSpeed), rS = sm3(rSpeed);
  for (const ev of events) {
    let pk = 0, pg = 0;
    for (let i = ev.on; i <= ev.off; i++) { pk = Math.max(pk, rS[i]); pg = Math.max(pg, gS[i]); }
    ev.peakRegionalSpeed = pk; ev.peakGlobalSpeed = pg;
  }

  const evPublic = events.map((ev) => ({
    start: T(ev.on / fps), peak: T(ev.peak / fps), end: T((ev.off + 1) / fps),
    duration: T(ev.dur), onsetToPeak: T(ev.rise), peakToRest: T(ev.fall),
    asymmetry: r(ev.asym, 2),
    peakEnergy: r(ev.peakEnergy, 2),
    peakRegionalSpeedPxPerFrame: r(ev.peakRegionalSpeed, 2),
    peakGlobalSpeedPxPerFrame: r(ev.peakGlobalSpeed, 2),
  }));

  const out = {
    source: path.basename(video),
    native: { fps: r(fps, 3), frames: N, width: meta.width, height: meta.height, analysisSize: `${W}x${H}` },
    duration: T(dur),
    params: { still: r(still, 3), noiseFloor: r(noise, 3), minHoldSec: opt.minHold, analysisWidth: aw },
    energy: {
      mean: r(mean([...es])), median: r(median([...es])), p90: r(pct([...es], 0.9)), max: r(Math.max(...es)),
      pctFramesStill: r((100 * stillFrames) / N, 1),
    },
    cuts: { count: cutIdx.length, perTenSeconds: r((cutIdx.length / dur) * 10, 2), at: TL(cutIdx.map((c) => c / fps)) },
    shots: { count: shotLen.length, lengths: TL(shotLen), median: T(median(shotLen)) },
    holds: { count: holds.length, lengths: TL(holdLens), starts: TL(holds.map(([a]) => a / fps)), final: T(finalHold) },
    events: { count: evPublic.length, list: evPublic },
    speed: {
      unit: 'px/frame @ 1080 short-side, 60fps',
      movingFrames: moving.length,
      searchSaturatedBlockPct: r((100 * satBlocks) / Math.max(1, satBlocks + totBlocks), 1),
      globalMedian: r(median(moving.map((i) => gS[i])), 2),
      globalP95: r(pct(moving.map((i) => gS[i]), 0.95), 2),
      regionalMedian: r(median(moving.map((i) => rS[i])), 2),
      regionalP95: r(pct(moving.map((i) => rS[i]), 0.95), 2),
      regionalMax: r(Math.max(0, ...moving.map((i) => rS[i])), 2),
    },
  };
  if (opt.series) out.series = { energy: Array.from(es, (x) => r(x, 2)), regionalSpeed: Array.from(rS, (x) => r(x, 2)) };

  if (opt.meta) out.meta = opt.meta;
  const json = JSON.stringify(out, null, 2);
  if (opt.out) { fs.mkdirSync(path.dirname(path.resolve(opt.out)), { recursive: true }); fs.writeFileSync(opt.out, json + '\n'); }
  else console.log(json);
}
main();
