import test from 'node:test';
import assert from 'node:assert/strict';

// Plain objects stand in for DOM nodes; CSS props are "invalid" without CSSPlugin (warning only).
const origWarn = console.warn;
console.warn = (...a) => { if (!a.join(' ').includes('Missing plugin')) origWarn(...a); };
const { default: gsap } = await import('gsap');
const { beat, enter, exit, emphasize, camera, transition, holdFinal, PRESET_CATALOG } = await import('../src/core/presets.ts');
gsap.config({ nullTargetWarn: false });

const el = () => ({});
const fresh = () => gsap.timeline({ paused: true });
const EPS = 1e-6;

const FORBIDDEN = /^(width|height|top|left|right|bottom|margin|padding)/;
const ALLOWED = new Set([
  'x', 'y', 'scale', 'scaleX', 'scaleY', 'rotate', 'rotateX', 'rotateY', 'rotateZ',
  'opacity', 'filter', 'clipPath', 'transformOrigin', 'duration', 'ease', 'stagger', 'data',
  'overwrite', 'immediateRender', 'delay', 'parent', 'startAt', 'runBackwards', 'lazy', 'repeat',
]);

const cases = [
  ['enter', 'rise', (tl, at) => enter(tl, el(), 'rise', at)],
  ['enter', 'pop', (tl, at) => enter(tl, el(), 'pop', at)],
  ['enter', 'blurIn', (tl, at) => enter(tl, el(), 'blurIn', at)],
  ['enter', 'wipe', (tl, at) => enter(tl, el(), 'wipe', at)],
  ['enter', 'stagger', (tl, at) => enter(tl, [el()], 'stagger', at)],
  ['enter', 'words', (tl, at) => enter(tl, [el()], 'words', at)],
  ['exit', 'sink', (tl, at) => exit(tl, el(), 'sink', at)],
  ['exit', 'shrink', (tl, at) => exit(tl, el(), 'shrink', at)],
  ['exit', 'wipeOut', (tl, at) => exit(tl, el(), 'wipeOut', at)],
  ['emphasize', 'punch', (tl, at) => emphasize(tl, el(), 'punch', at)],
  ['emphasize', 'shake', (tl, at) => emphasize(tl, el(), 'shake', at)],
  ['emphasize', 'glint', (tl, at) => emphasize(tl, el(), 'glint', at)],
  ['camera', 'pushIn', (tl, at) => camera(tl, el(), 'pushIn', at)],
  ['camera', 'pullOut', (tl, at) => camera(tl, el(), 'pullOut', at)],
  ['camera', 'drift', (tl, at) => camera(tl, el(), 'drift', at)],
  ['camera', 'settle', (tl, at) => camera(tl, el(), 'settle', at)],
  ['transition', 'whip', (tl, at) => transition(tl, 'whip', at, { outgoing: el(), incoming: el() })],
  ['transition', 'maskWipe', (tl, at) => transition(tl, 'maskWipe', at, { incoming: el() })],
  ['transition', 'morph', (tl, at) => transition(tl, 'morph', at, { container: el(), outgoing: el(), incoming: el() })],
  ['transition', 'zoomPunch', (tl, at) => transition(tl, 'zoomPunch', at, { outgoing: el(), incoming: el() })],
  ['transition', 'takeover', (tl, at) => transition(tl, 'takeover', at, { trigger: el(), outgoing: el(), incoming: el() })],
  ['transition', 'dive', (tl, at) => transition(tl, 'dive', at, { rig: el(), outgoing: el(), incoming: el() })],
];

test('catalog covers exactly the tested presets', () => {
  const inCatalog = Object.entries(PRESET_CATALOG).flatMap(([k, v]) => Object.keys(v).map((n) => `${k}:${n}`));
  assert.deepEqual(inCatalog.sort(), cases.map(([k, n]) => `${k}:${n}`).sort());
  for (const [k, group] of Object.entries(PRESET_CATALOG)) {
    for (const [n, e] of Object.entries(group)) {
      assert.ok(e.description.length > 10, `${k}:${n} description`);
      assert.ok(e.duration > 0, `${k}:${n} duration`);
    }
  }
});

