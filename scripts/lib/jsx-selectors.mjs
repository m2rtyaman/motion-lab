/**
 * JSX selector reality check (T014): which classNames / ids / tags a project's JSX really renders,
 * and whether a CSS selector used by the timeline can match any of them. Pure static analysis (@babel/parser).
 * Anything we cannot resolve statically (className={cls}, {...props}) is "dynamic": a selector that only
 * fails because of dynamic names is reported as "maybe" (a warning), never as a pass.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

const SKIP_KEYS = new Set(["loc", "extra", "start", "end"]);
const kids = (n) => Object.keys(n).filter((k) => !SKIP_KEYS.has(k)).flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]])).filter((c) => c && typeof c.type === "string");

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return walkFiles(full);
    return /\.(tsx|jsx)$/.test(e.name) ? [full] : [];
  });
}

/**
 * Evaluates a className/id expression to { tokens, patterns, dynamic }.
 * tokens: exact names; patterns: names with dynamic parts ({re}, e.g. `item-${i}` -> /^item-.+$/);
 * dynamic: part of the value is completely unknown. consts: Map name -> init node (any const with an init).
 */
export function evalNames(node, consts = new Map(), depth = 0) {
  const out = { tokens: [], patterns: [], dynamic: false };
  const split = (s) => s.split(/\s+/).filter(Boolean);
  const merge = (r) => { out.tokens.push(...r.tokens); out.patterns.push(...r.patterns); if (r.dynamic) out.dynamic = true; };
  if (!node || depth > 6) { out.dynamic = true; return out; }
  switch (node.type) {
    case "StringLiteral": out.tokens = split(node.value); break;
    case "JSXExpressionContainer": return evalNames(node.expression, consts, depth + 1);
    case "TemplateLiteral": {
      let variants = [""];
      node.quasis.forEach((q, i) => {
        const raw = q.value.cooked ?? q.value.raw;
        variants = variants.map((t) => t + raw);
        if (i >= node.expressions.length) return;
        const r = evalNames(node.expressions[i], consts, depth + 1);
        if (!r.dynamic && !r.patterns.length) variants = (r.tokens.length ? r.tokens : [""]).flatMap((tk) => variants.map((t) => t + tk)).slice(0, 64);
        else if (r.tokens.length || r.patterns.length) { merge(r); variants = variants.map((t) => `${t} `); }
        else variants = variants.map((t) => `${t}\0`);
      });
      for (const text of variants) for (const tok of split(text)) {
        if (!tok.includes("\0")) { out.tokens.push(tok); continue; }
        const parts = tok.split("\0");
        if (parts.join("")) out.patterns.push({ re: new RegExp(`^${parts.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".+")}$`) });
        else out.dynamic = true;
      }
      break;
    }
    case "Identifier": {
      if (node.name === "undefined") break;
      // a project component's forwarded `className` prop: the names come from the call sites (<Card className="x" />), which are inventoried too
      if (node.name === "className" && !consts.get(node.name) && !consts.bound?.get(node.name)) break;
      const bound = consts.bound?.get(node.name);
      if (bound?.length) { out.tokens = [...bound]; break; }
      const init = consts.get(node.name);
      if (init) return evalNames(init, consts, depth + 1);
      out.dynamic = true;
      break;
    }
    case "ConditionalExpression": merge(evalNames(node.consequent, consts, depth + 1)); merge(evalNames(node.alternate, consts, depth + 1)); break;
    case "LogicalExpression":
      if (node.operator !== "&&") merge(evalNames(node.left, consts, depth + 1));
      merge(evalNames(node.right, consts, depth + 1));
      break;
    case "BinaryExpression":
      if (node.operator === "+") {
        const l = evalNames(node.left, consts, depth + 1), r = evalNames(node.right, consts, depth + 1);
        if (!l.dynamic && !r.dynamic && l.tokens.length === 1 && r.tokens.length === 1 && !l.patterns.length && !r.patterns.length) out.tokens.push(l.tokens[0] + r.tokens[0]);
        else { merge(l); merge(r); out.dynamic = true; }
      } else out.dynamic = true;
      break;
    case "ArrayExpression": node.elements.forEach((e) => e && merge(evalNames(e, consts, depth + 1))); break;
    case "ObjectExpression":
      node.properties.forEach((p) => { if (p.key?.type === "Identifier" && !p.computed) out.tokens.push(...split(p.key.name)); else if (p.key?.type === "StringLiteral") out.tokens.push(...split(p.key.value)); else out.dynamic = true; });
      break;
    case "CallExpression": node.arguments.forEach((a) => merge(evalNames(a, consts, depth + 1))); if (node.callee?.type === "MemberExpression") merge(evalNames(node.callee.object, consts, depth + 1)); break;
    case "MemberExpression":
      if (!node.computed && node.property?.name === "className") break; // props.className, see the Identifier case
      out.dynamic = true;
      break;
    case "TSAsExpression": case "TSNonNullExpression": case "ParenthesizedExpression": return evalNames(node.expression, consts, depth + 1);
    case "NumericLiteral": out.tokens = [String(node.value)]; break;
    case "NullLiteral": case "BooleanLiteral": break;
    default: out.dynamic = true;
  }
  return out;
}

