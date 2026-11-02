import fs from "node:fs";
import { createRequire } from "node:module";
import { parseArgs, resolveTargets, rel } from "./lib/projects.mjs";

/**
 * MOTION AUDIT (audit:motion) - "slayt gösterisi" dedektörü.
 * Diğer linter'lar kod hijyenini denetler; bu kapı HAREKET KALİTESİNİ denetler.
 *
 * M001 çok beat'li projede hiç geçiş (transition*) çağrısı yok       -> sert kesme
 * M002 beat'e bağlı `{isBeatX && <Scene/>}` / `frame >= N && <X/>`   -> unmount ile kesme
 * M003 3+ beat'te tek tip geçiş (çeşitlilik yok)                      -> monoton
 * M004 geçiş sayısı < beat sayısı - 1 (bazı beat sınırları çıplak)    -> kesik sınır
 * M005 spec.theme.surfaceMode tanımsız                                -> tema sözleşmesi yok
 * M006 tüm sahne tek koyu zeminde (3+ beat, hardcode #0x… zemin)     -> tekdüze stil (uyarı)
 *
 * spec.json içinde `"legacy": true` olan projelerde ihlaller UYARI olur (migrasyon borcu).
 * Kullanım: node scripts/motion-audit.mjs [--project <slug>]
 */
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");

const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const TRANSITION_FNS = ["transitionWhipPan", "transitionMaskWipe", "transitionZoomPunch", "transitionContainerMorph"];
const isTransitionFn = (name) =>
  typeof name === "string" &&
  (/^transition[A-Z]\w*/.test(name) ||
    TRANSITION_FNS.includes(name) ||
    /Morph|Wipe|Pan|Punch|Sweep|Dissolve/.test(name));
const BEAT_GATE = /(^|\.)(is[A-Z]\w*|beat\w*|\w*Beat\w*|currentBeat|activeBeat)\b|\bframe\b\s*[<>]=?/;

const args = parseArgs();
const targets = resolveTargets(args);
const issues = [];

function walkAst(node, fn, parents = []) {
  if (!node || typeof node.type !== "string") return;
  fn(node, parents);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "start" || key === "end") continue;
    const v = node[key];
    if (Array.isArray(v)) v.forEach((c) => walkAst(c, fn, [...parents, node]));
    else if (v && typeof v === "object") walkAst(v, fn, [...parents, node]);
  }
}

