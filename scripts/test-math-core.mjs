import test from 'node:test';
import assert from 'node:assert/strict';
import {
  solveSpring,
  solveSpringFrame,
  sampleSpringProgress,
  getSpringSettleDuration,
  getSpringSettleFrames,
  createSpringEase,
  SPRING_PRESETS,
} from '../src/core/spring-solver.ts';
import {
  evaluateQuadraticBezier,
  evaluateCubicBezier,
  createCurvedCursorTrajectory,
  getCubicBezierLength,
  interpolateBezierFrame,
  bezierToSvgPath,
} from '../src/core/bezier-trajectories.ts';
import { generateDeterministicScramble } from '../src/core/recipes.ts';
import {
  printToneCurve,
  mapToInkPaper,
  seededPerFrameFlicker,
} from '../src/core/print-grade.ts';
import {
  countTextUnits,
  calculateRequiredReadingTime,
} from '../src/core/readability-meter.ts';
import {
  computeHomography,
  applyHomography,
  homographyToCssMatrix3d,
} from '../src/core/homography-math.ts';
import { applySample0Guard } from '../src/core/procedural-audio.ts';

test('Spring Solver: Underdamped harmonic oscillator', () => {
  const underdampedConfig = { stiffness: 100, damping: 5, mass: 1 };
  
  // At t = 0, position must be exactly from
  const s0 = solveSpring({ ...underdampedConfig, time: 0, from: 0, to: 100 });
  assert.equal(s0.value, 0);
  assert.equal(s0.progress, 0);

  // During motion, it should advance
  const sMid = solveSpring({ ...underdampedConfig, time: 0.25, from: 0, to: 100 });
  assert.ok(sMid.value > 0);

  // Settle time: eventually progress settles near 1.0
  const sLate = solveSpring({ ...underdampedConfig, time: 3.0, from: 0, to: 100 });
  assert.ok(Math.abs(sLate.progress - 1) < 0.01);
});

test('Spring Solver: Critically damped & Overdamped regimes', () => {
  // Snappy is critically/slightly overdamped
  const sSnappy = solveSpring({ ...SPRING_PRESETS.snappy, time: 0.5, from: 0, to: 1 });
  assert.ok(sSnappy.progress > 0.8 && sSnappy.progress < 1.1);

  // Rigid preset
  const sRigid = solveSpring({ ...SPRING_PRESETS.rigid, time: 0.5, from: 0, to: 1 });
  assert.ok(sRigid.progress > 0.85);
});

test('Spring Solver: Remotion Frame evaluation', () => {
  const f0 = solveSpringFrame({ ...SPRING_PRESETS.snappy, frame: 0, startFrame: 0, fps: 60 });
  assert.equal(f0.value, 0);

  const f60 = solveSpringFrame({ ...SPRING_PRESETS.snappy, frame: 60, startFrame: 0, fps: 60 });
  assert.ok(f60.progress > 0.95);
});

test('Spring Solver: GSAP ease generator and duration', () => {
  const duration = getSpringSettleDuration(SPRING_PRESETS.snappy);
  assert.ok(duration > 0.1 && duration < 2.0);

  const frames = getSpringSettleFrames(SPRING_PRESETS.snappy, 60);
  assert.ok(frames > 10 && frames < 120);

  const ease = createSpringEase(SPRING_PRESETS.snappy);
  assert.equal(ease(0), 0);
  assert.equal(ease(1), 1);
  assert.ok(ease(0.5) > 0.5);
});

test('Bezier Trajectories: Quadratic Bezier evaluation', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 50, y: 100 };
  const p2 = { x: 100, y: 0 };

  const start = evaluateQuadraticBezier(p0, p1, p2, 0);
  assert.equal(start.x, 0);
  assert.equal(start.y, 0);

  const mid = evaluateQuadraticBezier(p0, p1, p2, 0.5);
  assert.equal(mid.x, 50);
  assert.equal(mid.y, 50);

  const end = evaluateQuadraticBezier(p0, p1, p2, 1);
  assert.equal(end.x, 100);
  assert.equal(end.y, 0);
});

