/**
 * Cheat fixtures for the eval harness: every known way of getting a good score without doing the work must be caught.
 *  renamed selectors (T014) - frame-driven React animation (V2-005) - copied answer key (C001) - comment-only copy text
 *  - tampered harness (lock) - self-judging - selector matcher - render windows.
 * Run: node scripts/test-evals-cheats.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { rootDir } from "./lib/projects.mjs";
import { scoreDir, renderedText, visibleHoldText, normText, GATE_CAP, UNVERIFIED_CAP, BEHAVIOR_CAP, evalBehavior } from "./eval-score.mjs";
import { writeRenderManifest, verifyRenderManifest, manifestPathFor } from "./lib/render-manifest.mjs";
import { resolveVisual } from "./lib/visual-core.mjs";
import { statementBag, bagContainment, requiredMargin, PROTECTED } from "./lib/eval-integrity.mjs";
import { checkIntegrity, writeLock, similarity, isSelfJudged, motionWindows, changedFraction, computeManifest, stripComments, projectHygiene, bestSimilarity, publicProjectSlugs, findJudge, METRICS } from "./lib/eval-integrity.mjs";
import { imageInfo, checkAnswerImages, buildPrompt, parseRubric, compareQuestions, visualScore, referenceDir, referenceInfo } from "./eval-visual.mjs";
import { matchSelector, collectJsxInventory, selectorIssue } from "./lib/jsx-selectors.mjs";

const solutionsDir = path.join(rootDir, "evals", "solutions");
const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf-8"));
const rubricOf = (id) => readJson(path.join(rootDir, "evals", "tasks", id, "rubric.json"));
const SOL = path.join(solutionsDir, "bouncing-ball");
const solCode = fs.readFileSync(path.join(SOL, "Scene.tsx"), "utf-8");

// generated next to the solutions' depth + 1 so relative imports keep working; removed afterwards
const cheatRoot = path.join(rootDir, "evals", "fixtures", `.tmp-cheats-${process.pid}`);
function cheat(name, edit) {
  const dir = path.join(cheatRoot, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Scene.tsx"), edit(solCode.replaceAll("'../../../src/", "'../../../../src/")));
  fs.copyFileSync(path.join(SOL, "spec.json"), path.join(dir, "spec.json"));
  return dir;
}
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { cwd: rootDir, shell: true, encoding: "utf-8" });
  return { status: r.status, json: JSON.parse(r.stdout.slice(r.stdout.indexOf("{"), r.stdout.lastIndexOf("}") + 1)) };
};
test.after(() => fs.rmSync(cheatRoot, { recursive: true, force: true }));

test("renamed JSX classNames (ball -> orb): T014 error, cannot score 100", async () => {
  const dir = cheat("renamed", (c) => c.replace('className="ball ', 'className="orb '));
  const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
  const f = t.json.findings.find((x) => x.code === "T014");
  assert.ok(f && f.severity === "error" && f.target === ".ball", JSON.stringify(t.json.findings));
  assert.ok(t.json.meta.renamed.selectors.includes(".ball"));
  const r = await scoreDir({ dir, rubric: rubricOf("bouncing-ball"), similarity: false, probe: "static" });
  assert.ok(r.capped && r.score <= GATE_CAP && r.breakdown.gate.errors.some((e) => e.code === "T014"), `score ${r.score}`);
});

test("frame-driven styling in React (interpolate / spring / Math.sin) is V2-005; a frame-driven counter text stays legal", () => {
  const dir = cheat("interp", (c) =>
    c
      .replace("import { AbsoluteFill } from 'remotion';", "import { AbsoluteFill, interpolate, spring, useCurrentFrame } from 'remotion';")
      .replace("  useRemotionGSAP(buildTimeline);", "  useRemotionGSAP(buildTimeline);\n  const frame = useCurrentFrame();\n  const x = interpolate(frame, [0, 100], [0, 900]);\n  const wob = Math.sin(frame / 5);")
      .replace('className="ball absolute rounded-full" style={{', 'className="ball absolute rounded-full" style={{ transform: `translateX(${x + wob}px)`,'));
  const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
  const v5 = a.json.findings.filter((x) => x.code === "V2-005");
  assert.equal(a.status, 1);
  assert.ok(v5.length >= 2 && v5.some((x) => /spring/.test(x.message)) && v5.some((x) => /prop of <div>/.test(x.message)), JSON.stringify(v5));
  const ok = run("node", ["scripts/ast-lint.mjs", "--dir", path.join("evals", "solutions", "stat-counter"), "--json"]);
  assert.equal(ok.json.findings.filter((x) => x.code === "V2-005").length, 0);
});

test("a verbatim (or identifier-renamed) copy of an answer-key solution is C001; unrelated solutions are not", async () => {
  const dir = cheat("copy", (c) => c);
  const r = await scoreDir({ dir, rubric: rubricOf("bouncing-ball"), probe: "static" });
  assert.ok(r.breakdown.gate.errors.some((e) => e.code === "C001"), JSON.stringify(r.breakdown.gate.errors));
  assert.ok(r.score <= GATE_CAP);
  assert.ok(similarity(solCode.replaceAll("ball", "orb"), solCode, "loose") >= 0.95, "renaming must not hide a copy");
  assert.equal(bestSimilarity("", null, { dir: path.join(solutionsDir, "logo-sting") }).copied, false, "an unrelated solution is not a copy");
});

test("required strings in comments or unrendered constants do not count", () => {
  const code = `// Harbor Line riders this month 48,200
  const UNUSED = 'Harbor Line'; /* riders this month */
  const SHOWN = 'Real copy';
  export const S = () => <div>{SHOWN}{/* 48,200 */}</div>;`;
  const t = normText(renderedText(code));
  assert.ok(t.includes("real copy"));
  assert.ok(!t.includes("harbor line") && !t.includes("riders this month") && !t.includes("48200"));
  const counter = normText(renderedText(fs.readFileSync(path.join(solutionsDir, "stat-counter", "Scene.tsx"), "utf-8")));
  assert.ok(counter.includes("48200") && counter.includes("harbor line"), "const-referenced copy and computed numbers still count");
});

test("a changed protected file => TAMPERED, score 0 (simulated with a temp lock)", async () => {
  const lock = path.join(os.tmpdir(), `harness-lock-${process.pid}.json`);
  writeLock(rootDir, lock);
  assert.equal(checkIntegrity({ lockFile: lock, useGit: false }).status, "ok");
  const j = readJson(lock);
  const victim = "evals/tasks/bouncing-ball/rubric.json";
  assert.ok(j.files[victim]);
  j.files[victim] = "0".repeat(64);
  j.files["scripts/never-existed.mjs"] = "1".repeat(64);
  fs.writeFileSync(lock, JSON.stringify(j));
  const bad = checkIntegrity({ lockFile: lock, useGit: false });
  fs.rmSync(lock, { force: true });
  assert.equal(bad.status, "tampered");
  assert.ok(bad.changed.some((c) => c.file === victim && c.kind === "modified") && bad.changed.some((c) => c.kind === "removed"));
  const r = await scoreDir({ dir: SOL, rubric: rubricOf("bouncing-ball"), integrity: bad, probe: "static" });
  assert.equal(r.score, 0);
  assert.equal(r.tampered, true);
});

test("judge separation: the model that built the project cannot judge it", () => {
  assert.equal(isSelfJudged("eval-bouncing-ball-haiku", "bouncing-ball", "haiku"), true);
  assert.equal(isSelfJudged("eval-bouncing-ball-haiku", "bouncing-ball", "claude-haiku-4.5"), true);
  assert.equal(isSelfJudged("eval-bouncing-ball-haiku", "bouncing-ball", "gemini-2.5-pro"), false);
});

test("selector matching: classes, ids, compounds, lists, template patterns, dynamic names", () => {
  const dir = path.join(cheatRoot, "sel");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "Scene.tsx"), 'const C = "k"; export const S = () => (<div id="root" className="a b"><i className={`row-${n} x`} /><p className={C} /></div>);');
  const inv = collectJsxInventory(dir);
  const m = (s) => matchSelector(s, inv);
  for (const s of [".a", "#root", ".a.b", ".a .x", ".zzz, .b", ".row-3", ".k"]) assert.equal(m(s), "match", s);
  assert.equal(m(".nope"), "none");
  fs.writeFileSync(path.join(dir, "Scene.tsx"), "export const S = () => (<div className={dyn} />);");
  assert.equal(matchSelector(".nope", collectJsxInventory(dir)), "maybe", "dynamic className: warning, never a silent pass");
});

test("render windows and pixel diff", () => {
  const meta = { totalFrames: 300, motion: { ".ball": { x: { runs: [[10, 100, 500], [120, 125, 500]] } }, ".tiny": { x: { runs: [[10, 100, 5]] } } } };
  const w = motionWindows(meta, [{ id: "a", startFrame: 0, endFrame: 150 }]);
  assert.equal(w.length, 1);
  assert.deepEqual([w[0].target, w[0].from, w[0].to], [".ball", 11, 99]);
  const a = Buffer.alloc(4000, 0), b = Buffer.from(a);
  assert.equal(changedFraction(a, b), 0);
  for (let i = 0; i < 100; i++) b[i * 4] = 255;
  assert.ok(changedFraction(a, b) > 0.05);
});


/* ===================================================================================================================
 * Red-team round 2: one fixture per hole (probe integration, static fallbacks, environment sniffing, comment-stripped code, C001 hardening,
 * audit.allow, visual image binding + judges, integrity, type errors)
 * ================================================================================================================ */

const auditsOf = (dir) => {
  const rd = path.relative(rootDir, dir);
  const a = run("node", ["scripts/validate-spec.mjs", "--dir", rd, "--json"]);
  const b = run("node", ["scripts/ast-lint.mjs", "--dir", rd, "--json"]);
  const c = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", rd, "--json"]);
  return { spec: { ok: true, json: a.json }, ast: { ok: true, json: b.json }, timeline: { ok: true, json: c.json } };
};
const G = { samples: 30, visible: 30, claimed: 30, visibleClaimed: 30 };
const probeOk = (extra = {}) => ({ ok: true, json: { ok: true, errors: 0, warnings: 0, findings: [], meta: { renderable: true, targets: Object.fromEntries([".ball", ".block", ".courier-root"].map((k) => [k, { beatVis: { setup: G, drop: G, rest: G, ready: G, jump: G, land: G, walk: G, notice: G, react: G } }])), ...extra } } });
const pf = (code, severity, message = `${code} demo`) => ({ code, severity, frame: 10, target: ".ball", message });
const probeWith = (findings, extra = {}) => ({ ok: true, json: { ok: !findings.some((f) => f.severity === "error"), findings, meta: { renderable: true, ...extra } } });

test("hole 1: probe results are integrated (P001/P002/P003/P006 gate errors, P004/P007 craft warnings, --no-probe caps at 70)", async () => {
  const rubric = rubricOf("bouncing-ball"), audits = auditsOf(SOL);
  const base = await scoreDir({ dir: SOL, rubric, audits, probe: probeOk(), similarity: false });
  assert.ok(base.score >= 95 && !base.unverified && base.probe.mode === "injected" && base.probe.used, `base ${base.score}`);
  for (const code of ["P001", "P002", "P003", "P006"]) {
    const r = await scoreDir({ dir: SOL, rubric, audits, probe: probeWith([pf(code, "error")]), similarity: false });
    assert.ok(r.capped && r.score <= GATE_CAP && r.breakdown.gate.errors.some((e) => e.code === code), `${code}: ${r.score}`);
  }
  const warned = await scoreDir({ dir: SOL, rubric, audits, probe: probeWith([pf("P004", "warning"), pf("P007", "warning"), pf("P005", "info")]), similarity: false });
  assert.equal(Math.round((base.breakdown.craft.score - warned.breakdown.craft.score) * 10) / 10, 6, "P004 + P007 cost craft points, P005 (info) nothing");
  assert.equal(warned.breakdown.gate.errors.length, 0);
  const skipped = await scoreDir({ dir: SOL, rubric, audits, probe: false, similarity: false });
  assert.ok(skipped.unverified && skipped.score <= UNVERIFIED_CAP && skipped.uncappedScore >= 95, `--no-probe: ${skipped.score}`);
  const crashed = await scoreDir({ dir: SOL, rubric, audits, probe: { ok: false, error: "no chrome" }, similarity: false });
  assert.ok(crashed.unverified && crashed.score <= UNVERIFIED_CAP, "a probe that cannot run leaves the score unverified, never 100");
});

test("hole 1: the closing-hold check uses the probe's real final-hold text instead of source heuristics", async () => {
  const dir = path.join(solutionsDir, "stat-counter"), rubric = rubricOf("stat-counter"), audits = auditsOf(dir);
  const counting = { [`text=${encodeURIComponent("48,200")}`]: Array.from({ length: 30 }, (_, i) => [i * 10, i === 29 ? "48,200" : String(i * 1600), true]) };
  const good = await scoreDir({ dir, rubric, audits, similarity: false, probe: probeOk({ finalHold: { strings: ["48,200", "riders this month", "Harbor Line"] }, textSeries: counting }) });
  assert.ok(good.score >= 95, `good ${good.score}`);
  // the source says the CTA is there, the browser says it is not on screen in the hold
  const bad = await scoreDir({ dir, rubric, audits, similarity: false, probe: probeOk({ finalHold: { strings: ["48,200"] }, textSeries: counting }) });
  assert.ok(bad.behaviorCapped && bad.behaviorFails.length > 0 && bad.score <= 80, `bad ${bad.score}`);
});

test("hole 2: static fallback ignores attribute-only text, dead branches and inline-hidden elements", () => {
  const vis = (code, state = {}, o = {}) => normText(visibleHoldText(code, state, o));
  const rt = (code, tweened) => normText(renderedText(code, { tweened }));
  const wrap = (inner) => `const H = 'Secret offer'; export const S = () => (<A>${inner}</A>);`;
  const attrOnly = wrap(`<div title="Buy now" aria-label="Buy now" data-copy="Buy now"><img alt="Buy now" /><span>Hi</span></div><Card label="Visible prop" />`);
  for (const f of [(c) => vis(c), (c) => rt(c)]) {
    const t = f(attrOnly);
    assert.ok(!t.includes("buy now") && t.includes("hi") && t.includes("visible prop"), t);
  }
  const dead = [`{false && <p>{H}</p>}`, `{null && <p>{H}</p>}`, `{0 && <p>Secret offer</p>}`, `{false ? <p>Secret offer</p> : <i>x</i>}`, `{true ? <i>x</i> : <p>Secret offer</p>}`, `{undefined && <p>Secret offer</p>}`];
  for (const d of dead) for (const f of [(c) => vis(c), (c) => rt(c)]) assert.ok(!f(wrap(d)).includes("secret offer"), d);
  const constDead = `const SHOW = false; const H = 'Secret offer'; export const S = () => (<A>{SHOW && <p>{H}</p>}</A>);`;
  assert.ok(!vis(constDead).includes("secret offer") && !rt(constDead).includes("secret offer"));
  assert.ok(vis(wrap(`{true && <p>{H}</p>}`)).includes("secret offer"), "a live branch still counts");
  for (const style of ["display: 'none'", "visibility: 'hidden'", "opacity: 0"]) {
    const code = wrap(`<p className="late" style={{ ${style} }}>{H}</p>`);
    assert.ok(!vis(code).includes("secret offer") && !rt(code).includes("secret offer"), style);
    assert.ok(vis(code, { ".late": style.startsWith("display") ? { display: "block" } : style.startsWith("vis") ? { visibility: "visible" } : { opacity: 1 } }).includes("secret offer"), `${style}: a later tween that reveals it counts`);
    assert.ok(rt(code, [".late"]).includes("secret offer"), `${style}: tweened selector counts for the copy check`);
  }
  assert.ok(!vis(wrap(`<p className="x hidden">{H}</p>`)).includes("secret offer"), "tailwind hidden");
  // tweens before / during the hold that hide the element
  const shown = wrap(`<p className="msg">{H}</p>`);
  assert.ok(vis(shown, { ".msg": { opacity: 1 } }).includes("secret offer"));
  for (const st of [{ display: "none" }, { visibility: "hidden" }, { autoAlpha: 0 }, { x: -2400 }, { x: 2000 }, { y: 1500 }, { scale: 0 }])
    assert.ok(!vis(shown, { ".msg": st }).includes("secret offer"), JSON.stringify(st));
  assert.ok(!vis(shown, { ".msg": { opacity: 1 } }, { holdEndState: { ".msg": { opacity: 0 } } }).includes("secret offer"), "hidden at the end of the hold");
});

test("hole 2: T014 unreachable JSX does not count, :not()/[attr]/pseudo selectors are rejected", () => {
  const dir = path.join(cheatRoot, "sel2");
  fs.mkdirSync(dir, { recursive: true });
  const m = (code, sel) => { fs.writeFileSync(path.join(dir, "Scene.tsx"), code); return matchSelector(sel, collectJsxInventory(dir)); };
  assert.equal(m('export const S = () => (<div>{false && <i className="ghost" />}</div>);', ".ghost"), "none");
  assert.equal(m('export const S = () => (<div>{null && <i className="ghost" />}</div>);', ".ghost"), "none");
  assert.equal(m('const SHOW = false; export const S = () => (<div>{SHOW ? <i className="ghost" /> : <b className="real" />}</div>);', ".ghost"), "none");
  assert.equal(m('const SHOW = false; export const S = () => (<div>{SHOW ? <i className="ghost" /> : <b className="real" />}</div>);', ".real"), "match");
  assert.equal(m('export const S = ({ on }) => (<div>{on && <i className="live" />}</div>);', ".live"), "match", "a runtime condition is not provably dead");
  for (const bad of [".a:not(.b)", ".a[data-x]", ".a:hover", ".a::before", ".a:first-child"]) assert.ok(selectorIssue(bad), bad);
  for (const ok of [".a", "#b", ".a .b", ".a > .b", ".a, .b", "div"]) assert.equal(selectorIssue(ok), null, ok);
});

test("hole 2: a ball inside {false && ...} or a :not() selector is a T014 error end to end", () => {
  const dead = cheat("dead-branch", (c) => c.replace(/<div className="ball absolute rounded-full"([\s\S]*?)\/>/, (m) => `{false && ${m}}`));
  const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, dead), "--json"]);
  assert.ok(t.json.findings.some((f) => f.code === "T014" && f.severity === "error" && f.target === ".ball"), JSON.stringify(t.json.findings.filter((f) => f.code === "T014")));
  const pseudo = cheat("pseudo-sel", (c) => c.replaceAll("'.ball'", "'.ball:not(.zzz)'"));
  const t2 = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, pseudo), "--json"]);
  assert.ok(t2.json.findings.some((f) => f.code === "T014" && f.severity === "error" && /plain class\/id selector/.test(f.message)), JSON.stringify(t2.json.findings.filter((f) => f.code === "T014")));
});

test("hole 3: V2-006 environment sniffing (typeof window, document, globalThis, process, navigator, import.meta.env)", () => {
  const snippets = {
    "typeof-window": "const A = typeof window !== 'undefined';",
    "typeof-document": "const A = typeof document === 'undefined';",
    window: "const A = window.innerWidth;",
    document: "const A = document.title;",
    globalThis: "const A = globalThis.foo;",
    process: "const A = process.env.NODE_ENV;",
    navigator: "const A = navigator.userAgent;",
    "import-meta-env": "const A = import.meta.env.MODE;",
  };
  for (const [name, line] of Object.entries(snippets)) {
    const dir = cheat(`env-${name}`, (c) => `${c}\n${line}\nexport const ENV_FLAG = A;\n`);
    const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
    assert.ok(a.json.findings.some((f) => f.code === "V2-006"), `${name}: ${JSON.stringify(a.json.findings)}`);
  }
  const ok = cheat("env-ok", (c) => `${c}\nconst o = { window: 1, document: 2 }; export const k = o.window + o.document;\n`);
  const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, ok), "--json"]);
  assert.equal(a.json.findings.filter((f) => f.code === "V2-006").length, 0, "property names are not references");
});

test("hole 3: every public example/study project and reference solution is clean for ast-lint (V2-006/V2-007 included)", () => {
  for (const slug of publicProjectSlugs()) {
    const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.join("src", "projects", slug), "--json"]);
    assert.equal(a.status, 0, `${slug}: ${JSON.stringify(a.json.findings)}`);
  }
});

test("hole 4: requiredCode regexes run on comment-stripped code", async () => {
  const rubric = { ...rubricOf("bouncing-ball"), requiredCode: [{ label: "uses zzMagic()", anyOf: ["zzMagic\\s*\\("] }] };
  const inComment = cheat("code-comment", (c) => `// zzMagic(1)\n/* zzMagic( */\n${c}`);
  const real = cheat("code-real", (c) => `${c}\nexport const zzMagic = (x: number) => x;\nexport const used = zzMagic(1);\n`);
  const a = await scoreDir({ dir: inComment, rubric, audits: auditsOf(inComment), probe: "static", similarity: false });
  const b = await scoreDir({ dir: real, rubric, audits: auditsOf(real), probe: "static", similarity: false });
  assert.equal(a.breakdown.rubric.checks.find((x) => x.id === "code-1").pass, false);
  assert.equal(b.breakdown.rubric.checks.find((x) => x.id === "code-1").pass, true);
  assert.ok(!/zzMagic/.test(stripComments("// zzMagic(\nconst a = 1; /* zzMagic( */")));
});

