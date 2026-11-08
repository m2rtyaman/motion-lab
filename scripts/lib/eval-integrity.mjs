/**
 * Anti-cheat helpers for the eval scorer (no model is ever called here):
 *  - similarity: Babel-normalized token 5-grams (identifiers -> ID, strings -> S, numbers -> N) over ALL source files of a project vs the reference
 *    solutions (C001), with a pinned list of public example/study projects as the legitimate baseline;
 *  - integrity : SHA-256 manifest of the files a tested model must not touch (scripts, tasks, solutions, core, primitives, remotion, specs, docs,
 *    RULES.md, package.json, tsconfig.json, .githooks, the public example/study projects), the lock must also equal the committed git HEAD copy;
 *  - render windows + pixel diff used by scripts/render-check.mjs (R001).
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { rootDir } from "./projects.mjs";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

/* ---------- sources ---------- */

const SRC_SKIP = new Set(["node_modules", "__pycache__", ".git"]);
/** Every code-like file under a project folder (sorted, so concatenation is deterministic): ts/tsx plus js/jsx/mjs/cjs/css, which V2-013 forbids but must never escape hashing, sizing and similarity. */
export const SOURCE_EXT = /\.(tsx?|jsx?|mjs|cjs|mts|cts|css)$/;
export function listSourceFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (SRC_SKIP.has(e.name)) continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (SOURCE_EXT.test(e.name)) out.push(full);
    }
  };
  walk(dir);
  return out.sort();
}
/** Every source file of the project folder concatenated (a wrapper Scene.tsx cannot hide a copied sol.tsx next to it). */
export const projectSource = (dir) => listSourceFiles(dir).map((f) => fs.readFileSync(f, "utf-8")).join("\n");

/** Source with all comments blanked out (Babel comment ranges), so regexes never match text that lives in a comment. */
export function stripComments(code) {
  try {
    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], tokens: false });
    let out = code;
    for (const c of [...(ast.comments ?? [])].sort((a, b) => b.start - a.start)) out = out.slice(0, c.start) + out.slice(c.start, c.end).replace(/[^\n]/g, " ") + out.slice(c.end);
    return out;
  } catch {
    return code.replace(/\/\*[\s\S]*?\*\/|(^|[^:])\/\/[^\n]*/g, "$1 ");
  }
}

/* ---------- similarity (C001) ---------- */

/**
 * Three metrics, each compared with the best pinned PUBLIC project of the SAME metric (a copy must be clearly closer to a reference solution than to anything public):
 *  - strict: names the code declares -> ID, strings kept, numbers -> N, JSX text -> T, as 5-gram shingles. Catches copies with renamed identifiers/components.
 *  - loose : additionally every string -> S (so renamed classNames, selectors and copy do not help).
 *  - bag   : order-insensitive. The multiset of normalised STATEMENT hashes (every statement and JSX opening tag, strings -> S, numbers -> N, declared names -> ID);
 *            moving lines around or inlining a const leaves almost every statement hash intact. Share of the solution's statements found in the candidate.
 * A metric fires when sim(solution) >= limit AND sim(solution) >= pub + max(minMargin, relMargin x (1 - pub)), pub = best similarity to any public project:
 * the margin is RELATIVE, so a candidate that sits at 0.55 from the public examples must be 0.08+ closer to a solution, and one at 0.9 from them cannot be flagged at all.
 */
export const METRICS = {
  strict: { strings: "keep", limit: 0.6, minMargin: 0.08, relMargin: 0.35 },
  loose: { strings: "S", limit: 0.6, minMargin: 0.08, relMargin: 0.35 },
  bag: { strings: "S", limit: 0.6, minMargin: 0.08, relMargin: 0.35, bag: true },
};
export const requiredMargin = (m, pub) => Math.max(m.minMargin, m.relMargin * (1 - pub));
export const SIMILARITY_LIMIT = METRICS.strict.limit;
export const PUBLIC_MARGIN = METRICS.strict.minMargin;
const NGRAM = 5;