test('Bezier Trajectories: Cubic Bezier & Tangents', () => {
  const p0 = { x: 0, y: 0 };
  const p1 = { x: 0, y: 100 };
  const p2 = { x: 100, y: 100 };
  const p3 = { x: 100, y: 0 };

  const start = evaluateCubicBezier(p0, p1, p2, p3, 0);
  assert.equal(start.x, 0);
  assert.equal(start.y, 0);
  assert.ok(start.tangent.y > 0);

  const end = evaluateCubicBezier(p0, p1, p2, p3, 1);
  assert.equal(end.x, 100);
  assert.equal(end.y, 0);

  const length = getCubicBezierLength({ p0, p1, p2, p3 });
  assert.ok(length > 100);
});

test('Bezier Trajectories: Curved Cursor Trajectory Generator', () => {
  const trajectory = createCurvedCursorTrajectory({
    start: { x: 100, y: 100 },
    end: { x: 500, y: 400 },
    curvature: 0.25,
  });

  assert.equal(trajectory.p0.x, 100);
  assert.equal(trajectory.p3.x, 500);

  // SVG path format check
  const svgPath = bezierToSvgPath(trajectory);
  assert.ok(svgPath.startsWith('M 100.0 100.0 C'));
});

test('Recipes: Deterministic Mulberry32 Scramble Generator', () => {
  const target = 'AUTONOMOUS MOTION';
  
  // Progress 0: scrambled
  const scr0 = generateDeterministicScramble(target, 0, 42);
  assert.notEqual(scr0, target);
  assert.equal(scr0.length, target.length);

  // Progress 1: fully resolved
  const scr1 = generateDeterministicScramble(target, 1, 42);
  assert.equal(scr1, target);

  // Same seed produces same sequence
  const scrA = generateDeterministicScramble(target, 0.5, 99);
  const scrB = generateDeterministicScramble(target, 0.5, 99);
  assert.equal(scrA, scrB);
});

test('Spring Solver: Physical initialVelocity & bidirectional displacement', () => {
  // Forward displacement with initial velocity
  const sFwd = solveSpring({ stiffness: 100, damping: 10, time: 0.001, from: 0, to: 100, initialVelocity: 50 });
  assert.ok(sFwd.velocity > 40 && sFwd.velocity < 70, `Velocity should be ~50, got ${sFwd.velocity}`);

  // Backward displacement with initial velocity
  const sBwd = solveSpring({ stiffness: 100, damping: 10, time: 0.001, from: 100, to: 0, initialVelocity: 50 });
  assert.ok(sBwd.velocity > 25 && sBwd.velocity < 55, `Velocity should be ~50, got ${sBwd.velocity}`);

  // Zero displacement (from == to)
  const sZero = solveSpring({ stiffness: 100, damping: 10, time: 1.0, from: 50, to: 50 });
  assert.equal(sZero.value, 50);
  assert.equal(sZero.progress, 1);
  assert.ok(sZero.isSettled);

  // sampleSpringProgress helper
  const p0 = sampleSpringProgress(0, SPRING_PRESETS.snappy);
  assert.equal(p0, 0);
  const pLate = sampleSpringProgress(2.0, SPRING_PRESETS.snappy);
  assert.ok(Math.abs(pLate - 1) < 0.01);
});

