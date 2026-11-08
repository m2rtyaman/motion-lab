/**
 * Node-side half of scripts/browser-probe.mjs: what does the project's buildTimeline CLAIM?
 * Builds the timeline against fake elements (same fake scope idea as timeline-audit), seeks it frame by frame and prints JSON:
 *   { ok, fps, totalFrames, tweenCount, selectors, perSelector: { sel: { tweens, animatedFrom, animatedTo } }, windows: [{sel,prop,from,to,v0,v1,delta}], holdStart, holdEnd }
 * Needs a TS loader:  npx tsx scripts/lib/probe-node-trace.mjs --dir <projectDir>
 * Env sniffing (typeof window / document) is deliberately NOT faked here: a Scene that builds a different timeline in Node than in the
 * browser is exactly what the probe compares against (P006).
 */
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const argv = process.argv.slice(2);
const dir = path.resolve(argv[argv.indexOf("--dir") + 1] ?? "");
const emit = (o) => process.stdout.write(`${JSON.stringify(o)}\n`);

const THRESH = { x: 20, y: 20, scale: 0.05, opacity: 0.3, rotation: 5 };
const EPS = { x: 0.15, y: 0.15, scale: 0.0004, opacity: 0.0004, rotation: 0.05 };
const DEFAULT = { x: 0, y: 0, scale: 1, opacity: 1, rotation: 0 };

function makeScope() {
  const cache = new Map(), queried = new Set();
  const fakeEl = (selector) => {
    const el = { x: 0, y: 0, scale: 1, scaleX: 1, scaleY: 1, opacity: 1, autoAlpha: 1, rotation: 0, style: {}, getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }), getAttribute: () => null, setAttribute: () => {} };
    Object.defineProperty(el, "__selector", { value: selector, enumerable: false });
    return el;
  };
  return {
    queried,
    querySelectorAll(selector) {
      queried.add(selector);
      if (!cache.has(selector)) cache.set(selector, Array.from({ length: selector.trim().startsWith("#") ? 1 : 3 }, () => fakeEl(selector)));
      return cache.get(selector);
    },
  };
}

function runsOf(vals, eps) {
  const runs = [];
  let cur = null, still = 0;
  for (let f = 1; f < vals.length; f++) {
    const d = vals[f] - vals[f - 1];
    const sign = d > eps ? 1 : d < -eps ? -1 : 0;
    if (sign === 0) { if (cur && ++still >= 3) { runs.push(cur); cur = null; } continue; }
    still = 0;
    if (cur && cur.sign !== sign) { runs.push(cur); cur = null; }
    if (!cur) cur = { sign, from: f - 1, to: f };
    cur.to = f;
  }
  if (cur) runs.push(cur);
  return runs.map((r) => ({ from: r.from, to: r.to, v0: vals[r.from], v1: vals[r.to], delta: vals[r.to] - vals[r.from] }));
}

try {
  const spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf-8").replace(/^﻿/, ""));
  const fps = Number(spec.fps) || 60;
  const totalFrames = Math.round((Number(spec.durationInSeconds) || 0) * fps);
  const mod = await import(pathToFileURL(path.join(dir, "Scene.tsx")).href);
  if (typeof mod.buildTimeline !== "function") throw new Error("Scene.tsx does not export buildTimeline");
  const { default: gsap } = await import("gsap");
  gsap.config({ nullTargetWarn: false });
  const origWarn = console.warn;
  console.warn = () => {};
  const tl0 = gsap.timeline({ paused: true, autoRemoveChildren: false });
  const scope = makeScope();
  let out;
  gsap.context(() => { out = mod.buildTimeline(tl0); }, scope);
  const tl = out instanceof gsap.core.Timeline ? out : tl0;

  const leaves = [];
  const walk = (parent, offset) => {
    for (const c of parent.getChildren(false, true, true)) {
      const start = offset + c.startTime();
      if (c instanceof gsap.core.Timeline) { walk(c, start); continue; }
      const dur = c.duration(), infinite = c.vars?.repeat === -1;
      const els = c.targets?.() ?? [];
      leaves.push({ start, end: infinite ? Infinity : start + c.totalDuration(), dur, els, sels: [...new Set(els.map((t) => t?.__selector).filter(Boolean))] });
    }
  };
  walk(tl, 0);

  const perSelector = {}, els = new Map();
  for (const l of leaves)
    for (const el of l.els) {
      const s = el?.__selector;
      if (!s) continue;
      if (!els.has(s)) els.set(s, el);
      const p = (perSelector[s] ??= { tweens: 0, timed: 0, animatedFrom: Infinity, animatedTo: -1 });
      if (!l.counted) l.counted = new Set();
      if (!l.counted.has(s)) { l.counted.add(s); p.tweens++; if (l.dur > 0) p.timed++; }
      if (l.dur > 0) { p.animatedFrom = Math.min(p.animatedFrom, Math.round(l.start * fps)); p.animatedTo = Math.max(p.animatedTo, l.end === Infinity ? totalFrames : Math.round(l.end * fps)); }
    }
  for (const p of Object.values(perSelector)) if (p.animatedTo < 0) { p.animatedFrom = null; p.animatedTo = null; }

  const num = (v, d) => { const n = Number.parseFloat(v); return Number.isFinite(n) ? n : d; };
  const series = new Map([...els.keys()].map((s) => [s, { x: [], y: [], scale: [], opacity: [], rotation: [] }]));
  tl.pause();
  for (let f = 0; f <= totalFrames; f++) {
    tl.time(f === 0 ? 0.00001 : f / fps, true);
    for (const [s, el] of els) {
      const ser = series.get(s);
      ser.x.push(num(el.x, 0));
      ser.y.push(num(el.y, 0));
      ser.scale.push(num(el.scale, num(el.scaleX, 1)));
      ser.opacity.push(num(el.opacity, num(el.autoAlpha, 1)));
      ser.rotation.push(num(el.rotation, num(el.rotate, num(el.rotateZ, 0))));
    }
  }
  console.warn = origWarn;
  // frames where the timeline itself claims a target is invisible (opacity < 0.15 or scale < 0.1): the probe does not demand visibility there
  for (const [s, ser] of series) {
    const ranges = [];
    let from = null;
    for (let f = 0; f <= totalFrames; f++) {
      const hid = ser.opacity[f] < 0.15 || ser.scale[f] < 0.1;
      if (hid && from === null) from = f;
      if (!hid && from !== null) { ranges.push([from, f - 1]); from = null; }
    }
    if (from !== null) ranges.push([from, totalFrames]);
    if (perSelector[s]) perSelector[s].hiddenRanges = ranges.slice(0, 40);
  }
  const windows = [];
  for (const [s, ser] of series)
    for (const prop of Object.keys(THRESH))
      for (const r of runsOf(ser[prop], EPS[prop]))
        if (Math.abs(r.delta) >= THRESH[prop]) windows.push({ sel: s, prop, from: r.from, to: r.to, v0: r.v0, v1: r.v1, delta: r.delta });
  windows.sort((a, b) => a.from - b.from);
  const labels = tl.labels ?? {};
  emit({
    ok: true, fps, totalFrames,
    tweenCount: leaves.length,
    selectors: [...scope.queried],
    perSelector, windows,
    holdStart: labels["hold:start"] === undefined ? null : Math.round(labels["hold:start"] * fps),
    holdEnd: labels["hold:end"] === undefined ? null : Math.round(labels["hold:end"] * fps),
    defaults: DEFAULT,
  });
} catch (e) {
  emit({ ok: false, error: String(e?.message ?? e).slice(0, 400) });
  process.exitCode = 0;
}
