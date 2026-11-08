/**
 * STORYBOARD AUDIT (harness v2): every beat carries a machine-checked storyboard card.
 *
 * Usage:
 *   node scripts/storyboard-audit.mjs [--project <slug>]    audit v2 projects ("harness": 2 in spec.json)
 *   node scripts/storyboard-audit.mjs --dir <path>          audit one folder holding spec.json + Scene.tsx
 *   add --json for machine-readable output: { tool, ok, errors, warnings, findings: [{code, severity, frame, target, message, project}], meta }
 *
 * Board (spec.json, beats[].board):
 *   { focal: ".selector", zone: "top-left|center|...", start: "key pose at beat start", end: "key pose at beat end",
 *     text: ["on-screen strings"], transitionIn: "<preset>|cut", why: "<motivation, one clause>" }
 *
 * Rules (message = problem -> principle -> fix, plus a docs/STORYBOARD.md anchor):
 *   SB001 error    v2 beat without `board`, or board missing focal/zone/start/end/why (or an invalid zone)
 *   SB002 error    `focal` matches no static className/id in the JSX (warning when only dynamic classNames could satisfy it)
 *   SB003 error    reading time: words in board.text need more seconds than the beat has (warning when short, error below half the needed time)
 *   SB004 warning  two consecutive beats share focal + zone and the second has no transition (static storytelling)
 *   SB005 warning  a board.text string is not rendered in Scene.tsx
 *   SB006 warning  final beat: no closing message/CTA in board.text, or `why` does not mention the hold
 *   SB007 warning  board.start and board.end are the same sentence (nothing changes in this beat)
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { parseArgs, resolveTargets, isHarnessV2 } from "./lib/projects.mjs";
import { collectJsxInventory, matchSelector, suggestNames } from "./lib/jsx-selectors.mjs";

const require = createRequire(import.meta.url);
const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

export const ZONES = ["top-left", "top-center", "top-right", "middle-left", "middle-center", "middle-right", "bottom-left", "bottom-center", "bottom-right"];
const ZONE_ALIAS = { center: "middle-center", top: "top-center", bottom: "bottom-center", left: "middle-left", right: "middle-right", middle: "middle-center" };
export const normalizeZone = (z) => {
  const s = String(z ?? "").trim().toLowerCase();
  return ZONES.includes(s) ? s : ZONE_ALIAS[s] ?? null;
};

const DOC = "docs/STORYBOARD.md";
export const RULE_DOCS = {
  SB001: `${DOC}#board-fields`,
  SB002: `${DOC}#board-fields`,
  SB003: `${DOC}#reading-time`,
  SB004: `${DOC}#writing-key-poses`,
  SB005: `${DOC}#board-fields`,
  SB006: `${DOC}#board-fields`,
  SB007: `${DOC}#writing-key-poses`,
};

/* ---------- reading time (same rule as src/core/readability-meter.ts: cjk/4.5 + latinWords/15 + 1.5s) ---------- */

const CJK = /[一-鿿㐀-䶿぀-ヿ가-힯]/g;
const WORD = /[a-zA-Z0-9_À-ɏḀ-ỿ]+(?:['’-][a-zA-Z0-9_À-ɏḀ-ỿ]+)*/g;
export function countUnits(text) {
  const clean = String(text ?? "").replace(/<[^>]*>/g, " ");
  const cjkChars = (clean.match(CJK) ?? []).length;
  const latinWords = (clean.replace(CJK, " ").match(WORD) ?? []).length;
  return { cjkChars, latinWords };
}
export const requiredReadingSeconds = (cjk, words) => Math.round(Math.max(1.5, cjk / 4.5 + words / 15 + 1.5) * 100) / 100;

/* ---------- rendered text from the JSX ---------- */

const SKIP = new Set(["loc", "extra", "start", "end"]);
const kids = (n) => Object.keys(n).filter((k) => !SKIP.has(k)).flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]])).filter((c) => c && typeof c.type === "string");
const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const tokens = (s) => norm(s).split(" ").filter(Boolean);

