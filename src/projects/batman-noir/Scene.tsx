import { type FC } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import {
  WorldStage,
  CharacterActor,
  type ActorMotionSegment,
  type SfxTrigger,
} from '../../world';
import {
  SvgFilterLab,
  LayeredStage3D,
  LayerPlane,
} from '../../primitives';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

export const BEATS = [
  { id: 'rooftop-ambush', startFrame: 0, endFrame: 73 },
  { id: 'combat-counter', startFrame: 74, endFrame: 151 },
  { id: 'moonlit-throw-blackout', startFrame: 152, endFrame: 283 },
  { id: 'gotham-blimp-search', startFrame: 284, endFrame: 373 },
  { id: 'spotlight-resolution', startFrame: 374, endFrame: 480 },
] as const;

const SFX_TRIGGERS: SfxTrigger[] = [
  { frame: 25, sfx: 'whoosh-pan', volume: 0.8 },
  { frame: 55, sfx: 'step-stone', volume: 0.9 },
  { frame: 115, sfx: 'roar-shockwave', volume: 1.0 },
  { frame: 410, sfx: 'ui-lock', volume: 0.7 },
];

const BATMAN_SEGMENTS: ActorMotionSegment[] = [
  {
    startFrame: 0,
    endFrame: 73,
    fromX: 0,
    fromY: -350,
    toX: 0,
    toY: 0,
    fromScale: 0.8,
    toScale: 1.0,
    facingRight: true,
    action: 'leap',
  },
  {
    startFrame: 74,
    endFrame: 151,
    fromX: 0,
    fromY: 0,
    toX: 20,
    toY: 0,
    fromScale: 1.0,
    toScale: 1.05,
    facingRight: true,
    action: 'idle',
  },
  {
    startFrame: 152,
    endFrame: 283,
    fromX: 20,
    fromY: 0,
    toX: -40,
    toY: 0,
    fromScale: 1.05,
    toScale: 1.0,
    facingRight: false,
    action: 'shout',
  },
  {
    startFrame: 284,
    endFrame: 480,
    fromX: -40,
    fromY: 0,
    toX: -40,
    toY: 0,
    fromScale: 1.0,
    toScale: 1.0,
    facingRight: false,
    action: 'idle',
  },
];

// ==========================================
// ARCHITECTURAL DARK DECO COMPONENTS
// ==========================================

export const GothamSkylineBackdrop: FC = () => (
  <div className="absolute inset-0 w-[1920px] h-[1080px] overflow-hidden pointer-events-none">
    {/* Giant Hazy Luminous Full Moon Disk */}
    <div className="moon-disk absolute top-[70px] right-[280px] flex items-center justify-center">
      <svg className="w-[500px] h-[500px] overflow-visible" viewBox="0 0 440 440" fill="none">
        <circle
          cx="220"
          cy="220"
          r="200"
          fill="url(#noir-moon-radial)"
          opacity="0.95"
        />
        {/* Soft Moon Halo Penumbra */}
        <circle
          cx="220"
          cy="220"
          r="230"
          stroke="#E6ECF8"
          strokeWidth="6"
          opacity="0.35"
          filter="blur(10px)"
        />
        {/* Atmospheric Lunar Clouds */}
        <path
          d="M30 220 Q140 190 260 220 Q340 240 410 210 Q330 255 220 240 Q100 245 30 220 Z"
          fill="#1C273C"
          opacity="0.55"
        />
      </svg>
    </div>

    {/* Driving Noir Rain Streaks */}
    <svg className="rain-layer absolute inset-0 w-full h-full opacity-30" viewBox="0 0 1920 1080">
      <defs>
        <pattern id="rain-pattern" width="120" height="120" patternTransform="rotate(14)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="44" stroke="#E6ECF8" strokeWidth="1.5" opacity="0.65" />
          <line x1="40" y1="60" x2="40" y2="104" stroke="#E6ECF8" strokeWidth="1.5" opacity="0.65" />
          <line x1="80" y1="20" x2="80" y2="64" stroke="#E6ECF8" strokeWidth="1.5" opacity="0.65" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#rain-pattern)" />
    </svg>
  </div>
);

