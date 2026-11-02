import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import {
  WorldStage,
  CharacterActor,
  type ActorMotionSegment,
  type SfxTrigger,
} from '../../world';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
  /** Typographic family: Inter / font-sans UTF-8 */
  fontFamily?: string;
}

// -----------------------------------------------------------------------------
// BULUT HAREKET SEGMENTLERİ (720 KARE / 12.0 SANİYE @ 60 FPS)
// -----------------------------------------------------------------------------
const CLOUD_SEGMENTS: ActorMotionSegment[] = [
  // 1. GİRİŞ (0–174f | Beat 1): Soldan merkeze huzurlu pohpoh süzülüş
  {
    startFrame: 0,
    endFrame: 174,
    fromX: -760,
    fromY: 50,
    toX: -60,
    toY: 30,
    fromScale: 2.15,
    toScale: 2.35,
    facingRight: true,
    action: 'run',
  },
  // 2. GELİŞME (175–359f | Beat 2): Güneş'in çıkışı ve hayranlık dolu şaşkınlık
  {
    startFrame: 175,
    endFrame: 359,
    fromX: -60,
    fromY: 30,
    toX: -30,
    toY: 40,
    fromScale: 2.35,
    toScale: 2.4,
    facingRight: true,
    action: 'run',
  },
  // 3. DORUK (360–534f | Beat 3): Utanç, toz pembe kızarma ve içe büzülme (squash)
  {
    startFrame: 360,
    endFrame: 534,
    fromX: -30,
    fromY: 40,
    toX: 10,
    toY: 55,
    fromScale: 2.4,
    toScale: 1.85,
    facingRight: true,
    action: 'run',
  },
  // 4. SONUÇ (535–720f | Beat 4): Ön-hazırlık yaylanması, arkasını dönüş ve sol tarafa roket kaçış
  {
    startFrame: 535,
    endFrame: 720,
    fromX: 10,
    fromY: 55,
    toX: -1450,
    toY: 10,
    fromScale: 1.85,
    toScale: 1.55,
    facingRight: false,
    action: 'run',
  },
];

// -----------------------------------------------------------------------------
// KARE-KİLİTLİ PROSEDÜREL SES EFEKTLERİ (SFX TRIGGERS)
// -----------------------------------------------------------------------------
const SFX_TRIGGERS: SfxTrigger[] = [
  // Bulutun sahneye giriş esintisi
  { frame: 2, sfx: 'whoosh-pan', volume: 0.4 },
  // Neşeli güneşin kafasını uzatış rüzgarı (3.0s / 180f)
  { frame: 180, sfx: 'whoosh-pan', volume: 0.5 },
  // Bulutun şaşkınlık ve utanma anındaki tatlı kilitlenme tonu (6.0s / 360f)
  { frame: 360, sfx: 'ui-lock', volume: 0.35 },
  // Bulutun arkasını dönüp hızla kaçış fırtınası (9.0s / 540f)
  { frame: 540, sfx: 'whoosh-pan', volume: 0.7 },
];

// -----------------------------------------------------------------------------
// SEVİMLİ VE DIŞAVURUMCU BEYAZ BULUT (CUTE FLUFFY CLOUD ACTOR)
// -----------------------------------------------------------------------------
interface CuteCloudProps {
  frame: number;
}