test("hole 5: C001 sees a wrapper around a copied solution (all project files), renamed identifiers/strings, and counts only PINNED public projects", () => {
  // (a) wrapper: Scene.tsx is tiny, the copy sits in sol.tsx with every declared name and string renamed
  const wrap = path.join(cheatRoot, "wrapper");
  fs.mkdirSync(wrap, { recursive: true });
  const renamed = solCode.replaceAll("'../../../src/", "'../../../../src/").replaceAll("ball", "orb").replaceAll("BOUNCE", "BNC").replaceAll("GROUND_Y", "GY").replaceAll("CAPTION", "CAP").replaceAll("BALL", "ORB").replaceAll("'Heavy at first. Lighter with every bounce.'", "'Other words'");
  fs.writeFileSync(path.join(wrap, "sol.tsx"), renamed);
  fs.writeFileSync(path.join(wrap, "Scene.tsx"), "export { Scene, buildTimeline } from './sol';\n");
  fs.copyFileSync(path.join(SOL, "spec.json"), path.join(wrap, "spec.json"));
  const sw = bestSimilarity("", null, { dir: wrap });
  assert.ok(sw.copied && sw.id === "bouncing-ball", JSON.stringify(sw));
  // (b) renamed identifiers + strings + numbers padded with junk code still match
  const padded = path.join(cheatRoot, "padded");
  fs.mkdirSync(padded, { recursive: true });
  fs.writeFileSync(path.join(padded, "Scene.tsx"), `${renamed.replace(/\b300\b/g, "301")}\n${Array.from({ length: 40 }, (_, i) => `export const junk${i} = ${i} + ${i * 2};`).join("\n")}\n`);
  assert.ok(bestSimilarity("", null, { dir: padded }).copied, "padding does not hide a copy");
  // (c) a folder merely NAMED example-* is not public: only the list pinned in the lock is the baseline
  const fakePub = path.join(cheatRoot, "example-lookalike");
  fs.mkdirSync(fakePub, { recursive: true });
  fs.writeFileSync(path.join(fakePub, "Scene.tsx"), renamed);
  const real = bestSimilarity("", null, { dir: wrap });
  const withFake = bestSimilarity("", null, { dir: wrap, publicProjects: [{ id: "example-lookalike", dir: fakePub, file: path.join(fakePub, "Scene.tsx") }] });
  assert.ok(real.copied && !withFake.copied, "if an unknown example-* folder counted as public the copy would pass: it must not");
  const lock = path.join(os.tmpdir(), `pub-lock-${process.pid}.json`);
  fs.writeFileSync(lock, JSON.stringify({ publicProjects: ["example-logo-sting"] }));
  assert.deepEqual(publicProjectSlugs(lock), ["example-logo-sting"]);
  fs.rmSync(lock, { force: true });
  // (d) honest adaptations of every public project (new copy, shifted numbers, changed strings) must NOT be flagged
  for (const slug of publicProjectSlugs()) {
    const code = fs.readFileSync(path.join(rootDir, "src", "projects", slug, "Scene.tsx"), "utf-8");
    const dir = path.join(cheatRoot, `adapt-${slug}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "Scene.tsx"), code.replace(/\b(\d{2,4})\b/g, (n) => String(Number(n) + 7)).replace(/(['"`])([A-Z][a-z]+(?: [A-Za-z,.']+){1,8})\1/g, "'New words for my brief'"));
    const r = bestSimilarity("", null, { dir });
    assert.equal(r.copied, false, `${slug}: ${JSON.stringify(r.metrics)}`);
  }
  assert.ok(METRICS.bag && METRICS.strict.relMargin > 0);
});

test("hole 5: hygiene counts ALL project files; project files may not import or re-export from evals/ (V2-007)", async () => {
  const dir = cheat("hygiene", (c) => c);
  fs.writeFileSync(path.join(dir, "Extra.tsx"), [
    "import { type FC } from 'react';",
    ...["A", "B", "C", "D"].map((n) => `export const Comp${n}: FC = () => <div className="x${n}">{'${n}'}</div>;`),
    "export const raw = (tl: gsap.core.Timeline) => { tl.to('.ball', { x: 5 }); tl.to('.ball', { x: 9 }); tl.to('.ball', { x: 3 }); };",
  ].join("\n"));
  const h = projectHygiene(dir);
  assert.ok(h.components >= 4 && h.rawTweens >= 3 && h.lines > 4, JSON.stringify(h));
  const r = await scoreDir({ dir, rubric: rubricOf("bouncing-ball"), audits: auditsOf(dir), probe: "static", similarity: false });
  const items = Object.fromEntries(r.breakdown.hygiene.items.map((i) => [i.id, i]));
  assert.ok(items.components.score < items.components.max && items["raw-tweens"].score < items["raw-tweens"].max, JSON.stringify(items));
  const imp = cheat("evals-import", (c) => c);
  fs.writeFileSync(path.join(imp, "helper.ts"), "export * from '../../../solutions/bouncing-ball/Scene';\n");
  fs.writeFileSync(path.join(imp, "helper2.ts"), "import { buildTimeline } from '../../../solutions/bouncing-ball/Scene';\nexport const b = buildTimeline;\n");
  const a = run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, imp), "--json"]);
  assert.ok(a.json.findings.filter((f) => f.code === "V2-007").length >= 2, JSON.stringify(a.json.findings));
  const bad = path.join(cheatRoot, "helper-import");
  fs.mkdirSync(bad, { recursive: true });
  fs.copyFileSync(path.join(imp, "Scene.tsx"), path.join(bad, "Scene.tsx"));
  fs.copyFileSync(path.join(imp, "spec.json"), path.join(bad, "spec.json"));
  fs.writeFileSync(path.join(bad, "util.ts"), "import fs from 'node:fs';\nexport const x = fs;\n");
  const a2 = run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, bad), "--json"]);
  assert.ok(a2.json.findings.some((f) => f.code === "V2-002" && /util\.ts/.test(f.target)), "the import allowlist also covers helper files");
});