/** Every identifier the file DECLARES (variables, destructured names, functions, params, classes, types): these are what a rename changes. */
function declaredNames(ast) {
  const out = new Set();
  const bind = (id) => {
    if (!id) return;
    if (id.type === "Identifier") out.add(id.name);
    else if (id.type === "ObjectPattern") id.properties.forEach((p) => bind(p.value ?? p.argument));
    else if (id.type === "ArrayPattern") id.elements.forEach(bind);
    else if (id.type === "AssignmentPattern") bind(id.left);
    else if (id.type === "RestElement") bind(id.argument);
  };
  const walk = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "VariableDeclarator") bind(n.id);
    else if ((n.type === "FunctionDeclaration" || n.type === "ClassDeclaration" || n.type === "TSInterfaceDeclaration" || n.type === "TSTypeAliasDeclaration" || n.type === "TSEnumDeclaration") && n.id) bind(n.id);
    if (/Function|ObjectMethod|ClassMethod/.test(n.type)) (n.params ?? []).forEach(bind);
    if (n.type === "CatchClause") bind(n.param);
    for (const k of Object.keys(n)) { if (k === "loc" || k === "extra") continue; const c = n[k]; if (Array.isArray(c)) c.forEach(walk); else if (c && typeof c === "object") walk(c); }
  };
  walk(ast.program);
  return out;
}

/**
 * Babel tokens without comments/whitespace; declared names -> ID, numbers -> N, JSX text -> T, strings kept (strict) or -> S (loose).
 * Names a file imports from a package (react, gsap, remotion) stay as written.
 */
export function tokenize(code, mode = "strict") {
  const keepStrings = METRICS[mode]?.strings === "keep";
  const str = (v) => (keepStrings ? `S:${v}` : "S");
  try {
    const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], tokens: true });
    const declared = declaredNames(ast);
    const out = [];
    for (const t of ast.tokens ?? []) {
      if (typeof t.type === "string") continue; // CommentLine / CommentBlock
      const label = t.type?.label ?? "";
      if (label === "eof") continue;
      if (label === "jsxText") { if (String(t.value).trim()) out.push("T"); continue; }
      if (label === "name" || label === "jsxName") { out.push(declared.has(t.value) ? "ID" : t.value); continue; }
      if (label === "string") { out.push(str(t.value)); continue; }
      if (label === "template") { if (String(t.value ?? "").length) out.push(str(t.value)); continue; }
      if (label === "num" || label === "bigint") { out.push("N"); continue; }
      out.push(label || String(t.value));
    }
    return out;
  } catch {
    return (stripComments(code).match(/[A-Za-z_$][\w$]*|\d+(?:\.\d+)?|'[^']*'|"[^"]*"|`[^`]*`|\S/g) ?? []).map((x) => (/^['"`]/.test(x) ? str(x) : /^\d/.test(x) ? "N" : x));
  }
}

export function ngrams(tokens, n = NGRAM) {
  const set = new Set();
  for (let i = 0; i + n <= tokens.length; i++) set.add(tokens.slice(i, i + n).join("\u0001"));
  return set;
}

export function jaccard(a, b) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}
/** Share of the reference's shingles that occur in the candidate: padding a copy with extra code does not lower it. */
export function containment(candidate, reference) {
  if (!reference.size) return 0;
  let inter = 0;
  for (const x of reference) if (candidate.has(x)) inter++;
  return inter / reference.size;
}
/** Similarity of a candidate to a reference: the larger of Jaccard and containment of the reference in the candidate. */
export const shingleSimilarity = (cand, ref) => Math.max(jaccard(cand, ref), containment(cand, ref));
/** Similarity of two code strings under one metric (default strict). */
export const similarity = (codeA, codeB, mode = "strict") => shingleSimilarity(ngrams(tokenize(codeA, mode)), ngrams(tokenize(codeB, mode)));

