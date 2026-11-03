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
import {
  computeCurvedBracePath,
  interpolateClusterPositions,
  computeSpotlightConeGeometry,
  generateConfettiParticles,
  evaluateConfettiParticle,
} from '../src/core/tactile-geometry.ts';
import {
  computeWavyRibbonSpline,
  calculateRibbonDashOffset,
  computeCircularAperture,
  computeTiltedPhoneMatrix,
} from '../src/core/mobile-sting-math.ts';
import {
  computeJaggedPaperTear,
  computeMetronomeOscillation,
  computeScatterTrajectories,
  evaluateScatterParticle,
  computeChecklistProgress,
  computePaperCardMatrix,
} from '../src/core/papercraft-math.ts';

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

test('Editorial Specimen: Symmetric registration grid and intersection alignment', () => {
  // Test both 16:9 (1920x1080) and 9:16 (1080x1920)
  for (const [w, h] of [[1920, 1080], [1080, 1920]]) {
    const gridSize = 80;
    const centerX = w / 2;
    const centerY = h / 2;

    const maxStepsX = Math.ceil(centerX / gridSize);
    const maxStepsY = Math.ceil(centerY / gridSize);

    const vX = [];
    for (let s = -maxStepsX; s <= maxStepsX; s++) {
      const x = centerX + s * gridSize;
      if (x >= 0 && x <= w) vX.push(x);
    }

    const hY = [];
    for (let s = -maxStepsY; s <= maxStepsY; s++) {
      const y = centerY + s * gridSize;
      if (y >= 0 && y <= h) hY.push(y);
    }

    // Must contain center line
    assert.ok(vX.includes(centerX), `Grid must contain vertical center line at ${centerX}`);
    assert.ok(hY.includes(centerY), `Grid must contain horizontal center line at ${centerY}`);

    // Nodes at (centerX ± 4*gridSize, centerY ± 2*gridSize) must intersect exact grid lines
    const nodeCoords = [
      { x: centerX - gridSize * 4, y: centerY - gridSize * 2 },
      { x: centerX + gridSize * 4, y: centerY - gridSize * 2 },
      { x: centerX - gridSize * 4, y: centerY + gridSize * 2 },
      { x: centerX + gridSize * 4, y: centerY + gridSize * 2 },
    ];

    for (const node of nodeCoords) {
      assert.ok(vX.includes(node.x), `Vertical line must intersect node at x=${node.x}`);
      assert.ok(hY.includes(node.y), `Horizontal line must intersect node at y=${node.y}`);
    }
  }
});

test('Editorial Specimen: Dogleg leader line arc length & 360 deg arc clamping', () => {
  // Leader line arc length
  const sX = 960;
  const sY = 540;
  const tX = 1500;
  const tY = 850;
  const elbowX = sX + Math.abs(tX - sX) * 0.45;
  const elbowY = tY;

  const seg1 = Math.hypot(elbowX - sX, elbowY - sY);
  const seg2 = Math.hypot(tX - elbowX, tY - elbowY);
  const totalLength = Math.max(1, Math.ceil(seg1 + seg2));

  assert.ok(totalLength > 600, `Total length must reflect true Euclidean path: ${totalLength}`);

  // Measurement arc 360 deg clamping
  const testSpan = (startAngle, endAngle) => {
    const span = endAngle - startAngle;
    const sign = span < 0 ? -1 : 1;
    return Math.abs(span) >= 360 ? sign * 359.99 : span;
  };

  assert.equal(testSpan(0, 360), 359.99);
  assert.equal(testSpan(0, -360), -359.99);
  assert.equal(testSpan(0, 90), 90);
});

