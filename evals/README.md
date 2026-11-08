# Motion Lab evals

Measures whether a model actually learned motion craft from `RULES.md` and `docs/`. No API keys and no model calls
live in this repo: you run any agent (Gemini CLI, DeepSeek agent, Claude Code, Codex ...) on a brief, then
`pnpm eval:score` grades what it produced from the audits.

## Layout
- `tasks/<id>/TASK.md` the client brief (8 tasks, each ends with a "Delivery spec" listing exactly what the scorer checks) and `rubric.json`
- `VISUAL_RUBRIC.md` yes/no questions per task for a vision model, answered from the contact sheet (see "Visual score")
- `solutions/<id>/` reference project per task (proves >= 90 is reachable; extra golden examples; type-checked by `tsc`)
- `fixtures/weak-bouncing-ball/` deliberately bad project (scores <= 50)
- `AGENT_PROMPT.md` the instructions block to give the model (storyboard, `render:poses`, then motion)
- `HELDOUT.md` how to score against private tasks kept outside the repo (`--tasks-dir`)
- `judges.json` the vision judges `--judge` may name (claude-opus, gemini-pro, human; add yours)
- `harness.lock.json` hashes of the harness files plus the pinned public projects (written by `pnpm eval:lock`, maintainers only; must equal the committed git HEAD copy)

## Run a model
1. Pick a task id: `kinetic-manifesto logo-sting product-ui-feature list-reveal bouncing-ball anticipation-jump character-walk-react stat-counter`.
2. Start the agent in the repo root with `evals/AGENT_PROMPT.md` as instructions. Replace `<TASK_ID>` and `<MODEL>`; use a fresh slug per model and run.

```bash
# Gemini CLI (non-interactive; any task id)
TASK=bouncing-ball; MODEL=gemini-flash
sed "s/<TASK_ID>/$TASK/g; s/<MODEL>/$MODEL/g" evals/AGENT_PROMPT.md > /tmp/prompt.md
gemini --yolo -p "$(cat /tmp/prompt.md)"
# Generic: DeepSeek or any agent CLI: same prompt text, same repo root, same slug rule eval-<task>-<model>
```
Give every model the same budget (iterations, time). Keep the repo clean between runs: `git status` should only show the new project folder.

## Score
```bash
pnpm eval:score --task bouncing-ball --project eval-bouncing-ball-gemini-flash   # one project, prints a table, writes out/evals/<slug>.json
pnpm eval:score --task bouncing-ball --dir evals/solutions/bouncing-ball         # any folder with spec.json + Scene.tsx
pnpm eval:all        # every src/projects/eval-* whose spec has "evalTask", as a leaderboard (out/evals/leaderboard.json)
pnpm test:evals      # scorer self-test (runs inside pnpm check)
```
Flags: `--json`, `--no-write`; `--no-probe` skips the real-browser probe (score capped at 70, "unverified"); `--dev` (maintainers) skips the lock-vs-git-HEAD comparison; `--tasks-dir <path>` score against private tasks (see [HELDOUT.md](HELDOUT.md));
`--render` optional strong mode (needs a browser): renders stills and checks that the windows where the timeline claims movement really change pixels (gate error R001);
`--skip-integrity` harness development only: skip the TAMPERED comparison with `harness.lock.json`. After intentionally changing harness files run `pnpm eval:lock` to re-pin the hashes.
Slug naming `eval-<task>-<model>` lets you filter `out/evals/*.json` per model. Compare models by the mean per task and overall.

