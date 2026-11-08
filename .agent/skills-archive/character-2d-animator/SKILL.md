---
name: character-2d-animator
description: 2D character sprite animator enforcing the 12 Principles of Animation (Squash & Stretch, Step Arc Bobbing, Velocity Lean, Braking Anticipation, Motion Trail, and Footstep Dust) via src/world/CharacterActor.
---

# Skill: 2D Character & World Animator (12 Animation Principles Specialist v2)

> Optional reference. RULES.md wins on any conflict.

---

## 1. ROLE & RESPONSIBILITY
You are the Senior Character Animator translating classic Disney and advanced platformer animation principles (`12 Principles of Animation`) into deterministic 60 FPS code. Sliding a character from point A to point B across raw `x/y` coordinates like an object on ice is **STRICTLY FORBIDDEN**.

---

## 2. THE 8-FRAME WALK / RUN CYCLE MATRIX

Every stride cycle consists of 8 core physical keyframes. Contact dynamics, body weight transfer, and vertical oscillation are computed from this matrix:

| Frame # | Phase Name | t (Cycle) | scaleX | scaleY | y (Bobbing) | skewX (Lean) | Contact Shadow | Dust Puff |
|---|---|---|---|---|---|---|---|---|
| **Frame 1** | **Contact (Lead Foot)** | 0.00 | 1.00 | 1.00 | 0px | +4° | 1.00 (Full) | Triggered (Left foot) |
| **Frame 2** | **Down / Recoil (Compression)** | 0.125 | 1.09 | 0.91 | +8px (Down) | +6° | 1.15 (Wide) | Spreads outward |
| **Frame 3** | **Passing 1 (Weight Balance)** | 0.25 | 0.98 | 1.02 | -6px (Up) | +2° | 0.92 (Medium) | Dissipating |
| **Frame 4** | **High-Point (Peak Launch)** | 0.375 | 0.94 | 1.07 | -18px (Apex) | 0° | 0.75 (Distant) | Airborne |
| **Frame 5** | **Contact Opp (Trail Foot)** | 0.50 | 1.00 | 1.00 | 0px | -4° | 1.00 (Full) | Triggered (Right foot) |
| **Frame 6** | **Down Opp (Second Recoil)** | 0.625 | 1.09 | 0.91 | +8px (Down) | -6° | 1.15 (Wide) | Spreads outward |
| **Frame 7** | **Passing 2 (Second Balance)** | 0.75 | 0.98 | 1.02 | -6px (Up) | -2° | 0.92 (Medium) | Dissipating |
| **Frame 8** | **High-Point 2 (Second Apex)** | 0.875 | 0.94 | 1.07 | -18px (Apex) | 0° | 0.75 (Distant) | Airborne |

---

## 3. MASS MULTIPLIERS & WEIGHT CLASSES

Different character archetypes navigate space with distinct mass and spring coefficients:

| Character Class | Example | Mass ($m$) | Stiffness ($k$) | Damping ($c$) | Squash Ratio ($S$) | Vertical Bob ($A$) |
|---|---|---|---|---|---|---|
| **Light** | Cloud, fairy, sprite | 0.45 | 180 | 16 | 0.95 / 1.05 | 8px |
| **Medium** | Human, dwarf, warrior | 1.00 | 240 | 28 | 0.91 / 1.09 | 18px |
| **Heavy** | Armored juggernaut, golem | 2.40 | 320 | 45 | 0.84 / 1.18 | 26px |
| **Colossus** | Mech, titan, mountain | 6.00 | 500 | 90 | 0.76 / 1.28 | 38px |

---

## 4. MATHEMATICAL SQUASH & STRETCH AND PARABOLIC STRIDE EQUATIONS

### 1. Parabolic Stride Bobbing:
Given stride angular frequency $\omega = 2\pi \times \text{stepFrequency}$, vertical translation is governed by:
$$y(t) = -A \cdot |\sin(\omega t)| + \text{recoilBias}(t)$$
At peak stride, the character reaches the apex; at $y=0$, the foot strikes the contact plane.

### 2. Volume-Preserving Squash & Stretch:
Coupled to vertical velocity $v_y(t) = y'(t)$:
$$\text{scaleY}(t) = 1.0 + \kappa \cdot \frac{v_y(t)}{v_{\max}}$$
$$\text{scaleX}(t) = \frac{1.0}{\sqrt{\text{scaleY}(t)}} \approx 1.0 - 0.5 \times (\text{scaleY}(t) - 1.0)$$
This ensures strict 2D **volume conservation**.

### 3. Braking Anticipation:
When decelerating abruptly into an idle or attack stance, during the final 12–16 frames:
- Reverse lean: $\text{skewX}: -8^\circ$
- Pre-impact crouch: $\text{scaleY}: 0.85, \text{scaleX}: 1.15$
- Stored kinetic potential energy is unleashed on the subsequent impact or roar frame.

---

## 5. GROUND CONTACT DYNAMICS & DUST PUFFS (`FootstepDust`)

1. **Dynamic Contact Shadow:**
   - As the character launches into the air, the shadow scales down and softens:
     $$\text{shadowScale} = 1.0 - 0.35 \times \frac{|y(t)|}{A_{\max}}$$
     $$\text{shadowBlur} = 4\text{px} + 12\text{px} \times \frac{|y(t)|}{A_{\max}}$$
2. **Footstep Dust:**
   - On the exact impact frame where $y=0$, 4 deterministic particles puff in the counter-motion vector (`x: -dir * 32px, y: -8px, opacity: 0.8 -> 0`).

---

## 6. CAMERA TRACKING & STAGE ENVIRONMENT (`WorldStage`)

- Characters are never boxed into narrow `300x300` viewports.
- `WorldStage` is rendered with overscan (e.g. $2100\times 1920$ virtual space).
- The camera rig tracks character coordinates with a damped spring lag (`cameraLag: 0.12s`) and leading visual offset (`leadOffset: +140px`) oriented towards the movement vector.
