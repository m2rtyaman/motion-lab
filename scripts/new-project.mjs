import fs from "node:fs";
import path from "node:path";
import {
  projectsDir,
  projectPaths,
  SLUG_RE,
  MODES,
  ASPECT_DIMS,
  rootDir,
  rel,
  runNode,
} from "./lib/projects.mjs";

/**
 * NEW PROJECT SCAFFOLDER
 *
 * Usage:
 *   node scripts/new-project.mjs <slug> [--mode <cinematic-world|editorial-ui|kinetic-poster>] [--aspect 9:16|16:9] [--duration 6] [--title "Title"]
 */

const argv = process.argv.slice(2);
const positional = argv.filter((a) => !a.startsWith("-"));
const slug = positional[0];

const getArg = (flag, def) => {
  const idx = argv.indexOf(flag);
  return idx !== -1 && argv[idx + 1] ? argv[idx + 1] : def;
};

const mode = getArg("--mode", "editorial-ui");
const aspect = getArg("--aspect", "9:16");
const duration = parseFloat(getArg("--duration", "6"));
const themeArg = getArg("--theme", null);
const title = getArg("--title", slug ? slug.replace(/-/g, " ").toUpperCase() : "Yeni Sahne");

const THEMES = ["light", "dark", "vibrant-brand", "editorial-warm", "kinetic-acid", "technical-drafting"];
const DEFAULT_THEME = { "editorial-ui": "light", "kinetic-poster": "editorial-warm", "cinematic-world": "dark", "creative-motion-reel": "dark", "hybrid-orchestrated": "dark" };
const TRANSITION_CYCLE = [
  { type: "element-takeover", fn: "transitionElementTakeover" },
  { type: "camera-dive", fn: "transitionCameraDive" },
  { type: "mask-wipe", fn: "transitionMaskWipe" },
];
const RED = "\x1b[31m", GREEN = "\x1b[32m", BOLD = "\x1b[1m", RESET = "\x1b[0m";

if (!slug || !SLUG_RE.test(slug)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid or missing project slug:${RESET} "${slug}"`);
  console.log(`Usage: node scripts/new-project.mjs <slug> [--mode editorial-ui|cinematic-world|kinetic-poster] [--aspect 9:16|16:9]`);
  process.exit(1);
}

if (!MODES.includes(mode)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid mode:${RESET} "${mode}". Options: ${MODES.join(" | ")}`);
  process.exit(1);
}

if (!ASPECT_DIMS[aspect]) {
  console.error(`${RED}${BOLD}[ERROR] Invalid aspect ratio:${RESET} "${aspect}". Options: 9:16 | 16:9 | 1:1`);
  process.exit(1);
}

const surfaceMode = themeArg ?? DEFAULT_THEME[mode];
if (!THEMES.includes(surfaceMode)) {
  console.error(`${RED}${BOLD}[ERROR] Invalid theme:${RESET} "${surfaceMode}". Options: ${THEMES.join(" | ")}`);
  process.exit(1);
}

const p = projectPaths(slug);

if (fs.existsSync(p.dir)) {
  console.error(`${RED}${BOLD}[ERROR] "${slug}" projesi zaten mevcut:${RESET} ${rel(p.dir)}`);
  process.exit(1);
}

const legacy = argv.includes("--legacy");
if (!legacy) {
  if (mode === "cinematic-world") scaffoldCharacterV2();
  else scaffoldV2();
  process.exit(0);
}

/**
 * Harness v2 scaffold (default): short Scene.tsx built only from presets + primitives,
 * a spec with "harness": 2, and a tiny direction.md. Passes `pnpm check` with zero edits.
 */