test("hole 6: audit.allow suppresses warnings only; an error code is never suppressible", () => {
  const dir = path.join(cheatRoot, "allow-error");
  fs.mkdirSync(dir, { recursive: true });
  const src = path.join(rootDir, "scripts", "fixtures", "timeline-audit", "bad-craft");
  fs.copyFileSync(path.join(src, "Scene.tsx"), path.join(dir, "Scene.tsx"));
  const spec = readJson(path.join(src, "spec.json"));
  spec.audit = { allow: [{ code: "T009", reason: "intentional demo of a very fast move" }, { code: "T012", reason: "intentional demo of a linear move" }] };
  fs.writeFileSync(path.join(dir, "spec.json"), JSON.stringify(spec));
  const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
  const t009 = t.json.findings.filter((f) => f.code === "T009" && f.severity === "error");
  assert.ok(t009.length > 0 && t009.every((f) => /allow ignored for error code T009/.test(f.message)), JSON.stringify(t.json.findings.filter((f) => f.code === "T009")));
  assert.ok(!t.json.allowed.some((f) => f.code === "T009"), "an error must not land in allowed[]");
  assert.ok(t.json.allowed.some((f) => f.code === "T012") && !t.json.findings.some((f) => f.code === "T012"), "a warning is still suppressible");
  assert.equal(t.json.ok, false);
});

