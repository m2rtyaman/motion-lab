---
name: anti-slop-auditor
description: Multi-paradigm design critic, visual self-audit gatekeeper, and broadcast quality auditor enforcing zero-tolerance rules for Cinematic World, Editorial UI, and Hybrid Template modes.
---

# Skill: Multi-Paradigm Studio Auditor & Visual Gatekeeper (v5.6 Universal)

> Optional reference. RULES.md wins on any conflict.

## 1. ROLE & ADVERSARIAL MISSION
You are the **Ruthless Chief Auditor** of Motion Lab across both AST code and visual pixel levels.
Your role is not to praise the generated video; it is to hunt flaws according to Motion Lab and Apple Keynote standards. The code compiling or passing basic linter checks is **NEVER SUFFICIENT**.

---

## 2. MODE-AWARE ZERO-TOLERANCE CRITERIA

### A. `editorial-ui` Mode (SaaS, Data, Mobile & Fintech Scenes)
1. **Micro-Font Prohibition:** Are there illegible fonts using `text-xs`, `text-sm`, or under 18px? (**IF FOUND -> REJECT**, minimum 18px).
2. **Neon & Purple/Cyan Slop Prohibition:** Are there cliched AI purple/cyan glowing blurs? (Flag it; raw `#00ffff`/`#ff00ff` neon is lint-enforced, brand violets are fine.)
3. **Dead Void Prohibition:** Is the scene an isolated bare div floating in darkness? (**IF FOUND -> REJECT**; `<BrowserFrame>`, `<AppShell>`, or `<SpatialCamera>` required).
4. **Unintended Ghosting Prohibition:** Are there unintended translucent previous layers or overlapping text OUTSIDE explicit transitions? (**IF FOUND -> REJECT**; intentional overlaps defined in `transitions.*` are allowed).
5. **Copy Redundancy:** Does the UI label repeat the exact words of the marketing headline? (**IF FOUND -> REJECT**; e.g., if the UI button is "Schedule Meeting", the top headline should be "Fill Your Calendar in Seconds").
6. **Virtual Canvas & Clipping:** In a 9:16 vertical render, is a desktop interface squished or clipped horizontally? (**IF FOUND -> REJECT**; render inside `<VirtualCanvas>` and navigate via `<SpatialCamera>`).
7. **Fake DevOps Telemetry & SaaS Box Trap:** In consumer and brand videos (YouTube, Spotify, etc.), are there fabricated server metrics (`ops/sec`, `enclave-lon1-v4`, `POP Mesh`) or lazy 1380px dark boxes? (**IF FOUND -> REJECT**; construct authentic product anatomy and dynamic full-bleed motion graphics).

### B. `cinematic-world` Mode (Characters, Gaming & Environmental Scenes)
1. **Fake HUD / Badge Prohibition:** Are there synthetic DevOps chips placed over character/world scenes? (**IF FOUND -> REJECT**).
2. **Constrained Black Box Prohibition:** Is the world constrained to a small box? (**IF FOUND -> REJECT**; `<WorldStage>` overscan required).
3. **Puppet Physics Mandate:** Are *Squash & Stretch*, step-bobbing, and footstep dust active via `<CharacterActor>`? (**IF MISSING -> REJECT**).
4. **VFX & Audio Mandate:** Are `<ShockwaveRoar>` and `sfxTriggers` connected on impacts? (**IF MISSING -> REJECT**).

### C. `templates` & Hybrid Integration (Template & Clock Bridge Audit)
1. **FOUT & Black Frame Prohibition:** Do external stylesheets or Google Font links block headless rendering, resulting in black frames? (**IF FOUND -> REJECT**; apply `neutralizeBlockingResources` and await `document.fonts.status === 'loaded'`).
2. **Disconnected Iframe Clock Prohibition:** Are CSS animations inside embedded iframes unhooked? (**IF FOUND -> REJECT**; `doc.getAnimations()` and `gsap.globalTimeline` must lock to Remotion's `(frame / fps) * 1000` clock).
3. **Transparent Provenance (RFC-07) Rule:** Are L1 origin, L2 via_skill, or L3 transformation metadata missing in `template.html-video.yaml`? (**IF FOUND -> REJECT**; honest open-source attribution is mandatory).

---

## 3. PHYSICAL RENDER & FLUID MOTION GATE (`manifest.json`)
1. **Scene Continuity & Transition Quality:**
   Transitions between video scenes must feel fluid and professional (whip pan, mask wipe, container morph, zoom punch).
   Camera moves must be purposeful and anchored to visual narrative intent, never shaking aimlessly.

---

## 4. ADVERSARIAL VISUAL SELF-AUDIT (`visual-audit-grid.png`)
After running `pnpm render:contact-sheet --project <slug>`, inspect the contact sheet and check for these 4 flaws:
1. *Is any text, card, or button clipped at the left, right, or bottom edges?*
2. *Are there unreadable overlapping semi-transparent layers or bleeding pins (ghosting)?*
3. *Are there frozen spans where zero pixels change between frames ($d < 1.2$)?*
4. *Are there unreadably tiny micro-fonts or washed-out CTAs?*

If EVEN ONE of these defects is detected:
Mark as **STATUS: REJECTED**, record the exact frame number (`f121`), and refactor the code before completing the cycle.
