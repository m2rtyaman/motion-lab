import React, { useMemo } from 'react';
import { useCurrentFrame } from 'remotion';
import { solveSpringFrame } from '../../core/spring-solver.ts';
import { SPRING } from '../../core/tokens.ts';
import { TheHeroActor } from '../../primitives/bridges/TheHeroActor.tsx';
import { transitionContainerMorph } from '../../core/transitions.ts';

/**
 * ONE CONTINUOUS MORPHING SHAPE
 * Dribbble-grade, 120 BPM, 7-bar (28-beat, 840 frames @ 60 FPS, 14.0s) UI motion study.
 * 
 * Akış (Flow):
 * Button → Loader → Check → Dynamic Island → Music Player (play/pause morph) → 
 * Scrub Progress Bar → Volume Slider (overstretch & snapback) → 
 * Toggle Switch (asymmetric flip) → Liquid Tab Indicator (asymmetric lead/trail spring) → 
 * Chart Canvas (self-drawing spline & hover tooltip) → 
 * ⌘K Command Palette (filtering & enter) → Toast Notification → 
 * Başlangıçtaki Button'a pürüzsüz geri dönüş (Infinite Seamless Loop).
 */

// Beat zamanlama sözleşmesi (scripts/validate-spec.mjs uyumluluğu)
export const SPEC_BEATS = [
  { id: 'btn-approach', startFrame: 0, endFrame: 45, text: 'Export Frame' },
  { id: 'btn-loader', startFrame: 46, endFrame: 85 },
  { id: 'loader-check', startFrame: 86, endFrame: 125 },
  { id: 'check-island', startFrame: 126, endFrame: 185 },
  { id: 'music-player', startFrame: 186, endFrame: 285 },
  { id: 'scrub-bar', startFrame: 286, endFrame: 365 },
  { id: 'volume-slider', startFrame: 366, endFrame: 465 },
  { id: 'toggle-switch', startFrame: 466, endFrame: 535 },
  { id: 'liquid-tabs', startFrame: 536, endFrame: 615 },
  { id: 'chart-canvas', startFrame: 616, endFrame: 715 },
  { id: 'command-palette', startFrame: 716, endFrame: 765 },
  { id: 'toast-return', startFrame: 766, endFrame: 840 },
];

// Kamera koreografi tablosu (scripts/validate-spec.mjs SPEC_CAMERA kilit noktaları)
export const SPEC_CAMERA = [
  { at: 0.0, zoom: 2.20 },
  { at: 1.8, zoom: 1.90 },
  { at: 3.2, zoom: 1.60 },
  { at: 5.0, zoom: 1.65 },
  { at: 6.5, zoom: 1.75 },
  { at: 8.0, zoom: 2.60 },
  { at: 9.3, zoom: 1.65 },
  { at: 10.8, zoom: 1.45 },
  { at: 12.4, zoom: 2.20 },
];

// Yardımcı matematik fonksiyonları
const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * Organik kavisli imleç yörüngesi hesaplayıcısı (createCurvedCursorTrajectory & cursorNaturalPath)
 */
export function createCurvedCursorTrajectory(
  p0: { x: number; y: number },
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  t: number
) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

