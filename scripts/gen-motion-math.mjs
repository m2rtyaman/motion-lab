/**
 * MOTION MATH GENERATOR - writes docs/MOTION_MATH.md from the real tokens, spring solver,
 * presets, GSAP eases and the golden examples, so no number in the primer can drift.
 *
 * Usage:  npx tsx scripts/gen-motion-math.mjs          (write docs/MOTION_MATH.md)
 *         npx tsx scripts/gen-motion-math.mjs --check  (exit 1 if the file is stale)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "docs", "MOTION_MATH.md");
const CHECK = process.argv.includes("--check");

const origWarn = console.warn;
console.warn = (...a) => { if (!/GSAP|Missing plugin|invalid property/i.test(a.join(" "))) origWarn(...a); };
const { default: gsap } = await import("gsap");
gsap.config({ nullTargetWarn: false });
const T = await import("../src/core/tokens.ts");
const { EASING, DURATIONS, TIMING, SPRING, RECIPE, MOTION_OFFSET, SCALE_CONTRAST, BROADCAST_SCALE } = T;
const S = await import("../src/core/spring-solver.ts");
const { PRESET_CATALOG } = await import("../src/core/presets.ts");
const { calculateRequiredReadingTime } = await import("../src/core/readability-meter.ts");

/* ------------------------------ helpers ------------------------------ */
const FPS = 60;
const fr = (s) => +(s * FPS).toFixed(1);
const n2 = (x) => +x.toFixed(2);
const pc = (x) => `${(x * 100).toFixed(0)}%`;
const sd = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length); };
const row = (...c) => `| ${c.join(" | ")} |`;
const table = (head, rows) => [row(...head), row(...head.map(() => "---")), ...rows.map((r) => row(...r))];
const byValue = (o) => Object.entries(o).sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));

/** cubic-bezier(x1,y1,x2,y2) as a function of time fraction (bisection on x). */
function bezier([x1, y1, x2, y2]) {
  const cx = (t) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const cy = (t) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  return (x) => { let lo = 0, hi = 1; for (let i = 0; i < 50; i++) { const m = (lo + hi) / 2; if (cx(m) < x) lo = m; else hi = m; } return cy((lo + hi) / 2); };
}
const easeFn = (e) => (Array.isArray(e) ? bezier(e) : gsap.parseEase(e));
const easeLabel = (e) => (Array.isArray(e) ? `cubic-bezier(${e.join(",")})` : e);

/** Sample a progress curve: values at fractions, peak slope (x average speed) and where, time to reach 90%, overshoot. */
function profile(fn) {
  const N = 4000; let peak = 0, at = 0, t90 = null, max = 0;
  for (let i = 1; i <= N; i++) {
    const slope = (fn(i / N) - fn((i - 1) / N)) * N;
    if (slope > peak) { peak = slope; at = i / N; }
    const v = fn(i / N); if (t90 === null && v >= 0.9) t90 = i / N; if (v > max) max = v;
  }
  const spark = Array.from({ length: 16 }, (_, i) => { const v = fn(i / 15); return v > 1.005 ? "+" : String(Math.max(0, Math.min(9, Math.round(v * 9)))); }).join("");
  return { peak, at, t90, overshoot: Math.max(0, max - 1), spark, v: (p) => fn(p) };
}

/* ------------------- run the golden timelines in Node ------------------- */
function makeScope() {
  const cache = new Map();
  return { querySelectorAll(sel) {
    if (!cache.has(sel)) cache.set(sel, Array.from({ length: sel.trim().startsWith("#") ? 1 : 3 }, () => {
      const el = { style: {}, getBoundingClientRect: () => ({ x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }), getAttribute: () => null, setAttribute: () => {} };
      Object.defineProperty(el, "__selector", { value: sel, enumerable: false }); return el; }));
    return cache.get(sel);
  } };
}
function flatten(tl) {
  const out = [];
  const walk = (parent, offset, inherited) => {
    for (const c of parent.getChildren(false, true, true)) {
      const preset = c.data?.preset ?? inherited, start = offset + c.startTime();
      if (c instanceof gsap.core.Timeline) { walk(c, start, preset); continue; }
      const sel = [...new Set((c.targets?.() ?? []).map((t) => t?.__selector ?? "object"))].join(",");
      out.push({ start, end: start + c.totalDuration(), preset, ease: c.vars?.ease, target: sel });
    }
  };
  walk(tl, 0, undefined);
  return out;
}
async function loadExample(slug) {
  const dir = path.join(ROOT, "src", "projects", slug);
  const spec = JSON.parse(fs.readFileSync(path.join(dir, "spec.json"), "utf8"));
  const mod = await import(pathToFileURL(path.join(dir, "Scene.tsx")).href);
  const tl = gsap.timeline({ paused: true, autoRemoveChildren: false });
  gsap.context(() => mod.buildTimeline(tl), makeScope());
  const hold = { start: tl.labels["hold:start"], end: tl.labels["hold:end"] };
  return { slug, spec, tl, tweens: flatten(tl), hold };
}
const EXAMPLES = await Promise.all(["example-kinetic-type", "example-product-ui", "example-logo-sting"].map(loadExample));

