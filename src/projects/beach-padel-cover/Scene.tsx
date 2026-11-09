import { type FC, type ReactElement } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, holdFinal } from '../../core/presets';
import { SoundCuePlayer, type SoundCue } from '../../core/SoundCuePlayer';
import { C as PAL } from './palette';

/* =============================================================================
   BEACH PADEL COVER — 384 x 216 native pixel canvas, 5x integer upscale.
   One continuous 16 s take: 16 racket contacts on a 120 bpm grid, four players,
   a glass-walled sand court at sunset. Every edge is an integer coordinate and
   every colour is flat; no text, no filters, no gradients.
   ========================================================================== */

const FPS = 60;
const LOOP = 960;
const TAU = Math.PI * 2;
const angle = (f: number) => (TAU * f) / LOOP;

/* ---------- court plane (side 3/4, camera left of the centre line) --------- */
const A = { x: 30, y: 136 }; // back-left
const B = { x: 296, y: 118 }; // back-right
const C = { x: 382, y: 196 }; // near-right
const D = { x: 106, y: 214 }; // near-left

const BACK_TOP = 22;
const SIDE_TOP = 26;
const NET_H = 20;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const smooth = (t: number) => {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
};

/** Court-space (u across 0..1, v depth 0..1) to screen pixels. */
function courtPoint(u: number, v: number) {
  const tx = lerp(A.x, B.x, u);
  const ty = lerp(A.y, B.y, u);
  const bx = lerp(D.x, C.x, u);
  const by = lerp(D.y, C.y, u);
  return { x: lerp(tx, bx, v), y: lerp(ty, by, v) };
}

const depthScale = (v: number) => 0.9 + 0.34 * v;
const playerHeight = (v: number) => Math.round(lerp(29, 46, v));

/* ---------- rally ---------------------------------------------------------- */
type Name = 'FL' | 'FR' | 'NL' | 'NR';
type Shot = 'serve' | 'drive' | 'volley' | 'smash' | 'lob' | 'dig' | 'bandeja' | 'drop';

interface Hit {
  f: number;
  p: Name;
  u: number;
  v: number;
  z: number;
  shot: Shot;
  bounce?: boolean;
}

/** One contact per second on the music grid; the seam is the 930 -> 30 lob. */
const HITS: Hit[] = [
  { f: 30, p: 'FL', u: 0.2, v: 0.3, z: 24, shot: 'serve', bounce: true },
  { f: 90, p: 'NL', u: 0.26, v: 0.68, z: 18, shot: 'drive', bounce: true },
  { f: 150, p: 'FR', u: 0.78, v: 0.28, z: 26, shot: 'volley' },
  { f: 210, p: 'NR', u: 0.74, v: 0.74, z: 18, shot: 'drive', bounce: true },
  { f: 270, p: 'FL', u: 0.2, v: 0.34, z: 36, shot: 'lob' },
  { f: 330, p: 'NL', u: 0.3, v: 0.66, z: 46, shot: 'smash' },
  { f: 390, p: 'FR', u: 0.84, v: 0.4, z: 7, shot: 'dig', bounce: true },
  { f: 450, p: 'NR', u: 0.6, v: 0.88, z: 50, shot: 'bandeja' },
  { f: 510, p: 'FL', u: 0.24, v: 0.36, z: 26, shot: 'volley' },
  { f: 570, p: 'NL', u: 0.3, v: 0.72, z: 18, shot: 'drive', bounce: true },
  { f: 630, p: 'FR', u: 0.8, v: 0.3, z: 14, shot: 'drop', bounce: true },
  { f: 690, p: 'NR', u: 0.68, v: 0.9, z: 7, shot: 'dig' },
  { f: 750, p: 'FL', u: 0.2, v: 0.26, z: 36, shot: 'lob' },
  { f: 810, p: 'NL', u: 0.32, v: 0.7, z: 46, shot: 'smash' },
  { f: 870, p: 'FR', u: 0.84, v: 0.24, z: 26, shot: 'volley' },
  { f: 930, p: 'NR', u: 0.76, v: 0.86, z: 36, shot: 'lob', bounce: true },
];

/** The ball hangs a few pixels off the hitter's centre line, on their racket side. */
const CONTACT_OFFSET: Record<Name, number> = { FL: 0.025, FR: -0.025, NL: 0.025, NR: -0.025 };

interface Segment {
  hit: Hit;
  next: Hit;
  f0: number;
  f1: number;
  t: number;
}

/** Segment containing frame f; the last one wraps through the loop seam. */
function segmentAt(f: number): Segment {
  const frame = ((f % LOOP) + LOOP) % LOOP;
  for (let i = 0; i < HITS.length; i++) {
    const hit = HITS[i];
    const next = HITS[(i + 1) % HITS.length];
    const f0 = hit.f;
    const f1 = i === HITS.length - 1 ? HITS[0].f + LOOP : next.f;
    if (frame >= f0 && frame < f1) return { hit, next, f0, f1, t: (frame - f0) / (f1 - f0) };
  }
  const hit = HITS[HITS.length - 1];
  const next = HITS[0];
  return {
    hit,
    next,
    f0: hit.f - LOOP,
    f1: next.f,
    t: (frame + LOOP - hit.f) / (next.f + LOOP - hit.f),
  };
}

interface Ball {
  x: number;
  y: number;
  groundY: number;
  z: number;
  u: number;
  v: number;
}

const APEX: Record<Shot, number> = {
  serve: 9,
  drive: 7,
  volley: 4,
  smash: 2,
  lob: 16,
  dig: 5,
  bandeja: 3,
  drop: 7,
};

function ballAt(frame: number): Ball {
  const s = segmentAt(frame);
  const t = clamp(s.t, 0, 1);
  const u = lerp(s.hit.u, s.next.u, t) + lerp(CONTACT_OFFSET[s.hit.p], CONTACT_OFFSET[s.next.p], t);
  const v = lerp(s.hit.v, s.next.v, t);
  const p = courtPoint(u, v);
  const zs = depthScale(v);

  let z: number;
  if (s.hit.bounce) {
    const tb = 0.52;
    if (t < tb) {
      const q = t / tb;
      z = s.hit.z * (1 - q) * (1 - 0.25 * q);
    } else {
      const q = (t - tb) / (1 - tb);
      z = s.next.z * q + Math.max(3, s.next.z * 0.45) * 4 * q * (1 - q);
    }
  } else {
    z = lerp(s.hit.z, s.next.z, t) + APEX[s.hit.shot] * 4 * t * (1 - t);
  }

  return { x: p.x, y: p.y - z * zs, groundY: p.y, z, u, v };
}

/* ---------- players -------------------------------------------------------- */
interface PlayerHome {
  name: Name;
  team: 'A' | 'B';
  facing: 1 | -1;
  phase: number;
}

const ROSTER: PlayerHome[] = [
  { name: 'FL', team: 'A', facing: 1, phase: 0.0 },
  { name: 'FR', team: 'A', facing: -1, phase: 1.7 },
  { name: 'NL', team: 'B', facing: 1, phase: 3.1 },
  { name: 'NR', team: 'B', facing: -1, phase: 4.6 },
];