test("hole 7: visual answers are bound to the image hash; judges come from evals/judges.json; self-judging uses spec evalModel", () => {
  const slug = `.tmp-visual-${process.pid}`, out = path.join(rootDir, "out", slug);
  fs.mkdirSync(path.join(out, "poses"), { recursive: true });
  try {
    fs.rmSync(path.join(out, "poses"), { recursive: true, force: true });
    assert.equal(imageInfo(slug).grid.exists, false);
    assert.match(checkAnswerImages(slug, { imageHash: "x", answers: {} }).problems[0], /does not exist/);
    fs.writeFileSync(path.join(out, "visual-audit-grid.png"), Buffer.from("not really a png but hashable"));
    const h = imageInfo(slug).grid.hash;
    assert.match(h, /^[0-9a-f]{64}$/);
    const pdir = path.join(out, "proj");
    fs.mkdirSync(pdir, { recursive: true });
    fs.writeFileSync(path.join(pdir, "Scene.tsx"), "export const a = 1;\n");
    const sheet = () => writeRenderManifest({ manifestFile: manifestPathFor(slug), slug, projectDir: pdir, kind: "contactSheet", imageFile: path.join(out, "visual-audit-grid.png"), tool: "test" });
    sheet();
    const chk = (raw) => checkAnswerImages(slug, raw, { projectDir: pdir });
    assert.equal(chk({ imageHash: h, answers: {} }).ok, true);
    assert.equal(chk({ imageHash: h.toUpperCase(), answers: {} }).ok, true);
    assert.match(chk({ answers: {} }).problems[0], /no "imageHash"/);
    assert.match(chk({ imageHash: "0".repeat(64), answers: {} }).problems[0], /does not match/);
    assert.equal(chk({ answers: { a: true } }).ok, false, "a flat answers file without the hash is refused");
    fs.mkdirSync(path.join(out, "poses"), { recursive: true });
    fs.writeFileSync(path.join(out, "poses", "poses-grid.png"), Buffer.from("poses"));
    const ph = imageInfo(slug).poses.hash;
    writeRenderManifest({ manifestFile: manifestPathFor(slug), slug, projectDir: pdir, kind: "poses", imageFile: path.join(out, "poses", "poses-grid.png"), tool: "test" });
    assert.match(chk({ imageHash: h, answers: {} }).problems.join(" "), /posesHash/);
    assert.equal(chk({ imageHash: h, posesHash: ph, answers: {} }).ok, true);
    // the printed prompt carries both hashes
    const rubric = parseRubric(fs.readFileSync(path.join(rootDir, "evals", "VISUAL_RUBRIC.md"), "utf-8"));
    const prompt = buildPrompt({ taskId: "bouncing-ball", slug, rubric });
    assert.ok(prompt.includes(h) && prompt.includes(ph) && /imageHash/.test(prompt), "prompt embeds the SHA-256 of the images");
    // editing the picture after the answers were written invalidates them
    fs.writeFileSync(path.join(out, "visual-audit-grid.png"), Buffer.from("changed picture"));
    assert.equal(chk({ imageHash: h, posesHash: ph, answers: {} }).ok, false);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
  }
  for (const id of ["claude-opus", "gemini-pro", "human"]) assert.ok(findJudge(id), id);
  assert.equal(findJudge("Gemini-2.5-Pro")?.id, "gemini-pro", "aliases resolve");
  assert.equal(findJudge("made-up-judge"), null);
  assert.equal(isSelfJudged("eval-bouncing-ball-x1", "bouncing-ball", "claude-opus", "claude-opus-4"), true, "evalModel in the spec decides, not the slug");
  assert.equal(isSelfJudged("eval-bouncing-ball-x1", "bouncing-ball", "gemini-pro", "claude-opus-4"), false);
  assert.equal(isSelfJudged("eval-bouncing-ball-x1", "bouncing-ball", "human", "claude-opus-4"), false);
});

test("hole 8: protected set covers package.json, tsconfig, src/remotion, .githooks and the pinned public projects; the lock must equal git HEAD", () => {
  const files = Object.keys(computeManifest());
  for (const f of ["package.json", "tsconfig.json", "src/remotion/Root.tsx", ".githooks/pre-commit", "src/projects/example-logo-sting/Scene.tsx", "src/projects/study-bouncing-ball/spec.json", "evals/judges.json", "evals/tasks/bouncing-ball/rubric.json"])
    assert.ok(files.includes(f), `${f} must be protected`);
  assert.ok(!files.includes("evals/harness.lock.json"), "the lock cannot hash itself; git HEAD protects it");
  // a throw-away git repo: committed lock, then edit the harness and re-pin the lock => TAMPERED unless --dev
  const git = (args, cwd) => spawnSync("git", args, { cwd, encoding: "utf-8" });
  const repo = path.join(os.tmpdir(), `lock-repo-${process.pid}`);
  fs.rmSync(repo, { recursive: true, force: true });
  fs.mkdirSync(path.join(repo, "scripts"), { recursive: true });
  fs.mkdirSync(path.join(repo, "evals"), { recursive: true });
  try {
    if (git(["init", "-q"], repo).status !== 0) return; // no git on this machine: nothing to simulate
    fs.writeFileSync(path.join(repo, "scripts", "a.mjs"), "export const a = 1;\n");
    fs.writeFileSync(path.join(repo, "package.json"), "{}\n");
    const lockFile = path.join(repo, "evals", "harness.lock.json");
    writeLock(repo, lockFile);
    git(["add", "-A"], repo);
    git(["-c", "user.email=t@t", "-c", "user.name=t", "commit", "-qm", "init"], repo);
    assert.equal(checkIntegrity({ root: repo, lockFile }).status, "ok");
    fs.writeFileSync(path.join(repo, "scripts", "a.mjs"), "export const a = 2; // cheat\n");
    assert.equal(checkIntegrity({ root: repo, lockFile }).status, "tampered", "edited file vs lock");
    writeLock(repo, lockFile); // the cheat: re-pin the lock to the edited harness
    const cheated = checkIntegrity({ root: repo, lockFile });
    assert.equal(cheated.status, "tampered", "a re-pinned lock differs from the committed one");
    assert.ok(cheated.changed.some((c) => c.file === "evals/harness.lock.json" && /git HEAD/.test(c.kind)), JSON.stringify(cheated.changed));
    assert.equal(checkIntegrity({ root: repo, lockFile, dev: true }).status, "ok", "--dev skips the HEAD comparison");
  } finally {
    fs.rmSync(repo, { recursive: true, force: true });
  }
});

test("hole 9: without the probe a TypeScript error in the project is gate error G003", async () => {
  const rubric = rubricOf("bouncing-ball");
  const bad = cheat("type-error", (c) => `${c}\nexport const wrong: number = 'not a number';\n`);
  const r = await scoreDir({ dir: bad, rubric, probe: "static", typecheck: true, similarity: false });
  assert.ok(r.capped && r.breakdown.gate.errors.some((e) => e.code === "G003" && /TS2322/.test(e.message)), JSON.stringify(r.breakdown.gate.errors));
  const good = await scoreDir({ dir: SOL, rubric, probe: "static", typecheck: true, similarity: false });
  assert.ok(!good.breakdown.gate.errors.some((e) => e.code === "G003"), JSON.stringify(good.breakdown.gate.errors));
});