/**
 * Primitives that build classNames internally from a prop (`${id}-torso`): a literal scan of the scene cannot see them.
 * Each entry maps the element's props (name -> evalNames result) to the exact class names it renders.
 * RIG_PART_CLASSES mirrors src/primitives/characters/RigCharacter.tsx (a test guards drift against the source and physics.ts).
 */
export const RIG_PART_CLASSES = ["root", "flip", "shadow", "hips", "torso", "head", "brows", "eyes", "pupils",
  "arm-l", "arm-r", "forearm-l", "forearm-r", "thigh-l", "thigh-r", "leg-l", "leg-r", "shin-l", "shin-r", "foot-l", "foot-r"];
export const GENERATED_CLASS_PRIMITIVES = {
  RigCharacter: { prop: "id", classes: (id) => RIG_PART_CLASSES.map((p) => `${id}-${p}`) },
};

const rootOfLib = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..", "..");
const LIB_DIRS = ["src/primitives", "src/engine", "src/world"];

function findComponentFiles(names, root) {
  const found = [];
  const walk = (d) => {
    if (!fs.existsSync(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.tsx$/.test(e.name) && names.has(e.name.replace(/\.tsx$/, ""))) found.push(full);
    }
  };
  LIB_DIRS.forEach((d) => walk(path.join(root, d)));
  return found;
}

/**
 * Static truthiness of an expression: true / false, or undefined when it depends on runtime values. Resolves identifiers declared as
 * `const NAME = <literal>` (not parameter defaults, which a caller can override).
 */
export function staticTruth(node, decl = new Map(), depth = 0) {
  if (!node || depth > 6) return undefined;
  switch (node.type) {
    case "BooleanLiteral": return node.value;
    case "NullLiteral": return false;
    case "NumericLiteral": return node.value !== 0;
    case "StringLiteral": return node.value !== "";
    case "Identifier": {
      if (node.name === "undefined") return false;
      const init = decl.get(node.name);
      return init ? staticTruth(init, decl, depth + 1) : undefined;
    }
    case "UnaryExpression":
      if (node.operator === "!") { const v = staticTruth(node.argument, decl, depth + 1); return v === undefined ? undefined : !v; }
      if (node.operator === "void") return false;
      return undefined;
    case "TSAsExpression": case "TSNonNullExpression": case "ParenthesizedExpression": return staticTruth(node.expression, decl, depth + 1);
    default: return undefined;
  }
}
/** The sub-expressions of a node that can actually run: `false && X`, `true || X`, `false ? X : Y`, `if (false) X` do not evaluate the dead branch. */
export function liveChildren(n, decl) {
  if (n.type === "LogicalExpression") {
    const l = staticTruth(n.left, decl);
    if (n.operator === "&&" && l === false) return [n.left];
    if (n.operator === "||" && l === true) return [n.left];
    if (n.operator === "??" && n.left.type !== "Identifier" && staticTruth(n.left, decl) !== undefined && n.left.type !== "NullLiteral") return [n.left];
  }
  if (n.type === "ConditionalExpression" || n.type === "IfStatement") {
    const t = staticTruth(n.test, decl);
    if (t === true) return [n.test, n.consequent];
    if (t === false) return [n.test, ...(n.alternate ? [n.alternate] : [])];
  }
  return null;
}

/** Why a selector is not allowed in a timeline (plain .class / #id / tag selectors only), or null. */
export function selectorIssue(selector) {
  if (/:/.test(selector)) return "pseudo-classes and :not() cannot be verified against the JSX";
  if (selector.includes("[")) return "attribute selectors cannot be verified against the JSX";
  return null;
}