const CuteCloud: FC<CuteCloudProps> = ({ frame }) => {
  // Tam 180 karelik (3.0 saniye) 4 Beat Zamanlaması
  const isIntro = frame < 180;
  const isSurprise = frame >= 180 && frame < 360;
  const isBlush = frame >= 360 && frame < 540;
  const isEscape = frame >= 540;

  // 12 Animasyon Prensibi: Pohpoh Nefes Alma & Squash/Stretch
  const breatheSin = Math.sin(frame * 0.08);
  const breathScaleX = 1 + breatheSin * 0.035;
  const breathScaleY = 1 - breatheSin * 0.035;

  // Utanma büzülme faktörü (Beat 3 boyunca 360f'den 480f'e derinleşir)
  const blushProgress = isBlush
    ? Math.min(1, Math.max(0, (frame - 360) / 100))
    : isEscape
    ? 1
    : 0;

  // Yanak allık opaklığı (Utanmada ve arkasını dönüp kaçarken yoğun pembe)
  const cheekOpacity = isIntro
    ? 0.18 + 0.06 * Math.sin(frame * 0.06)
    : isSurprise
    ? 0.35
    : 0.38 + blushProgress * 0.58; // 0.38 -> 0.96 yoğun toz pembe

  // Utanç büzülme esnemesi: içe çekilerek küçülme (Squash)
  const shySquashX = isBlush ? 1 + blushProgress * 0.18 : 1;
  const shySquashY = isBlush ? 1 - blushProgress * 0.2 : 1;

  // Kaçış öncesi 18 karelik geri yaylanma (Anticipation Recoil, frames 540–558)
  const isAnticipating = frame >= 540 && frame <= 558;
  const recoilX = isAnticipating ? Math.sin(((frame - 540) / 18) * Math.PI) * 22 : 0;
  const recoilScaleX = isAnticipating ? 1.18 : 1;
  const recoilScaleY = isAnticipating ? 0.84 : 1;

  return (
    <div
      className="pointer-events-none relative flex items-center justify-center will-change-transform"
      style={{
        transform: `translate(${recoilX}px, 0px) scale(${
          breathScaleX * shySquashX * recoilScaleX
        }, ${breathScaleY * shySquashY * recoilScaleY})`,
      }}
    >
      <svg
        width="220"
        height="150"
        viewBox="0 0 220 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Bulut Gövdesi İnci Beyazı & Gökyüzü Lavanta Gölgesi */}
          <linearGradient id="cloudGrad" x1="110" y1="15" x2="110" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#e0e7ff" />
          </linearGradient>

          {/* Yumuşak Toz Pembe Yanak Allığı */}
          <radialGradient id="pinkBlushGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb7185" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#f43f5e" stopOpacity="0.65" />
            <stop offset="100%" stopColor="#fbcfe8" stopOpacity="0" />
          </radialGradient>

          {/* Arkasını Dönmüş Bulut Sırt Gölgesi */}
          <linearGradient id="cloudBackGrad" x1="110" y1="20" x2="110" y2="135" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#dbeafe" />
          </linearGradient>
        </defs>

        {/* 1. SEVİMLİ VE DOLGUN BULUT GÖVDESİ */}
        <path
          d="M 52,112 
             A 30,30 0 0,1 46,58 
             A 38,38 0 0,1 106,32 
             A 42,42 0 0,1 172,50 
             A 32,32 0 0,1 188,108 
             A 26,26 0 0,1 168,124 
             L 58,124 
             A 24,24 0 0,1 52,112 Z"
          fill={isEscape ? 'url(#cloudBackGrad)' : 'url(#cloudGrad)'}
          stroke="#cbd5e1"
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* 2. TOZ PEMBE VE SICAK YANAKLAR */}
        {/* Sol Yanak */}
        <ellipse
          cx="66"
          cy="98"
          rx={isBlush || isEscape ? 18 : 12}
          ry={isBlush || isEscape ? 14 : 9}
          fill="url(#pinkBlushGrad)"
          opacity={cheekOpacity}
        />
        {/* Sağ Yanak */}
        <ellipse
          cx="150"
          cy="98"
          rx={isBlush || isEscape ? 18 : 12}
          ry={isBlush || isEscape ? 14 : 9}
          fill="url(#pinkBlushGrad)"
          opacity={cheekOpacity}
        />

        {/* 3. İFADE GÖZLERİ & YÜZ (DÖRT FAZLI YÜZ MİMARİSİ) */}
        {isIntro && (
          // Faz 1: Huzurlu, Mutlu Kapalı Gözler (^ ^)
          <g stroke="#334155" strokeWidth="3.5" strokeLinecap="round" fill="none">
            <path d="M 74,84 Q 84,74 94,84" />
            <path d="M 122,84 Q 132,74 142,84" />
          </g>
        )}

        {isSurprise && (
          // Faz 2: Şaşkın Kocaman Açılmış İri Gözler
          <g>
            {/* Sol İri Göz */}
            <circle cx="84" cy="80" r="11" fill="#1e293b" />
            <circle cx="82" cy="77" r="4.2" fill="#ffffff" />
            <circle cx="87" cy="83" r="2" fill="#ffffff" />

            {/* Sağ İri Göz (Güneş'e Doğru Bakıyor) */}
            <circle cx="132" cy="80" r="11" fill="#1e293b" />
            <circle cx="130" cy="77" r="4.2" fill="#ffffff" />
            <circle cx="135" cy="83" r="2" fill="#ffffff" />

            {/* Şaşkın Yüksek Kaşlar */}
            <path d="M 74,65 Q 84,59 94,66" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 122,66 Q 132,59 142,65" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {isBlush && (
          // Faz 3: Utangaç Aşağı Kaçamak Bakan Gözler & Mahcubiyet
          <g>
            {/* Sol Mahcup Göz */}
            <circle cx="85" cy="84" r="9" fill="#1e293b" />
            <circle cx="84" cy="83" r="3.2" fill="#ffffff" />

            {/* Sağ Mahcup Göz */}
            <circle cx="131" cy="84" r="9" fill="#1e293b" />
            <circle cx="130" cy="83" r="3.2" fill="#ffffff" />

            {/* Mahcup Eğimli Kaşlar */}
            <path d="M 76,73 Q 86,76 94,72" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 122,72 Q 130,76 140,73" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Utanç Damlası / Minik Mahcup Ter */}
            <path
              d="M 160,70 C 160,66 164,62 164,62 C 164,62 168,66 168,70 C 168,72.2 166.2,74 164,74 C 161.8,74 160,72.2 160,70 Z"
              fill="#93c5fd"
              opacity="0.85"
            />
          </g>
        )}

        {isEscape && (
          // Faz 4: ARKASINI DÖNMÜŞ VE PEMBE YANAKLARIYLA KAÇAN BULUT SIRT GÖRÜNÜMÜ
          // "Bulut, pembe yanaklarıyla arkasını dönüp ekranın solundan hızla kaçarak uzaklaşır"
          <g>
            {/* Pofuduk Bulut Sırt Kıvrımları (Arka Görünüm Derinlik Yayları) */}
            <path
              d="M 85,62 Q 106,74 125,60"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.7"
            />
            <path
              d="M 92,92 Q 108,102 124,92"
              stroke="#cbd5e1"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.65"
            />

            {/* Utanç ve Panikten Uçuşan Ter Damlaları */}
            <path
              d="M 42,76 C 42,72 38,68 38,68 C 38,68 34,72 34,76 C 34,78.2 35.8,80 38,80 C 40.2,80 42,78.2 42,76 Z"
              fill="#93c5fd"
              opacity="0.85"
            />
            <path
              d="M 180,68 C 180,65 177,62 177,62 C 177,62 174,65 174,68 C 174,69.8 175.4,71.2 177,71.2 C 178.6,71.2 180,69.8 180,68 Z"
              fill="#93c5fd"
              opacity="0.75"
            />

            {/* Kaçış Rüzgarı & İvmelenme Çizgileri */}
            <path d="M 184,86 L 204,86" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
            <path d="M 188,100 L 210,100" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
          </g>
        )}

        {/* 4. AĞIZ İFADESİ (Ön Görünüm Fazları) */}
        {isIntro && (
          // Huzurlu Tatlı Tebessüm
          <path d="M 102,96 Q 108,104 114,96" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}

        {isSurprise && (
          // Küçük Şaşkın 'o' Ağız
          <ellipse cx="108" cy="98" rx="5.5" ry="7.5" fill="#334155" />
        )}

        {isBlush && (
          // Utangaç Dalgalı Mahcup Ağız (~)
          <path d="M 101,98 Q 105,95 108,98 Q 111,101 115,97" stroke="#334155" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        )}
      </svg>
    </div>
  );
};

