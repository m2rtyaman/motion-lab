import test from 'node:test';
import assert from 'node:assert/strict';

const origWarn = console.warn;
console.warn = (...a) => { if (!a.join(' ').includes('Missing plugin')) origWarn(...a); };
const { default: gsap } = await import('gsap');
gsap.config({ nullTargetWarn: false });
const P = await import('../src/core/physics.ts');
const { bounce, anticipate, launch, pendulum, followThrough, arcMove, movingHold, walkCycle, rigWalk, idleBreath, lookAt, react, turn, rigParts, rigLegIK, RIG_GEOM, PHYSICS_CATALOG } = P;

const el = () => ({ y: 0, x: 0, scaleX: 1, scaleY: 1, rotate: 0 });
const fresh = () => gsap.timeline({ paused: true });
const EPS = 1e-6;
const FORBIDDEN = /^(width|height|top|left|right|bottom|margin|padding)/;
const ALLOWED = new Set(['x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'opacity', 'filter', 'transformOrigin',
  'duration', 'ease', 'data', 'keyframes', 'overwrite', 'repeat', 'immediateRender', 'startAt', 'parent', 'lazy', 'delay']);
const endOf = (tl) => Math.max(...tl.getChildren(false).map((k) => k.startTime() + k.totalDuration()));

function checkTags(tl, name, start) {
  const kids = tl.getChildren(false);
  assert.ok(kids.length >= 1);
  for (const k of kids) {
    assert.equal(k.data?.preset, `physics:${name}`);
    for (const key of Object.keys(k.vars)) {
      assert.ok(!FORBIDDEN.test(key), `layout prop ${key}`);
      assert.ok(ALLOWED.has(key), `unexpected prop ${key}`);
      if (key === 'keyframes') for (const f of k.vars.keyframes) for (const kk of Object.keys(f)) assert.ok(ALLOWED.has(kk) && !FORBIDDEN.test(kk), `keyframe prop ${kk}`);
    }
  }
  assert.ok(Math.abs(Math.min(...kids.filter((k) => k.duration() > 0).map((k) => k.startTime())) - start) < EPS, 'starts at `at`');
}

test('catalog lists every exported helper', () => {
  assert.deepEqual(Object.keys(PHYSICS_CATALOG).sort(), ['anticipate', 'arcMove', 'bounce', 'followThrough', 'idleBreath', 'launch', 'lookAt', 'movingHold', 'pendulum', 'react', 'rigWalk', 'turn', 'walkCycle']);
});

test('bounce: tagged, duration matches bounceSeconds, heights decay by restitution', () => {
  const o = el(); const tl = fresh();
  const opts = { height: 300, bounces: 4, restitution: 0.6 };
  bounce(tl, o, 1, opts);
  checkTags(tl, 'bounce', 1);
  assert.ok(Math.abs(endOf(tl) - 1 - P.bounceSeconds(opts)) < EPS, `end ${endOf(tl) - 1} vs ${P.bounceSeconds(opts)}`);
  const m = P.bounceModel(opts);
  for (let n = 1; n <= 4; n++) {
    tl.seek(1 + m.contacts[n - 1] + m.hold + m.legs[n], false); // apex of rebound n
    assert.ok(Math.abs(o.y + 300 * 0.6 ** n) < 0.5, `apex ${n}: y=${o.y}, want ${-300 * 0.6 ** n}`);
    if (n > 1) assert.ok(m.apexes[n] < m.apexes[n - 1]);
    assert.ok(Math.abs(m.legs[n] / m.legs[n - 1] - Math.sqrt(0.6)) < 1e-9, 'duration scales by sqrt(restitution)');
    tl.seek(1 + m.contacts[n - 1] + m.hold / 2, false);
    assert.ok(Math.abs(o.y) < 1e-6, 'grounded during the contact hold');
  }
  tl.seek(1 + m.contacts[4], false);
  assert.ok(Math.abs(o.y) < 0.01, 'ends on the ground');
});

