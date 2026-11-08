import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { parseArgs, resolveTargets, scopeDirs, walk, rootDir, isHarnessV2 } from "./lib/projects.mjs";

/**
 * AST LINTER (Phase 5) — a real syntax tree (@babel/parser), not regex.
 * On rule violation: exit 1 + a "Fix →" message the model can act on.
 *
 * A001 magic number in animation properties (duration/stagger/delay)
 * A002 banned ease (linear/none/ease/easeInOut...) and unrecognized ease string
 * A003 layout property in a gsap tween (top/left/width/height/margin/padding)
 * A004 determinizm: Math.random / Date.now / new Date / setTimeout / setInterval / requestAnimationFrame
 * A005 CSS transition/animation in JSX style (not frame-locked in the Remotion render)
 * A006 spring damping too low (excess bounce) or magic spring numbers
 *
 * Usage: node scripts/ast-lint.mjs [--project <slug>]; scope = engine + selected projects.`n * Exemption: numbers in animateCamera(...) arguments are verified by spec (validate-spec)
 * are verified; src/core/tokens.ts is the token definition.
 */
const require = createRequire(import.meta.url);
const { parse } = require("@babel/parser");


const RED = "\x1b[31m", GREEN = "\x1b[32m", YELLOW = "\x1b[33m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const SKIP_FILES = new Set(["vite-env.d.ts", "registry.generated.ts", "tokens.ts", "HtmlFrameDriver.tsx", "template-manifest.generated.ts"]);
const TIMING_KEYS = new Set(["duration", "stagger", "delay", "repeatDelay"]);
// width, height, borderRadius, strokeDashoffset and attr are allowed for real object morphing
const LAYOUT_KEYS = new Set(["top", "left", "right", "bottom", "margin", "padding", "marginTop", "marginLeft", "paddingTop", "paddingLeft"]);
const TWEEN_METHODS = new Set(["to", "from", "fromTo", "set"]);
// "none" and "linear" are allowed for typewriter text flow, SVG strokeDashoffset drawing and continuous loops
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
    violations.push({ rule: "A000", rel, line: e.loc?.line ?? 1, msg: `could not parse: ${e.message}`, fix: "fix the syntax error" });
    return;
  }
  const add = (rule, node, msg, fix) => violations.push({ rule, rel, line: node.loc?.start.line ?? 1, msg, fix });

  const visit = (node, ancestors) => {
    if (!node || typeof node.type !== "string") return;

    if (node.type === "ObjectProperty") {
      const k = keyName(node);
      const inCamera = ancestors.some((a) => a.type === "CallExpression" && calleeName(a) === "animateCamera");
      const inTween = ancestors.some((a) => a.type === "CallExpression" && TWEEN_METHODS.has(calleeName(a)));

      // A001: valid positive numbers between 0s and 10s are allowed for micro-choreography; only negative or >10s values are blocked
      if (k && TIMING_KEYS.has(k) && node.value.type === "NumericLiteral" && (node.value.value < 0 || node.value.value > 10) && !inCamera)
        add("A001", node, `invalid duration/stagger range: ${k}: ${node.value.value}`, `use a positive number between 0.01s and 10s, or a DURATIONS/TIMING token`);

      if (k === "ease" && node.value.type === "StringLiteral") {
        const v = node.value.value;
        if (EASE_BANNED.test(v)) add("A002", node, `banned CSS ease: "${v}"`, `use an EASING token, none/linear, or expo.out / power2.inOut / back.out(1.6)`);
        else if (!EASE_OK.test(v)) add("A002", node, `unrecognized ease: "${v}"`, "none | linear | steps(N) | power1-4|expo|circ|sine|back|quart|quint|cubic|elastic + .in/.out/.inOut");
      }

      if (k && LAYOUT_KEYS.has(k) && inTween)
        add("A003", node, `layout property in gsap tween: ${k}`, "use x, y, scale, rotate*, opacity, filter; for object morphing use width/height/borderRadius/strokeDashoffset");

      if ((k === "transition" || k === "animation" || k === "animationName") && ancestors.some((a) => a.type === "JSXAttribute" && a.name?.name === "style"))
        add("A005", node, `JSX style ${k}`, "use frame-locked gsap/interpolate; CSS transition/animation breaks the render");

      if (k === "damping" && node.value.type === "NumericLiteral") {
        if (node.value.value < MIN_DAMPING) add("A006", node, `damping ${node.value.value} < ${MIN_DAMPING} (excess bounce)`, "use SPRING.snappy or SPRING.rigid");
        else add("A006", node, `magic spring number: damping ${node.value.value}`, "use a SPRING preset from src/core/tokens.ts");
      }
    }

    if (node.type === "JSXAttribute" && node.name?.name === "className") {
      let rawClass = "";
      if (node.value?.type === "StringLiteral") rawClass = node.value.value;
      else if (node.value?.type === "JSXExpressionContainer" && node.value.expression?.type === "TemplateLiteral") {
        rawClass = node.value.expression.quasis.map((q) => q.value.raw).join(" ");
      }
      const forbiddenTw = rawClass.match(/\b(animate-(?:pulse|ping|spin|bounce)|transition-(?:all|opacity|transform|colors))\b/);
      if (forbiddenTw) {
        add(
          "A005b",
          node,
          `non-frame-locked Tailwind CSS animation/transition in JSX className: "${forbiddenTw[1]}"`,
          "CSS keyframe/transition is not deterministic in Remotion; use useCurrentFrame() + Math.sin(frame) or a GSAP timeline"
        );
      }
    }

    if (node.type === "CallExpression") {
      const n = calleeName(node);
      if (node.callee.type === "Identifier" && FORBIDDEN_CALLS.has(n))
        add("A004", node, `${n}() is not frame-locked`, "use useCurrentFrame() and frame-based calculation");
      if (node.callee.type === "MemberExpression" && node.callee.object.name === "Math" && n === "random")
        add("A004", node, "Math.random() is not deterministic", "use a pseudo-random function seeded by frame/index");
      if (node.callee.type === "MemberExpression" && node.callee.object.name === "Date" && n === "now")
        add("A004", node, "Date.now() is not deterministic", "derive time from the frame");
    }
    if (node.type === "NewExpression" && node.callee.name === "Date")
      add("A004", node, "new Date() is not deterministic", "derive time from the frame");

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

// Flags: --dir <folder> lints one folder holding spec.json + Scene.tsx (engine dirs skipped);
//        --json prints { ok, errors, findings: [{code, severity, frame, target, message}], meta } instead of text.
const argvAll = process.argv.slice(2);
const JSON_MODE = argvAll.includes("--json");
const dirIdx = argvAll.indexOf("--dir");
const metaOut = {};
let targets, files;
if (dirIdx >= 0) {
  const dir = path.resolve(process.cwd(), argvAll[dirIdx + 1] ?? "");
  targets = [{ slug: path.basename(dir), dir, spec: path.join(dir, "spec.json"), scene: path.join(dir, "Scene.tsx") }];
  files = walk(dir, new Set([".ts", ".tsx"])).filter((f) => !SKIP_FILES.has(path.basename(f)));
} else {
  targets = resolveTargets(parseArgs());
  files = [...new Set(scopeDirs(targets).flatMap((d) => walk(d, new Set([".ts", ".tsx"]))))].filter((f) => !SKIP_FILES.has(path.basename(f)));
}
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

  // SLOP-004: Visual Input / componentStack check
  const expectedWidgets = spec.componentStack || spec.detectedWidgets;
  if (Array.isArray(expectedWidgets) && expectedWidgets.length > 0) {
    for (const widget of expectedWidgets) {
      if (!jsxElements.has(widget)) {
        violations.push({
          rule: "SLOP-004",
          rel: relPath,
          line: 1,
          msg: `Visual Input Check Violation: component '${widget}' specified in spec.json is not used as a JSX element in Scene.tsx.`,
          fix: `Integrate the <${widget} ... /> component into the scene, or update the componentStack list in spec.json.`
        });
      }
    }
  }

  // SLOP-001: Dead Space check (editorial-ui)
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
      "FullScreenStage",
      "FullBleedStage",
      "AuthenticBrandShell",
      "YouTubeStage",
      "BrandStage",
      "CinemaStage",
      "WatchPageShell",
      "BrandCanvas",
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
        msg: "Dead Space Violation: scene has no structural skeleton or scene engine (a single card or flat background alone is not acceptable).",
        fix: "<CameraRig>, <SpatialCamera>, <BackdropField>, <VirtualCanvas> or your own original Stage/Canvas component.",
      });
    }
  }

  // SLOP-005: Layer Exit / Ghost Element check (Anti-Ghosting Layer Exit)
  const OVERLAY_WIDGETS = ["ModalDialog", "SlideOverDrawer"];
  const activeOverlays = OVERLAY_WIDGETS.filter((w) => jsxElements.has(w));
  if (activeOverlays.length > 1) {
    // If multiple overlay layers exist, they must not be visible at the same time (isOpen condition or beat check)
    if (!code.includes("isOpen") && !code.includes("currentBeat") && !code.includes("activeModal")) {
      violations.push({
        rule: "SLOP-005",
        rel: relPath,
        line: 1,
        msg: `Layer Collision Violation: scene contains multiple overlays (${activeOverlays.join(", ")}) but no dynamic visibility condition (isOpen/currentBeat) was found.`,
        fix: "Pass `isOpen={...}` prop to the overlay components to make them open and close per beat."
      });
    }
  }
}