/**
 * Order-insensitive fingerprint: Map(hash -> count) of every statement and JSX opening element, normalised like tokenize (declared names -> ID, numbers -> N,
 * JSX text -> T, strings kept or -> S). Statements nest, so a container (function) hashes as one item and each statement inside as its own.
 */
export function statementBag(code, mode = "loose") {
  const keepStrings = METRICS[mode]?.strings === "keep";
  const bag = new Map();
  let ast;
  try { ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], tokens: true }); } catch { return bag; }
  const declared = declaredNames(ast);
  const toks = [];
  for (const t of ast.tokens ?? []) {
    if (typeof t.type === "string") continue;
    const label = t.type?.label ?? "";
    if (label === "eof") continue;
    let v;
    if (label === "jsxText") { if (!String(t.value).trim()) continue; v = "T"; }
    else if (label === "name" || label === "jsxName") v = declared.has(t.value) ? "ID" : t.value;
    else if (label === "string") v = keepStrings ? `S:${t.value}` : "S";
    else if (label === "template") { if (!String(t.value ?? "").length) continue; v = keepStrings ? `S:${t.value}` : "S"; }
    else if (label === "num" || label === "bigint") v = "N";
    else v = label || String(t.value);
    toks.push({ s: t.start, e: t.end, v });
  }
  const ITEM = /^(ExpressionStatement|VariableDeclaration|ReturnStatement|ThrowStatement|ImportDeclaration|JSXOpeningElement|IfStatement|ForStatement|ForOfStatement|ForInStatement|FunctionDeclaration)$/;
  const walk = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (ITEM.test(n.type) && n.start !== undefined) {
      const text = toks.filter((t) => t.s >= n.start && t.e <= n.end).map((t) => t.v).join("");
      if (text.length) {
        const h = crypto.createHash("sha1").update(text).digest("hex").slice(0, 16);
        bag.set(h, (bag.get(h) ?? 0) + 1);
      }
    }
    for (const k of Object.keys(n)) { if (k === "loc" || k === "extra" || k === "tokens" || k === "comments") continue; const c = n[k]; if (Array.isArray(c)) c.forEach(walk); else if (c && typeof c === "object") walk(c); }
  };
  walk(ast.program);
  return bag;
}
/** Multiset containment: the share of the reference's statements (with multiplicity) that the candidate has too. */
export function bagContainment(cand, ref) {
  let total = 0, hit = 0;
  for (const [h, n] of ref) { total += n; hit += Math.min(n, cand.get(h) ?? 0); }
  return total ? hit / total : 0;
}

/** Every reference solution a candidate could have been copied from: { id, dir, file }. */
export function solutionScenes({ tasksDir } = {}) {
  const found = [];
  const roots = [path.join(rootDir, "evals", "solutions")];
  if (tasksDir) roots.push(path.join(path.dirname(tasksDir), "solutions"));
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    for (const e of fs.readdirSync(r, { withFileTypes: true })) {
      const f = path.join(r, e.name, "Scene.tsx");
      if (e.isDirectory() && fs.existsSync(f)) found.push({ id: e.name, dir: path.join(r, e.name), file: f });
    }
  }
  if (tasksDir && fs.existsSync(tasksDir))
    for (const e of fs.readdirSync(tasksDir, { withFileTypes: true })) {
      const f = path.join(tasksDir, e.name, "solution", "Scene.tsx");
      if (e.isDirectory() && fs.existsSync(f)) found.push({ id: e.name, dir: path.join(tasksDir, e.name, "solution"), file: f });
    }
  return found;
}