function scaffoldV2() {
  if (duration < 5) {
    console.error(`${RED}${BOLD}[ERROR] --duration must be >= 5 for the v2 scaffold (3 beats + 1.2s final hold).${RESET}`);
    process.exit(1);
  }
  const total = Math.round(duration * 60);
  const b3 = Math.max(Math.round(total * 0.4), 144); // last beat >= 2.4s: entrances + 1.2s hold
  const rem = total - b3;
  const b1 = Math.round(rem * 0.42);
  const starts = [0, b1, rem];
  const ids = ["intro", "proof", "cta"];
  const n2 = (x) => Number(x.toFixed(2));
  const S2 = n2(starts[1] / 60);
  const S3 = n2(starts[2] / 60);
  const hold = n2(duration - 1.2);
  const tall = aspect === "9:16";
  const specV2 = {
    $schema: "../../../specs/motion-spec.schema.json",
    version: 1,
    harness: 2,
    title,
    mode,
    aspect,
    fps: 60,
    durationInSeconds: duration,
    safeZone: tall ? { top: 250, bottom: 300 } : { top: 30, bottom: 30 },
    theme: { surfaceMode },
    beats: ids.map((id, i) => ({
      id,
      startFrame: starts[i],
      endFrame: i === 2 ? total : starts[i + 1] - 1,
      intent: ["Introduce the promise", "Show the proof", "Resolve to brand and call to action (1.2s hold)"][i],
      board: [
        { focal: ".headline-word", zone: tall ? "middle-center" : "middle-left", start: "Empty themed grid, nothing on screen", end: "Accent bar, kicker and the four-word headline sit sharp and still", text: ["Plan less. Ship more."], transitionIn: "cut", why: "the promise comes first so the proof has something to prove" },
        { focal: ".proof-list", zone: "middle-center", start: "Headline still on screen, a dark panel starts to wipe in", end: "Dark panel holds three proof cells in a hairline grid, the first value punched", text: ["3x faster reviews", "12k teams onboard", "99% on-time launches"], transitionIn: "transition:maskWipe", why: "proof follows the promise; the wipe changes luminosity so the beat reads as new" },
        { focal: ".cta-button", zone: "middle-center", start: "Proof cells sinking away", end: "Brand mark above the call-to-action button, both sharp and still", text: ["Start free today"], transitionIn: "cut", why: "the call to action is the result of the proof and holds still for the full 1.2s" },
      ][i],
    })),
  };
  const cols = tall ? "grid-cols-1" : "grid-cols-3";
  const pad = tall ? "px-16 pt-[250px] pb-[300px]" : "px-24 py-[100px]";
  const headSize = tall ? 132 : 112;
  const scene = `import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, exit, emphasize, camera, transition, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';
import { BackdropField } from '../../primitives';

const theme = getTheme('${surfaceMode}'); // keep in sync with spec.theme.surfaceMode

// EDIT: product name (kicker + closing mark)
const BRAND = 'Fieldnote';
// EDIT: headline, 3-5 short words (each word animates on its own)
const HEADLINE = ['Plan', 'less.', 'Ship', 'more.'];
// EDIT: three proof points (big value + short label)
const PROOF = [
  { value: '3x', label: 'faster reviews' },
  { value: '12k', label: 'teams onboard' },
  { value: '99%', label: 'on-time launches' },
];
// EDIT: call to action
const CTA = 'Start free today';

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'intro', 0);
  enter(tl, '.accent-bar', 'wipe', 0.1);
  enter(tl, '.kicker', 'rise', 0.2);
  enter(tl, '.headline-word', 'words', 0.35);
  camera(tl, '.backdrop', 'drift', 0.2, { intensity: 'soft' });

  beat(tl, 'proof', ${S2});
  transition(tl, 'maskWipe', ${n2(S2 - 0.15)}, { incoming: '.proof-panel', type: 'horizontal' });
  enter(tl, '.proof-cell', 'stagger', ${n2(S2 + 0.35)}, { stagger: 'normal' });
  camera(tl, '.proof-list', 'pushIn', ${n2(S2 + 0.4)}, { intensity: 'soft' });
  emphasize(tl, '.proof-value-first', 'punch', ${n2(S2 + 0.9)});

  beat(tl, 'cta', ${S3});
  exit(tl, '.proof-list', 'sink', ${n2(S3 - 0.05)});
  enter(tl, '.cta-mark', 'pop', ${n2(S3 + 0.1)});
  enter(tl, '.cta-button', 'rise', ${n2(S3 + 0.4)});
  emphasize(tl, '.cta-glint', 'glint', ${n2(S3 + 0.6)});
  holdFinal(tl, ${hold}, 1.2); // static and crystal clear until the last frame
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  const pad = '${pad}';
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="backdrop absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.5} />
      </div>
      <div className="rig absolute inset-0">
        <div className={\`intro-group absolute inset-0 flex flex-col justify-center gap-8 \${pad}\`}>
          <div className="accent-bar h-2 w-40 rounded-full" style={{ backgroundColor: colors.accentPrimary }} />
          <div className="kicker font-mono text-[28px] uppercase tracking-[0.14em]" style={{ color: colors.textMuted }}>{BRAND}</div>
          <h1 className="flex flex-wrap gap-x-8 text-[${headSize}px] font-black leading-[1.02] tracking-[-0.035em]">
            {HEADLINE.map((w) => <span key={w} className="headline-word inline-block">{w}</span>)}
          </h1>
        </div>
        <div className={\`proof-panel absolute inset-0 flex flex-col justify-center \${pad}\`} style={{ backgroundColor: colors.textPrimary, color: colors.bgPrimary }}>
          <div className="relative">
            <div className="proof-list grid ${cols} gap-[1px]" style={{ backgroundColor: colors.textGhost }}>
              {PROOF.map((p, i) => (
                <div key={p.label} className="proof-cell flex flex-col gap-3 p-10" style={{ backgroundColor: colors.textPrimary }}>
                  <span className={i === 0 ? 'proof-value-first text-[96px] font-black leading-none' : 'text-[96px] font-black leading-none'}>{p.value}</span>
                  <span className="text-[32px] font-medium" style={{ color: colors.textGhost }}>{p.label}</span>
                </div>
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-10">
              <div className="cta-mark flex h-32 w-32 items-center justify-center rounded-3xl text-[72px] font-black" style={{ backgroundColor: colors.accentPrimary, color: colors.bgSurface }}>{BRAND.charAt(0)}</div>
              <div className="cta-button relative overflow-hidden rounded-full px-14 py-6 text-[40px] font-bold" style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
                {CTA}
                <div className="cta-glint absolute inset-y-0 left-0 w-24 -skew-x-12 opacity-0" style={{ backgroundColor: colors.accentSecondary }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default Scene;
`;
  const presetsUsed = ["wipe, rise, words, drift", "maskWipe, stagger, pushIn, punch", "sink, pop, rise, glint"];
  const what = ["Headline words drop in over the grid", "Dark panel wipes in; three proof points stagger", "Brand mark and button resolve, then 1.2s hold"];
  const bounds = [...starts, total];
  const rows = ids.map((id, i) => `| ${id} | ${((bounds[i + 1] - bounds[i]) / 60).toFixed(2)} | ${what[i]} | ${presetsUsed[i]} |`);
  const dir = `# Direction - ${title}

## Message (one-sentence goal)
EDIT: the one thing the viewer should remember, in one sentence.

## Audience
EDIT: who watches this, and where (feed, landing page, event screen).

## Look
- Palette: theme "${surfaceMode}" (colors come from getTheme, never hex in the Scene)
- Type: heavy sans headline, mono kicker, 28px+ supporting text

## Beats
| id | seconds | what happens | presets |
|---|---|---|---|
${rows.join("\n")}

## Storyboard (per beat; the machine-checked cards live in spec.json beats[].board, see docs/STORYBOARD.md)
EDIT each board: focal = the one element to look at (a className in Scene.tsx), zone = 3x3 cell, start/end = the key poses a viewer sees,
text = on-screen strings, transitionIn = preset or cut, why = one clause of motivation. Cause comes before effect.
Order of work: boards, then the static layout, then \`pnpm render:poses --project ${slug}\`, then the motion.
`;
  fs.mkdirSync(p.dir, { recursive: true });
  fs.writeFileSync(p.direction, dir, "utf-8");
  fs.writeFileSync(p.spec, JSON.stringify(specV2, null, 2) + "\n", "utf-8");
  fs.writeFileSync(p.scene, scene, "utf-8");
  runNode("gen-registry.mjs");
  console.log(`\n${GREEN}${BOLD}✓ PROJECT CREATED (harness v2):${RESET} ${slug}`);
  console.log(`  Directory : ${rel(p.dir)}`);
  console.log(`  Aspect    : ${aspect} | ${duration}s | beats: ${ids.join(" > ")}`);
  console.log(`\nNext: edit the lines marked "// EDIT:" in ${rel(p.scene)}, then`);
  console.log(`  pnpm check --project ${slug}`);
  console.log(`  pnpm render:poses --project ${slug}   (key poses per beat, before polishing motion)`);
  console.log(`  pnpm render:contact-sheet --project ${slug}\n`);
}