/**
 * Harness v2 component allowlist (opt-in via spec.harness === 2).
 * V2-001 Scene must export buildTimeline and call useRemotionGSAP(buildTimeline)
 * V2-002 imports restricted to react / remotion / gsap / src/core / src/primitives/curated (+ characters/RigCharacter) / own project dir;
 *        importing a @deprecated primitive is an error pointing at docs/COMPONENT_GALLERY.md
 * V2-003 at most MAX_LOCAL_COMPONENTS locally defined components (each <= MAX_COMPONENT_LINES lines)
 * V2-004 no direct gsap.to/from/fromTo/set/timeline calls (they bypass the seeked timeline + audit)
 * V2-005 no frame-driven styling in React: `spring` is banned; values derived from useCurrentFrame() (interpolate, Math.sin(frame), ...) may only
 *        reach the JSX as plain text (e.g. a counter {value.toLocaleString()}), never a style/className/prop, a condition or a mounted element.
 *        useVideoConfig is fine for width/height/fps reads. Motion belongs in buildTimeline, where the audits can see it.
 * Project components folder (src/projects/<slug>/components/*.tsx), presentational only:
 * V2-008 structure: <= MAX_COMPONENT_FILES .tsx files (no subfolders), each <= MAX_COMPONENT_FILE_LINES lines, exports are components or types only, no import of ../Scene
 * V2-009 no gsap / useRemotionGSAP / presets / physics / useCurrentFrame / interpolate / spring (motion lives in Scene.tsx's buildTimeline)
 * V2-010 text >= MIN_TEXT_PX (numeric fontSize, text-[Npx], text-xs, text-sm)
 * V2-011 no raw colors (#hex, rgb(), hsl(), oklch(), Tailwind palette names, named colors): take them from the theme prop / tokens / var(--x); black/white rgba() hairlines are allowed
 * V2-012 every exported component forwards `className` to its root element (the root is an element, not a fragment)
 * Timers/random (A004) and environment sniffing (V2-006) already cover every project file, components/ included.
 */
const BANNED_GSAP_CALLS = new Set(["to", "from", "fromTo", "set", "timeline"]);
const MAX_LOCAL_COMPONENTS = 2;
const MAX_COMPONENT_LINES = 40;
const MAX_COMPONENT_FILES = 6;
const MAX_COMPONENT_FILE_LINES = 120;
const MIN_TEXT_PX = Number((fs.readFileSync(path.join(rootDir, "src", "core", "tokens.ts"), "utf-8").match(/export const MIN_TEXT_PX\s*=\s*(\d+)/) ?? [])[1] ?? 18);
const ALLOWED_PACKAGES = new Set(["react", "react/jsx-runtime", "remotion", "gsap"]);
const isInside = (child, parent) => {
  const r = path.relative(parent, child);
  return r === "" || (!r.startsWith("..") && !path.isAbsolute(r));
};



/** Curated entry points: the only src/primitives modules a v2 project may import. */
const CURATED_ENTRIES = ["curated", path.join("characters", "RigCharacter")].map((p) => path.join(rootDir, "src", "primitives", p));
const stripModuleExt = (p) => p.replace(/\.(tsx?|jsx?|mjs)$/, "").replace(/[\\/]index$/, "");
/** Names exported with a @deprecated JSDoc tag anywhere in src/primitives (legacy looks). */
const DEPRECATED_PRIMITIVES = (() => {
  const names = new Set();
  for (const f of walk(path.join(rootDir, "src", "primitives"), new Set([".ts", ".tsx"]))) {
    const code = fs.readFileSync(f, "utf-8");
    for (const m of code.matchAll(/\/\*\*(?:(?!\*\/)[\s\S])*?@deprecated(?:(?!\*\/)[\s\S])*\*\/\s*export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g)) names.add(m[1]);
  }
  return names;
})();
/** zz-gallery renders every primitive (legacy included) for grading; it is the one project allowed to import them. */
const isLegacyGallery = (project) => path.resolve(project.dir) === path.join(rootDir, "src", "projects", "zz-gallery");
/** null when `abs` (a resolved import inside src/primitives) is a curated entry point, else { msg, fix }. */
function primitivesIssue(abs, src, specifiers) {
  if (CURATED_ENTRIES.includes(stripModuleExt(abs))) return null;
  const names = (specifiers ?? []).map((sp) => sp.imported?.name ?? sp.imported?.value ?? sp.local?.name).filter(Boolean);
  const dep = names.filter((x) => DEPRECATED_PRIMITIVES.has(x));
  if (dep.length) return { msg: `${dep.join(", ")} ${dep.length > 1 ? "are" : "is"} @deprecated (legacy look, not for harness v2): see docs/COMPONENT_GALLERY.md for the curated replacement`, fix: "import a curated primitive from src/primitives/curated instead (docs/COMPONENT_GALLERY.md lists what each one is for), or build the piece in the project's components/ folder" };
  return { msg: `"${src}" is not a curated primitive entry point`, fix: "import primitives only from src/primitives/curated (and src/primitives/characters/RigCharacter); see docs/COMPONENT_GALLERY.md" };
}