## What the score means (0-100)
| Part | Pts | Meaning |
|---|---|---|
| Gate | 15 | Spec, AST lint, timeline audit and storyboard audit have 0 errors (T014 selector reality, V2-005, SB001/SB002 included). Any error caps the total at 30. |
| Craft | 25 | Timeline warnings T006-T014 (easing direction, speed, sync, rhythm, linear, dead time), each costs points; storyboard warnings (SB003-SB007) cost 2 each, max 8. `audit.allow` costs 5 per entry. |
| Rubric | 30 | Aspect, duration, beat count, 72-frame final hold, required preset/physics tags, preset ratio, rhythm, required code, plus the **on-screen checks** below (each worth 3 checks' weight). |
| Hygiene | 15 | Scene.tsx length, raw tweens, invented components, micro-fonts and emoji. |
| Copy | 15 | Every string of the brief appears in the code; no lorem/placeholder/Turkish/scaffold leftovers. |

**On-screen (behavior) checks** are computed from the real timeline (the audit seeks it frame by frame), not from keywords. If any fails the total is **capped at 80**, because the clip does not do what the brief describes (cap is lifted by fixing the behavior; the failed check is listed under "To fix").
| Task | Check |
|---|---|
| bouncing-ball | ball net travel >= 25% of the frame width; >= 3 rebounds with decreasing apex heights; scaleY <= 0.92 (squash) |
| anticipation-jump | a small opposite move (wind-up) directly before the big jump up |
| character-walk-react | one travel move >= 15% of the frame width; a `movingHold` >= 0.3 s after the walk and before the reaction; a wind-up before the reaction. Rubric behavior types (with `presets`): `lookLeadsReaction`, `reactAnticipates`, `holdBeforeReaction` |
| product-ui-feature, logo-sting, stat-counter, kinetic-manifesto | the closing hold shows the headline/brand and the CTA/tagline/label (last line for the manifesto) |

## Anti-cheat and integrity
| Code | Meaning |
|---|---|
| T014 | a selector in `buildTimeline` matches no `className`/`id` in JSX that can render (not inside `{false && ...}` / literal ternaries), or is not a plain class/id selector (`:not()`, `[attr]`, pseudo-classes): gate error, cannot be allowed. Classes generated by primitives are known (`RigCharacter`: `.<id>-root`, `.<id>-head`) |
| P001 P002 P003 P006 | browser probe gate errors: target never visible, claimed motion not visible, the page throws, node timeline differs from the browser timeline |
| P004 P007 | browser probe: low contrast (3 points as a warning, an error when the text/target paints nothing or is below 1.5:1, measured from the pixels after overlays), text under 18px or clipped (3 points) |
| P008 P009 | browser probe errors: the closing focal element is missing at some sample of the hold; closing text on screen in only part of the hold. P005 lists the text that is on screen AND painted at EVERY sample (every 6 frames) of the hold and feeds the closing-hold check |
| G003 | without the probe: `tsc --noEmit` over the project folder reports a type error |
| V2-006 | environment sniffing (`window`, `document`, `globalThis`, `self`, `top`, `parent`, `frames`, `opener`, `process`, `navigator`, `location`, `Function(`, `eval(`, `Reflect`, `.ownerDocument`/`.constructor` climbing, `__*` names, Remotion environment APIs, `import.meta.env`) in any project file; locals that share a name are fine |
| V2-013 | the project folder contains a file other than Scene.tsx, spec.json, direction.md, components/*.tsx, palette.ts, assets/ images (png/jpg/webp/gif/avif) |
| V2-007 | a project file imports or re-exports from `evals/` |
| audit.allow | only warnings can be suppressed; errors stay and say "allow ignored for error code X" |
| V2-005 | animating in React (`spring`, `interpolate`/`useCurrentFrame` for style, props, visibility); a frame-driven number may only be text |
| C001 | the project folder (every .ts/.tsx/.js/.css file concatenated, so a wrapper Scene.tsx does not hide a copy) is too close to a reference solution after Babel normalisation. Three metrics: strict (declared names -> ID, numbers -> N, strings kept), loose (strings -> S) as 5-gram shingles, and `bag`, an ORDER-INSENSITIVE multiset of normalised statement hashes (moving lines or inlining a const does not help). A metric fires when sim(solution) >= 0.6 AND sim(solution) >= pub + max(0.08, 0.35 x (1 - pub)), where pub is the best similarity to any pinned public example/study: the margin is relative to how close the candidate already is to the public projects, so adapting those stays legal. Honest independent solutions sit at 0.56-0.67 (strict) with >= 0.06 slack; reorder-4-lines + inline-a-const edits of a solution reach 0.90-0.96 strict / 0.97-0.98 bag. The baseline is the list pinned in the lock, not any folder with that prefix |
| R001 | with `--render`: the timeline claims movement but the rendered pixels do not change |
| TAMPERED | any protected file differs from `harness.lock.json`, or the lock differs from git HEAD (`--dev` skips only that second comparison). Protected: `scripts/`, `evals/tasks|solutions|judges.json|VISUAL_RUBRIC.md`, `src/core`, `src/primitives`, `src/remotion`, `src/engine`, `src/stage`, `src/components-v5`, every other `src/` folder the curated primitives import (computed transitively from `src/primitives/curated.ts`), `src/index.css`, `public/` (large binaries by name + size), the vite/tailwind/postcss/remotion configs, `specs/`, `docs/`, `.githooks/`, `RULES.md`, `package.json`, `tsconfig.json` and the pinned public projects. The score is 0 (the uncapped score is printed). `pnpm eval:lock` is for harness maintainers only, then commit the new lock |

Copy fidelity counts only **rendered** text (JSX text, strings and consts used in JSX, props of components), never comments, unused constants, attribute-only text (`title`, `alt`, `aria-*`, `data-*`, plain-element attributes), dead branches (`false &&`, `null &&`, literal ternaries, `const SHOW = false`) or elements hidden by their own markup (inline `display:none` / `visibility:hidden` / `opacity:0` / `hidden`) that no tween reveals. `requiredCode` regexes run on comment-stripped code. Hygiene (lines, components, raw tweens) counts every project file, not just Scene.tsx.
Rig helpers (`rigWalk`, `lookAt`, `react`, `idleBreath`, `turn`) count as one move per call for T007.

## Storyboard codes (scripts/storyboard-audit.mjs, see [docs/STORYBOARD.md](../docs/STORYBOARD.md))
Every v2 beat needs `board: { focal, zone, start, end, text, transitionIn, why }`. SB001 board missing/incomplete (error), SB002 `focal` not in the JSX (error),
SB003 reading time `1.5 s + words/15` (warning, error below half), SB004 same focal+zone without transition, SB005 `text` not rendered, SB006 final beat lacks closing text or hold in `why`, SB007 start equals end.
Storyboard errors are gate errors in `eval:score`; its warnings cost 2 craft points each (max 8). `pnpm render:poses --project <slug>` renders the key poses (start and end of every beat) to check the layout before motion.

**Browser probe.** `scripts/browser-probe.mjs` (headless Chrome) is run by `eval:score` by default when the file exists. With it the closing-hold check uses the text that is really visible in the final hold (P005) and hidden/covered/off-screen/never-rendered targets are gate errors. `--no-probe` (or a probe that cannot run) caps the score at 70 and labels it "unverified". Copy fidelity (required strings anywhere in the clip) still reads the source, because the probe only reports the final hold.
Without the probe the closing-hold check is a **heuristic** over the JSX and the timeline state at hold:start and at the end of the clip: it drops text in elements a tween leaves at opacity/scale/autoAlpha < 0.05, display:none, visibility:hidden or parked a frame away, elements hidden by their own markup, dead branches, attribute-only text, and text a later tweened full-bleed panel (`inset-0` plus a background) paints over. Elements without tweens count as visible; dynamic classNames and text drawn inside other components are not seen. `tsc --noEmit` over the project is then a gate (G003).

Bands: **90+** learned the docs and applied them; **60-89** works but ignores craft rules or the brief; **30-60** valid but naive
(hand-written tweens, no physics, missing copy); **<=30** does not pass the quality gate (often a crash or invalid spec).
Rubric fields (`rubric.json`): `aspect`, `durationSeconds`, `beats`, `requireHoldFinal`, `requiredTags[{label,anyOf}]`
(`enter:*` wildcard allowed), `forbiddenTags`, `minPresetRatio`, `minTweens`, `rhythm`, `maxWarnings{code|default}`,
`maxSceneLines`, `maxRawTweens`, `maxLocalComponents`, `requiredStrings` (string or `{anyOf}`), `requiredCode`, `forbiddenPatterns`.

## Visual score (separate, 0-100)
The structural score still does not see pixels. `VISUAL_RUBRIC.md` has 6-8 yes/no questions per task plus a generic block (legibility, safe zone, one focal point, no empty frames, no overlap, still last frame).
```bash
pnpm render:contact-sheet --project <slug>                    # out/<slug>/visual-audit-grid.png + out/<slug>/vision/frames/*.png
node scripts/eval-visual.mjs --project <slug>                 # prints the prompt: brief + questions + image paths + the SHA-256 of the contact sheet (and poses grid)
# give that prompt and the images to a vision model (or a person); save its reply as answers.json, repeating the hash(es) from the prompt:
#   { "imageHash": "<sha256>", "answers": { "bouncing-ball.travels": true, "generic.legible": true, ... } }
node scripts/eval-visual.mjs --compare --task <task> --project <slug>   # compare mode: the judge also sees the reference solution side by side; answers repeat imageHash AND referenceHash
node scripts/eval-visual.mjs --project <slug> --answers answers.json --judge <judge in evals/judges.json>   # prints "Structural NN/100" and "Visual NN/100"
```
The result is written to `out/evals/<slug>.visual.json`; `pnpm eval:score` then prints a "Visual /100" line under the structural score. It is
never folded into the structural 100. The answers are refused when the contact sheet does not exist, the answers JSON has no `imageHash` (and `posesHash` when a poses grid exists) or a hash differs from the file on disk. `--judge <name>` is required and must be an id or alias in `evals/judges.json`; if the judge is the model recorded as `"evalModel"` in the project's spec.json (else the slug suffix of `eval-<task>-<model>`) the visual score is marked "self-judged, not counted", so use a different model or a person.
**Honest limit:** visual answers are trust-based. The hash proves the answers were written for exactly that image file, not that anyone or anything looked at it, or that the judge is who it claims to be. Treat the visual score as advisory and re-judge anything that matters yourself. Task questions are 70 points, generic 30; unanswered questions count as false. Use a vision model that
is not the one being evaluated, or a person, and judge from the images only.

## Limits
The structural scorer reads timelines and source, not pixels. The on-screen checks above catch the big misses (ball in place, no headline in the
last frame) but not taste: layout balance, colour, whether a squash looks right, contrast. That is what the visual score is for.
Scores from small samples are noisy: run 3+ attempts per model and task before comparing.

## Design references for candidates
Models are pointed (AGENT_PROMPT.md read order) to `docs/DESIGN_SYSTEM.md`, `docs/COMPONENT_GALLERY.md` and `docs/COMPONENT_RECIPES.md` (BAD/GOOD pairs) and to the golden examples `example-editorial-data`, `example-social-promo` and `example-feature-tour`, which use the `components/` folder rules (RULES.md V2-008 to V2-012). New `example-*` projects must be added to the lock (`pnpm eval:lock`, run by the maintainer) before they count as pinned public projects.

## Flags, browser and signed renders (red-team round 3)
- **Flags are printed with every score** (human output, `--json`, `leaderboard.json`, the leaderboard): `--dev`, `--skip-integrity`, `--no-probe`, `--render`, `--tasks-dir` and the environment switches `CHECK_FAST`, `CHECK_PROBE`, `EVAL_TEST_PROBE`, `PROBE_GL`, `REMOTION_BROWSER_EXECUTABLE`. A score produced with `--dev`, `--skip-integrity` or `--no-probe` (or without a working probe) says **NOT VALID FOR COMPARISON** and `validForComparison: false` in the JSON. The agent prompt never uses these flags.
- **The probe cannot be told from the render.** The composition id is the slug, the entry adds no `window` property (GSAP is handed over through a script-scope binding, the measuring helpers run in an isolated JS world), and the lint bans the ways a scene could look for the difference (V2-006). `meta.browserInfo` records the executable, product and version; only Chrome, Edge and chrome-headless-shell are accepted.
- **Every visible text of the hold and every animated target is paint-checked from pixels** (hide-and-diff after overlays, blend modes, clip-paths, filters, SVG fill rules); a closing string counts only when it is on screen and painted at every hold sample.
- **Counters are verified in the browser.** Rubric behavior `{ "type": "textChanges", "selector"|"find", "minDistinct": 10, "monotonic": true, "final": "48,200" }` samples the element's text over the clip (`find` locates the element that shows that text at the end, so the model's class names do not matter). `{ "type": "targetVisible", "minFraction": 0.8 }` demands the moving subject on screen in >= 80% of every beat in which it moves.
- **Pictures come from the harness.** `pnpm render:contact-sheet` / `pnpm render:poses` write `out/<slug>/render-manifest.json` (SHA-256 of the image, hash of the project source, hash of `evals/harness.lock.json`, signature). `eval-visual` refuses images without a matching manifest or rendered from another source/lock, and `eval-score` recomputes the visual score from the stored answers and `VISUAL_RUBRIC.md` on every run (stored totals are ignored). Known limit: the signature is a plain hash, not a secret, so someone who re-implements the manifest writer could still forge one for a doctored picture; visual answers remain trust-based (see above).
