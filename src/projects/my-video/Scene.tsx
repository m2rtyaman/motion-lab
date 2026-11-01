import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { DURATIONS, EASING, TIMING } from '../../core/tokens';
import { SpotlightStage, CameraRig, InstancedPinGrid3D } from '../../primitives';
import {
  Cpu,
  Globe2,
  Zap,
  Activity,
  Server,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'awakening', startFrame: 0, endFrame: 119 },
  { id: 'telemetry-morph', startFrame: 120, endFrame: 299 },
  { id: 'global-topology', startFrame: 300, endFrame: 459 },
  { id: 'executive-lock', startFrame: 460, endFrame: 600 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    // 3D Kamera Koreografisi (spec.json ile tam senkronize)
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.98, rotateX: 2 },
      { at: 0.05, duration: 1.2, scale: 1.0, rotateX: 0, ease: 'power3.out' },
      { at: 1.45, duration: 0.65, scale: 1.03, y: -15, ease: 'expo.inOut' },
      { at: 2.45, duration: 1.1, scale: 1.02, rotateZ: -0.5, ease: 'power2.out' },
      { at: 4.1, duration: 0.95, scale: 1.05, y: -10, ease: 'expo.inOut' },
      { at: 5.5, duration: 1.2, scale: 1.06, rotateX: 4, rotateY: -3, ease: 'expo.inOut' },
      { at: 7.2, duration: 0.95, scale: 1.02, rotateX: 0, rotateY: 0, ease: 'power3.out' },
      { at: 8.65, duration: 1.3, scale: 1.0, y: 0, ease: 'power2.out' },
    ]);

    // Beat 1: Kanca Başlığı & Rozet Girişi
    tl.fromTo(
      '.hero-badge',
      { opacity: 0, y: -20, scale: 0.92 },
      { opacity: 1, y: 0, scale: 1, duration: DURATIONS.camera, ease: EASING.powerOut },
      0.1
    );

    tl.fromTo(
      '.headline-line-1',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      0.3
    );

    tl.fromTo(
      '.headline-line-2',
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      0.45
    );

    // Beat 2: Tek Kap İlkesi (Rozetin Telemetri Kartına Dönüşümü)
    tl.to(
      '.hero-intro-group',
      { opacity: 0, y: -30, scale: 0.96, duration: DURATIONS.panel, ease: 'power2.out' },
      1.95
    );

    tl.fromTo(
      '.telemetry-card',
      { opacity: 0, scale: 0.94, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      2.1
    );

    tl.fromTo(
      '.sparkline-path',
      { strokeDashoffset: 600 },
      { strokeDashoffset: 0, duration: DURATIONS.scene, ease: 'power2.out' },
      2.3
    );

    // Beat 3: Topoloji Düğümlerinin Açılması
    tl.to(
      '.telemetry-main-view',
      { opacity: 0, scale: 0.95, duration: DURATIONS.panel, ease: 'power2.out' },
      4.9
    );

    tl.fromTo(
      '.topology-view',
      { opacity: 0, scale: 0.96, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      5.05
    );

    tl.fromTo(
      '.node-card',
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, stagger: TIMING.itemStagger, duration: DURATIONS.scene, ease: 'power2.out' },
      5.2
    );

    // Beat 4: Monolitik Kapanış & CTA
    tl.to(
      '.topology-view',
      { opacity: 0, scale: 0.94, y: -20, duration: DURATIONS.panel, ease: 'power2.out' },
      7.5
    );

    tl.fromTo(
      '.outro-monolith',
      { opacity: 0, scale: 0.92, y: 40 },
      { opacity: 1, scale: 1, y: 0, duration: DURATIONS.camera, ease: EASING.powerOut },
      7.7
    );

    tl.fromTo(
      '.cta-button',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: DURATIONS.scene, ease: EASING.backOut },
      8.3
    );
  }, []);

  const isBeat1 = frame >= BEATS[0].startFrame && frame <= BEATS[0].endFrame;
  const isBeat2 = frame >= BEATS[1].startFrame && frame <= BEATS[1].endFrame;
  const isBeat3 = frame >= BEATS[2].startFrame && frame <= BEATS[2].endFrame;
  const isBeat4 = frame >= BEATS[3].startFrame && frame <= BEATS[3].endFrame;

  // Sayısal sayaç hesabı (Frame tabanlı deterministik)
  const counterVal = Math.min(
    8420,
    Math.round(frame > 120 ? ((frame - 120) / 140) * 8420 : 0)
  );

  return (
    <SpotlightStage
      aspect={aspect}
      hudTagLeft="NEURA / CORE-09"
      hudTagRight="AUTONOMOUS CLUSTER"
      hudFooterLeft="SYS: OPTIMAL // 60 FPS"
      hudFooterRight="LATENCY: 1.2ms"
      hudStatusColor="emerald"
      showCrosshairs={true}
    >
      {/* ARKA PLAN: 3D HİBRİT PİN MATRİSİ */}
      <InstancedPinGrid3D
        rows={16}
        cols={28}
        spacing={0.55}
        amplitude={0.25}
        frequency={0.7}
        pinColor="#0d0f14"
        pinSpecular="#10b981"
        className="w-full h-full absolute inset-0 opacity-25 pointer-events-none"
      />

      <CameraRig className="camera-rig w-full h-full flex flex-col justify-between p-16 select-none relative z-10">
        {/* ÜST DÜZEY KURUMSAL HUD HEADER */}
        <header className="flex items-center justify-between w-full border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-[22px] font-bold tracking-wider text-white">
                NEURA // CLOUD
              </span>
              <span className="text-[18px] text-zinc-400 tracking-widest uppercase font-mono">
                Autonomous Intelligence Core
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[18px] font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>GLOBAL STATUS: NOMINAL</span>
            </div>
            <span className="text-[18px] text-zinc-400 font-mono">P99: 1.2ms</span>
          </div>
        </header>

        {/* ORTA ANA SAHNE (BEAT'LERE GÖRE GEÇİŞLER) */}
        <main className="flex-1 flex items-center justify-center relative w-full my-auto">
          {/* BEAT 1: KANCA GİRİŞİ */}
          {isBeat1 && (
            <div className="hero-intro-group flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="hero-badge flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-zinc-300 text-[18px] font-medium mb-8 backdrop-blur-md">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <span>Zero-Latency Neural Compute Matrix</span>
              </div>
              <h1 className="text-[64px] font-extrabold tracking-tight text-white leading-tight">
                <span className="headline-line-1 block">THE AUTONOMOUS</span>
                <span className="headline-line-2 block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">
                  COMPUTE FABRIC
                </span>
              </h1>
              <p className="mt-6 text-[24px] text-zinc-300 max-w-2xl leading-relaxed">
                Dağıtık GPU kümelerini tek bir monolitik akıl gibi çalıştıran yeni nesil telemetri altyapısı.
              </p>
            </div>
          )}

          {/* BEAT 2: TEK KAP TELEMETRİ KARTI */}
          {isBeat2 && (
            <div className="telemetry-card telemetry-main-view w-full max-w-5xl rounded-3xl bg-zinc-950/80 border border-white/[0.12] p-10 shadow-2xl backdrop-blur-2xl flex flex-col gap-8">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-6">
                <div>
                  <span className="text-[18px] text-zinc-400 uppercase tracking-widest font-mono">
                    Gerçek Zamanlı Çekirdek Telemetrisi
                  </span>
                  <h2 className="text-[30px] font-bold text-white mt-1">
                    Aktif Hesaplama Gücü
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[48px] font-extrabold font-mono text-emerald-400">
                    {counterVal.toLocaleString()}
                  </span>
                  <span className="text-[20px] text-zinc-400 font-mono">TFLOPS</span>
                </div>
              </div>

              {/* Canlı Sparkline Grafiği */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 p-6 rounded-2xl bg-black/40 border border-white/[0.06] flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[18px] text-zinc-400 font-medium">
                      Gecikme Düşüş Eğrisi (Latency Floor)
                    </span>
                    <span className="text-[18px] text-emerald-400 font-mono font-bold">
                      240ms → 1.2ms
                    </span>
                  </div>
                  <svg
                    viewBox="0 0 600 120"
                    className="w-full h-28 overflow-visible"
                    fill="none"
                  >
                    <path
                      className="sparkline-path"
                      d="M 0 100 Q 150 90, 250 40 T 450 15 T 600 8"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeDasharray="600"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[18px] text-zinc-400">Global Uptime</span>
                    <p className="text-[28px] font-mono font-bold text-white mt-1">
                      99.999%
                    </p>
                  </div>
                  <div className="p-5 rounded-2xl bg-black/40 border border-white/[0.06]">
                    <span className="text-[18px] text-zinc-400">Uç Düğüm Sayısı</span>
                    <p className="text-[28px] font-mono font-bold text-amber-400 mt-1">
                      128 PoP Aktif
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* BEAT 3: 3D KÜRESEL TOPOLOJİ VE DÜĞÜMLER */}
          {isBeat3 && (
            <div className="topology-view w-full max-w-5xl flex flex-col gap-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <span className="text-[18px] text-emerald-400 uppercase tracking-widest font-mono font-semibold">
                    Global Edge Topology
                  </span>
                  <h3 className="text-[34px] font-extrabold text-white">
                    4 Kıta, Sıfır Darboğaz
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-zinc-300 text-[18px]">
                  <Globe2 className="w-6 h-6 text-emerald-400" />
                  <span>Dinamik Ağ Yönlendirmesi</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-5">
                {[
                  { city: 'Tokyo', code: 'HND-1', ping: '0.6ms', load: '32%' },
                  { city: 'Frankfurt', code: 'FRA-2', ping: '1.1ms', load: '48%' },
                  { city: 'San Francisco', code: 'SFO-4', ping: '0.9ms', load: '41%' },
                  { city: 'İstanbul', code: 'IST-1', ping: '1.4ms', load: '27%' },
                ].map((node, i) => (
                  <div
                    key={i}
                    className="node-card p-6 rounded-2xl bg-zinc-950/80 border border-white/[0.1] backdrop-blur-xl flex flex-col justify-between h-48 shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[18px] text-zinc-400 font-mono font-bold">
                        {node.code}
                      </span>
                      <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[24px] font-bold text-white">{node.city}</p>
                      <p className="text-[18px] text-zinc-400 mt-1">Yük: {node.load}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-emerald-400 font-mono text-[18px] font-semibold">
                      <span>RTT</span>
                      <span>{node.ping}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BEAT 4: MONOLİTİK KAPANIŞ & CTA */}
          {isBeat4 && (
            <div className="outro-monolith flex flex-col items-center text-center max-w-4xl mx-auto p-12 rounded-3xl bg-zinc-950/90 border border-white/[0.12] shadow-2xl backdrop-blur-2xl">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-[28px] mb-6">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[52px] font-black text-white tracking-tight leading-tight">
                SCALE AT THE SPEED OF THOUGHT.
              </h2>
              <p className="mt-4 text-[24px] text-zinc-300 max-w-xl">
                Otonom yapay zeka işlem mimarinizi bugün 10 saniyede canlıya alın.
              </p>
              <div className="cta-button mt-8 flex items-center gap-3 px-8 py-4 rounded-xl bg-emerald-500 text-zinc-950 font-bold text-[22px] shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all cursor-pointer">
                <span>Deploy Instantly → neura.cloud</span>
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>
          )}
        </main>

        {/* ALT BİLGİ DİREKTÖR ÇUBUĞU */}
        <footer className="flex items-center justify-between w-full border-t border-white/[0.08] pt-6 text-[18px] text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <Server className="w-5 h-5 text-emerald-400" />
            <span>NEURA DETERMINISTIC MOTION LAB // 60 FPS ENGINE</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span>CLUSTER: ONLINE</span>
            </span>
            <span className="text-zinc-500">FRAME: {frame} / 600</span>
          </div>
        </footer>
      </CameraRig>
    </SpotlightStage>
  );
};