export const BatDropSilhouette: FC = () => (
  <div className="bat-drop-container color-block-noir absolute inset-0 w-[1920px] h-[1080px] pointer-events-none">
    {/* Brick Chimney on the Left */}
    <div className="chimney-stack absolute bottom-0 left-[140px] w-[190px] h-[540px] bg-[#05080E] border-r-2 border-[#25354E]">
      <div className="w-[210px] h-[36px] -ml-[10px] bg-[#0A0E17] border border-[#2B3E5C]" />
    </div>

    {/* Two Fedora-wearing Henchmen in Panic (Beat 1) */}
    <div className="b1-thug-group absolute bottom-[220px] left-[560px] flex items-end gap-20">
      {/* Thug 1 (Looking Up) */}
      <div className="b1-thug-1 relative flex flex-col items-center">
        <svg className="w-[210px] h-[340px]" viewBox="0 0 160 280" fill="none">
          <ellipse cx="80" cy="38" rx="55" ry="12" fill="#0A0E17" stroke="#25354E" strokeWidth="2" />
          <path d="M52 38 L58 14 Q80 8 102 14 L108 38 Z" fill="#05070B" />
          <circle cx="80" cy="56" r="24" fill="#080C14" />
          <path
            d="M30 84 Q80 72 130 84 L145 230 L115 280 L80 280 L45 280 L15 230 Z"
            fill="#05070B"
            stroke="#1D2A3D"
            strokeWidth="2"
          />
          <path d="M60 84 L80 130 L100 84" stroke="#384E70" strokeWidth="3" />
        </svg>
      </div>

      {/* Thug 2 (Crouching back in fear) */}
      <div className="b1-thug-2 relative flex flex-col items-center">
        <svg className="w-[200px] h-[320px]" viewBox="0 0 160 260" fill="none">
          <ellipse cx="75" cy="42" rx="52" ry="11" fill="#0A0E17" stroke="#25354E" strokeWidth="2" />
          <path d="M48 42 L54 18 Q75 12 96 18 L102 42 Z" fill="#05070B" />
          <path
            d="M26 88 Q75 76 124 88 L138 220 L110 260 L75 260 L40 260 L12 220 Z"
            fill="#05070B"
            stroke="#1D2A3D"
            strokeWidth="2"
          />
          <path d="M124 96 L154 60 L144 50 L110 80" fill="#05070B" />
          <circle cx="152" cy="52" r="10" fill="#080C14" />
        </svg>
      </div>
    </div>

    {/* Batman Plummets from Above with Massive Wing Cape */}
    <div className="b1-batman-drop absolute bottom-[260px] left-[840px] flex flex-col items-center">
      <svg className="w-[520px] h-[580px] overflow-visible" viewBox="0 0 400 460" fill="none">
        {/* Massive Flared Scalloped Bat Wings Cape */}
        <path
          className="b1-cape-wings"
          d="M200 110 Q110 60 10 90 Q70 180 30 290 Q120 280 160 380 Q190 280 200 420 Q210 280 240 380 Q280 280 370 290 Q330 180 390 90 Q290 60 200 110 Z"
          fill="#05070B"
          stroke="#1F2E45"
          strokeWidth="3"
          style={{ transformOrigin: '200px 110px' }}
        />
        {/* Muscular Torso Silhouette */}
        <polygon points="160,110 240,110 220,260 180,260" fill="#080C14" />
        {/* Batman Cowl with 42px Pointed Horns */}
        <polygon points="200,30 180,95 220,95" fill="#05070B" />
        <polygon points="180,95 172,28 188,75" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
        <polygon points="220,95 228,28 212,75" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
        {/* Stark Glowing White Triangular Eye Slits */}
        <polygon points="184,72 196,77 193,70" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFFFFF)" />
        <polygon points="216,72 204,77 207,70" fill="#FFFFFF" filter="drop-shadow(0 0 4px #FFFFFF)" />
        {/* Scalloped Gauntlet Fins */}
        <path d="M152 180 L136 170 L146 195 L132 190 L142 215 L160 210 Z" fill="#05070B" />
        <path d="M248 180 L264 170 L254 195 L268 190 L258 215 L240 210 Z" fill="#05070B" />
      </svg>
    </div>
  </div>
);