/* ------------------------- derived data ------------------------- */
const EASE = Object.entries(EASING).map(([k, e]) => ({ key: k, label: easeLabel(e), ...profile(easeFn(e)) }));
const peakOf = (name) => profile(easeFn(name)).peak;
const EXPO_PEAK = peakOf(EASING.expoOut);
const BACK_OVERSHOOT = EASE.find((e) => e.key === "backOut").overshoot;

const SPRINGS = Object.entries(SPRING).map(([k, c]) => {
  const zeta = c.damping / (2 * Math.sqrt(c.stiffness * c.mass)), w0 = Math.sqrt(c.stiffness / c.mass);
  const formula = zeta < 1 ? Math.exp((-zeta * Math.PI) / Math.sqrt(1 - zeta * zeta)) : 0;
  let max = 0, tMax = 0;
  for (let t = 0.001; t < 4; t += 0.001) { const p = S.solveSpring({ ...c, time: t }).progress; if (p > max) { max = p; tMax = t; } }
  return { k, c, zeta, w0, formula, measured: Math.max(0, max - 1), peakFrame: max > 1.0005 ? Math.round(tMax * FPS) : null, settle: S.getSpringSettleFrames(c, FPS) };
});
const formulaMismatch = SPRINGS.filter((s) => Math.abs(s.formula - s.measured) > 0.002);
const SPRING_USE = {
  snappy: "UI snaps, toggles, buttons", rigid: "heavy panels, machinery, no life", bouncy: "playful pops, badges, stickers",
  gentle: "soft cards, slight life", smooth: "large surfaces, calm follow", liquidLead: "leader of a liquid pair", liquidTrail: "follower of liquidLead",
  cameraTrack: "camera/rig follow", morphSnappy: "container morphs", snapback: "elastic return after a drag",
};
const feel = (z) => (z >= 0.97 ? "none" : z >= 0.75 ? "slight" : "visible");

/* -------------------------------- build -------------------------------- */
const L = [];
const push = (...a) => L.push(...a);
const stagger = { tight: TIMING.charStagger, normal: TIMING.itemStagger, loose: TIMING.digitStagger };

push("# MOTION_MATH.md", "",
  "GENERATED by `scripts/gen-motion-math.mjs` (`pnpm docs:math`). Do not edit by hand: every number comes from `tokens.ts`, `spring-solver.ts`, `presets.ts`, GSAP and the golden examples.",
  "Use it to pick a preset *for a reason*. Frames are at 60 fps (1 frame = 16.67 ms).", "");

/* 1 TIME */
push("## 1. Time at 60fps", "", "`frames = seconds x 60`. 0.1 s = 6 f, 1 s = 60 f.", "");
const bucket = (s) => (s <= 0.15 ? "feels instant (~0.1 s)" : s < 0.5 ? "UI motion (0.2-0.5 s)" : s <= 0.8 ? "noticeable, still UI" : "deliberate (>0.8 s)");
push(...table(["DURATIONS token", "seconds", "frames", "feels like"], byValue(DURATIONS).map(([k, v]) => [`\`${k}\``, v, fr(v), bucket(v)])), "");
push("Perception: under ~0.1 s a change reads as instant (no motion seen); 0.2-0.5 s is the UI sweet spot; above 0.8 s the viewer waits, so only use it when the pause is the point (camera, hero reveal).", "");
const rt = (w, v) => calculateRequiredReadingTime(0, w, v);
push("Reading time (`calculateRequiredReadingTime`, latin): `max(1.5, words/15 + 1.5)` s; comparison/verdict screens `max(2.5, ...)`. It is a floor: the 1.5 s base dominates for short copy.", "");
push(...table(["words", "seconds", "frames", "comparison screen (s)"], [3, 6, 10].map((w) => [w, rt(w), fr(rt(w)), rt(w, true)])), "");
push(`In this repo: pick durations only from \`DURATIONS\`; text must stay fully visible for at least the table above (the closing hold is 1.2 s = ${fr(1.2)} f via \`holdFinal\`).`, "");

