import React from 'react';

export type NoirSilhouettePose =
  | 'batmanDrop'
  | 'batmanCombat'
  | 'henchmanFedora'
  | 'henchmanKnockedOut'
  | 'policeOfficer';

export interface NoirSilhouetteRigProps {
  pose?: NoirSilhouettePose;
  size?: number;
  className?: string;
  fillColor?: string;
  eyeGlowColor?: string;
  capeFlareProgress?: number; // 0 -> 1 (pelerin açılma miktarı)
}

export const NoirSilhouetteRig: React.FC<NoirSilhouetteRigProps> = ({
  pose = 'batmanDrop',
  size = 180,
  className = '',
  fillColor = '#050811',
  eyeGlowColor = '#ffffff',
  capeFlareProgress = 1,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className="overflow-visible drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
      >
        <defs>
          <filter id="eyeGlowFilter">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Batman Drop Pose (Geniş Kanat Pelerin + Dik Kulaklar) */}
        {pose === 'batmanDrop' && (
          <g fill={fillColor}>
            {/* Pelerin Kanatları (capeFlareProgress ile genişleyen eğriler) */}
            <path
              d={`M 100 70 
                 C ${100 - 80 * capeFlareProgress} 40, ${100 - 95 * capeFlareProgress} 90, ${100 - 90 * capeFlareProgress} 150 
                 C ${100 - 70 * capeFlareProgress} 135, ${100 - 60 * capeFlareProgress} 160, ${100 - 45 * capeFlareProgress} 145 
                 C ${100 - 30 * capeFlareProgress} 165, ${100 - 20 * capeFlareProgress} 140, 100 170 
                 C ${100 + 20 * capeFlareProgress} 140, ${100 + 30 * capeFlareProgress} 165, ${100 + 45 * capeFlareProgress} 145 
                 C ${100 + 60 * capeFlareProgress} 160, ${100 + 70 * capeFlareProgress} 135, ${100 + 90 * capeFlareProgress} 150 
                 C ${100 + 95 * capeFlareProgress} 90, ${100 + 80 * capeFlareProgress} 40, 100 70 Z`}
            />

            {/* Gövde ve Bacaklar */}
            <path d="M 86 85 C 80 110, 84 140, 78 175 L 94 175 L 100 120 L 106 175 L 122 175 C 116 140, 120 110, 114 85 Z" />

            {/* Kafa & Uzun Kulaklar */}
            <path d="M 92 68 L 91 38 L 97 50 L 103 50 L 109 38 L 108 68 C 108 76, 92 76, 92 68 Z" />

            {/* Göz Işıkları (Beyaz Yarıklar) */}
            <g fill={eyeGlowColor} filter="url(#eyeGlowFilter)">
              <polygon points="94,56 99,58 95,60" />
              <polygon points="106,56 101,58 105,60" />
            </g>
          </g>
        )}

        {/* 2. Batman Combat Pose (Dinamik Yumruk ve Savrulan Pelerin) */}
        {pose === 'batmanCombat' && (
          <g fill={fillColor}>
            {/* Savrulan Pelerin Eğrisi */}
            <path d="M 90 70 C 40 60, 20 110, 15 160 C 40 145, 60 165, 80 150 C 95 140, 100 160, 110 170 C 95 125, 100 95, 90 70 Z" />
            {/* Dövüş Duruşu Gövde */}
            <path d="M 85 75 C 75 95, 70 120, 65 170 L 85 170 C 90 140, 105 130, 120 170 L 140 170 C 125 120, 115 95, 105 75 Z" />
            {/* İleri Uzanan Yumruk / Kol */}
            <path d="M 105 82 L 155 76 C 162 76, 168 82, 165 88 L 145 96 L 105 92 Z" />
            {/* Maskeli Kafa */}
            <path d="M 96 68 L 98 42 L 103 52 L 107 52 L 112 42 L 114 68 C 114 74, 96 74, 96 68 Z" />
            <polygon points="104,58 110,59 105,62" fill={eyeGlowColor} filter="url(#eyeGlowFilter)" />
          </g>
        )}

        {/* 3. Henchman Fedora (Fötr Şapkalı, Geniş Trençkotlu Gangster) */}
        {pose === 'henchmanFedora' && (
          <g fill={fillColor}>
            {/* Geniş Trençkot Gövdesi */}
            <path d="M 60 90 C 50 120, 45 150, 40 180 L 160 180 C 155 150, 150 120, 140 90 C 125 80, 75 80, 60 90 Z" />
            {/* Kaldırılmış Geniş Yaka */}
            <polygon points="65,95 80,72 90,88" />
            <polygon points="135,95 120,72 110,88" />
            {/* Fötr Şapka */}
            <ellipse cx="100" cy="52" rx="42" ry="7" />
            <path d="M 75 52 C 77 32, 85 26, 100 26 C 115 26, 123 32, 125 52 Z" />
            {/* Gölgeli Yüz Hattı */}
            <circle cx="100" cy="65" r="16" />
          </g>
        )}

        {/* 4. Knocked Out Henchmen (Yerde Bağlı / Devrilmiş) */}
        {pose === 'henchmanKnockedOut' && (
          <g fill={fillColor}>
            <ellipse cx="100" cy="140" rx="70" ry="24" />
            {/* Düşmüş Şapka */}
            <ellipse cx="40" cy="155" rx="18" ry="4" transform="rotate(-15 40 155)" />
            <path d="M 30 155 C 32 142, 38 138, 48 138 C 55 138, 60 142, 58 155 Z" transform="rotate(-15 40 155)" />
            {/* Bağlayan İp Çizgileri */}
            <path d="M 80 125 C 85 145, 88 155, 92 160" stroke="#94a3b8" strokeWidth="3" />
            <path d="M 105 124 C 110 144, 114 154, 118 160" stroke="#94a3b8" strokeWidth="3" />
          </g>
        )}

        {/* 5. Police Officer (Koşan Polis Silüeti) */}
        {pose === 'policeOfficer' && (
          <g fill={fillColor}>
            {/* Polis Şapkası (Vizörlü) */}
            <path d="M 88 44 C 90 34, 105 34, 112 40 L 122 46 L 105 48 L 88 44 Z" />
            <circle cx="100" cy="54" r="12" />
            {/* Koşan Üniformalı Gövde & Bacaklar */}
            <path d="M 88 66 L 115 64 L 120 115 L 85 115 Z" />
            <path d="M 88 115 L 65 170 L 78 175 L 102 125 L 120 155 L 145 170 L 152 160 L 122 118 Z" />
            {/* Koşan Kollar */}
            <path d="M 90 74 L 70 96 L 76 102 L 95 84 Z" />
            <path d="M 112 74 L 135 90 L 145 84 L 115 68 Z" />
          </g>
        )}
      </svg>
    </div>
  );
};
