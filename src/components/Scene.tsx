import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../core/useRemotionGSAP';
import { animateCamera } from '../core/choreography';
import {
  WorldStage,
  CharacterActor,
  evaluateActorPose,
  type ActorMotionSegment,
  type SfxTrigger,
  type TorchLightPoint,
} from '../world';
import { ShockwaveRoar, AtmosphereParticles } from '../vfx';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

// -----------------------------------------------------------------------------
// KARAKTER ROTA VE DURUM SEGMENTLERİ (360 KARE / 6.0 SANİYE @ 60 FPS)
// -----------------------------------------------------------------------------
const DWARF_SEGMENTS: ActorMotionSegment[] = [
  // FAZ 1 (0–98f): Soldan arena ön planına öfkeli koşu
  {
    startFrame: 0,
    endFrame: 98,
    fromX: -330,
    fromY: 240,
    toX: 0,
    toY: 280,
    fromScale: 2.45,
    toScale: 2.75,
    facingRight: true,
    action: 'run',
  },
  // FAZ 2 (99–165f): Ön planda ani fren ve 1. Savaş Çığlığı ("KİMSE YOK MUUU?!")
  {
    startFrame: 99,
    endFrame: 165,
    fromX: 0,
    fromY: 280,
    toX: 0,
    toY: 280,
    fromScale: 2.75,
    toScale: 2.78,
    facingRight: true,
    action: 'shout',
  },
  // FAZ 3 (166–249f): Zindanın derinliğindeki kapüşonlu heykele doğru perspektif koşusu
  {
    startFrame: 166,
    endFrame: 249,
    fromX: 0,
    fromY: 280,
    toX: 85,
    toY: -45,
    fromScale: 2.75,
    toScale: 1.78,
    facingRight: true,
    action: 'run',
  },
  // FAZ 4 (250–312f): Heykelin önünde sola dönüp 2. Savaş Çığlığı ("NERDESİNİZ BE?!")
  {
    startFrame: 250,
    endFrame: 312,
    fromX: 85,
    fromY: -45,
    toX: 85,
    toY: -45,
    fromScale: 1.78,
    toScale: 1.82,
    facingRight: false,
    action: 'shout',
  },
  // FAZ 5 (313–360f): Kameraya doğru son berserk taarruzu
  {
    startFrame: 313,
    endFrame: 360,
    fromX: 85,
    fromY: -45,
    toX: -15,
    toY: 245,
    fromScale: 1.8,
    toScale: 2.85,
    facingRight: false,
    action: 'run',
  },
];

// -----------------------------------------------------------------------------
// KARE-KİLİTLİ PROSEDÜREL SES EFEKTLERİ (SFX TRIGGERS)
// -----------------------------------------------------------------------------
const SFX_TRIGGERS: SfxTrigger[] = [
  // Kamera giriş rüzgarı
  { frame: 2, sfx: 'whoosh-pan', volume: 0.55 },
  // Faz 1 taş zemin adımları
  ...[8, 18, 28, 38, 48, 58, 68, 78, 88].map((f) => ({
    frame: f,
    sfx: 'step-stone' as const,
    volume: 0.5,
  })),
  // 1. Savaş Çığlığı & Şok Dalgası
  { frame: 99, sfx: 'roar-shockwave', volume: 0.85 },
  // Faz 3 derinlik koşusu rüzgarı ve adımları
  { frame: 166, sfx: 'whoosh-pan', volume: 0.6 },
  ...[174, 184, 194, 204, 214, 224, 234, 244].map((f) => ({
    frame: f,
    sfx: 'step-stone' as const,
    volume: 0.42,
  })),
  // 2. Savaş Çığlığı & Şok Dalgası
  { frame: 250, sfx: 'roar-shockwave', volume: 0.82 },
  // Faz 5 son taarruz rüzgarı ve adımları
  { frame: 313, sfx: 'whoosh-pan', volume: 0.65 },
  ...[320, 330, 340, 350].map((f) => ({
    frame: f,
    sfx: 'step-stone' as const,
    volume: 0.58,
  })),
];

// -----------------------------------------------------------------------------
// ZİNDAN MEŞALESİ IŞIK KAYNAKLARI
// -----------------------------------------------------------------------------
const TORCH_LIGHTS: TorchLightPoint[] = [
  { xPercent: 32, yPercent: 25, sizePx: 340, intensity: 0.38 },
  { xPercent: 43, yPercent: 20, sizePx: 300, intensity: 0.42 },
  { xPercent: 57, yPercent: 20, sizePx: 300, intensity: 0.42 },
  { xPercent: 68, yPercent: 25, sizePx: 340, intensity: 0.38 },
  { xPercent: 26, yPercent: 82, sizePx: 380, intensity: 0.32 },
  { xPercent: 74, yPercent: 82, sizePx: 380, intensity: 0.32 },
];