test('Tactile Geometry: Curved brace spline math and boundary conditions', () => {
  // Standard downward brace
  const braceDown = computeCurvedBracePath({
    x1: 100,
    x2: 500,
    y: 50,
    depth: 30,
    orientation: 'down',
  });

  assert.equal(braceDown.midX, 300);
  assert.equal(braceDown.tipY, 80);
  assert.equal(braceDown.width, 400);
  assert.equal(braceDown.depth, 30);
  assert.ok(braceDown.path.startsWith('M 100.00 50.00'));
  assert.ok(braceDown.path.includes('C'));
  assert.ok(braceDown.path.includes('L'));

  // Standard upward brace
  const braceUp = computeCurvedBracePath({
    x1: 100,
    x2: 500,
    y: 100,
    depth: 30,
    orientation: 'up',
  });
  assert.equal(braceUp.tipY, 70);
  assert.equal(braceUp.depth, -30);

  // Inverted inputs (x1 > x2) should normalize left to right
  const braceInverted = computeCurvedBracePath({
    x1: 500,
    x2: 100,
    y: 50,
    depth: 30,
    orientation: 'down',
  });
  assert.equal(braceInverted.midX, 300);
  assert.equal(braceInverted.width, 400);

  // Micro-distance / zero width degenerate boundary
  const braceZero = computeCurvedBracePath({
    x1: 250,
    x2: 250,
    y: 50,
    depth: 20,
  });
  assert.equal(braceZero.width, 0);
  assert.equal(braceZero.midX, 250);
  assert.ok(braceZero.path.includes('L'));
});

test('Tactile Geometry: 1-to-3 capsule cluster spacing and stagger interpolation', () => {
  const spacing = 200;
  const stagger = 0.15;

  // At progress = 0: center is fixed, wings are collapsed at x = 0 with opacity 0
  const p0 = interpolateClusterPositions(0, spacing, stagger);
  assert.equal(p0.length, 3);
  assert.equal(p0[0].x, 0);
  assert.equal(p0[0].opacity, 0);
  assert.equal(p0[0].scale, 0.8);
  assert.equal(p0[1].x, 0);
  assert.equal(p0[1].opacity, 1);
  assert.equal(p0[1].scale, 1);
  assert.equal(p0[2].x, 0);
  assert.equal(p0[2].opacity, 0);
  assert.equal(p0[2].scale, 0.8);

  // At progress = 1: fully expanded
  const p1 = interpolateClusterPositions(1, spacing, stagger);
  assert.equal(p1[0].x, -spacing);
  assert.equal(p1[0].opacity, 1);
  assert.equal(p1[0].scale, 1);
  assert.equal(p1[1].x, 0);
  assert.equal(p1[1].opacity, 1);
  assert.equal(p1[2].x, spacing);
  assert.equal(p1[2].opacity, 1);
  assert.equal(p1[2].scale, 1);

  // Stagger check at progress = 0.10:
  // Left wing has started moving (progress > 0), right wing is still locked at 0 (<= stagger)
  const pMid = interpolateClusterPositions(0.1, spacing, stagger);
  assert.ok(pMid[0].opacity > 0, 'Left pill should have begun expanding');
  assert.ok(pMid[0].x < 0, 'Left pill x should be negative');
  assert.equal(pMid[2].opacity, 0, 'Right pill should still be at 0 due to stagger delay');
  assert.equal(pMid[2].x, 0, 'Right pill x should be 0 due to stagger delay');

  // Clamping guard: negative or overshooting progress should clamp safely
  const pNeg = interpolateClusterPositions(-0.5, spacing, stagger);
  assert.equal(pNeg[0].x, 0);
  assert.equal(pNeg[0].opacity, 0);

  const pOver = interpolateClusterPositions(1.5, spacing, stagger);
  assert.equal(pOver[0].x, -spacing);
  assert.equal(pOver[2].x, spacing);

  // Extreme stagger guards: stagger >= 1 or negative stagger must not crash or yield NaN
  const pStaggerOver = interpolateClusterPositions(0.5, spacing, 1.5);
  assert.ok(!Number.isNaN(pStaggerOver[0].x));
  assert.ok(!Number.isNaN(pStaggerOver[2].x));
  assert.ok(pStaggerOver[0].opacity >= 0 && pStaggerOver[0].opacity <= 1);

  const pStaggerNeg = interpolateClusterPositions(0.5, spacing, -0.5);
  assert.ok(!Number.isNaN(pStaggerNeg[0].x));
  assert.ok(!Number.isNaN(pStaggerNeg[2].x));
});