/** This player's contacts repeated over -LOOP..2*LOOP so the loop seam is exact. */
function eventsFor(name: Name) {
  const own = HITS.filter((h) => h.p === name);
  const out: Array<Hit & { ff: number }> = [];
  for (let k = -1; k <= 2; k++) for (const h of own) out.push({ ...h, ff: h.f + k * LOOP });
  return out.sort((a, b) => a.ff - b.ff);
}

function playerAt(name: Name, f: number) {
  const frame = ((f % LOOP) + LOOP) % LOOP;
  const home = ROSTER.find((r) => r.name === name)!;
  const ev = eventsFor(name);
  let next = ev[ev.length - 1];
  let prev = ev[0];
  for (let i = 0; i < ev.length - 1; i++) {
    if (ev[i].ff <= frame && ev[i + 1].ff > frame) {
      prev = ev[i];
      next = ev[i + 1];
      break;
    }
  }
  const t = smooth((frame - (next.ff - 82)) / 70);
  const idle = Math.sin(TAU * (frame / 240) + home.phase) * 0.004;
  const u = lerp(prev.u, next.u, t) + idle;
  const v = lerp(prev.v, next.v, t);
  return { u, v, t, next, prev };
}

/** Nearest own contact in time, so pose blends survive the contact frame. */
function nearestEvent(name: Name, f: number) {
  const ev = eventsFor(name);
  let best = ev[0];
  for (const e of ev) if (Math.abs(e.ff - f) < Math.abs(best.ff - f)) best = e;
  return best;
}

/* ---------- pixel drawing helpers ----------------------------------------- */
interface R {
  x: number;
  y: number;
  w: number;
  h: number;
  c: string;
}

const box = (x: number, y: number, w: number, h: number, c: string): R => ({
  x: Math.round(x),
  y: Math.round(y),
  w: Math.max(1, Math.round(w)),
  h: Math.max(1, Math.round(h)),
  c,
});

/** Crisp pixel line: one block per step. */
function limb(x0: number, y0: number, x1: number, y1: number, c: string, w = 2): R[] {
  const out: R[] = [];
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    out.push(box(lerp(x0, x1, t) - (w - 1) / 2, lerp(y0, y1, t) - (w - 1) / 2, w, w, c));
  }
  return out;
}

const rects = (list: R[], prefix: string) =>
  list.map((r, i) => <rect key={`${prefix}-${i}`} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} />);

/* ---------- padel racket --------------------------------------------------- */
interface TeamPal {
  jersey: string;
  light: string;
  dark: string;
  shorts: string;
  shortsLight: string;
  skin: string;
  skinLight: string;
  skinDark: string;
  hair: string;
  shoe: string;
  shoeShade: string;
  racket: string;
  faceDark: string;
  edge: string;
  grip: string;
}

/** A fat padel bat whose long axis follows the arm; dark silhouette, bright face. */
function racket(hx: number, hy: number, a: number, T: TeamPal): R[] {
  const dx = Math.cos(a);
  const dy = Math.sin(a);
  const sX = dx >= 0 ? 1 : -1;
  const sY = dy >= 0 ? 1 : -1;
  const bx = hx + Math.round(dx * 4);
  const by = hy + Math.round(dy * 4);
  const horiz = Math.abs(dx) >= Math.abs(dy);
  const prof = [2, 5, 7, 9, 9, 9, 9, 7, 3];
  const parts: R[] = [];

  parts.push(...limb(hx, hy, bx, by, PAL.ink, 3));
  parts.push(...limb(hx, hy, bx, by, T.grip, 1));

  // dark silhouette of the head
  for (let i = 0; i < prof.length; i++) {
    const w = prof[i];
    if (horiz) parts.push(box(bx + sX * i, by - Math.floor(w / 2), 1, w, PAL.ink));
    else parts.push(box(bx - Math.floor(w / 2), by + sY * i, w, 1, PAL.ink));
  }
  // bright face inset by one pixel
  for (let i = 1; i < prof.length - 1; i++) {
    const w = prof[i] - 2;
    if (horiz) parts.push(box(bx + sX * i, by - Math.floor(w / 2), 1, w, T.racket));
    else parts.push(box(bx - Math.floor(w / 2), by + sY * i, w, 1, T.racket));
  }
  // drilled holes + top highlight
  for (const i of [2, 4, 6]) {
    if (horiz) parts.push(box(bx + sX * i, by - 2, 1, 1, T.faceDark));
    else parts.push(box(bx - 2, by + sY * i, 1, 1, T.faceDark));
  }
  for (let i = 1; i <= 3; i++) {
    if (horiz) parts.push(box(bx + sX * i, by - 3, 1, 1, T.light));
    else parts.push(box(bx - 3, by + sY * i, 1, 1, T.light));
  }
  return parts;
}

/* ---------- player sprite -------------------------------------------------- */
interface Pose {
  crouch: number;
  split: number;
  lean: number;
  lift: number;
  stage: number; // -1 wind-up, 0 contact, +1 follow-through
  aim: boolean;
}

interface SpriteState {
  x: number;
  groundY: number;
  h: number;
  facing: 1 | -1;
  team: 'A' | 'B';
  pose: Pose;
  aimX: number;
  aimY: number;
  readyArm?: number;
}

