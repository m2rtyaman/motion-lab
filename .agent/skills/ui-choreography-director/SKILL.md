---
name: ui-choreography-director
description: Comprehensive director for Apple and Linear style UI micro-interactions, organic cursor choreography, FLIP container transitions, and drawer/modal staging.
---

# Skill: UI Choreography Director (Interface & Cursor Choreography Director)

> **Read `motion-playbook` first.** Transition grammar, theme selection, camera discipline, and forbidden patterns are defined there; it supersedes all else in case of conflict.

---

## 1. ROLE & RESPONSIBILITY
You are the Senior UI Motion Director choreographing digital product interactions at the standard of Apple keynote videos, Linear.app interface flows, and Stripe launch reels. Your objective is not animating static screenshots, but bringing an authentic, responsive product experience to life.

---

## 2. ORGANIC CURSOR CHOREOGRAPHY

In a UI motion graphic, the viewer's eye follows the mouse cursor. If cursor movement is mechanical or linear, the video immediately looks amateur and synthetic.

### 1. Parabolic Bézier Trajectories
- Straight Euclidean lines are forbidden.
- Use `createCurvedCursorTrajectory` with a 20–25% curvature offset (`curvature: 0.22`) between start and target points.
- While accelerating, the cursor banks subtly into the movement vector (`rotateZ: 3.5°`), leveling back to 0° on arrival.

### 2. Magnetic Element Pull
- When the cursor enters a target element's hover threshold (~40px), the button or card is pulled elastico-magnetically toward the pointer (`x: pullX * 0.2, y: pullY * 0.2, scale: 1.03`).
- `src/core/recipes.ts: magneticElementPull`

### 3. Pre-Click Compression & Ripple Impulse
- Clicks must never be a single-frame `scale: 0.9` jump.
- Phase 1 (Anticipation): Cursor compresses (`scale: 0.88`) right before contact (`duration: DURATIONS.instant`).
- Phase 2 (Impact): Button depresses (`scale: 0.96`) while a circular click ripple expands (`scale: 0.4 -> 2.4, opacity: 0.8 -> 0`).
- Phase 3 (Settle): Cursor springs back to `scale: 1.0` via `expoOut`.
- `src/core/recipes.ts: cursorClickImpulse`

---

## 3. ZERO-REFLOW FLIP TRANSITIONS (First, Last, Invert, Play)

When an interface card expands into a modal dialog or a table row morphs into a detail pane, never animate CSS `width/height` (it triggers layout reflows and drops frames below 60 FPS).

### Mathematical FLIP Model:
1. **First:** Initial bounding box dimensions ($W_1, H_1$) and position ($X_1, Y_1$).
2. **Last:** Target bounding box dimensions ($W_2, H_2$) and position ($X_2, Y_2$).
3. **Invert:**
   - $\Delta X = X_1 - X_2$
   - $\Delta Y = Y_1 - Y_2$
   - $\text{scaleX} = W_1 / W_2$
   - $\text{scaleY} = H_1 / H_2$
4. **Play:**
   - Apply the inverted matrix to the target element: `transform: translate3d(ΔX, ΔY, 0) scale(scaleX, scaleY)`.
   - Tween to identity transform (`translate3d(0, 0, 0) scale(1, 1)`) via GSAP timeline.

```tsx
// src/core/recipes.ts: flipContainerTransition
flipContainerTransition(tl, '.expanded-dialog', at, {
  dx: initialX - targetX,
  dy: initialY - targetY,
  scaleX: initialWidth / targetWidth,
  scaleY: initialHeight / targetHeight,
  duration: DURATIONS.panel,
});
```

---

## 4. DRAWER & MODAL STAGING

When a modal or drawer opens, background layers respond dynamically:

1. **Background Depth Push:**
   - The background canvas retreats into depth:
     `scale: 0.94, y: -24px, filter: blur(6px) brightness(0.7)`.
2. **Specular Rim Illumination:**
   - The top edge of the elevated modal catches a crisp 1px specular highlight (`LIGHTING.specularRimTop`).
3. **Z-Axis Layer Cascade:**
   - Modal contents do not appear simultaneously; title, form inputs, and CTA buttons stagger sequentially (`TIMING.itemStagger`).

---

## 5. TAB INDICATOR GLIDE

When switching active tabs, the underline or indicator pill stretches directionally:
- Stretches along the motion vector upon launch (`scaleX: 1.25`).
- Snaps back to resting proportion upon arrival (`scaleX: 1.0`).
- `src/core/recipes.ts: tabIndicatorGlide`
