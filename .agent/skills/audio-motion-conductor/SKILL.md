---
name: audio-motion-conductor
description: Guide for connecting music_map.json beat, downbeat, RMS and spectral data to Remotion GSAP timelines and procedural sound design.
---

# Skill: Audio-Motion Conductor (Ses & Ritim Orkestrasyon Yönetmeni)

> **Önce `motion-playbook` skill'ini oku.** Geçiş gramerleri, tema seçimi, kamera disiplini ve yasaklı kalıplar orada tanımlıdır; çelişkide o geçerlidir.

---

## 1. ROL VE SORUMLULUK
Sen müzik, ses efektleri ve görsel hareketi tek bir deterministik orkestraya dönüştüren Ses-Hareket Kondüktörüsün. Bir videoda ses yalnızca arkadan çalan bir arka plan melodisi değildir; görsel animasyonun fiziksel itici gücüdür. Her darbe, geçiş, kamera vuruşu ve tipografik patlama müziğin ritim haritasıyla (`music_map.json`) kare bazında kilitlenir.

---

## 2. RİTİM HARİTASI MİMARİSİ (`music_map.json`)

Müzik parçası prodüksiyona girmeden önce spektral ve geçici analizden geçirilir:

```json
{
  "bpm": 128,
  "timeSignature": [4, 4],
  "fps": 60,
  "downbeats": [0, 112, 225, 337, 450, 562],
  "beats": [0, 28, 56, 84, 112, 140, 168, 196, 225],
  "energyBands": {
    "subBass": [0.1, 0.85, 0.12, 0.95],
    "snareClap": [0.0, 0.0, 0.9, 0.0],
    "highHat": [0.3, 0.4, 0.5, 0.3]
  },
  "rmsEnvelope": [0.15, 0.22, 0.65, 0.88, 0.3]
}
```

---

## 3. FREKANS VE VURUŞ EŞLEŞTİRME KURALLARI (Audio-to-Visual Grammar)

| Ses Olayı (Trigger) | Müzikal Unsur | Görsel Karşılık (Visual Action) | GSAP Reçetesi |
|---|---|---|---|
| **Downbeat (Bar Başı - 1)** | Ağır Kick + Bas | Sahne / Beat Geçişi veya Büyük Kamera İtişi | `transitionWhipPan` / `transitionZoomPunch` |
| **Snare / Clap (2 ve 4)** | Keskin Orta Frekans | Darbe Sarsıntısı ve Kromatik Vurgu | `impactShake` / `chromaticAberrationPulse` |
| **Sub-Bass Drop** | Derin Bas (30–80Hz) | Sahne Arka Plan Titreşimi (`scale: 1.02 -> 1.0`) | `dollyZoomVertigo` / `springSettle` |
| **Hi-Hat / Percussion** | Yüksek Frekans (8kHz+) | Glif Titremesi veya İmleç Tıklaması | `scrambleTextDecode` / `cursorClickImpulse` |
| **Silence / Drop Öncesi** | Müzikal Durgunluk | Öngörülü Durgunluk (Anticipatory Stillness) | 300–500 ms sıfır kamera hareketi |

---

## 4. DETERMINİSTİK TIMELINE ENTEGRASYONU (`useRemotionGSAP`)

Remotion video render motorunda ses `tl.seek(frame / fps)` determinizmiyle görselle bağlanır:

```tsx
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { impactShake, chromaticAberrationPulse } from '../../core/recipes';
import musicMap from './music_map.json';

export const AudioReactiveStage: React.FC = () => {
  const fps = 60;

  const { timeline, scopeRef } = useRemotionGSAP((tl) => {
    // 1. Her downbeat karesinde kamera darbesi
    musicMap.downbeats.forEach((downbeatFrame) => {
      const atSeconds = downbeatFrame / fps;
      impactShake(tl, '.stage-camera', atSeconds, 8);
    });

    // 2. Snare / Clap vuruşlarında kromatik darbe
    musicMap.beats.forEach((beatFrame, index) => {
      // 2. ve 4. vuruşlar (snare)
      if (index % 2 === 1) {
        const atSeconds = beatFrame / fps;
        chromaticAberrationPulse(tl, '.hero-metric', atSeconds, 1.05);
      }
    });
  }, [fps]);

  return (
    <div ref={scopeRef} className="relative w-full h-full">
      {/* Sahne bileşenleri */}
    </div>
  );
};
```

---

## 5. SES EFEKTİ (SFX) VE HAREKET ZAMANLAMASI KURALLARI

1. **Ses Hareketi Takip Etmez, Hareketle Doğar:**
   - Bir kart ekrana çarptığı anda (`y: 0`) tok SFX ("thud / impact") tetiklenir.
   - Sesi 3 kare sonra oynatmak gecikme ve lag hissi yaratır.
2. **Whip-Pan Whoosh Sesi:**
   - Whip geçişi başlamadan **3–5 kare önce** ses yükselmeye (crescendo) başlar ve geçişin tam ortasında (iki sahnenin kesişiminde) tepe noktasına ulaşır.
3. **Muted UI Ticks:**
   - Sayaç (`rollingNumberOdometer`) dönerken her rakam geçişinde `procedural-audio` üzerinden mikro klikler üretilir.