export const CombatSmearClash: FC = () => (
  <div className="b2-combat-container color-block-lunar absolute inset-0 w-[1920px] h-[1080px] pointer-events-none" style={{ opacity: 0 }}>
    {/* 2-Frame High Contrast Impact Flash Overlay */}
    <div className="b2-impact-flash absolute inset-0 bg-[#E6ECF8] opacity-0" />

    {/* Close-Up Combat Arena */}
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Heavy Punching Henchman */}
      <div className="b2-henchman-punch absolute left-[320px] top-[240px]">
        <svg className="w-[580px] h-[580px] overflow-visible" viewBox="0 0 460 460" fill="none">
          <ellipse cx="190" cy="120" rx="95" ry="24" fill="#0A0E17" stroke="#2E405C" strokeWidth="3" />
          <path d="M140 120 L152 70 Q190 60 228 70 L240 120 Z" fill="#05070B" />
          <path d="M100 180 Q190 160 280 180 L310 400 L80 400 Z" fill="#05070B" stroke="#1D2A3D" strokeWidth="2" />
          <path
            className="b2-punch-arm"
            d="M240 190 L410 170 L430 220 L270 240 Z"
            fill="#080C14"
          />
          <rect
            className="b2-punch-fist"
            x="390"
            y="160"
            width="85"
            height="75"
            rx="18"
            fill="#05070B"
            stroke="#384E70"
            strokeWidth="4"
          />
        </svg>
      </div>

      {/* High-Velocity Curved Punch Smear Wedge (Dynamic Smear Frame) */}
      <div className="b2-smear-wedge absolute left-[600px] top-[320px] opacity-0">
        <svg className="w-[440px] h-[260px] overflow-visible" viewBox="0 0 340 180" fill="none">
          <path
            d="M10 140 C110 30, 220 10, 330 90 C240 50, 140 70, 20 160 Z"
            fill="url(#smear-arc-grad)"
          />
        </svg>
      </div>

      {/* Batman Deflection & Arm Lock Counter-Pose */}
      <div className="b2-batman-counter absolute right-[280px] top-[190px]">
        <svg className="w-[620px] h-[640px] overflow-visible" viewBox="0 0 500 520" fill="none">
          <path d="M120 160 Q260 130 400 160 L440 480 L80 480 Z" fill="#05070B" stroke="#1F2E45" strokeWidth="3" />
          <polygon points="260,50 220,150 300,150" fill="#05070B" />
          <polygon points="220,150 208,50 234,120" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
          <polygon points="300,150 312,50 286,120" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
          {/* Blazing Slit Eyes */}
          <polygon points="230,123 248,130 245,120" fill="#FFFFFF" filter="drop-shadow(0 0 6px #FFFFFF)" />
          <polygon points="290,123 272,130 275,120" fill="#FFFFFF" filter="drop-shadow(0 0 6px #FFFFFF)" />
          <path
            className="b2-bat-gauntlet"
            d="M220 180 L90 190 L80 240 L210 230 Z"
            fill="#080C14"
          />
          <path d="M140 170 L120 155 L132 185 L112 180 L124 205 L150 200 Z" fill="#05070B" stroke="#384E70" strokeWidth="2" />
          <circle cx="85" cy="215" r="30" fill="#05070B" stroke="#4A658E" strokeWidth="4" />
        </svg>
      </div>
    </div>
  </div>
);