/** Every string literal / JSX text / template chunk in the project's tsx files, as a token set (what could be on screen). */
export function renderedTokens(dir) {
  const { parse } = require("@babel/parser");
  const set = new Set();
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.(tsx|jsx)$/.test(f)) : [];
  for (const f of files) {
    let ast;
    try { ast = parse(fs.readFileSync(path.join(dir, f), "utf-8"), { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { continue; }
    const visit = (n, inImport) => {
      if (n.type === "ImportDeclaration") return;
      if (n.type === "JSXText" || n.type === "StringLiteral") tokens(n.value).forEach((t) => set.add(t));
      if (n.type === "TemplateElement") tokens(n.value.cooked ?? n.value.raw).forEach((t) => set.add(t));
      kids(n).forEach((c) => visit(c, inImport));
    };
    visit(ast.program);
  }
  return set;
}

/* ---------- audit ---------- */

export function auditBoards({ slug, spec, dir }) {
  const findings = [];
  const add = (code, level, frame, problem, fix, target) => findings.push({ code, level, slug, frame, problem, fix, doc: RULE_DOCS[code], target: target ?? null });
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  const fps = spec.fps ?? 60;
  const meta = { beats: beats.length, withBoard: 0, zones: [], focals: [], reading: {} };
  const inv = fs.existsSync(dir) ? collectJsxInventory(dir) : null;
  const rendered = fs.existsSync(dir) ? renderedTokens(dir) : new Set();
  const REQUIRED = ["focal", "zone", "start", "end", "why"];

  beats.forEach((b, i) => {
    const f = b.startFrame ?? 0;
    const bd = b.board;
    if (!bd || typeof bd !== "object") {
      add("SB001", "error", f, `beat "${b.id}" has no storyboard card (spec.json beats[].board)`, `a model that skips the board decides layout while coding (overlaps, tiny UI, wrong story order); add "board": { "focal": ".class", "zone": "center", "start": "<pose at beat start>", "end": "<pose at beat end>", "text": [], "transitionIn": "cut", "why": "<one clause>" } to this beat`, b.id);
      return;
    }
    meta.withBoard++;
    const missing = REQUIRED.filter((k) => typeof bd[k] !== "string" || bd[k].trim().length < 3);
    if (missing.length) add("SB001", "error", f, `beat "${b.id}" board is missing or has empty: ${missing.join(", ")}`, `fill every field with one short sentence (focal = a selector, zone = 3x3 cell, start/end = key poses, why = motivation)`, b.id);
    const zone = normalizeZone(bd.zone);
    if (bd.zone && !zone) add("SB001", "error", f, `beat "${b.id}" board.zone "${bd.zone}" is not a 3x3 zone`, `use one of ${ZONES.join(", ")} (or center/top/bottom/left/right)`, b.id);
    if (zone) meta.zones.push(zone);

    // SB002 focal selector reality
    if (typeof bd.focal === "string" && bd.focal.trim()) {
      meta.focals.push(bd.focal);
      const res = inv?.parsedFiles ? matchSelector(bd.focal, inv) : "maybe";
      if (res !== "match") {
        const known = inv ? [...inv.classes].slice(0, 10).map((c) => `.${c}`).join(" ") || "none" : "none";
        if (res === "none") add("SB002", "error", f, `focal "${bd.focal}" of beat "${b.id}" matches no className/id in Scene.tsx (rendered: ${known}; closest: ${inv ? suggestNames(bd.focal, inv).join(" ") || "none" : "none"})`, `the focal point is the thing the viewer must look at, so it has to exist: give an element className="${(bd.focal.match(/\.([\w-]+)/) ?? [])[1] ?? "name"}" in the JSX or point focal at an existing class`, bd.focal);
        else add("SB002", "warning", f, `focal "${bd.focal}" of beat "${b.id}" cannot be verified: the JSX has dynamic className/props that might provide it`, `use a static className string on the focal element`, bd.focal);
      }
    }

    // SB003 reading time
    const texts = Array.isArray(bd.text) ? bd.text.filter((t) => typeof t === "string") : [];
    if (texts.some((t) => countUnits(t).latinWords + countUnits(t).cjkChars > 0)) {
      const units = texts.reduce((a, t) => { const u = countUnits(t); return { cjk: a.cjk + u.cjkChars, words: a.words + u.latinWords }; }, { cjk: 0, words: 0 });
      const need = requiredReadingSeconds(units.cjk, units.words);
      const have = (b.endFrame - b.startFrame + 1) / fps;
      meta.reading[b.id] = { words: units.words, cjkChars: units.cjk, needSeconds: need, haveSeconds: +have.toFixed(2) };
      if (have + 0.1 < need) {
        const err = have < need * 0.5;
        add("SB003", err ? "error" : "warning", f, `beat "${b.id}" shows ${units.words} word(s)${units.cjk ? ` + ${units.cjk} CJK char(s)` : ""} but lasts ${have.toFixed(2)}s; reading needs about ${need.toFixed(2)}s (1.5s + words/15, CJK chars/4.5)`, `viewers cannot read what leaves before they finish: cut words from board.text, or lengthen the beat in spec.json (and its beat() time) to >= ${need.toFixed(1)}s`, b.id);
      }
    }

    // SB005 rendered text
    for (const t of texts) {
      const toks = tokens(t);
      const miss = toks.filter((k) => !rendered.has(k));
      if (toks.length && miss.length) add("SB005", "warning", f, `board text "${t}" of beat "${b.id}" is not rendered in Scene.tsx (missing: ${miss.slice(0, 4).join(", ")})`, `the board is a promise of what is on screen: render this exact copy in the JSX (text or a const used in JSX) or correct board.text`, b.id);
    }

    // SB007 start == end
    if (typeof bd.start === "string" && typeof bd.end === "string" && norm(bd.start) === norm(bd.end))
      add("SB007", "warning", f, `beat "${b.id}" board.start and board.end are the same sentence`, `a beat is a change of state; write the pose the viewer sees at the start and the different pose at the end (what moved, appeared or resolved)`, b.id);

    // SB004 static storytelling
    const prev = beats[i - 1]?.board;
    if (prev && typeof prev === "object") {
      const cut = !bd.transitionIn || String(bd.transitionIn).trim().toLowerCase() === "cut";
      if (cut && bd.focal && prev.focal === bd.focal && normalizeZone(prev.zone) && normalizeZone(prev.zone) === zone)
        add("SB004", "warning", f, `beats "${beats[i - 1].id}" and "${b.id}" both focus ${bd.focal} in ${zone} with no transition`, `change focus, zone or depth every beat (1.0-1.5s) or name a transitionIn preset (e.g. camera:pushIn) so the story moves`, b.id);
    }
  });

  // SB006 closing beat
  const last = beats[beats.length - 1];
  if (last?.board && typeof last.board === "object") {
    const lt = Array.isArray(last.board.text) ? last.board.text.filter((t) => typeof t === "string" && t.trim()) : [];
    const lf = last.startFrame ?? 0;
    if (!lt.length && beats.some((x) => Array.isArray(x.board?.text) && x.board.text.length)) add("SB006", "warning", lf, `final beat "${last.id}" lists no on-screen text: no closing message/CTA`, `the last beat must carry the message the viewer takes away; put the closing line / CTA in board.text and render it`, last.id);
    if (!/\b(hold|holds|holding|still|static|rest|rests|stillness)\b/i.test(String(last.board.why ?? "")))
      add("SB006", "warning", lf, `final beat "${last.id}" board.why does not mention the hold`, `the closing message must stay still for 1.2s (72 frames); say so in why, e.g. "CTA holds still so it can be read and remembered"`, last.id);
  }
  return { findings, meta };
}

/* ---------- driver ---------- */

const toJson = (f) => ({ code: f.code, severity: f.level, frame: f.frame ?? null, target: f.target ?? null, message: `${f.problem} -> ${f.fix}`, project: f.slug });

function readSpec(specPath) {
  return JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^﻿/, ""));
}

