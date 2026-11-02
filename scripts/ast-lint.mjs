import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs, resolveTargets, scopeDirs, walk, rootDir } from "./lib/projects.mjs";

/**
 * AST LINTER (Faz 5) — regex değil, gerçek sözdizimi ağacı (@babel/parser).
 * Kural ihlalinde exit 1 + modelin düzeltebileceği "Çözüm →" mesajı.
 *
 * A001 animasyon özelliklerinde (duration/stagger/delay) sihirli sayı
 * A002 yasak ease (linear/none/ease/easeInOut...) ve tanınmayan ease dizesi
 * A003 gsap tween'inde layout özelliği (top/left/width/height/margin/padding)
 * A004 determinizm: Math.random / Date.now / new Date / setTimeout / setInterval / requestAnimationFrame
 * A005 JSX style'da CSS transition/animation (Remotion render'ında kare-kilitsiz)
 * A006 spring damping çok düşük (aşırı zıplama) veya sihirli spring sayıları
 *
 * Kullanım: node scripts/ast-lint.mjs [--project <slug>]; kapsam = motor + seçilen projeler.`n * Muafiyet: animateCamera(...) argümanlarındaki sayılar spec (validate-spec) tarafından
 * doğrulanır; src/core/tokens.ts token tanımıdır.
 */
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");


const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const SKIP_FILES = new Set(["vite-env.d.ts", "registry.generated.ts", "tokens.ts", "HtmlFrameDriver.tsx", "template-manifest.generated.ts"]);
const TIMING_KEYS = new Set(["duration", "stagger", "delay", "repeatDelay"]);
// width, height, borderRadius, strokeDashoffset, attr gerçek nesne morphing'i için serbesttir
const LAYOUT_KEYS = new Set(["top", "left", "right", "bottom", "margin", "padding", "marginTop", "marginLeft", "paddingTop", "paddingLeft"]);
const TWEEN_METHODS = new Set(["to", "from", "fromTo", "set"]);
// "none" ve "linear" daktilo metin akışı, SVG strokeDashoffset çizimi ve sürekli döngüler için serbesttir
const EASE_BANNED = /^(ease|ease-?in|ease-?out|ease-?in-?out|easeInOut|easeIn|easeOut)$/i;
const EASE_OK = /^(none|linear|steps\(\s*\d+\s*\)|(power[1-4]|expo|circ|sine|back|quart|quint|cubic|elastic)\.(in|out|inOut)(\(\s*[\d.,\s]+\s*\))?)$/;
const FORBIDDEN_CALLS = new Set(["setTimeout", "setInterval", "requestAnimationFrame"]);
const MIN_DAMPING = 10;

const violations = [];
const keyName = (p) => (p.key?.type === "Identifier" ? p.key.name : p.key?.type === "StringLiteral" ? p.key.value : null);
const calleeName = (n) => {
  const c = n.callee;
  if (c?.type === "Identifier") return c.name;
  if (c?.type === "MemberExpression" && c.property?.type === "Identifier") return c.property.name;
  return null;
};