/**
 * Harness v2 scaffold for mode cinematic-world: a RigCharacter that walks in (rigWalk), notices a thing (lookAt),
 * reacts (react) and a closing line that holds 1.2s. Passes `pnpm check` with zero edits.
 */
function scaffoldCharacterV2() {
  const WALK_AT = 1.0, STEPS = 2, WALK_S = 1.95, LOOK_S = 0.45, REACT_S = 0.81; // seconds (rigWalkSeconds / lookAtSeconds / reactSeconds)
  const NOTICE_AT = WALK_AT + WALK_S + 0.2;
  const REACT_AT = NOTICE_AT + LOOK_S + 0.35;
  const CLOSE_AT = Number((REACT_AT + REACT_S + 0.1).toFixed(2));
  const minDuration = Number((CLOSE_AT + 0.8 + 1.2).toFixed(2)); // closing line rises (~0.5s) before the 1.2s hold
  const dur = argv.includes("--duration") ? duration : 7;
  if (dur < minDuration) {
    console.error(`${RED}${BOLD}[ERROR] --duration must be >= ${minDuration} for the character scaffold (walk, notice, react, closing line + 1.2s hold).${RESET}`);
    process.exit(1);
  }
  const total = Math.round(dur * 60);
  const f = (s) => Math.round(s * 60);
  const starts = [0, f(WALK_AT), f(NOTICE_AT), f(REACT_AT)];
  const ids = ["arrive", "walk", "notice", "react"];
  const n2 = (x) => Number(x.toFixed(2));
  const tall = aspect === "9:16";
  const square = aspect === "1:1";
  const GROUND = tall ? 1500 : square ? 1180 : 900;
  const heroLeft = tall ? 120 : 240;
  const thing = tall ? { left: 740, top: 700 } : square ? { left: 960, top: 500 } : { left: 1500, top: 300 };
  const labelPos = tall ? { left: 64, top: 260 } : { left: 120, top: 80 };
  const closePos = tall ? { left: 64, top: 1540 } : square ? { left: 120, top: 1290 } : { left: 120, top: 950 };
  const specV2 = {
    $schema: "../../../specs/motion-spec.schema.json",
    version: 1,
    harness: 2,
    title,
    mode,
    aspect,
    fps: 60,
    durationInSeconds: dur,
    safeZone: tall ? { top: 250, bottom: 300 } : { top: 30, bottom: 30 },
    theme: { surfaceMode },
    beats: ids.map((id, i) => ({
      id,
      startFrame: starts[i],
      endFrame: i === 3 ? total : starts[i + 1] - 1,
      intent: ["Ground and the character arrive, standing", "Two steps in, the weight settles", "Something appears: eyes first, then head, then torso", "Crouch, hop, settle, then the closing line and the 1.2s hold"][i],
      board: [
        { focal: ".hero-root", zone: "bottom-left", start: "Empty themed grid, nothing on screen", end: "Ground line and the character standing at the left", text: [], transitionIn: "cut", why: "introduce the actor on its ground before it moves" },
        { focal: ".hero-root", zone: "bottom-center", start: "Character standing at the left", end: "Character two steps in, feet planted and weight settled", text: [], transitionIn: "cut", why: "the walk defines the space the story happens in" },
        { focal: ".thing", zone: tall ? "top-right" : "middle-right", start: "Character idle, nothing else on screen", end: "The symbol has popped in and the eyes, head and torso have turned to it in that order", text: ["?"], transitionIn: "cut", why: "the cause appears first and the character reacts after it" },
        { focal: ".closing", zone: "bottom-center", start: "Character facing the symbol, upright", end: "Character settled after the hop, closing line sharp beneath the ground line", text: ["Always be ready."], transitionIn: "cut", why: "the reaction releases the tension; the closing line holds still for the full 1.2s" },
      ][i],
    })),
  };
  const scene = `import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { lookAt, lookAtSeconds, react, reactSeconds, rigWalk, rigWalkSeconds } from '../../core/physics';
import { getTheme } from '../../core/theme-contract';
import { BackdropField, RigCharacter } from '../../primitives';

const theme = getTheme('${surfaceMode}'); // keep in sync with spec.theme.surfaceMode
const GROUND_Y = ${GROUND}; // px, the soles
const HERO = 'hero';
// EDIT: the symbol the character notices (one glyph) and the closing line (2-4 words)
const THING = '?';
const CLOSING = 'Always be ready.';
const WALK = { pace: 'walk', steps: ${STEPS} } as const; // EDIT: 2-3 steps (3 steps travel 360 px)
const WALK_AT = ${WALK_AT}; // s
const NOTICE_AT = WALK_AT + rigWalkSeconds(WALK) + 0.2; // s, a short moving hold after the stop
const REACT_AT = NOTICE_AT + lookAtSeconds() + 0.35; // s, eyes lead, then a 0.35 s hold, then anticipation
const CLOSE_AT = REACT_AT + reactSeconds() + 0.1; // s, the line rises as the character settles
const HOLD_AT = ${n2(dur - 1.2)}; // s, the closing pose; video is ${dur} s

export const buildTimeline = (tl: gsap.core.Timeline) => {
  beat(tl, 'arrive', 0);
  enter(tl, '.ground', 'wipe', 0.1);
  enter(tl, '.hero-root', 'rise', 0.25);

  beat(tl, 'walk', WALK_AT);
  rigWalk(tl, HERO, WALK_AT, WALK); // IK feet planted, hip bob, arms swing against the legs

  beat(tl, 'notice', NOTICE_AT);
  enter(tl, '.thing', 'pop', NOTICE_AT + 0.1);
  lookAt(tl, HERO, NOTICE_AT, { look: 'up' }); // eyes, then head 3 f, then torso 6 f

  beat(tl, 'react', REACT_AT);
  react(tl, HERO, REACT_AT, { kind: 'startle', intensity: 'normal' }); // crouch, hop, land, settle
  enter(tl, '.closing', 'rise', CLOSE_AT);

  holdFinal(tl, HOLD_AT, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  const { colors } = theme;
  return (
    <AbsoluteFill style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
      <div className="absolute inset-0">
        <BackdropField theme={theme} variant="grid" intensity={0.25} />
      </div>
      <div className="ground absolute left-[${tall ? 64 : 120}px] right-[${tall ? 64 : 120}px] h-[6px] rounded-full" style={{ top: GROUND_Y, backgroundColor: colors.textMuted }} />
      <div className="thing absolute flex h-[120px] w-[120px] items-center justify-center rounded-full text-[76px] font-black" style={{ left: ${thing.left}, top: ${thing.top}, backgroundColor: colors.accentSecondary, color: colors.bgPrimary }}>{THING}</div>
      <RigCharacter id={HERO} left={${heroLeft}} groundY={GROUND_Y} />
      <div className="closing absolute text-[56px] font-black tracking-[-0.03em]" style={{ left: ${closePos.left}, top: ${closePos.top} }}>{CLOSING}</div>
    </AbsoluteFill>
  );
};

export default Scene;
`;
  const dirMd = `# Direction - ${title}

## Message (one-sentence goal)
EDIT: the one thing the viewer should remember, in one sentence.

## Audience
EDIT: who watches this, and where (feed, landing page, event screen).

## Look
- Palette: theme "${surfaceMode}" (colors come from getTheme, never hex in the Scene)
- Character: RigCharacter (src/primitives/characters/RigCharacter.tsx), animated only with the rig helpers in src/core/physics.ts
- Type: heavy sans closing line, 56px

## Beats
| id | seconds | what happens | helpers |
|---|---|---|---|
| arrive | ${(starts[1] / 60).toFixed(2)} | ground wipes in, the character rises, standing | wipe, rise |
| walk | ${((starts[2] - starts[1]) / 60).toFixed(2)} | ${STEPS} steps in, feet planted, weight settles | rigWalk |
| notice | ${((starts[3] - starts[2]) / 60).toFixed(2)} | a symbol pops; eyes, head, torso turn to it | pop, lookAt |
| react | ${((total - starts[3]) / 60).toFixed(2)} | crouch, hop, settle; closing line rises, then 1.2s hold | react, rise |

## Storyboard (per beat; the machine-checked cards live in spec.json beats[].board, see docs/STORYBOARD.md)
EDIT each board: focal = the one element to look at (a className in Scene.tsx), zone = 3x3 cell, start/end = the key poses a viewer sees,
text = on-screen strings, transitionIn = preset or cut, why = one clause of motivation. Cause comes before effect (the symbol appears, then the character reacts).
Order of work: boards, then the static layout, then \`pnpm render:poses --project ${slug}\`, then the motion.
Do not put your own tweens on rig parts; use rigWalk / lookAt / react / idleBreath / turn (docs/CHARACTER_ANIMATION.md).
`;
  fs.mkdirSync(p.dir, { recursive: true });
  fs.writeFileSync(p.direction, dirMd, "utf-8");
  fs.writeFileSync(p.spec, JSON.stringify(specV2, null, 2) + "\n", "utf-8");
  fs.writeFileSync(p.scene, scene, "utf-8");
  runNode("gen-registry.mjs");
  console.log(`\n${GREEN}${BOLD}✓ PROJECT CREATED (harness v2, character):${RESET} ${slug}`);
  console.log(`  Directory : ${rel(p.dir)}`);
  console.log(`  Aspect    : ${aspect} | ${dur}s | beats: ${ids.join(" > ")}`);
  console.log(`\nNext: edit the boards in ${rel(p.spec)} and the lines marked "// EDIT:" in ${rel(p.scene)}, then`);
  console.log(`  pnpm check --project ${slug}`);
  console.log(`  pnpm render:poses --project ${slug}\n`);
}

