# DIRECTION: WHATSAPP MULTI-DEVICE & SEAMLESS ENCRYPTED SYNC (12s / 720 Frames @ 60 FPS)

## 1. Concept and Objective
This video is a clean, calm, and measured motion graphics film in the style of Apple and Linear, demonstrating WhatsApp's standalone Multi-Device architecture (working on desktop even when phone battery dies), end-to-end encrypted messaging, and 32-person group calls.

**One-Sentence Core Goal:** WhatsApp delivers secure, organized, and uninterrupted encrypted communication across all desktop and companion devices even when your primary phone is powered off.

- **Format:** 9:16 Vertical (1080x1920), 60 FPS deterministic Remotion sequence.
- **Duration:** 12 Seconds (720 Frames).
- **Design Language:** Clean iOS / WhatsApp daylight canvas (`#F8F9FA`) and dark mode surfaces (`#111B21`), Geist typography, 1px hairline coordinate grids, and authentic WhatsApp UI anatomy.
- **Zero AI Slop:** No fake server telemetry, no cyber glow vomiting, no generic system emojis. Authentic interface anatomy and measured CC0 sound design.

---

## 2. Three-Layer Depth Architecture & TheHeroActor Bridge
Pursuant to `references/MASTER_STORYBOARD_RULES.md`:
- **Layer 1 (Background Base):** Subtle atmospheric grid (`#F8F9FA` / `#0B141A`), ambient radial illumination, and soft diffused shadows.
- **Layer 2 (Secondary Depth & Ghost Outlines):** Trailing ghost outline offsets (2–3f lag), subtle contact shadows behind window frames, and ambient audio spectrum reflections.
- **Layer 3 (Foreground Hero Actor):** The continuous hero actor (`TheHeroActor` `#the-hero-actor`) mounts at frame 0 as the iPhone titanium chassis, smoothly morphs into the desktop chat card in Beat 2, expands into the 32-person encrypted call stage in Beat 4, and resolves into the official WhatsApp emerald emblem and CTA in Beat 5.

---

## 3. 5-Beat Storyboard Timeline
1. **Beat 1: Phone Battery Exhaustion (f000–f090 | 1.5s):**
   - iPhone titanium shell displaying WhatsApp conversation.
   - Battery indicator drops to 1% alert crimson; screen sleeps into standby.
   - Camera smoothly ascends above the phone.
   - SFX: `hover_or_small_ui` (subtle click & power-down).

2. **Beat 2: Desktop WhatsApp Web Sync (f091–f250 | 2.65s):**
   - Camera glides seamlessly into the laptop interface (`DeviceMockupStage desktop`).
   - WhatsApp Web syncs instantly without requiring phone network connection ("Synced and connected without your phone").
   - SFX: `movement` (whoosh) + `appear` (pop).

3. **Beat 3: Authentic Message Delivery & Double Blue Ticks (f251–f420 | 2.83s):**
   - Typewriter animation inside active conversation: "Is the launch presentation ready for tomorrow?".
   - Message sends and transitions immediately to double blue ticks (`✓✓`).
   - SFX: `typing` + `click` + `success` (confirmation pop).

4. **Beat 4: End-to-End Encrypted Group Call (f421–f580 | 2.65s):**
   - Desktop window expands into a 32-participant group call card (`ParticipantStudioTile`).
   - Dynamic emerald audio waveforms react to active speech.
   - Badge: "End-to-End Encrypted Audio & Video".
   - SFX: `appear` + `hover_or_small_ui`.

5. **Beat 5: Brand Resolve & Outro (f581–f720 | 2.33s):**
   - Camera pulls back with smooth `expo.out`.
   - Official emerald WhatsApp vector emblem locks in screen center.
   - High-contrast marketing headline: "Always connected. End-to-end encrypted."
   - SFX: `reveal` (impact) + `build_up` (subtle chime).