test('Bezier Trajectories: interpolateBezierFrame & micro-distance edge cases', () => {
  const trajectory = createCurvedCursorTrajectory({
    start: { x: 100, y: 100 },
    end: { x: 300, y: 300 },
  });

  // Frame interpolation
  const midFrame = interpolateBezierFrame(30, 0, 60, trajectory);
  assert.ok(midFrame.x > 100 && midFrame.x < 300);
  assert.ok(midFrame.y > 100 && midFrame.y < 300);

  // Micro-distance (< 1e-4)
  const tinyTraj = createCurvedCursorTrajectory({
    start: { x: 200, y: 200 },
    end: { x: 200.00001, y: 200.00001 },
  });
  const tinyEval = evaluateCubicBezier(tinyTraj.p0, tinyTraj.p1, tinyTraj.p2, tinyTraj.p3, 0.5);
  assert.ok(!Number.isNaN(tinyEval.x));
  assert.ok(!Number.isNaN(tinyEval.headingDeg));

  // 1px distance
  const onePxTraj = createCurvedCursorTrajectory({
    start: { x: 100, y: 100 },
    end: { x: 101, y: 100 },
  });
  const onePxEval = evaluateCubicBezier(onePxTraj.p0, onePxTraj.p1, onePxTraj.p2, onePxTraj.p3, 0.5);
  assert.ok(!Number.isNaN(onePxEval.x));
  assert.ok(!Number.isNaN(onePxEval.headingDeg));
});

test('Print Grade: Archival S-curve tone mapping & ink-paper transfer', () => {
  // Boundary preserving & clamping
  assert.equal(printToneCurve(0), 0);
  assert.equal(printToneCurve(0.5), 0.5);
  assert.equal(printToneCurve(1.0), 1.0);
  assert.equal(printToneCurve(-0.5), 0);
  assert.equal(printToneCurve(1.5), 1.0);
  assert.equal(printToneCurve(0.3, 0), 0.3); // zero contrast steepness

  // S-curve contrast shift: shadows darker, highlights brighter
  const shadow = printToneCurve(0.25, 0.32);
  assert.ok(shadow < 0.25, `Shadow should be depressed, got ${shadow}`);

  const highlight = printToneCurve(0.75, 0.32);
  assert.ok(highlight > 0.75, `Highlight should be elevated, got ${highlight}`);

  // Ink-Paper mapping
  const ink = [20, 20, 20];
  const paper = [240, 240, 240];

  const at0 = mapToInkPaper(0, ink, paper);
  assert.deepEqual(at0, [20, 20, 20]);

  const at1 = mapToInkPaper(1, ink, paper);
  assert.deepEqual(at1, [240, 240, 240]);

  const atMid = mapToInkPaper(0.5, ink, paper);
  assert.deepEqual(atMid, [130, 130, 130]);

  // Seeded per-frame flicker
  const f1 = seededPerFrameFlicker(10, 0.025, 42);
  const f1Repeat = seededPerFrameFlicker(10, 0.025, 42);
  const f2 = seededPerFrameFlicker(11, 0.025, 42);

  assert.equal(f1, f1Repeat);
  assert.notEqual(f1, f2);
  assert.ok(f1 >= 0.975 && f1 <= 1.025);
});

test('Readability Meter: Dynamic hold calculation & unit counting', () => {
  // Unit counting
  const emptyUnits = countTextUnits('');
  assert.deepEqual(emptyUnits, { cjkChars: 0, latinWords: 0 });

  const nullUnits = countTextUnits(null);
  assert.deepEqual(nullUnits, { cjkChars: 0, latinWords: 0 });

  const cjkOnly = countTextUnits('这是一段中文测试文本');
  assert.equal(cjkOnly.cjkChars, 10);
  assert.equal(cjkOnly.latinWords, 0);

  const latinOnly = countTextUnits('Autonomous multi-device motion graphics studio');
  assert.equal(latinOnly.cjkChars, 0);
  assert.equal(latinOnly.latinWords, 5);

  const mixed = countTextUnits('WhatsApp 32人高清通话');
  assert.equal(mixed.cjkChars, 5);
  assert.equal(mixed.latinWords, 2);

  // Lemomo dynamic reading time: (cjk / 4.5) + (latinWords / 15.0) + 1.5s
  // 15 latin words -> 1.0s + 1.5s = 2.5s
  const latinTime = calculateRequiredReadingTime(0, 15, false);
  assert.equal(latinTime, 2.5);

  // 9 CJK chars -> 2.0s + 1.5s = 3.5s
  const cjkTime = calculateRequiredReadingTime(9, 0, false);
  assert.equal(cjkTime, 3.5);

  // Comparison / Verdict screen holds minimum 2.5s
  const verdictMin = calculateRequiredReadingTime(0, 0, true);
  assert.equal(verdictMin, 2.5);

  // Normal screen minimum hold is 1.5s
  const normalMin = calculateRequiredReadingTime(0, 0, false);
  assert.equal(normalMin, 1.5);

  // Edge cases: NaN and negative parameters gracefully fallback
  const nanTime = calculateRequiredReadingTime(NaN, -5, false);
  assert.equal(nanTime, 1.5);
});