/* 2 EASING */
push("## 2. Easing = velocity profile", "",
  "An ease maps time fraction to progress; its *slope* is speed. `.out` = fast start, decelerate to rest (things arriving). `.in` = slow start, accelerate (things leaving). `.inOut` = accelerate then decelerate (A to B on screen). `linear` = constant speed, robotic because nothing in the physical world starts and stops instantly.", "",
  "Progress at 10/25/50/75/90% of the duration, peak speed (multiple of the average speed, and where in time it happens), time to reach 90% progress, and a 16-sample shape (digit = progress x 9, `+` = overshoot):", "");
const lin = profile((p) => p);
const pk = (p) => (p > 20 ? ">20x (vertical start)" : `${p.toFixed(1)}x`);
push(...table(["token", "ease", "10%", "25%", "50%", "75%", "90%", "peak speed (x avg @ time)", "90% reached at", "shape"],
  [...EASE.map((e) => [`\`${e.key}\``, `\`${e.label}\``, ...[0.1, 0.25, 0.5, 0.75, 0.9].map((p) => n2(e.v(p))), `${pk(e.peak)} @ ${pc(e.at)}`, pc(e.t90), `\`${e.spark}\``]),
    ["(ref)", "`linear`", 0.1, 0.25, 0.5, 0.75, 0.9, `1.0x everywhere`, pc(lin.t90), `\`${lin.spark}\``]]), "");
push("Out-ease family strength (higher peak = harder initial kick, longer calm tail):", "");
push(...table(["ease", "progress @25%", "peak speed (x avg)", "90% reached at"],
  ["sine.out", "power1.out", "power2.out", "power3.out", "power4.out", "circ.out", "expo.out"].map((n) => { const p = profile(easeFn(n)); return [`\`${n}\``, n2(p.v(0.25)), pk(p.peak), pc(p.t90)]; })), "");
push("Rules: entrances `.out`; exits `.in`; moves between two on-screen positions `.inOut`. An `.in` entrance hits peak speed at the very end and stops dead (reads as a slam). An `.inOut` entrance wastes its first frames (power2.inOut is only " + n2(profile(easeFn(EASING.powerInOut)).v(0.25)) + " at 25% of the time). `back.out(1.6)` overshoots by " + (BACK_OVERSHOOT * 100).toFixed(1) + "% of the travel distance.", "");
push("In this repo: `rise/blurIn/camera/stagger/wipe` use `expoOut`; `pop` = `powerOut` up then `expoOut` settle; `words` uses `backOut`; `sink/shrink/wipeOut` use `quickIn` (power2.in); `camera:drift` uses `sineInOut`; `shake` steps use `powerOut`. Raw `linear` and `easeInOut`-style names are lint errors (A002).", "");

/* 3 SPRINGS */
push("## 3. Springs", "",
  "Model: `m x'' + c x' + k x = 0`. Natural frequency `w0 = sqrt(k/m)`; damping ratio `zeta = c / (2 sqrt(k m))`; for `zeta < 1` overshoot = `exp(-zeta pi / sqrt(1 - zeta^2))`; `zeta >= 1` never overshoots (1 = fastest no-bounce settle). Decay rate of the envelope = `zeta w0 = c / 2m`: bigger = settles sooner. Settle frames come from `getSpringSettleFrames` (threshold 0.001 on position AND velocity).", "");
push(...table(["SPRING preset", "k / c / m", "w0 (rad/s)", "zeta", "overshoot (formula)", "overshoot (solver)", "1st peak (f)", "settle (f)", "bounce", "use for"],
  SPRINGS.map((s) => [`\`${s.k}\``, `${s.c.stiffness}/${s.c.damping}/${s.c.mass}`, s.w0.toFixed(1), s.zeta.toFixed(2), `${(s.formula * 100).toFixed(1)}%`, `${(s.measured * 100).toFixed(1)}%`, s.peakFrame ?? "-", s.settle, feel(s.zeta), SPRING_USE[s.k] ?? ""])), "");
push(formulaMismatch.length
  ? `Formula and solver disagree for: ${formulaMismatch.map((s) => s.k).join(", ")}. The solver is the truth; trust it.`
  : "Formula and solver agree for every preset (max difference under 0.2 points).", "");