export const GiantMoonLedgeStage: FC = () => (
  <div className="b3-moon-stage color-block-lunar absolute inset-0 w-[1920px] h-[1080px] pointer-events-none" style={{ opacity: 0 }}>
    {/* Center Silhouette: Batman Hurling the Thug into the Lens */}
    <div className="b3-silhouette-clash absolute inset-0 flex items-center justify-center">
      {/* Batman Pivot Silhouette */}
      <div className="b3-batman-throw absolute left-[560px] bottom-[260px]">
        <svg className="w-[420px] h-[500px]" viewBox="0 0 320 400" fill="none">
          <path d="M80 120 Q160 90 240 120 L280 380 L40 380 Z" fill="#05070B" stroke="#1F2E45" strokeWidth="3" />
          <polygon points="160,25 135,110 185,110" fill="#05070B" />
          <polygon points="135,110 126,25 144,90" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
          <polygon points="185,110 194,25 176,90" fill="#05070B" stroke="#2B3E5C" strokeWidth="2" />
          <path d="M160 140 L280 100 L300 135 L170 180 Z" fill="#05070B" stroke="#384E70" strokeWidth="3" />
        </svg>
      </div>

      {/* Thug Flying Across Parabolic Arc Straight into the Camera */}
      <div className="b3-thug-flying absolute left-[780px] bottom-[340px] flex items-center justify-center">
        <svg
          className="b3-flying-coat w-[480px] h-[480px] overflow-visible"
          viewBox="0 0 360 360"
          fill="none"
          style={{ transformOrigin: 'center center' }}
        >
          <ellipse cx="260" cy="60" rx="52" ry="16" fill="#0A0E17" stroke="#25354E" strokeWidth="3" />
          <path
            d="M80 80 Q180 40 280 80 Q340 180 320 300 Q180 360 40 300 Q20 180 80 80 Z"
            fill="#05070B"
            stroke="#2B3E5C"
            strokeWidth="4"
          />
          <path d="M60 90 L10 40 L30 20 L90 70 Z" fill="#05070B" />
          <path d="M300 90 L350 40 L330 20 L270 70 Z" fill="#05070B" />
        </svg>
      </div>
    </div>

    {/* Hard Blackout Polygon Screen Cover ("FILLS SC.") */}
    <div className="b3-blackout-curtain absolute inset-0 bg-[#05070A] opacity-0" />
  </div>
);

