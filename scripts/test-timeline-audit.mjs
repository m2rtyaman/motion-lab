/**
 * Proves scripts/timeline-audit.mjs: the good fixture passes, the bad fixtures fail with the expected codes.
 * Run: node scripts/test-timeline-audit.mjs   (spawns the audit through npx tsx)
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { rootDir } from "./lib/projects.mjs";
import { RULE_DOCS } from "./timeline-audit.mjs";

const strip = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
function audit(name) {
  const r = spawnSync("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.join("scripts", "fixtures", "timeline-audit", name)], {
    cwd: rootDir,
    shell: true,
    encoding: "utf-8",
  });
  const out = strip(`${r.stdout}${r.stderr}`);
  const codes = new Set([...out.matchAll(/\[(T\d{3})(?: warning)?\]/g)].map((m) => m[1]));
  return { status: r.status, out, codes };
}

test("good fixture passes with no findings", () => {
  const r = audit("good");
  assert.equal(r.status, 0, r.out);
  assert.equal(r.codes.size, 0, r.out);
});

test("bad fixture fails with T001-T005 errors and T006/T007 warnings", () => {
  const r = audit("bad");
  assert.equal(r.status, 1, r.out);
  for (const code of ["T001", "T002", "T003", "T004", "T005", "T006", "T007"]) assert.ok(r.codes.has(code), `expected ${code}\n${r.out}`);
  assert.match(r.out, /\[T001\] bad f150 label beat:b is at f150 but spec startFrame is f120/);
  assert.match(r.out, /\[T006 warning\]/);
  assert.match(r.out, / → /);
});

test("bad-craft fixture triggers T008-T013 with teaching messages", () => {
  const r = audit("bad-craft");
  assert.equal(r.status, 1, r.out); // T009 is an error here (900px in 24f)
  for (const code of ["T008", "T009", "T010", "T011", "T012", "T013"]) assert.ok(r.codes.has(code), `expected ${code}\n${r.out}`);
  assert.match(r.out, /\[T009\] bad-craft f42 .*peak 259 px\/f, above 80 px\/f for 4 frames/);
  assert.match(r.out, /\[T008 warning\] .* → .*See docs\/MOTION_MATH\.md#2-easing--velocity-profile/);
  assert.match(r.out, /\[T010 warning\].*stagger/);
});

test("spec.audit.allow turns findings into [allowed] one-liners", () => {
  const r = audit("allowed");
  assert.equal(r.status, 0, r.out);
  assert.equal(r.codes.size, 0, r.out);
  assert.match(r.out, /\[allowed\] T012 allowed f\d+ .*reason: fixture demonstrates linear motion/);
});

test("every doc anchor referenced by a rule exists as a heading", () => {
  const slug = (h) => h.toLowerCase().replace(/[^a-z0-9 _-]/g, "").trim().replace(/ /g, "-");
  for (const [code, link] of Object.entries(RULE_DOCS)) {
    const [file, anchor] = link.split("#");
    const heads = fs
      .readFileSync(path.join(rootDir, file), "utf-8")
      .split(/\r?\n/)
      .filter((l) => /^#{1,6} /.test(l))
      .map((l) => slug(l.replace(/^#+ /, "")));
    assert.ok(heads.includes(anchor), `${code}: ${link} not found; headings: ${heads.join(", ")}`);
  }
});

test("T014 resolves classNames generated inside RigCharacter and catches a typo'd rig selector", () => {
  const r = audit("rig-typo");
  assert.equal(r.status, 1, r.out);
  assert.deepEqual([...r.codes], ["T014"], r.out);
  assert.match(r.out, /selector "\.hero-torsoo" matches no element/);
  assert.match(r.out, /closest: \.hero-torso/);
});

test("rig studies are clean: T014 resolves hero-* classes, one rig helper call is one move (T007)", () => {
  for (const slug of ["study-character-walk", "study-character-acting"]) {
    const r = spawnSync("npx", ["tsx", "scripts/timeline-audit.mjs", "--project", slug], { cwd: rootDir, shell: true, encoding: "utf-8" });
    const out = strip(`${r.stdout}${r.stderr}`);
    assert.equal(r.status, 0, out);
    assert.doesNotMatch(out, /\[T0\d\d( warning)?\]|\[allowed\]/, out);
  }
});

test("RIG_PART_CLASSES mirrors RigCharacter.tsx and physics.ts (drift guard)", async () => {
  const { RIG_PART_CLASSES } = await import("./lib/jsx-selectors.mjs");
  const tsx = fs.readFileSync(path.join(rootDir, "src/primitives/characters/RigCharacter.tsx"), "utf-8");
  const rendered = new Set([...tsx.matchAll(/\$\{id\}-([a-z]+(?:-\$\{side\})?)/g)].flatMap((m) => (m[1].endsWith("-${side}") ? [`${m[1].slice(0, -8)}-l`, `${m[1].slice(0, -8)}-r`] : [m[1]])));
  assert.deepEqual([...rendered].sort(), [...RIG_PART_CLASSES].sort(), "RigCharacter.tsx classes changed: update RIG_PART_CLASSES in scripts/lib/jsx-selectors.mjs");
  const phys = fs.readFileSync(path.join(rootDir, "src/core/physics.ts"), "utf-8");
  const block = phys.match(/RIG_PART_NAMES[^=]*=\s*\{([\s\S]*?)\};/)[1];
  const names = [...block.matchAll(/:\s*'([a-z-]+)'/g)].map((m) => m[1]);
  for (const n of names) assert.ok(RIG_PART_CLASSES.includes(n), `physics.ts rigParts names "${n}" which the scan does not know`);
});