test('Tactile Geometry: Spotlight cone path trapezoid geometry and beam spreading angle', () => {
  const topCenterX = 960;
  const topY = 0;
  const topWidth = 100;
  const bottomWidth = 700;
  const height = 600;

  const geom = computeSpotlightConeGeometry({
    topCenterX,
    topY,
    topWidth,
    bottomWidth,
    height,
  });

  // Vertices check
  assert.equal(geom.vertices.length, 4);
  assert.deepEqual(geom.vertices[0], { x: 910, y: 0 });
  assert.deepEqual(geom.vertices[1], { x: 1010, y: 0 });
  assert.deepEqual(geom.vertices[2], { x: 1310, y: 600 });
  assert.deepEqual(geom.vertices[3], { x: 610, y: 600 });

  // Area: ((topWidth + bottomWidth) / 2) * height = 400 * 600 = 240,000
  assert.equal(geom.area, 240000);

  // Spreading angle: 2 * atan((350 - 50) / 600) = 2 * atan(0.5) rad = 2 * 0.463647 rad ≈ 53.13 deg
  assert.ok(Math.abs(geom.beamAngleDeg - 53.13) < 0.1);

  // Midpoint
  assert.deepEqual(geom.midpoint, { x: 960, y: 300 });

  // SVG Path string format
  assert.ok(geom.path.startsWith('M 910.00 0.00 L 1010.00 0.00'));
  assert.ok(geom.path.endsWith('Z'));

  // Parallel beam cylinder edge case (topWidth == bottomWidth)
  const cylinder = computeSpotlightConeGeometry({
    topCenterX: 500,
    topY: 10,
    topWidth: 200,
    bottomWidth: 200,
    height: 400,
  });
  assert.equal(cylinder.beamAngleDeg, 0);
  assert.equal(cylinder.area, 200 * 400);
});

test('Tactile Geometry: Deterministic square confetti burst particle lifecycle', () => {
  const seed = 77;
  const count = 16;
  const radius = 120;

  // Mulberry32 determinism check: same seed yields identical initial particles
  const particlesA = generateConfettiParticles(count, seed, radius);
  const particlesB = generateConfettiParticles(count, seed, radius);
  assert.deepEqual(particlesA, particlesB);

  // Progress 0: all particles at center, opacity 0, scale 0
  for (const p of particlesA) {
    const s0 = evaluateConfettiParticle(p, 0);
    assert.equal(s0.x, 0);
    assert.equal(s0.y, 0);
    assert.equal(s0.opacity, 0);
    assert.equal(s0.scale, 0);
  }

  // Progress 0.3: burst outward, opacity > 0, scale > 0
  for (const p of particlesA) {
    const sMid = evaluateConfettiParticle(p, 0.3);
    assert.ok(Math.hypot(sMid.x, sMid.y) > 0);
    assert.ok(sMid.opacity > 0.8);
    assert.ok(sMid.scale > 0.8);
  }

  // Progress 1.0+: completely cleared, opacity = 0, scale = 0
  for (const p of particlesA) {
    const sEnd = evaluateConfettiParticle(p, 1.0);
    assert.equal(sEnd.opacity, 0);
    assert.equal(sEnd.scale, 0);

    const sOver = evaluateConfettiParticle(p, 1.2);
    assert.equal(sOver.opacity, 0);
    assert.equal(sOver.scale, 0);
  }
});

