/**
 * Proves the eval harness (scripts/eval-score.mjs + evals/):
 *  - every task has TASK.md, a valid rubric.json and a reference solution that scores >= 90;
 *  - the deliberately weak fixture scores <= 50 and a project with gate errors is capped at 30;
 *  - the three audits really print machine-readable --json.
 * Run: node scripts/test-evals.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { rootDir } from "./lib/projects.mjs";
import { scoreDir, extractText, normText, GATE_CAP, BEHAVIOR_CAP, evalBehavior, visibleHoldText } from "./eval-score.mjs";
import { parseRubric, visualScore } from "./eval-visual.mjs";
import { runsOf, windupsOf } from "./timeline-audit.mjs";

const tasksDir = path.join(rootDir, "evals", "tasks");
const solutionsDir = path.join(rootDir, "evals", "solutions");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));
const taskIds = fs.readdirSync(tasksDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
const rubricOf = (id) => readJson(path.join(tasksDir, id, "rubric.json"));

/** Default: the static heuristics only (fast). EVAL_TEST_PROBE=1 scores every solution with the real browser probe (needs Chrome, a few minutes). */
const PROBE_MODE = process.env.EVAL_TEST_PROBE ? undefined : "static";
const EXPECTED = ["anticipation-jump", "bouncing-ball", "character-walk-react", "kinetic-manifesto", "list-reveal", "logo-sting", "product-ui-feature", "stat-counter"];
const scores = new Map();
let pending;
/** Scores every solution once (3 in parallel), caches the results. */
function scoreAll() {
  pending ??= (async () => {
    const jobs = [
      ...taskIds.map((id) => ({ key: id, id, dir: path.join(solutionsDir, id) })),
      { key: "weak", id: "bouncing-ball", dir: path.join(rootDir, "evals", "fixtures", "weak-bouncing-ball") },
      { key: "gate-fail", id: "bouncing-ball", dir: path.join(rootDir, "scripts", "fixtures", "timeline-audit", "bad") },
    ];
    let next = 0;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (next < jobs.length) {
        const j = jobs[next++];
        scores.set(j.key, await scoreDir({ dir: j.dir, rubric: rubricOf(j.id), probe: PROBE_MODE }));
      }
    }));
  })();
  return pending;
}

test("the eight exercises exist with TASK.md, rubric.json, solution (spec, Scene, direction)", () => {
  assert.deepEqual(taskIds, EXPECTED);
  for (const id of taskIds) {
    assert.ok(fs.existsSync(path.join(tasksDir, id, "TASK.md")), `${id}: TASK.md`);
    const r = rubricOf(id);
    assert.equal(r.task, id, `${id}: rubric.task`);
    assert.ok(["16:9", "9:16"].includes(r.aspect), `${id}: aspect`);
    assert.ok(r.durationSeconds.min < r.durationSeconds.max, `${id}: duration range`);
    assert.ok(Array.isArray(r.requiredTags) && r.requiredTags.length > 0, `${id}: requiredTags`);
    for (const f of ["spec.json", "Scene.tsx", "direction.md"]) assert.ok(fs.existsSync(path.join(solutionsDir, id, f)), `${id}: solution ${f}`);
    assert.equal(readJson(path.join(solutionsDir, id, "spec.json")).evalTask, id, `${id}: solution evalTask`);
    const lines = fs.readFileSync(path.join(solutionsDir, id, "Scene.tsx"), "utf-8").split(/\r?\n/).length;
    assert.ok(lines <= 150, `${id}: solution Scene.tsx has ${lines} lines (max 150)`);
    assert.ok(fs.readFileSync(path.join(tasksDir, id, "TASK.md"), "utf-8").split(/\r?\n/).length <= 40, `${id}: TASK.md should be a short brief`);
  }
});