for (const [kind, name, run] of cases) {
  test(`${kind}:${name} tags tweens and matches catalog duration`, () => {
    const AT = 1.5;
    const tl = fresh();
    assert.equal(run(tl, AT), tl, 'returns the timeline');
    const kids = tl.getChildren(false);
    assert.ok(kids.length >= 1, 'adds at least one tween');
    for (const k of kids) assert.equal(k.data?.preset, `${kind}:${name}`);
    const start = Math.min(...kids.map((k) => k.startTime()));
    assert.ok(Math.abs(start - AT) < EPS, `starts at ${AT}, got ${start}`);
    const end = Math.max(...kids.map((k) => k.startTime() + k.duration()));
    assert.ok(Math.abs(end - AT - PRESET_CATALOG[kind][name].duration) < EPS, `duration ${end - AT}`);
    for (const k of kids) {
      for (const key of Object.keys(k.vars)) {
        assert.ok(!FORBIDDEN.test(key), `layout prop ${key}`);
        assert.ok(ALLOWED.has(key), `unexpected prop ${key}`);
      }
    }
  });
}

test('beat adds beat:<id> label at time', () => {
  const tl = fresh();
  beat(tl, 'intro', 2.25);
  assert.equal(tl.labels['beat:intro'], 2.25);
});

test('holdFinal adds labels and no tweens', () => {
  const tl = fresh();
  holdFinal(tl, 5);
  assert.equal(tl.labels['hold:start'], 5);
  assert.ok(Math.abs(tl.labels['hold:end'] - 6.2) < EPS);
  assert.equal(tl.getChildren(false).length, 0);
  holdFinal(tl, 5, 2);
  assert.equal(tl.labels['hold:end'], 7);
});

test('exits are fast', () => {
  for (const n of Object.keys(PRESET_CATALOG.exit)) assert.ok(PRESET_CATALOG.exit[n].duration <= 0.32 + EPS);
});

test('opts map to token values; raw numbers cannot leak', () => {
  const dur = (tl) => tl.getChildren(false).map((k) => k.duration());
  const base = fresh(); enter(base, el(), 'rise', 0);
  const evil = fresh();
  enter(evil, el(), 'rise', 0, { duration: 99, ease: 'linear', x: 9999, intensity: 'huge', stagger: 7, direction: 'sideways' });
  assert.deepEqual(dur(evil), dur(base));
  assert.equal(evil.getChildren(false)[0].vars.ease, base.getChildren(false)[0].vars.ease);
  assert.equal(evil.getChildren(false)[0].vars.x, base.getChildren(false)[0].vars.x);
  // intensity changes scale but only via fixed tables
  const soft = fresh(); camera(soft, el(), 'pushIn', 0, { intensity: 'soft' });
  const strong = fresh(); camera(strong, el(), 'pushIn', 0, { intensity: 'strong' });
  assert.ok(soft.getChildren(false)[0].vars.scale < strong.getChildren(false)[0].vars.scale);
  // direction changes start offset
  const l = fresh(); enter(l, el(), 'rise', 0, { direction: 'left' });
  const r = fresh(); enter(r, el(), 'rise', 0, { direction: 'right' });
  assert.ok(l.getChildren(false)[0].vars.startAt.x > 0 && r.getChildren(false)[0].vars.startAt.x < 0);
});

test('stagger option widens the group span', () => {
  const span = (s) => { const tl = fresh(); enter(tl, [el(), el(), el()], 'stagger', 0, { stagger: s }); return tl.duration(); };
  assert.ok(span('tight') < span('normal') && span('normal') < span('loose'));
});

test('no Math.random usage in presets source', async () => {
  const { readFileSync } = await import('node:fs');
  assert.ok(!/Math\.random|Date\.now/.test(readFileSync(new URL('../src/core/presets.ts', import.meta.url), 'utf8')));
});