const PUBLIC_RE = /^(example|study)-/;
/** The pinned public projects: the slugs recorded in the lock (a folder merely NAMED example-* / study-* is not public). Falls back to the prefix scan only without a lock. */
export function publicProjectSlugs(lockFile = LOCK_FILE, root = rootDir) {
  try {
    const lock = JSON.parse(fs.readFileSync(lockFile, "utf-8"));
    if (Array.isArray(lock.publicProjects)) return lock.publicProjects;
  } catch { /* no lock yet */ }
  return discoverPublicProjects(root);
}
export function discoverPublicProjects(root = rootDir) {
  const dir = path.join(root, "src", "projects");
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory() && PUBLIC_RE.test(e.name) && fs.existsSync(path.join(dir, e.name, "Scene.tsx"))).map((e) => e.name).sort();
}
/** Public reference scenes a candidate may legitimately start from. */
export function publicScenes() {
  return publicProjectSlugs().map((slug) => ({ id: slug, dir: path.join(rootDir, "src", "projects", slug), file: path.join(rootDir, "src", "projects", slug, "Scene.tsx") })).filter((s) => fs.existsSync(s.file));
}

/**
 * Highest similarity of the candidate to any solution and to any pinned public project (the candidate's own folder is skipped), per metric.
 * The candidate is the whole project folder (opts.dir) or just `sceneCode`. Returns { max, id, publicMax, publicId, copied, metric, metrics }:
 * copied when, for some metric, max >= limit and max - publicMax >= margin; the reported numbers are those of the metric that fired (else strict).
 */
export function bestSimilarity(sceneCode, scenePath, opts = {}) {
  const dir = opts.dir ?? (scenePath ? path.dirname(scenePath) : null);
  const code = opts.dir ? projectSource(opts.dir) : sceneCode;
  const self = dir ? path.resolve(dir) : null;
  const sols = solutionScenes(opts).filter((s) => !self || path.resolve(s.dir) !== self).map((s) => ({ ...s, code: projectSource(s.dir) }));
  const pubs = (opts.publicProjects ?? publicScenes()).filter((s) => !self || path.resolve(s.dir) !== self).map((s) => ({ ...s, code: projectSource(s.dir) }));
  const metrics = {};
  for (const [name, m] of Object.entries(METRICS)) {
    const simOf = m.bag
      ? (() => { const mine = statementBag(code, name); return (c) => bagContainment(mine, statementBag(c, name)); })()
      : (() => { const mine = ngrams(tokenize(code, name)); return (c) => shingleSimilarity(mine, ngrams(tokenize(c, name))); })();
    const bestOf = (list) => {
      let best = { max: 0, id: null };
      for (const s of list) {
        const j = simOf(s.code);
        if (j > best.max) best = { max: j, id: s.id };
      }
      return best;
    };
    const sol = bestOf(sols), pub = bestOf(pubs);
    const margin = requiredMargin(m, pub.max);
    metrics[name] = { ...sol, publicMax: pub.max, publicId: pub.id, limit: m.limit, margin, copied: sol.max >= m.limit && sol.max >= pub.max + margin };
  }
  const fired = Object.entries(metrics).filter(([, m]) => m.copied).sort((p, q) => q[1].max - p[1].max)[0];
  const [metric, pick] = fired ?? ["strict", metrics.strict];
  return { max: pick.max, id: pick.id, publicMax: pick.publicMax, publicId: pick.publicId, copied: Boolean(fired), metric, limit: pick.limit, margin: pick.margin, metrics };
}