test("every reference solution scores >= 95 and passes the gate", async () => {
  await scoreAll();
  for (const id of taskIds) {
    const r = scores.get(id);
    assert.ok(r.score >= 95, `${id} scored ${r.score}: ${JSON.stringify({ gate: r.breakdown.gate.errors, craft: r.breakdown.craft.penalties, rubric: r.breakdown.rubric.checks.filter((c) => !c.pass), copy: r.breakdown.copy })}`);
    assert.equal(r.breakdown.gate.errors.length, 0, `${id}: gate`);
  }
});

test("the weak fixture scores <= 50", async () => {
  await scoreAll();
  const r = scores.get("weak");
  assert.ok(r.score <= 50, `weak-bouncing-ball scored ${r.score}`);
  assert.equal(r.breakdown.gate.errors.length, 0, "the weak fixture must be gate-clean so the craft/rubric/copy parts are what fail");
});

test("gate errors cap the score at 30", async () => {
  await scoreAll();
  const r = scores.get("gate-fail");
  assert.ok(r.breakdown.gate.errors.length > 0);
  assert.ok(r.capped && r.score <= GATE_CAP, `score ${r.score}`);
});

test("copy matching joins words split across string literals and ignores punctuation/case", () => {
  const text = normText(extractText("const L = ['Less', 'noise.']; const n = <b>{x}48,200 Riders</b>; const c = 48200;"));
  assert.ok(text.includes(normText("Less noise.")));
  assert.ok(text.includes(normText("48,200")));
  assert.ok(text.includes(normText("riders")));
  assert.ok(!text.includes(normText("More signal.")));
});

test("audits print machine-readable --json with {code, severity, frame, target, message}", () => {
  const run = (cmd, args) => {
    const r = spawnSync(cmd, args, { cwd: rootDir, shell: true, encoding: "utf-8" });
    return { status: r.status, json: JSON.parse(r.stdout.slice(r.stdout.indexOf("{"), r.stdout.lastIndexOf("}") + 1)) };
  };
  const bad = path.join("scripts", "fixtures", "timeline-audit", "bad-craft");
  const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", bad, "--json"]);
  assert.equal(t.status, 1);
  assert.equal(t.json.ok, false);
  assert.ok(t.json.findings.some((f) => f.code === "T009" && f.severity === "error" && typeof f.frame === "number" && f.target && f.message));
  assert.ok(t.json.findings.some((f) => f.code === "T008" && f.severity === "warning"));
  const good = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.join("evals", "solutions", "logo-sting"), "--json"]);
  assert.equal(good.status, 0);
  assert.ok(good.json.meta["logo-sting"].presetCounts["enter:blurIn"] >= 1);
  const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.join("evals", "solutions", "logo-sting"), "--json"]);
  assert.equal(a.status, 0);
  assert.equal(a.json.meta["logo-sting"].localComponents, 0);
  const s = run("node", ["scripts/validate-spec.mjs", "--dir", path.join("scripts", "fixtures", "timeline-audit", "bad"), "--json"]);
  assert.ok(Array.isArray(s.json.findings));
});

test("every brief lists its delivery spec and the rubric has on-screen checks", () => {
  for (const id of taskIds) {
    assert.match(fs.readFileSync(path.join(tasksDir, id, "TASK.md"), "utf-8"), /Delivery spec/, `${id}: TASK.md needs a Delivery spec`);
    const r = rubricOf(id);
    assert.ok((r.behavior?.length ?? 0) + (r.closingHold ? 1 : 0) + (r.rhythm ? 1 : 0) > 0, `${id}: rubric needs behavior, closingHold or rhythm checks`);
  }
});

test("motion runs and wind-up detection", () => {
  // 20 px dip, then a 250 px jump straight after it: a wind-up. A 250 px move after a 250 px move is not.
  const frames = [...Array(10).fill(0), ...Array.from({ length: 5 }, (_, i) => (i + 1) * 4), ...Array.from({ length: 12 }, (_, i) => 20 - (i + 1) * 22.5)];
  const runs = runsOf(frames);
  assert.equal(runs.length, 2);
  assert.equal(windupsOf(runs, 60).length, 1);
  const bounces = [...Array.from({ length: 20 }, (_, i) => -250 + (i + 1) * 12.5), ...Array.from({ length: 20 }, (_, i) => -(i + 1) * 12.5)];
  assert.equal(windupsOf(runsOf(bounces), 60).length, 0, "a rebound is not a wind-up");
});