function lintFile(file) {
  const rel = path.relative(rootDir, file).replaceAll("\\", "/");
  const code = fs.readFileSync(file, "utf-8");
  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], errorRecovery: false });
  } catch (e) {
    violations.push({ rule: "A000", rel, line: e.loc?.line ?? 1, msg: `ayrıştırılamadı: ${e.message}`, fix: "sözdizimi hatasını düzelt" });
    return;
  }
  const add = (rule, node, msg, fix) => violations.push({ rule, rel, line: node.loc?.start.line ?? 1, msg, fix });

  const visit = (node, ancestors) => {
    if (!node || typeof node.type !== "string") return;

    if (node.type === "ObjectProperty") {
      const k = keyName(node);
      const inCamera = ancestors.some((a) => a.type === "CallExpression" && calleeName(a) === "animateCamera");
      const inTween = ancestors.some((a) => a.type === "CallExpression" && TWEEN_METHODS.has(calleeName(a)));

      // A001: 0s - 10s arası geçerli pozitif sayılar mikro-koreografi için serbesttir; yalnızca negatif veya >10s değerler engellenir
      if (k && TIMING_KEYS.has(k) && node.value.type === "NumericLiteral" && (node.value.value < 0 || node.value.value > 10) && !inCamera)
        add("A001", node, `geçersiz süre/stagger aralığı: ${k}: ${node.value.value}`, `0.01s - 10s arası pozitif sayı veya DURATIONS/TIMING token'ı kullan`);

      if (k === "ease" && node.value.type === "StringLiteral") {
        const v = node.value.value;
        if (EASE_BANNED.test(v)) add("A002", node, `yasak CSS ease: "${v}"`, `EASING token'ı, none/linear veya expo.out / power2.inOut / back.out(1.6) kullan`);
        else if (!EASE_OK.test(v)) add("A002", node, `tanınmayan ease: "${v}"`, "none | linear | steps(N) | power1-4|expo|circ|sine|back|quart|quint|cubic|elastic + .in/.out/.inOut");
      }

      if (k && LAYOUT_KEYS.has(k) && inTween)
        add("A003", node, `gsap tween'inde layout özelliği: ${k}`, "x, y, scale, rotate*, opacity, filter veya nesne morphing için width/height/borderRadius/strokeDashoffset kullan");

      if ((k === "transition" || k === "animation" || k === "animationName") && ancestors.some((a) => a.type === "JSXAttribute" && a.name?.name === "style"))
        add("A005", node, `JSX style'da ${k}`, "kare-kilitli gsap/interpolate kullan; CSS transition/animation render'ı bozar");

      if (k === "damping" && node.value.type === "NumericLiteral") {
        if (node.value.value < MIN_DAMPING) add("A006", node, `damping ${node.value.value} < ${MIN_DAMPING} (aşırı zıplama)`, "SPRING.snappy veya SPRING.rigid kullan");
        else add("A006", node, `sihirli spring sayısı: damping ${node.value.value}`, "src/core/tokens.ts SPRING preset'i kullan");
      }
    }

    if (node.type === "CallExpression") {
      const n = calleeName(node);
      if (node.callee.type === "Identifier" && FORBIDDEN_CALLS.has(n))
        add("A004", node, `${n}() kare-kilitli değil`, "useCurrentFrame() ve frame tabanlı hesap kullan");
      if (node.callee.type === "MemberExpression" && node.callee.object.name === "Math" && n === "random")
        add("A004", node, "Math.random() deterministik değil", "frame/index tohumlu sahte-rastgele fonksiyon kullan");
      if (node.callee.type === "MemberExpression" && node.callee.object.name === "Date" && n === "now")
        add("A004", node, "Date.now() deterministik değil", "frame'den zaman türet");
    }
    if (node.type === "NewExpression" && node.callee.name === "Date")
      add("A004", node, "new Date() deterministik değil", "frame'den zaman türet");

    const next = [...ancestors, node];
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "start" || key === "end" || key === "extra") continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach((c) => visit(c, next));
      else if (child && typeof child === "object") visit(child, next);
    }
  };
  visit(ast.program, []);
}

const targets = resolveTargets(parseArgs());
const files = [...new Set(scopeDirs(targets).flatMap((d) => walk(d, new Set([".ts", ".tsx"]))))].filter((f) => !SKIP_FILES.has(path.basename(f)));
files.forEach(lintFile);