// -----------------------------------------------------------------------------
// NEŞELİ VE IŞILDAYAN GÜNEŞ (RADIANT SMILING SUN ACTOR)
// -----------------------------------------------------------------------------
interface RadiantSunProps {
  frame: number;
}

const RadiantSun: FC<RadiantSunProps> = ({ frame }) => {
  // Faz kontrolü: Beat 1 boyunca (0 - 180) tamamen gizli.
  // Beat 2 başında (180f = 3.0s) aniden kafasını uzatır!
  if (frame < 178) return null;

  // Giriş İntrosu (180f - 225f): Sağ üst köşeden kafasını uzatış
  const enterProgress = Math.min(1, Math.max(0, (frame - 180) / 45));
  // Back.out(1.6) yaylanma simülasyonu
  const c1 = 1.6;
  const c3 = c1 + 1;
  const easedEnter =
    enterProgress === 1
      ? 1
      : 1 + c3 * Math.pow(enterProgress - 1, 3) + c1 * Math.pow(enterProgress - 1, 2);

  const posX = 740 - easedEnter * 220; // 740 -> 520
  const posY = -340 + easedEnter * 180; // -340 -> -160
  const baseScale = 0.65 + easedEnter * 0.45; // 0.65 -> 1.1

  // Güneş Işınlarının Sürekli Yavaş Dönüşü ve Nabız Yaylanması
  const rayRotation = (frame * 0.22) % 360;
  const rayPulse = 1 + 0.05 * Math.sin(frame * 0.12);

  // Göz Kırpma (Wink) Zamanlaması: Kare 250 - 290 arasında çapkınca göz kırpar
  const isWinking = frame >= 250 && frame <= 290;
  // Göz kırpma sonrası parıltı (Kare 291 - 330)
  const showSparkle = frame >= 291 && frame <= 330;
  const sparkleScale = showSparkle
    ? Math.sin(((frame - 291) / 39) * Math.PI) * 1.3
    : 0;

  // Beat 4 (Kaçış): Güneş arkasından neşeyle ve hafifçe kıkırdar (chuckle bob)
  const isChuckling = frame >= 540;
  const chuckleY = isChuckling ? Math.sin(frame * 0.45) * 8 : Math.sin(frame * 0.12) * 3;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-20 will-change-transform"
      style={{
        transform: `translate(calc(-50% + ${posX}px), calc(-50% + ${
          posY + chuckleY
        }px)) scale(${baseScale})`,
      }}
    >
      <div className="relative flex items-center justify-center">
        {/* 1. DÖNEN VE PARILDAYAN GÜNEŞ IŞINLARI (RAY PETALS) */}
        <svg
          width="320"
          height="320"
          viewBox="0 0 320 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute will-change-transform"
          style={{
            transform: `rotate(${rayRotation.toFixed(2)}deg) scale(${rayPulse.toFixed(
              3
            )})`,
          }}
        >
          <defs>
            <linearGradient id="sunRayGrad" x1="160" y1="20" x2="160" y2="300" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.8" />
            </linearGradient>
          </defs>
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i} transform={`rotate(${i * 30} 160 160)`}>
              <path
                d="M 152,18 C 152,8 168,8 168,18 L 165,58 L 155,58 Z"
                fill="url(#sunRayGrad)"
              />
            </g>
          ))}
        </svg>

        {/* 2. GÜNEŞ ANA ÇEMBERİ VE SEVİMLİ YÜZÜ */}
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            {/* Sıcak Kehribar ve Bal Sarısı degrade */}
            <linearGradient id="sunBodyGrad" x1="100" y1="10" x2="100" y2="190" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Güneş Yanak Allığı */}
            <radialGradient id="sunCheekGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ea580c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Gövde Çemberi */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="url(#sunBodyGrad)"
            stroke="#d97706"
            strokeWidth="3.5"
          />

          {/* Sıcak Turuncu Yanaklar */}
          <circle cx="58" cy="112" r="14" fill="url(#sunCheekGrad)" />
          <circle cx="142" cy="112" r="14" fill="url(#sunCheekGrad)" />

          {/* Gözler */}
          {/* Sol Göz: Her zaman parıldayan kocaman açık göz */}
          <circle cx="70" cy="86" r="10.5" fill="#78350f" />
          <circle cx="67" cy="83" r="4.2" fill="#ffffff" />
          <circle cx="72" cy="89" r="1.8" fill="#ffffff" />

          {/* Sağ Göz: Göz Kırpma (Wink) animasyonu */}
          {isWinking ? (
            <g stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" fill="none">
              <path d="M 120,88 Q 131,100 142,88" />
              {/* Kirpikler */}
              <line x1="124" y1="94" x2="121" y2="99" />
              <line x1="131" y1="96" x2="131" y2="102" />
              <line x1="138" y1="94" x2="141" y2="99" />
            </g>
          ) : (
            <g>
              <circle cx="130" cy="86" r="10.5" fill="#78350f" />
              <circle cx="127" cy="83" r="4.2" fill="#ffffff" />
              <circle cx="132" cy="89" r="1.8" fill="#ffffff" />
            </g>
          )}

          {/* Göz Kırpma Sonrası Işıltı Yıldızı (Sparkle Star) */}
          {showSparkle && (
            <g
              transform={`translate(150, 72) scale(${sparkleScale})`}
              fill="#ffffff"
            >
              <path d="M 0,-12 Q 0,0 12,0 Q 0,0 0,12 Q 0,0 -12,0 Q 0,0 0,-12 Z" />
            </g>
          )}

          {/* Sevimli Neşeli Kaşlar */}
          <path d="M 60,69 Q 70,62 80,70" stroke="#92400e" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M 120,70 Q 130,62 140,69" stroke="#92400e" strokeWidth="3" strokeLinecap="round" fill="none" />

          {/* Büyük Mutlu Gülümseme & Dil */}
          <path
            d="M 68,114 Q 100,154 132,114"
            stroke="#78350f"
            strokeWidth="4.5"
            strokeLinecap="round"
            fill="#9a3412"
          />
          {/* Sevimli Pembemsi Dil */}
          <path
            d="M 85,128 Q 100,146 115,128 Z"
            fill="#fb7185"
          />
        </svg>
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// KAÇIŞ BULUT TOZU & HAREKET İZLERİ (ESCAPE PUFF & SPEED STREAKS)
// -----------------------------------------------------------------------------
interface EscapePuffProps {
  frame: number;
}

const EscapePuff: FC<EscapePuffProps> = ({ frame }) => {
  // Yalnızca Beat 4 kaçış anında aktif (540 - 620)
  if (frame < 540 || frame > 620) return null;

  const puffAge = frame - 540;
  const puffProgress = Math.min(1, puffAge / 45);
  const opacity = (1 - puffProgress) * 0.85;
  const scale = 0.5 + puffProgress * 1.5;

  return (
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 z-15 will-change-transform"
      style={{
        transform: `translate(calc(-50% + 20px), calc(-50% + 60px)) scale(${scale})`,
        opacity,
      }}
    >
      <div className="relative flex items-center justify-center">
        <span className="absolute w-16 h-16 rounded-full bg-white/70 blur-[3px] -translate-x-6" />
        <span className="absolute w-20 h-20 rounded-full bg-white/80 blur-[2px]" />
        <span className="absolute w-14 h-14 rounded-full bg-white/65 blur-[3px] translate-x-7" />
        <span className="absolute w-10 h-10 rounded-full bg-rose-200/50 blur-[2px] -translate-y-6" />
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
// GÜN BATIMI KARARMA PERDESİ (CINEMATIC SUNSET DUSK FADE)
// -----------------------------------------------------------------------------
interface SceneFadeProps {
  frame: number;
}

const SceneFade: FC<SceneFadeProps> = ({ frame }) => {
  // 640. kareden itibaren yavaşça kararır (10.66s - 12.0s)
  if (frame < 640) return null;

  const fadeProgress = Math.min(1, Math.max(0, (frame - 640) / 80));

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40 will-change-transform"
      style={{
        backgroundColor: '#090d16',
        opacity: fadeProgress * 0.95,
      }}
    />
  );
};

// -----------------------------------------------------------------------------
// ANA SAHNE BİLEŞENİ (SHY CLOUD SCENE)
// -----------------------------------------------------------------------------
export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  // ---------------------------------------------------------------------------
  // 3D SİNEMATİK YÖNETMEN KAMERASI (CAMERA CHOREOGRAPHY)
  // Spec ile %100 birebir hizalı 'at' anahtar kareleri
  // ---------------------------------------------------------------------------
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 1.0, x: 0, y: 0 },
      // 0.05s – 1.85s: Bulutun gelişini yumuşak pan ile karşılama
      { at: 0.05, duration: 1.8, scale: 1.05, x: 80, y: 0, ease: 'power2.out' },
      // 3.00s – 3.75s: Güneşin doğuşu ve bulutun şaşkınlık reaksiyonuna dinamik yakınlaşma
      { at: 3.0, duration: 0.75, scale: 1.18, x: -70, y: -30, ease: 'back.out(1.6)' },
      // 4.20s – 5.60s: İki karakter arasındaki bakışmayı kadrajlama
      { at: 4.2, duration: 1.4, scale: 1.12, x: -20, y: -15, ease: 'power2.inOut' },
      // 6.00s – 6.85s: Utanan ve büzülen buluta sıcak makro odak
      { at: 6.0, duration: 0.85, scale: 1.25, x: 40, y: 10, ease: 'expo.out' },
      // 9.00s – 9.45s: Bulutun kaçış öncesi sıkışma ve hız hazırlığı odağı
      { at: 9.0, duration: 0.45, scale: 1.3, x: 60, y: 15, ease: 'power2.in' },
      // 9.45s – 10.55s: Kaçan bulutun arkasından sola pan ve güneşe doğru genişleme
      { at: 9.45, duration: 1.1, scale: 1.08, x: -90, y: -25, ease: 'expo.out' },
      // 10.80s – 11.95s: Kararmadan önce gökyüzü kapanış süzülüşü
      { at: 10.8, duration: 1.15, scale: 1.02, x: 0, y: 0, ease: 'power2.out' },
    ]);
  }, []);

  return (
    <WorldStage
      aspect={aspect}
      backgroundSrc="projects/shy-cloud/sky_bg.svg"
      sfxTriggers={SFX_TRIGGERS}
    >
      {/* 1. SEVİMLİ BEYAZ BULUT (12 Prensipli Karakter Aktörü) */}
      <CharacterActor
        segments={CLOUD_SEGMENTS}
        hideShadow={true}
        hideDust={true}
        hideTrail={frame < 540}
        renderCustomActor={() => <CuteCloud frame={frame} />}
      />

      {/* 2. KAÇIŞ ANINDAKİ SEVİMLİ BULUT DUMANLARI (ESCAPE PUFF) */}
      <EscapePuff frame={frame} />

      {/* 3. PARLAK VE NEŞELİ GÜNEŞ (RADIANT SUN ACTOR) */}
      <RadiantSun frame={frame} />

      {/* 4. SİNEMATİK SAHNE KAPANIŞ VE KARARMA PERDESİ */}
      <SceneFade frame={frame} />
    </WorldStage>
  );
};

export default Scene;