push("Pick: want no bounce -> `zeta >= 1` (`snappy`, `rigid`, `smooth`, `cameraTrack`...). Want life -> `zeta` 0.5-0.85. Heavier look -> raise mass (lower w0), not damping. A spring with long settle frames cannot finish inside a short beat; compare settle frames with the beat length. Use `createSpringEase(SPRING.x)` with `duration = getSpringSettleDuration(SPRING.x)` to run one inside GSAP.", "");
push("In this repo: scenes use presets; spring tokens feed `createSpringEase`, the choreography helpers and `SPRING_PRESETS` (`snappy, rigid, bouncy, gentle`). Lint A006: damping must be >= 10.", "");

/* 4 STAGGER */
push("## 4. Overlap, stagger, follow-through", "",
  "Staggered group: `total = d + (n-1) x s`. Last child starts at `(n-1) x s`. Overlap of neighbours = `1 - s/d`.", "");
const dPanel = DURATIONS.panel, dWord = DURATIONS.word;
const cell = (d, s, n) => { const t = d + (n - 1) * s; return `${n2(t)} s (${fr(t)} f)`; };
push(...table(["stagger", "s (s)", "s (f)", "overlap on `stagger` (d=" + dPanel + ")", "n=3", "n=5", "n=8", "overlap on `words` (d=" + dWord + ")", "words n=3", "words n=5", "words n=8"],
  [["tight", stagger.tight], ["normal", stagger.normal], ["loose", stagger.loose]].map(([name, s]) =>
    [`\`${name}\``, s, fr(s), pc(1 - s / dPanel), cell(dPanel, s, 3), cell(dPanel, s, 5), cell(dPanel, s, 8), pc(1 - s / dWord), cell(dWord, s, 3), cell(dWord, s, 5), cell(dWord, s, 8)])), "");
push(`Other tokens: \`wordStagger\` ${TIMING.wordStagger} s (${fr(TIMING.wordStagger)} f), \`layerStagger\` ${TIMING.layerStagger}, \`streakStagger\` ${TIMING.streakStagger}, \`itemLead\` ${TIMING.itemLead} s (${fr(TIMING.itemLead)} f lead before the first item), \`crossCutOverlap\` ${TIMING.crossCutOverlap} s (${fr(TIMING.crossCutOverlap)} f: incoming starts that long before the outgoing finishes).`, "");
push("Overlap rule: inside a group the repo overlaps ~85-95% (a wave, not a queue). Between *different* elements start the next when the previous is 50-70% done (30-50% overlap): earlier feels like a collision, later like a stutter. Follow-through: the child or accent finishes after the parent (pop settles after the overshoot, shake decays to rest, headline settles then `punch` lands).", "");
push("In this repo: `enter(..,'stagger'|'words', at, { stagger })`; pick `tight` for characters/long lists, `normal` for cards, `loose` for 3-4 big items.", "");

/* 5 ANTICIPATION */
const overshootPct = (RECIPE.settleOvershoot - 1) * 100;
push("## 5. Anticipation & overshoot amounts", "",
  "Anticipation = a small move the opposite way before the main move; overshoot = passing the target, then returning (follow-through). Repo magnitudes:", "");
