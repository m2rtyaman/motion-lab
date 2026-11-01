# Direction — MAKE IT LOUD (Hybrid 3D Kinetic Showreel)

## Paradigm
editorial-ui (Hybrid 3D + Precision DOM Telemetry)

## Concept
shneural ve Opus 5.5 Max altın referanslarının görsel ve ritmik mimarisine dayanan, 144 BPM frame-locked amiral gemisi vitrin sahnesi.
Dört çeyrekte (01 Pin Matrix, 02 Möbius Ribbon, 03 Liquid Chrome Torus, 04 Inflated Chrome Star) izleyiciye sürekli değişen, yüksek enerjili dokunsal bir görsel şölen sunulur.

## Physics & Timing
- **Ritim:** 144 BPM (1 beat = 25 frame, 1 bar = 100 frame).
- **Easing:** `expo.out`, `expo.inOut`, `power3.out`. Sıfır yaylanma gevşekliği, sert endüstriyel duruş.
- **3D Render:** `@remotion/three` `ThreeCanvas` üzerinden `frameloop="never"` ile doğrudan `useCurrentFrame()` saatine kilitli GPU instanced render.

## Typography & Palette
- **Zemin:** `#08090b` (Derin antrasit) ve `#d6d9ce` (Mühendislik çizim kağıdı).
- **Vurgu:** `#c4ff00` (Electric Acid Lime) ve `#f1f5f9` (Sıvı Krom Ayna).
- **Yayın Ölçeği:** Minimum font boyutu 18px (Broadcast compliant).
- **Sıfır Slop:** Mor-cyan yapay zeka jeneriği yasak, katı monokrom + asit vurgulu editoryal saflık.