export const Scene: FC<SceneProps> = ({ aspect = '9:16' }) => {
  const frame = useCurrentFrame();
  const pose = evaluateActorPose(frame, DWARF_SEGMENTS);

  // ---------------------------------------------------------------------------
  // 3D YÖNETMEN KAMERASI (Tam Ekran Yatay/Dikey Takip & Şok Dalgası Sarsıntısı)
  // ---------------------------------------------------------------------------
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      // 0.0s – 1.6s: Soldan koşan cüceyi tam ekran yatay Pan ile takip et
      { at: 0, duration: 0, scale: 1.1, x: 180, y: -70, rotateZ: 0 },
      { at: 0.05, duration: 1.55, scale: 1.16, x: 0, y: -95, ease: 'power2.out' },

      // 1.65s – 2.75s: 1. Çığlıkta ("KİMSE YOK MUUU?!") Darbe Zoom & Sarsıntı
      { at: 1.65, duration: 0.18, scale: 1.32, x: 0, y: -125, rotateZ: -1.8, ease: 'back.out(2.4)' },
      { at: 1.83, duration: 0.06, x: -14, y: -133, rotateZ: 2.0 },
      { at: 1.89, duration: 0.06, x: 14, y: -117, rotateZ: -1.6 },
      { at: 1.95, duration: 0.06, x: -10, y: -129, rotateZ: 1.4 },
      { at: 2.01, duration: 0.06, x: 10, y: -121, rotateZ: -1.0 },
      { at: 2.07, duration: 0.06, x: -6, y: -126, rotateZ: 0.6 },
      { at: 2.15, duration: 0.55, x: 0, y: -100, scale: 1.2, rotateZ: 0, ease: 'power2.out' },

      // 2.75s – 4.15s: Cüce arkadaki kapüşonlu heykele koşarken yukarı ve sağa Pan
      { at: 2.75, duration: 1.38, scale: 1.12, x: -65, y: 75, rotateZ: 0, ease: 'expo.inOut' },

      // 4.16s – 5.2s: 2. Çığlıkta ("NERDESİNİZ BE?!") Heykel Önünde Zoom & Sarsıntı
      { at: 4.16, duration: 0.18, scale: 1.28, x: -75, y: 65, rotateZ: 1.6, ease: 'back.out(2.2)' },
      { at: 4.34, duration: 0.06, x: -88, y: 58, rotateZ: -1.8 },
      { at: 4.4, duration: 0.06, x: -62, y: 72, rotateZ: 1.5 },
      { at: 4.46, duration: 0.06, x: -82, y: 61, rotateZ: -1.2 },
      { at: 4.52, duration: 0.06, x: -68, y: 69, rotateZ: 0.8 },
      { at: 4.6, duration: 0.55, x: -60, y: 50, scale: 1.18, rotateZ: 0, ease: 'power2.out' },

      // 5.2s – 6.0s: Son taarruzda kamerayı ön plana kilitle
      { at: 5.2, duration: 0.8, scale: 1.22, x: 10, y: -85, rotateZ: 0, ease: 'power2.inOut' },
    ]);
  }, []);

  const isRoar1 = frame >= 99 && frame <= 165;
  const isRoar2 = frame >= 250 && frame <= 312;
  const isShouting = isRoar1 || isRoar2;
  const roarStartFrame = isRoar1 ? 99 : 250;
  const shoutText = isRoar1 ? 'KİMSE YOK MUUU?!' : 'NERDESİNİZ BE?!';

  return (
    <WorldStage
      aspect={aspect}
      backgroundSrc="assets/arena_bg.png"
      torchLights={TORCH_LIGHTS}
      sfxTriggers={SFX_TRIGGERS}
      roarFlashIntensity={isShouting ? 0.85 : 0}
    >
      {/* 1. ZİNDAN KOR KIVILCIMLARI (2.5D Atmosfer Partikülleri) */}
      <AtmosphereParticles count={26} variant="embers" />

      {/* 2. 60 FPS PROSEDÜREL KUKLA FİZİKLİ CÜCE AKTÖR */}
      <CharacterActor segments={DWARF_SEGMENTS} />

      {/* 3. SONİK ŞOK DALGASI, DARBE ÇİZGİLERİ VE SAVAŞ ÇIĞLIĞI VFX */}
      <ShockwaveRoar
        active={isShouting}
        roarStartFrame={roarStartFrame}
        originX={pose.x}
        originY={pose.y}
        actorScale={pose.scale}
        text={shoutText}
      />
    </WorldStage>
  );
};

export default Scene;