fs.mkdirSync(p.dir, { recursive: true });

// 1. direction.md
const directionContent = `# Direction — ${title}

## Tek Cümlelik Hedef
${title} sahnesi ile izleyiciye net, dinamik ve akıcı bir görsel deneyim sunmak.

## Paradigm
${mode}

## 3 Girdi Görev Ayrımı (The 3-Input Rule)
- **Script (Senaryo - Neyi/Niçin):** Sahnenin temel mesajı, problem-çözüm kurgusu ve değer önerisi.
- **Storyboard (Görsel Kurgu - Nasıl Görünüyor):** 3 katmanlı derinlik kompozisyonu, ışık açıları ve Hardware Shell pencere çapalaması.
- **Motion Reference (Hareket Dinamiği - Nasıl Hareket Ediyor):** Yay ve sönümlenme eğrileri, kavisli Bézier yolları ve kesintisiz kinetik devir teslim zinciri.

## 3 Katmanlı Derinlik Mimarisi (3-Layer Depth System)
- **Katman 1 (Zemin):** Atmosferik koyu mat zemin / difüze radyal degrade / 1px kılcal kılavuz ızgarası.
- **Katman 2 (İkincil Derinlik & İz):** Ön plandaki nesnenin arkasından gelen hayalet kontur (2-3f trailing lag) ve yumuşak ortam temas gölgesi.
- **Katman 3 (Kahraman Ön Plan):** Kristal netliğinde tipografi (min 18px), 1px pahlı speküler faset ve katı kahraman aktör.

## Kahraman Aktör Yaşam Döngüsü (Hero Actor Lifecycle)
0. kareden son kareye kadar sahnede fiziksel olarak yaşayan ($opacity > 0$) ana geometrik aktörün form dönüşüm zinciri:
[Başlangıç Formu] ➔ [Genişleyen Taşıyıcı] ➔ [Fonksiyonel Matris] ➔ [Nihai Marka Amblemi (>= 1.2s Stillness Hold)]

## Physics
Ağırlık ve ivmelenme prensipleri, yaylanma ve sönümlenme karakteri.
Örn: sert frenler, tok darbe oturması (power3.out, expo.out), 12 animasyon prensibi.

## Typography & Palette
Tipografi hiyerarşisi ve renk kararları.
Sıfır neon glow, sıfır mikro-font (min 18px), mat anlamsal renkler (#10b981 / #ef4444) ve nötr zinc paleti.
`;