test('bounce: squash/stretch preserves volume within 5% at every frame', () => {
  for (const squash of ['soft', 'normal', 'strong']) {
    const o = el(); const tl = fresh();
    const opts = { height: 400, bounces: 5, restitution: 0.7, squash };
    bounce(tl, o, 0, opts);
    const total = P.bounceSeconds(opts);
    let minSY = 1, maxSY = 1;
    for (let f = 0; f <= Math.ceil(total * 60); f++) {
      tl.seek(f / 60, false);
      const vol = o.scaleX * o.scaleY;
      assert.ok(Math.abs(vol - 1) < 0.05, `${squash} f${f}: scaleX*scaleY=${vol.toFixed(3)}`);
      minSY = Math.min(minSY, o.scaleY); maxSY = Math.max(maxSY, o.scaleY);
    }
    assert.ok(minSY < 1 && maxSY > 1, 'both squash and stretch occur');
  }
});

test('bounce: travel is linear in x and bouncePoint matches the tweens', () => {
  const o = el(); const tl = fresh();
  const opts = { height: 400, bounces: 4, restitution: 0.65, travel: 1300 };
  bounce(tl, o, 0, opts);
  const end = P.bounceModel(opts).contacts[4];
  for (let f = 1; f <= end * 60; f += 3) {
    tl.seek(f / 60, false);
    const p = P.bouncePoint(f / 60, opts);
    assert.ok(Math.abs(p.x - o.x) < 0.01 && Math.abs(p.y - o.y) < 0.01, `f${f}: (${p.x},${p.y}) vs (${o.x},${o.y})`);
  }
  tl.seek(end, false);
  assert.ok(Math.abs(o.x - 1300) < 0.01, 'travelled the full distance');
});

test('bounce: options are clamped, evil input cannot escape', () => {
  const a = P.bounceModel({ height: 1e9, bounces: 99, restitution: 5 });
  assert.equal(a.h, 600); assert.equal(a.bounces, 6); assert.equal(a.r, 0.9);
  const b = P.bounceModel({ height: -5, bounces: 0, restitution: 0, squash: 'huge' });
  assert.equal(b.h, 40); assert.equal(b.bounces, 1); assert.equal(b.r, 0.3); assert.equal(b.squash, 0.22);
  assert.ok(P.bounceSeconds({ height: NaN }) > 0);
});

test('bounce: peak fall speed stays <= 30 px/frame for the tallest drop', () => {
  const m = P.bounceModel({ height: 600 });
  const peak = (2 * m.h) / (m.fall * 60); // power2.in: peak speed = 2 x average
  assert.ok(peak <= 30, `peak ${peak.toFixed(1)} px/f`);
});

test('anticipate: wind-up is opposite the action and 1/3 of the action time', () => {
  const o = el(); const tl = fresh();
  anticipate(tl, o, 0.5, { direction: 'up', amount: 'normal', actionSeconds: 0.3 });
  checkTags(tl, 'anticipate', 0.5);
  assert.ok(Math.abs(P.anticipationSeconds({ actionSeconds: 0.3 }) - 0.1) < EPS);
  tl.seek(0.5 + 0.1, false);
  assert.ok(o.y > 0, 'wind-up goes DOWN for an upward action');
  assert.ok(o.scaleY < 1 && Math.abs(o.scaleX * o.scaleY - 1) < 1e-6, 'crouch squashes with volume kept');
  const r = el(); const t2 = fresh();
  anticipate(t2, r, 0, { direction: 'right' }); t2.seek(1, false);
  assert.ok(r.x < 0, 'wind-up goes left for a rightward action');
});

