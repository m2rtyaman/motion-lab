import fs from "node:fs";
import path from "node:path";
import {
  parseArgs,
  resolveTargets,
  rootDir,
  MODES as PROJECT_MODES,
  SLUG_RE,
  rel,
  isHarnessV2,
} from "./lib/projects.mjs";

/**
 * MOTION SPEC VALIDATOR (multi-project)
 * Usage: node scripts/validate-spec.mjs [--project <slug>]   (all projects when omitted)
 * The spec must be valid before any code is written. Exits 1 on any error.
 * Messages are "problem -> fix" so a model can repair them in one turn.
 */
// Flags: --dir <folder> validates one folder holding spec.json + Scene.tsx (outside src/projects);
//        --json prints { ok, errors, findings: [{code, severity, frame, target, message}] } instead of text.
const args = parseArgs();
const argvAll = process.argv.slice(2);
const JSON_MODE = argvAll.includes("--json");
const dirIdx = argvAll.indexOf("--dir");
const jsonFindings = [];
const realLog = console.log.bind(console);
if (JSON_MODE) {
  console.log = () => {};
  console.error = () => {};
}
const targets =
  dirIdx >= 0
    ? (() => {
        const dir = path.resolve(process.cwd(), argvAll[dirIdx + 1] ?? "");
        return [{ slug: path.basename(dir), dir, spec: path.join(dir, "spec.json"), scene: path.join(dir, "Scene.tsx") }];
      })()
    : resolveTargets(args);

const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";
const MODES = ["cinematic-world", "editorial-ui", "kinetic-poster", "creative-motion-reel", "hybrid-orchestrated"];
const ASPECTS = ["9:16", "16:9", "1:1"];
const EASE_OK = /^(power[1-4]|expo|circ|sine|back|quart|quint|cubic)\.(in|out|inOut)(\(\s*[\d.]+\s*\))?$/;
const EASE_BANNED = /^(linear|none|ease|ease-?in|ease-?out|ease-?in-?out|easeInOut|easeIn|easeOut)$/i;
const MAX_CAMERA_GAP_SEC = 4.5;
const IMPACT_SYNC_SEC = 0.1;
const SFX_SYNC_FRAMES = 2;

let totalErrors = 0;