function drawPlayer(s: SpriteState): R[] {
  const T = s.team === 'A' ? PAL.teamA : PAL.teamB;
  const out: R[] = [];
  const h = s.h;
  const crouch = Math.round(s.pose.crouch);
  const split = Math.round(s.pose.split);
  const lean = Math.round(s.pose.lean);

  const legH = Math.max(6, Math.round(h * 0.34) - crouch);
  const shortsH = Math.max(3, Math.round(h * 0.12));
  const torsoH = Math.max(6, Math.round(h * 0.3));
  const headH = Math.max(6, Math.round(h * 0.17));
  const hipY = -legH;
  const shortsTop = hipY - shortsH;
  const torsoTop = shortsTop - torsoH;
  const headTop = torsoTop - headH - 1;

  const ox = s.x;
  const oy = s.groundY - Math.round(s.pose.lift);
  const put = (list: R[]) => {
    for (const q of list) out.push({ ...q, x: q.x + ox, y: q.y + oy });
  };

  const fwd = 3 + split;
  const back = -3 - Math.round(split * 0.35);

  // legs: dark silhouette then skin
  put(limb(-2, hipY + 1, back, -2, PAL.ink, 5));
  put(limb(2, hipY + 1, fwd, -2, PAL.ink, 5));
  put(limb(-2, hipY + 1, back, -2, T.skinDark, 3));
  put(limb(2, hipY + 1, fwd, -2, T.skin, 3));
  // team sock band above the shoe
  put([box(back - 1, -5, 3, 2, T.light), box(fwd - 1, -5, 4, 2, T.light)]);
  // shoes
  put([box(back - 3, -4, 6, 4, PAL.ink), box(fwd - 2, -4, 7, 4, PAL.ink)]);
  put([box(back - 2, -3, 4, 3, T.shoe), box(fwd - 1, -3, 5, 3, T.shoe)]);
  put([box(back - 2, 0, 4, 1, T.shoeShade), box(fwd - 1, 0, 5, 1, T.shoeShade)]);

  // shorts
  put([box(-6, shortsTop - 1, 12, shortsH + 2, PAL.ink)]);
  put([box(-5, shortsTop, 10, shortsH, T.shorts)]);
  put([box(-5, shortsTop, 10, 1, T.shortsLight)]);
  put([box(-1, shortsTop + 1, 2, shortsH - 1, T.shortsLight)]);
  put([box(-1, shortsTop + shortsH - 1, 2, 1, PAL.ink)]);

  const chestTop = torsoTop + Math.round(torsoH * 0.4);
  const waistX = -5;
  const chestX = -5 + lean;
  // torso silhouette
  put([box(waistX - 1, chestTop - 1, 12, torsoTop + torsoH - chestTop + 2, PAL.ink)]);
  put([box(chestX - 1, torsoTop - 1, 13, chestTop - torsoTop + 2, PAL.ink)]);
  // jersey
  put([box(waistX, chestTop, 10, torsoTop + torsoH - chestTop, T.jersey)]);
  put([box(chestX, torsoTop, 11, chestTop - torsoTop + 1, T.jersey)]);
  put([box(chestX, torsoTop, 11, 1, T.light)]);
  put([box(chestX + 10, torsoTop, 1, chestTop - torsoTop + 1, T.light)]);
  put([box(waistX + 9, chestTop, 1, torsoTop + torsoH - chestTop, T.light)]);
  put([box(waistX, chestTop, 1, torsoTop + torsoH - chestTop, T.dark)]);
  // team trim
  put([box(waistX, torsoTop + torsoH - 1, 10, 1, T.light)]);

  // head + neck
  const hairRows = 1;
  put([box(-2 + lean, headTop + headH, 4, 2, PAL.ink)]);
  put([box(-2 + lean, headTop + headH, 4, 1, T.skinDark)]);
  put([box(-4 + lean, headTop - 1, 9, headH + 2, PAL.ink)]);
  put([box(-3 + lean, headTop, 7, headH, T.skin)]);
  put([box(-3 + lean, headTop, 7, hairRows, T.hair)]);
  put([box(-3 + lean, headTop, 2, hairRows + 1, T.hair)]);
  put([box(-3 + lean, headTop + hairRows, 7, 1, s.team === 'A' ? PAL.teamA.light : PAL.teamB.light)]);
  put([box(lean - 3, headTop + hairRows + 1, 1, headH - hairRows - 1, T.skinDark)]);
  put([box(lean + 3, headTop + hairRows + 1, 1, headH - hairRows - 1, T.skinLight)]);
  const eyeX = s.facing === 1 ? 1 + lean : -2 + lean;
  put([box(eyeX, headTop + hairRows + 1, 1, 2, PAL.ink)]);
  put([box(lean - 3, headTop + headH - 2, 1, 1, T.skinLight)]);

  // far arm behind the body
  put(limb(-5 + lean, torsoTop + 3, -7 + lean, torsoTop + Math.round(torsoH * 0.75), PAL.ink, 4));
  put(limb(-5 + lean, torsoTop + 3, -7 + lean, torsoTop + Math.round(torsoH * 0.75), T.skinDark, 2));

  // racket arm: aim the bat at the ball at contact
  const shoulderX = s.facing * 5 + lean;
  const shoulderY = torsoTop + 3;
  let arm = s.readyArm ?? 0;
  if (s.pose.aim) {
    const tx = s.aimX - ox - shoulderX;
    const ty = s.aimY - oy - shoulderY;
    const aimAngle = Math.atan2(ty, tx);
    if (s.pose.stage < 0) arm = aimAngle + 1.15 * -s.pose.stage;
    else if (s.pose.stage > 0) arm = aimAngle + 0.85 * s.pose.stage;
    else arm = aimAngle;
  }
  const dist = s.pose.aim
    ? Math.hypot(s.aimX - ox - shoulderX, s.aimY - oy - shoulderY)
    : Math.round(h * 0.22);
  const reach = s.pose.aim ? clamp(dist - 9, 5, Math.round(h * 0.34)) : Math.round(h * 0.22);
  const handX = Math.round(shoulderX + Math.cos(arm) * reach);
  const handY = Math.round(shoulderY + Math.sin(arm) * reach);
  const elbowX = Math.round(lerp(shoulderX, handX, 0.55));
  const elbowY = Math.round(lerp(shoulderY, handY, 0.55));

  put(limb(shoulderX, shoulderY, elbowX, elbowY, PAL.ink, 4));
  put(limb(shoulderX, shoulderY, elbowX, elbowY, T.jersey, 2));
  put(limb(elbowX, elbowY, handX, handY, PAL.ink, 4));
  put(limb(elbowX, elbowY, handX, handY, T.skin, 2));
  put([box(handX - 1, handY - 1, 3, 2, T.light)]);

  // racket is painted after the body so it always reads on top
  put(racket(handX, handY, arm, T));
  return out;
}

/* ---------- palm ----------------------------------------------------------- */
function palm(x: number, baseY: number, mirror: boolean, sway: number, prefix: string): ReactElement {
  const m = mirror ? -1 : 1;
  const topX = x + m * 7 + sway;
  const topY = baseY - 52;
  const parts: R[] = [];

  // curved trunk: wide at the base, thin at the crown, lit on the sun side
  let px = x;
  let py = baseY;
  const SEGS = 10;
  for (let i = 1; i <= SEGS; i++) {
    const t = i / SEGS;
    const nx = lerp(x, topX, t) + m * Math.sin(t * Math.PI) * 4;
    const ny = lerp(baseY, topY, t);
    const w = Math.round(lerp(6, 3, t));
    parts.push(...limb(px, py, nx, ny, PAL.ink, w));
    parts.push(...limb(px + m * 1.5, py, nx + m * 1.5, ny, '#3d2149', Math.max(1, w - 3)));
    px = nx;
    py = ny;
  }

  // radiating fronds: solid tapering blades with drooping leaflet ticks
  for (let i = 0; i < 9; i++) {
    const a = -3.05 + i * 0.34;
    const len = 12 + (i % 3) * 5;
    const droop = 4 + (i % 2) * 3;
    let fx = topX;
    let fy = topY;
    const STEPS = 6;
    for (let k = 1; k <= STEPS; k++) {
      const t = k / STEPS;
      const nx = topX + Math.cos(a) * len * t;
      const ny = topY + Math.sin(a) * len * t + droop * t * t;
      const w = Math.round(lerp(4, 1, t));
      parts.push(...limb(fx, fy, nx, ny, PAL.ink, w));
      // leaflet ticks fan out from the blade
      if (k % 2 === 1) {
        const lx = Math.round(lerp(fx, nx, 0.5) + Math.cos(a + 1.25) * 2.5);
        const ly = Math.round(lerp(fy, ny, 0.5) + Math.sin(a + 1.25) * 2.5);
        parts.push(box(lx, ly, 2, 1, '#5a2b5e'));
        const rx = Math.round(lerp(fx, nx, 0.5) - Math.cos(a + 1.25) * 2.5);
        const ry = Math.round(lerp(fy, ny, 0.5) - Math.sin(a + 1.25) * 2.5);
        parts.push(box(rx, ry, 2, 1, '#5a2b5e'));
      }
      fx = nx;
      fy = ny;
    }
  }
  // coconuts
  parts.push(box(topX - 3, topY + 3, 3, 3, PAL.ink));
  parts.push(box(topX + 1, topY + 4, 3, 3, PAL.ink));
  parts.push(box(topX - 2, topY + 4, 1, 1, '#6b3a52'));

  return <g>{rects(parts, prefix)}</g>;
}

