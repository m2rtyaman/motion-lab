/**
 * 22 KÜTÜPHANELİK HAREKET VE ANİMASYON EKOSİSTEM SÖZLÜĞÜ
 * (Opus 5.5 Master Rehber — Sayfa 20-21)
 * 
 * "Saf Canvas her şeyi yapabilir, ama bazen tekerleği yeniden icat etmeye gerek yok.
 * Doğru kütüphaneyi seçmek yüz satır kod yazmak yerine işin özüne odaklanmayı sağlar."
 */

export interface LibraryDescriptor {
  name: string;
  whatItDoes: string;
  whenToUse: string;
  remotionCompatible: boolean;
  packageNpm?: string;
}

export const OPUS_LIBRARY_ECOSYSTEM: Record<string, LibraryDescriptor> = {
  gsap: {
    name: 'GSAP',
    whatItDoes: 'Zaman çizelgesi, easing, yazı bölme, şekil morph',
    whenToUse: 'Karmaşık zamanlama, yazı animasyonu, GPU transform tweening.',
    remotionCompatible: true,
    packageNpm: 'gsap',
  },
  roughjs: {
    name: 'Rough.js',
    whatItDoes: 'Her şekli el çizimi gibi gösterir',
    whenToUse: 'Karalama, defter, tahta ve eskiz stili.',
    remotionCompatible: true,
    packageNpm: 'roughjs',
  },
  simplexNoise: {
    name: 'simplex-noise',
    whatItDoes: 'Doğal, akışkan rastgelelik',
    whenToUse: 'Su, duman, rüzgar, organik parçacık hareketleri.',
    remotionCompatible: true,
    packageNpm: 'simplex-noise',
  },
  paperjs: {
    name: 'Paper.js',
    whatItDoes: 'Vektör yolları, bölme, birleştirme',
    whenToUse: 'Şekil dönüşümleri, organik harita kıyı çizgileri.',
    remotionCompatible: true,
    packageNpm: 'paper',
  },
  pixijs: {
    name: 'PixiJS',
    whatItDoes: 'Hızlı 2D, WebGL filtreler, çok sayıda sprite',
    whenToUse: 'Binlerce nesnenin aynı anda aktığı yoğun sahneler.',
    remotionCompatible: true,
    packageNpm: 'pixi.js',
  },
  matterjs: {
    name: 'Matter.js',
    whatItDoes: '2D fizik simülasyonu',
    whenToUse: 'Düşme, çarpışma, zincir, sarkaç ve yerçekimi efektleri.',
    remotionCompatible: true,
    packageNpm: 'matter-js',
  },
  d3: {
    name: 'D3',
    whatItDoes: 'Veri ölçekleri, eksenler, coğrafi projeksiyonlar',
    whenToUse: 'Veri grafikleri, dinamik eksenler, harita anlatımları.',
    remotionCompatible: true,
    packageNpm: 'd3',
  },
  katex: {
    name: 'KaTeX',
    whatItDoes: 'Matematik formül render motoru',
    whenToUse: 'Eğitici, bilimsel ve matematiksel video anlatımları.',
    remotionCompatible: true,
    packageNpm: 'katex',
  },
  opentype: {
    name: 'opentype.js',
    whatItDoes: 'Yazı tipini Bézier çizgi yollarına çevirir',
    whenToUse: 'Harflerin kalemle çizilerek tek tek belirmesi.',
    remotionCompatible: true,
    packageNpm: 'opentype.js',
  },
  zdog: {
    name: 'Zdog',
    whatItDoes: 'Düz, sevimli sahte 3D illüstrasyon',
    whenToUse: '3D hissi isteyen minimalist ve stilize karakterler.',
    remotionCompatible: true,
    packageNpm: 'zdog',
  },
  threejs: {
    name: 'Three.js',
    whatItDoes: 'Gerçek WebGL 3D motoru',
    whenToUse: 'Uzay, mimari, bilimsel simülasyonlar ve derinlikli sahneler.',
    remotionCompatible: true,
    packageNpm: 'three',
  },
  postprocessing: {
    name: 'postprocessing',
    whatItDoes: 'Bloom, alan derinliği (DoF), tonlama',
    whenToUse: '3D sahnelere sinematik parlama ve lens derinliği katmak.',
    remotionCompatible: true,
    packageNpm: 'postprocessing',
  },
  troikaText: {
    name: 'troika-three-text',
    whatItDoes: '3D uzayda SDF yüksek kaliteli net tipografi',
    whenToUse: '3D sahne içinde kristal netliğinde etiket ve başlıklar.',
    remotionCompatible: true,
    packageNpm: 'troika-three-text',
  },
  theatrejs: {
    name: 'Theatre.js',
    whatItDoes: 'Three.js için görsel zaman çizelgesi',
    whenToUse: 'Kamera yollarını ve ışıkları ince ayarlamak.',
    remotionCompatible: true,
    packageNpm: '@theatre/core',
  },
  rapier: {
    name: 'Rapier / cannon-es',
    whatItDoes: '3D katı cisim mekaniği ve fizik',
    whenToUse: 'Yıkılan, düşen, birbirine çarpan 3D nesneler.',
    remotionCompatible: true,
    packageNpm: '@dimforge/rapier3d-compat',
  },
  tonejs: {
    name: 'Tone.js',
    whatItDoes: 'Koddan müzik ve ses sentezi',
    whenToUse: 'Prosedürel ses efektleri ve müzikal zamanlama.',
    remotionCompatible: true,
    packageNpm: 'tone',
  },
  meyda: {
    name: 'Meyda',
    whatItDoes: 'Ses analizi, RMS, spektrum, spektral parlaklık',
    whenToUse: 'Müzikten enerji ve ritim tepe noktaları çıkarmak.',
    remotionCompatible: true,
    packageNpm: 'meyda',
  },
  remotion: {
    name: 'Remotion',
    whatItDoes: 'React bileşenleriyle 60 FPS deterministik video üretimi',
    whenToUse: 'Yeniden kullanılabilir ürün videoları, dinamik UI ve şablonlar.',
    remotionCompatible: true,
    packageNpm: 'remotion',
  },
};

/**
 * Verilen senaryo konusuna göre en uygun kütüphane önerilerini döndürür
 */
export function recommendLibraries(scenario: string): LibraryDescriptor[] {
  const s = scenario.toLowerCase();
  const matched: LibraryDescriptor[] = [];

  if (s.includes('fizik') || s.includes('çarpış') || s.includes('düşme')) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.matterjs, OPUS_LIBRARY_ECOSYSTEM.rapier);
  }
  if (s.includes('formül') || s.includes('matematik') || s.includes('denklem')) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.katex);
  }
  if (s.includes('3d') || s.includes('uzay') || s.includes('gezegen') || s.includes('küp')) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.threejs, OPUS_LIBRARY_ECOSYSTEM.postprocessing);
  }
  if (s.includes('el çizimi') || s.includes('karalama') || s.includes('tahta')) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.roughjs);
  }
  if (s.includes('grafik') || s.includes('harita') || s.includes('veri')) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.d3);
  }

  // Varsayılan çekirdek kütüphaneler
  if (matched.length === 0) {
    matched.push(OPUS_LIBRARY_ECOSYSTEM.remotion, OPUS_LIBRARY_ECOSYSTEM.gsap);
  }

  return matched;
}