test('Mobile Sting Math: Wavy ribbon spline path, arc length, and strokeDashoffset', () => {
  // Horizontal 16:9 ribbon
  const ribbon = computeWavyRibbonSpline({
    startX: 0,
    startY: 540,
    endX: 1920,
    endY: 540,
    waveCount: 3,
    amplitude: 120,
  });

  assert.ok(ribbon.path.startsWith('M 0.00 540.00'));
  assert.ok(ribbon.path.includes(' C '));
  assert.equal(ribbon.points.length, 4); // start + 3 wave endpoints
  assert.equal(ribbon.points[0].x, 0);
  assert.equal(ribbon.points[3].x, 1920);

  // Due to sinusoidal wave curves, total arc length must exceed direct Euclidean distance (1920)
  assert.ok(ribbon.totalLength > 1920, `Total arc length ${ribbon.totalLength} must exceed 1920`);

  // Vertical 9:16 ribbon (normal vector displacement across X axis)
  const verticalRibbon = computeWavyRibbonSpline({
    startX: 540,
    startY: 0,
    endX: 540,
    endY: 1920,
    waveCount: 3,
    amplitude: 100,
  });
  assert.ok(verticalRibbon.path.startsWith('M 540.00 0.00'));
  assert.ok(verticalRibbon.totalLength > 1920, `Vertical ribbon total length ${verticalRibbon.totalLength} must exceed 1920`);
  // Vertical ribbon must oscillate in X: control points must not stay fixed at x = 540
  assert.ok(verticalRibbon.path.includes('440.00') || verticalRibbon.path.includes('640.00'), 'Vertical ribbon must displace laterally along X');

  // Degenerate zero-length boundary case
  const degenRibbon = computeWavyRibbonSpline({
    startX: 200,
    startY: 200,
    endX: 200,
    endY: 200,
  });
  assert.equal(degenRibbon.totalLength, 1);
  assert.ok(degenRibbon.path.startsWith('M 200.00 200.00'));

  // strokeDashoffset calculations & clamping
  const len = ribbon.totalLength;
  assert.equal(calculateRibbonDashOffset(0, len), len);
  assert.equal(calculateRibbonDashOffset(1, len), 0);
  assert.ok(Math.abs(calculateRibbonDashOffset(0.5, len) - len * 0.5) < 1e-4);
  assert.equal(calculateRibbonDashOffset(-0.25, len), len);
  assert.equal(calculateRibbonDashOffset(1.25, len), 0);
});

test('Mobile Sting Math: Circular aperture radius interpolation and mask geometry', () => {
  const maxRadius = 1400;

  // At progress = 0: collapsed circle, not revealed
  const ap0 = computeCircularAperture({ progress: 0, maxRadius });
  assert.equal(ap0.radius, 0);
  assert.equal(ap0.isFullyRevealed, false);
  assert.equal(ap0.opacity, 0);
  assert.equal(ap0.clipPath, 'circle(0.00px at 50% 50%)');
  assert.equal(ap0.centerXStr, '50%');
  assert.equal(ap0.centerYStr, '50%');

  // At progress = 0.5 (linear exponent 1.0): halfway radius
  const apMid = computeCircularAperture({ progress: 0.5, maxRadius });
  assert.equal(apMid.radius, 700);
  assert.equal(apMid.isFullyRevealed, false);
  assert.ok(apMid.scale > 0.8 && apMid.scale < 1.0);
  assert.equal(apMid.clipPath, 'circle(700.00px at 50% 50%)');

  // At progress = 1.0: fully revealed
  const ap1 = computeCircularAperture({ progress: 1.0, maxRadius });
  assert.equal(ap1.radius, 1400);
  assert.equal(ap1.isFullyRevealed, true);
  assert.equal(ap1.opacity, 1.0);
  assert.equal(ap1.scale, 1.0);

  // Custom numeric center coordinates with CSS px unit formatting
  const apCustom = computeCircularAperture({
    progress: 0.25,
    maxRadius: 1000,
    centerX: 960,
    centerY: 540,
  });
  assert.equal(apCustom.clipPath, 'circle(250.00px at 960.00px 540.00px)');
  assert.equal(apCustom.centerXStr, '960.00px');
  assert.equal(apCustom.centerYStr, '540.00px');

  // Clamping boundary safety
  const apNeg = computeCircularAperture({ progress: -0.5, maxRadius });
  assert.equal(apNeg.radius, 0);
  const apOver = computeCircularAperture({ progress: 1.5, maxRadius });
  assert.equal(apOver.radius, 1400);
  assert.equal(apOver.isFullyRevealed, true);
});

