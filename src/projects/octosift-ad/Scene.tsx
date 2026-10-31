import { type FC } from 'react';
import { useCurrentFrame, Sequence, Audio, staticFile } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera, enterSurface, animateWordBurst } from '../../core/choreography';
import { SpotlightStage, CameraRig, KineticText, SpecularCard } from '../../primitives';
import { MetricTelemetryCard } from '../../archetypes/MetricTelemetryCard';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

/**
 * Storyboard Beat Segmentleri (spec.json ile birebir senkronize)
 */
const BEATS = [
  { id: 'radar-hook', startFrame: 0, endFrame: 85 },
  { id: 'lead-intel', startFrame: 86, endFrame: 195 },
  { id: 'pipeline-stream', startFrame: 196, endFrame: 290 },
  { id: 'cta-resolve', startFrame: 291, endFrame: 360 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '9:16' }) => {
  const frame = useCurrentFrame();
  const currentBeat = BEATS.find((b) => frame >= b.startFrame && frame <= b.endFrame) ?? BEATS[BEATS.length - 1];

  // ---------------------------------------------------------------------------
  // 3D KAMERA VE KATMAN KOREOGRAFİSİ (spec.json ile birebir)
  // ---------------------------------------------------------------------------
  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.94, rotateX: 6, y: 30 },
      { at: 0.05, duration: 1.35, scale: 1, rotateX: 0, y: 0, ease: 'expo.inOut' },
      { at: 1.45, duration: 1.1, scale: 1.04, y: -45, rotateX: -2, ease: 'expo.out' },
      { at: 2.8, duration: 1.2, scale: 1.06, y: -35, rotateX: 0, ease: 'expo.out' },
      { at: 4.2, duration: 1.65, scale: 1.02, y: 10, rotateX: 2, ease: 'power2.inOut' },
    ]);

    // Beat 1: Kinetik başlık kelime patlaması
    animateWordBurst(tl, '.radar-word', 0.15);

    // Beat 2: Müşteri istihbarat kartı girişi
    enterSurface(tl, '.intel-surface', 1.45, {
      itemSelector: '.intel-item',
      yFrom: 70,
    });

    // Beat 3: Satış boru hattı kartı girişi
    enterSurface(tl, '.pipeline-surface', 3.28, {
      itemSelector: '.pipeline-item',
      yFrom: 70,
    });

    // Beat 4: Kapanış CTA girişi
    enterSurface(tl, '.cta-surface', 4.86, {
      yFrom: 50,
    });
  }, []);

  return (
    <SpotlightStage aspect={aspect} data-beat={currentBeat.id}>
      {/* KARE KİLİTLİ SFX SES TETİKLEYİCİLERİ */}
      <Sequence from={5} durationInFrames={60}>
        <Audio src={staticFile('sfx/whoosh-pan.wav')} volume={0.45} />
      </Sequence>
      <Sequence from={88} durationInFrames={60}>
        <Audio src={staticFile('sfx/ui-lock.wav')} volume={0.6} />
      </Sequence>
      <Sequence from={198} durationInFrames={60}>
        <Audio src={staticFile('sfx/whoosh-pan.wav')} volume={0.5} />
      </Sequence>
      <Sequence from={204} durationInFrames={60}>
        <Audio src={staticFile('sfx/ui-lock.wav')} volume={0.65} />
      </Sequence>
      <Sequence from={292} durationInFrames={60}>
        <Audio src={staticFile('sfx/ui-lock.wav')} volume={0.7} />
      </Sequence>

      <CameraRig className="camera-rig">
        <div className="flex flex-col items-center justify-center w-full max-w-[940px] mx-auto px-6 min-h-[1400px] relative">
          {/* ===================================================================
              BEAT 1: B2B RADAR KANCASI (0 - 85 Frame)
             =================================================================== */}
          {frame <= 85 && (
            <div className="flex flex-col items-center gap-8 text-center absolute inset-0 justify-center">
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.06] border border-white/[0.12] backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] animate-ping" />
                <span className="text-[19px] font-mono font-bold uppercase tracking-[0.2em] text-zinc-300">
                  OCTOSIFT // B2B RADAR
                </span>
              </div>

              <KineticText
                text="SICAK MÜŞTERİLERİ SANİYEDE YAKALAYIN"
                wordClassName="radar-word"
                variant="hero"
                className="text-center font-black tracking-tighter text-[68px] leading-[1.08] text-white max-w-[880px]"
              />

              <div className="flex items-center gap-6 px-8 py-4 rounded-2xl bg-[#121216] border border-white/[0.1] shadow-2xl">
                <div className="text-left font-mono">
                  <div className="text-[17px] text-zinc-400 uppercase tracking-wider">Taranan Bölge</div>
                  <div className="text-[24px] font-bold text-white">İzmir, Alsancak</div>
                </div>
                <div className="h-10 w-[1px] bg-white/10" />
                <div className="text-left font-mono">
                  <div className="text-[17px] text-zinc-400 uppercase tracking-wider">Bulunan Firma</div>
                  <div className="text-[24px] font-bold text-[#10b981]">30 Sıcak Aday</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              BEAT 2: HEDEF MÜŞTERİ & AI FIRSAT SKORU (86 - 195 Frame)
             =================================================================== */}
          {frame >= 86 && frame <= 195 && (
            <div className="intel-surface w-full flex flex-col gap-6 absolute inset-0 justify-center">
              <div className="text-center mb-2">
                <span className="text-[19px] font-mono uppercase tracking-[0.22em] text-zinc-400">
                  AKILLI MÜŞTERİ İSTİHBARATI
                </span>
              </div>

              <SpecularCard cardClassName="w-full" tone="active" accent="amber">
                <div className="p-8 flex flex-col gap-6">
                  {/* Başlık ve Firma Detayı */}
                  <div className="intel-item flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-[44px] font-black text-white tracking-tight leading-none">
                          Varuna Gezgin
                        </h2>
                        <span className="px-3 py-1 rounded-md bg-white/[0.08] text-[18px] font-mono text-zinc-300 border border-white/10">
                          Kafe & Restoran
                        </span>
                      </div>
                      <p className="text-[20px] font-mono text-zinc-400 mt-2">
                        Alsancak, İzmir • ★ 4.3 (4,204 Google Yorumu)
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[16px] font-mono uppercase text-zinc-400 tracking-wider">FIRSAT SKORU</span>
                      <div className="text-[52px] font-black font-mono text-[#f59e0b] leading-none mt-1">
                        65<span className="text-[24px] text-zinc-400">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* AI Fırsat Önerisi Banner'ı */}
                  <div className="intel-item p-5 rounded-xl bg-[#f59e0b]/10 border border-[#f59e0b]/25 flex items-center gap-4">
                    <span className="text-[32px]">⚡</span>
                    <div className="text-left font-mono">
                      <div className="text-[21px] font-bold text-[#f59e0b]">Web Sitesi ve Reklamı Yok</div>
                      <div className="text-[18px] text-zinc-300">Web tasarım veya reklam yönetimi teklif edilebilir!</div>
                    </div>
                  </div>

                  {/* Rozetler ve Eylemler */}
                  <div className="intel-item flex items-center justify-between pt-2 border-t border-white/10 font-mono text-[18px]">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 font-semibold">
                        #Sıcak Müşteri
                      </span>
                      <span className="px-3 py-1 rounded bg-white/[0.06] text-zinc-300 border border-white/10">
                        #Saha Rotasında
                      </span>
                    </div>
                    <span className="text-[#10b981] font-bold uppercase tracking-wider">
                      ✓ CRM Portföyüne Eklendi
                    </span>
                  </div>
                </div>
              </SpecularCard>
            </div>
          )}

          {/* ===================================================================
              BEAT 3: SATIŞ BORU HATTI & CRM PANELİ (196 - 290 Frame)
             =================================================================== */}
          {frame >= 196 && frame <= 290 && (
            <div className="pipeline-surface w-full flex flex-col gap-6 absolute inset-0 justify-center">
              <div className="text-center mb-2">
                <span className="text-[19px] font-mono uppercase tracking-[0.22em] text-zinc-400">
                  GERÇEK ZAMANLI SATIŞ BORU HATTI
                </span>
              </div>

              <MetricTelemetryCard
                cardClassName="pipeline-item w-full"
                itemClassName="pipeline-sub"
                categoryLabel="BORU HATTI HACMİ"
                title="Toplam Teklif Boru Hattı"
                fromValue={0}
                toValue={120000}
                decimals={0}
                prefix="₺"
                suffix=""
                deltaBadge="+30 Yeni Fırsat"
                tone="emerald"
                startAtSec={3.3}
                footerMeta="OCTOSIFT PIPELINE ENGINE // GELİR KİLİTLİ"
              />

              <div className="pipeline-item grid grid-cols-3 gap-4 font-mono text-center">
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="text-[17px] text-zinc-400">Yeni Adaylar</div>
                  <div className="text-[28px] font-bold text-white mt-1">2 Firma</div>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                  <div className="text-[17px] text-zinc-400">Görüşüldü</div>
                  <div className="text-[28px] font-bold text-[#f59e0b] mt-1">1 Firma</div>
                </div>
                <div className="p-4 rounded-xl bg-[#10b981]/10 border border-[#10b981]/25">
                  <div className="text-[17px] text-[#10b981]">Satış Yapıldı</div>
                  <div className="text-[28px] font-bold text-[#10b981] mt-1">1 Satış</div>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              BEAT 4: MARKA VE WEB CTA KAPANIŞI (291 - 360 Frame)
             =================================================================== */}
          {frame >= 291 && (
            <div className="cta-surface w-full flex flex-col items-center text-center gap-8 absolute inset-0 justify-center">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-[#10b981] to-[#047857] flex items-center justify-center shadow-2xl border border-white/20">
                <span className="text-[52px] font-black text-white">O</span>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-[84px] font-black text-white tracking-tighter leading-none">
                  OCTOSIFT
                </h1>
                <p className="text-[26px] font-mono text-zinc-300 tracking-wide">
                  B2B Müşteri Bulma & Satış Takip CRM
                </p>
              </div>

              <div className="mt-4 px-10 py-5 rounded-2xl bg-white text-black font-black text-[30px] font-mono tracking-tight shadow-2xl hover:scale-105 transition-all">
                octosift.com
              </div>

              <div className="flex items-center gap-6 text-[18px] font-mono text-zinc-400 mt-2">
                <span>• Canlı Web Taraması</span>
                <span>• Otomatik Fırsat Skoru</span>
                <span>• Satış Boru Hattı</span>
              </div>
            </div>
          )}
        </div>
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