push(...table(["what", "amount", "time", "frames"], [
  ["`pop` (scale 0 to 1)", `to ${RECIPE.settleOvershoot} (+${overshootPct.toFixed(0)}%), then back to 1`, `${RECIPE.settleIn} s in + ${RECIPE.settleOut} s settle`, `${fr(RECIPE.settleIn)} + ${fr(RECIPE.settleOut)} = ${fr(RECIPE.settleIn + RECIPE.settleOut)}`],
  ["`punch` soft/normal/strong", "scale 1.02 / 1.04 / 1.07 + brightness flash", `${DURATIONS.instant} s up, ${DURATIONS.micro} s down`, `${fr(DURATIONS.instant)} + ${fr(DURATIONS.micro)}`],
  ["`words` drop", `y -${MOTION_OFFSET.wordY}px, scale ${MOTION_OFFSET.wordScaleFrom}, rotateX 20, blur ${MOTION_OFFSET.wordBlur}px; back.out overshoot ${(BACK_OVERSHOOT * 100).toFixed(1)}%`, `${DURATIONS.word} s`, fr(DURATIONS.word)],
  ["`shake`", `${RECIPE.shakeSteps} steps, amplitude ${RECIPE.shakeAmplitudePx}px (x0.5 soft, x1.6 strong), roll ${RECIPE.shakeRollDeg} deg, linear decay`, `${RECIPE.shakeStep} s/step + ${DURATIONS.panel} s rest`, `${fr(RECIPE.shakeStep)} x ${RECIPE.shakeSteps} + ${fr(DURATIONS.panel)}`],
  ["cursor press", `scale ${RECIPE.cursorPressScale} (-${((1 - RECIPE.cursorPressScale) * 100).toFixed(0)}%), ripple ${RECIPE.rippleScale}x`, `travel ${RECIPE.cursorTravelDuration} s`, fr(RECIPE.cursorTravelDuration)],
  ["dock / indicator stretch", `dock overshoot ${RECIPE.dockOvershootScale}, indicator scaleX ${RECIPE.indicatorStretchScaleX}`, `glide ${RECIPE.indicatorGlideDuration} s`, fr(RECIPE.indicatorGlideDuration)],
  ["springs (section 3)", `${Math.min(...SPRINGS.filter((s) => s.formula > 0).map((s) => s.formula * 100)).toFixed(1)}% to ${Math.max(...SPRINGS.map((s) => s.formula * 100)).toFixed(1)}% overshoot`, "see settle frames", "-"],
]), "");
push("Rule of thumb: overshoot 2-10% of the move (above ~15% reads cartoonish); the settle takes 1.3-1.7x the onset (onset to peak is 0.1-0.25 s), and 2-2.6x only for hero pops (measured on 33 real clips, see `references/measured/`); anticipation is about one third of the action time (UI: ~10% of the move over 3-6 frames). For wind-ups, overshoot and follow-through on shapes use `anticipate` / `launch` / `followThrough` from `src/core/physics.ts` (`docs/CHARACTER_ANIMATION.md`); do not hand-fake them.", "");
push("In this repo: `pop` and `words` carry the overshoot; `punch` is the 7+12 frame beat emphasis; `shake` is the only multi-step recipe.", "");

/* 6 SPACE */
const exp = EXPO_PEAK;
push("## 6. Space", "",
  "Speed in px/frame = distance / frames. Eased speed peaks at `peak x average` (section 2). Measured on 33 real clips (`references/measured/`, 1080p, 60 fps): comfortable PEAK speed is <= ~30 px/f; impacts may reach <= ~80 px/f but only for <= 3 frames; sustained motion is 5-15 px/f; camera moves are 2-6 px/f. Above that an unblurred object jumps whole body-widths between frames and strobes.", "");