test("behavior checks read the timeline meta (ball in place fails, travelling ball passes)", () => {
  const ball = (net, heights) => ({ fps: 60, frame: { width: 1920 }, motion: { ".ball": { presets: ["physics:bounce"], x: net ? { net } : undefined, heights, scaleY: { min: 0.78, max: 1.09 } } } });
  const travel = { type: "netTravel", minFraction: 0.25 };
  assert.equal(evalBehavior(travel, ball(0, [300, 120, 48, 19])).pass, false);
  assert.equal(evalBehavior(travel, ball(1000, [300, 120, 48, 19])).pass, true);
  assert.equal(evalBehavior({ type: "bounces", min: 3 }, ball(1000, [300, 120, 48, 19])).pass, true);
  assert.equal(evalBehavior({ type: "bounces", min: 3 }, ball(1000, [300, 300, 300, 300])).pass, false, "equal heights are not decay");
  assert.equal(evalBehavior({ type: "bounces", min: 3 }, ball(1000, [300, 120])).pass, false);
  assert.equal(evalBehavior({ type: "squash", maxScaleY: 0.92 }, ball(1000, [])).pass, true);
  assert.ok(BEHAVIOR_CAP < 90, "a behavior failure must drop the score below the 90 'learned it' band");
});

test("closing-hold check: text under a faded element or a later full-bleed panel is not on screen", () => {
  const code = `const H = 'Saves that sort'; const C = 'Try free';
  export const S = () => (<A>
    <div className="stage"><h1>{H}</h1></div>
    <div className="cover absolute inset-0" style={{ backgroundColor: 'red' }}><b>{C}</b></div>
  </A>);`;
  const visible = (state) => normText(visibleHoldText(code, state));
  assert.ok(visible({}).includes("saves that sort"), "no tween: visible");
  assert.ok(!visible({ ".stage": { opacity: 0 } }).includes("saves that sort"), "stage faded out");
  assert.ok(!visible({ ".cover": { opacity: 1 } }).includes("saves that sort"), "tweened cover paints over the stage");
  assert.ok(visible({ ".cover": { opacity: 1 } }).includes("try free"));
});

test("visual rubric: every task has 5-8 yes/no questions, scoring is separate and counts unanswered as no", () => {
  const rubric = parseRubric(fs.readFileSync(path.join(rootDir, "evals", "VISUAL_RUBRIC.md"), "utf-8"));
  assert.ok(rubric.generic.length >= 5);
  const ids = new Set();
  for (const id of taskIds) {
    assert.ok(rubric[id]?.length >= 5 && rubric[id].length <= 8, `${id}: ${rubric[id]?.length} visual questions`);
    for (const q of [...rubric[id], ...rubric.generic]) { assert.ok(!ids.has(q.id) || q.id.startsWith("generic."), `duplicate id ${q.id}`); ids.add(q.id); }
    assert.ok(rubric[id].every((q) => q.id.startsWith(id + ".")), `${id}: ids must start with the task id`);
  }
  const all = Object.fromEntries([...rubric["bouncing-ball"], ...rubric.generic].map((q) => [q.id, true]));
  assert.equal(visualScore(rubric, "bouncing-ball", all).score, 100);
  assert.equal(visualScore(rubric, "bouncing-ball", {}).score, 0);
  const half = visualScore(rubric, "bouncing-ball", { "bouncing-ball.travels": true });
  assert.ok(half.score > 0 && half.score < 30 && half.missing.length > 0);
});