/* ===================================================================================================================
 * Curated primitives (V2-002), the project components/ folder (V2-008..012), selector resolution through components, comparative visual eval.
 * ================================================================================================================ */

const lintDir = (dir) => run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
const codesOf = (a) => a.json.findings.map((f) => f.code);
const writeComp = (dir, name, code) => { fs.mkdirSync(path.join(dir, "components"), { recursive: true }); fs.writeFileSync(path.join(dir, "components", name), code); };
const GOOD_COMP = `import { type FC } from 'react';
export const Chip: FC<{ label: string; color: string; className?: string }> = ({ label, color, className }) => (
  <span className={\`chip-label inline-block px-4 text-[20px] \${className ?? ''}\`} style={{ color, fontSize: 20, boxShadow: '0 0 0 1px rgba(0,0,0,0.1)', background: 'transparent' }}>{label}</span>
);
`;

test("V2-002: only curated primitives; a @deprecated primitive gets a pointer to docs/COMPONENT_GALLERY.md", () => {
  const dir = cheat("curated", (c) => c.replace("import { getTheme }", "import { BroadcastPackageStrap } from '../../../../src/primitives';\nimport { AppShell } from '../../../../src/primitives/shells/AppShell';\nimport { getTheme }"));
  const a = lintDir(dir);
  const v = a.json.findings.filter((f) => f.code === "V2-002");
  assert.equal(a.status, 1);
  assert.ok(v.some((f) => /BroadcastPackageStrap is @deprecated/.test(f.message) && /docs\/COMPONENT_GALLERY\.md/.test(f.message)), JSON.stringify(v));
  assert.ok(v.some((f) => /shells\/AppShell" is not a curated primitive entry point/.test(f.message)), JSON.stringify(v));
  const index = cheat("curated-index", (c) => c.replace("import { getTheme }", "import { CameraRig } from '../../../../src/primitives';\nimport { getTheme }"));
  assert.ok(codesOf(lintDir(index)).includes("V2-002"), "even a non-deprecated primitive must come through curated, not the legacy index");
  const rig = cheat("curated-rig", (c) => c.replace("import { getTheme }", "import { RigCharacter } from '../../../../src/primitives/characters/RigCharacter';\nimport { getTheme }"));
  assert.ok(!codesOf(lintDir(rig)).includes("V2-002"), "RigCharacter is the one allowed non-curated entry point");
  for (const id of fs.readdirSync(solutionsDir)) assert.equal(lintDir(path.join(solutionsDir, id)).status, 0, `solution ${id} must lint clean`);
});

test("V2-008..012: the components/ folder is presentational only (no motion, no raw colors, no micro text, className forwarded); A004/V2-006 still apply", () => {
  const dir = cheat("comp-bad", (c) => c);
  writeComp(dir, "Bad.tsx", `import { gsap } from 'gsap';
import { useCurrentFrame, interpolate } from 'remotion';
export const ROWS = [1, 2];
export const Card = () => <><div className="text-sm text-[12px] bg-blue-500" style={{ fontSize: 14, color: '#fff', background: 'red' }}>x</div></>;
export const Chip = ({ label }: { label: string }) => <span className="chip" style={{ color: 'rgba(12,12,12,0.4)' }}>{label}{Math.random()}{typeof window}</span>;
`);
  const a = lintDir(dir);
  const by = (code) => a.json.findings.filter((f) => f.code === code).map((f) => f.message);
  assert.equal(a.status, 1);
  assert.ok(by("V2-008").some((m) => /"ROWS" is not a component/.test(m)), JSON.stringify(by("V2-008")));
  assert.ok(by("V2-009").some((m) => /gsap/.test(m)) && by("V2-009").some((m) => /useCurrentFrame/.test(m)) && by("V2-009").some((m) => /interpolate/.test(m)), JSON.stringify(by("V2-009")));
  assert.ok(by("V2-010").length >= 3 && by("V2-010").some((m) => /text-sm/.test(m)) && by("V2-010").some((m) => /text-\[12px\]/.test(m)) && by("V2-010").some((m) => /14px/.test(m)), JSON.stringify(by("V2-010")));
  assert.ok(by("V2-011").some((m) => /#fff/.test(m)) && by("V2-011").some((m) => /"red"/.test(m)) && by("V2-011").some((m) => /bg-blue-500/.test(m)) && by("V2-011").some((m) => /rgba\(12,12,12/.test(m)), JSON.stringify(by("V2-011")));
  assert.ok(by("V2-012").some((m) => /fragment root/.test(m)) && by("V2-012").some((m) => /does not forward className/.test(m)), JSON.stringify(by("V2-012")));
  assert.ok(codesOf(a).includes("A004") && codesOf(a).includes("V2-006"), "timers/random and environment sniffing are caught inside components/ too");
  // a clean component (theme color via prop, black/white hairline rgba, transparent, 20px text, className forwarded) passes
  const ok = cheat("comp-ok", (c) => c);
  writeComp(ok, "Chip.tsx", GOOD_COMP);
  assert.equal(lintDir(ok).status, 0, JSON.stringify(lintDir(ok).json.findings));
});

test("V2-008: components/ allows at most 6 files, each at most 120 lines, flat, .tsx only, no import of Scene.tsx", () => {
  const dir = cheat("comp-limits", (c) => c);
  for (let i = 1; i <= 7; i++) writeComp(dir, `C${i}.tsx`, GOOD_COMP.replaceAll("Chip", `Chip${i}`));
  writeComp(dir, "Long.tsx", `${GOOD_COMP.replaceAll("Chip", "Long")}${"// filler\n".repeat(125)}`);
  writeComp(dir, "Loop.tsx", `import { buildTimeline } from '../Scene';\n${GOOD_COMP.replaceAll("Chip", "Loop")}`);
  fs.writeFileSync(path.join(dir, "components", "helpers.ts"), "export const x = 1;\n");
  fs.mkdirSync(path.join(dir, "components", "nested"), { recursive: true });
  const msgs = lintDir(dir).json.findings.filter((f) => f.code === "V2-008").map((f) => f.message);
  assert.ok(msgs.some((m) => /files in components\/ \(max 6\)/.test(m)), msgs.join("\n"));
  assert.ok(msgs.some((m) => /Long\.tsx is \d+ lines \(max 120\)/.test(m)), msgs.join("\n"));
  assert.ok(msgs.some((m) => /must not import Scene\.tsx/.test(m)) && msgs.some((m) => /helpers\.ts: only \.tsx/.test(m)) && msgs.some((m) => /nested\/ is a subfolder/.test(m)), msgs.join("\n"));
});

test("selectors resolve through project components: static classNames inside them, className passed in from Scene; typos are still errors", () => {
  const ballInScene = 'className="ball absolute rounded-full" style={{ left: 340, top: GROUND_Y - BALL, width: BALL, height: BALL, backgroundColor: colors.accentPrimary }}';
  assert.ok(solCode.includes(ballInScene), "fixture drifted: update the ball markup in this test");
  const BALL_COMP = "import { type CSSProperties, type FC } from 'react';\nexport const Ball: FC<{ className?: string; style?: CSSProperties; tone: string }> = ({ className, style, tone }) => (\n  <div className={`ball rounded-full ${className ?? ''}`} style={{ ...style, backgroundColor: tone }} />\n);\n";
  const USAGE = "<Ball className=\"absolute\" tone={colors.accentPrimary} style={{ left: 340, top: GROUND_Y - BALL, width: BALL, height: BALL }} />";
  const withBall = (name, comp, usage) => {
    const dir = cheat(name, (c) => c.replace("import { getTheme }", "import { Ball } from './components/Ball';\nimport { getTheme }").replace(`<div ${ballInScene} />`, usage));
    writeComp(dir, "Ball.tsx", comp);
    return dir;
  };
  // the ".ball" selector is only rendered inside the component: T014 + storyboard focal must find it
  const ok = withBall("comp-sel", BALL_COMP, USAGE);
  const inv = collectJsxInventory(ok);
  assert.equal(matchSelector(".ball", inv), "match", "static className inside a component");
  assert.equal(matchSelector(".absolute", inv), "match", "className passed from Scene through the component");
  assert.equal(matchSelector(".typo", inv), "none", "a forwarded className prop must not turn every selector into 'maybe'");
  const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, ok), "--json"]);
  assert.ok(!t.json.findings.some((f) => f.code === "T014"), JSON.stringify(t.json.findings.filter((f) => f.code === "T014")));
  assert.equal(lintDir(ok).status, 0, JSON.stringify(lintDir(ok).json.findings));
  // the same component without the static "ball" class and without anyone passing it: the rename cheat through a component is still T014
  const renamed = withBall("comp-sel-renamed", BALL_COMP.replace("`ball rounded-full", "`orb rounded-full"), USAGE);
  const t2 = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, renamed), "--json"]);
  assert.ok(t2.json.findings.some((f) => f.code === "T014" && f.severity === "error" && f.target === ".ball"), JSON.stringify(t2.json.findings));
  // className handed in from Scene is a valid source for the selector too
  const viaProp = withBall("comp-sel-prop", BALL_COMP.replace("`ball rounded-full", "`rounded-full"), USAGE.replace('className="absolute"', 'className="ball absolute"'));
  assert.equal(matchSelector(".ball", collectJsxInventory(viaProp)), "match");
});