const moves = [
  ["`rise` normal", MOTION_OFFSET.surfaceY * 0.5, DURATIONS.panel, EASING.expoOut],
  ["`rise` strong", MOTION_OFFSET.surfaceY, DURATIONS.panel, EASING.expoOut],
  ["`words` drop", MOTION_OFFSET.wordY, DURATIONS.word, EASING.backOut],
  ["`sink` exit", MOTION_OFFSET.exitY * -1, DURATIONS.exit, EASING.quickIn],
  ["logo-sting `ring-wrap` x", 193, DURATIONS.camera, EASING.expoOut],
  ["light leak (distance token, at `camera` duration)", RECIPE.lightLeakDistance, DURATIONS.camera, EASING.expoOut],
  ["BAD: 1500 px in 10 frames, expo.out", 1500, 10 / FPS, EASING.expoOut],
];
push(...table(["move", "px", "frames", "avg px/f", "peak px/f", "verdict"], moves.map(([name, px, d, e]) => {
  const f = d * FPS, p = peakOf(e), avg = px / f, peak = avg * p;
  return [name, px, +f.toFixed(1), avg.toFixed(1), peak.toFixed(1), peak > 80 ? "needs blur / longer / gentler ease" : peak > 30 ? "impact-only (<= 3 f)" : "comfortable"];
})), "");
push(`Distance budget: with \`expoOut\` (peak ${exp.toFixed(1)}x) over \`camera\` (${fr(DURATIONS.camera)} f), peak stays <= 30 px/f only up to ${Math.round((30 / exp) * DURATIONS.camera * FPS)} px (<= 80 px/f, impacts only, up to ${Math.round((80 / exp) * DURATIONS.camera * FPS)} px). Beyond that add blur (\`wordBlur\` ${MOTION_OFFSET.wordBlur}, \`exitBlur\` ${MOTION_OFFSET.exitBlur}, \`surfaceBlur\` ${MOTION_OFFSET.surfaceBlur} px), lengthen the duration, or use \`power3.out\` (${peakOf("power3.out").toFixed(1)}x).`, "");
push("Arcs vs lines: living things and thrown objects travel in arcs (x and y on *different* eases or durations); a straight line with one ease reads mechanical, fine for UI. Transform-origin: scale/rotate pivot about it, a point `r` px from the origin moves `(s-1) x r`: at scale 1.1 a point 500 px away shifts 50 px. `wipe` pivots on the left edge, `wipeOut` on the right.", "");
const nr = RECIPE.parallaxNearRatio, mr = RECIPE.parallaxMidRatio, fa = RECIPE.parallaxFarRatio;
push(`Parallax: apparent speed is proportional to 1/depth. With \`multiplaneParallax\` ratios near ${nr} / mid ${mr} / far ${fa} and a base shift of 100 px: near moves ${100 * nr} px, mid ${100 * mr}, far ${100 * fa} px; implied depth (mid = 1) near ${n2(1 / nr)}, far ${n2(1 / fa)}. Over \`camera\` (${fr(DURATIONS.camera)} f): ${n2((100 * nr) / (DURATIONS.camera * FPS))} / ${n2((100 * mr) / (DURATIONS.camera * FPS))} / ${n2((100 * fa) / (DURATIONS.camera * FPS))} px/f.`, "");
const dist = (s) => `${(Math.abs(1 - 1 / s) * 100).toFixed(0)}% ${s >= 1 ? "closer" : "farther"}`;
push("Camera scale vs distance: pinhole model, apparent size = 1/distance, so scale `s` means the camera moved `1 - 1/s` of the way.", "");
push(...table(["name", "scale", "perceived move"], [
  ...["soft", "normal", "strong"].map((i, k) => [`\`pushIn\` ${i}`, [1.05, 1.1, 1.18][k], dist([1.05, 1.1, 1.18][k])]),
  ...["soft", "normal", "strong"].map((i, k) => [`\`pullOut\` ${i}`, [0.96, 0.92, SCALE_CONTRAST.wideOverview][k], dist([0.96, 0.92, SCALE_CONTRAST.wideOverview][k])]),
  ...Object.entries(SCALE_CONTRAST).filter(([k]) => k !== "neutralStage").map(([k, s]) => [`SCALE_CONTRAST.${k}`, s, dist(s)]),
]), "");
const spec = fs.readFileSync(path.join(ROOT, "scripts", "validate-spec.mjs"), "utf8");
if (!/isHorizontal \? 30 : 250/.test(spec) || !/isHorizontal \? 30 : 300/.test(spec)) throw new Error("validate-spec.mjs safe-zone minimums changed; update gen-motion-math.mjs section 6");
const B = BROADCAST_SCALE;
push(`Safe zones (S008/S009): 9:16 (${B.canvasWidth}x${B.canvasHeight}) top >= ${B.safeZoneTop}, bottom >= ${B.safeZoneBottom} px, so live height = ${B.canvasHeight - B.safeZoneTop - B.safeZoneBottom} px (${pc((B.canvasHeight - B.safeZoneTop - B.safeZoneBottom) / B.canvasHeight)}); cards max ${B.cardMaxWidth} px wide (${(B.canvasWidth - B.cardMaxWidth) / 2} px side margin). 16:9 (1920x1080): top and bottom >= 30 px. Text >= 18 px.`, "");
push("In this repo: `camera(tl, sel, 'pushIn'|'pullOut'|'settle', at, { intensity })`; `SCALE_CONTRAST` for big leaps; never tween top/left (T005), use x/y.", "");

/* 7 COMPOSITION */
push("## 7. Composition & rhythm", "",
  "One focal point at a time: only one element moves hard while the others are still or drifting. Vary beat lengths (sigma of lengths > 14 f is the repo bar); a drumbeat of equal beats feels like a slideshow. Beat plans from the golden examples (length = end - start + 1):", "");