test("storyboard-audit results (stub): SB errors are gate errors, SB warnings cost 2 craft points each (max 8)", async () => {
  const clean = { ok: true, json: { findings: [], meta: {} } };
  const sb = (findings) => ({ ok: true, json: { ok: !findings.some((f) => f.severity === "error"), findings, meta: {} } });
  const finding = (code, severity) => ({ code, severity, frame: 10, target: ".x", message: `${code} demo` });
  const dir = path.join(solutionsDir, "stat-counter");
  const rubric = rubricOf("stat-counter");
  const base = await scoreDir({ dir, rubric, similarity: false, audits: { spec: clean, ast: clean, timeline: clean, storyboard: sb([]) } });
  const warned = await scoreDir({ dir, rubric, similarity: false, audits: { spec: clean, ast: clean, timeline: clean, storyboard: sb([finding("SB002", "warning"), finding("SB003", "warning")]) } });
  assert.equal(Math.round((base.breakdown.craft.score - warned.breakdown.craft.score) * 10) / 10, 4);
  const many = await scoreDir({ dir, rubric, similarity: false, audits: { spec: clean, ast: clean, timeline: clean, storyboard: sb(Array.from({ length: 7 }, (_, i) => finding(`SB10${i}`, "warning"))) } });
  assert.equal(Math.round((base.breakdown.craft.score - many.breakdown.craft.score) * 10) / 10, 8);
  const failed = await scoreDir({ dir, rubric, similarity: false, audits: { spec: clean, ast: clean, timeline: clean, storyboard: sb([finding("SB001", "error")]) } });
  assert.ok(failed.breakdown.gate.errors.some((e) => e.code === "SB001"), JSON.stringify(failed.breakdown.gate.errors));
  assert.ok(failed.score <= GATE_CAP);
});

test("rig behavior checks: hold (idleBreath), lookAt before react, react anticipation", () => {
  const meta = {
    fps: 60, frame: { width: 1920 },
    motion: { ".h-root": { x: { runs: [[30, 90, 300]] } }, ".h-hips": { presets: ["physics:react"], y: { runs: [[240, 247, 14], [248, 254, -14]] } } },
    physicsMoves: [
      { preset: "physics:idleBreath", target: ".h-head", startFrame: 100, endFrame: 196 },
      { preset: "physics:lookAt", target: ".h-pupils", startFrame: 200, endFrame: 207 },
      { preset: "physics:lookAt", target: ".h-head", startFrame: 203, endFrame: 220 },
      { preset: "physics:react", target: ".h-hips", startFrame: 240, endFrame: 247 },
    ],
  };
  const pass = (b, m = meta) => evalBehavior(b, m).pass;
  assert.ok(pass({ type: "holdBeforeReaction", minSeconds: 0.3, presets: ["physics:idleBreath"] }));
  assert.ok(!pass({ type: "holdBeforeReaction", minSeconds: 0.3 }), "idleBreath does not count unless the rubric lists it");
  assert.ok(pass({ type: "lookLeadsReaction" }));
  assert.ok(pass({ type: "reactAnticipates" }));
  const noLook = { ...meta, physicsMoves: meta.physicsMoves.filter((m) => m.preset !== "physics:lookAt") };
  assert.ok(!pass({ type: "lookLeadsReaction" }, noLook));
  const lateLook = { ...meta, physicsMoves: meta.physicsMoves.map((m) => (m.preset === "physics:lookAt" ? { ...m, startFrame: m.startFrame + 60 } : m)) };
  assert.ok(!pass({ type: "lookLeadsReaction" }, lateLook), "looking after the reaction started is not leading it");
  const noDip = { ...meta, motion: { ...meta.motion, ".h-hips": { presets: ["physics:react"], y: { runs: [[240, 247, -14]] } } } };
  assert.ok(!pass({ type: "reactAnticipates" }, noDip));
  const hipBobOnly = { ...meta, motion: { ...meta.motion, ".h-hips": { presets: ["physics:react"], y: { runs: [[20, 27, 14], [28, 34, -14]] } } } };
  assert.ok(!pass({ type: "reactAnticipates" }, hipBobOnly), "dips before react() do not count");
});