function lintProjectScene(project) {
  if (!fs.existsSync(project.scene) || !fs.existsSync(project.spec)) return;
  const relPath = path.relative(rootDir, project.scene).replaceAll("\\", "/");
  const code = fs.readFileSync(project.scene, "utf-8");
  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(project.spec, "utf-8").replace(/^\uFEFF/, ""));
  } catch {
    return;
  }

  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"], errorRecovery: false });
  } catch {
    return;
  }

  const jsxElements = new Set();
  const collectJSX = (node) => {
    if (!node) return;
    if (node.type === "JSXOpeningElement") {
      if (node.name.type === "JSXIdentifier") {
        jsxElements.add(node.name.name);
      } else if (node.name.type === "JSXMemberExpression" && node.name.property) {
        jsxElements.add(node.name.property.name);
      }
    }
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "start" || key === "end" || key === "extra") continue;
      const child = node[key];
      if (Array.isArray(child)) child.forEach(collectJSX);
      else if (child && typeof child === "object") collectJSX(child);
    }
  };
  collectJSX(ast.program);

  // SLOP-004: Görsel Girdi / componentStack Denetimi
  const expectedWidgets = spec.componentStack || spec.detectedWidgets;
  if (Array.isArray(expectedWidgets) && expectedWidgets.length > 0) {
    for (const widget of expectedWidgets) {
      if (!jsxElements.has(widget)) {
        violations.push({
          rule: "SLOP-004",
          rel: relPath,
          line: 1,
          msg: `Görsel Girdi Denetimi İhlali: spec.json içinde belirtilen '${widget}' bileşeni Scene.tsx içinde JSX öğesi olarak kullanılmadı.`,
          fix: `<${widget} ... /> bileşenini sahneye entegre edin veya spec.json'daki componentStack listesini güncelleyin.`
        });
      }
    }
  }

  // SLOP-001: Boş Alan (Dead Space) Denetimi (editorial-ui)
  if (spec.mode === "editorial-ui") {
    const STRUCTURAL_SHELLS = [
      "SpatialCamera",
      "CameraRig",
      "AppShell",
      "BrowserFrame",
      "SpotlightStage",
      "BentoGrid",
      "VirtualCanvas",
      "WorldStage",
      "BackdropField",
      "RoughCanvas",
    ];
    const isStageOrRig = Array.from(jsxElements).some((el) =>
      STRUCTURAL_SHELLS.includes(el) ||
      /(Stage|Camera|Rig|Frame|Canvas|Grid|Shell|Field)$/.test(el)
    );
    const hasCameraRigClass = /camera-rig|camera-3d|stage-container/i.test(code);
    const hasStructure = isStageOrRig || hasCameraRigClass;

    if (!hasStructure) {
      violations.push({
        rule: "SLOP-001",
        rel: relPath,
        line: 1,
        msg: "Boş Alan (Dead Space) İhlali: Sahne yapısal bir iskelet veya sahne motoru içermiyor (yalnızca tek bir kart veya düz zemin kullanılamaz).",
        fix: "<CameraRig>, <SpatialCamera>, <BackdropField>, <VirtualCanvas> veya kendi özgün Stage/Canvas bileşeninizi kullanın.",
      });
    }
  }

  // SLOP-005: Katman Çıkış / Hayalet Eleman Denetimi (Anti-Ghosting Layer Exit)
  const OVERLAY_WIDGETS = ["ModalDialog", "SlideOverDrawer"];
  const activeOverlays = OVERLAY_WIDGETS.filter((w) => jsxElements.has(w));
  if (activeOverlays.length > 1) {
    // Birden fazla örtücü katman varsa, aynı anda görünmemeli (isOpen koşulu veya beat kontrolü)
    if (!code.includes("isOpen") && !code.includes("currentBeat") && !code.includes("activeModal")) {
      violations.push({
        rule: "SLOP-005",
        rel: relPath,
        line: 1,
        msg: `Katman Çakışması İhlali: Sahne birden fazla overlay içeriyor (${activeOverlays.join(", ")}) ancak dinamik görünürlük koşulu (isOpen/currentBeat) bulunamadı.`,
        fix: "Overlay bileşenlerine `isOpen={...}` prop'u geçerek beat bazlı açılıp kapanmalarını sağlayın."
      });
    }
  }
}

targets.forEach(lintProjectScene);

console.log(`\n${BOLD}==== AST LINTER v2 (${files.length} dosya, ${targets.length} proje) ====${RESET}`);
if (violations.length) {
  violations.forEach((v) => console.log(`${RED}${BOLD}[${v.rule}] ${v.rel}:${v.line}${RESET} ${v.msg}\n   Çözüm → ${v.fix}\n`));
  console.log(`${RED}${BOLD}[AST: BAŞARISIZ] ${violations.length} ihlal. Düzeltilene kadar çıktı geçersizdir.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[AST: TEMİZ]${RESET} sihirli süre yok, yasak ease yok, layout tween yok, deterministik.\n`);