test("project components/ are counted apart in the hygiene score (own file/line limits), not as invented local components", () => {
  const dir = cheat("comp-hygiene", (c) => c);
  writeComp(dir, "Chip.tsx", GOOD_COMP);
  writeComp(dir, "Chip2.tsx", GOOD_COMP.replaceAll("Chip", "Chip2"));
  const h = projectHygiene(dir, { exclude: path.join(dir, "Scene.tsx") });
  assert.equal(h.components, 0, "components/ do not use the local-component budget");
  assert.equal(h.folder.files, 2);
  assert.equal(h.folder.components, 2);
  assert.ok(h.folder.maxFileLines > 0 && h.lines === 0, JSON.stringify(h));
});

test("compare mode: answers are bound to BOTH the candidate sheet and the reference sheet; the 'vs reference' score comes from the compare block", () => {
  const slug = `.tmp-cmp-${process.pid}`, task = "bouncing-ball";
  const out = path.join(rootDir, "out", slug), refDir = referenceDir(task);
  const refFile = path.join(refDir, "visual-audit-grid.png");
  const hadRef = fs.existsSync(refFile) ? fs.readFileSync(refFile) : null; // do not clobber a real cached reference sheet
  const refManifest = path.join(refDir, "render-manifest.json");
  const hadManifest = fs.existsSync(refManifest) ? fs.readFileSync(refManifest) : null;
  const pd = path.join(out, "proj");
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(refDir, { recursive: true });
  try {
    fs.mkdirSync(pd, { recursive: true });
    fs.writeFileSync(path.join(pd, "Scene.tsx"), "export const a = 1;\n");
    fs.writeFileSync(path.join(out, "visual-audit-grid.png"), Buffer.from("candidate sheet"));
    writeRenderManifest({ manifestFile: manifestPathFor(slug), slug, projectDir: pd, kind: "contactSheet", imageFile: path.join(out, "visual-audit-grid.png"), tool: "test" });
    const h = imageInfo(slug).grid.hash;
    fs.rmSync(refFile, { force: true });
    assert.match(checkAnswerImages(slug, { imageHash: h, answers: {} }, { compare: task, projectDir: pd }).problems.join(" "), /reference sheet does not exist/);
    fs.writeFileSync(refFile, Buffer.from("reference sheet"));
    writeRenderManifest({ manifestFile: refManifest, slug: `reference-${task}`, projectDir: path.join(rootDir, "evals", "solutions", task), kind: "contactSheet", imageFile: refFile, tool: "test" });
    const rh = referenceInfo(task).hash;
    assert.match(rh, /^[0-9a-f]{64}$/);
    assert.match(checkAnswerImages(slug, { imageHash: h, answers: {} }, { compare: task, projectDir: pd }).problems.join(" "), /no "referenceHash"/);
    assert.match(checkAnswerImages(slug, { imageHash: h, referenceHash: "0".repeat(64), answers: {} }, { compare: task, projectDir: pd }).problems.join(" "), /referenceHash does not match/);
    assert.match(checkAnswerImages(slug, { imageHash: "0".repeat(64), referenceHash: rh, answers: {} }, { compare: task, projectDir: pd }).problems.join(" "), /imageHash does not match/);
    assert.equal(checkAnswerImages(slug, { imageHash: h, referenceHash: rh, answers: {} }, { compare: task, projectDir: pd }).ok, true);
    assert.equal(checkAnswerImages(slug, { imageHash: h, answers: {} }, { projectDir: pd }).ok, true, "plain mode ignores the reference");
    // the prompt shows both images and both hashes
    const rubric = parseRubric(fs.readFileSync(path.join(rootDir, "evals", "VISUAL_RUBRIC.md"), "utf-8"));
    const prompt = buildPrompt({ taskId: task, slug, rubric, compare: true });
    assert.ok(/IMAGE A, the CANDIDATE/.test(prompt) && /IMAGE B, the REFERENCE/.test(prompt) && prompt.includes(h) && prompt.includes(rh) && /referenceHash/.test(prompt) && /bouncing-ball\.cmp-layout/.test(prompt) && /generic\.legible/.test(prompt));
    // the reference sheet changed after the answers were written: refused
    fs.writeFileSync(refFile, Buffer.from("a different reference"));
    assert.equal(checkAnswerImages(slug, { imageHash: h, referenceHash: rh, answers: {} }, { compare: task, projectDir: pd }).ok, false);
    for (const id of fs.readdirSync(path.join(rootDir, "evals", "tasks"))) assert.equal(compareQuestions(rubric, id).length, 4, `${id}: 4 compare questions (layout, type, motion, polish)`);
    // scoring: true = at least as good; false or missing = worse
    const qs = compareQuestions(rubric, task);
    const answers = Object.fromEntries([...rubric[task], ...rubric.generic].map((q) => [q.id, true]));
    qs.forEach((q, i) => { answers[q.id] = i < 3; });
    const v = visualScore(rubric, task, answers, { compare: true });
    assert.deepEqual([v.compare.passed, v.compare.total, v.compare.score], [3, 4, 75]);
    assert.equal(v.compare.worse.length, 1);
    assert.equal(visualScore(rubric, task, answers).compare, undefined, "no compare block without --compare");
    assert.equal(v.unknownIds.length, 0);
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    if (hadRef) fs.writeFileSync(refFile, hadRef); else fs.rmSync(refFile, { force: true });
    if (hadManifest) fs.writeFileSync(refManifest, hadManifest); else fs.rmSync(refManifest, { force: true });
  }
});


/* ===================================================================================================================
 * Red-team round 3: one fixture per hole (non-ts files, env sniffing, hold-only text, paint-blind probe, counters, C001 margin, manifests, flags)
 * ================================================================================================================ */