test('Mobile Sting Math: 3/4 phone perspective transform matrix and idle tilt/bob', () => {
  // Phase 0: nominal initial tilt
  const p0 = computeTiltedPhoneMatrix({
    rotateX: 8,
    rotateY: -16,
    perspective: 1200,
    floatPhase: 0,
    floatAmplitude: 1.5,
  });

  assert.equal(p0.effectiveRotateX, 8); // sin(0) = 0
  assert.ok(Math.abs(p0.effectiveRotateY - (-16 + 1.5 * 0.8)) < 1e-4); // cos(0) = 1 -> -16 + 1.2 = -14.8
  assert.equal(p0.effectiveTranslateY, 0); // sin(0) = 0
  assert.ok(p0.transform.includes('perspective(1200px)'));
  assert.ok(p0.transform.includes('rotateX(8.00deg)'));
  assert.ok(p0.transform.includes('rotateY(-14.80deg)'));
  assert.ok(!p0.transformWithoutPerspective.includes('perspective'));

  // Without perspective flag
  const pNoPersp = computeTiltedPhoneMatrix({
    rotateX: 8,
    rotateY: -16,
    perspective: 1200,
    includePerspective: false,
  });
  assert.ok(!pNoPersp.transform.includes('perspective'));
  assert.equal(pNoPersp.transform, pNoPersp.transformWithoutPerspective);

  // Phase PI/2: oscillation excursion
  const pHalfPi = computeTiltedPhoneMatrix({
    rotateX: 8,
    rotateY: -16,
    perspective: 1200,
    floatPhase: Math.PI / 2,
    floatAmplitude: 1.5,
  });
  // sin(PI/2) = 1 -> effectiveRotateX = 8 + 1.5 = 9.5
  assert.ok(Math.abs(pHalfPi.effectiveRotateX - 9.5) < 1e-4);
  // cos(PI/2) = 0 -> effectiveRotateY = -16
  assert.ok(Math.abs(pHalfPi.effectiveRotateY - (-16)) < 1e-4);

  // Custom translation, scale, and determinism check
  const pCustomA = computeTiltedPhoneMatrix({
    translateX: 50,
    translateY: -30,
    scale: 1.1,
    floatPhase: 1.23,
  });
  const pCustomB = computeTiltedPhoneMatrix({
    translateX: 50,
    translateY: -30,
    scale: 1.1,
    floatPhase: 1.23,
  });
  assert.equal(pCustomA.transform, pCustomB.transform);
  assert.equal(pCustomA.scale, 1.1);
  assert.equal(pCustomA.effectiveTranslateX, 50);
});

test('Papercraft Math: Jagged paper-tear vertex generation, polygon paths, and determinism', () => {
  const width = 1920;
  const height = 1080;
  const segments = 24;
  const seed = 42;

  // 1. Vertical tear
  const tearV = computeJaggedPaperTear({
    width,
    height,
    segments,
    seed,
    direction: 'vertical',
    progress: 0,
    amplitude: 20,
  });

  assert.equal(tearV.points.length, segments + 1);
  assert.ok(tearV.tearLinePath.startsWith('M '));
  assert.ok(tearV.pieceAPath.startsWith('M 0 0'));
  assert.ok(tearV.pieceBPath.includes('Z'));

  // Points must lie within bounds
  for (const pt of tearV.points) {
    assert.ok(pt.x >= 0 && pt.x <= width, `x=${pt.x} out of bounds`);
    assert.ok(pt.y >= 0 && pt.y <= height, `y=${pt.y} out of bounds`);
  }

  // 2. Determinism: identical seed must generate identical paths and points
  const tearV2 = computeJaggedPaperTear({
    width,
    height,
    segments,
    seed,
    direction: 'vertical',
    progress: 0,
    amplitude: 20,
  });
  assert.equal(tearV.tearLinePath, tearV2.tearLinePath);
  assert.equal(tearV.pieceAPath, tearV2.pieceAPath);
  assert.deepEqual(tearV.points[5], tearV2.points[5]);

  // 3. Progress displacement check
  const tearOpen = computeJaggedPaperTear({
    width,
    height,
    segments,
    seed,
    direction: 'vertical',
    progress: 1.0,
    tearGap: 100,
  });
  assert.equal(tearOpen.displacementA.x, -100);
  assert.equal(tearOpen.displacementB.x, 100);
  assert.ok(tearOpen.displacementA.rotate < 0);
  assert.ok(tearOpen.displacementB.rotate > 0);

  // 4. Horizontal tear
  const tearH = computeJaggedPaperTear({
    width,
    height,
    segments: 16,
    seed: 99,
    direction: 'horizontal',
    progress: 0.5,
    tearGap: 60,
  });
  assert.equal(tearH.points.length, 17);
  assert.ok(tearH.tearLinePath.startsWith('M '));
  assert.equal(tearH.displacementA.y, -30);
  assert.equal(tearH.displacementB.y, 30);
  // Verify Piece A covers top half and Piece B covers bottom half without duplicated points
  assert.ok(tearH.pieceAPath.startsWith(`M 0 0 L ${width} 0`));
  assert.ok(tearH.pieceAPath.endsWith(' Z'));
  assert.ok(tearH.pieceBPath.includes(`L ${width} ${height} L 0 ${height} Z`));

  // 5. Diagonal tear (must properly connect all 4 frame corners without truncation)
  const tearD = computeJaggedPaperTear({
    width,
    height,
    segments: 20,
    seed: 123,
    direction: 'diagonal',
    progress: 0.2,
  });
  assert.equal(tearD.points.length, 21);
  // Piece A must connect top-left corner (0,0), top-right (width, 0), tear, and bottom-left (0, height)
  assert.ok(tearD.pieceAPath.startsWith(`M 0 0 L ${width} 0`));
  assert.ok(tearD.pieceAPath.endsWith(`L 0 ${height} Z`));
  // Piece B must connect tear points, top-right (width, 0), bottom-right (width, height), and bottom-left (0, height)
  assert.ok(tearD.pieceBPath.includes(`L ${width} 0 L ${width} ${height} L 0 ${height} Z`));

  // 6. Edge cases: segment count clamping and negative/overshooting progress
  const tearClamped = computeJaggedPaperTear({
    width: 800,
    height: 600,
    segments: 2, // Must clamp to at least 8 segments
    progress: -0.5,
  });
  assert.ok(tearClamped.points.length >= 9, 'Must enforce at least safeSegments >= 8');
  assert.equal(tearClamped.displacementA.x, 0, 'Progress < 0 must clamp displacement to 0');
});