test('launch: overshoots the target then settles exactly on it; settle = 1.5x action', () => {
  const o = el(); const tl = fresh();
  launch(tl, o, 0, { direction: 'up', distance: 'mid', amount: 'normal' });
  checkTags(tl, 'launch', 0);
  assert.ok(Math.abs(endOf(tl) - P.launchSeconds({ distance: 'mid' })) < EPS);
  let minY = 0;
  for (let f = 0; f <= 120; f++) { tl.seek(f / 60, false); minY = Math.min(minY, o.y); }
  assert.ok(minY < -220 * 1.05, `overshoot reached ${minY}`);
  tl.seek(5, false);
  assert.ok(Math.abs(o.y + 220) < 0.01 && Math.abs(o.scaleY - 1) < 1e-6, `rests at the target (y=${o.y})`);
  assert.ok(Math.abs(P.launchSeconds({ distance: 'mid' }) - 0.27 * (1 / 3 + 1 + 1.5)) < EPS);
});

test('pendulum: each joint starts 2-4 f after its parent, swings wider, ends at rest', () => {
  const joints = [el(), el(), el()];
  const tl = fresh();
  pendulum(tl, joints, 0, { swing: 'normal', drag: 'normal', swings: 3 });
  checkTags(tl, 'pendulum', 0);
  const starts = tl.getChildren(false).map((k) => k.startTime());
  assert.ok(Math.abs(starts[1] - starts[0] - 3 / 60) < EPS && Math.abs(starts[2] - starts[1] - 3 / 60) < EPS);
  const peak = [0, 0, 0];
  for (let f = 0; f <= 200; f++) { tl.seek(f / 60, false); joints.forEach((j, i) => { peak[i] = Math.max(peak[i], Math.abs(j.rotate)); }); }
  assert.ok(peak[0] < peak[1] && peak[1] < peak[2], `tip swings wider ${peak}`);
  assert.ok(Math.abs(peak[0] - 16) < 0.5);
  assert.ok(Math.abs(endOf(tl) - P.pendulumSeconds(3, { swings: 3 })) < EPS);
  tl.seek(10, false);
  joints.forEach((j) => assert.ok(Math.abs(j.rotate) < 1e-6));
});

test('followThrough: children lag, overshoot further than the parent, land on the same spot', () => {
  const els = [el(), el(), el(), el()];
  const tl = fresh();
  followThrough(tl, els, 0, { direction: 'right', distance: 200, drag: 'loose', amount: 'normal' });
  checkTags(tl, 'followThrough', 0);
  assert.ok(Math.abs(endOf(tl) - P.followSeconds(4, { drag: 'loose' })) < EPS);
  const peak = els.map(() => 0);
  for (let f = 0; f <= 200; f++) { tl.seek(f / 60, false); els.forEach((e, i) => { peak[i] = Math.max(peak[i], e.x); }); }
  assert.ok(peak[0] <= 200 + EPS && peak[1] > peak[0] && peak[2] > peak[1] && peak[3] > peak[2], `overshoot grows ${peak}`);
  tl.seek(10, false);
  els.forEach((e) => assert.ok(Math.abs(e.x - 200) < 1e-6));
});

test('arcMove: ends at (dx,dy), midpoint bulges off the straight line by the arc fraction', () => {
  const o = el(); const tl = fresh();
  const opts = { dx: 600, dy: 0, arc: 'mid', pace: 'normal' };
  arcMove(tl, o, 0, opts);
  checkTags(tl, 'arcMove', 0);
  assert.ok(Math.abs(endOf(tl) - P.arcSeconds(opts)) < EPS);
  tl.seek(P.arcSeconds(opts) / 2, false);
  assert.ok(Math.abs(o.x - 300) < 1 && Math.abs(o.y + 0.25 * 600) < 1, `mid (${o.x}, ${o.y})`);
  tl.seek(5, false);
  assert.ok(Math.abs(o.x - 600) < 1e-6 && Math.abs(o.y) < 1e-6);
  const d = el(); const t2 = fresh();
  arcMove(t2, d, 0, { dx: 600, dy: 200, bulge: 'down' }); t2.seek(5, false);
  assert.ok(Math.abs(d.x - 600) < 1e-6 && Math.abs(d.y - 200) < 1e-6);
});