const TRIG = new Set(["sin", "cos", "tan", "atan2", "asin", "acos"]);
const IGNORE_KEYS = new Set(["loc", "extra", "start", "end"]);
const childNodes = (n) => Object.keys(n).filter((k) => !IGNORE_KEYS.has(k)).flatMap((k) => (Array.isArray(n[k]) ? n[k] : [n[k]])).filter((c) => c && typeof c.type === "string");
const bindingNames = (id, out = []) => {
  if (!id) return out;
  if (id.type === "Identifier") out.push(id.name);
  else if (id.type === "ObjectPattern") id.properties.forEach((p) => bindingNames(p.value ?? p.argument, out));
  else if (id.type === "ArrayPattern") id.elements.forEach((e) => bindingNames(e, out));
  else if (id.type === "AssignmentPattern") bindingNames(id.left, out);
  else if (id.type === "RestElement") bindingNames(id.argument, out);
  return out;
};

/** V2-005: finds frame-driven values (useCurrentFrame / useRemotionGSAP().frame and everything computed from them) and where they flow. */
function checkFrameDriven(ast, add) {
  const declarators = [];
  const collect = (n) => { if (n.type === "VariableDeclarator") declarators.push(n); childNodes(n).forEach(collect); };
  collect(ast.program);
  const isFrameCall = (n) => n.type === "CallExpression" && n.callee?.type === "Identifier" && n.callee.name === "useCurrentFrame";
  const hasFrameCall = (n) => isFrameCall(n) || childNodes(n).some(hasFrameCall);
  const tainted = new Set();
  const refsTainted = (n) => (n.type === "Identifier" && tainted.has(n.name)) || (n.type === "MemberExpression" && !n.computed && n.property?.name === "frame" && n.object?.type === "Identifier" && tainted.has(`${n.object.name}.`)) || childNodes(n).some(refsTainted);
  // useRemotionGSAP(...) returns { frame }: its `frame` binding (or the whole result object) is frame-driven
  for (const d of declarators) {
    if (d.init?.type === "CallExpression" && d.init.callee?.name === "useRemotionGSAP") {
      if (d.id.type === "ObjectPattern") for (const p of d.id.properties) { if (p.key?.name === "frame") bindingNames(p.value).forEach((x) => tainted.add(x)); }
      else if (d.id.type === "Identifier") tainted.add(`${d.id.name}.`);
    }
  }
  for (let changed = true; changed; ) {
    changed = false;
    for (const d of declarators) {
      if (!d.init) continue;
      const names = bindingNames(d.id);
      if (names.every((x) => tainted.has(x))) continue;
      if (hasFrameCall(d.init) || refsTainted(d.init)) { names.forEach((x) => tainted.add(x)); changed = true; }
    }
  }
  const isSource = (n) => isFrameCall(n) || (n.type === "Identifier" && tainted.has(n.name)) || (n.type === "MemberExpression" && !n.computed && n.property?.name === "frame" && n.object?.type === "Identifier" && tainted.has(`${n.object.name}.`));
  const tagOf = (el) => el?.openingElement?.name?.name ?? "element";
  const visit = (n, anc, parent, key) => {
    const isDeclPos = (n.type === "Identifier") && ((parent?.type === "VariableDeclarator" && key === "id") || (parent?.type === "ObjectProperty" && key === "key" && !parent.computed) || (parent?.type === "MemberExpression" && key === "property" && !parent.computed) || /Function|Pattern|ImportSpecifier|JSXAttribute/.test(parent?.type ?? "") && key !== "body");
    if (n.type === "CallExpression" && n.callee?.type === "MemberExpression" && n.callee.object?.name === "Math" && TRIG.has(n.callee.property?.name) && n.arguments.some((a) => refsTainted(a) || hasFrameCall(a)))
      add("V2-005", n, `Math.${n.callee.property.name}() of the frame: a hand-written animation curve in React`, "animate in buildTimeline with presets/physics (emphasize 'pulse', camera 'drift', physics helpers) so the timeline audit can see it");
    if (!isDeclPos && isSource(n)) {
      let attr = null, container = null;
      for (let i = anc.length - 1; i >= 0; i--) {
        if (anc[i].type === "JSXAttribute") { attr = anc[i]; break; }
        if (anc[i].type === "JSXExpressionContainer" && /^JSX(Element|Fragment)$/.test(anc[i - 1]?.type ?? "")) { container = { node: anc[i], idx: i }; break; }
      }
      if (attr) {
        const el = [...anc].reverse().find((a) => a.type === "JSXOpeningElement");
        add("V2-005", n, `frame-driven value reaches the "${attr.name?.name}" prop of <${el?.name?.name ?? "element"}>: that is animation done in React, bypassing buildTimeline and every timeline audit`, "put the motion in buildTimeline (enter/exit/emphasize/camera/physics presets) and keep the JSX static; a frame-derived value may only appear as plain text, e.g. a counter {value.toLocaleString()}");
      } else if (container) {
        const bad = (m) => /^(JSXElement|JSXFragment|LogicalExpression|ConditionalExpression)$/.test(m.type) || (m.type === "CallExpression" && m.callee?.property?.name === "map") || childNodes(m).some(bad);
        if (bad(container.node.expression))
          add("V2-005", n, `frame-driven value decides what is rendered (${tagOf(anc[container.idx - 1])} child): showing or hiding elements by frame is animation done in React`, "use enter/exit presets in buildTimeline instead of mounting/unmounting by frame");
      }
    }
    const next = [...anc, n];
    for (const k of Object.keys(n)) {
      if (IGNORE_KEYS.has(k)) continue;
      const c = n[k];
      if (Array.isArray(c)) c.forEach((x) => x && typeof x.type === "string" && visit(x, next, n, k));
      else if (c && typeof c.type === "string") visit(c, next, n, k);
    }
  };
  visit(ast.program, [], null, null);
}

