import { useRef, type FC } from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import {
  SpatialCamera,
  VirtualCanvas,
  useRemotionGSAP,
  DARK_LINEAR_THEME,
  applyIsometricTilt,
  applyFocusZoom,
  applyCameraSettle,
  DURATIONS,
} from '../../engine';
import {
  MetricCardRow,
  ChartCanvas,
  KineticHeadline,
} from '../../primitives';
import projectData from './data.json';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

/**
 * Storyboard Beat Tanımları (spec.json ile tam uyumlu)
 */
export const BEATS = [
  { id: 'liquidity-pulse', startFrame: 0, endFrame: 59 },
  { id: 'volume-surge', startFrame: 60, endFrame: 154 },
  { id: 'settle-resolve', startFrame: 155, endFrame: 240 },
];

export const Scene: FC<SceneProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();

  useRemotionGSAP(
    (tl) => {
      // 1. UZAMSAL KAMERA KOREOGRAFİSİ (spec.json ile tam uyumlu)
      // Kamera 1: 3D İzometrik Derinlik Açısı
      // at: 0.05
      applyIsometricTilt(tl, '.spatial-camera', 0.05, {
        rotateX: 10,
        rotateY: -14,
        scale: 1.05,
      });

      // Kamera 2: Hacim Grafiğine Yakınlaşma
      // at: 0.95
      applyFocusZoom(tl, '.spatial-camera', 0.95, {
        targetX: 0,
        targetY: 80,
        scale: 1.35,
        rotateX: 4,
        rotateY: -2,
      });

      // Kamera 3: Makro Geri Açılma
      // at: 2.3
      tl.to(
        '.spatial-camera',
        {
          x: 0,
          y: 20,
          scale: 1.1,
          rotateX: 2,
          rotateY: -4,
          rotateZ: 0,
          duration: DURATIONS.camera,
          ease: 'expo.out',
        },
        2.3
      );

      // Kamera 4: Kapanışta Düzleme Yerleşme
      // at: 3.2
      applyCameraSettle(tl, '.spatial-camera', 3.2, {
        scale: 1.0,
      });

      // 2. METRİK KARTLARI VE GRAFİK GİRİŞ TWEENLERİ
      tl.from(
        '.fintech-metric-row',
        {
          opacity: 0,
          y: 40,
          scale: 0.94,
          duration: DURATIONS.scene,
          ease: 'expo.out',
        },
        0.15
      );

      tl.from(
        '.fintech-chart-canvas',
        {
          opacity: 0,
          y: 60,
          scale: 0.92,
          duration: DURATIONS.camera,
          ease: 'expo.out',
        },
        0.6
      );

      return tl;
    },
    []
  );

  // Grafik ilerleme yüzdesi (deterministik frame interpolasyonu)
  const chartProgress = interpolate(frame, [45, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat bazlı editoryal başlık seçimi
  const headline =
    frame < 60
      ? {
          tag: 'INSTITUTIONAL DEFI',
          title: 'Global Liquidity Matrix',
          subtitle: 'Sub-millisecond smart order routing across global pools',
        }
      : frame < 155
      ? {
          tag: 'ALGORITHMIC ENGINE',
          title: 'Zero-Slippage Depth',
          subtitle: '$428.6M daily volume executed with 99.94% fill rate',
        }
      : {
          tag: 'ENTERPRISE SETTLEMENT',
          title: 'Institutional Certainty',
          subtitle: 'AAA audited vaults with automated real-time settlement',
        };

  return (
    <AbsoluteFill
      ref={containerRef}
      className="fintech-scene relative overflow-hidden select-none"
      style={{
        backgroundColor: DARK_LINEAR_THEME.colors.bgPrimary,
      }}
    >
      {/* 1. ÜST EDİTORYAL BAŞLIK (9:16 Güvenli Bölge: top 120px) */}
      <KineticHeadline
        theme={DARK_LINEAR_THEME}
        tag={headline.tag}
        title={headline.title}
        subtitle={headline.subtitle}
      />

      {/* 2. 3D UZAMSAL KAMERA & 1440x900 SANAL TUVAL AYRIŞTIRMA */}
      <SpatialCamera
        theme={DARK_LINEAR_THEME}
        enableAmbientDrift={true}
        className="w-full h-full flex items-center justify-center pt-20"
      >
        <VirtualCanvas width={1280} height={840} className="flex flex-col gap-6 items-center justify-center">
          {/* A. KPI METRİK KARTLARI */}
          <div className="fintech-metric-row w-full max-w-[1100px]">
            <MetricCardRow
              theme={DARK_LINEAR_THEME}
              cards={projectData.kpiCards}
            />
          </div>

          {/* B. ANALİTİK SVG GRAFİK TUVALİ */}
          <div className="fintech-chart-canvas w-full max-w-[1100px]">
            <ChartCanvas
              theme={DARK_LINEAR_THEME}
              title="24S Likidite Hacim Dağılımı"
              badge="Canlı Derinlik"
              value="$428,640,000"
              change="+38.4% vs 7D"
              isPositiveChange={true}
              data={projectData.chartData}
              type="area"
              progress={chartProgress}
              height={260}
              accentColor="#10b981"
            />
          </div>
        </VirtualCanvas>
      </SpatialCamera>
    </AbsoluteFill>
  );
};