// 2. spec.json
const totalFrames = Math.round(duration * 60);
const midFrame = Math.round(totalFrames / 2);

let beats = [];
let camera = [];
let transitions = [];

if (mode === "cinematic-world") {
  beats = [
    { id: "intro", startFrame: 0, endFrame: midFrame - 1, intent: "Sahneye giriş ve yaklaşma", action: "run" },
    { id: "action", startFrame: midFrame, endFrame: totalFrames, intent: "Vurgu aksiyonu", action: "shout", text: "HAZIR MISIN?!" },
  ];
  camera = [
    { at: 0.05, duration: 1.2, ease: "power2.out", intent: "Karaktere giriş takibi" },
    { at: midFrame / 60, duration: 0.2, ease: "back.out(2.0)", intent: "Aksiyon darbe zoom" },
    { at: Number((midFrame / 60 + 0.3).toFixed(2)), duration: 0.8, ease: "expo.out", intent: "Darbe sonrası yerleşme" },
  ];
} else {
  // editorial-ui & kinetic-poster: layered beats + transitions at beat boundaries (v2)
  const beatCount = Math.min(6, Math.max(2, Math.round(duration / 3.5)));
  const WEIGHTS = [1.0, 1.4, 0.8, 1.25, 0.9, 1.3].slice(0, beatCount);
  const wSum = WEIGHTS.reduce((a, b) => a + b, 0);
  let starts = WEIGHTS.map((_, i) => Math.round((WEIGHTS.slice(0, i).reduce((a, b) => a + b, 0) / wSum) * totalFrames));
  // Guarantee the final beat is at least 72 frames (1.2s Stillness Hold)
  if (totalFrames >= 180 && starts.length >= 2 && totalFrames - starts[starts.length - 1] < 72) {
    starts[starts.length - 1] = totalFrames - 72;
  }
  const NAMES = ["hook", "proof", "flow", "scale", "payoff", "outro"];
  beats = Array.from({ length: beatCount }, (_, i) => ({
    id: NAMES[i],
    startFrame: starts[i],
    endFrame: i === beatCount - 1 ? totalFrames : starts[i + 1] - 1,
    intent: i === 0 ? "Kanca: ana vaat" : i === beatCount - 1 ? "Kapanış: marka ve eylem çağrısı (1.2s stillness hold)" : "Gelişme: kanıt ve akış",
    action: NAMES[i],
  }));
  transitions = beats.slice(1).map((b, i) => ({
    type: TRANSITION_CYCLE[i % TRANSITION_CYCLE.length].type,
    atFrame: b.startFrame - 10,
    bridge: `.scene-beat-${i + 1}-card`,
  }));
  camera = [{ at: 0.05, duration: 1.0, ease: "power3.out", intent: "Açılışta sahneye yerleşme" }];
  transitions.forEach((t, i) => {
    camera.push({ at: Number((t.atFrame / 60).toFixed(2)), duration: 0.65, ease: "expo.inOut", intent: `Geçiş ${i + 1} ile kilitli kamera itişi` });
  });
}