export const cursorNaturalPath = createCurvedCursorTrajectory;

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  void transitionContainerMorph;

  // ---------------------------------------------------------------------------
  // 1. DİNAMİK KAMERA HAREKETİ (Her durumu kadrajda büyüterek ortalar)
  // ---------------------------------------------------------------------------
  const cameraZoom = useMemo(() => {
    if (frame < 45) return 2.20;
    if (frame < 85) return solveSpringFrame({ frame, startFrame: 45, from: 2.20, to: 2.30, ...SPRING.cameraTrack }).value;
    if (frame < 125) return 2.30;
    if (frame < 185) return solveSpringFrame({ frame, startFrame: 125, from: 2.30, to: 1.90, ...SPRING.cameraTrack }).value;
    if (frame < 285) return solveSpringFrame({ frame, startFrame: 185, from: 1.90, to: 1.60, ...SPRING.cameraTrack }).value;
    if (frame < 365) return solveSpringFrame({ frame, startFrame: 285, from: 1.60, to: 1.65, ...SPRING.cameraTrack }).value;
    if (frame < 465) return solveSpringFrame({ frame, startFrame: 365, from: 1.65, to: 1.75, ...SPRING.cameraTrack }).value;
    if (frame < 535) return solveSpringFrame({ frame, startFrame: 465, from: 1.75, to: 2.60, ...SPRING.cameraTrack }).value;
    if (frame < 615) return solveSpringFrame({ frame, startFrame: 535, from: 2.60, to: 1.65, ...SPRING.cameraTrack }).value;
    if (frame < 715) return solveSpringFrame({ frame, startFrame: 615, from: 1.65, to: 1.45, ...SPRING.cameraTrack }).value;
    if (frame < 765) return solveSpringFrame({ frame, startFrame: 715, from: 1.45, to: 1.60, ...SPRING.cameraTrack }).value;
    if (frame >= 835) return 2.20;
    return solveSpringFrame({ frame, startFrame: 765, from: 1.60, to: 2.20, ...SPRING.cameraTrack }).value;
  }, [frame]);

  // Ambient mikro titreşim: 840 karede tam 4 döngü tamamlayarak f839 -> f0 sıfır sıçrama garantisi verir
  const ambientBreath = Math.sin((frame * 2 * Math.PI * 4) / 840) * 0.5;

  // ---------------------------------------------------------------------------
  // 2. THE HERO ACTOR / TEK KAP MORFOLOJİSİ (Width, Height, Radius, Background)
  // ---------------------------------------------------------------------------
  const shape = useMemo(() => {
    let width = 240;
    let height = 56;
    let radius = 28;
    let bg = '#0A0A0A';
    let scaleX = 1;
    let scaleY = 1;

    // Durum 1: Başlangıç Butonu (f0 - f45)
    if (frame < 46) {
      width = 240;
      height = 56;
      radius = 28;
      // Tıklama dürtüsü f30 - f38
      if (frame >= 30 && frame <= 38) {
        const press = Math.sin(((frame - 30) / 8) * Math.PI);
        scaleX = 1 - press * 0.06;
        scaleY = 1 - press * 0.06;
      }
      if (frame >= 38) {
        // Butondan Loader çemberine büzülme
        const s = solveSpringFrame({ frame, startFrame: 38, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(240, 56, s);
      }
    }
    // Durum 2 & 3: Loader & Checkmark (f46 - f125)
    else if (frame < 126) {
      width = 56;
      height = 56;
      radius = 28;
      if (frame >= 86 && frame <= 100) {
        // Checkmark belirişinde mikro-punch
        const pop = Math.sin(((frame - 86) / 14) * Math.PI);
        scaleX = 1 + pop * 0.08;
        scaleY = 1 + pop * 0.08;
      }
      if (frame >= 122) {
        // Dynamic Island'a geçiş morfu başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 122, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(56, 320, s);
        height = lerp(56, 44, s);
        radius = lerp(28, 22, s);
      }
    }
    // Durum 4: Dynamic Island (f126 - f185)
    else if (frame < 186) {
      if (frame < 182) {
        const s = solveSpringFrame({ frame, startFrame: 122, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(56, 320, s);
        height = lerp(56, 44, s);
        radius = lerp(28, 22, s);
      } else {
        // Müzik çalar kartına açılma başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 182, from: 0, to: 1, ...SPRING.cameraTrack }).value;
        width = lerp(320, 420, s);
        height = lerp(44, 160, s);
        radius = lerp(22, 24, s);
      }
    }
    // Durum 5: Müzik Çalar Kartı (f186 - f285)
    else if (frame < 286) {
      if (frame < 282) {
        const s = solveSpringFrame({ frame, startFrame: 182, from: 0, to: 1, ...SPRING.cameraTrack }).value;
        width = lerp(320, 420, s);
        height = lerp(44, 160, s);
        radius = lerp(22, 24, s);
      } else {
        // Scrub bar'a büzülme başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 282, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(420, 520, s);
        height = lerp(160, 50, s);
        radius = lerp(24, 25, s);
      }
    }
    // Durum 6: Scrub Progress Bar (f286 - f365)
    else if (frame < 366) {
      if (frame < 362) {
        const s = solveSpringFrame({ frame, startFrame: 282, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(420, 520, s);
        height = lerp(160, 50, s);
        radius = lerp(24, 25, s);
      } else {
        // Volume slider'a geçiş başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 362, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(520, 460, s);
        height = lerp(50, 56, s);
        radius = lerp(25, 28, s);
      }
    }
    // Durum 7: Volume Slider & Boundary Overstretch (f366 - f465)
    else if (frame < 466) {
      const sIntro = solveSpringFrame({ frame, startFrame: 362, from: 0, to: 1, ...SPRING.morphSnappy }).value;
      width = lerp(520, 460, sIntro);
      height = lerp(50, 56, sIntro);
      radius = lerp(25, 28, sIntro);

      // Doğrudan manipülasyon: 100% sınır aşımı ve fiziksel esneme (f414 - f430)
      if (frame >= 414 && frame < 430) {
        const pullProgress = (frame - 414) / 16;
        const stretchAmount = Math.sin(pullProgress * Math.PI) * 44;
        scaleX = 1 + (stretchAmount / 44) * 0.08;
        scaleY = 1 - (stretchAmount / 44) * 0.05;
      } else if (frame >= 430 && frame < 462) {
        // Bırakılınca elastik geri yaylanma (snapback)
        const snap = solveSpringFrame({ frame, startFrame: 430, from: 0.08, to: 0, ...SPRING.snapback }).value;
        scaleX = 1 + snap;
        scaleY = 1 - snap * 0.6;
      } else if (frame >= 462) {
        // Toggle switch'e büzülme başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 462, from: 0, to: 1, ...SPRING.snappy }).value;
        width = lerp(460, 120, s);
        height = lerp(56, 68, s);
        radius = lerp(28, 34, s);
      }
    }
    // Durum 8: Toggle Switch (f466 - f535)
    else if (frame < 536) {
      if (frame < 532) {
        const s = solveSpringFrame({ frame, startFrame: 462, from: 0, to: 1, ...SPRING.snappy }).value;
        width = lerp(460, 120, s);
        height = lerp(56, 68, s);
        radius = lerp(28, 34, s);
      } else {
        // Liquid tabs barına açılma başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 532, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(120, 540, s);
        height = lerp(68, 58, s);
        radius = lerp(34, 29, s);
      }

      // Toggle sağa döndüğünde arka plan Electric Indigo olur
      if (frame >= 496 && frame < 532) {
        const bgT = clamp((frame - 496) / 10, 0, 1);
        bg = bgT >= 0.8 ? '#5E5CE6' : '#262626';
      }
    }
    // Durum 9: Liquid Tab Bar (f536 - f615)
    else if (frame < 616) {
      if (frame < 612) {
        const s = solveSpringFrame({ frame, startFrame: 532, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(120, 540, s);
        height = lerp(68, 58, s);
        radius = lerp(34, 29, s);
      } else {
        // Chart tuvaline açılma başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 612, from: 0, to: 1, ...SPRING.cameraTrack }).value;
        width = lerp(540, 640, s);
        height = lerp(58, 340, s);
        radius = lerp(29, 24, s);
      }
      bg = '#0A0A0A';
    }
    // Durum 10: Chart Canvas (f616 - f715)
    else if (frame < 716) {
      if (frame < 712) {
        const s = solveSpringFrame({ frame, startFrame: 612, from: 0, to: 1, ...SPRING.cameraTrack }).value;
        width = lerp(540, 640, s);
        height = lerp(58, 340, s);
        radius = lerp(29, 24, s);
      } else {
        // Command palette'e geçiş başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 712, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(640, 560, s);
        height = lerp(340, 64, s);
        radius = lerp(24, 20, s);
      }
    }
    // Durum 11: ⌘K Command Palette (f716 - f765)
    else if (frame < 766) {
      if (frame < 762) {
        const s = solveSpringFrame({ frame, startFrame: 712, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(640, 560, s);
        const isExpanded = frame >= 728 && frame < 752;
        const hTarget = isExpanded ? 240 : 64;
        height = lerp(340, hTarget, s);
        radius = lerp(24, 20, s);
      } else {
        // Toast bildirimine geçiş başlangıcı
        const s = solveSpringFrame({ frame, startFrame: 762, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(560, 380, s);
        height = lerp(64, 56, s);
        radius = lerp(20, 28, s);
      }
    }
    // Durum 12 & 13: Toast Notification & Geri Dönüş (f766 - f840)
    else {
      // f766 - f805 arası Toast
      if (frame < 806) {
        const s = solveSpringFrame({ frame, startFrame: 762, from: 0, to: 1, ...SPRING.morphSnappy }).value;
        width = lerp(560, 380, s);
        height = lerp(64, 56, s);
        radius = lerp(20, 28, s);
      } else {
        // f806 - f839 arası başlangıç butonuna kusursuz geri dönüş!
        // f835+'da TAM OLARAK w:240, h:56, r:28 değerine kilitlenir.
        if (frame >= 835) {
          width = 240;
          height = 56;
          radius = 28;
        } else {
          const sReturn = solveSpringFrame({ frame, startFrame: 806, from: 0, to: 1, ...SPRING.morphSnappy }).value;
          width = lerp(380, 240, sReturn);
          height = 56;
          radius = 28;
        }
      }
    }

    return {
      width: Math.round(width * 10) / 10,
      height: Math.round(height * 10) / 10,
      radius: Math.round(radius * 10) / 10,
      bg,
      scaleX,
      scaleY,
    };
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 3. DOĞRUDAN MANİPÜLASYON İMLECİ (Merkez-Referanslı Koordinat Sistemi)
  // (x: 0, y: 0 daima TheHeroActor'ün geometrik merkezidir)
  // ---------------------------------------------------------------------------
  const cursor = useMemo(() => {
    let x = 360;
    let y = 320;
    let opacity = 0;
    let isClicking = false;

    // Beat 1: Butona kavisli yaklaşım ve merkez tıklama (f0 - f45)
    if (frame <= 45) {
      const t = clamp(frame / 30, 0, 1);
      const pt = createCurvedCursorTrajectory({ x: 360, y: 320 }, { x: 220, y: 180 }, { x: 60, y: 60 }, { x: 0, y: 0 }, t);
      x = pt.x;
      y = pt.y;
      opacity = clamp(frame / 10, 0, 1);
      isClicking = frame >= 30 && frame <= 38;
      if (frame > 38) opacity = clamp((45 - frame) / 7, 0, 1);
    }
    // Beat 5: Müzik çalar play butonuna tıklama (f210 - f245)
    // Play butonunun merkez koordinatı: x: -168, y: +38
    else if (frame >= 210 && frame <= 245) {
      const t = clamp((frame - 210) / 16, 0, 1);
      const pt = createCurvedCursorTrajectory({ x: 120, y: 100 }, { x: 40, y: 80 }, { x: -80, y: 50 }, { x: -168, y: 38 }, t);
      x = pt.x;
      y = pt.y;
      opacity = clamp((frame - 210) / 8, 0, 1);
      isClicking = frame >= 226 && frame <= 236;
      if (frame > 236) opacity = clamp((245 - frame) / 9, 0, 1);
    }
    // Beat 6: Scrub Bar Knob Sürükleme (f300 - f360)
    // Track genişliği 344px (-172px'den +172px'e).
    // %25 konumu: x: -86, %75 konumu: x: +86
    else if (frame >= 300 && frame <= 360) {
      opacity = clamp((frame - 300) / 8, 0, 1);
      if (frame < 312) {
        // Knob'a yaklaşma
        const t = (frame - 300) / 12;
        x = lerp(-30, -86, t);
        y = lerp(40, 0, t);
      } else if (frame <= 348) {
        // Tutup sürükleme: -86'dan +86'ya
        const dragT = (frame - 312) / 36;
        x = lerp(-86, 86, dragT);
        y = 0;
        isClicking = true;
      } else {
        // Bırakıp uzaklaşma
        const tExit = (frame - 348) / 12;
        x = lerp(86, 140, tExit);
        y = lerp(0, 30, tExit);
        opacity = clamp((360 - frame) / 12, 0, 1);
      }
    }
    // Beat 7: Volume Slider Sınır Aşımı (f390 - f455)
    // Track genişliği 310px (-168px'den +142px'e).
    // %84 konumu: x: +92.4, %100 konumu: x: +142
    else if (frame >= 390 && frame <= 455) {
      opacity = clamp((frame - 390) / 8, 0, 1);
      if (frame < 402) {
        x = lerp(30, 92.4, (frame - 390) / 12);
        y = lerp(30, 0, (frame - 390) / 12);
      } else if (frame <= 414) {
        // 84%'ten 100%'e çekiş
        const t = (frame - 402) / 12;
        x = lerp(92.4, 142, t);
        y = 0;
        isClicking = true;
      } else if (frame <= 430) {
        // Sınır aşımı: 100%'den +190px'e aşırı esnetme
        const overT = Math.sin(((frame - 414) / 16) * Math.PI);
        x = 142 + overT * 48;
        y = 0;
        isClicking = true;
      } else {
        // Bırakış ve uzaklaşma
        x = lerp(142, 200, (frame - 430) / 25);
        y = lerp(0, 35, (frame - 430) / 25);
        opacity = clamp((455 - frame) / 15, 0, 1);
      }
    }
    // Beat 8: Toggle Flip Tıklama (f485 - f525)
    // Sol thumb konumu: x: -26, y: 0
    else if (frame >= 485 && frame <= 525) {
      opacity = clamp((frame - 485) / 8, 0, 1);
      x = lerp(-70, -26, clamp((frame - 485) / 11, 0, 1));
      y = lerp(20, 0, clamp((frame - 485) / 11, 0, 1));
      isClicking = frame >= 496 && frame <= 506;
      if (frame > 510) opacity = clamp((525 - frame) / 15, 0, 1);
    }
    // Beat 10: Chart manyetik hover (f655 - f710)
    // Zirve veri noktası: x: +170, y: -20
    else if (frame >= 655 && frame <= 710) {
      opacity = clamp((frame - 655) / 8, 0, 1);
      const t = clamp((frame - 655) / 22, 0, 1);
      x = lerp(60, 170, t);
      y = lerp(60, -20, t);
      if (frame > 698) opacity = clamp((710 - frame) / 12, 0, 1);
    }
    // f820 - f839: Son karede imleç tam olarak başlangıç dinlenme koordinatına (360, 320) ve 0 opaklığa kilitlenir
    else if (frame >= 815) {
      const tRet = (frame - 815) / 24;
      x = lerp(0, 360, tRet);
      y = lerp(0, 320, tRet);
      opacity = 0; // f839'da kesinlikle 0
    }

    return { x, y, opacity, isClicking };
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 4. LİKİT TAB GÖSTERGESİ (Asimetrik Ön/Arka İkili Yay Fiziği)
  // Tab 0 (-160) -> Tab 1 (0) -> Tab 2 (+160)
  // ---------------------------------------------------------------------------
  const liquidTab = useMemo(() => {
    // Normal dinlenme genişliği: 140px. Tab yarıçapı: 70px.
    let front = -90;  // -160 + 70
    let back = -230;  // -160 - 70

    if (frame < 555) {
      front = -90;
      back = -230;
    } else if (frame < 585) {
      // Tab 0 -> Tab 1 geçişi (f555 - f584)
      front = solveSpringFrame({ frame, startFrame: 555, from: -90, to: 70, ...SPRING.liquidLead }).value;
      back = solveSpringFrame({ frame, startFrame: 555, from: -230, to: -70, ...SPRING.liquidTrail }).value;
    } else {
      // Tab 1 -> Tab 2 geçişi (f585+)
      front = solveSpringFrame({ frame, startFrame: 585, from: 70, to: 230, ...SPRING.liquidLead }).value;
      back = solveSpringFrame({ frame, startFrame: 585, from: -70, to: 90, ...SPRING.liquidTrail }).value;
    }

    const width = Math.max(140, front - back);
    const center = (front + back) / 2;
    return { center, width };
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 5. ASİMETRİK TOGGLE THUMB FİZİĞİ (Ön/Arka Yay ile Likit Uzama & Toplanma)
  // -26px (Sol) -> +26px (Sağ). Dinlenme genişliği: 44px (yarıçap: 22px).
  // ---------------------------------------------------------------------------
  const toggleThumb = useMemo(() => {
    if (frame < 496) return { x: -26, width: 44 };
    
    // Sağ kenar önden fırlar, sol kenar arkadan toparlanır
    const front = solveSpringFrame({ frame, startFrame: 496, from: -4, to: 48, ...SPRING.liquidLead }).value;
    const back = solveSpringFrame({ frame, startFrame: 496, from: -48, to: 4, ...SPRING.liquidTrail }).value;
    const width = Math.max(44, front - back);
    const center = (front + back) / 2;
    return { x: center, width };
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 6. SCRUB BAR PROGRESS DEĞERİ (f286 - f365)
  // ---------------------------------------------------------------------------
  const scrubProgress = useMemo(() => {
    if (frame < 312) return 0.25;
    if (frame <= 348) return lerp(0.25, 0.75, (frame - 312) / 36);
    return 0.75;
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 7. CHART CANVAS SPLINE ÇİZİMİ (f616 - f715)
  // ---------------------------------------------------------------------------
  const chartDrawProgress = useMemo(() => {
    if (frame < 622) return 0;
    return clamp(solveSpringFrame({ frame, startFrame: 622, from: 0, to: 1, ...SPRING.cameraTrack }).value, 0, 1);
  }, [frame]);

  // ---------------------------------------------------------------------------
  // 8. BAĞIMSIZ ENTER/EXIT ZAMANLAMASI (Metin/İçerik Çakışmasını Önleyen Mimari)
  // ---------------------------------------------------------------------------
  const opButton = useMemo(() => {
    if (frame <= 36) return 1;
    if (frame <= 42) return clamp((42 - frame) / 6, 0, 1);
    if (frame >= 810) return clamp((frame - 810) / 20, 0, 1);
    return 0;
  }, [frame]);

  const opLoader = useMemo(() => {
    if (frame < 44 || frame > 85) return 0;
    if (frame <= 50) return clamp((frame - 44) / 6, 0, 1);
    if (frame >= 81) return clamp((85 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opCheck = useMemo(() => {
    if (frame < 86 || frame > 125) return 0;
    if (frame <= 92) return clamp((frame - 86) / 6, 0, 1);
    if (frame >= 121) return clamp((125 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opIsland = useMemo(() => {
    if (frame < 125 || frame > 185) return 0;
    if (frame <= 132) return clamp((frame - 125) / 7, 0, 1);
    if (frame >= 181) return clamp((185 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opMusic = useMemo(() => {
    if (frame < 185 || frame > 285) return 0;
    if (frame <= 192) return clamp((frame - 185) / 7, 0, 1);
    if (frame >= 281) return clamp((285 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opScrub = useMemo(() => {
    if (frame < 285 || frame > 365) return 0;
    if (frame <= 291) return clamp((frame - 285) / 6, 0, 1);
    if (frame >= 361) return clamp((365 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opVolume = useMemo(() => {
    if (frame < 365 || frame > 465) return 0;
    if (frame <= 371) return clamp((frame - 365) / 6, 0, 1);
    if (frame >= 461) return clamp((465 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opToggle = useMemo(() => {
    if (frame < 465 || frame > 535) return 0;
    if (frame <= 471) return clamp((frame - 465) / 6, 0, 1);
    if (frame >= 531) return clamp((535 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opTabs = useMemo(() => {
    if (frame < 535 || frame > 615) return 0;
    if (frame <= 541) return clamp((frame - 535) / 6, 0, 1);
    if (frame >= 611) return clamp((615 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opChart = useMemo(() => {
    if (frame < 615 || frame > 715) return 0;
    if (frame <= 623) return clamp((frame - 615) / 8, 0, 1);
    if (frame >= 711) return clamp((715 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opPalette = useMemo(() => {
    if (frame < 715 || frame > 765) return 0;
    if (frame <= 721) return clamp((frame - 715) / 6, 0, 1);
    if (frame >= 761) return clamp((765 - frame) / 4, 0, 1);
    return 1;
  }, [frame]);

  const opToast = useMemo(() => {
    if (frame < 765 || frame > 810) return 0;
    if (frame <= 771) return clamp((frame - 765) / 6, 0, 1);
    if (frame >= 805) return clamp((810 - frame) / 5, 0, 1);
    return 1;
  }, [frame]);

  // Müzik çalar play/pause durumu
  const playPauseMorph = frame >= 226 ? 1 : 0;
  // Chart tooltip opaklığı
  const opTooltip = frame >= 662 && frame <= 705 ? clamp((frame - 662) / 6, 0, 1) : 0;
  // Palette liste opaklığı
  const opPaletteList = frame >= 735 && frame < 755 ? clamp((frame - 735) / 5, 0, 1) : 0;

  // Geist Tipografi Stilleri
  const fontStyle = {
    fontFamily: "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  };

  return (
    <div
      style={{
        width: 1440,
        height: 1440,
        backgroundColor: '#F4F4F2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        transformStyle: 'preserve-3d',
        perspective: 1200,
        ...fontStyle,
      }}
    >
      {/* SvgFilterLab: Çift katmanlı gölge & degrade laboratuvarı */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="chart-area-indigo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5E5CE6" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#5E5CE6" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      {/* Katman 1: Zemin Düzlemi (translateZ: 0px) - Sıcak Açık Gri Zemin Noktaları */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.8,
          transform: 'translateZ(0px)',
        }}
      />

      {/* Kamera Rig Katmanı (will-change içermez, bulanıklık önlenmiştir) */}
      <div
        id="camera-rig"
        className="camera-rig"
        style={{
          transform: `scale(${cameraZoom}) translateY(${ambientBreath}px) translateZ(20px)`,
          transformOrigin: 'center center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Katman 2: THE HERO ACTOR / TEK MORPHING KAP (translateZ: 40px) */}
        <TheHeroActor
          id="the-morph-container"
          style={{
            width: `${shape.width}px`,
            height: `${shape.height}px`,
            borderRadius: `${shape.radius}px`,
            backgroundColor: shape.bg,
            transform: `scale(${shape.scaleX}, ${shape.scaleY}) translateZ(40px)`,
            boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* ================================================================= */}
          {/* KATMAN 1: BUTTON İÇERİĞİ (f0 - f45 ve f806 - f840 dönüşü) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              opacity: opButton,
              pointerEvents: opButton > 0.05 ? 'auto' : 'none',
              transform: `translateY(${frame > 38 && frame <= 45 ? -8 : 0}px)`,
              whiteSpace: 'nowrap',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3v12m0-12l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
              Export Frame
            </span>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 2: CIRCULAR INDIGO LOADER (f46 - f85) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: opLoader,
              pointerEvents: opLoader > 0.05 ? 'auto' : 'none',
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <circle cx="16" cy="16" r="13" stroke="#262626" strokeWidth="3" fill="none" />
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="#5E5CE6"
                strokeWidth="3"
                strokeDasharray="24 60"
                strokeLinecap="round"
                fill="none"
                style={{
                  transform: `rotate(${frame * 12}deg)`,
                  transformOrigin: 'center center',
                }}
              />
            </svg>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 3: SUCCESS CHECKMARK (f86 - f125) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: opCheck,
              pointerEvents: opCheck > 0.05 ? 'auto' : 'none',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#5E5CE6"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="30"
                strokeDashoffset={Math.max(0, 30 - (frame - 86) * 3)}
              />
            </svg>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 4: DYNAMIC ISLAND (f126 - f185) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              opacity: opIsland,
              pointerEvents: opIsland > 0.05 ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: '#5E5CE6',
                  transform: `scale(${1 + Math.sin(frame * 0.2) * 0.2})`,
                }}
              />
              <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 500, whiteSpace: 'nowrap' }}>
                Now Playing
              </span>
            </div>
            {/* 3 çubuklu mini ekolayzır */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: 4,
                    height: `${10 + Math.sin(frame * 0.3 + idx * 1.5) * 8}px`,
                    borderRadius: 2,
                    backgroundColor: '#5E5CE6',
                  }}
                />
              ))}
            </div>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 5: MUSIC PLAYER (f186 - f285) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: opMusic,
              pointerEvents: opMusic > 0.05 ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  backgroundColor: '#1C1C1E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M9 18V5l12-2v13"
                    stroke="#5E5CE6"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="6" cy="18" r="3" fill="#5E5CE6" />
                  <circle cx="18" cy="16" r="3" fill="#5E5CE6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>
                  Kinetic Pulse
                </div>
                <div style={{ fontSize: 18, color: '#8E8E93', marginTop: 2 }}>
                  Synthetics 120 BPM
                </div>
              </div>
            </div>

            {/* Alt kontroller: Play/Pause ikonu & waveform */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: '#262626',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#5E5CE6"
                    style={{ position: 'absolute', opacity: 1 - playPauseMorph }}
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="#5E5CE6"
                    style={{ position: 'absolute', opacity: playPauseMorph }}
                  >
                    <rect x="6" y="5" width="4" height="14" rx="1.5" />
                    <rect x="14" y="5" width="4" height="14" rx="1.5" />
                  </svg>
                </div>
                <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 500 }}>
                  {playPauseMorph === 0 ? '01:24' : '01:25'}
                </span>
              </div>
              {/* Mini dalga formu */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[14, 22, 10, 26, 18, 28, 12].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      width: 3.5,
                      height: `${h + Math.sin(frame * 0.2 + i) * 6}px`,
                      borderRadius: 2,
                      backgroundColor: i % 2 === 0 ? '#5E5CE6' : '#FFFFFF',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 6: SCRUB PROGRESS BAR (f286 - f365) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: opScrub,
              pointerEvents: opScrub > 0.05 ? 'auto' : 'none',
            }}
          >
            <span style={{ fontSize: 18, color: '#8E8E93', fontWeight: 500, minWidth: 48 }}>
              {scrubProgress < 0.5 ? '01:15' : '02:45'}
            </span>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#262626',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${scrubProgress * 100}%`,
                  borderRadius: 4,
                  backgroundColor: '#5E5CE6',
                }}
              />
              {/* Knob */}
              <div
                style={{
                  position: 'absolute',
                  left: `${scrubProgress * 100}%`,
                  transform: 'translateX(-50%)',
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  border: '2px solid #5E5CE6',
                }}
              />
            </div>
            <span style={{ fontSize: 18, color: '#8E8E93', fontWeight: 500 }}>
              03:40
            </span>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 7: VOLUME SLIDER (f366 - f465) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              opacity: opVolume,
              pointerEvents: opVolume > 0.05 ? 'auto' : 'none',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M11 5L6 9H2v6h4l5 4V5z" fill="#FFFFFF" />
              <path
                d="M15.54 8.46a5 5 0 010 7.07"
                stroke="#5E5CE6"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
            <div
              style={{
                flex: 1,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#262626',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: frame >= 414 && frame <= 430 ? '100%' : '84%',
                  borderRadius: 4,
                  backgroundColor: '#5E5CE6',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: frame >= 414 && frame <= 430 ? '100%' : '84%',
                  transform: 'translateX(-50%)',
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                }}
              />
            </div>
            <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 600, minWidth: 48 }}>
              {frame >= 414 && frame <= 430 ? '100%' : '84%'}
            </span>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 8: TOGGLE SWITCH (f466 - f535) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: opToggle,
              pointerEvents: opToggle > 0.05 ? 'auto' : 'none',
            }}
          >
            <div
              style={{
                position: 'absolute',
                transform: `translateX(${toggleThumb.x}px)`,
                width: `${toggleThumb.width}px`,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
              }}
            />
          </div>

          {/* ================================================================= */}
          {/* KATMAN 9: LIQUID TAB BAR (f536 - f615) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '0 12px',
              opacity: opTabs,
              pointerEvents: opTabs > 0.05 ? 'auto' : 'none',
            }}
          >
            {/* Likit Gösterge (Asimetrik Ön/Arka İkili Yay ile Önden Koşan & Arkadan Toplanan) */}
            <div
              style={{
                position: 'absolute',
                transform: `translateX(${liquidTab.center}px)`,
                width: `${liquidTab.width}px`,
                height: 42,
                borderRadius: 21,
                backgroundColor: '#262626',
                border: '1px solid rgba(94, 92, 230, 0.4)',
                zIndex: 1,
              }}
            />

            {['Overview', 'Analytics', 'Reports'].map((tabTitle, i) => (
              <span
                key={tabTitle}
                style={{
                  position: 'relative',
                  zIndex: 2,
                  fontSize: 18,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  color: i === 0 && frame < 555 ? '#FFFFFF' : i === 1 && frame >= 555 && frame < 585 ? '#FFFFFF' : i === 2 && frame >= 585 ? '#FFFFFF' : '#8E8E93',
                }}
              >
                {tabTitle}
              </span>
            ))}
          </div>

          {/* ================================================================= */}
          {/* KATMAN 10: CHART CANVAS (f616 - f715) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              opacity: opChart,
              pointerEvents: opChart > 0.05 ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 18, color: '#8E8E93', fontWeight: 500 }}>
                  Monthly Velocity
                </div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', marginTop: 2 }}>
                  $84,250
                </div>
              </div>
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  backgroundColor: 'rgba(94, 92, 230, 0.18)',
                  border: '1px solid #5E5CE6',
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#5E5CE6',
                }}
              >
                +28.4%
              </div>
            </div>

            {/* Spline Eğrisi & Doldurulmuş Alan */}
            <div style={{ width: '100%', height: 180, position: 'relative' }}>
              <svg width="100%" height="180" viewBox="0 0 580 180" fill="none">
                {/* Grid çizgileri */}
                <line x1="0" y1="45" x2="580" y2="45" stroke="#262626" strokeDasharray="4 4" />
                <line x1="0" y1="105" x2="580" y2="105" stroke="#262626" strokeDasharray="4 4" />

                {/* Gradient alan dolgusu */}
                <path
                  d="M 20 160 C 100 140, 160 80, 240 100 C 320 120, 380 40, 460 50 C 510 58, 540 30, 560 20 L 560 180 L 20 180 Z"
                  fill="url(#chart-area-indigo)"
                  opacity={chartDrawProgress}
                />

                {/* Spline çizgisi */}
                <path
                  d="M 20 160 C 100 140, 160 80, 240 100 C 320 120, 380 40, 460 50 C 510 58, 540 30, 560 20"
                  stroke="#5E5CE6"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="650"
                  strokeDashoffset={650 * (1 - chartDrawProgress)}
                />

                {/* Zirve veri noktası */}
                <circle
                  cx="460"
                  cy="50"
                  r="6"
                  fill="#FFFFFF"
                  stroke="#5E5CE6"
                  strokeWidth="3"
                  opacity={chartDrawProgress > 0.8 ? 1 : 0}
                />
              </svg>

              {/* Manyetik Hover Tooltip Kartı */}
              <div
                style={{
                  position: 'absolute',
                  right: 90,
                  top: 10,
                  backgroundColor: '#1C1C1E',
                  border: '1px solid #5E5CE6',
                  borderRadius: 12,
                  padding: '8px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  opacity: opTooltip,
                  pointerEvents: opTooltip > 0.1 ? 'auto' : 'none',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5E5CE6' }} />
                <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF' }}>
                  $84,250
                </span>
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 11: ⌘K COMMAND PALETTE (f716 - f765) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '16px 24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              opacity: opPalette,
              pointerEvents: opPalette > 0.05 ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="#FFFFFF" strokeWidth="2.2" />
                  <path d="M21 21l-4.35-4.35" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 500 }}>
                  {frame < 735 ? 'Type a command...' : 'export'}
                </span>
                <div
                  style={{
                    width: 2,
                    height: 20,
                    backgroundColor: '#5E5CE6',
                    opacity: frame >= 728 && frame < 750 ? 1 : 0,
                  }}
                />
              </div>
              <div
                style={{
                  backgroundColor: '#262626',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#8E8E93',
                }}
              >
                ⌘K
              </div>
            </div>

            {/* Filtrelenen Sonuçlar Listesi */}
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                opacity: opPaletteList,
                pointerEvents: opPaletteList > 0.1 ? 'auto' : 'none',
              }}
            >
              <div
                style={{
                  padding: '10px 16px',
                  borderRadius: 10,
                  backgroundColor: frame >= 748 ? '#5E5CE6' : '#1C1C1E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>
                  Export Frame as PNG
                </span>
                <span style={{ fontSize: 18, color: frame >= 748 ? '#FFFFFF' : '#8E8E93' }}>
                  ↵ Enter
                </span>
              </div>
              <div style={{ padding: '6px 16px', fontSize: 18, color: '#8E8E93' }}>
                Export Master 4K Video
              </div>
            </div>
          </div>

          {/* ================================================================= */}
          {/* KATMAN 12: TOAST NOTIFICATION (f766 - f805) */}
          {/* ================================================================= */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              padding: '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              opacity: opToast,
              pointerEvents: opToast > 0.05 ? 'auto' : 'none',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#5E5CE6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="#FFFFFF"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span style={{ fontSize: 18, fontWeight: 600, color: '#FFFFFF' }}>
                Exported successfully
              </span>
            </div>
            <span style={{ fontSize: 18, color: '#8E8E93', fontWeight: 500 }}>
              Undo
            </span>
          </div>
        </TheHeroActor>

        {/* Katman 3: DOĞRUDAN MANİPÜLASYON İMLECİ (Konteyner Merkezine Kilitli translateZ: 90px) */}
        <div
          id="direct-manipulation-cursor"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(${cursor.x - 6}px, ${cursor.y - 3}px) scale(${cursor.isClicking ? 0.88 : 1}) translateZ(90px)`,
            opacity: cursor.opacity,
            pointerEvents: 'none',
            zIndex: 100,
            filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.35))',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 3l18 13.5-8.5 1.5 5 10-3.5 1.5-5-10-6 6.5V3z"
              fill="#FFFFFF"
              stroke="#0A0A0A"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: 3,
              width: 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: 'rgba(94, 92, 230, 0.4)',
              transform: 'translate(-50%, -50%)',
              opacity: cursor.isClicking ? 1 : 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};