function lintV2Scene(project) {
  if (!fs.existsSync(project.scene)) return;
  const relPath = path.relative(rootDir, project.scene).replaceAll("\\", "/");
  const code = fs.readFileSync(project.scene, "utf-8");
  let ast;
  try {
    ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] });
  } catch {
    return; // reported by the generic pass (A000)
  }
  const add = (rule, node, msg, fix) => violations.push({ rule, rel: relPath, line: node?.loc?.start.line ?? 1, msg, fix });
  const coreDir = path.join(rootDir, "src", "core");
  const primDir = path.join(rootDir, "src", "primitives");

  let exportsBuildTimeline = false;
  let callsHook = false;
  const components = [];
  const hasJsx = (n) => {
    if (!n || typeof n.type !== "string") return false;
    if (n.type === "JSXElement" || n.type === "JSXFragment") return true;
    return Object.keys(n).some((k) => {
      if (k === "loc" || k === "extra") return false;
      const c = n[k];
      return Array.isArray(c) ? c.some(hasJsx) : c && typeof c === "object" ? hasJsx(c) : false;
    });
  };
  const visit = (n) => {
    if (!n || typeof n.type !== "string") return;
    if (n.type === "ImportDeclaration") {
      const src = n.source.value;
      let ok;
      if (src.startsWith(".")) {
        const abs = path.resolve(project.dir, src);
        ok = isInside(abs, project.dir) || isInside(abs, coreDir) || (isInside(abs, primDir) && !isInside(abs, project.dir));
        if (isInside(abs, primDir) && !isInside(abs, project.dir) && !isLegacyGallery(project)) {
          const issue = primitivesIssue(abs, src, n.specifiers);
          if (issue) { add("V2-002", n, issue.msg, issue.fix); ok = true; }
        }
      } else {
        ok = ALLOWED_PACKAGES.has(src) || src.startsWith("gsap/");
      }
      if (src === "remotion") for (const sp of n.specifiers) if (sp.imported?.name === "spring") add("V2-005", sp, "spring() from remotion drives motion in React, bypassing buildTimeline and the timeline audit", "use physics helpers (src/core/physics.ts: bounce, arcMove, movingHold) or enter/emphasize presets with the SPRING-style eases");
      if (!ok) add("V2-002", n, `import "${src}" is not on the harness v2 allowlist`, "import only from react, remotion, gsap, src/core/*, src/primitives/curated, or files inside this project folder");
    }
    if (n.type === "ExportNamedDeclaration") {
      const d = n.declaration;
      if (d?.type === "VariableDeclaration" && d.declarations.some((x) => x.id?.name === "buildTimeline")) exportsBuildTimeline = true;
      if (d?.type === "FunctionDeclaration" && d.id?.name === "buildTimeline") exportsBuildTimeline = true;
    }
    if (n.type === "CallExpression" && n.callee?.type === "MemberExpression" && n.callee.object?.name === "gsap" && BANNED_GSAP_CALLS.has(n.callee.property?.name))
      add("V2-004", n, `direct gsap.${n.callee.property.name}() call bypasses the deterministic seeked timeline`, "use tl.* inside buildTimeline or the preset functions (enter/exit/emphasize/camera/transition) from src/core/presets");
    if (n.type === "CallExpression" && n.callee?.name === "useRemotionGSAP" && n.arguments[0]?.name === "buildTimeline") callsHook = true;
    const fnNode =
      n.type === "FunctionDeclaration" && n.id
        ? { name: n.id.name, fn: n }
        : n.type === "VariableDeclarator" && n.id?.type === "Identifier" && /^(ArrowFunctionExpression|FunctionExpression)$/.test(n.init?.type ?? "")
          ? { name: n.id.name, fn: n.init, loc: n }
          : null;
    if (fnNode && /^[A-Z]/.test(fnNode.name) && fnNode.name !== "Scene" && hasJsx(fnNode.fn.body)) {
      const loc = (fnNode.loc ?? fnNode.fn).loc;
      components.push({ name: fnNode.name, line: loc.start.line, lines: loc.end.line - loc.start.line + 1, node: fnNode.loc ?? fnNode.fn });
    }
    for (const key of Object.keys(n)) {
      if (key === "loc" || key === "extra") continue;
      const c = n[key];
      if (Array.isArray(c)) c.forEach(visit);
      else if (c && typeof c === "object") visit(c);
    }
  };
  visit(ast.program);
  checkFrameDriven(ast, add);

  metaOut[project.slug] = { sceneLines: code.replace(/\r?\n$/, "").split(/\r?\n/).length, localComponents: components.length, componentNames: components.map((c) => c.name) };
  if (!exportsBuildTimeline)
    add("V2-001", null, "Scene.tsx does not export buildTimeline", "add: export const buildTimeline = (tl: gsap.core.Timeline) => { ... } so audits can build the timeline without rendering");
  else if (!callsHook)
    add("V2-001", null, "Scene component does not call useRemotionGSAP(buildTimeline)", "inside the Scene component call: useRemotionGSAP(buildTimeline);");
  if (components.length > MAX_LOCAL_COMPONENTS)
    add("V2-003", components[MAX_LOCAL_COMPONENTS].node, `${components.length} locally defined components (${components.map((c) => c.name).join(", ")}); max ${MAX_LOCAL_COMPONENTS}`, "use primitives from src/primitives/curated or the project components/ folder instead of inventing components");
  for (const c of components)
    if (c.lines > MAX_COMPONENT_LINES)
      add("V2-003", c.node, `local component ${c.name} is ${c.lines} lines (max ${MAX_COMPONENT_LINES})`, "shrink it or use primitives from src/primitives/curated or the project components/ folder instead of inventing components");
}

/** Globals that expose the environment (a scene must be a pure function of the frame): any reference to an UNDECLARED one is V2-006. */
const ENV_GLOBALS = new Set([
  "window", "document", "globalThis", "process", "navigator", "self", "top", "parent", "frames", "opener",
  "eval", "Function", "Reflect", "location", "performance", "screen", "history", "getComputedStyle", "matchMedia",
  "localStorage", "sessionStorage", "indexedDB", "fetch", "XMLHttpRequest", "WebSocket", "Worker", "SharedWorker", "MessageChannel", "BroadcastChannel",
  "postMessage", "MutationObserver", "ResizeObserver", "IntersectionObserver", "requestIdleCallback", "queueMicrotask", "structuredClone", "importScripts",
]);
/** Property names that climb out of an element to the document/window or to the Function constructor. */
const ENV_PROPS = new Set(["ownerDocument", "defaultView", "contentWindow", "contentDocument", "getRootNode", "parentNode", "parentElement", "offsetParent", "closest", "constructor", "__proto__", "isConnected"]);
/** Remotion APIs that tell the probe from the real render (or read render-time inputs). */
const ENV_REMOTION = new Set(["getRemotionEnvironment", "useRemotionEnvironment", "getInputProps", "Internals", "useVideoConfigInternal"]);
const isEnvProp = (name) => typeof name === "string" && (ENV_PROPS.has(name) || name.startsWith("__"));
const TS_EXPR = new Set(["TSAsExpression", "TSSatisfiesExpression", "TSNonNullExpression", "TSTypeAssertion", "TSInstantiationExpression"]);
const isTsType = (n) => typeof n.type === "string" && n.type.startsWith("TS") && !TS_EXPR.has(n.type);