export const GCPDBlimpCity: FC = () => (
  <div className="b4-blimp-city color-block-blimp absolute inset-0 w-[1920px] h-[1080px] pointer-events-none" style={{ opacity: 0 }}>
    {/* Low-Angle Gotham Sky with Deep Vertical Art Deco Monoliths */}
    <div className="absolute inset-0 bg-[#0A101C]">
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <polygon points="100,1080 360,0 520,0 600,1080" fill="#0D1524" />
        <polygon points="750,1080 900,0 1020,0 1150,1080" fill="#10192A" />
        <polygon points="1320,1080 1440,0 1580,0 1780,1080" fill="#0D1524" />
        <line x1="440" y1="0" x2="440" y2="90" stroke="#324564" strokeWidth="5" />
        <line x1="960" y1="0" x2="960" y2="120" stroke="#324564" strokeWidth="5" />
        <line x1="1510" y1="0" x2="1510" y2="100" stroke="#324564" strokeWidth="5" />
      </svg>
    </div>

    {/* Cruising GCPD Police Blimp (Dirigible) */}
    <div className="b4-blimp-hull absolute top-[80px] left-[1100px]">
      <svg className="w-[720px] h-[320px] overflow-visible" viewBox="0 0 520 220" fill="none">
        <path
          d="M80 60 C180 20, 360 20, 470 60 C510 75, 520 100, 500 125 C450 160, 200 160, 80 125 C40 110, 30 80, 80 60 Z"
          fill="#141E30"
          stroke="#384E70"
          strokeWidth="4"
        />
        <rect x="220" y="145" width="120" height="26" rx="6" fill="#080C14" stroke="#25354E" strokeWidth="2" />
        <circle cx="245" cy="158" r="4" fill="#F5BF4F" opacity="0.85" />
        <circle cx="265" cy="158" r="4" fill="#F5BF4F" opacity="0.85" />
        <circle cx="285" cy="158" r="4" fill="#F5BF4F" opacity="0.85" />
        <circle cx="305" cy="158" r="4" fill="#F5BF4F" opacity="0.85" />
        <text
          x="280"
          y="105"
          fill="#E6ECF8"
          fillOpacity="0.8"
          fontSize="24"
          fontFamily="monospace"
          fontWeight="900"
          letterSpacing="0.3em"
        >
          G.C.P.D.
        </text>
        {/* Giant Volumetric White Spotlight Beams */}
        <polygon
          className="b4-spotlight-beam-1"
          points="250,170 30,760 280,760"
          fill="url(#blimp-searchlight-beam)"
          opacity="0.85"
        />
        <polygon
          className="b4-spotlight-beam-2"
          points="310,170 320,760 580,760"
          fill="url(#blimp-searchlight-beam)"
          opacity="0.85"
        />
      </svg>
    </div>

    {/* Running Police Officers in Silhouette with Flashlights */}
    <div className="b4-police-runners absolute bottom-[180px] left-[680px] flex items-end gap-28">
      <div className="flex flex-col items-center">
        <svg className="w-[160px] h-[260px]" viewBox="0 0 120 200" fill="none">
          <ellipse cx="60" cy="28" rx="30" ry="10" fill="#0A0E17" stroke="#2E405C" strokeWidth="2" />
          <path d="M42 28 L46 12 Q60 8 74 12 L78 28 Z" fill="#05070B" />
          <path d="M25 64 Q60 55 95 64 L110 160 L85 200 L60 200 L35 200 L10 160 Z" fill="#05070B" stroke="#1F2E45" strokeWidth="2" />
          <polygon points="95,95 280,120 260,190" fill="url(#blimp-searchlight-beam)" opacity="0.75" />
        </svg>
      </div>

      <div className="flex flex-col items-center">
        <svg className="w-[160px] h-[260px]" viewBox="0 0 120 200" fill="none">
          <ellipse cx="60" cy="28" rx="30" ry="10" fill="#0A0E17" stroke="#2E405C" strokeWidth="2" />
          <path d="M42 28 L46 12 Q60 8 74 12 L78 28 Z" fill="#05070B" />
          <path d="M25 64 Q60 55 95 64 L110 160 L85 200 L60 200 L35 200 L10 160 Z" fill="#05070B" stroke="#1F2E45" strokeWidth="2" />
          <polygon points="95,95 280,75 260,140" fill="url(#blimp-searchlight-beam)" opacity="0.75" />
        </svg>
      </div>
    </div>
  </div>
);