const plans = EXAMPLES.map((e) => {
  const lens = e.spec.beats.map((b) => b.endFrame - b.startFrame + 1);
  const last = e.spec.beats[e.spec.beats.length - 1];
  const holdF = Math.round((e.hold.end - e.hold.start) * FPS);
  return [`\`${e.slug.replace("example-", "")}\``, `${e.spec.aspect}, ${e.spec.durationInSeconds} s (${e.spec.durationInSeconds * FPS} f)`,
    e.spec.beats.map((b, i) => `${b.id} ${lens[i]} f (${n2(lens[i] / FPS)} s)`).join(", "), sd(lens).toFixed(1), `${holdF} f (f${Math.round(e.hold.start * FPS)}-f${Math.round(e.hold.end * FPS)}) inside a ${last.endFrame - last.startFrame + 1} f last beat`];
});
push(...table(["example", "format", "beats (frames)", "sigma (f)", "final hold"], plans), "");
push(`Hold math: \`holdFinal(tl, at, 1.2)\` = ${fr(1.2)} f of stillness; only \`camera:drift\` may move inside it. Last tween must end before \`hold:start\`, so \`hold:start = video end - 1.2 s\`. Micro-beat pulse: something changes (focus, camera, depth) every 60-90 f (1.0-1.5 s).`, "");
push("In this repo: `beat(tl, id, at)` at the spec start frame, T001 +-2 f; every beat needs a tween starting inside it (T002).", "");

/* 8 WORKED EXAMPLE */
const sting = EXAMPLES.find((e) => e.slug === "example-logo-sting");
const groups = new Map();
for (const t of sting.tweens) {
  const g = groups.get(t.target) ?? { target: t.target, start: Infinity, end: 0, presets: new Set(), eases: [] };
  g.start = Math.min(g.start, t.start); g.end = Math.max(g.end, t.end); if (t.preset) g.presets.add(t.preset);
  const e = typeof t.ease === "string" ? t.ease : "fn"; if (!g.eases.includes(e)) g.eases.push(e); groups.set(t.target, g);
}
const G = [...groups.values()].sort((a, b) => a.start - b.start || a.end - b.end);
const get = (sel) => G.find((g) => g.target === sel);
const ov = (a, b) => { const d = (b.start - a.start) / (a.end - a.start); return d >= 1 ? `after a ${fr(b.start - a.end)} f gap` : `when the previous tween is ${pc(d)} done (${pc(1 - d)} overlap)`; };
const why = {
  ".ring-arc": () => `Hero draws itself; starts ${fr(get(".ring-arc").start)} f in so frame 0 is a quiet field. \`wipe\` = scaleX, expo.out (arrives fast, calm finish).`,
  ".ring-dot": () => `Starts ${fr(get(".ring-dot").start - get(".ring-arc").end)} f after the arc ends (ring complete, then the dot lands). \`pop\` overshoot ${RECIPE.settleOvershoot} reads as a click.`,
  ".backdrop": () => `\`drift\` soft, sine.inOut (A to B, no start/stop kick), ${DRIFT_S()} s: nothing is ever frozen, allowed inside the hold.`,
  ".ring-wrap": () => `Raw tween (193 px, ${fr(DURATIONS.camera)} f, expo.out, ${(193 / (DURATIONS.camera * FPS)).toFixed(1)} px/f avg): ring slides off-centre to open space for the lockup; starts exactly on the beat (f90).`,
  ".wordmark": () => `\`blurIn\` starts ${ov(get(".ring-wrap"), get(".wordmark"))}: overlap, not a queue (earlier than the 50-70% rule since the slide is a quiet setup move). Large+blurred to sharp = focus pull.`,
  ".tagline": () => `\`rise\` (${MOTION_OFFSET.surfaceY * 0.5} px, expo.out) starts ${ov(get(".wordmark"), get(".tagline"))}: secondary info arrives after the primary.`,
};
function DRIFT_S() { return PRESET_CATALOG.camera.drift.duration; }
push("## 8. Worked example: `example-logo-sting` (16:9, 4 s, 240 f)", "",
  "Order, start/end, ease and reasoning for each `buildTimeline` line (times from the actual built timeline):", "");
push(...table(["call", "starts (s / f)", "ends (s / f)", "ease(s)", "why"], G.map((g) => {
  const call = g.presets.size ? [...g.presets].join("+") : "raw `tl.fromTo`";
  return [`\`${g.target}\` ${call}`, `${n2(g.start)} / ${Math.round(g.start * FPS)}`, `${n2(g.end)} / ${Math.round(g.end * FPS)}`, g.eases.map((e) => `\`${e}\``).join(" then "), why[g.target]?.() ?? ""];
})), "");
const lastEnd = Math.max(...G.filter((g) => g.target !== ".backdrop").map((g) => g.end));
push(`Beats: \`form\` f0 (${n2(0)} s), \`resolve\` f${Math.round(sting.tl.labels["beat:resolve"] * FPS)}. \`holdFinal\` at ${n2(sting.hold.start)} s (f${Math.round(sting.hold.start * FPS)}) to ${n2(sting.hold.end)} s (f${Math.round(sting.hold.end * FPS)}): the last non-drift tween ends at ${n2(lastEnd)} s, leaving ${fr(sting.hold.start - lastEnd)} f of rest before the hold even starts, then ${fr(sting.hold.end - sting.hold.start)} f held.`, "");
push("In this repo: copy this file for a short sting; kinetic-type shows `maskWipe` + `sink` handoff, product-ui shows the cursor click into `takeover`-style finale.", "");