/** Names a scope declares (let/const/class/function/import/params; `var` hoisted from nested blocks, not from nested functions). */
function scopeNames(node) {
  const out = new Set();
  const addPattern = (id) => bindingNames(id).forEach((x) => out.add(x));
  const hoistVars = (n) => {
    if (!n || typeof n.type !== "string" || /^(Arrow|Function|ObjectMethod|ClassMethod|ClassPrivateMethod)/.test(n.type)) return;
    if (n.type === "VariableDeclaration" && n.kind === "var") n.declarations.forEach((d) => addPattern(d.id));
    childNodes(n).forEach(hoistVars);
  };
  const direct = (stmts) => {
    for (const st of stmts ?? []) {
      let d = st;
      if ((st.type === "ExportNamedDeclaration" || st.type === "ExportDefaultDeclaration") && st.declaration) d = st.declaration;
      if (d.declare) continue; // `declare const window: any` is an ambient type declaration, not a binding: it must not hide the global
      if (d.type === "VariableDeclaration" && d.kind !== "var") d.declarations.forEach((x) => addPattern(x.id));
      else if ((d.type === "FunctionDeclaration" || d.type === "ClassDeclaration") && d.id) out.add(d.id.name);
      else if (d.type === "ImportDeclaration") d.specifiers.forEach((sp) => out.add(sp.local.name));
    }
  };
  if (node.type === "Program") { direct(node.body); node.body.forEach(hoistVars); }
  else if (/^(Arrow|Function|ObjectMethod|ClassMethod|ClassPrivateMethod)/.test(node.type)) {
    (node.params ?? []).forEach(addPattern);
    if (node.type === "FunctionExpression" && node.id) out.add(node.id.name);
    if (node.body?.type === "BlockStatement") { direct(node.body.body); node.body.body.forEach(hoistVars); }
  } else if (node.type === "BlockStatement" || node.type === "StaticBlock") direct(node.body);
  else if (node.type === "SwitchStatement") node.cases.forEach((c) => direct(c.consequent));
  else if (node.type === "CatchClause") { if (node.param) addPattern(node.param); }
  else if (/^For(In|Of)?Statement$/.test(node.type)) { const i = node.init ?? node.left; if (i?.type === "VariableDeclaration" && i.kind !== "var") i.declarations.forEach((x) => addPattern(x.id)); }
  else if (node.type === "ClassExpression" && node.id) out.add(node.id.name);
  return out;
}
const SCOPE_NODE = /^(Program|Arrow|Function|ObjectMethod|ClassMethod|ClassPrivateMethod|BlockStatement|StaticBlock|SwitchStatement|CatchClause|For(In|Of)?Statement|ClassExpression)/;

/**
 * V2-013 (harness v2 project FOLDER): the folder may only hold Scene.tsx, spec.json, direction.md, components/*.tsx, an optional palette.ts and an
 * optional assets/ folder of images (png/jpg/webp/gif/avif). Anything else (.js/.jsx/.mjs/.cjs/.json/.css/.svg/.html, dotfiles, symlinks, node_modules, ...)
 * would escape the linters, the size limits and the similarity check, so it is an error.
 */
const FOLDER_ROOT_FILES = new Set(["Scene.tsx", "spec.json", "direction.md", "palette.ts"]);
const ASSET_IMAGE = /\.(png|jpe?g|webp|gif|avif)$/i;
function lintProjectFolder(project) {
  const relOf = (f) => path.relative(rootDir, f).replaceAll("\\", "/");
  const bad = (f, why) => violations.push({ rule: "V2-013", rel: relOf(f), line: 1, msg: `"${path.relative(project.dir, f).replaceAll("\\", "/")}" is not allowed in a harness v2 project folder (${why})`, fix: "a v2 project folder holds only Scene.tsx, spec.json, direction.md, components/*.tsx, an optional palette.ts and an optional assets/ folder of png/jpg/webp/gif/avif images: move code into those files and delete the rest" });
  const walkDir = (d, top) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name);
      const lst = fs.lstatSync(full);
      const inComponents = top === "components", inAssets = top === "assets";
      if (lst.isSymbolicLink()) { bad(full, "symbolic link"); continue; }
      if (lst.isDirectory()) {
        if (d === project.dir && (e.name === "components" || e.name === "assets")) walkDir(full, e.name);
        else if (inComponents) { /* V2-008 reports subfolders; the files inside are still unlisted */ walkDir(full, "components/sub"); }
        else if (inAssets) walkDir(full, "assets");
        else { bad(full, "unlisted folder"); walkDir(full, "other"); }
        continue;
      }
      if (d === project.dir) { if (!FOLDER_ROOT_FILES.has(e.name)) bad(full, "unlisted file"); }
      else if (top === "components") { if (!/\.tsx$/.test(e.name)) bad(full, "components/ holds .tsx files only"); }
      else if (top === "assets") { if (!ASSET_IMAGE.test(e.name)) bad(full, "assets/ holds images only"); }
      else bad(full, "unlisted file");
    }
  };
  if (isLegacyGallery(project)) return; // zz-gallery (the studio's own component gallery, not an eval candidate) keeps a generated manifest.json
  if (fs.existsSync(project.dir)) walkDir(project.dir, "root");
}

/**
 * V2-006 (every project file): no environment sniffing. `window`, `document`, `globalThis`, `self`, `top`, `parent`, `frames`, `opener`, `process`, `navigator`, `location`, `performance`,
 *        `Function(`, `eval(`, `Reflect`, DOM climbing (`.ownerDocument`, `.defaultView`, `.parentNode`, `.constructor` ...), any `__*` name and
 *        Remotion's environment APIs (also inside `typeof`), `import.meta.env`, let a scene render differently in the Node audits, in the probe and in the real render,
 *        so the audits no longer describe what is on screen. Only references to UNDECLARED globals count (a local named `parent` is fine).
 * V2-007 (every project file): no import or re-export that reaches into evals/ (the answer key), and re-exports obey the same allowlist as imports.
 * V2-002 also covers the project's OTHER .ts/.tsx files (a helper file cannot import what Scene.tsx may not).
 */