test('Papercraft Math: Metronome pendulum harmonic oscillation, turnaround easing, and frequency', () => {
  const bpm = 60; // 60 BPM = 1 beat per second -> f = 60 / 120 = 0.5 Hz (period = 2.0s)
  const maxAngle = 30;

  // t = 0: Center position (sin(0) = 0), maximum angular velocity
  const m0 = computeMetronomeOscillation({ time: 0, bpm, maxAngle });
  assert.equal(m0.angleDeg, 0);
  assert.equal(m0.normalizedPosition, 0);
  assert.equal(m0.isTurnaround, false);
  assert.ok(m0.angularVelocity > 0); // Moving towards right
  assert.equal(m0.frequencyHz, 0.5);

  // t = 0.5s: Quarter period -> peak excursion right (sin(pi/2) = 1)
  const mPeakRight = computeMetronomeOscillation({ time: 0.5, bpm, maxAngle });
  assert.ok(Math.abs(mPeakRight.normalizedPosition - 1.0) < 1e-3);
  assert.ok(Math.abs(mPeakRight.angleDeg - maxAngle) < 0.1);
  assert.equal(mPeakRight.isTurnaround, true);
  // Velocity drops near zero at peak reversal
  assert.ok(Math.abs(mPeakRight.angularVelocity) < 1e-2);

  // t = 1.0s: Center passing back to left (sin(pi) = 0), negative velocity
  const mCenter = computeMetronomeOscillation({ time: 1.0, bpm, maxAngle });
  assert.ok(Math.abs(mCenter.normalizedPosition) < 1e-3);
  assert.ok(mCenter.angularVelocity < 0);
  assert.equal(mCenter.isMovingRight, false);

  // t = 1.5s: Peak excursion left (sin(3pi/2) = -1)
  const mPeakLeft = computeMetronomeOscillation({ time: 1.5, bpm, maxAngle });
  assert.ok(Math.abs(mPeakLeft.normalizedPosition - (-1.0)) < 1e-3);
  assert.ok(Math.abs(mPeakLeft.angleDeg - (-maxAngle)) < 0.1);
  assert.equal(mPeakLeft.isTurnaround, true);

  // Damping: amplitude decays over time
  const mDamped = computeMetronomeOscillation({ time: 2.5, bpm, maxAngle, damping: 0.8 });
  assert.ok(Math.abs(mDamped.normalizedPosition) < Math.exp(-0.8 * 2.5));
});