/** Reads every .tsx/.jsx in `dir` (the project folder) and returns the rendered element inventory. */
export function collectJsxInventory(dir, extraCode = [], root = rootOfLib) {
  const elements = []; // { tag, classes:Set, ids:Set, patterns:[], dynamic:boolean, component:boolean }
  const sources = [...walkFiles(dir).map((f) => fs.readFileSync(f, "utf-8")), ...extraCode];
  let parsed = 0, libLoaded = false;
  for (let si = 0; si < sources.length; si++) {
    const code = sources[si];
    let ast;
    try { ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { continue; }
    parsed++;
    const consts = new Map();
    const decl = new Map();
    const findConsts = (n) => {
      if (n.type === "VariableDeclaration" && n.kind === "const") for (const d of n.declarations) if (d.id?.type === "Identifier" && d.init) { consts.set(d.id.name, d.init); decl.set(d.id.name, d.init); }
      if (n.type === "AssignmentPattern" && n.left?.type === "Identifier" && !consts.has(n.left.name)) consts.set(n.left.name, n.right);
      // arr.map(({ id }) => ...) / arr.map((id) => ...) over a literal array: bind the parameter to every value it can take
      if (n.type === "CallExpression" && n.callee?.type === "MemberExpression" && n.callee.property?.name === "map" && /^(Arrow|Function)/.test(n.arguments[0]?.type ?? "")) {
        let arr = n.callee.object;
        if (arr?.type === "Identifier") arr = consts.get(arr.name);
        const param = n.arguments[0].params?.[0];
        if (arr?.type === "ArrayExpression" && param) {
          const strs = (v) => (v?.type === "StringLiteral" ? [v.value] : v?.type === "Identifier" && consts.get(v.name)?.type === "StringLiteral" ? [consts.get(v.name).value] : []);
          const add = (name, vals) => { if (vals.length) bound.set(name, [...(bound.get(name) ?? []), ...vals]); };
          if (param.type === "Identifier") add(param.name, arr.elements.flatMap(strs));
          else if (param.type === "ObjectPattern")
            for (const pr of param.properties) {
              const key = pr.key?.name, local = pr.value?.type === "AssignmentPattern" ? pr.value.left?.name : pr.value?.name;
              if (!key || !local) continue;
              add(local, arr.elements.flatMap((el) => (el?.type === "ObjectExpression" ? el.properties.filter((q) => q.key?.name === key).flatMap((q) => strs(q.value)) : [])));
            }
        }
      }
      kids(n).forEach(findConsts);
    };
    const bound = new Map();
    consts.bound = bound;
    findConsts(ast.program);
    const visit = (n) => {
      const live = liveChildren(n, decl);
      if (live) { live.forEach(visit); return; } // unreachable JSX (false && <X/>) is not rendered
      if (n.type === "JSXOpeningElement") {
        const nm = n.name;
        const tag = nm.type === "JSXIdentifier" ? nm.name : null;
        const gen = tag && GENERATED_CLASS_PRIMITIVES[tag];
        const el = { tag, component: !tag || /^[A-Z]/.test(tag), classes: new Set(), ids: new Set(), patterns: [], dynamic: false };
        for (const a of n.attributes) {
          if (a.type === "JSXSpreadAttribute") { el.dynamic = true; continue; }
          const an = a.name?.name;
          if (an === "className" || an === "class") { const r = evalNames(a.value, consts); r.tokens.forEach((t) => el.classes.add(t)); el.patterns.push(...r.patterns); if (r.dynamic) el.dynamic = true; }
          else if (an === "id") { const r = evalNames(a.value, consts); r.tokens.forEach((t) => el.ids.add(t)); if (r.dynamic) el.dynamic = true; }
        }
        if (gen) {
          const idAttr = n.attributes.find((a) => a.type === "JSXAttribute" && a.name?.name === gen.prop);
          const r = idAttr ? evalNames(idAttr.value, consts) : { tokens: [], patterns: [], dynamic: true };
          if (!r.dynamic && !r.patterns.length && r.tokens.length) { r.tokens.forEach((id) => gen.classes(id).forEach((c) => el.classes.add(c))); el.generated = true; }
        }
        elements.push(el);
      }
      kids(n).forEach(visit);
    };
    visit(ast.program);
    // after the project's own files: also read the library components the scene renders (their classNames are on screen too)
    if (si === sources.length - 1 && !libLoaded) {
      libLoaded = true;
      // primitives whose generated classes were resolved exactly are not re-read (their loose `${id}-x` patterns would match typos)
      const resolved = new Set(elements.filter((e) => e.generated).map((e) => e.tag));
      const used = new Set(elements.filter((e) => e.tag && /^[A-Z]/.test(e.tag) && !resolved.has(e.tag)).map((e) => e.tag));
      for (const f of findComponentFiles(used, root)) sources.push(fs.readFileSync(f, "utf-8"));
    }
  }
  const classes = new Set(), ids = new Set();
  for (const e of elements) { e.classes.forEach((c) => classes.add(c)); e.ids.forEach((c) => ids.add(c)); }
  return { elements, classes, ids, parsedFiles: parsed, anyDynamic: elements.some((e) => e.dynamic) };
}

/** Splits a CSS selector list into alternatives, each a list of compounds { tag, classes, ids, unknown }. */
export function parseSelector(selector) {
  const alts = [];
  let depth = 0, cur = "";
  for (const ch of selector) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (ch === "," && depth === 0) { alts.push(cur); cur = ""; } else cur += ch;
  }
  alts.push(cur);
  return alts.map((a) => a.trim()).filter(Boolean).map((alt) => {
    const flat = alt.replace(/\s*([>+~])\s*/g, " ").replace(/\s+/g, " ");
    // do not split inside [...] / (...)
    const parts = []; let d = 0, buf = "";
    for (const ch of flat) {
      if (ch === "(" || ch === "[") d++;
      if (ch === ")" || ch === "]") d--;
      if (ch === " " && d === 0) { if (buf) parts.push(buf); buf = ""; } else buf += ch;
    }
    if (buf) parts.push(buf);
    return parts.map((p) => {
      const c = { tag: null, classes: [], ids: [], unknown: false };
      const tagM = p.match(/^(\*|[a-zA-Z][\w-]*)/);
      if (tagM) c.tag = tagM[1] === "*" ? null : tagM[1];
      for (const m of p.matchAll(/([#.])((?:\\.|[\w-])+)/g)) (m[1] === "." ? c.classes : c.ids).push(m[2].replace(/\\/g, ""));
      if (/[\[:]/.test(p)) c.unknown = true;
      return c;
    });
  });
}

const ALWAYS = new Set(["html", "body", ":root"]);

/** "match" | "maybe" (only dynamic names could satisfy it) | "none". */
export function matchSelector(selector, inv) {
  let best = "none";
  for (const alt of parseSelector(selector)) {
    let altRes = "match";
    for (const c of alt) {
      if (c.tag && ALWAYS.has(c.tag)) continue;
      let res = "none";
      for (const e of inv.elements) {
        if (c.tag && !e.component && e.tag !== c.tag) continue;
        const viaPattern = (k) => e.patterns.some((p) => p.re.test(k));
        const has = c.classes.every((k) => e.classes.has(k) || viaPattern(k)) && c.ids.every((k) => e.ids.has(k));
        if (has) { res = "match"; break; }
        if (e.dynamic && res === "none" && (c.classes.length || c.ids.length)) res = "maybe";
      }
      if (res === "none" && c.tag && !c.classes.length && !c.ids.length) res = inv.elements.some((e) => e.component) ? "maybe" : "none";
      if (res === "none") { altRes = "none"; break; }
      if (res === "maybe") altRes = "maybe";
    }
    if (altRes === "match") return "match";
    if (altRes === "maybe") best = "maybe";
  }
  return best;
}

const lev = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
};

/** Existing class names closest to the names a failing selector asked for (for the fix hint). */
export function suggestNames(selector, inv, limit = 4) {
  const wanted = [...selector.matchAll(/[.#]((?:\\.|[\w-])+)/g)].map((m) => m[1]);
  const pool = [...inv.classes].map((c) => `.${c}`).concat([...inv.ids].map((c) => `#${c}`));
  const scored = pool.map((p) => ({ p, d: Math.min(...wanted.map((w) => lev(w, p.slice(1))), 99) })).sort((a, b) => a.d - b.d);
  return scored.slice(0, limit).map((s) => s.p);
}