test('Homography Math: 4-point projective transformation & CSS matrix3d', () => {
  // Identity / Affine rectangle mapping
  const srcSquare = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];
  const dstSquare = [
    { x: 0, y: 0 },
    { x: 100, y: 0 },
    { x: 100, y: 100 },
    { x: 0, y: 100 },
  ];

  const H_id = computeHomography(srcSquare, dstSquare);
  const pCenter = applyHomography(H_id, 50, 50);
  assert.ok(Math.abs(pCenter.x - 50) < 1e-6);
  assert.ok(Math.abs(pCenter.y - 50) < 1e-6);

  // Perspective quadrilateral to rectangle
  const srcQuad = [
    { x: 20, y: 20 },
    { x: 180, y: 30 },
    { x: 160, y: 170 },
    { x: 40, y: 160 },
  ];
  const dstRect = [
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 200 },
    { x: 0, y: 200 },
  ];

  const H_persp = computeHomography(srcQuad, dstRect);
  // Corners must map exactly to destination corners
  const c0 = applyHomography(H_persp, srcQuad[0].x, srcQuad[0].y);
  assert.ok(Math.abs(c0.x - dstRect[0].x) < 1e-4);
  assert.ok(Math.abs(c0.y - dstRect[0].y) < 1e-4);

  const c2 = applyHomography(H_persp, srcQuad[2].x, srcQuad[2].y);
  assert.ok(Math.abs(c2.x - dstRect[2].x) < 1e-4);
  assert.ok(Math.abs(c2.y - dstRect[2].y) < 1e-4);

  // CSS matrix3d representation
  const cssMat = homographyToCssMatrix3d(H_persp);
  assert.ok(cssMat.startsWith('matrix3d('));
  assert.ok(cssMat.endsWith(')'));

  // Degenerate collinear points must throw expected error
  const collinear = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 30, y: 30 },
  ];
  assert.throws(() => computeHomography(collinear, dstRect), /Singular or degenerate/);

  // Defensive handling of short / invalid inputs
  assert.deepEqual(applyHomography([], 50, 50), { x: 0, y: 0 });
  assert.equal(homographyToCssMatrix3d([]), 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)');
});

test('Procedural Audio: Sample-0 AAC digital clipping protection', () => {
  const sampleRate = 44100;
  const buffer = new Float32Array(500);
  buffer.fill(1.0); // Hard DC pulse starting at sample 0

  applySample0Guard(buffer, sampleRate, 2.0);

  // Sample 0 must be guaranteed 0.0
  assert.equal(buffer[0], 0);

  // Micro-fade smoothly transitions toward 1.0
  const fadeCount = Math.floor(sampleRate * (2.0 / 1000));
  assert.ok(buffer[Math.floor(fadeCount / 2)] > 0.3 && buffer[Math.floor(fadeCount / 2)] < 0.7);

  // Beyond fade-in window, amplitude remains intact
  assert.equal(buffer[fadeCount + 10], 1.0);

  // Edge cases: empty buffer or zero length
  const emptyBuf = new Float32Array(0);
  assert.doesNotThrow(() => applySample0Guard(emptyBuf, sampleRate));
});