test('arcPoint matches the tweens frame by frame', () => {
  const opts = { dx: 700, dy: -120, arc: 'high', pace: 'slow' };
  const o = el(); const tl = fresh();
  arcMove(tl, o, 0, opts);
  const T = P.arcSeconds(opts);
  for (let i = 0; i <= 24; i++) {
    tl.seek((T * i) / 24, false);
    const p = P.arcPoint(i / 24, opts);
    assert.ok(Math.abs(p.x - o.x) < 0.01 && Math.abs(p.y - o.y) < 0.01, `p${i}: (${p.x},${p.y}) vs (${o.x},${o.y})`);
  }
});

test('movingHold: drifts a little for the whole hold (never frozen)', () => {
  const o = el(); const tl = fresh();
  movingHold(tl, o, 0, { seconds: 0.6, intensity: 'soft' });
  checkTags(tl, 'movingHold', 0);
  assert.ok(Math.abs(endOf(tl) - 0.6) < EPS);
  tl.seek(0.3, false); const mid = o.y;
  tl.seek(0.6, false);
  assert.ok(mid < 0 && o.y < mid && Math.abs(o.y) <= 7, 'moves, stays tiny');
  assert.equal(P.holdSeconds({ seconds: 99 }), 1.5);
  assert.equal(P.holdSeconds({ seconds: 0 }), 0.3);
});

test('walkCycle: step lengths 30 f (walk) / 20 f (run), legs alternate, ends neutral, speed in range', () => {
  for (const [pace, stepF, stride] of [['walk', 30, 150], ['run', 20, 260]]) {
    const rig = { root: el(), body: el(), head: el(), legL: el(), legR: el(), armL: el(), armR: el() };
    const tl = fresh();
    walkCycle(tl, rig, 0.5, { pace, steps: 4 });
    checkTags(tl, 'walkCycle', 0.5);
    const secs = P.walkSeconds({ pace, steps: 4 });
    assert.ok(Math.abs(endOf(tl) - 0.5 - secs) < 1e-4, `${pace} end ${endOf(tl) - 0.5} vs ${secs}`);
    assert.ok(Math.abs(secs * 60 - ((4 * 4 + 1) * stepF / 4 + stepF / 2 + 3)) < 1e-3);
    // keyframe i lands at (i + 1) quarter-steps; contacts are i = 0, 4, 8 ...
    let opposite = true, bodyMin = 0, bodyMax = 0;
    for (let k = 0; k <= 3; k++) {
      tl.seek(0.5 + ((4 * k + 1) * stepF) / 4 / 60, false);
      opposite = opposite && rig.legL.rotate * rig.legR.rotate < 0;
    }
    assert.ok(opposite, 'legs are on opposite sides at each contact');
    for (let f = 0; f <= secs * 60; f++) {
      tl.seek(0.5 + f / 60, false);
      bodyMin = Math.min(bodyMin, rig.body.y); bodyMax = Math.max(bodyMax, rig.body.y);
      assert.ok(Math.abs(rig.body.scaleX * rig.body.scaleY - 1) < 0.01, 'body volume');
    }
    assert.ok(bodyMin < 0 && bodyMax > 0, 'body bobs up and down');
    tl.seek(20, false);
    for (const part of [rig.legL, rig.legR, rig.armL, rig.armR, rig.body, rig.head]) assert.ok(Math.abs(part.rotate) < 1e-6 && Math.abs(part.y) < 1e-6, `${pace} neutral`);
    const expected = stride * (4 + 1 / 8 + 1 / 4);
    assert.ok(Math.abs(rig.root.x - expected) < 0.01, `${pace} travel ${rig.root.x} vs ${expected}`);
    const speed = stride / stepF;
    assert.ok(speed >= 5 && speed <= 15, `sustained ${speed} px/f`);
  }
});