const specContent = {
  $schema: "../../../specs/motion-spec.schema.json",
  version: 1,
  title,
  mode,
  aspect,
  fps: 60,
  durationInSeconds: duration,
  safeZone: { top: 250, bottom: 300 },
  theme: { surfaceMode },
  ...(mode === "cinematic-world" ? { continuousShot: true } : { transitions }),
  beats,
  camera,
  shakes: [],
  sfx: mode === "cinematic-world" ? [{ frame: midFrame, sfx: "roar-shockwave" }] : [],
};

// 3. Scene.tsx
let sceneContent = "";

if (mode === "cinematic-world") {
  sceneContent = `import { type FC } from 'react';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { WorldStage, CharacterActor, type ActorMotionSegment } from '../../world';

// Başlangıç dünyası: dwarf-arena arka planı. Kendi sahnen için public/projects/<slug>/ altına arka plan ekle.
export const SHOUT_TEXT = 'HAZIR MISIN?!';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const ACTOR_SEGMENTS: ActorMotionSegment[] = [
  {
    startFrame: 0,
    endFrame: ${midFrame - 1},
    fromX: -240,
    fromY: 200,
    toX: 0,
    toY: 220,
    fromScale: 2.2,
    toScale: 2.5,
    facingRight: true,
    action: 'run',
  },
  {
    startFrame: ${midFrame},
    endFrame: ${totalFrames},
    fromX: 0,
    fromY: 220,
    toX: 0,
    toY: 220,
    fromScale: 2.5,
    toScale: 2.55,
    facingRight: true,
    action: 'shout',
  },
];

export const Scene: FC<SceneProps> = ({ aspect = '${aspect}' }) => {
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 1.05, x: 80, y: -40 },
      { at: 0.05, duration: 1.2, scale: 1.15, x: 0, y: -60, ease: 'power2.out' },
      { at: ${Number((midFrame / 60).toFixed(2))}, duration: 0.2, scale: 1.28, x: 0, y: -90, ease: 'back.out(2.0)' },
      { at: ${Number((midFrame / 60 + 0.3).toFixed(2))}, duration: 0.8, scale: 1.18, x: 0, y: -60, ease: 'expo.out' },
    ]);
  }, []);

  return (
    <WorldStage aspect={aspect} backgroundSrc="projects/dwarf-arena/arena_bg.png">
      <CharacterActor segments={ACTOR_SEGMENTS} />
    </WorldStage>
  );
};

export default Scene;
`;
} else {
  const poster = mode === "kinetic-poster";
  const lines = [];
  const L = (s = "") => lines.push(s);
  L("import { type FC } from 'react';");
  L("import { AbsoluteFill } from 'remotion';");
  L("import { useRemotionGSAP } from '../../core/useRemotionGSAP';");
  L("import { animateCamera } from '../../core/choreography';");
  L("import { DURATIONS, EASING } from '../../core/tokens';");
  L("import { BackdropField } from '../../primitives';");
  L("import { getTheme, " + [...new Set(transitions.map((t) => TRANSITION_CYCLE.find((x) => x.type === t.type).fn))].join(", ") + " } from '../../core';");
  L();
  L("export interface SceneProps {");
  L("  aspect?: '9:16' | '16:9';");
  L("}");
  L();
  L("// Renkler HER ZAMAN temadan gelir (spec.theme.surfaceMode). Hex gömme.");
  L("const theme = getTheme('" + surfaceMode + "');");
  L();
  L("export const BEATS = [");
  beats.forEach((b) => L("  { id: '" + b.id + "', startFrame: " + b.startFrame + ", endFrame: " + b.endFrame + " },"));
  L("] as const;");
  L();
  L("export const Scene: FC<SceneProps> = () => {");
  L("  useRemotionGSAP((tl) => {");
  L("    animateCamera(tl, '.camera-rig', [");
  L("      { at: 0, duration: 0, scale: 1.04 },");
  camera.forEach((cm, i) => {
    L("      { at: " + cm.at + ", duration: " + cm.duration + ", scale: " + (i === 0 ? "1" : i % 2 ? "1.03" : "1") + ", ease: '" + cm.ease + "' },");
  });
  L("    ]);");
  L();
  beats.forEach((b, i) => {
    const t0 = Number((b.startFrame / 60).toFixed(2));
    const tEnd = Number((b.endFrame / 60).toFixed(2));
    const holdDur = Math.max(0.6, Number((tEnd - t0 - 0.35).toFixed(2)));
    L("    // Beat " + (i + 1) + " (" + b.id + "): giriş + sürekli intra-beat hareket (donuk slayt yasağı)");
    L("    tl.fromTo('.b" + (i + 1) + "-title', { opacity: 0, y: 40, scale: 0.94 }, { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut }, " + (i === 0 ? "0.1" : (t0 + 0.08).toFixed(2)) + ");");
    L("    tl.fromTo('.b" + (i + 1) + "-sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.powerOut }, " + (i === 0 ? "0.28" : (t0 + 0.22).toFixed(2)) + ");");
    L("    // Beat boyunca kesintisiz ölçek/derinlik akışı (intra-beat alive motion)");
    L("    tl.to('.b" + (i + 1) + "-stage', { scale: 1.06, y: -12, duration: " + holdDur + ", ease: 'sine.inOut' }, " + (t0 + 0.25).toFixed(2) + ");");
    if (i < beats.length - 1) {
      const tr = transitions[i];
      const at = (tr.atFrame / 60).toFixed(2);
      const out = ".scene-beat-" + (i + 1), inc = ".scene-beat-" + (i + 2);
      L("    // Geçiş " + (i + 1) + ": " + tr.type + " (kinetik devir teslim)");
      if (tr.type === "element-takeover") L("    transitionElementTakeover(tl, '.b" + (i + 1) + "-trigger', '" + out + "', '" + inc + "', { at: " + at + ", duration: DURATIONS.camera });");
      else if (tr.type === "camera-dive") L("    transitionCameraDive(tl, '.camera-rig', '" + out + "', '" + inc + "', { at: " + at + ", duration: DURATIONS.long, diveScale: 2.4 });");
      else L("    transitionMaskWipe(tl, '" + inc + "', { at: " + at + ", type: 'diagonal', duration: DURATIONS.scene, outgoingSelector: '" + out + "' });");
    }
    L();
  });
  L("  }, []);");
  L();
  L("  return (");
  L("    <AbsoluteFill style={{ backgroundColor: theme.colors.bgPrimary, color: theme.colors.textPrimary }}>");
  L("      <div className=\"camera-rig absolute inset-0\">");
  beats.forEach((b, i) => {
    const first = i === 0;
    L("        <section className=\"scene-beat-" + (i + 1) + " absolute inset-0 flex flex-col items-" + (poster ? "start" : "center") + " justify-center px-24 overflow-hidden\" style={{ opacity: " + (first ? 1 : 0) + ", backgroundColor: theme.colors." + (i % 2 ? "bgSurfaceSubtle" : "bgPrimary") + " }}>");
    L("          <BackdropField theme={theme} variant=\"" + ["mesh", "grid", "rings", "rays"][i % 4] + "\" intensity={0.6} />");
    L("          <div className=\"b" + (i + 1) + "-stage relative z-10 flex flex-col items-" + (poster ? "start" : "center") + " gap-6\">");
    L("            <h1 className={`b" + (i + 1) + "-title ${theme.typography.heroClass} " + (poster ? "" : "text-center") + "`} style={{ color: theme.colors.textPrimary, fontSize: " + (poster ? 188 : 128) + ", lineHeight: 0.98 }}>" + (first ? title : b.id.toUpperCase()) + "</h1>");
    L("            <p className={`b" + (i + 1) + "-sub b" + (i + 1) + "-trigger ${theme.typography.bodyClass} max-w-[960px]" + (poster ? "" : " text-center") + "`} style={{ color: theme.colors.textMuted, fontSize: 32 }}>" + b.intent + "</p>");
    L("          </div>");
    L("        </section>");
  });
  L("      </div>");
  L("    </AbsoluteFill>");
  L("  );");
  L("};");
  L();
  L("export default Scene;");
  sceneContent = lines.join("\n") + "\n";
}

fs.writeFileSync(p.direction, directionContent, "utf-8");
fs.writeFileSync(p.spec, JSON.stringify(specContent, null, 2), "utf-8");
fs.writeFileSync(p.scene, sceneContent, "utf-8");

// Update the registry
runNode("gen-registry.mjs");

console.log(`\n${GREEN}${BOLD}✓ PROJECT CREATED:${RESET} ${slug}`);
console.log(`  Directory : ${rel(p.dir)}`);
console.log(`  Paradigm  : ${mode}`);
console.log(`  Aspect    : ${aspect} (${ASPECT_DIMS[aspect][0]}x${ASPECT_DIMS[aspect][1]})`);
console.log(`  Duration  : ${duration}s (${totalFrames} frames @ 60 FPS)`);
console.log(`\nNext steps:`);
console.log(`  1. Review/Edit          : ${rel(p.direction)} & ${rel(p.spec)}`);
console.log(`  2. Storyboard Audit     : pnpm audit:storyboard --project ${slug}`);
console.log(`  3. Quality Gate Check   : pnpm check --project ${slug}`);
console.log(`  4. Visual Contact Sheet : pnpm render:contact-sheet --project ${slug}`);
console.log(`  5. Render MP4           : pnpm render --project ${slug}\n`);