function lintProjectFiles(project) {
  const evalsDir = path.join(rootDir, "evals"), coreDir = path.join(rootDir, "src", "core"), primDir = path.join(rootDir, "src", "primitives");
  for (const file of walk(project.dir, new Set([".ts", ".tsx"]))) {
    if (SKIP_FILES.has(path.basename(file))) continue;
    const relPath = path.relative(rootDir, file).replaceAll("\\", "/");
    const isScene = path.resolve(file) === path.resolve(project.scene);
    let ast;
    try { ast = parse(fs.readFileSync(file, "utf-8"), { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { continue; }
    const add = (rule, node, msg, fix) => violations.push({ rule, rel: relPath, line: node?.loc?.start.line ?? 1, msg, fix });
    const checkSource = (node, src, viaImportDecl, specs) => {
      if (typeof src !== "string") return;
      if (src.startsWith(".")) {
        const abs = path.resolve(path.dirname(file), src);
        if (isInside(abs, evalsDir) && !isInside(abs, project.dir)) add("V2-007", node, `import/re-export from "${src}" reaches into evals/ (the answer key)`, "write the scene yourself; project files may only import from react, remotion, gsap, src/core, src/primitives and their own folder");
        else if (isInside(abs, primDir) && !isInside(abs, project.dir) && !isLegacyGallery(project)) {
          const issue = primitivesIssue(abs, src, specs);
          if (issue && !(isScene && viaImportDecl)) add("V2-002", node, issue.msg, issue.fix);
        }
        else if (!(isInside(abs, project.dir) || isInside(abs, coreDir) || isInside(abs, primDir)) && !(isScene && viaImportDecl)) add("V2-002", node, `"${src}" is not on the harness v2 allowlist`, "import/re-export only from react, remotion, gsap, src/core/*, src/primitives/curated, or files inside this project folder");
      } else if (!(ALLOWED_PACKAGES.has(src) || src.startsWith("gsap/")) && !(isScene && viaImportDecl)) add("V2-002", node, `"${src}" is not on the harness v2 allowlist`, "import/re-export only from react, remotion, gsap, src/core/*, src/primitives/curated, or files inside this project folder");
    };
    const scopes = [];
    const declared = (name) => scopes.some((sc) => sc.has(name));
    const envFix = "a scene must be a pure function of the frame; do not branch on the browser/Node/probe environment (window, document, globalThis, self, top, parent, Function, eval, Reflect, DOM climbing, __* names)";
    const visit = (n, parent, key) => {
      if (!n || typeof n.type !== "string") return;
      if (isTsType(n)) return; // types never run
      const scoped = SCOPE_NODE.test(n.type);
      if (scoped) scopes.push(scopeNames(n));
      if (n.type === "ImportDeclaration") checkSource(n, n.source.value, true, n.specifiers);
      if (n.type === "ImportDeclaration" && n.source.value === "remotion")
        for (const sp of n.specifiers) if (ENV_REMOTION.has(sp.imported?.name ?? sp.imported?.value)) add("V2-006", sp, `environment sniffing: "${sp.imported?.name ?? sp.imported?.value}" from remotion tells the audit environment from the render`, envFix);
      if ((n.type === "ExportNamedDeclaration" || n.type === "ExportAllDeclaration") && n.source) checkSource(n, n.source.value, false, n.specifiers);
      if (n.type === "CallExpression" && n.callee?.type === "Import") checkSource(n, n.arguments[0]?.value, false);
      if (n.type === "Identifier" && (ENV_GLOBALS.has(n.name) || n.name.startsWith("__"))) {
        const isRef = !((parent?.type === "MemberExpression" || parent?.type === "OptionalMemberExpression") && key === "property" && !parent.computed) && !(parent?.type === "ObjectProperty" && key === "key" && !parent.computed) && !(parent?.type === "ObjectMethod" && key === "key") && !(parent?.type === "ClassMethod" && key === "key") && !(parent?.type === "ClassProperty" && key === "key") && !(parent?.type === "JSXAttribute") && !/^(Import|Export)/.test(parent?.type ?? "") && !(/^(Function|Arrow|ClassMethod)/.test(parent?.type ?? "") && key === "params") && !(parent?.type === "VariableDeclarator" && key === "id") && !(parent?.type === "LabeledStatement");
        if (isRef && !declared(n.name)) add("V2-006", n, `environment sniffing: "${n.name}" is referenced in the scene`, envFix);
      }
      if (n.type === "MemberExpression" || n.type === "OptionalMemberExpression") {
        const pn = !n.computed && n.property?.type === "Identifier" ? n.property.name : n.computed && n.property?.type === "StringLiteral" ? n.property.value : null;
        if (isEnvProp(pn)) add("V2-006", n.property, `environment sniffing: ".${pn}" reaches out of the element/function into the document or the window`, envFix);
        if (n.object?.type === "MetaProperty" && n.property?.name === "env") add("V2-006", n, "environment sniffing: import.meta.env is referenced in the scene", "a scene must be a pure function of the frame; do not read build/environment variables");
      }
      for (const k of Object.keys(n)) {
        if (IGNORE_KEYS.has(k)) continue;
        const c = n[k];
        if (Array.isArray(c)) c.forEach((x) => visit(x, n, k));
        else if (c && typeof c === "object") visit(c, n, k);
      }
      if (scoped) scopes.pop();
    };
    visit(ast.program, null, null);
  }
}

/**
 * V2-008..V2-012: the project's own components/ folder (see the rule list above). Presentational only: the folder may not move anything.
 */
const FRAME_APIS = new Set(["useCurrentFrame", "interpolate", "spring", "useRemotionGSAP", "interpolateColors"]);
const MOTION_CORE = /(^|\/)core\/(useRemotionGSAP|presets|physics|gsap-bridge|recipes)(\.[tj]sx?)?$/;
const COLOR_FN = /\b(?:hsla?|hwb|oklch|oklab|lab|lch|color-mix|color)\(/i;
const COLOR_HEX = /(?:^|[^\w&-])#[0-9a-fA-F]{3,8}(?![\w-])/;
const COLOR_RGB = /\brgba?\(\s*([^)]*)\)/gi;
const TW_PALETTE = /\b(?:bg|text|border|fill|stroke|from|via|to|ring|shadow|outline|divide|decoration|accent|caret)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/;
const TW_ARBITRARY_COLOR = /\b(?:bg|text|border|fill|stroke|from|via|to|ring|outline|divide|decoration|accent|caret)-\[(?:#|rgb|hsl|oklch)/i;
const COLOR_KEYS = new Set(["color", "background", "backgroundColor", "borderColor", "fill", "stroke", "outlineColor", "caretColor", "accentColor", "stopColor", "floodColor", "lightingColor"]);
const COLOR_KEYWORDS_OK = new Set(["transparent", "currentcolor", "inherit", "none", "unset", "initial", "revert"]);
const isBlackWhiteRgb = (inner) => /^(?:0\s*,\s*0\s*,\s*0|255\s*,\s*255\s*,\s*255)\s*,\s*[\d.]+%?$/.test(inner.trim()) || /^(?:0\s+0\s+0|255\s+255\s+255)\s*\/\s*[\d.]+%?$/.test(inner.trim());
const stringsOf = (n) => {
  // [{ text, node }] for every string literal / template chunk that is not an import source
  const out = [];
  const go = (m, parent) => {
    if (!m || typeof m.type !== "string") return;
    if ((m.type === "StringLiteral" && !(/^(Import|Export)/.test(parent?.type ?? ""))) ) out.push({ text: m.value, node: m, parent });
    else if (m.type === "TemplateElement") out.push({ text: m.value.cooked ?? m.value.raw, node: m, parent });
    for (const k of Object.keys(m)) { if (IGNORE_KEYS.has(k)) continue; const c = m[k]; if (Array.isArray(c)) c.forEach((x) => go(x, m)); else if (c && typeof c === "object") go(c, m); }
  };
  go(n, null);
  return out;
};
const unwrapJsx = (e) => {
  if (!e) return [];
  if (e.type === "ParenthesizedExpression" || e.type === "TSAsExpression" || e.type === "TSNonNullExpression") return unwrapJsx(e.expression);
  if (e.type === "ConditionalExpression") return [...unwrapJsx(e.consequent), ...unwrapJsx(e.alternate)];
  if (e.type === "LogicalExpression") return unwrapJsx(e.right);
  return e.type === "JSXElement" || e.type === "JSXFragment" ? [e] : [];
};
const returnedRoots = (fn) => {
  if (fn.body.type !== "BlockStatement") return unwrapJsx(fn.body);
  const roots = [];
  const go = (m) => {
    if (!m || typeof m.type !== "string" || /^(Arrow|Function)/.test(m.type)) return;
    if (m.type === "ReturnStatement") roots.push(...unwrapJsx(m.argument));
    childNodes(m).forEach(go);
  };
  fn.body.body.forEach(go);
  return roots;
};
const forwardsClassName = (el) => el.openingElement.attributes.some((a) => {
  if (a.type !== "JSXAttribute" || a.name?.name !== "className" || a.value?.type !== "JSXExpressionContainer") return false;
  const uses = (m) => (m.type === "Identifier" && m.name === "className") || (m.type === "MemberExpression" && !m.computed && m.property?.name === "className") || childNodes(m).some(uses);
  return uses(a.value.expression);
});

function lintProjectComponents(project) {
  const compDir = path.join(project.dir, "components");
  if (!fs.existsSync(compDir)) return;
  const entries = fs.readdirSync(compDir, { withFileTypes: true });
  const files = [];
  const relDir = path.relative(rootDir, compDir).replaceAll("\\", "/");
  const addDir = (rule, msg, fix) => violations.push({ rule, rel: relDir, line: 1, msg, fix });
  for (const e of entries) {
    if (e.isDirectory()) addDir("V2-008", `components/${e.name}/ is a subfolder: components/ is flat`, "put the .tsx files directly in components/");
    else if (/\.(tsx)$/.test(e.name)) files.push(path.join(compDir, e.name));
    else if (/\.(ts|js|jsx|mjs)$/.test(e.name)) addDir("V2-008", `components/${e.name}: only .tsx component files are allowed here`, "keep types inside the component file; scenes keep their data in Scene.tsx");
  }
  if (files.length > MAX_COMPONENT_FILES) addDir("V2-008", `${files.length} files in components/ (max ${MAX_COMPONENT_FILES})`, "merge small components into one file or use curated primitives instead");
  const sceneAbs = path.resolve(project.scene).replace(/\.tsx$/, "");

  for (const file of files) {
    const relPath = path.relative(rootDir, file).replaceAll("\\", "/");
    const code = fs.readFileSync(file, "utf-8");
    const add = (rule, node, msg, fix) => violations.push({ rule, rel: relPath, line: node?.loc?.start.line ?? 1, msg, fix });
    const lineCount = code.replace(/\r?\n$/, "").split(/\r?\n/).length;
    if (lineCount > MAX_COMPONENT_FILE_LINES) add("V2-008", null, `${path.basename(file)} is ${lineCount} lines (max ${MAX_COMPONENT_FILE_LINES})`, "split it into two small components or drop detail; components/ is for small presentational pieces");
    let ast;
    try { ast = parse(code, { sourceType: "module", plugins: ["typescript", "jsx"] }); } catch { continue; }

    // V2-008 exports + V2-009 imports
    const isComponentFn = (init) => /^(ArrowFunctionExpression|FunctionExpression)$/.test(init?.type ?? "");
    const exported = [];
    const topFns = new Map();
    for (const st of ast.program.body) {
      if (st.type === "FunctionDeclaration" && st.id) topFns.set(st.id.name, st);
      if (st.type === "VariableDeclaration") for (const d of st.declarations) if (d.id?.type === "Identifier" && isComponentFn(d.init)) topFns.set(d.id.name, d.init);
      if (st.type === "ExportNamedDeclaration" && st.declaration) {
        const d = st.declaration;
        if (d.type === "TSTypeAliasDeclaration" || d.type === "TSInterfaceDeclaration") continue;
        if (d.type === "FunctionDeclaration") exported.push({ name: d.id?.name, fn: d, node: d });
        else if (d.type === "VariableDeclaration") for (const x of d.declarations) exported.push({ name: x.id?.name, fn: isComponentFn(x.init) ? x.init : null, node: x });
        else add("V2-008", d, "components/ files may only export components and types", "move constants and helpers into the file that uses them or into Scene.tsx");
      }
      if (st.type === "ExportDefaultDeclaration" && st.declaration?.type !== "Identifier" && !/^(Function|Arrow)/.test(st.declaration?.type ?? "")) add("V2-008", st, "components/ files may only export components and types", "export a named component function");
    }
    for (const ex of exported) {
      if (!ex.fn || !/^[A-Z]/.test(ex.name ?? "")) add("V2-008", ex.node, `export "${ex.name}" is not a component (capitalised function returning JSX)`, "components/ is presentational only: move data, constants and helpers into Scene.tsx or the component itself");
      else {
        const roots = returnedRoots(ex.fn);
        if (!roots.length) add("V2-012", ex.node, `component ${ex.name} returns no JSX element to put a className on`, "return a single root element with className={className}");
        for (const r of roots) {
          if (r.type === "JSXFragment") add("V2-012", r, `component ${ex.name} has a fragment root: it cannot accept className`, "wrap the content in one element and pass className={className} to it so Scene.tsx can target and animate it");
          else if (!forwardsClassName(r)) add("V2-012", r, `root <${r.openingElement.name.name ?? "element"}> of ${ex.name} does not forward className`, "accept a `className?: string` prop and set className={`my-part ${className ?? ''}`} on the root so timelines can target the instance");
        }
      }
    }
    const visit = (n) => {
      if (!n || typeof n.type !== "string") return;
      if (n.type === "ImportDeclaration" || ((n.type === "ExportNamedDeclaration" || n.type === "ExportAllDeclaration") && n.source)) {
        const src = n.source.value;
        if (src === "gsap" || src.startsWith("gsap/")) add("V2-009", n, `components/ must not import ${src}`, "animate in Scene.tsx's buildTimeline by className; components only render static markup");
        else if (MOTION_CORE.test(src)) add("V2-009", n, `components/ must not import "${src}" (motion belongs in Scene.tsx)`, "components are presentational: let Scene.tsx's buildTimeline animate them via className");
        else if (src === "remotion") for (const sp of n.specifiers ?? []) if (FRAME_APIS.has(sp.imported?.name)) add("V2-009", sp, `components/ must not use ${sp.imported.name} from remotion`, "frame-driven values belong in buildTimeline; a component renders static markup");
        if (src.startsWith(".") && path.resolve(path.dirname(file), src).replace(/\.tsx?$/, "") === sceneAbs) add("V2-008", n, "components/ must not import Scene.tsx", "pass data in through props; Scene.tsx imports the components, not the other way round");
      }
      if (n.type === "CallExpression" && n.callee?.type === "Identifier" && FRAME_APIS.has(n.callee.name)) add("V2-009", n, `${n.callee.name}() in a component`, "frame-driven values belong in buildTimeline; a component renders static markup");
      if (n.type === "MemberExpression" && n.object?.name === "gsap") add("V2-009", n, "gsap used in a component", "animate in Scene.tsx's buildTimeline by className");
      // V2-010 numeric / string font sizes
      const fsKey = n.type === "ObjectProperty" && (keyName(n) === "fontSize");
      const fsAttr = n.type === "JSXAttribute" && n.name?.name === "fontSize";
      if (fsKey || fsAttr) {
        const v = fsKey ? n.value : n.value?.type === "JSXExpressionContainer" ? n.value.expression : n.value;
        let px = null;
        if (v?.type === "NumericLiteral") px = v.value;
        else if (v?.type === "StringLiteral") { const m = v.value.match(/^\s*(\d+(?:\.\d+)?)\s*(px|rem|em)?\s*$/); if (m) px = Number(m[1]) * (m[2] && m[2] !== "px" ? 16 : 1); }
        if (px !== null && px < MIN_TEXT_PX) add("V2-010", n, `text size ${px}px is below the ${MIN_TEXT_PX}px minimum on the final frame`, `use fontSize >= ${MIN_TEXT_PX} (TYPE_SCALE.label/caption in src/core/tokens.ts)`);
      }
      // V2-011 color keywords in style objects
      if (n.type === "ObjectProperty" && COLOR_KEYS.has(keyName(n) ?? "") && n.value.type === "StringLiteral" && /^[a-zA-Z]+$/.test(n.value.value) && !COLOR_KEYWORDS_OK.has(n.value.value.toLowerCase()))
        add("V2-011", n, `named color "${n.value.value}" in ${keyName(n)}`, "take colors from the theme: pass `theme`/`colors` from getTheme() as a prop (colors.accentPrimary, colors.textMuted ...) or use var(--x)");
      for (const k of Object.keys(n)) {
        if (IGNORE_KEYS.has(k)) continue;
        const c = n[k];
        if (Array.isArray(c)) c.forEach(visit); else if (c && typeof c === "object") visit(c);
      }
    };
    visit(ast.program);
    for (const { text, node } of stringsOf(ast.program)) {
      for (const m of text.matchAll(/\btext-\[(\d+(?:\.\d+)?)(px|rem)\]/g)) {
        const px = Number(m[1]) * (m[2] === "rem" ? 16 : 1);
        if (px < MIN_TEXT_PX) add("V2-010", node, `${m[0]} is ${px}px, below the ${MIN_TEXT_PX}px minimum on the final frame`, `use text-[${MIN_TEXT_PX}px] or larger (TYPE_SCALE in src/core/tokens.ts)`);
      }
      const tw = text.match(/(?:^|[\s:])text-(xs|sm)(?![\w-])/);
      if (tw) add("V2-010", node, `Tailwind text-${tw[1]} (${tw[1] === "xs" ? 12 : 14}px) is below the ${MIN_TEXT_PX}px minimum on the final frame`, `use text-[${MIN_TEXT_PX}px] or larger`);
      let bad = null;
      if (COLOR_HEX.test(text)) bad = text.match(COLOR_HEX)[0].trim().replace(/^[^#]*/, "");
      else if (COLOR_FN.test(text)) bad = text.match(COLOR_FN)[0];
      else if (TW_ARBITRARY_COLOR.test(text)) bad = text.match(TW_ARBITRARY_COLOR)[0];
      else if (TW_PALETTE.test(text)) bad = text.match(TW_PALETTE)[0];
      else for (const m of text.matchAll(COLOR_RGB)) if (!isBlackWhiteRgb(m[1])) { bad = m[0]; break; }
      if (bad) add("V2-011", node, `raw color "${bad}" in a component`, "take colors from the theme: pass `theme`/`colors` from getTheme() as a prop (colors.accentPrimary, colors.textMuted ...) or use var(--x); rgba(0,0,0,a) / rgba(255,255,255,a) hairlines are fine");
    }
  }
}

targets.forEach(lintProjectScene);
targets.filter((t) => isHarnessV2(t)).forEach(lintV2Scene);
targets.filter((t) => isHarnessV2(t)).forEach(lintProjectFiles);
targets.filter((t) => isHarnessV2(t)).forEach(lintProjectFolder);
targets.filter((t) => isHarnessV2(t)).forEach(lintProjectComponents);

if (JSON_MODE) {
  const findings = violations.map((v) => ({ code: v.rule, severity: "error", frame: null, target: `${v.rel}:${v.line}`, message: `${v.msg} -> ${v.fix}` }));
  process.stdout.write(`${JSON.stringify({ tool: "ast-lint", ok: findings.length === 0, errors: findings.length, warnings: 0, findings, meta: metaOut }, null, 2)}\n`);
  process.exit(findings.length ? 1 : 0);
}
console.log(`\n${BOLD}==== AST LINTER v2 (${files.length} files, ${targets.length} projects) ====${RESET}`);
if (violations.length) {
  violations.forEach((v) => console.log(`${RED}${BOLD}[${v.rule}] ${v.rel}:${v.line}${RESET} ${v.msg}\n   Fix → ${v.fix}\n`));
  console.log(`${RED}${BOLD}[AST: FAILED] ${violations.length} violations. Output invalid until fixed.${RESET}\n`);
  process.exit(1);
}
console.log(`${GREEN}${BOLD}[AST: CLEAN]${RESET} no magic durations, no banned eases, no layout tweens, fully deterministic.\n`);