/* ---------- glass wall ----------------------------------------------------- */
function glassWall(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  h0: number,
  h1: number,
  clipId: string,
  posts: number[],
  streakOffset: number,
  prefix: string,
): ReactElement {
  const top = `${p0.x},${p0.y - h0} ${p1.x},${p1.y - h1}`;
  const quad = `${p0.x},${p0.y} ${p0.x},${p0.y - h0} ${p1.x},${p1.y - h1} ${p1.x},${p1.y}`;
  return (
    <g>
      <polygon points={quad} fill={PAL.glass.pane} opacity={0.07} />
      <g clipPath={`url(#${clipId})`}>
        {Array.from({ length: 5 }).map((_, i) => {
          const x = -60 + i * 96 + streakOffset;
          return (
            <g key={`${prefix}-streak-${i}`}>
              <line x1={x} y1={216} x2={x + 62} y2={0} stroke={PAL.glass.shine} strokeWidth={3} opacity={0.14} />
              <line x1={x + 5} y1={216} x2={x + 67} y2={0} stroke={PAL.glass.top} strokeWidth={1} opacity={0.34} />
            </g>
          );
        })}
      </g>
      <polyline points={top} fill="none" stroke={PAL.glass.frameDark} strokeWidth={3} />
      <polyline points={top} fill="none" stroke={PAL.glass.frameLit} strokeWidth={1} opacity={0.9} />
      <polyline points={`${p0.x},${p0.y} ${p1.x},${p1.y}`} fill="none" stroke={PAL.glass.frame} strokeWidth={2} />
      {posts.map((t, i) => {
        const x = Math.round(lerp(p0.x, p1.x, t));
        const y = Math.round(lerp(p0.y, p1.y, t));
        const hh = Math.round(lerp(h0, h1, t));
        return (
          <g key={`${prefix}-post-${i}`}>
            <rect x={x - 1} y={y - hh} width={3} height={hh + 1} fill={PAL.glass.frame} />
            <rect x={x - 1} y={y - hh} width={1} height={hh} fill={PAL.glass.frameLit} />
            <rect x={x - 2} y={y - 1} width={5} height={2} fill={PAL.glass.frameDark} />
          </g>
        );
      })}
    </g>
  );
}

/* ========================================================================== */
export const buildTimeline = (tl: gsap.core.Timeline) => {
  // Eight one-second beats on the 120 bpm grid; the take never cuts.
  const beats = [
    { id: 'rally-serve', startFrame: 0 },
    { id: 'near-drive', startFrame: 120 },
    { id: 'net-volley-clash', startFrame: 240 },
    { id: 'deep-glass-rebound', startFrame: 360 },
    { id: 'aerial-bandeja', startFrame: 480 },
    { id: 'wall-bajada-recovery', startFrame: 600 },
    { id: 'diving-corner-save', startFrame: 720 },
    { id: 'loop-reset-climax', startFrame: 840 },
  ];
  beats.forEach(({ id, startFrame }) => beat(tl, id, startFrame / FPS));
  holdFinal(tl, 14.8, 1.2);
  return tl;
};

/* ---------- audio ---------------------------------------------------------- */
const SFX: SoundCue[] = [];
for (const h of HITS) {
  SFX.push({
    frame: h.f - 5,
    type: 'movement',
    file: 'sfx/whoosh/fs-683101-quick-woosh.ogg',
    volume: h.shot === 'smash' ? 0.2 : 0.12,
  });
  if (h.shot === 'smash' || h.shot === 'bandeja') {
    SFX.push({ frame: h.f, type: 'reveal', file: 'sfx/impact/kenney-impact-impactsoft-heavy-000.ogg', volume: 0.45 });
  } else if (h.shot === 'dig' || h.shot === 'drop') {
    SFX.push({ frame: h.f, type: 'appear', file: 'sfx/pop/kenney-interface-pluck-001.ogg', volume: 0.24 });
  } else {
    SFX.push({ frame: h.f, type: 'appear', file: 'sfx/pop/kenney-interface-pluck-001.ogg', volume: 0.28 });
  }
}
SFX.push(
  { frame: 378, type: 'reveal', file: 'sfx/ding/kenney-interface-glass-001.ogg', volume: 0.3 },
  { frame: 856, type: 'reveal', file: 'sfx/ding/kenney-interface-glass-001.ogg', volume: 0.26 },
  { frame: 64, type: 'appear', file: 'sfx/pop/fs-447910-plop.ogg', volume: 0.16 },
  { frame: 246, type: 'appear', file: 'sfx/pop/fs-447910-plop.ogg', volume: 0.16 },
  { frame: 596, type: 'appear', file: 'sfx/pop/fs-447910-plop.ogg', volume: 0.16 },
);