const lint = (dir) => run("node", ["scripts/ast-lint.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
const v2codes = (a, code) => a.json.findings.filter((f) => f.code === code);

test("hole 1: files other than Scene.tsx/spec.json/direction.md/components/*.tsx/palette.ts/assets images are V2-013 (js, json, css, svg, dotfiles, other folders)", async () => {
  const dir = cheat("non-ts", (c) => c);
  fs.writeFileSync(path.join(dir, "helper.js"), "export const x = 1;\n");
  fs.writeFileSync(path.join(dir, "data.json"), "{}\n");
  fs.writeFileSync(path.join(dir, "theme.css"), ".a{}\n");
  fs.writeFileSync(path.join(dir, ".hidden"), "x\n");
  fs.mkdirSync(path.join(dir, "assets"), { recursive: true });
  fs.writeFileSync(path.join(dir, "assets", "logo.svg"), "<svg/>\n");
  fs.writeFileSync(path.join(dir, "assets", "ok.png"), Buffer.from([137, 80, 78, 71]));
  fs.mkdirSync(path.join(dir, "lib"), { recursive: true });
  fs.writeFileSync(path.join(dir, "lib", "m.mjs"), "export {};\n");
  fs.mkdirSync(path.join(dir, "components"), { recursive: true });
  fs.writeFileSync(path.join(dir, "components", "notes.json"), "{}\n");
  const a = lint(dir);
  const targets = v2codes(a, "V2-013").map((f) => f.target.replace(/:\d+$/, "").split("/").slice(-2).join("/"));
  for (const t of ["helper.js", "data.json", "theme.css", ".hidden", "assets/logo.svg", "lib/m.mjs", "components/notes.json"]) assert.ok(targets.some((x) => x.endsWith(t)), `${t} -> ${targets.join(", ")}`);
  assert.ok(!targets.some((x) => x.endsWith("ok.png")) && !targets.some((x) => x.endsWith("Scene.tsx") || x.endsWith("spec.json")), "images in assets/ and the allowed files are fine");
  const r = await scoreDir({ dir, rubric: rubricOf("bouncing-ball"), audits: auditsOf(dir), probe: "static", similarity: false });
  assert.ok(r.capped && r.score <= GATE_CAP && r.breakdown.gate.errors.some((e) => e.code === "V2-013"), `score ${r.score}`);
  // every allowed source file and even forbidden ones are linted, sized and compared (palette.ts, helper.js)
  const pal = cheat("palette", (c) => c);
  fs.writeFileSync(path.join(pal, "palette.ts"), "export const P = typeof self !== 'undefined';\n");
  assert.ok(v2codes(lint(pal), "V2-006").length >= 1 && v2codes(lint(pal), "V2-013").length === 0, "palette.ts is allowed and linted");
  fs.writeFileSync(path.join(pal, "big.js"), `${Array.from({ length: 300 }, (_, i) => `export const v${i} = ${i};`).join("\n")}\n`);
  assert.ok(projectHygiene(pal).lines >= 300, "a .js file counts towards the line budget");
  assert.ok(bestSimilarity("", null, { dir: pal }).max >= 0, "and is part of the C001 source");
  const copyJs = path.join(cheatRoot, "copy-in-js");
  fs.mkdirSync(copyJs, { recursive: true });
  fs.writeFileSync(path.join(copyJs, "Scene.tsx"), "export { Scene, buildTimeline } from './sol.js';\n");
  fs.writeFileSync(path.join(copyJs, "sol.js"), solCode.replaceAll("'../../../src/", "'../../../../src/"));
  assert.ok(bestSimilarity("", null, { dir: copyJs }).copied, "a copy hidden in a .js file is still C001");
});

test("hole 2: V2-006 covers self/top/parent/frames/opener, Function(, eval(, Reflect, __* globals, DOM climbing and remotion env APIs; locals named parent/top are fine", () => {
  const bad = {
    self: "const A = self.innerWidth;",
    "typeof-self": "const A = typeof self === 'undefined';",
    top: "const A = top;",
    parent: "const A = parent.document;",
    frames: "const A = frames.length;",
    opener: "const A = opener;",
    ownerDocument: "export const A = (e: any) => e.ownerDocument;",
    defaultView: "export const A = (e: any) => e['defaultView'];",
    "Function-call": "const A = Function('return this')();",
    "new-Function": "const A = new Function('return window');",
    eval: "const A = (0, eval)('this');",
    Reflect: "const A = Reflect.get({}, 'x');",
    "gsap-global": "const A = (globalThis as any).__gsap;",
    "dunder-id": "declare const __probe: any; const A = typeof __probe;",
    constructor: "const A = [].constructor.constructor('return this')();",
    location: "const A = location.href;",
    performance: "const A = performance.now();",
    "remotion-env": "import { getRemotionEnvironment } from 'remotion';\nconst A = getRemotionEnvironment();",
  };
  for (const [name, line] of Object.entries(bad)) {
    const dir = cheat(`env2-${name}`, (c) => `${c}\n${line}\nexport const ENV_FLAG2 = typeof A;\n`);
    assert.ok(v2codes(lint(dir), "V2-006").length >= 1, `${name}: ${JSON.stringify(lint(dir).json.findings.map((f) => f.code))}`);
  }
  const ok = cheat("env2-ok", (c) => `${c}\nexport const walk = (parent: number, top: number) => parent + top;\nexport const g = (self: number) => { const frames = [self]; return frames.length; };\nconst o = { self: 1, parent: 2 }; export const k = o.self + o.parent;\n`);
  assert.equal(v2codes(lint(ok), "V2-006").length, 0, "shadowing locals and property names are not references");
});

test("hole 3: tl.set / zero-duration tweens that change opacity/visibility/display/position inside the hold are T003", () => {
  for (const [name, call] of Object.entries({ set: "tl.set('.caption', { opacity: 1 }, 3.5);", "zero-dur": "tl.to('.ball', { x: 5, duration: 0 }, 3.2);", display: "tl.set('.caption', { display: 'block' }, 3.9);" })) {
    const dir = cheat(`hold-set-${name}`, (c) => c.replace("  holdFinal(", `  ${call}\n  holdFinal(`));
    const t = run("npx", ["tsx", "scripts/timeline-audit.mjs", "--dir", path.relative(rootDir, dir), "--json"]);
    assert.ok(t.json.findings.some((f) => f.code === "T003" && f.severity === "error" && /zero-duration/.test(f.message)), `${name}: ${JSON.stringify(t.json.findings.filter((f) => f.code === "T003"))}`);
  }
});

test("hole 3: a closing string visible only on the last frame is not a hold string (probe-reported strings are the intersection of every 6f hold sample)", async () => {
  const dir = path.join(solutionsDir, "stat-counter"), rubric = rubricOf("stat-counter"), audits = auditsOf(dir);
  const series = Array.from({ length: 31 }, (_, i) => [i * 10, String(i * 1600), true]);
  const last = (finalHold, textSeries = { [`text=${encodeURIComponent("48,200")}`]: series.slice(0, 29).concat([[290, "48,200", true], [299, "48,200", true]]) }) => probeOk({ finalHold, textSeries });
  const late = await scoreDir({ dir, rubric, audits, similarity: false, probe: last({ strings: ["48,200", "riders this month"], partialStrings: ["Harbor Line"] }) });
  assert.ok(late.behaviorCapped && late.breakdown.rubric.checks.some((c) => /closing hold/.test(c.label) && !c.pass), `late ${late.score}`);
});

test("hole 6: textChanges behavior (>= N distinct visible values, monotonic, final value) and the closing holds of list-reveal / stat-counter", async () => {
  const b = { type: "textChanges", selector: ".number", minDistinct: 10, monotonic: true, final: "48,200" };
  const mk = (vals, vis = true) => ({ ".number": vals.map((v, i) => [i * 4, v, vis]) });
  const count = Array.from({ length: 20 }, (_, i) => String(Math.round((i * 48200) / 19).toLocaleString("en-US"))).map((v, i, a) => (i === a.length - 1 ? "48,200" : v));
  const ev = (series) => evalBehavior(b, {}, { probeTextSeries: series });
  assert.equal(ev(mk(count)).pass, true, ev(mk(count)).detail);
  assert.equal(ev(mk(Array(30).fill("48,200"))).pass, false, "a static number does not count");
  assert.equal(ev(mk(["0", "5", "9", "48,200"])).pass, false, "too few distinct values");
  assert.equal(ev(mk([...count.slice(0, 10).reverse(), "48,200"])).pass, false, "not monotonic");
  assert.equal(ev(mk([...count.slice(0, 19), "47,999"])).pass, false, "wrong final value");
  assert.equal(ev(mk(count, false)).pass, false, "hidden counter");
  assert.equal(ev(null).pass, false, "no series");
  assert.equal(evalBehavior({ type: "textChanges", find: "48,200", minDistinct: 10, final: "48,200" }, {}, { probeTextSeries: { [`text=${encodeURIComponent("48,200")}`]: mk(count)[".number"] } }).pass, true, "find: by the text shown at the end");
  // the rubrics carry the checks
  assert.ok(rubricOf("stat-counter").behavior.some((x) => x.type === "textChanges"), "stat-counter has textChanges");
  for (const [task, need] of [["list-reveal", ["Listen", "Sketch", "Prototype", "Animate", "Ship"]], ["stat-counter", ["48,200", "riders this month", "Harbor Line"]]]) {
    const groups = rubricOf(task).closingHold.groups.flatMap((g) => g.anyOf);
    for (const n of need) assert.ok(groups.includes(n), `${task} closing hold needs ${n}`);
  }
  const dir = path.join(solutionsDir, "list-reveal"), audits = auditsOf(dir);
  const all = ["How", "we", "work", "Listen", "Sketch", "Prototype", "Animate", "Ship"];
  const good = await scoreDir({ dir, rubric: rubricOf("list-reveal"), audits, similarity: false, probe: probeOk({ finalHold: { strings: all } }) });
  const bad = await scoreDir({ dir, rubric: rubricOf("list-reveal"), audits, similarity: false, probe: probeOk({ finalHold: { strings: all.filter((x) => x !== "Prototype") } }) });
  assert.ok(good.score >= 95 && bad.behaviorCapped && bad.score <= BEHAVIOR_CAP, `${good.score} / ${bad.score}`);
});

test("hole 7: C001 margin is relative and an order-insensitive statement-bag metric catches reordered lines (numbers in the report)", () => {
  assert.equal(requiredMargin(METRICS.strict, 0.5) > 0.08 && requiredMargin(METRICS.strict, 0.95) === 0.08, true);
  assert.ok(METRICS.bag.bag === true);
  const redTeam = (id) => {
    let code = fs.readFileSync(path.join(solutionsDir, id, "Scene.tsx"), "utf-8").replaceAll("'../../../src/", "'../../../../src/");
    const lines = code.split("\n");
    const bi = lines.findIndex((l) => /export const buildTimeline/.test(l));
    const idx = [];
    for (let i = bi + 1; i < lines.length && idx.length < 4 && !/return tl/.test(lines[i]); i++) if (/^\s+\w+\(tl,.*\);\s*(\/\/.*)?$/.test(lines[i])) idx.push(i);
    const rev = idx.map((i) => lines[i]).reverse();
    idx.forEach((i, k) => { lines[i] = rev[k]; });
    code = lines.join("\n");
    const m = code.match(/^const (\w+) = ('[^'\n]*'|[\d.]+);.*$/m);
    if (m && code.split(new RegExp(`\\b${m[1]}\\b`)).length - 1 >= 2) code = code.replace(m[0], "").replace(new RegExp(`\\b${m[1]}\\b`, "g"), m[2]);
    return code;
  };
  const numbers = [];
  for (const id of fs.readdirSync(solutionsDir)) {
    const dir = path.join(cheatRoot, `rt-${id}`);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "Scene.tsx"), redTeam(id));
    const r = bestSimilarity("", null, { dir });
    numbers.push(`${id}: strict ${r.metrics.strict.max.toFixed(2)}/${r.metrics.strict.publicMax.toFixed(2)} loose ${r.metrics.loose.max.toFixed(2)}/${r.metrics.loose.publicMax.toFixed(2)} bag ${r.metrics.bag.max.toFixed(2)}/${r.metrics.bag.publicMax.toFixed(2)}`);
    assert.ok(r.copied && r.metrics.bag.copied, `red-team edit of ${id} must be flagged (also by the bag metric): ${numbers.at(-1)}`);
    // an order-insensitive metric alone: shuffle ALL buildTimeline statements, strict n-grams fall, the bag does not
    assert.ok(bagContainment(statementBag(fs.readFileSync(path.join(dir, "Scene.tsx"), "utf-8"), "bag"), statementBag(fs.readFileSync(path.join(solutionsDir, id, "Scene.tsx"), "utf-8").replaceAll("'../../../src/", "'../../../../src/"), "bag")) >= 0.75, `bag containment ${id}`);
  }
  // honest independent solutions stay clear (every solution against the others) with slack
  for (const id of fs.readdirSync(solutionsDir)) assert.equal(bestSimilarity("", null, { dir: path.join(solutionsDir, id) }).copied, false, `${id} vs the other solutions`);
  fs.writeFileSync(path.join(cheatRoot, "c001-numbers.txt"), numbers.join("\n"));
  // pure reordering: reverse every single-line call in buildTimeline
  const code = fs.readFileSync(path.join(solutionsDir, "list-reveal", "Scene.tsx"), "utf-8");
  const shuffled = code.split("\n").map((l, i) => [l, i]);
  const calls = shuffled.filter(([l]) => /^\s+(enter|emphasize|camera)\(tl,/.test(l));
  const rev = calls.map(([l]) => l).reverse();
  calls.forEach(([, i], k) => { shuffled[i][0] = rev[k]; });
  const reordered = shuffled.map(([l]) => l).join("\n");
  assert.ok(bagContainment(statementBag(reordered, "bag"), statementBag(code, "bag")) >= 0.95, "line reordering does not change the bag");
  assert.ok(similarity(reordered, code, "strict") < 1, "while the n-gram metrics see the reordering");
});

test("hole 8: renders are signed (manifest binds image + project source + harness lock); resolveVisual recomputes the score from the answers and refuses stale pictures", () => {
  const slug = `.tmp-manifest-${process.pid}`, out = path.join(rootDir, "out", slug), pdir = path.join(cheatRoot, "manifest-proj");
  fs.mkdirSync(out, { recursive: true });
  fs.mkdirSync(pdir, { recursive: true });
  fs.writeFileSync(path.join(pdir, "Scene.tsx"), "export const a = 1;\n");
  fs.writeFileSync(path.join(pdir, "spec.json"), JSON.stringify({ evalModel: "gemini-pro" }));
  const img = path.join(out, "visual-audit-grid.png");
  fs.writeFileSync(img, Buffer.from("picture"));
  const mf = manifestPathFor(slug);
  const v = () => verifyRenderManifest({ manifestFile: mf, projectDir: pdir, kind: "contactSheet", imageFile: img });
  try {
    assert.match(v().problems[0], /no signed render manifest/, "an image without a manifest (not harness-rendered) is refused");
    writeRenderManifest({ manifestFile: mf, slug, projectDir: pdir, kind: "contactSheet", imageFile: img, tool: "test" });
    assert.equal(v().ok, true);
    fs.writeFileSync(img, Buffer.from("doctored"));
    assert.match(v().problems.join(" "), /SHA-256 mismatch/, "an edited image");
    fs.writeFileSync(img, Buffer.from("picture"));
    fs.appendFileSync(path.join(pdir, "Scene.tsx"), "export const b = 2;\n");
    assert.match(v().problems.join(" "), /source changed/, "the source changed after the render");
    fs.writeFileSync(path.join(pdir, "Scene.tsx"), "export const a = 1;\n");
    assert.equal(v().ok, true);
    const m = readJson(mf);
    m.entries.contactSheet.lockHash = "f".repeat(64);
    fs.writeFileSync(mf, JSON.stringify(m));
    assert.match(v().problems.join(" "), /signature mismatch|another harness lock/, "an edited manifest / another lock");
    // resolveVisual recomputes: stored totals are ignored, answers are re-scored, a changed picture invalidates
    writeRenderManifest({ manifestFile: mf, slug, projectDir: pdir, kind: "contactSheet", imageFile: img, tool: "test" });
    const rubric = parseRubric(fs.readFileSync(path.join(rootDir, "evals", "VISUAL_RUBRIC.md"), "utf-8"));
    const qs = [...rubric["bouncing-ball"], ...rubric.generic];
    const answers = Object.fromEntries(qs.map((q) => [q.id, false]));
    const hash = imageInfo(slug).grid.hash;
    const vf = path.join(rootDir, "out", "evals", `${slug}.visual.json`);
    fs.mkdirSync(path.dirname(vf), { recursive: true });
    fs.writeFileSync(vf, JSON.stringify({ taskId: "bouncing-ball", project: slug, judge: "claude-opus", score: 100, task: { score: 70 }, generic: { score: 30 }, imageHash: hash, answers }));
    const r = resolveVisual(slug, { taskId: "bouncing-ball", projectDir: pdir });
    assert.equal(r.valid, true, JSON.stringify(r.problems));
    assert.equal(r.score, 0, "the stored 100 is ignored: all-false answers recompute to 0");
    fs.writeFileSync(img, Buffer.from("changed"));
    assert.equal(resolveVisual(slug, { taskId: "bouncing-ball", projectDir: pdir }).valid, false);
    fs.rmSync(vf, { force: true });
  } finally {
    fs.rmSync(out, { recursive: true, force: true });
    fs.rmSync(path.join(rootDir, "out", "evals", `${slug}.visual.json`), { force: true });
  }
});

test("hole 8: protected set adds VISUAL_RUBRIC, index.css, public/, engine/stage/components-v5, the curated import closure and the build configs; non-Chrome browsers are refused", async () => {
  const files = Object.keys(computeManifest());
  for (const f of ["evals/VISUAL_RUBRIC.md", "src/index.css", "vite.config.ts", "evals/judges.json"]) assert.ok(files.includes(f), `${f} must be protected`);
  for (const prefix of ["public/", "src/engine/", "src/stage/", "src/components-v5/", "src/assets/", "src/materials/"]) assert.ok(files.some((f) => f.startsWith(prefix)), `${prefix} must be protected`);
  assert.ok(PROTECTED.includes("public") && PROTECTED.includes("src/index.css"));
  const { BROWSER_NAME_OK, BROWSER_PRODUCT_OK } = await import("./browser-probe.mjs");
  for (const ok of ["chrome.exe", "msedge.exe", "chrome-headless-shell.exe", "google-chrome", "microsoft-edge"]) assert.ok(BROWSER_NAME_OK.test(ok), ok);
  for (const bad of ["firefox.exe", "chromium", "brave.exe", "node.exe", "chrome-fake.sh", "opera"]) assert.ok(!BROWSER_NAME_OK.test(bad), bad);
  assert.ok(BROWSER_PRODUCT_OK.test("HeadlessChrome/157.0.8080.0") && BROWSER_PRODUCT_OK.test("Edg/130.0") && !BROWSER_PRODUCT_OK.test("Firefox/130") && !BROWSER_PRODUCT_OK.test("Brave/1"));
});

test("hole 9: every score carries the flags used; --dev / --skip-integrity / --no-probe are NOT VALID FOR COMPARISON", async () => {
  const rubric = rubricOf("bouncing-ball"), audits = auditsOf(SOL);
  const clean = await scoreDir({ dir: SOL, rubric, audits, probe: probeOk(), similarity: false, flags: {} });
  assert.deepEqual(clean.flags.list.filter((x) => x.startsWith("--")), []);
  assert.equal(clean.validForComparison, true);
  for (const [flag, key] of [["--dev", "dev"], ["--skip-integrity", "skipIntegrity"], ["--no-probe", "noProbe"]]) {
    const r = await scoreDir({ dir: SOL, rubric, audits, probe: key === "noProbe" ? false : probeOk(), similarity: false, flags: { [key]: true } });
    assert.ok(r.flags.list.includes(flag) && r.validForComparison === false && r.invalidReasons.includes(flag), `${flag}: ${JSON.stringify(r.flags)}`);
  }
  const printed = [];
  const orig = console.log;
  console.log = (...a) => printed.push(a.join(" "));
  try { const { printResult, printLeaderboard } = await import("./eval-score.mjs"); const r = await scoreDir({ dir: SOL, rubric, audits, probe: probeOk(), similarity: false, flags: { dev: true, noProbe: true } }); printResult(r); printLeaderboard([r]); } finally { console.log = orig; }
  const text = printed.join("\n");
  assert.match(text, /flags: --dev --no-probe/);
  assert.equal((text.match(/NOT VALID FOR COMPARISON/g) ?? []).length >= 3, true, "human output and leaderboard both say it");
  const prompt = fs.readFileSync(path.join(rootDir, "evals", "AGENT_PROMPT.md"), "utf-8");
  assert.ok(!/--dev|--skip-integrity|--no-probe/.test(prompt), "the agent prompt never tells the model to use the maintainer flags");
});