for (const project of targets) {
  const specPath = args.spec ? path.resolve(rootDir, args.spec) : project.spec;
  const scenePath = project.scene;
  const errors = [];
  const err = (code, where, problem, fix) => errors.push({ code, where, problem, fix });

  if (!fs.existsSync(specPath)) {
    console.error(`${RED}${BOLD}[SPEC] File missing:${RESET} ${rel(specPath)}\nFix: generate spec.json.`);
    jsonFindings.push({ code: "S000", severity: "error", frame: null, target: "spec.json", message: "spec.json is missing -> create it" });
    totalErrors++;
    continue;
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(specPath, "utf-8").replace(/^\uFEFF/, ""));
  } catch (e) {
    console.error(`${RED}${BOLD}[SPEC] Invalid JSON (${project.slug}):${RESET} ${e.message}`);
    jsonFindings.push({ code: "S000", severity: "error", frame: null, target: "spec.json", message: `spec.json is not valid JSON: ${e.message} -> fix the syntax` });
    totalErrors++;
    continue;
  }

  const isNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isInt = (v) => Number.isInteger(v);

  // ---- Project identity ----
  if (!SLUG_RE.test(project.slug)) err("S010", "slug", `invalid folder name: ${project.slug}`, "use lowercase letters, digits and dashes only");
  if (!PROJECT_MODES.includes(spec.mode)) err("S011", "mode", `unknown mode: ${spec.mode}`, PROJECT_MODES.join(" | "));
  if (!fs.existsSync(scenePath)) err("S013", "Scene.tsx", `${rel(scenePath)} does not exist`, "add a Scene.tsx that exports Scene and buildTimeline");

  // ---- Top-level fields ----
  if (spec.version !== 1) err("S001", "version", `version must be 1, got ${JSON.stringify(spec.version)}`, 'set "version": 1');
  if (typeof spec.title !== "string" || !spec.title.trim()) err("S002", "title", "title is empty", "write a short title");
  if (!MODES.includes(spec.mode)) err("S003", "mode", `invalid mode: ${spec.mode}`, `one of: ${MODES.join(" | ")}`);
  if (!ASPECTS.includes(spec.aspect)) err("S004", "aspect", `invalid aspect: ${spec.aspect}`, `one of: ${ASPECTS.join(" | ")}`);
  if (spec.fps !== 60) err("S005", "fps", `fps must be 60 (the studio is locked to 60 FPS), got ${spec.fps}`, "fps: 60");
  if (!isNum(spec.durationInSeconds) || spec.durationInSeconds <= 0 || spec.durationInSeconds > 60) {
    err("S006", "durationInSeconds", `durationInSeconds must be a number in (0, 60], got ${JSON.stringify(spec.durationInSeconds)}`, "e.g. 6");
  }
  if (!spec.safeZone || !isNum(spec.safeZone.top) || !isNum(spec.safeZone.bottom)) {
    err("S007", "safeZone", "safeZone.top and safeZone.bottom must be numbers", "safeZone: { top: 250, bottom: 300 } (9:16) or { top: 40, bottom: 40 } (16:9 / 1:1)");
  } else {
    const isHorizontal = spec.aspect === "16:9" || spec.aspect === "1:1";
    const minTop = isHorizontal ? 30 : 250;
    const minBottom = isHorizontal ? 30 : 300;
    if (spec.safeZone.top < minTop) err("S008", "safeZone.top", `safeZone.top must be >= ${minTop}, got ${spec.safeZone.top}`, `set safeZone.top to ${isHorizontal ? "30-60" : "250 or more"}`);
    if (spec.safeZone.bottom < minBottom) err("S009", "safeZone.bottom", `safeZone.bottom must be >= ${minBottom}, got ${spec.safeZone.bottom}`, `set safeZone.bottom to ${isHorizontal ? "30-60" : "300 or more"}`);
  }

  // ---- Theme & component stack ----
  if (spec.theme) {
    const validModes = ["light", "dark", "vibrant-brand", "editorial-warm", "kinetic-acid", "technical-drafting"];
    if (!validModes.includes(spec.theme.surfaceMode)) {
      err("S015", "theme.surfaceMode", `invalid surfaceMode: ${spec.theme.surfaceMode}`, validModes.join(" | "));
    }
  }

  const declaredComponents = spec.componentStack || spec.detectedWidgets;
  if (declaredComponents !== undefined) {
    if (!Array.isArray(declaredComponents)) {
      err("S016", "componentStack", "componentStack / detectedWidgets must be an array of strings", '["InteractiveMap", "ChartCanvas", ...]');
    } else {
      declaredComponents.forEach((w, idx) => {
        if (typeof w !== "string" || !w.trim()) {
          err("S017", `componentStack[${idx}]`, "component name is empty or not a string", "write the component name in PascalCase");
        }
      });
    }
  }

  const fps = 60;
  const totalFrames = isNum(spec.durationInSeconds) ? Math.round(spec.durationInSeconds * fps) : 0;

  // ---- Beats ----
  const beats = Array.isArray(spec.beats) ? spec.beats : [];
  if (beats.length === 0) err("S020", "beats", "at least 1 beat is required", "split the storyboard into beats");
  const ids = new Set();
  beats.forEach((b, i) => {
    const w = `beats[${i}]`;
    if (!b.id || ids.has(b.id)) err("S021", w, `beat id is empty or duplicated: ${b.id}`, "give every beat a unique id");
    ids.add(b.id);
    if (!isInt(b.startFrame) || !isInt(b.endFrame) || b.endFrame < b.startFrame) {
      err("S022", w, `startFrame and endFrame must be integers with endFrame >= startFrame, got ${JSON.stringify(b.startFrame)}..${JSON.stringify(b.endFrame)}`, "fix the frame numbers");
    }
    if (typeof b.intent !== "string" || b.intent.trim().length < 3) err("S023", w, "intent is empty", "write the purpose of the beat (a short sentence)");
    if (i === 0 && b.startFrame !== 0) err("S024", w, `the first beat must start at frame 0, got ${b.startFrame}`, "startFrame: 0");
    if (i > 0 && isInt(b.startFrame) && isInt(beats[i - 1].endFrame) && b.startFrame !== beats[i - 1].endFrame + 1) {
      err(
        "S025",
        w,
        `startFrame must be ${beats[i - 1].endFrame + 1} (= previous beat endFrame ${beats[i - 1].endFrame} + 1), got ${b.startFrame}: beats must touch with no gap or overlap`,
        `startFrame: ${beats[i - 1].endFrame + 1}`
      );
    }
  });
  if (beats.length && totalFrames && beats[beats.length - 1].endFrame !== totalFrames) {
    err("S026", "beats[last].endFrame", `last beat endFrame must be ${totalFrames} (= ${spec.durationInSeconds}s x ${fps}fps), got ${beats[beats.length - 1].endFrame}`, `endFrame: ${totalFrames}`);
  }



  // ---- Hybrid orchestration scenes (hybrid-orchestrated) ----
  if (spec.mode === "hybrid-orchestrated") {
    const scenes = Array.isArray(spec.scenes) ? spec.scenes : [];
    if (scenes.length < 2) {
      err("S028", "scenes", "hybrid-orchestrated mode needs at least 2 independent scene archetypes", 'scenes: [{ id: "intro", archetype: "bento-editorial", startFrame: 0, endFrame: 150 }, ...]');
    }
    const VALID_ARCHETYPES = [
      "bento-editorial",
      "kinetic-void",
      "terminal-mockup",
      "device-editorial",
      "specimen-editorial",
      "papercraft-cutout",
      "sculptural-reel",
      "product-promo",
      "swiss-grid",
      "data-rollup",
    ];
    scenes.forEach((s, idx) => {
      const sw = `scenes[${idx}]`;
      if (!s.id || typeof s.id !== "string") err("S029a", sw, "scene id is missing", "define an id");
      if (!s.archetype || !VALID_ARCHETYPES.includes(s.archetype)) {
        err("S029b", `${sw}.archetype`, `invalid archetype: ${s.archetype}`, VALID_ARCHETYPES.join(" | "));
      }
      if (!isInt(s.startFrame) || !isInt(s.endFrame) || s.endFrame <= s.startFrame) {
        err("S029c", sw, "startFrame and endFrame must be integers with endFrame > startFrame", "fix the frame numbers");
      }
    });
  }

  // ---- Camera ----
  const camera = Array.isArray(spec.camera) ? spec.camera : [];
  const v2 = isHarnessV2(spec); // v2: camera/transition coverage is checked on the real timeline (timeline-audit), not by spec arrays
  const isSingleContainer =
    Boolean(spec.transitions && spec.transitions.some((t) => t.type === "container-morph")) ||
    spec.singleContainer === true ||
    v2;
  if (camera.length === 0 && spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster" && !isSingleContainer) {
    err("S030", "camera", "the scene cannot stay static: at least 1 camera move is required", "fill the camera array");
  }
  camera.forEach((c, i) => {
    const w = `camera[${i}]`;
    if (!isNum(c.at) || c.at < 0) err("S031", w, "at must be a number >= 0", "start time in seconds");
    if (!isNum(c.duration) || c.duration < 0.05 || c.duration > 2.5) {
      err("S032", w, `duration ${c.duration} is out of range`, "0.05-2.5 s");
    }
    if (typeof c.ease !== "string" || EASE_BANNED.test(c.ease)) {
      err("S033", w, `forbidden or missing ease: ${c.ease}`, "pick a curve such as expo.out, power2.inOut, back.out(1.6)");
    } else if (!EASE_OK.test(c.ease)) {
      err("S034", w, `unknown ease: ${c.ease}`, "GSAP families: power1-4|expo|circ|sine|back|quart|quint|cubic + .in/.out/.inOut");
    }
    if (isNum(c.at) && isNum(c.duration) && c.at + c.duration > spec.durationInSeconds + 0.001) {
      err("S035", w, "the move runs past the video end", "at + duration must be <= durationInSeconds");
    }
  });

  // Camera gaps (the scene must not freeze; kinetic 2D vector and single-container scenes may keep a static canvas, so they are exempt)
  if (camera.length && isNum(spec.durationInSeconds) && spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster" && !isSingleContainer) {
    const spans = [
      ...camera.map((c) => [c.at, c.at + c.duration]),
      ...(Array.isArray(spec.shakes) ? spec.shakes : []).map((s) => [s.at, s.at + s.steps * s.stepDuration]),
    ]
      .filter(([a, b]) => isNum(a) && isNum(b))
      .sort((a, b) => a[0] - b[0]);
    let cursor = 0;
    for (const [a, b] of spans) {
      if (a - cursor > MAX_CAMERA_GAP_SEC) {
        err(
          "S036",
          "camera",
          `camera is static from ${cursor.toFixed(2)}s to ${a.toFixed(2)}s (${(a - cursor).toFixed(2)}s)`,
          `allow at most ${MAX_CAMERA_GAP_SEC}s without camera motion; add a move`
        );
      }
      cursor = Math.max(cursor, b);
    }
    if (spec.durationInSeconds - cursor > MAX_CAMERA_GAP_SEC) {
      err("S036", "camera", `camera is static from ${cursor.toFixed(2)}s to the end`, "add a closing move");
    }
  }

  // ---- Shakes ----
  (Array.isArray(spec.shakes) ? spec.shakes : []).forEach((s, i) => {
    const w = `shakes[${i}]`;
    if (!isInt(s.steps) || s.steps < 2 || s.steps > 8) err("S040", w, "steps must be an integer 2-8", "e.g. 5");
    if (!isNum(s.stepDuration) || s.stepDuration < 0.04 || s.stepDuration > 0.12) err("S041", w, "stepDuration must be 0.04-0.12", "e.g. 0.06");
    if (!isNum(s.amplitudePx) || s.amplitudePx < 2 || s.amplitudePx > 30) err("S042", w, "amplitudePx must be 2-30", "e.g. 14");
  });

  // ---- SFX file existence ----
  const sfx = Array.isArray(spec.sfx) ? spec.sfx : [];
  sfx.forEach((s, i) => {
    if (!isInt(s.frame) || s.frame < 0 || s.frame > totalFrames) err("S053", `sfx[${i}]`, `frame ${s.frame} is out of range`, `0-${totalFrames}`);
    if (typeof s.sfx !== "string") err("S054", `sfx[${i}]`, "sfx name is missing", "e.g. step-stone");
    else if (!fs.existsSync(path.join(rootDir, "public", "sfx", `${s.sfx}.wav`))) {
      err("S055", `sfx[${i}]`, `public/sfx/${s.sfx}.wav not found`, "use an existing sfx name");
    }
  });

  // ---- Transition contract (S070-S073): every beat boundary carries a transition ----
  const TRANSITION_TYPE_RE = /^[a-z0-9][a-z0-9-]*$/;
  const transitions = Array.isArray(spec.transitions) ? spec.transitions : [];
  if (spec.legacy !== true && spec.continuousShot !== true && !v2 && beats.length >= 2) {
    if (transitions.length !== beats.length - 1)
      err("S070", "transitions", `${transitions.length} transitions for ${beats.length - 1} beat boundaries`, "add one spec.transitions entry per consecutive beat pair");
    transitions.forEach((tr, i) => {
      const w = `transitions[${i}]`;
      if (typeof tr.type !== "string" || !TRANSITION_TYPE_RE.test(tr.type))
        err("S071", w, `invalid type format: "${tr.type}"`, "use a kebab-case transition name (e.g. whip-pan, mask-wipe, svg-morph, zoom-punch, container-morph)");
      const next = beats[i + 1];
      if (next && Number.isFinite(tr.atFrame) && Math.abs(tr.atFrame - next.startFrame) > 45)
        err("S072", w, `atFrame ${tr.atFrame} is more than 45 frames from the next beat start (${next.startFrame})`, "align the transition with the beat boundary");
      if (!Number.isFinite(tr.atFrame)) err("S073", w, "atFrame is missing", "atFrame: <boundary frame>");
    });
    // S074: removed; one consistent transition type (e.g. container-morph everywhere) is allowed.
  }
  // ---- Spec <-> Scene.tsx drift check ----
  if (fs.existsSync(scenePath)) {
    const code = fs.readFileSync(scenePath, "utf-8");
    const has = (re) => re.test(code);
    beats.forEach((b) => {
      if (!v2 && !has(new RegExp(`startFrame:\\s*${b.startFrame}\\b`))) {
        err("S060", `beats[${b.id}]`, `startFrame: ${b.startFrame} not found in ${rel(scenePath)}`, "align the code with the spec");
      }
      if (b.text && !code.includes(b.text)) err("S061", `beats[${b.id}]`, `"${b.text}" does not appear in ${rel(scenePath)}`, "align the text");
    });
    if (!v2 && spec.mode !== "creative-motion-reel" && spec.mode !== "kinetic-poster") {
      const hasCameraChoreography = has(/animateCamera|CameraRig|VirtualCameraRig|\.camera-rig|\.poster-rig|SPEC_CAMERA|CAMERA_KEYFRAMES|applyIsometricTilt|applyFocusZoom|SpatialCamera|useCamera/i);
      if (!hasCameraChoreography) {
        camera.forEach((c, i) => {
          const at = String(c.at).replace(".", "\\.");
          const atFrame = Math.round(c.at * fps);
          if (!has(new RegExp(`at:\\s*${at}\\b`)) && !has(new RegExp(`\\b${atFrame}\\b`))) {
            err("S062", `camera[${i}]`, `camera move (at: ${c.at}) not found in ${rel(scenePath)}`, "align the code with the spec or add a CameraRig");
          }
        });
      }
    }
  }

  for (const e of errors) jsonFindings.push({ code: e.code, severity: "error", frame: null, target: e.where, message: `${e.problem} -> ${e.fix}`, project: project.slug });

  // ---- Project Report ----
  console.log(`\n${BOLD}==== MOTION SPEC: ${project.slug.toUpperCase()} ====${RESET}`);
  console.log(`Spec: ${rel(specPath)} | ${spec.mode} ${spec.aspect} | ${totalFrames} frames | ${beats.length} beats | ${camera.length} camera | ${sfx.length} sfx`);

  if (errors.length) {
    errors.forEach((e) => console.log(`${RED}${BOLD}[${e.code}] ${e.where}${RESET}: ${e.problem}\n   Fix → ${e.fix}`));
    totalErrors += errors.length;
  } else {
    console.log(`${GREEN}✓ Spec contract and Scene.tsx alignment verified.${RESET}`);
  }
}

if (JSON_MODE) {
  realLog(JSON.stringify({ tool: "validate-spec", ok: totalErrors === 0, errors: totalErrors, warnings: 0, findings: jsonFindings }, null, 2));
  process.exit(totalErrors > 0 ? 1 : 0);
}

if (totalErrors > 0) {
  console.log(`\n${RED}${BOLD}[SPEC: INVALID] Total ${totalErrors} errors found. Fix before proceeding.${RESET}\n`);
  process.exit(1);
}

console.log(`\n${GREEN}${BOLD}[ALL PROJECT SPECS VALID]${RESET}\n`);
process.exit(0);