/* ========================================================================== */
export const Scene: FC = () => {
  const frame = useCurrentFrame();
  useRemotionGSAP(buildTimeline);

  const f = ((frame % LOOP) + LOOP) % LOOP;
  const ball = ballAt(f);
  const ballPrev = ballAt(f - 2);
  const ballPrev2 = ballAt(f - 4);
  const ballPrev3 = ballAt(f - 6);

  const smashAt = [330, 810].some((sf) => f >= sf && f <= sf + 3);
  const shake = smashAt ? [0, 1, -1, 0][f % 4] : 0;

  // contact flash
  const hitCtx = HITS.reduce<{ d: number; hit: Hit } | null>((acc, h) => {
    const d = f - h.f;
    if (d >= -2 && d <= 5 && (!acc || Math.abs(d) < Math.abs(acc.d))) return { d, hit: h };
    return acc;
  }, null);
  const hitFlash = hitCtx ? 1 - Math.abs(hitCtx.d - 1) / 5 : 0;

  // sand puffs at the actual bounce point
  const puffs = HITS.filter((h) => h.bounce)
    .map((h) => {
      const s = segmentAt(h.f + 1);
      const bf = s.f0 + (s.f1 - s.f0) * 0.52;
      const b = ballAt(bf);
      return { f: bf, x: b.x, y: b.groundY };
    })
    .filter((e) => f >= e.f && f <= e.f + 13);

  // glass ripples on the right wall
  const ripples = [
    { f: 378, x: 336, y: 150 },
    { f: 856, x: 340, y: 140 },
  ].filter((g) => f >= g.f && f <= g.f + 12);

  const cloudDrift = Math.round(5 * Math.sin(angle(f) * 2));
  const gull = Math.sin(angle(f) * 20);
  const seaShift = angle(f) * 8;

  const ballNow = { x: Math.round(ball.x), y: Math.round(ball.y) };
  const ballP1 = { x: Math.round(ballPrev.x), y: Math.round(ballPrev.y) };
  const ballP2 = { x: Math.round(ballPrev2.x), y: Math.round(ballPrev2.y) };
  const ballP3 = { x: Math.round(ballPrev3.x), y: Math.round(ballPrev3.y) };

  const players = ROSTER.map((p) => {
    const pos = playerAt(p.name, f);
    const ground = courtPoint(pos.u, pos.v);
    const h = playerHeight(pos.v);
    const contact = nearestEvent(p.name, f);
    const df = f - contact.ff;
    const shot = Math.abs(df) <= 18 ? contact.shot : null;
    const jumping = shot === 'smash' || shot === 'bandeja';
    const lift = jumping
      ? Math.round(Math.sin(clamp((df + 16) / 32, 0, 1) * Math.PI) * (shot === 'bandeja' ? 14 : 11))
      : 0;
    const dive = shot === 'dig' && df >= -10 && df <= 12;
    const crouch = dive ? 5 : Math.round(1 + Math.sin(angle(f) * 6 + p.phase));

    const prevPos = playerAt(p.name, f - 2);
    const speed = Math.abs(pos.u - prevPos.u) * 300 + Math.abs(pos.v - prevPos.v) * 120;
    const run = speed > 0.55;
    const split = run ? Math.round(Math.sin(angle(f) * 40 + p.phase) * 2.5) : dive ? 4 : 1;

    const aiming = Math.abs(df) <= 12;
    const stage = df < -4 ? -clamp((df + 14) / 10, 0, 1) : df > 4 ? clamp((df - 4) / 8, 0, 1) : 0;
    const lean = nearLean(df);
    const readyArm =
      (p.facing === 1 ? 0.58 : Math.PI - 0.58) + Math.sin(angle(f) * 3 + p.phase) * 0.1;

    return {
      ...p,
      x: Math.round(ground.x),
      groundY: Math.round(ground.y),
      h,
      crouch,
      split,
      lean,
      lift,
      stage,
      aiming,
      readyArm,
      shot,
      df,
    };
  });

  const byName = (n: Name) => players.find((p) => p.name === n)!;

  return (
    <AbsoluteFill style={{ backgroundColor: PAL.dark, overflow: 'hidden' }}>
      <Audio
        src={staticFile('audio/claude-reel-128bpm.mp3')}
        startFrom={0}
        endAt={900}
        playbackRate={0.9375}
        loop
        volume={0.4}
      />
      <SoundCuePlayer cues={SFX} />

      <svg
        width={1920}
        height={1080}
        viewBox="0 0 384 216"
        shapeRendering="crispEdges"
        style={{ display: 'block', width: 1920, height: 1080 }}
      >
        <defs>
          <pattern id="netGrid" width="3" height="3" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="3" height="1" fill={PAL.net.mesh} opacity={0.55} />
            <rect x="0" y="0" width="1" height="3" fill={PAL.net.mesh} opacity={0.55} />
          </pattern>
          <clipPath id="clipBack">
            <polygon points={`${A.x},${A.y} ${A.x},${A.y - BACK_TOP} ${B.x},${B.y - BACK_TOP} ${B.x},${B.y}`} />
          </clipPath>
          <clipPath id="clipLeft">
            <polygon points={`${A.x},${A.y} ${A.x},${A.y - BACK_TOP} ${D.x},${D.y - SIDE_TOP} ${D.x},${D.y}`} />
          </clipPath>
          <clipPath id="clipRight">
            <polygon points={`${B.x},${B.y} ${B.x},${B.y - BACK_TOP} ${C.x},${C.y - SIDE_TOP} ${C.x},${C.y}`} />
          </clipPath>
        </defs>

        <g transform={`translate(${shake}, 0)`}>
          {/* ================= sky ================= */}
          {PAL.sky.map((c, i) => (
            <rect key={`sky-${i}`} x={0} y={i * 8} width={384} height={8} fill={c} />
          ))}
          {PAL.sky.map((_c, i) =>
            i === 0 ? null : (
              <g key={`skyd-${i}`}>
                {Array.from({ length: 32 }).map((_, k) => (
                  <rect
                    key={k}
                    x={(k * 12 + (i % 2) * 5) % 384}
                    y={i * 8}
                    width={6}
                    height={1}
                    fill={PAL.sky[i - 1]}
                  />
                ))}
              </g>
            ),
          )}

          {/* sun: stepped disc with retro raster gaps */}
          {Array.from({ length: 31 }).map((_, i) => {
            const dy = i - 15;
            const half = Math.floor(Math.sqrt(Math.max(0, 15 * 15 - dy * dy)));
            if (half <= 0) return null;
            const c = dy < -5 ? PAL.sun[0] : dy < 2 ? PAL.sun[1] : dy < 8 ? PAL.sun[2] : PAL.sun[3];
            return <rect key={`sun-${i}`} x={330 - half} y={72 + dy} width={half * 2 + 1} height={1} fill={c} />;
          })}
          {[
            [76, 9],
            [81, 10],
            [86, 10],
          ].map(([y, band]) => (
            <rect key={`sun-gap-${y}`} x={314} y={y} width={33} height={1} fill={PAL.sky[band]} />
          ))}

          {/* pixel clouds */}
          {[
            { x: 42, y: 24, s: 1, d: 1 },
            { x: 196, y: 40, s: 0.8, d: -1 },
            { x: 262, y: 28, s: 0.7, d: 1 },
          ].map((cl, i) => {
            const dx = cl.x + cloudDrift * cl.d;
            const s = cl.s;
            return (
              <g key={`cloud-${i}`}>
                <rect x={dx + 9 * s} y={cl.y} width={15 * s} height={2} fill={PAL.cloud} />
                <rect x={dx + 4 * s} y={cl.y + 2} width={23 * s} height={3} fill={PAL.cloud} />
                <rect x={dx} y={cl.y + 5} width={34 * s} height={3} fill={PAL.cloud} />
                <rect x={dx + 3 * s} y={cl.y + 7} width={28 * s} height={1} fill={PAL.cloudShade} />
              </g>
            );
          })}

          {/* gulls */}
          {[
            [88, 44],
            [116, 35],
            [148, 52],
          ].map(([gx, gy], i) => {
            const flap = Math.round(gull * 1.2);
            return (
              <g key={`gull-${i}`} fill={PAL.ink} opacity={0.75}>
                <rect x={gx} y={gy + flap} width={1} height={1} />
                <rect x={gx + 1} y={gy - 1 + flap} width={2} height={1} />
                <rect x={gx + 3} y={gy + flap} width={1} height={1} />
                <rect x={gx + 4} y={gy - 1 + flap} width={1} height={1} />
                <rect x={gx + 5} y={gy + flap} width={1} height={1} />
              </g>
            );
          })}

          {/* ================= sea ================= */}
          <rect x={0} y={94} width={384} height={18} fill={PAL.sea[4]} />
          <rect x={0} y={94} width={384} height={1} fill={PAL.horizon} />
          <rect x={0} y={98} width={384} height={4} fill={PAL.sea[3]} />
          <rect x={0} y={102} width={384} height={3} fill={PAL.sea[2]} />
          <rect x={0} y={105} width={384} height={4} fill={PAL.sea[1]} />
          <rect x={0} y={109} width={384} height={3} fill={PAL.sea[1]} />
          {Array.from({ length: 14 }).map((_, i) => (
            <rect
              key={`swell-${i}`}
              x={(i * 31 + Math.round(Math.sin(seaShift + i) * 6) + 384) % 384}
              y={99 + (i % 4) * 3}
              width={6 + (i % 3) * 3}
              height={1}
              fill={i % 2 ? PAL.sea[1] : PAL.sea[2]}
            />
          ))}
          {Array.from({ length: 16 }).map((_, i) => (
            <rect
              key={`foamline-${i}`}
              x={(i * 26 + Math.round(Math.sin(seaShift * 2 + i) * 8) + 384) % 384}
              y={108 + (i % 2)}
              width={7 + (i % 4) * 2}
              height={1}
              fill={i % 3 === 0 ? PAL.foam[0] : PAL.foam[1]}
            />
          ))}
          {Array.from({ length: 9 }).map((_, i) => {
            const w = 15 - i;
            return (
              <rect
                key={`glint-${i}`}
                x={330 - Math.floor(w / 2) + Math.round(Math.sin(seaShift * 2 + i) * 2)}
                y={95 + i * 2}
                width={w}
                height={1}
                fill={i % 2 ? PAL.sea[0] : PAL.sun[2]}
              />
            );
          })}
          {/* distant sailboat riding the swell */}
          {(() => {
            const bob = Math.round(Math.sin(angle(f) * 3) * 1);
            const bx = 132 + Math.round(Math.sin(angle(f) * 2 + 1) * 2);
            const by = 100 + bob;
            return (
              <g>
                <polygon points={`${bx},${by - 1} ${bx},${by - 9} ${bx + 7},${by - 1}`} fill={PAL.line} />
                <polygon points={`${bx - 4},${by - 1} ${bx},${by - 9} ${bx},${by - 1}`} fill={PAL.foam[1]} />
                <rect x={bx} y={by - 10} width={1} height={10} fill={PAL.ink} />
                <rect x={bx - 5} y={by} width={12} height={1} fill={PAL.ink} />
                <rect x={bx - 4} y={by + 1} width={10} height={1} fill={PAL.ink} />
                <rect x={bx - 6} y={by + 1} width={3} height={1} fill={PAL.foam[0]} opacity={0.7} />
              </g>
            );
          })()}

          {/* wet shoreline */}
          <rect x={0} y={111} width={384} height={2} fill={PAL.foam[2]} />
          <rect x={0} y={112} width={384} height={1} fill={PAL.foam[1]} />

          {/* ================= beach ================= */}
          <rect x={0} y={113} width={384} height={103} fill={PAL.beach[1]} />
          <rect x={0} y={113} width={384} height={2} fill={PAL.beach[0]} />
          <rect x={0} y={118} width={384} height={3} fill={PAL.beach[2]} />
          <rect x={0} y={124} width={384} height={3} fill={PAL.beach[1]} />
          {Array.from({ length: 50 }).map((_, i) => (
            <rect
              key={`grain-beach-${i}`}
              x={(i * 53) % 384}
              y={116 + ((i * 37) % 98)}
              width={1 + (i % 2)}
              height={1}
              fill={i % 3 === 0 ? PAL.beach[0] : PAL.beach[3]}
            />
          ))}

          {/* beach props sit outside the cage, so they are painted after the glass */}

          {/* palms outside the cage */}
          {palm(14, 152, false, Math.round(Math.sin(angle(f) * 4) * 2), 'palm-l')}
          {palm(372, 160, true, -Math.round(Math.sin(angle(f) * 4) * 2), 'palm-r')}

          {/* ================= back glass ================= */}
          {glassWall(A, B, BACK_TOP, BACK_TOP, 'clipBack', [0, 0.2, 0.4, 0.6, 0.8, 1], 0, 'back')}

          {/* pennants on the back beam */}
          {Array.from({ length: 9 }).map((_, i) => {
            const t = (i + 1) / 10;
            const x = lerp(A.x, B.x, t);
            const yTop = lerp(A.y, B.y, t) - BACK_TOP + 1;
            const tip = Math.round(Math.sin(angle(f) * 8 + i) * 1);
            const cols = [PAL.teamA.jersey, PAL.teamB.jersey, PAL.line, PAL.sun[2]];
            return (
              <g key={`flag-${i}`}>
                <polygon points={`${x - 2},${yTop} ${x + 2},${yTop} ${x + tip},${yTop + 5}`} fill={cols[i % 4]} />
                <rect x={x} y={yTop - 1} width={1} height={1} fill={PAL.glass.frameDark} />
              </g>
            );
          })}

          {/* ================= court sand ================= */}
          {[
            [0, 0.24, PAL.sand[0]],
            [0.24, 0.46, PAL.sand[1]],
            [0.46, 0.64, PAL.sand[2]],
            [0.64, 0.82, PAL.sand[3]],
            [0.82, 1, PAL.sand[4]],
          ].map(([v0, v1, c], i) => {
            const p1 = courtPoint(0, v0 as number);
            const p2 = courtPoint(1, v0 as number);
            const p3 = courtPoint(1, v1 as number);
            const p4 = courtPoint(0, v1 as number);
            return (
              <path
                key={`sand-${i}`}
                d={`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`}
                fill={c as string}
              />
            );
          })}
          {[0.24, 0.46, 0.64, 0.82].map((v, i) => {
            const pL = courtPoint(0, v);
            const pR = courtPoint(1, v);
            return (
              <g key={`sandseam-${i}`}>
                {Array.from({ length: 22 }).map((_, k) => {
                  const t = k / 21;
                  return (
                    <rect
                      key={k}
                      x={Math.round(lerp(pL.x, pR.x, t))}
                      y={Math.round(lerp(pL.y, pR.y, t)) - (k % 2)}
                      width={2}
                      height={1}
                      fill={PAL.sand[Math.max(0, i - 1)]}
                    />
                  );
                })}
              </g>
            );
          })}
          {/* foreground grounding: the near sand falls into shade */}
          {(() => {
            const p1 = courtPoint(0, 0.88);
            const p2 = courtPoint(1, 0.88);
            const p3 = courtPoint(1, 1);
            const p4 = courtPoint(0, 1);
            return (
              <g>
                <path
                  d={`M${p1.x},${p1.y} L${p2.x},${p2.y} L${p3.x},${p3.y} L${p4.x},${p4.y} Z`}
                  fill={PAL.sandDeep}
                  opacity={0.16}
                />
                {Array.from({ length: 26 }).map((_, i) => {
                  const v = 0.9 + ((i * 37) % 91) / 1000;
                  const u = ((i * 61) % 100) / 100;
                  const p = courtPoint(u, Math.min(0.995, v));
                  return (
                    <rect
                      key={`fg-${i}`}
                      x={Math.round(p.x)}
                      y={Math.round(p.y)}
                      width={3 + (i % 4) * 2}
                      height={1}
                      fill={i % 2 ? PAL.sandDark : PAL.sandLight}
                      opacity={0.5}
                    />
                  );
                })}
              </g>
            );
          })()}

          {Array.from({ length: 84 }).map((_, i) => {
            const u = 0.03 + (((i * 37) % 97) / 97) * 0.94;
            const v = 0.03 + (((i * 53) % 89) / 89) * 0.94;
            const p = courtPoint(u, v);
            return (
              <rect
                key={`grain-${i}`}
                x={Math.round(p.x)}
                y={Math.round(p.y)}
                width={i % 5 === 0 ? 2 : 1}
                height={1}
                fill={i % 3 === 0 ? PAL.sandLight : PAL.sandDark}
              />
            );
          })}
          {Array.from({ length: 9 }).map((_, i) => {
            const p = courtPoint(0.12 + i * 0.09, 0.78 + (i % 3) * 0.06);
            return (
              <rect
                key={`wind-${i}`}
                x={Math.round(p.x)}
                y={Math.round(p.y)}
                width={4 + (i % 3) * 2}
                height={1}
                fill={PAL.sandLight}
                opacity={0.55}
              />
            );
          })}

          {/* court lines */}
          <g stroke={PAL.line} strokeWidth={1} fill="none">
            <path d={`M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} L${D.x},${D.y} Z`} />
            {[0.3, 0.7].map((v, i) => {
              const pL = courtPoint(0, v);
              const pR = courtPoint(1, v);
              return <path key={`svc-${i}`} d={`M${pL.x},${pL.y} L${pR.x},${pR.y}`} />;
            })}
            {(() => {
              const p1 = courtPoint(0.5, 0.3);
              const p2 = courtPoint(0.5, 0.7);
              return <path d={`M${p1.x},${p1.y} L${p2.x},${p2.y}`} />;
            })()}
            {(() => {
              const p1 = courtPoint(0, 0.5);
              const p2 = courtPoint(1, 0.5);
              return <path d={`M${p1.x},${p1.y} L${p2.x},${p2.y}`} stroke={PAL.lineShade} />;
            })()}
          </g>

          {/* contact shadow where the cage meets the sand */}
          {(() => {
            const mk = (p0: { x: number; y: number }, p1: { x: number; y: number }, dx: number, dy: number) =>
              `M${p0.x},${p0.y} L${p1.x},${p1.y} L${p1.x + dx},${p1.y + dy} L${p0.x + dx},${p0.y + dy} Z`;
            return (
              <g fill={PAL.sandDeep} opacity={0.22}>
                <path d={mk(A, B, 0, 4)} />
                <path d={mk(A, D, 5, 1)} />
                <path d={mk(B, C, -5, 0)} />
              </g>
            );
          })()}

          {/* ================= side glass ================= */}
          {glassWall(A, D, BACK_TOP, SIDE_TOP, 'clipLeft', [0, 0.5, 1], 24, 'left')}
          {glassWall(B, C, BACK_TOP, SIDE_TOP, 'clipRight', [0, 0.5, 1], 58, 'right')}

          {/* ================= beach props ================= */}
          <g>
            {/* folded towel */}
            <polygon points="8,206 44,198 50,209 14,215" fill={PAL.beach[3]} />
            <polygon points="10,205 43,199 47,205 15,211" fill={PAL.teamA.jersey} />
            <polygon points="11,207 44,201 45,203 16,209" fill={PAL.line} />
            <polygon points="13,209 45,203 46,205 17,211" fill={PAL.teamA.dark} />
            {/* kit bag */}
            <rect x={54} y={200} width={15} height={12} fill={PAL.ink} />
            <rect x={55} y={201} width={13} height={10} fill={PAL.teamB.jersey} />
            <rect x={55} y={201} width={13} height={1} fill={PAL.teamB.light} />
            <rect x={64} y={203} width={2} height={5} fill={PAL.teamB.dark} />
            <rect x={57} y={197} width={8} height={4} fill={PAL.ink} />
            <rect x={58} y={198} width={6} height={2} fill={PAL.teamB.light} />
            {/* surfboard leaning on the bag */}
            {[
              1, 2, 4, 6, 7, 8, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 7, 6, 4, 2,
            ].map((w, i) => {
              const y = 186 + i;
              const xc = 76 + Math.round((214 - y) * 0.1);
              const stripe = i >= 5 && i <= 21;
              return (
                <g key={`board-${i}`}>
                  <rect x={xc - Math.floor(w / 2) - 1} y={y} width={w + 2} height={1} fill={PAL.ink} />
                  <rect x={xc - Math.floor(w / 2)} y={y} width={w} height={1} fill={PAL.line} />
                  {stripe && <rect x={xc - 1} y={y} width={2} height={1} fill={PAL.teamA.jersey} />}
                  {i >= 2 && i <= 4 && <rect x={xc - 1} y={y} width={2} height={1} fill={PAL.sun[2]} />}
                </g>
              );
            })}
            <polygon points="80,208 85,212 80,212" fill={PAL.ink} />
            <polygon points="81,209 84,212 81,212" fill={PAL.teamA.dark} />
          </g>

          {/* player shadows: low sun on the right throws long shadows to the near-left */}
          {players.map((p) => {
            const tipX = p.x - 13 - Math.round(p.h * 0.18);
            const tipY = p.groundY + 3 + Math.round(p.h * 0.06);
            return (
              <g key={`shadow-${p.name}`}>
                <polygon
                  points={`${p.x - 7},${p.groundY} ${p.x + 7},${p.groundY} ${tipX + 1},${tipY} ${tipX - 1},${tipY}`}
                  fill={PAL.sandDeep}
                  opacity={0.2}
                />
                <rect x={p.x - 8} y={p.groundY + 1} width={16} height={2} fill={PAL.sandDark} opacity={0.8} />
                <rect x={p.x - 5} y={p.groundY + 3} width={11} height={1} fill={PAL.sandDeep} opacity={0.55} />
              </g>
            );
          })}

          {/* far players */}
          {(['FL', 'FR'] as Name[]).map((n) => {
            const p = byName(n);
            const rs = drawPlayer({
              x: p.x,
              groundY: p.groundY,
              h: p.h,
              facing: p.facing,
              team: p.team,
              pose: { crouch: p.crouch, split: p.split, lean: p.lean, lift: p.lift, stage: p.stage, aim: p.aiming },
              aimX: ballNow.x,
              aimY: ballNow.y,
              readyArm: p.readyArm,
            });
            return <g key={`pl-${n}`}>{rects(rs, n)}</g>;
          })}

          {/* ================= net ================= */}
          {(() => {
            const pL = courtPoint(0, 0.5);
            const pR = courtPoint(1, 0.5);
            const topL = pL.y - NET_H;
            const topR = pR.y - NET_H;
            return (
              <g>
                <polygon
                  points={`${pL.x},${topL} ${pR.x},${topR} ${pR.x},${pR.y} ${pL.x},${pL.y}`}
                  fill={PAL.net.mesh}
                  opacity={0.16}
                />
                <polygon
                  points={`${pL.x},${topL} ${pR.x},${topR} ${pR.x},${pR.y} ${pL.x},${pL.y}`}
                  fill="url(#netGrid)"
                />
                <line x1={pL.x} y1={topL} x2={pR.x} y2={topR} stroke={PAL.net.tape} strokeWidth={2} />
                <line x1={pL.x} y1={topL + 2} x2={pR.x} y2={topR + 2} stroke={PAL.net.tapeShade} strokeWidth={1} />
                <line x1={pL.x} y1={pL.y} x2={pR.x} y2={pR.y} stroke={PAL.net.mesh} strokeWidth={1} opacity={0.8} />
                {(() => {
                  const c = courtPoint(0.5, 0.5);
                  const cTop = c.y - NET_H;
                  return (
                    <g>
                      <line x1={c.x} y1={cTop} x2={c.x} y2={c.y} stroke={PAL.net.tape} strokeWidth={2} />
                      <rect x={c.x - 1} y={cTop + Math.round(NET_H * 0.55)} width={4} height={2} fill={PAL.net.post} />
                    </g>
                  );
                })()}
                <rect x={pL.x - 1} y={topL - 2} width={3} height={NET_H + 3} fill={PAL.net.post} />
                <rect x={pR.x - 1} y={topR - 2} width={3} height={NET_H + 3} fill={PAL.net.post} />
                <rect x={pL.x - 1} y={topL - 2} width={3} height={2} fill={PAL.glass.frameLit} />
                <rect x={pR.x - 1} y={topR - 2} width={3} height={2} fill={PAL.glass.frameLit} />
              </g>
            );
          })()}

          {/* near players */}
          {(['NL', 'NR'] as Name[]).map((n) => {
            const p = byName(n);
            const rs = drawPlayer({
              x: p.x,
              groundY: p.groundY,
              h: p.h,
              facing: p.facing,
              team: p.team,
              pose: { crouch: p.crouch, split: p.split, lean: p.lean, lift: p.lift, stage: p.stage, aim: p.aiming },
              aimX: ballNow.x,
              aimY: ballNow.y,
              readyArm: p.readyArm,
            });
            return <g key={`pl-${n}`}>{rects(rs, n)}</g>;
          })}

          {/* glass impact ripples */}
          {ripples.map((g, i) => {
            const age = f - g.f;
            return (
              <g key={`ripple-${i}`}>
                <rect x={g.x - age} y={g.y - age} width={age * 2 + 2} height={1} fill={PAL.flash} />
                <rect x={g.x - age} y={g.y + age} width={age * 2 + 2} height={1} fill={PAL.flash} />
                <rect x={g.x - age} y={g.y - age} width={1} height={age * 2 + 2} fill={PAL.flash} />
                <rect x={g.x + age + 1} y={g.y - age} width={1} height={age * 2 + 2} fill={PAL.flash} />
                <rect x={g.x - 2} y={g.y - 2} width={4} height={4} fill={PAL.glass.top} />
                <rect x={g.x - 8} y={g.y + 4} width={6} height={1} fill={PAL.glass.top} />
                <rect x={g.x + 4} y={g.y - 7} width={1} height={5} fill={PAL.glass.top} />
              </g>
            );
          })}

          {/* ================= ball ================= */}
          <rect
            x={ballP3.x}
            y={ballP3.y}
            width={1}
            height={1}
            fill={PAL.ballShade}
            opacity={0.3}
          />
          <rect
            x={ballP2.x - 1}
            y={ballP2.y - 1}
            width={2}
            height={2}
            fill={PAL.ballShade}
            opacity={0.45}
          />
          <rect x={ballP1.x - 1} y={ballP1.y - 1} width={3} height={3} fill={PAL.ballShade} opacity={0.6} />
          {(() => {
            const sw = clamp(5 - Math.round(ball.z * 0.09), 1, 5);
            return (
              <g>
                <rect x={ballNow.x - Math.floor(sw / 2)} y={Math.round(ball.groundY)} width={sw} height={1} fill={PAL.sandDeep} />
                <rect x={ballNow.x - Math.floor((sw - 1) / 2)} y={Math.round(ball.groundY) + 1} width={Math.max(1, sw - 1)} height={1} fill={PAL.sandDark} opacity={0.6} />
              </g>
            );
          })()}
          <g>
            <rect x={ballNow.x - 2} y={ballNow.y - 1} width={5} height={3} fill={PAL.ballLine} />
            <rect x={ballNow.x - 1} y={ballNow.y - 2} width={3} height={5} fill={PAL.ballLine} />
            <rect x={ballNow.x - 1} y={ballNow.y - 1} width={3} height={3} fill={PAL.ball} />
            <rect x={ballNow.x - 1} y={ballNow.y - 1} width={1} height={1} fill={PAL.ballLight} />
          </g>

          {/* racket contact burst */}
          {hitFlash > 0 && hitCtx && (
            <g>
              {[
                [0, -6, 1, 4],
                [0, 6, 1, 4],
                [-6, 0, 4, 1],
                [6, 0, 4, 1],
                [-4, -4, 2, 2],
                [4, -4, 2, 2],
                [-4, 4, 2, 2],
                [4, 4, 2, 2],
                [-8, -1, 2, 1],
                [8, 1, 2, 1],
              ].map(([dx, dy, w, h], i) => (
                <rect
                  key={`ray-${i}`}
                  x={ballNow.x + dx}
                  y={ballNow.y + dy}
                  width={w}
                  height={h}
                  fill={i % 2 ? PAL.flashWarm : PAL.flash}
                />
              ))}
              <rect x={ballNow.x - 1} y={ballNow.y - 1} width={3} height={3} fill={PAL.flash} />
            </g>
          )}

          {/* sand puffs */}
          {puffs.map((e, bi) => {
            const age = f - e.f;
            return (
              <g key={`puff-${bi}`}>
                {[0, 1, 2, 3, 4, 5].map((k) => {
                  const dx = [-4, 1, 5, -1, 7, 3][k];
                  const dy = [-1, -3, -2, -5, -1, -4][k];
                  return (
                    <rect
                      key={k}
                      x={Math.round(e.x + dx + (k % 2 ? age * 0.4 : -age * 0.3))}
                      y={Math.round(e.y + dy - age * 0.45)}
                      width={k % 3 === 0 ? 2 : 1}
                      height={1}
                      fill={k % 2 ? PAL.sandLight : PAL.sandDark}
                      opacity={0.9 - age * 0.05}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* edge tint keeps the frame from floating */}
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={`vig-top-${i}`} x={(i * 22 + (i % 2) * 5) % 384} y={0} width={9} height={1} fill={PAL.ink} opacity={0.35} />
          ))}
          {Array.from({ length: 18 }).map((_, i) => (
            <rect key={`vig-bot-${i}`} x={(i * 22 + (i % 2) * 6) % 384} y={215} width={9} height={1} fill={PAL.ink} opacity={0.35} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Lean into the contact, from zero at the wind-up to 3 px at follow-through. */
function nearLean(df: number) {
  if (df < -16 || df > 16) return 0;
  return Math.round(lerp(0, 3, clamp((df + 14) / 22, 0, 1)));
}

export default Scene;