export const TiedThugsSpotlight: FC = () => (
  <div className="b5-resolution-stage color-block-spotlight absolute inset-0 w-[1920px] h-[1080px] pointer-events-none" style={{ opacity: 0 }}>
    {/* Center Brick Parapet Wall */}
    <div className="absolute bottom-[260px] left-[700px] w-[520px] h-[380px] bg-[#080C14] border-t-4 border-l-2 border-r-2 border-[#25354E]">
      <div className="h-[2px] w-full bg-[#1A253A] mt-16" />
      <div className="h-[2px] w-full bg-[#1A253A] mt-16" />
      <div className="h-[2px] w-full bg-[#1A253A] mt-16" />
    </div>

    {/* Moving Conical Spotlight Locking in Place */}
    <div className="b5-spotlight-disc absolute bottom-[160px] left-[740px] flex items-center justify-center">
      <svg className="w-[700px] h-[420px] overflow-visible" viewBox="0 0 540 320" fill="none">
        <ellipse
          cx="270"
          cy="160"
          rx="250"
          ry="140"
          fill="#FFFFFF"
          fillOpacity="0.92"
          filter="blur(3px)"
        />
        <ellipse
          cx="270"
          cy="160"
          rx="275"
          ry="155"
          stroke="#E6ECF8"
          strokeWidth="8"
          opacity="0.45"
        />
      </svg>
    </div>

    {/* Knocked-Out Henchmen Tied Back-to-Back with Bat-Rope */}
    <div className="b5-thugs-tied absolute bottom-[220px] left-[840px] flex items-center justify-center">
      <svg className="w-[480px] h-[380px] overflow-visible" viewBox="0 0 360 300" fill="none">
        <path d="M120 140 Q70 120 30 190 L90 280 L160 280 Z" fill="#080C14" />
        <circle cx="65" cy="150" r="26" fill="#05070B" />
        <ellipse cx="65" cy="140" rx="38" ry="11" fill="#0A0E17" stroke="#25354E" strokeWidth="2" />
        <path d="M240 140 Q290 120 330 190 L270 280 L200 280 Z" fill="#080C14" />
        <circle cx="295" cy="150" r="26" fill="#05070B" />
        <ellipse cx="295" cy="140" rx="38" ry="11" fill="#0A0E17" stroke="#25354E" strokeWidth="2" />

        {/* Coiled Bat-Rope Details */}
        <g stroke="#05070B" strokeWidth="8" strokeLinecap="round">
          <line x1="75" y1="180" x2="285" y2="180" />
          <line x1="70" y1="205" x2="290" y2="205" />
          <line x1="80" y1="230" x2="280" y2="230" />
          <line x1="85" y1="255" x2="275" y2="255" />
        </g>
        <g stroke="#2E405C" strokeWidth="3" strokeLinecap="round">
          <line x1="75" y1="180" x2="285" y2="180" />
          <line x1="70" y1="205" x2="290" y2="205" />
          <line x1="80" y1="230" x2="280" y2="230" />
          <line x1="85" y1="255" x2="275" y2="255" />
        </g>

        {/* Sharp Bat-Insignia Emblem Resting on Wall in Foreground */}
        <g transform="translate(138, 225) scale(0.75)">
          <path
            d="M56 12 L70 38 L42 38 Z"
            fill="#05070B"
          />
          <path
            d="M10 20 Q50 60 90 20 Q110 50 130 20 Q170 60 210 20 L200 80 Q150 120 110 80 Q70 120 20 80 Z"
            fill="#05070B"
            stroke="#4A658E"
            strokeWidth="4"
          />
        </g>
      </svg>
    </div>

    {/* Cinematic Noir Letterbox Typography */}
    <div className="absolute top-[80px] inset-x-0 flex flex-col items-center text-center">
      <span className="font-mono text-[22px] font-bold tracking-[0.35em] uppercase text-[#E6ECF8]/80">
        GOTHAM CITY POLICE DEPARTMENT
      </span>
      <h1 className="mt-2 text-[64px] font-black tracking-[-0.03em] uppercase text-[#E6ECF8] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
        Gecenin Yargıcı
      </h1>
    </div>
  </div>
);