test('walkCycle: arms start 2 f and head 3 f after the legs; direction left mirrors travel', () => {
  const rig = { root: el(), body: el(), head: el(), legL: el(), legR: el(), armL: el(), armR: el() };
  const tl = fresh();
  walkCycle(tl, rig, 0, { direction: 'left', steps: 2 });
  const start = (t) => tl.getChildren(false).find((k) => k.targets()[0] === t).startTime();
  assert.ok(Math.abs(start(rig.armL) - 2 / 60) < EPS && Math.abs(start(rig.head) - 3 / 60) < EPS && start(rig.legL) === 0);
  tl.seek(20, false);
  assert.ok(rig.root.x < 0);
});

/* ---------------- character rig helpers ---------------- */
const NAMES = Object.keys(rigParts('x'));
const rig = () => Object.fromEntries(NAMES.map((n) => [n, { ...el(), scaleX: 1, scaleY: 1 }]));
const G = RIG_GEOM;
const DEG = Math.PI / 180;
const rot = (x, y, deg) => { const c = Math.cos(deg * DEG), s = Math.sin(deg * DEG); return [x * c - y * s, x * s + y * c]; };
/** Forward kinematics of one leg: ankle, heel, toe in rig coordinates (y down, ground = G.h). */
function leg(r, side, dir = 1) {
  const L = side === 'L' ? 1 : -1, a = r['thigh' + side].rotate, b = r['shin' + side].rotate, c = r['foot' + side].rotate;
  const jx = G.hipX + L * G.legOff + dir * r.root.x, jy = G.hipY + r.hips.y + r.root.y;
  const ax = jx - G.thigh * Math.sin(a * DEG) - G.shin * Math.sin((a + b) * DEG);
  const ay = jy + G.thigh * Math.cos(a * DEG) + G.shin * Math.cos((a + b) * DEG);
  const w = a + b + c, [hx, hy] = rot(-G.footBack, G.ankle, w), [tx, ty] = rot(G.footFront, G.ankle, w);
  return { ax, ay, heel: [ax + hx, ay + hy], toe: [ax + tx, ay + ty] };
}
const NEUTRAL_SKIP = ['root', 'flip', 'eyes', 'pupils', 'brows'];

test('rigParts: selectors follow the class convention', () => {
  const p = rigParts('hero');
  assert.equal(p.armL, '.hero-arm-l'); assert.equal(p.footR, '.hero-foot-r'); assert.equal(p.root, '.hero-root');
});

test('rigLegIK: forward kinematics reproduces the target ankle, knee bends forward', () => {
  for (const [dx, gap] of [[0, 300], [0, 250], [100, 270], [-90, 262], [120, 270]]) {
    const { thigh, shin } = rigLegIK(dx, gap);
    const ax = -G.thigh * Math.sin(thigh * DEG) - G.shin * Math.sin((thigh + shin) * DEG);
    const ay = G.thigh * Math.cos(thigh * DEG) + G.shin * Math.cos((thigh + shin) * DEG);
    assert.ok(Math.abs(ax - dx) < 0.01 && Math.abs(ay - gap) < 0.01, `ik ${dx},${gap}: ${ax},${ay}`);
    assert.ok(shin >= 0, 'knee bends forward (shin rotates back relative to the thigh)');
  }
});

test('rigWalk: tagged, ends in the neutral standing pose, travels as planned, 14 parts driven', () => {
  const r = rig(), tl = fresh();
  rigWalk(tl, r, 0.5, { steps: 3 });
  checkTags(tl, 'rigWalk', 0.5);
  assert.equal(tl.getChildren(false).length, 14);
  const secs = P.rigWalkSeconds({ steps: 3 });
  assert.ok(Math.abs(endOf(tl) - 0.5 - Math.ceil(secs * 60) / 60) < 1e-3);
  tl.seek(20, false);
  for (const n of NAMES) if (!NEUTRAL_SKIP.includes(n)) assert.ok(Math.abs(r[n].rotate) < 0.01 && Math.abs(r[n].y) < 0.01, `${n} neutral: ${r[n].rotate}, ${r[n].y}`);
  assert.ok(r.root.x > 300 && r.root.x < 600, `travel ${r.root.x}`);
  const l = leg(r, 'L');
  assert.ok(Math.abs(l.ay + G.ankle - G.h) < 0.01, 'standing: sole on the ground');
});