/* 9 MISTAKES */
const p2in = profile(easeFn(EASING.quickIn)), p2io = profile(easeFn(EASING.powerInOut));
push("## 9. Common mistakes -> fix", "");
push(...table(["symptom", "why (math / perception)", "fix"], [
  ["Entrance uses an `.in` ease", `speed peaks at the end (${p2in.peak.toFixed(1)}x avg for \`quickIn\`) then stops dead: reads as a slam`, "`enter(...)` presets use `.out`; `.in` is for `exit`"],
  ["Everything starts on the same frame", "no hierarchy, eye has no order; one big blob of change", `\`enter(.., 'stagger'|'words', at, { stagger })\`, ${fr(TIMING.itemStagger)} f apart`],
  ["Equal-length beats", `sigma < 14 f = metronome; viewer predicts every cut and tunes out`, "vary beats 1-2.5 s (see section 7 plans)"],
  ["2 s opacity fade between scenes", `${fr(2)} f of near-invisible change; slide-deck dissolve (banned by storyboard law 1)`, "`transition(tl, 'maskWipe'|'morph'|'zoomPunch'|..)`, 0.6-0.8 s"],
  ["Scale 0 to 1 with `linear`", "constant speed, no settle: looks like a progress bar; first frames are tiny and slow to notice", "`enter(.., 'pop')`: overshoot " + RECIPE.settleOvershoot + " then settle"],
  ["Moving 1500 px in 10 frames", `${1500 / 10} px/f average, ${(1500 / 10 * EXPO_PEAK).toFixed(0)} px/f peak with expo.out: strobing, no tracking`, `distance budget in section 6; blur, longer duration, or \`camera:pushIn\``],
  ["Text visible for 0.6 s", `${fr(0.6)} f; repo floor for 3 words is ${rt(3)} s (${fr(rt(3))} f)`, "hold via `calculateRequiredReadingTime`; shorten copy"],
  ["Three transitions back to back", `~${n2(PRESET_CATALOG.transition.maskWipe.duration)}-${n2(PRESET_CATALOG.transition.zoomPunch.duration)} s each: >2 s with no stable frame; T007 warns on overlap`, "one transition per beat boundary, then an `enter` and a still moment"],
  ["Entrance with `inOut`", `power2.inOut is ${n2(p2io.v(0.25))} at 25% time: first quarter of the clip barely moves`, "`.out` for arriving things"],
  ["Final CTA animates until the last frame", `needs ${fr(1.2)} f of stillness (storyboard law 2, T003)`, "`holdFinal(tl, end - 1.2, 1.2)`; only `camera:drift` inside"],
  ["Tweening width/height/top/left", "triggers layout reflow every frame, not GPU, jitters", "x, y, scale, scaleX with `transformOrigin` (T005)"],
  ["Bouncy spring on a heavy panel", `bouncy: ${(SPRINGS.find((s) => s.k === "bouncy").formula * 100).toFixed(0)}% overshoot, ${SPRINGS.find((s) => s.k === "bouncy").settle} f settle; heavy things should not wobble`, "`SPRING.rigid` / `smooth` (zeta >= 1)"],
  ["Camera push 2.85x with no blur", `${dist(SCALE_CONTRAST.portalDive)}: every pixel moves fast near the edges`, "`pushIn` strong (1.18) or add `blurIn`/`dive` transition"],
  ["Dead beat: nothing starts inside", "the frame is static for the full beat", "add `emphasize`/`camera` preset in the beat (T002)"],
]), "");
push("In this repo: if unsure, run `pnpm check --project <slug>`; T/A/V2 codes in `RULES.md` section 2 map to the rows above.", "");

const out = L.join("\n") + "\n";
if (CHECK) {
  const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8").replace(/\r\n/g, "\n") : "";
  if (cur !== out) { console.error("docs/MOTION_MATH.md is stale. Run: pnpm docs:math"); process.exit(1); }
  console.log("docs/MOTION_MATH.md is up to date.");
} else {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, out);
  console.log(`wrote docs/MOTION_MATH.md (${L.length} lines)`);
}