test('Papercraft Math: Radial scatter vector dynamics, trajectories, and gravity drift', () => {
  const count = 10;
  const minDistance = 100;
  const maxDistance = 300;
  const seed = 55;

  const trajectories = computeScatterTrajectories({
    count,
    minDistance,
    maxDistance,
    seed,
  });

  assert.equal(trajectories.length, count);

  // Distance bounds and trajectory properties
  for (const t of trajectories) {
    assert.ok(t.distance >= minDistance && t.distance <= maxDistance);
    assert.ok(t.scalePeak >= 1.0);
    assert.ok(t.delay >= 0 && t.delay < 0.2);
  }

  // Determinism
  const trajectories2 = computeScatterTrajectories({
    count,
    minDistance,
    maxDistance,
    seed,
  });
  assert.deepEqual(trajectories[0], trajectories2[0]);
  assert.deepEqual(trajectories[5], trajectories2[5]);

  // Particle evaluation at progress = 0
  const p0 = evaluateScatterParticle(trajectories[0], 0, 500, 400);
  assert.equal(p0.scale, 0);
  assert.equal(p0.opacity, 0);

  // Particle evaluation at progress = 0.5
  const pMid = evaluateScatterParticle(trajectories[0], 0.5, 500, 400, 50);
  assert.ok(pMid.scale > 0.8);
  assert.ok(pMid.opacity > 0.8);
  // Due to gravity, mid y should have downward component
  assert.ok(Math.hypot(pMid.x - 500, pMid.y - 400) > 30);

  // Particle evaluation at progress = 1.0: distance settled
  const pEnd = evaluateScatterParticle(trajectories[0], 1.0, 500, 400, 50);
  assert.ok(Math.abs(pEnd.scale - 1.0) < 1e-2);
  assert.equal(pEnd.opacity, 1.0);
  assert.equal(pEnd.rotation, Number(trajectories[0].rotationEnd.toFixed(2)));

  // Checklist Scrubber helper test
  const scrub = computeChecklistProgress(4, 0.5, 200);
  assert.equal(scrub.activeIndex, 1);
  assert.deepEqual(scrub.completedIndices, [0, 1]);

  // PaperCard matrix helper test
  const cardMat = computePaperCardMatrix({ rotateX: 5, rotateY: -4, elevation: 2 });
  assert.ok(cardMat.transform.includes('rotateX(5.00deg)'));
  assert.ok(cardMat.transform.includes('rotateY(-4.00deg)'));
  assert.ok(cardMat.boxShadow.includes('rgba(45, 40, 42'));
});

test('Dark Red Audio: Equalizer bar height deterministic calculation & boundary clamping', async () => {
  const { computeEqualizerBarHeight } = await import('../src/core/procedural-audio.ts');

  const totalBars = 32;
  const maxHeight = 80;

  // Clamping within bounds [6, maxHeight]
  for (let i = 0; i < totalBars; i++) {
    const h = computeEqualizerBarHeight(i, totalBars, 0, maxHeight);
    assert.ok(h >= 6, `Bar ${i} height must be >= minHeight 6`);
    assert.ok(h <= maxHeight, `Bar ${i} height must be <= maxHeight ${maxHeight}`);
  }

  // Exact frame determinism
  const hF30_A = computeEqualizerBarHeight(12, totalBars, 30, maxHeight);
  const hF30_B = computeEqualizerBarHeight(12, totalBars, 30, maxHeight);
  assert.equal(hF30_A, hF30_B, 'Heights evaluated at same frame must be strictly equal');

  // Evolution over frames
  const hF60 = computeEqualizerBarHeight(12, totalBars, 60, maxHeight);
  assert.ok(typeof hF60 === 'number');
});