test('rigWalk: planted feet never slide, never sink below the ground; legs reach their targets', () => {
  for (const o of [{ steps: 3 }, { steps: 5, pace: 'brisk', stride: 200 }, { steps: 1, pace: 'stroll', stride: 130 }, { steps: 4, direction: 'left' }]) {
    const r = rig(), tl = fresh();
    rigWalk(tl, r, 0, o);
    const n = Math.ceil(P.rigWalkSeconds(o) * 60);
    let planted = 0, total = 0, worst = 0;
    const last = { L: null, R: null };
    for (let f = 0; f <= n; f++) {
      tl.seek(f / 60, false);
      for (const side of ['L', 'R']) {
        const q = leg(r, side, o.direction === 'left' ? -1 : 1);
        const lowest = q.toe[1] > q.heel[1] ? 'toe' : 'heel', pt = q[lowest];
        assert.ok(pt[1] <= G.h + 0.05, `${side} f${f} sole below ground by ${pt[1] - G.h}`);
        assert.ok(!Number.isNaN(q.ax));
        total++;
        if (pt[1] > G.h - 0.02) {
          planted++;
          const prev = last[side];
          if (prev && prev.kind === lowest && prev.f === f - 1) worst = Math.max(worst, Math.abs(pt[0] - prev.x));
          last[side] = { kind: lowest, f, x: pt[0] };
        }
      }
      assert.ok(r.hips.y > -0.01 && r.hips.y < 40, `hips ${r.hips.y}`);
    }
    assert.ok(planted / total > 0.5, `planted share ${planted / total}`);
    assert.ok(worst < 0.06, `foot slides ${worst.toFixed(3)} px/f while planted (${JSON.stringify(o)})`);
  }
});

test('rigWalk: arms counter-swing, hip bobs, no big jumps between frames', () => {
  const r = rig(), tl = fresh();
  rigWalk(tl, r, 0, { steps: 4 });
  let agree = 0, opp = 0, hipMin = 1e9, hipMax = -1e9, jump = 0, prev = null;
  for (let f = 0; f < 200; f++) {
    tl.seek(f / 60, false);
    const fx = leg(r, 'L').ax - (G.hipX + G.legOff + r.root.x);
    if (f > 30 && f < 150 && Math.abs(r.armL.rotate) > 6 && Math.abs(fx) > 15) (Math.sign(r.armL.rotate) === Math.sign(fx) ? agree++ : opp++);
    if (f > 30 && f < 150) { hipMin = Math.min(hipMin, r.hips.y); hipMax = Math.max(hipMax, r.hips.y); }
    const cur = [r.thighL.rotate, r.shinL.rotate, r.thighR.rotate, r.shinR.rotate, r.armL.rotate, r.armR.rotate];
    if (prev) jump = Math.max(jump, ...cur.map((v, i) => Math.abs(v - prev[i])));
    prev = cur;
  }
  assert.ok(agree > opp * 2, `arm swings against the same-side foot (${agree} vs ${opp})`);
  assert.ok(hipMax - hipMin > 6, `hip bob ${hipMax - hipMin}`);
  assert.ok(jump < 12, `max joint change per frame ${jump} deg`);
});

test('rigWalk: root speed in range, direction left travels left', () => {
  const r = rig(), tl = fresh();
  rigWalk(tl, r, 0, { steps: 3, direction: 'left', stride: 180 });
  let max = 0, prev = 0;
  for (let f = 1; f < 200; f++) { tl.seek(f / 60, false); max = Math.max(max, Math.abs(r.root.x - prev)); prev = r.root.x; }
  assert.ok(r.root.x < -300);
  assert.ok(max <= 8.1 && max > 3, `peak ${max} px/f`);
});