export function auditDir({ slug, dir }) {
  try {
    return auditBoards({ slug, spec: readSpec(path.join(dir, "spec.json")), dir });
  } catch (e) {
    return { findings: [{ code: "SB001", level: "error", slug, frame: 0, problem: `cannot read spec.json: ${e.message}`, fix: "fix spec.json", doc: RULE_DOCS.SB001 }], meta: {} };
  }
}

function main() {
  const argv = process.argv.slice(2);
  const dirIdx = argv.indexOf("--dir");
  let jobs;
  if (dirIdx >= 0) {
    const dir = path.resolve(process.cwd(), argv[dirIdx + 1] ?? "");
    jobs = [{ slug: path.basename(dir), dir }];
  } else {
    jobs = resolveTargets(parseArgs(argv)).filter((t) => isHarnessV2(t)).map((t) => ({ slug: t.slug, dir: t.dir }));
  }
  const results = jobs.map((j) => ({ job: j, ...auditDir(j) }));
  const all = results.flatMap((r) => r.findings);
  const errors = all.filter((f) => f.level === "error").length;

  if (argv.includes("--json")) {
    const meta = Object.fromEntries(results.map((r) => [r.job.slug, r.meta]));
    process.stdout.write(`${JSON.stringify({ tool: "storyboard-audit", ok: errors === 0, errors, warnings: all.length - errors, findings: all.map(toJson), meta: jobs.length === 1 ? { ...meta[jobs[0].slug], project: jobs[0].slug } : meta }, null, 2)}\n`);
    return errors ? 1 : 0;
  }
  console.log(`\n${BOLD}==== STORYBOARD AUDIT (${jobs.length} harness-v2 project${jobs.length === 1 ? "" : "s"}) ====${RESET}`);
  if (!jobs.length) {
    console.log(`${GREEN}${BOLD}[STORYBOARD: SKIPPED]${RESET} no project opts in with "harness": 2.\n`);
    return 0;
  }
  for (const r of results) {
    for (const f of [...r.findings].sort((a, b) => a.frame - b.frame)) {
      const isErr = f.level === "error";
      console.log(`${isErr ? RED : YELLOW}[${f.code}${isErr ? "" : " warning"}]${RESET} ${f.slug} f${f.frame} ${f.problem} → ${f.fix}${f.doc ? ` See ${f.doc}` : ""}`);
    }
    if (!r.findings.length) console.log(`${GREEN}[ok]${RESET} ${r.job.slug}`);
  }
  if (errors) {
    console.log(`\n${RED}${BOLD}[STORYBOARD: FAILED]${RESET} ${errors} error(s), ${all.length - errors} warning(s).\n`);
    return 1;
  }
  console.log(`\n${GREEN}${BOLD}[STORYBOARD: CLEAN]${RESET} ${all.length - errors} warning(s).\n`);
  return 0;
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) process.exit(main());
