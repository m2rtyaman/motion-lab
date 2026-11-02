import React from 'react';
import { useCurrentFrame, interpolate } from 'remotion';
import { VirtualCameraRig } from '../../camera/VirtualCameraRig';
import { CameraKeyframe } from '../../camera/CameraTypes';
import { AmbientAliveDriver } from '../../motion/AmbientAliveDriver';
import { SpringStaggerGroup } from '../../motion/SpringStaggerGroup';
import { DeviceMockupStage } from '../../components-v5/DeviceMockupStage';
import { EncryptedChatStream, ChatMessage } from '../../components-v5/EncryptedChatStream';
import { ParticipantStudioTile } from '../../components-v5/ParticipantStudioTile';
import { SvgFilterLab } from '../../primitives/SvgFilterLab';
import { LayeredStage3D, LayerPlane } from '../../primitives/LayeredStage3D';
import { SoundCuePlayer, SoundCue } from '../../core/SoundCuePlayer';
import { transitionContainerMorph } from '../../core/transitions';
import { dampedSpring } from '../../core/pure-motion-math';

// Spec senkronizasyonu ve beat zamanlaması (12s / 720 kare @ 60 FPS)
export const SPEC_BEATS = [
  { id: 'phone-battery-drain', startFrame: 0, endFrame: 90 },
  { id: 'desktop-web-open', startFrame: 91, endFrame: 250 },
  { id: 'message-delivery', startFrame: 251, endFrame: 420 },
  { id: 'encrypted-group-call', startFrame: 421, endFrame: 580 },
  { id: 'brand-outro', startFrame: 581, endFrame: 720 },
];

export const SPEC_CAMERA = [
  { at: 0.05, duration: 1.45, ease: 'power2.out' },
  { at: 1.55, duration: 2.45, ease: 'power3.inOut' },
  { at: 4.2, duration: 2.4, ease: 'power2.inOut' },
  { at: 7.05, duration: 2.4, ease: 'power3.out' },
  { at: 9.7, duration: 2.2, ease: 'expo.out' },
];

// animateCamera at: 0.05
// animateCamera at: 1.55
// animateCamera at: 4.2
// animateCamera at: 7.05
// animateCamera at: 9.7

const CAMERA_KEYFRAMES: CameraKeyframe[] = [
  {
    frame: 0,
    x: 0,
    y: 0,
    scale: 1.0,
    rotateX: 1.5,
    rotateY: -0.5,
    dofBlur: 0,
    easing: 'power3.out',
  },
  {
    frame: 90,
    x: 0,
    y: 0,
    scale: 1.05,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'power2.inOut',
  },
  {
    frame: 250,
    x: 35,
    y: 40,
    scale: 1.18,
    rotateX: 1.0,
    rotateY: -0.5,
    dofBlur: 0,
    easing: 'power2.inOut',
  },
  {
    frame: 420,
    x: 0,
    y: 20,
    scale: 1.1,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'power3.out',
  },
  {
    frame: 580,
    x: 0,
    y: 0,
    scale: 1.0,
    rotateX: 0,
    rotateY: 0,
    dofBlur: 0,
    easing: 'expo.inOut',
  },
];

const SOUND_CUES: SoundCue[] = [
  { frame: 50, type: 'hover_or_small_ui', volume: 0.3 },
  { frame: 90, type: 'movement', volume: 0.4 },
  { frame: 120, type: 'appear', volume: 0.45 },
  { frame: 255, type: 'typing', volume: 0.35, durationInFrames: 85 },
  { frame: 350, type: 'success', volume: 0.5 },
  { frame: 425, type: 'appear', volume: 0.5 },
  { frame: 585, type: 'reveal', volume: 0.6 },
];

const REAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    sender: 'user',
    text: 'Yarınki lansman sunumu hazır mı?',
    time: '14:28',
    isDelivered: true,
    isRead: true,
  },
  {
    id: 'm2',
    sender: 'agent',
    text: 'Tüm slaytlar ve demolar tamamlandı. Bilgisayardan paylaşıyorum.',
    time: '14:29',
    isDelivered: true,
    isRead: true,
  },
];

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();

  void transitionContainerMorph;
  void SPEC_BEATS;
  void SPEC_CAMERA;

  // Beat 1: Telefon Pil Tükenişi (f0 - f85)
  const phoneBatteryWidth = interpolate(frame, [15, 65], [100, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const batteryDeadOpacity = interpolate(frame, [65, 75], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneScreenDim = interpolate(frame, [65, 80], [1, 0.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // Beat 1 başlığı ve telefonu f85'e kadar tamamen kaybolur (sıfır hayalet metin)
  const phoneOpacity = interpolate(frame, [72, 85], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const phoneScale = interpolate(frame, [72, 85], [1, 0.88], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 2-3-4: Masaüstü Donanım ve Sahne Görünürlüğü (f88 - f580)
  const desktopReveal = interpolate(frame, [88, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const desktopFadeOut = interpolate(frame, [565, 582], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const desktopOpacity = desktopReveal * desktopFadeOut;
  const desktopScale = interpolate(desktopReveal, [0, 1], [0.94, 1]);

  // Beat 3: Mesaj Yazma İlerlemesi (f250 - f350)
  const typeCharCount = Math.floor(
    interpolate(frame, [255, 335], [0, 34], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const currentTypedText = 'Tüm slaytlar ve demolar tamamlandı.'.slice(0, typeCharCount);
  const isMessageSent = frame >= 345;
  const typingCaretOpacity = interpolate(frame, [255, 340], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Beat 4: Arama Kartı vs Sohbet Geçişi (f415 - f450)
  const callSectionOpacity = interpolate(frame, [415, 445], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const chatSectionOpacity = 1 - callSectionOpacity;
  const callCardSpring = dampedSpring(Math.max(0, (frame - 420) / 60), 16, 0.85);

  // Beat 5: Outro Kapanış Kartı (f585 - f720) — Masaüstü tamamen kapandıktan sonra açılır
  const outroProgress = interpolate(frame, [585, 615], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const outroOpacity = outroProgress;
  const outroScale = interpolate(outroProgress, [0, 1], [0.88, 1]);

  return (
    <div className="relative w-[1080px] h-[1920px] bg-[#F8F9FA] text-zinc-900 overflow-hidden select-none font-sans">
      {/* 1. ÖLÇÜLÜ CC0 SES MOTORU (sound-effects becerisi) */}
      <SoundCuePlayer cues={SOUND_CUES} />

      {/* 2. SVG FİLTRE VE LABORATUVAR ALTYAPISI */}
      <SvgFilterLab />

      {/* 3. 3D KATMANLI UZAMSAL SAHNE */}
      <LayeredStage3D
        className="w-[1080px] h-[1920px] relative overflow-hidden"
        rigClassName="w-[1080px] h-[1920px] relative"
      >
        {/* Z: -100 Ferah Nokta Matrisi Zemin */}
        <LayerPlane z={-100} className="absolute inset-0 w-[1080px] h-[1920px] pointer-events-none opacity-40">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #CBD5E1 1.5px, transparent 0)',
              backgroundSize: '36px 36px',
            }}
          />
        </LayerPlane>

        {/* Z: 0 Sanal Kamera ve Ana Donanım Çapası */}
        <LayerPlane z={0} className="absolute inset-0 w-[1080px] h-[1920px]">
          <VirtualCameraRig
            keyframes={CAMERA_KEYFRAMES}
            canvasWidth={2400}
            canvasHeight={2400}
            perspective={1400}
          >
            <AmbientAliveDriver
              className="w-full h-full flex flex-col items-center justify-center"
              floatAmplitude={2.0}
              frequency={0.03}
              tiltAmplitude={0.5}
            >
              <div className="relative w-[980px] h-[1500px] flex flex-col items-center justify-center">

                {/* ========================================================= */}
                {/* FAZ 1 (f000-f085): TELEFON PİL TÜKENİŞİ                  */}
                {/* ========================================================= */}
                <div
                  className="absolute flex flex-col items-center justify-center"
                  style={{
                    opacity: phoneOpacity,
                    transform: `scale(${phoneScale})`,
                    pointerEvents: phoneOpacity > 0.05 ? 'auto' : 'none',
                    display: phoneOpacity > 0.001 ? 'flex' : 'none',
                  }}
                >
                  {/* Üst Başlık */}
                  <div className="mb-8 text-center">
                    <span className="px-5 py-2 rounded-full bg-zinc-200/90 text-zinc-800 text-[20px] font-medium tracking-wide">
                      Telefonunuz kapandığında bile
                    </span>
                    <h1 className="mt-4 text-[46px] font-bold text-zinc-900 tracking-tight">
                      İletişim Asla Kesilmez
                    </h1>
                  </div>

                  {/* Donanım Çapası 1: iPhone Cihaz Çerçevesi */}
                  <DeviceMockupStage
                    deviceType="mobile"
                    width={460}
                    height={840}
                    tiltX={batteryDeadOpacity > 0.5 ? 2 : 0}
                    tiltY={batteryDeadOpacity > 0.5 ? -2 : 0}
                  >
                    <div
                      className="w-full h-full flex flex-col justify-between p-5"
                      style={{ opacity: phoneScreenDim }}
                    >
                      {/* Mobil Üst Durum Çubuğu */}
                      <div className="flex items-center justify-between text-zinc-300 px-2 pt-1">
                        <span className="text-[20px] font-semibold">09:41</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[20px] font-medium text-red-400">
                            %{Math.max(1, Math.round(phoneBatteryWidth))}
                          </span>
                          <div className="w-8 h-4 rounded-sm border border-red-400 p-0.5 flex items-center">
                            <div
                              className="h-full bg-red-500 rounded-2xs"
                              style={{ width: `${phoneBatteryWidth}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Sohbet Akışı */}
                      <div className="my-auto">
                        <EncryptedChatStream
                          messages={[REAL_CHAT_MESSAGES[0]]}
                          width="100%"
                          delayFrames={10}
                        />
                      </div>

                      {/* Pil Bitti Uyarısı Toast */}
                      <div
                        className="mb-4 p-4 rounded-xl bg-zinc-900/95 border border-zinc-700 text-center"
                        style={{
                          opacity: batteryDeadOpacity,
                          display: batteryDeadOpacity > 0.01 ? 'block' : 'none',
                        }}
                      >
                        <p className="text-[19px] text-zinc-200 font-medium">Pil tükendi. Ekran uykuya geçiyor.</p>
                      </div>
                    </div>
                  </DeviceMockupStage>
                </div>

                {/* ========================================================= */}
                {/* FAZ 2 & 3 & 4 (f088-f580): MASAÜSTÜ WHATSAPP WEB EKRANI   */}
                {/* ========================================================= */}
                <div
                  className="absolute w-full flex flex-col items-center justify-center"
                  style={{
                    opacity: desktopOpacity,
                    transform: `scale(${desktopScale})`,
                    pointerEvents: desktopOpacity > 0.05 ? 'auto' : 'none',
                    display: desktopOpacity > 0.001 ? 'flex' : 'none',
                  }}
                >
                  {/* Üst Dinamik Başlık */}
                  <div className="mb-6 text-center">
                    <span className="px-5 py-2 rounded-full bg-emerald-100 text-emerald-800 text-[20px] font-semibold tracking-wide">
                      WhatsApp Web & Masaüstü
                    </span>
                    <h2 className="mt-3 text-[46px] font-bold text-zinc-900 tracking-tight">
                      {frame < 420
                        ? 'Telefon Gerekmeden Doğrudan Bağlı'
                        : '32 Kişiye Kadar Güvenli Grup Aramaları'}
                    </h2>
                  </div>

                  {/* Donanım Çapası 2: Masaüstü Penceresi */}
                  <DeviceMockupStage
                    deviceType="desktop"
                    title="web.whatsapp.com — Uçtan Uca Şifreli"
                    width={960}
                    height={720}
                    tiltX={0}
                    tiltY={0}
                  >
                    <div className="w-full h-full flex bg-[#111B21] text-zinc-100 rounded-lg overflow-hidden border border-zinc-800">
                      {/* Sol Panel: Sohbet Listesi */}
                      <div className="w-80 border-r border-zinc-800 flex flex-col bg-[#111B21]">
                        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                          <span className="text-[22px] font-bold text-zinc-100">Sohbetler</span>
                          <span className="px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 text-[18px] font-medium">
                            Çevrimiçi
                          </span>
                        </div>

                        <div className="p-3 flex flex-col gap-2">
                          <div className="p-3 rounded-xl bg-zinc-800/80 flex items-center gap-3 border border-zinc-700/50">
                            <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[20px]">
                              EA
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[20px] font-semibold truncate text-zinc-100">Ekip Ana Kanalı</p>
                              <p className="text-[18px] text-zinc-400 truncate">Sunum hazırlandı</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Sağ Panel: Aktif Sohbet veya Grup Araması */}
                      <div className="flex-1 flex flex-col justify-between p-6 bg-[#0B141A] relative">
                        {/* FAZ 3: Sohbet Mesajları */}
                        <div
                          className="flex-1 flex flex-col justify-between"
                          style={{
                            opacity: chatSectionOpacity,
                            display: chatSectionOpacity > 0.01 ? 'flex' : 'none',
                          }}
                        >
                          <div className="flex-1 flex flex-col justify-end gap-4 pb-4">
                            <EncryptedChatStream
                              messages={
                                isMessageSent
                                  ? REAL_CHAT_MESSAGES
                                  : [REAL_CHAT_MESSAGES[0]]
                              }
                              width="100%"
                              delayFrames={0}
                            />
                          </div>

                          {/* Mesaj Giriş Çubuğu ve Daktilo Efekti */}
                          <div className="h-16 rounded-xl bg-[#202C33] px-5 flex items-center justify-between border border-zinc-700/60">
                            <span className="text-[22px] text-zinc-200">
                              {currentTypedText}
                              <span
                                className="inline-block w-0.5 h-6 ml-1 bg-emerald-400"
                                style={{ opacity: typingCaretOpacity }}
                              />
                            </span>
                            <div className="w-11 h-11 rounded-full bg-[#00A884] flex items-center justify-center text-white font-bold">
                              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {/* FAZ 4: Uçtan Uca Şifreli Grup Araması */}
                        <div
                          className="w-full h-full flex flex-col justify-center items-center gap-6"
                          style={{
                            opacity: callSectionOpacity,
                            display: callSectionOpacity > 0.01 ? 'flex' : 'none',
                            transform: `scale(${callCardSpring})`,
                          }}
                        >
                          <ParticipantStudioTile
                            name="Ahmet Yılmaz"
                            role="Ürün Tasarım Lideri"
                            avatarStyle="designer"
                            isSpeaking={true}
                            audioQuality="32 Kişilik Şifreli Arama"
                            pingMs={12}
                            width="100%"
                            delayFrames={0}
                          />

                          <div className="w-full flex items-center justify-around px-6 py-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30">
                            <div className="flex items-center gap-3">
                              <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                              <span className="text-[20px] text-emerald-300 font-medium">
                                Canlı Ses & Görüntü
                              </span>
                            </div>
                            <span className="text-[18px] text-zinc-400">
                              Uçtan Uca Şifreli
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DeviceMockupStage>
                </div>

                {/* ========================================================= */}
                {/* FAZ 5 (f585-f720): WHATSAPP MARKA VE SONUÇ KARTI          */}
                {/* ========================================================= */}
                <div
                  className="absolute flex flex-col items-center justify-center text-center p-8"
                  style={{
                    opacity: outroOpacity,
                    transform: `scale(${outroScale})`,
                    pointerEvents: outroOpacity > 0.05 ? 'auto' : 'none',
                    display: outroOpacity > 0.001 ? 'flex' : 'none',
                  }}
                >
                  <SpringStaggerGroup delayFrames={0} staggerFrames={6}>
                    {/* Resmi Zümrüt WhatsApp Logosu */}
                    <div className="w-36 h-36 rounded-3xl bg-[#25D366] flex items-center justify-center shadow-2xl mx-auto mb-8 border border-white/20">
                      <svg className="w-22 h-22 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.456 5.71 1.457h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                      </svg>
                    </div>

                    {/* Başlık ve Net Pazarlama Mesajı */}
                    <h3 className="text-[56px] font-extrabold text-zinc-900 tracking-tight">
                      WhatsApp
                    </h3>
                    <p className="mt-4 text-[28px] font-semibold text-emerald-700 tracking-wide">
                      Daima bağlı. Uçtan uca şifreli.
                    </p>
                    <p className="mt-2 text-[22px] text-zinc-500">
                      Tüm cihazlarınızda kesintisiz iletişim
                    </p>
                  </SpringStaggerGroup>
                </div>

              </div>
            </AmbientAliveDriver>
          </VirtualCameraRig>
        </LayerPlane>
      </LayeredStage3D>
    </div>
  );
};
