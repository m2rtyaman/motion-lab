---
name: explainer-default
description: Make a clean 45–90 second product demo video for any software product, rendered from code to MP4 with Remotion and GSAP. Airy light canvas, short centred lines the camera pushes into, the product's own UI rebuilt and shown up close as it is used (typing, results, tables, clicks), integrations, and a logo close. Use when someone wants a product demo, launch video, feature walkthrough or "how it works" video for an app, SaaS or tool.
---

# Clean Product Walkthrough & Explainer (Remotion & GSAP)

A polished, broadcast-quality product walkthrough rendered deterministically with **Remotion and GSAP**.

## 1. Principles

1. **Light / Airy Canvas:** Uses clean light-mode or warm editorial backgrounds (`#FFFFFF`, `#F9F9F9`, or `#FAF8F5`) with crisp hairline borders (`border-neutral-200/80`). Avoids dark-mode gamer clichés for everyday SaaS and productivity apps.
2. **Authentic UI Rebuild:** Rebuild real UI layouts (search bars, tables, modal dialogs, cards) rather than fake DevOps telemetry or placeholder blocks.
3. **Macro Close-Ups:** The camera smoothly pushes in to simulate natural viewing focus (`scale: 1.15 to 1.35`), highlighting typing in inputs, cursor clicks, and instant system reactions.
4. **Never Invent Facts:** Labels and numbers must reflect true product capabilities or credible sample data.
5. **60 FPS Deterministism:** Animates exclusively via `useRemotionGSAP` using `transform`, `opacity`, and `filter`.

## 2. Remotion Lifecycle

### Step 1: Scaffold Project
```bash
pnpm new <slug> --mode editorial-ui --aspect 16:9 --duration 30
```

### Step 2: Storyboard Specification (`spec.json`)
Divide the product narrative into 1.0–1.5s beats:
- Problem introduction & clean title
- Step 1: Input / Search / Action
- Step 2: Data processing / Real-time response
- Step 3: Result dashboard & metrics
- Conclusion: Brand identity & call-to-action hold (min 72 frames)

### Step 3: Implement `Scene.tsx`
```tsx
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/deterministic';
import { CameraRig } from '../../primitives/CameraRig';
import { SpotlightStage } from '../../primitives/SpotlightStage';

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  const containerRef = useRemotionGSAP((tl) => {
    // Camera intro push
    tl.fromTo('.camera-rig', { scale: 0.95, opacity: 0 }, { scale: 1.0, opacity: 1, duration: 1.0, ease: 'power2.out' }, 0);
    // UI typing and interaction
    tl.to('#search-input', { width: 480, duration: 0.8, ease: 'power3.out' }, 1.2);
    // Results table fade-and-rise
    tl.fromTo('.result-row', { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, 2.4);
    // Focus zoom into detail card
    tl.to('.camera-rig', { scale: 1.25, x: -100, y: -60, duration: 1.4, ease: 'expo.inOut' }, 4.5);
  });

  return (
    <AbsoluteFill ref={containerRef} className="bg-[#FAF8F5] text-neutral-900 overflow-hidden font-sans">
      <SpotlightStage className="w-full h-full">
        <CameraRig className="camera-rig flex items-center justify-center w-full h-full">
          {/* Authentic UI components */}
          <div className="w-[1080px] bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
            <input id="search-input" className="w-64 border rounded-lg px-4 py-2" readOnly value="Analyze customer churn" />
            <div className="mt-6 space-y-3">
              <div className="result-row p-4 rounded-lg bg-neutral-50 border border-neutral-100">Cohort retention +14.2%</div>
            </div>
          </div>
        </CameraRig>
      </SpotlightStage>
    </AbsoluteFill>
  );
};
```

### Step 4: Validate and Render
```bash
pnpm check --project <slug>
pnpm render --project <slug>
```