/** Hygiene numbers over ALL project source files: Scene lines, locally defined components, raw tweens (a split-up Scene cannot dodge the limits). */
export function projectHygiene(dir, { exclude } = {}) {
  let lines = 0, components = 0, rawTweens = 0;
  // files in <project>/components/ are counted on their own (own limits, see ast-lint V2-008): file count, longest file, total lines, components defined
  const folder = { files: 0, maxFileLines: 0, lines: 0, components: 0 };
  const compRoot = path.resolve(dir, "components") + path.sep;
  for (const f of listSourceFiles(dir)) {
    if (exclude && path.resolve(f) === path.resolve(exclude)) continue;
    const inFolder = path.resolve(f).startsWith(compRoot);
    const code = fs.readFileSync(f, "utf-8");
    const n = code.replace(/\r?\n$/, "").split(/\r?\n/).length;
    if (inFolder) { folder.files++; folder.lines += n; folder.maxFileLines = Math.max(folder.maxFileLines, n); } else lines += n;
    try {
      const ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
      const hasJsx = (n) => n && typeof n.type === "string" && (n.type === "JSXElement" || n.type === "JSXFragment" || Object.keys(n).some((k) => k !== "loc" && k !== "extra" && (Array.isArray(n[k]) ? n[k].some(hasJsx) : n[k] && typeof n[k] === "object" && hasJsx(n[k]))));
      const visit = (n) => {
        if (!n || typeof n.type !== "string") return;
        const name = n.type === "FunctionDeclaration" ? n.id?.name : n.type === "VariableDeclarator" && /^(Arrow|Function)/.test(n.init?.type ?? "") ? n.id?.name : null;
        if (name && /^[A-Z]/.test(name) && name !== "Scene" && hasJsx(n.type === "VariableDeclarator" ? n.init.body : n.body)) { if (inFolder) folder.components++; else components++; }
        if (n.type === "CallExpression" && n.callee?.type === "MemberExpression" && /^(to|from|fromTo|set)$/.test(n.callee.property?.name ?? "") && /^(tl|timeline)$/i.test(n.callee.object?.name ?? "")) rawTweens++;
        for (const k of Object.keys(n)) { if (k === "loc" || k === "extra") continue; const c = n[k]; if (Array.isArray(c)) c.forEach(visit); else if (c && typeof c === "object") visit(c); }
      };
      visit(ast.program);
    } catch { /* syntax errors are reported by ast-lint */ }
  }
  return { lines, components, rawTweens, folder };
}

/* ---------- harness integrity ---------- */

/**
 * Files/folders a tested model must not touch. The public example/study project folders are added from the pinned list (see publicProjectSlugs).
 * Also protected (computed, see protectedPaths): the build/config files (vite, tailwind, postcss, remotion configs), `src/index.css`, `public/**`, and every
 * `src/<folder>` that the curated primitives import (transitively from src/primitives/curated.ts), so a styling/asset/engine edit cannot change what the primitives paint.
 */
export const PROTECTED = ["scripts", "evals/tasks", "evals/solutions", "evals/judges.json", "evals/VISUAL_RUBRIC.md", "evals/harness.lock.json", "src/core", "src/primitives", "src/remotion", "src/engine", "src/stage", "src/components-v5", "src/index.css", "public", "specs", "docs", "RULES.md", "package.json", "tsconfig.json", ".githooks", "pnpm-workspace.yaml", "src/projects/example-*", "src/projects/study-*"];
export const LOCK_FILE = path.join(rootDir, "evals", "harness.lock.json");
const LOCK_REL = "evals/harness.lock.json";
const SKIP_DIR = new Set(["node_modules", "__pycache__", ".git"]);
const TEXT_EXT = /\.(mjs|js|cjs|ts|tsx|json|md|py|css|html|txt|yml|yaml|svg)$/i;
const CONFIG_FILE = /^(vite|vitest|tailwind|postcss|remotion|rspack|webpack|babel|eslint)\.config\.(js|cjs|mjs|ts|mts|cts|json)$|^\.postcssrc(\..+)?$|^\.npmrc$/;
/** Binary files above this size are fingerprinted by name + size instead of content (public/ holds fonts and audio). */
export const BIG_BINARY_BYTES = 3 * 1024 * 1024;

const hashFile = (f) => {
  const st = fs.statSync(f);
  if (!TEXT_EXT.test(f) && st.size > BIG_BINARY_BYTES) return crypto.createHash("sha256").update(`size:${st.size}:${path.basename(f)}`).digest("hex");
  let buf = fs.readFileSync(f);
  if (TEXT_EXT.test(f)) buf = Buffer.from(buf.toString("utf-8").replace(/^﻿/, "").replace(/\r\n/g, "\n"), "utf-8"); // CRLF checkouts must not look like tampering
  return crypto.createHash("sha256").update(buf).digest("hex");
};