test('Deconstructive Typography: Layered timing progress, fragment evaluation, and phase mapper', async () => {
  const {
    computeLayeredTimingProgress,
    evaluateFragmentState,
    getDeconstructivePhase,
  } = await import('../src/core/deconstructive-type-math.ts');

  // 1. Layered Timing Progress
  // Primary (timingOrder: 0) starts immediately
  const p0 = computeLayeredTimingProgress(0, 0, 30, 0);
  assert.equal(p0, 0);
  const p15 = computeLayeredTimingProgress(15, 0, 30, 0);
  assert.ok(p15 > 0.5 && p15 < 1.0);
  const p30 = computeLayeredTimingProgress(30, 0, 30, 0);
  assert.equal(p30, 1.0);

  // Delayed secondary (timingOrder: 1) has zero progress at frame 2
  const pDelayed = computeLayeredTimingProgress(2, 0, 30, 1);
  assert.equal(pDelayed, 0);

  // 2. Fragment State Evaluation
  const testFrag = {
    id: 'stem-h1',
    type: 'stem',
    targetX: 100,
    targetY: 200,
    targetWidth: 12,
    targetHeight: 64,
    clusterX: 50,
    clusterY: 80,
    clusterRotation: -45,
    timingOrder: 0,
  };

  const stateStart = evaluateFragmentState(testFrag, 0, 0);
  assert.equal(stateStart.x, 50);
  assert.equal(stateStart.y, 80);
  assert.equal(stateStart.rotation, -45);

  const stateEnd = evaluateFragmentState(testFrag, 1.0, 1.0);
  assert.equal(stateEnd.x, 100);
  assert.equal(stateEnd.y, 200);
  assert.equal(stateEnd.rotation, 0);

  // 3. Phase Mapper
  const phaseOpen = getDeconstructivePhase(3, 60); // 0.05s
  assert.equal(phaseOpen.phaseName, 'abstract-open');
  assert.equal(phaseOpen.isHero, false);

  const phaseHero = getDeconstructivePhase(295, 60); // 4.91s
  assert.equal(phaseHero.phaseName, 'evolve-hero-climax');
  assert.equal(phaseHero.isHero, true);
});

test('Sculptural Reel Math: Diagonal sweep path, perspective disc cascade, and beveled ring transform', async () => {
  const {
    computeDiagonalSweepPath,
    computeDiscCascadePositions,
    computeBeveledRingTransform,
  } = await import('../src/core/sculptural-reel-math.ts');

  // 1. Diagonal sweep path polygon
  const sweep = computeDiagonalSweepPath(0.5, 1, 4, 1920, 1080);
  assert.ok(sweep.pathD.startsWith('M '));
  assert.ok(sweep.pathD.includes('L '));
  assert.ok(sweep.pathD.endsWith('Z'));
  assert.ok(sweep.fillOpacity >= 0 && sweep.fillOpacity <= 1.0);

  // 2. Perspective disc cascade
  const cascade = computeDiscCascadePositions(5, 1.0, 50, 25);
  assert.equal(cascade.length, 5);
  // Settled positions at progress = 1.0 must be staggered in Z
  assert.ok(cascade[0].z > cascade[4].z, 'First disc must be elevated above last disc');
  assert.equal(cascade[2].x, 0, 'Center disc must be at x = 0');

  // 3. Beveled ring transform
  const ringTrans = computeBeveledRingTransform(60);
  assert.ok(ringTrans.transform.includes('perspective(1200px)'));
  assert.ok(ringTrans.transform.includes('rotateX('));
  assert.ok(ringTrans.transform.includes('rotateY('));
  assert.ok(ringTrans.lightReflectionAngle >= 0 && ringTrans.lightReflectionAngle < 360);
});

test('Promo 20s Math: Write-on progress, warp shape geometry, and vertical panel wipe', async () => {
  const {
    computeWriteOnProgress,
    computeWarpShapePath,
    computeVerticalPanelWipe,
  } = await import('../src/core/promo-20s-math.ts');

  // 1. Write-on script progress
  const writeStart = computeWriteOnProgress(0, 720);
  assert.equal(writeStart.dashOffset, 720);
  assert.equal(writeStart.underlineProgress, 0);

  const writeMid = computeWriteOnProgress(0.5, 720);
  assert.ok(writeMid.dashOffset < 720 && writeMid.dashOffset > 0);
  assert.ok(typeof writeMid.stylusX === 'number');
  assert.ok(typeof writeMid.stylusY === 'number');

  const writeEnd = computeWriteOnProgress(1.0, 720);
  assert.equal(writeEnd.dashOffset, 0);
  assert.equal(writeEnd.underlineProgress, 1.0);

  // 2. Warp shape closed path
  const warpPath = computeWarpShapePath(30, 200, 300, 300, 20);
  assert.ok(warpPath.startsWith('M '));
  assert.ok(warpPath.includes(' Q '));
  assert.ok(warpPath.endsWith(' Z'));

  // 3. Vertical panel wipe
  const panel0 = computeVerticalPanelWipe(0.2, 0, 4);
  assert.ok(panel0.translateYPercent >= -100 && panel0.translateYPercent <= 100);
});