// ==========================================
// MAIN SCENE CHOREOGRAPHY (60 FPS DETERMINISTIC)
// ==========================================

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  useRemotionGSAP((tl) => {
    // 1. MOTIVATED SPATIAL CAMERA CHOREOGRAPHY (synced with spec.json)
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 1.05, y: 15 },
      { at: 0.05, duration: 1.15, scale: 1.0, y: 0, ease: 'power2.out' },
      { at: 1.25, duration: 1.25, scale: 1.14, x: -25, y: -10, ease: 'expo.out' },
      { at: 2.55, duration: 2.15, scale: 1.02, x: 18, y: 0, ease: 'power2.inOut' },
      { at: 4.75, duration: 1.45, scale: 1.06, x: -30, y: -15, ease: 'power1.inOut' },
      { at: 6.25, duration: 1.7, scale: 1.0, x: 0, y: 0, ease: 'power2.out' },
    ]);

    // ==========================================
    // BEAT 1: ROOFTOP AMBUSH & BAT-DROP (f000 - f073 | 0.00s - 1.23s)
    // ==========================================
    tl.fromTo(
      '.b1-thug-1',
      { y: 0, rotation: 0 },
      { y: -16, rotation: -4, duration: 0.55, ease: 'power2.out' },
      0.05
    );
    tl.fromTo(
      '.b1-thug-2',
      { y: 0, x: 0 },
      { y: 12, x: 24, duration: 0.55, ease: 'power2.out' },
      0.08
    );
    tl.fromTo(
      '.b1-batman-drop',
      { y: -650, scale: 0.65, opacity: 0.8 },
      { y: 0, scale: 1.0, opacity: 1, duration: 0.62, ease: 'power3.in' },
      0.22
    );
    tl.fromTo(
      '.b1-cape-wings',
      { scaleX: 0.45, scaleY: 0.7 },
      { scaleX: 1.65, scaleY: 1.25, duration: 0.58, ease: 'back.out(1.8)' },
      0.35
    );
    // Heavy 3-Point Impact Crouch
    tl.to(
      '.b1-batman-drop',
      { scaleY: 0.88, duration: 0.12, ease: 'power2.inOut', yoyo: true, repeat: 1 },
      0.84
    );

    // ==========================================
    // BEAT 2: COMBAT COUNTER & SMEAR STRIKE (f074 - f151 | 1.23s - 2.52s)
    // ==========================================
    tl.to(
      '.bat-drop-container',
      { opacity: 0, duration: 0.05, ease: 'steps(1)' },
      1.22
    );
    tl.to(
      '.b2-combat-container',
      { opacity: 1, duration: 0.05, ease: 'steps(1)' },
      1.22
    );
    // Thug Heavy Punch
    tl.fromTo(
      '.b2-henchman-punch',
      { x: -120, y: 40 },
      { x: 180, y: -20, duration: 0.48, ease: 'power3.inOut' },
      1.25
    );
    // Kinetic White Punch Smear Wedge
    tl.fromTo(
      '.b2-smear-wedge',
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1.35, duration: 0.08, ease: 'none' },
      1.52
    );
    tl.to(
      '.b2-smear-wedge',
      { opacity: 0, scale: 1.6, duration: 0.08, ease: 'none' },
      1.6
    );
    // Batman Gauntlet Deflection & Counter-Strike
    tl.fromTo(
      '.b2-batman-counter',
      { x: 40, rotation: 0 },
      { x: -45, rotation: 4, duration: 0.42, ease: 'back.out(1.6)' },
      1.55
    );
    // 2-Frame Impact Flash
    tl.fromTo(
      '.b2-impact-flash',
      { opacity: 0 },
      { opacity: 0.9, duration: 0.04, ease: 'steps(1)', yoyo: true, repeat: 1 },
      1.95
    );

    // ==========================================
    // BEAT 3: MOONLIT THROW & BLACKOUT (f152 - f283 | 2.53s - 4.73s)
    // ==========================================
    tl.to(
      '.b2-combat-container',
      { opacity: 0, duration: 0.05, ease: 'steps(1)' },
      2.52
    );
    tl.to(
      '.b3-moon-stage',
      { opacity: 1, duration: 0.05, ease: 'steps(1)' },
      2.52
    );
    // Batman Leverage Pivot
    tl.fromTo(
      '.b3-batman-throw',
      { rotation: 0 },
      { rotation: -16, duration: 0.65, ease: 'power2.inOut' },
      2.56
    );
    // Parabolic Thug Throw Hurtling Straight into the Camera
    tl.fromTo(
      '.b3-thug-flying',
      { x: 0, y: 0, scale: 0.72, rotation: 0 },
      { x: 120, y: -180, scale: 1.6, rotation: -45, duration: 0.85, ease: 'power2.out' },
      2.85
    );
    tl.to(
      '.b3-thug-flying',
      { x: 180, y: 60, scale: 5.6, rotation: -90, duration: 0.65, ease: 'power3.in' },
      3.7
    );
    // Sudden Blackout ("FILLS SC.")
    tl.fromTo(
      '.b3-blackout-curtain',
      { opacity: 0 },
      { opacity: 1, duration: 0.05, ease: 'steps(1)' },
      4.35
    );

    // ==========================================
    // BEAT 4: GCPD BLIMP CITY PATROL (f284 - f373 | 4.73s - 6.23s)
    // ==========================================
    tl.to(
      '.b3-moon-stage',
      { opacity: 0, duration: 0.05, ease: 'steps(1)' },
      4.73
    );
    tl.to(
      '.b4-blimp-city',
      { opacity: 1, duration: 0.05, ease: 'steps(1)' },
      4.73
    );
    // Blimp Cruising Across Spire Tops
    tl.fromTo(
      '.b4-blimp-hull',
      { x: 260 },
      { x: -520, duration: 1.48, ease: 'none' },
      4.75
    );
    // Dual Spotlights Sweeping
    tl.fromTo(
      '.b4-spotlight-beam-1',
      { rotation: -20, transformOrigin: '250px 170px' },
      { rotation: 18, duration: 1.45, ease: 'sine.inOut' },
      4.78
    );
    tl.fromTo(
      '.b4-spotlight-beam-2',
      { rotation: -15, transformOrigin: '310px 170px' },
      { rotation: 22, duration: 1.45, ease: 'sine.inOut' },
      4.78
    );
    // Running Police Silhouettes
    tl.fromTo(
      '.b4-police-runners',
      { x: 480 },
      { x: -320, duration: 1.42, ease: 'power1.out' },
      4.8
    );

    // ==========================================
    // BEAT 5: SPOTLIGHT LOCK & BOUND THUGS (f374 - f480 | 6.23s - 8.00s)
    // ==========================================
    tl.to(
      '.b4-blimp-city',
      { opacity: 0, duration: 0.05, ease: 'steps(1)' },
      6.23
    );
    tl.to(
      '.b5-resolution-stage',
      { opacity: 1, duration: 0.05, ease: 'steps(1)' },
      6.23
    );
    // Spotlight Disc Sweeps In and Locks Center
    tl.fromTo(
      '.b5-spotlight-disc',
      { x: -480, scale: 0.65, opacity: 0 },
      { x: 0, scale: 1.0, opacity: 1, duration: 0.72, ease: 'back.out(1.3)' },
      6.28
    );
    // Bound Thugs Reveal
    tl.fromTo(
      '.b5-thugs-tied',
      { opacity: 0, scale: 0.92 },
      { opacity: 1, scale: 1.0, duration: 0.65, ease: 'power2.out' },
      6.45
    );
  }, []);

  return (
    <AbsoluteFill className="bg-[#080B11]">
      {/* Invisible SvgFilterLab for Procedural Lunar Halos, Smear Arcs & Volumetric Searchlights */}
      <SvgFilterLab
        accentPrimary="#E6ECF8"
        accentSecondary="#344563"
      />

      <svg aria-hidden="true" className="pointer-events-none absolute h-0 w-0 overflow-hidden">
        <defs>
          <radialGradient id="noir-moon-radial" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="65%" stopColor="#E6ECF8" />
            <stop offset="85%" stopColor="#BACCE6" />
            <stop offset="100%" stopColor="#2E405C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="smear-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#E6ECF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#25354E" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="blimp-searchlight-beam" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
            <stop offset="45%" stopColor="#E6ECF8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>

      <WorldStage
        backgroundSrc="projects/batman-noir/gotham_bg.svg"
        aspect={aspect}
        rigClassName="camera-rig"
        sfxTriggers={SFX_TRIGGERS}
      >
        {/* LayeredStage3D for Authentic Film-Noir Exploded Depth Planes */}
        <LayeredStage3D
          perspective={1400}
          className="w-[1920px] h-[1080px] relative overflow-hidden"
          rigClassName="w-[1920px] h-[1080px] relative"
        >
          {/* Layer Plane Z=0: Deep Black Paper Sky, Art Deco Spires, Lunar Disc */}
          <LayerPlane z={0} className="absolute inset-0 w-[1920px] h-[1080px]">
            <GothamSkylineBackdrop />
          </LayerPlane>

          {/* Layer Plane Z=30: Rooftop Ridge, Characters & Combat Action */}
          <LayerPlane z={30} className="absolute inset-0 w-[1920px] h-[1080px]">
            <BatDropSilhouette />
            <CombatSmearClash />
            <GiantMoonLedgeStage />
            <GCPDBlimpCity />
            <TiedThugsSpotlight />

            {/* CharacterActor Integration for Movement Coordinate Calibration */}
            <div className="opacity-0 pointer-events-none">
              <CharacterActor segments={BATMAN_SEGMENTS} />
            </div>
          </LayerPlane>
        </LayeredStage3D>
      </WorldStage>
    </AbsoluteFill>
  );
};