/**
 * Every src/ file reachable from src/primitives/curated.ts through relative imports/re-exports (a Babel scan, transitive). Returns repo-relative posix paths.
 * Used to protect the folders the curated primitives depend on.
 */
export function curatedImportClosure(root = rootDir, entry = "src/primitives/curated.ts") {
  const start = path.join(root, entry);
  if (!fs.existsSync(start)) return [];
  const seen = new Set(), queue = [start];
  const resolveImport = (from, spec) => {
    const base = path.resolve(path.dirname(from), spec);
    for (const c of [base, ...[".ts", ".tsx", ".js", ".jsx", ".mjs", ".json", ".css"].map((e) => base + e), ...["index.ts", "index.tsx", "index.js"].map((i) => path.join(base, i))])
      if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
    return null;
  };
  while (queue.length) {
    const f = queue.pop();
    if (seen.has(f)) continue;
    seen.add(f);
    if (!/\.(tsx?|jsx?|mjs)$/.test(f)) continue;
    let ast;
    try { ast = parse(fs.readFileSync(f, "utf-8"), { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { continue; }
    const visit = (n) => {
      if (!n || typeof n.type !== "string") return;
      const src = (n.type === "ImportDeclaration" || ((n.type === "ExportNamedDeclaration" || n.type === "ExportAllDeclaration") && n.source)) ? n.source.value
        : n.type === "CallExpression" && (n.callee?.type === "Import" || (n.callee?.name === "require")) && n.arguments[0]?.type === "StringLiteral" ? n.arguments[0].value : null;
      if (typeof src === "string" && src.startsWith(".")) { const r = resolveImport(f, src); if (r) queue.push(r); }
      for (const k of Object.keys(n)) { if (k === "loc" || k === "extra") continue; const c = n[k]; if (Array.isArray(c)) c.forEach(visit); else if (c && typeof c === "object") visit(c); }
    };
    visit(ast.program);
  }
  return [...seen].map((f) => path.relative(root, f).replaceAll("\\", "/")).filter((f) => f.startsWith("src/")).sort();
}

/** The src/ folders (or top-level files) outside src/projects that the curated primitives import. */
export function curatedDependencyPaths(root = rootDir) {
  const out = new Set();
  for (const f of curatedImportClosure(root)) {
    const parts = f.split("/");
    if (parts[1] === "projects") continue;
    out.add(parts.length > 2 ? `src/${parts[1]}` : f);
  }
  return [...out].sort();
}

/** Expands the PROTECTED patterns: `src/projects/example-*` / `study-*` become exactly the pinned public slugs; adds config files and the curated import closure. */
function protectedPaths(publicSlugs, root = rootDir) {
  const out = new Set();
  for (const p of PROTECTED) {
    if (p.startsWith("src/projects/")) continue;
    out.add(p);
  }
  for (const s of publicSlugs) out.add(`src/projects/${s}`);
  try { for (const e of fs.readdirSync(root, { withFileTypes: true })) if (e.isFile() && CONFIG_FILE.test(e.name)) out.add(e.name); } catch { /* no root */ }
  for (const d of curatedDependencyPaths(root)) out.add(d);
  return [...out];
}

function listProtected(root, publicSlugs) {
  const files = [];
  const walk = (abs) => {
    if (!fs.existsSync(abs)) return;
    const st = fs.statSync(abs);
    if (st.isFile()) { if (!/\.pyc$/.test(abs)) files.push(abs); return; }
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) if (!SKIP_DIR.has(e.name)) walk(path.join(abs, e.name));
  };
  protectedPaths(publicSlugs, root).forEach((p) => walk(path.join(root, p)));
  // the lock cannot hash itself: it is protected by the comparison with the committed git HEAD copy instead
  return files.map((f) => path.relative(root, f).replaceAll("\\", "/")).filter((f) => f !== LOCK_REL).sort();
}

export function computeManifest(root = rootDir, publicSlugs = discoverPublicProjects(root)) {
  const files = {};
  for (const rel of listProtected(root, publicSlugs)) files[rel] = hashFile(path.join(root, rel));
  return files;
}

export function writeLock(root = rootDir, lockFile = LOCK_FILE) {
  const publicProjects = discoverPublicProjects(root);
  const files = computeManifest(root, publicProjects);
  fs.mkdirSync(path.dirname(lockFile), { recursive: true });
  fs.writeFileSync(lockFile, `${JSON.stringify({ version: 2, protected: PROTECTED, publicProjects, files }, null, 2)}\n`, "utf-8");
  return { lockFile, count: Object.keys(files).length, publicProjects };
}

const gitLines = (args, root) => {
  try {
    const r = spawnSync("git", args, { cwd: root, encoding: "utf-8" });
    return r.status === 0 ? r.stdout.split(/\r?\n/).filter(Boolean) : null;
  } catch { return null; }
};
/** The lock as committed at git HEAD, or null (not a git repo / not committed yet). */
export function committedLock(root = rootDir) {
  try {
    const r = spawnSync("git", ["show", `HEAD:${LOCK_REL}`], { cwd: root, encoding: "utf-8" });
    return r.status === 0 && r.stdout.trim() ? JSON.parse(r.stdout) : null;
  } catch { return null; }
}

/**
 * Compares the protected files with the lock. Returns { status: "ok" | "tampered" | "no-lock", changed: [{file, kind}], notes: [] }.
 * Unless `dev`, the lock itself must equal the committed git HEAD version (git show HEAD:evals/harness.lock.json): re-pinning the lock after editing
 * the harness is then visible as a mismatch. A lock that is not committed yet (fresh clone of a new harness) only produces a note.
 * Without a lock file it falls back to `git diff --name-only HEAD` over the protected paths.
 */
export function checkIntegrity({ root = rootDir, lockFile = LOCK_FILE, useGit = true, dev = false } = {}) {
  const notes = [];
  if (!fs.existsSync(lockFile)) {
    const dirty = useGit ? gitLines(["diff", "--name-only", "HEAD", "--", ...protectedPaths(discoverPublicProjects(root), root)], root) : null;
    if (dirty === null) return { status: "no-lock", changed: [], notes: ["no evals/harness.lock.json and no git: integrity not checked (run pnpm eval:lock)"] };
    return { status: dirty.length ? "tampered" : "ok", changed: dirty.map((file) => ({ file, kind: "modified (git diff)" })), notes: ["no evals/harness.lock.json: compared with git HEAD"] };
  }
  let lock;
  try { lock = JSON.parse(fs.readFileSync(lockFile, "utf-8")); } catch { return { status: "tampered", changed: [{ file: LOCK_REL, kind: "unreadable lock" }], notes }; }
  const now = computeManifest(root, Array.isArray(lock.publicProjects) ? lock.publicProjects : discoverPublicProjects(root)), was = lock.files ?? {};
  const changed = [];
  for (const [f, h] of Object.entries(now)) { if (!(f in was)) changed.push({ file: f, kind: "added" }); else if (was[f] !== h) changed.push({ file: f, kind: "modified" }); }
  for (const f of Object.keys(was)) if (!(f in now)) changed.push({ file: f, kind: "removed" });
  if (useGit && fs.existsSync(path.join(root, ".git")) && !dev) {
    const head = committedLock(root);
    if (!head) notes.push(`${LOCK_REL} is not committed at git HEAD yet: it cannot be compared with the committed version (commit it)`);
    else if (JSON.stringify(head.files ?? {}) !== JSON.stringify(lock.files ?? {}) || JSON.stringify(head.publicProjects ?? null) !== JSON.stringify(lock.publicProjects ?? null))
      changed.push({ file: LOCK_REL, kind: "differs from the committed git HEAD version (re-pinned after edits?)" });
  } else if (dev) notes.push("--dev: the lock was not compared with git HEAD");
  return { status: changed.length ? "tampered" : "ok", changed, notes };
}

/* ---------- render cross-check helpers (R001) ---------- */

export const MIN_WINDOW_FRAMES = 6, MIN_MOVE_PX = 40, MIN_CHANGED_FRACTION = 0.0005, PIXEL_STEP = 12;

/**
 * From timeline meta (meta.motion runs [fromFrame, toFrame, deltaPx]) and the spec beats: the frame pairs where the timeline CLAIMS something
 * moves a visible distance. One window per (beat, run) overlap; at most 8 windows, spread over the clip.
 */
export function motionWindows(meta, beats = []) {
  const out = [];
  const spans = beats.length ? beats : [{ id: "clip", startFrame: 0, endFrame: meta.totalFrames ?? 0 }];
  for (const [sel, info] of Object.entries(meta.motion ?? {}))
    for (const axis of ["x", "y"])
      for (const [from, to, delta] of info[axis]?.runs ?? []) {
        if (Math.abs(delta) < MIN_MOVE_PX) continue;
        for (const b of spans) {
          const a = Math.max(from, b.startFrame), z = Math.min(to, b.endFrame);
          if (z - a < MIN_WINDOW_FRAMES) continue;
          out.push({ beat: b.id, target: sel, axis, from: a + 1, to: z - 1, claimedPx: Math.round(Math.abs(delta)) });
        }
      }
  out.sort((p, q) => p.from - q.from);
  const dedup = [];
  for (const w of out) if (!dedup.some((d) => Math.abs(d.from - w.from) < 8 && d.beat === w.beat)) dedup.push(w);
  if (dedup.length <= 8) return dedup;
  const step = (dedup.length - 1) / 7;
  return Array.from({ length: 8 }, (_, i) => dedup[Math.round(i * step)]);
}

/** Fraction of pixels whose grey level differs by more than PIXEL_STEP between two same-size RGBA buffers. */
export function changedFraction(a, b) {
  const n = Math.min(a.length, b.length) >> 2;
  if (!n) return 0;
  let changed = 0;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const ga = 0.299 * a[o] + 0.587 * a[o + 1] + 0.114 * a[o + 2];
    const gb = 0.299 * b[o] + 0.587 * b[o + 1] + 0.114 * b[o + 2];
    if (Math.abs(ga - gb) > PIXEL_STEP) changed++;
  }
  return changed / n;
}

/* ---------- judges ---------- */

const norm = (s) => String(s ?? "").toLowerCase().replace(/[^a-z0-9]/g, "");
/** The model suffix of an eval project slug: eval-<task>-<model>. */
export function modelOfSlug(slug, taskId) {
  const prefix = `eval-${taskId}-`;
  return slug.startsWith(prefix) ? slug.slice(prefix.length) : "";
}
/**
 * True when the judge is the model that built the project: a model must not grade its own pictures.
 * The builder is the "evalModel" recorded in the project's spec.json (AGENT_PROMPT tells the agent to write it); without it the slug suffix is used.
 */
export function isSelfJudged(slug, taskId, judge, evalModel) {
  const j = norm(judge);
  const builders = [norm(evalModel), norm(modelOfSlug(slug, taskId))].filter((m) => m.length >= 3);
  return j.length >= 3 && builders.some((m) => j === m || j.includes(m) || m.includes(j));
}

export const JUDGES_FILE = path.join(rootDir, "evals", "judges.json");
/** Resolves --judge against evals/judges.json (id or alias, case-insensitive). Returns the entry or null. */
export function findJudge(name, file = JUDGES_FILE) {
  let list = [];
  try { list = JSON.parse(fs.readFileSync(file, "utf-8")).judges ?? []; } catch { return null; }
  const n = norm(name);
  return list.find((j) => norm(j.id) === n || (j.aliases ?? []).some((a) => norm(a) === n)) ?? null;
}
export const sha256File = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