test('idleBreath: moves, returns to rest, seconds twin matches, blink optional', () => {
  const r = rig(), tl = fresh();
  idleBreath(tl, r, 1, { seconds: 3.2, blink: true });
  checkTags(tl, 'idleBreath', 1);
  assert.ok(Math.abs(P.idleBreathSeconds({ seconds: 3.2 }) - 3.2) < EPS);
  let max = 1;
  for (let f = 60; f < 60 + 192; f++) { tl.seek(f / 60, false); max = Math.max(max, r.torso.scaleY); }
  assert.ok(max > 1.01 && max < 1.03, `breath ${max}`);
  tl.seek(30, false);
  assert.ok(Math.abs(r.torso.scaleY - 1) < 1e-6 && Math.abs(r.head.y) < 1e-6 && Math.abs(r.armL.rotate) < 1e-6 && Math.abs(r.eyes.scaleY - 1) < 1e-6);
});

test('lookAt: eyes first, head 3 f later, torso 6 f later; rest returns to neutral', () => {
  const r = rig(), tl = fresh();
  lookAt(tl, r, 1, { look: 'up' });
  const st = (t) => tl.getChildren(false).find((k) => k.targets()[0] === t).startTime();
  assert.ok(Math.abs(st(r.head) - st(r.pupils) - 3 / 60) < EPS && Math.abs(st(r.torso) - st(r.pupils) - 6 / 60) < EPS);
  checkTags(tl, 'lookAt', 1);
  tl.seek(3, false);
  assert.ok(r.head.rotate < -8 && r.pupils.y < 0);
  lookAt(tl, r, 4, { look: 'rest' }); tl.seek(10, false);
  assert.ok(Math.abs(r.head.rotate) < 1e-6 && Math.abs(r.pupils.x) < 1e-6);
});

test('react: anticipation first, hop lands, crouch keeps feet planted, recover is neutral', () => {
  const r = rig(), tl = fresh();
  react(tl, r, 0);
  checkTags(tl, 'react', 0);
  const secs = P.reactSeconds();
  assert.ok(Math.abs(endOf(tl) - secs) < EPS);
  tl.seek(0.14, false);
  assert.ok(r.hips.y > 10 && r.torso.rotate > 3, 'crouch + lean in before the action');
  const q = leg(r, 'L');
  assert.ok(Math.abs(q.ay + G.ankle - G.h) < 0.5 && Math.abs(q.ax - (G.hipX + G.legOff)) < 0.5, 'crouch keeps the foot planted');
  let minRoot = 0;
  for (let f = 0; f <= Math.ceil(secs * 60); f++) { tl.seek(f / 60, false); minRoot = Math.min(minRoot, r.root.y); }
  assert.ok(minRoot < -25, `hop ${minRoot}`);
  tl.seek(secs, false);
  assert.ok(Math.abs(r.root.y) < 1e-6 && r.torso.rotate < -3 && r.brows.y < -5 && r.eyes.scaleY > 1.05, 'held surprised pose on the ground');
  const r2 = rig(), tl2 = fresh(); react(tl2, r2, 0, { recover: true, kind: 'surprise' }); tl2.seek(10, false);
  for (const n of ['torso', 'head', 'armL', 'armR', 'thighL', 'shinL', 'footL']) assert.ok(Math.abs(r2[n].rotate) < 1e-6, `${n} neutral`);
  assert.ok(Math.abs(r2.root.y) < 1e-6 && Math.abs(r2.hips.y) < 1e-6 && Math.abs(r2.eyes.scaleY - 1) < 1e-6);
});

test('turn: flips the figure after the eyes, ends at the requested facing', () => {
  const r = rig(), tl = fresh();
  turn(tl, r, 0, { to: 'left' });
  checkTags(tl, 'turn', 0);
  tl.seek(10, false);
  assert.equal(r.flip.scaleX, -1);
  assert.ok(Math.abs(r.pupils.x) < 1e-6);
});

test('no Math.random / Date.now in physics source', async () => {
  const { readFileSync } = await import('node:fs');
  assert.ok(!/Math\.random|Date\.now|setTimeout|requestAnimationFrame/.test(readFileSync(new URL('../src/core/physics.ts', import.meta.url), 'utf8')));
});