function auditProject(t) {
  const spec = JSON.parse(fs.readFileSync(t.spec, "utf-8"));
  const legacy = spec.legacy === true;
  const file = rel(t.scene);
  const code = fs.readFileSync(t.scene, "utf-8");
  const add = (rule, line, msg, fix, hard = true) =>
    issues.push({ rule, file, line, msg, fix, level: hard && !legacy ? "error" : "warn", slug: t.slug });

  // continuousShot: bilinçli tek-plan (kesme yok) - geçiş zorunlu değil, beat sınırlarını kamera taşır.
  const beats = spec.continuousShot === true ? 1 : spec.beats?.length ?? 0;
  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  } catch (e) {
    add("M000", e.loc?.line ?? 1, `ayrıştırılamadı: ${e.message}`, "sözdizimini düzelt");
    return;
  }

  const used = new Set();
  const calls = [];
  const gatedMounts = [];
  walkAst(ast, (n) => {
    if (n.type === "CallExpression") {
      const c = n.callee;
      const name = c.type === "Identifier" ? c.name : c.type === "MemberExpression" ? c.property?.name : null;
      if (name && isTransitionFn(name)) {
        used.add(name);
        calls.push(n.loc?.start.line ?? 1);
      }
    }
    if (n.type === "LogicalExpression" && n.operator === "&&" && n.right.type === "JSXElement") {
      const left = code.slice(n.left.start, n.left.end);
      if (BEAT_GATE.test(left)) gatedMounts.push({ line: n.loc?.start.line ?? 1, left });
    }
  });

  if (beats >= 2 && used.size === 0)
    add("M001", 1, `${beats} beat var ama hiç transition çağrısı yok (sert kesme).`, "src/core/transitions.ts: transitionWhipPan / MaskWipe / ZoomPunch / ContainerMorph kullan.");

  for (const g of gatedMounts)
    add("M002", g.line, `Beat'e bağlı unmount: \`${g.left.slice(0, 40)} && <…/>\` sahneyi kesiyor.`, "Beat'leri daima mount et; görünürlüğü GSAP opacity/transform/clip-path ile geçiş penceresinde sür.");

  if (beats >= 3 && used.size === 1)
    add("M003", [...calls][0], `${beats} beat için tek tip geçiş (${[...used][0]}).`, "En az 2 farklı geçiş tipi kullan (whip-pan + mask-wipe + zoom-punch + morph).");

  if (beats >= 2 && used.size > 0 && calls.length < beats - 1)
    add("M004", calls[0], `${calls.length} geçiş / ${beats - 1} beat sınırı: bazı sınırlar çıplak.`, "Her beat sınırına bir geçiş ata.");

  if (!spec.theme?.surfaceMode)
    add("M005", 1, "spec.theme.surfaceMode tanımsız.", 'spec.json -> "theme": { "surfaceMode": "light|dark|vibrant-brand|editorial-warm" }', false);

  const darkHex = (code.match(/#0[0-9a-fA-F]{5}\b/g) ?? []).length;
  const hasColorBlocking =
    code.includes("beatPalettes") ||
    code.includes("WHATSAPP_COLOR_BLOCK_THEME") ||
    (code.includes("#00A884") && (code.includes("#F5F2EF") || code.includes("#F0F2F5")));
  if (beats >= 3 && darkHex >= 4 && !/(THEME|theme)/.test(code) && !hasColorBlocking)
    add("M006", 1, "Tema sözleşmesi veya Renk Kontrastı (Color Blocking) kullanılmadan tekdüze koyu zemin.", "src/core/theme-contract.ts presetlerinden (WHATSAPP_COLOR_BLOCK_THEME, LIGHT_SAAS_THEME, …) ve beatPalettes kontrast renk bloklarından yararlan.", false);

  // M007: Büyük darbe öncesi öngörülü durgunluk kontrolü (Anticipatory Stillness 300-500ms)
  const hasShake = (spec.shakes && spec.shakes.length > 0) || code.includes("impactShake");
  const hasAnticipation =
    code.includes("anticipation") ||
    code.includes("cursorClickImpulse") ||
    code.includes("windUp") ||
    (spec.camera && spec.camera.some((c) => c.intent && /durgun|hazırlık|nefes/i.test(c.intent)));
  if (hasShake && !hasAnticipation) {
    add("M007", 1, "Darbe sarsıntısı var ancak öncesinde 300-500ms öngörülü durgunluk (anticipation) bulunamadı.", "Büyük darbeden hemen önce 300-500ms mikro-durgunluk bırakarak etkiyi katlayın.", false);
  }

  // M008: Organik kavisli imleç kontrolü (Curved Cursor Path)
  const hasCursor = /cursor/i.test(code);
  const hasCurvedPath =
    code.includes("cursorNaturalPath") ||
    code.includes("createCurvedCursorTrajectory") ||
    code.includes("bezier") ||
    code.includes("rotateZ");
  if (hasCursor && !hasCurvedPath) {
    add("M008", 1, "İmleç animasyonu düz doğrusal hatta hareket ediyor.", "İnsansı imleç hareketi için kavisli yörünge (cursorNaturalPath / createCurvedCursorTrajectory) kullanın.", false);
  }

  // M009: Ardıl hareket ve basamaklama kontrolü (Follow-Through Stagger)
  const hasMultiItems = code.includes(".card") || code.includes(".item") || code.includes("Badge") || code.includes("Metric");
  const hasStagger = code.includes("stagger") || code.includes("depthStaggerReveal") || code.includes("TIMING.itemStagger");
  if (hasMultiItems && !hasStagger && beats >= 2) {
    add("M009", 1, "Çoklu kart/liste elemanları eşzamanlı blok olarak hareket ediyor.", "Disney follow-through gereği elemanları TIMING.itemStagger ile basamaklandırın.", false);
  }
}

targets.forEach(auditProject);

console.log(`\n${BOLD}==== MOTION AUDIT (${targets.length} proje) ====${RESET}`);
const errors = issues.filter((i) => i.level === "error");
for (const i of issues) {
  const c = i.level === "error" ? RED : YELLOW;
  console.log(`${c}${BOLD}[${i.rule}${i.level === "warn" ? " uyarı" : ""}] ${i.file}:${i.line}${RESET} ${i.msg}\n   Çözüm → ${i.fix}\n`);
}
if (errors.length) {
  console.log(`${RED}${BOLD}[MOTION: BAŞARISIZ] ${errors.length} ihlal. Geçişsiz/kesik kurgu kabul edilmez.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[MOTION: TEMİZ]${RESET} geçişler var, beat'ler unmount ile kesilmiyor${issues.length ? ` (${issues.length} uyarı)` : ""}.\n`);
