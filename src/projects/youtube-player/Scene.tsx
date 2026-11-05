import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING, SPRING, TIMING } from '../../core/tokens';
import { createSpringEase } from '../../core/spring-solver';
import {
  transitionCameraDive,
  transitionContainerMorph,
  transitionElementTakeover,
} from '../../core/transitions';
import { animateCamera } from '../../core/choreography';
import {
  CameraRig,
  TheHeroActor,
  KineticBurstWord,
  VerifiedCursor,
} from '../../primitives';
import { YouTubeBrandIcon } from '../../assets/vectors';

export interface SceneProps {
  aspect?: '16:9' | '9:16';
}

export const BEATS = [
  { id: 'search-discovery', startFrame: 0, endFrame: 110 },
  { id: 'watch-experience', startFrame: 111, endFrame: 270 },
  { id: 'theatre-explosion', startFrame: 271, endFrame: 420 },
  { id: 'monumental-lockup', startFrame: 421, endFrame: 600 },
] as const;

export const Scene: FC<SceneProps> = () => {
  const frame = useCurrentFrame();

  // Subtle natural breathing pulse for organic motion
  const ambientBreathe = Math.sin(frame * 0.04) * 0.002;
  const redGlow = 0.35 + Math.sin(frame * 0.07) * 0.08;

  // Keystroke typewriter text progression for Beat 1
  const searchQuery = 'The Art of Motion 4K';
  const typeIndex = Math.min(
    searchQuery.length,
    Math.max(0, Math.floor((frame - 15) / 3))
  );
  const currentQuery = searchQuery.slice(0, typeIndex);

  useRemotionGSAP((tl) => {
    const snappyEase = createSpringEase(SPRING.snappy);
    const smoothEase = createSpringEase(SPRING.smooth);

    // Initial cursor hiding to eliminate any stray (0,0) artifacts
    tl.set('#search-cursor', { opacity: 0, x: 1450, y: 180, rotateZ: 8 });
    tl.set('#watch-cursor', { opacity: 0, x: 1380, y: 800, rotateZ: 4 });

    // -------------------------------------------------------------------------
    // 0. Kamera Koreografisi
    // -------------------------------------------------------------------------
    tl.set('.camera-rig', {
      scale: 1.04,
      x: 0,
      y: 0,
    });

    animateCamera(tl, '.camera-rig', [
      { at: 0.05, duration: 1.1, scale: 1.0, x: 0, y: 0, ease: 'expo.out' },
      { at: 1.8, duration: 0.8, scale: 1.0, x: 0, y: 0, ease: 'expo.inOut' },
      { at: 4.5, duration: 0.85, scale: 1.02, x: 0, y: 0, ease: 'expo.inOut' },
      { at: 7.0, duration: 0.75, scale: 1.0, x: 0, y: 0, ease: 'expo.out' },
    ]);

    // -------------------------------------------------------------------------
    // BEAT 1 (f0 - f110): OTANTİK BEYAZ YOUTUBE HEADER & ARAMA YAZIMI
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.youtube-top-header',
      { y: -30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: snappyEase },
      0.0
    );

    tl.fromTo(
      '#search-input-box',
      { scale: 0.96, opacity: 0 },
      { scale: 1.0, opacity: 1, duration: 0.45, ease: snappyEase },
      0.1
    );

    // Arama imlecinin kavisli insansı yaklaşımı (Curved Path Approach to Search)
    tl.to(
      '#search-cursor',
      {
        x: 1350,
        y: 80,
        opacity: 1,
        rotateZ: 4,
        duration: DURATIONS.focus,
        ease: EASING.powerOut,
      },
      0.5
    ).to(
      '#search-cursor',
      {
        x: 1250,
        y: 38,
        rotateZ: -2,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      },
      1.0
    );

    // Arama butonuna tıklama impulsu (at: 1.65s)
    tl.to(
      '#search-btn',
      {
        scale: 0.92,
        duration: DURATIONS.instant,
        ease: EASING.quickIn,
      },
      1.65
    ).to(
      '#search-btn',
      {
        scale: 1.05,
        duration: DURATIONS.instant,
        ease: EASING.backOut,
      },
      1.75
    );

    // İmleç çıkışı
    tl.to(
      '#search-cursor',
      { opacity: 0, scale: 0.8, duration: DURATIONS.micro, ease: EASING.quickIn },
      1.75
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 1 -> 2 (at: 1.75s / f105): ELEMENT TAKEOVER
    // Arama çubuğu tıklanınca izleme sayfası dinamik olarak devralınır
    // -------------------------------------------------------------------------
    transitionElementTakeover(
      tl,
      '#search-btn',
      '.stage-1-search-preview',
      '.stage-2-watch',
      {
        at: 1.75,
        duration: DURATIONS.camera,
        takeoverScale: 1.4,
      }
    );

    // -------------------------------------------------------------------------
    // BEAT 2 (f111 - f270): OTANTİK YOUTUBE İZLEME SAYFASI & FEED
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.watch-page-content',
      { opacity: 0, scale: 0.97, y: 20 },
      {
        opacity: 1,
        scale: 1.0,
        y: 0,
        duration: DURATIONS.camera,
        ease: smoothEase,
      },
      1.85
    );

    // İzleme sayfası imlecinin kavisli yumuşak girişi (at 2.4s)
    tl.fromTo(
      '#watch-cursor',
      { x: 1380, y: 780, opacity: 0, rotateZ: 8 },
      {
        x: 1270,
        y: 675,
        opacity: 1,
        rotateZ: -3,
        duration: DURATIONS.focus,
        ease: EASING.powerOut,
      },
      2.4
    );

    // İmlecin Theatre Mode butonuna tıklama hazırlığı
    tl.to(
      '#theatre-button',
      {
        scale: 0.88,
        duration: DURATIONS.instant,
        ease: EASING.quickIn,
      },
      4.35
    ).to(
      '#theatre-button',
      {
        scale: 1.15,
        duration: DURATIONS.instant,
        ease: EASING.backOut,
      },
      4.42
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 2 -> 3 (at: 4.42s / f265): CAMERA DIVE -> THEATRE MODE EXPANSION
    // Video oynatıcı tüm ekranı doldurarak devasa bir ölçek sıçraması yapar!
    // -------------------------------------------------------------------------
    transitionCameraDive(
      tl,
      '.camera-rig',
      '.stage-2-watch',
      '.stage-3-cinema',
      {
        at: 4.42,
        duration: DURATIONS.long,
        diveScale: 1.35,
        targetX: 0,
        targetY: 0,
      }
    );

    // Header ve imleç çıkışı
    tl.to(
      '.youtube-top-header',
      { y: -80, opacity: 0, duration: DURATIONS.camera, ease: EASING.quickIn },
      4.42
    );
    tl.to(
      '#watch-cursor',
      { opacity: 0, scale: 0.8, duration: DURATIONS.micro, ease: EASING.quickIn },
      4.42
    );

    // -------------------------------------------------------------------------
    // BEAT 3 (f271 - f420): TAM EKRAN SİNEMA MODU & KİNETİK TİPOGRAFİ
    // -------------------------------------------------------------------------
    tl.fromTo(
      '#cinema-fullscreen-player',
      { opacity: 0, scale: 0.94 },
      {
        opacity: 1,
        scale: 1.0,
        duration: DURATIONS.camera,
        ease: smoothEase,
      },
      4.5
    );

    // Kırmızı scrubber barın canlı ileri akışı
    tl.fromTo(
      '#cinema-scrubber-fill',
      { width: '0%' },
      {
        width: '76%',
        duration: 2.2,
        ease: 'power2.out',
      },
      4.6
    );

    // Kinetik tipografi patlaması ("EXPERIENCE BOLD MOTION")
    tl.fromTo(
      '.kinetic-headline-punch',
      { opacity: 0, scale: 0.88, y: 24 },
      {
        opacity: 1,
        scale: 1.0,
        y: 0,
        duration: DURATIONS.panel,
        ease: snappyEase,
      },
      4.7
    );

    // Sinema sahnesinde canlı süzülme
    tl.to(
      '#cinema-fullscreen-player',
      {
        scale: 1.015,
        y: -3,
        duration: 2.1,
        ease: 'sine.inOut',
      },
      4.9
    );

    // -------------------------------------------------------------------------
    // GEÇİŞ 3 -> 4 (at: 6.92s / f415): CONTAINER MORPH -> ANITSAL LOGO KİLİDİ
    // -------------------------------------------------------------------------
    transitionContainerMorph(
      tl,
      '#the-hero-actor',
      '.stage-3-cinema',
      '.stage-4-monumental',
      {
        at: 6.92,
        duration: DURATIONS.camera,
        containerScaleTo: 1.0,
      }
    );

    // -------------------------------------------------------------------------
    // BEAT 4 (f421 - f600): RESMİ YOUTUBE LOGO KİLİDİ & 1.8s STILLNESS HOLD
    // -------------------------------------------------------------------------
    tl.fromTo(
      '.brand-lockup-item',
      { opacity: 0, y: 20, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1.0,
        stagger: TIMING.itemStagger,
        duration: DURATIONS.panel,
        ease: snappyEase,
      },
      7.05
    );
  });

  return (
    <div
      className="canvas-backdrop relative w-full h-full bg-[#FAFAFA] overflow-hidden flex items-center justify-center font-sans antialiased select-none"
      style={{
        transform: `scale(${1 + ambientBreathe})`,
      }}
    >
      {/* KATMAN 1: Hafif Kırmızı Ambient Bloom */}
      <div
        className="absolute pointer-events-none w-[1200px] h-[800px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          background:
            'radial-gradient(circle, rgba(255,0,0,0.10) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(100px)',
          opacity: redGlow,
        }}
      />

      {/* =======================================================================
          OTANTİK TAM GENİŞLİKTE YOUTUBE HEADER (NAVBAR)
      ======================================================================= */}
      <header className="youtube-top-header absolute top-0 left-0 right-0 z-30 h-[76px] bg-white border-b border-gray-200/90 px-8 flex items-center justify-between shadow-xs">
        {/* Sol Kısım: Menü + YouTube Logo + Logotype */}
        <div className="flex items-center gap-5">
          <div className="p-2 rounded-full hover:bg-gray-100 cursor-pointer text-[#0F0F0F]">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
            </svg>
          </div>

          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-9 h-6 rounded-[8px] bg-[#FF0000] flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="font-sans font-black text-[22px] tracking-[-0.04em] text-[#0F0F0F]">
              YouTube
            </span>
          </div>
        </div>

        {/* Orta Kısım: Otantik Oval Arama Çubuğu + Mikrofon */}
        <div className="flex items-center gap-3">
          <div
            id="search-input-box"
            className="relative flex items-center w-[640px] h-[46px] bg-white rounded-full border border-gray-300 shadow-inner px-5 justify-between overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 overflow-hidden">
              <svg
                className="w-4 h-4 text-gray-400 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
              <span className="font-sans text-[18px] font-medium text-[#0F0F0F] truncate">
                {currentQuery}
                <span
                  className="inline-block w-0.5 h-4.5 bg-[#FF0000] ml-0.5 align-middle"
                  style={{ opacity: Math.sin(frame * 0.2) > 0 ? 1 : 0 }}
                />
              </span>
            </div>

            {/* Arama Büyüteç Butonu */}
            <div
              id="search-btn"
              className="w-14 h-full -mr-5 bg-gray-50 border-l border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
              </svg>
            </div>
          </div>

          {/* Mikrofon Butonu */}
          <div className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 cursor-pointer">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
            </svg>
          </div>
        </div>

        {/* Sağ Kısım: İkonlar & Profil Avatarı */}
        <div className="flex items-center gap-4 text-gray-700">
          <div className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </div>
          <div className="relative w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF0000]" />
          </div>
          <div className="w-10 h-10 rounded-full bg-[#0F0F0F] text-white flex items-center justify-center font-bold text-[18px]">
            ML
          </div>
        </div>
      </header>

      {/* Kamera Rig Sahne Kabuğu */}
      <CameraRig className="camera-rig relative z-10 w-full h-full flex items-center justify-center">
        {/* =====================================================================
            ANA AKTÖR KÖPRÜSÜ (#the-hero-actor): Kesintisiz Kinetik Taşıyıcı
        ===================================================================== */}
        <TheHeroActor
          id="the-hero-actor"
          className="relative z-20 flex items-center justify-center w-full h-full"
        >
          {/* ===================================================================
              BEAT 1 (f0 - f110): OTANTİK YOUTUBE ANASAYFA / KEŞİF FEED'İ
          =================================================================== */}
          <div className="stage-1-search-preview absolute inset-0 pt-[96px] px-14 pb-8 flex flex-col gap-6 overflow-hidden pointer-events-none">
            {/* Kategori Hapları */}
            <div className="flex items-center gap-3">
              {['All', 'Motion Design', 'Creative Code', 'Typography', '3D Cinema', 'Audio Reactive'].map((chip, idx) => (
                <div
                  key={chip}
                  className={`px-4 py-2 rounded-xl text-[18px] font-semibold ${
                    idx === 0
                      ? 'bg-[#0F0F0F] text-white shadow-xs'
                      : 'bg-gray-100 text-[#0F0F0F]'
                  }`}
                >
                  {chip}
                </div>
              ))}
            </div>

            {/* Video Kartları Grid */}
            <div className="grid grid-cols-4 gap-6 w-full pt-2">
              {[
                { title: 'Global Motion Showcase 2026', views: '2.8M views · 1 day ago', dur: '16:40', grad: 'from-red-950 via-zinc-900 to-black' },
                { title: 'Kinetic Typography Masterclass', views: '1.8M views · 2 days ago', dur: '14:20', grad: 'from-amber-950 via-zinc-900 to-black' },
                { title: 'Fluid Particle Sim in WebGL', views: '940K views · 1 week ago', dur: '09:45', grad: 'from-blue-950 via-zinc-900 to-black' },
                { title: 'Parametric Motion Physics', views: '620K views · 3 weeks ago', dur: '18:10', grad: 'from-emerald-950 via-zinc-900 to-black' },
              ].map((card) => (
                <div key={card.title} className="flex flex-col gap-3">
                  <div className={`relative w-full h-[220px] rounded-2xl bg-gradient-to-br ${card.grad} overflow-hidden shadow-md flex items-center justify-center`}>
                    <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center text-white">
                      <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[18px]">
                      {card.dur}
                    </div>
                  </div>
                  <div className="flex gap-3 items-start pt-1">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-[18px] shrink-0">
                      {card.title[0]}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="font-sans font-bold text-[18px] text-[#0F0F0F] leading-tight line-clamp-2">
                        {card.title}
                      </div>
                      <div className="font-sans text-[18px] text-gray-500 font-medium">
                        Motion Lab
                      </div>
                      <div className="font-sans text-[18px] text-gray-400">
                        {card.views}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Canlı Kavisli Arama İmleci */}
            <VerifiedCursor
              id="search-cursor"
              label="Search Video"
              variant="pointer"
            />
          </div>

          {/* ===================================================================
              BEAT 2 (f111 - f270): OTANTİK YOUTUBE İZLEME SAYFASI (WATCH PAGE)
          =================================================================== */}
          <div className="stage-2-watch absolute inset-0 pt-[96px] pb-6 px-12 flex items-start justify-center overflow-hidden">
            <div className="watch-page-content relative z-20 w-[1720px] flex gap-8 items-start justify-between">
              {/* Sol Sütun: Video Oynatıcı & Kanal Bilgisi (70% Genişlik) */}
              <div className="w-[1220px] flex flex-col gap-4">
                {/* 16:9 Video Oynatıcı Kutusu (#the-video-hero-player) */}
                <div
                  id="the-video-hero-player"
                  className="relative w-full h-[640px] rounded-[24px] bg-black shadow-2xl overflow-hidden flex flex-col justify-between"
                >
                  {/* Video İçi Canlı Önizleme Tuvali */}
                  <div className="relative flex-1 w-full bg-gradient-to-tr from-[#1f0808] via-[#0d101a] to-[#06090e] flex items-center justify-center overflow-hidden">
                    <div
                      className="w-[720px] h-[360px] rounded-full opacity-55 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(circle, #FF0000 0%, #3B82F6 60%, transparent 80%)',
                        filter: 'blur(70px)',
                      }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-lg">
                        <svg
                          className="w-8 h-8 fill-current ml-1"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                      <span className="font-syne font-bold text-[28px] text-white tracking-wide">
                        THE ART OF MOTION
                      </span>
                    </div>
                  </div>

                  {/* Oynatıcı Alt Kontrol Barı */}
                  <div className="px-6 py-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2">
                    {/* Kırmızı Scrubber */}
                    <div className="relative w-full h-1.5 rounded-full bg-white/30 overflow-hidden flex items-center">
                      <div className="absolute left-0 top-0 bottom-0 w-[48%] bg-[#FF0000] rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-white font-mono text-[18px]">
                      <div className="flex items-center gap-4">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        </svg>
                        <span>03:42 / 12:48</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-gray-300 font-bold">2160p 4K</span>
                        {/* Sinema Modu (Theatre Mode) Butonu */}
                        <div
                          id="theatre-button"
                          className="p-1.5 rounded-md bg-white/20 text-white cursor-pointer hover:bg-white/30 flex items-center justify-center shadow-sm"
                          title="Theatre Mode"
                        >
                          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                            <path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Başlığı & Kanal Satırı */}
                <div className="flex flex-col gap-3 pt-1">
                  <h1 className="font-sans font-bold text-[28px] text-[#0F0F0F] tracking-tight">
                    The Art of Motion: Next-Gen 4K Motion Graphics
                  </h1>

                  <div className="flex items-center justify-between pt-1 border-b border-gray-200 pb-4">
                    {/* Kanal Bilgisi & Abone Ol */}
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#FF0000] text-white flex items-center justify-center font-bold text-[20px] shadow-sm">
                        M
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 font-sans font-bold text-[20px] text-[#0F0F0F]">
                          <span>Motion Lab</span>
                          <svg
                            className="w-5 h-5 text-gray-500 fill-current"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                        <span className="font-sans text-[18px] text-gray-500">
                          2.4M subscribers
                        </span>
                      </div>

                      <div className="ml-4 px-6 py-2.5 rounded-full bg-[#0F0F0F] text-white font-sans font-bold text-[18px] shadow-sm cursor-pointer hover:bg-black">
                        Subscribe
                      </div>
                    </div>

                    {/* Like & Share Hapları */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-[#0F0F0F] font-sans font-semibold text-[18px] shadow-2xs">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                        </svg>
                        <span>142K</span>
                      </div>

                      <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gray-100 text-[#0F0F0F] font-sans font-semibold text-[18px] shadow-2xs">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92c0-1.61-1.31-2.92-2.92-2.92z" />
                        </svg>
                        <span>Share</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Sütun: Önerilen Videolar Feed'i (Up Next) */}
              <div className="w-[460px] flex flex-col gap-4">
                <span className="font-sans font-bold text-[20px] text-[#0F0F0F]">
                  Up Next
                </span>

                {/* Öneri Kartı 1 */}
                <div className="flex gap-4 p-2 rounded-2xl hover:bg-gray-100 cursor-pointer">
                  <div className="relative w-[180px] h-[105px] rounded-xl bg-gradient-to-br from-red-900 to-zinc-900 overflow-hidden flex items-center justify-center shadow-xs">
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[16px]">
                      14:20
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-sans font-bold text-[18px] text-[#0F0F0F] leading-tight line-clamp-2">
                      Kinetic Typography Masterclass
                    </span>
                    <span className="font-sans text-[16px] text-gray-500">
                      Motion Lab
                    </span>
                    <span className="font-sans text-[16px] text-gray-400">
                      1.8M views · 2 days ago
                    </span>
                  </div>
                </div>

                {/* Öneri Kartı 2 */}
                <div className="flex gap-4 p-2 rounded-2xl hover:bg-gray-100 cursor-pointer">
                  <div className="relative w-[180px] h-[105px] rounded-xl bg-gradient-to-br from-blue-950 to-zinc-900 overflow-hidden flex items-center justify-center shadow-xs">
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[16px]">
                      09:45
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-sans font-bold text-[18px] text-[#0F0F0F] leading-tight line-clamp-2">
                      Fluid Particle Sim in WebGL
                    </span>
                    <span className="font-sans text-[16px] text-gray-500">
                      Creative Studio
                    </span>
                    <span className="font-sans text-[16px] text-gray-400">
                      940K views · 1 week ago
                    </span>
                  </div>
                </div>

                {/* Öneri Kartı 3 */}
                <div className="flex gap-4 p-2 rounded-2xl hover:bg-gray-100 cursor-pointer">
                  <div className="relative w-[180px] h-[105px] rounded-xl bg-gradient-to-br from-emerald-950 to-zinc-900 overflow-hidden flex items-center justify-center shadow-xs">
                    <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 text-white font-mono text-[16px]">
                      18:10
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col gap-1">
                    <span className="font-sans font-bold text-[18px] text-[#0F0F0F] leading-tight line-clamp-2">
                      Parametric Motion Physics
                    </span>
                    <span className="font-sans text-[16px] text-gray-500">
                      Studio Pulse
                    </span>
                    <span className="font-sans text-[16px] text-gray-400">
                      620K views · 3 weeks ago
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* İzleme Sayfası İmleci */}
            <VerifiedCursor
              id="watch-cursor"
              label="Click Theatre Mode"
              variant="pointer"
            />
          </div>

          {/* ===================================================================
              BEAT 3 (f271 - f420): TAM EKRAN SİNEMA MODU (THEATRE MODE EXPLOSION)
          =================================================================== */}
          <div className="stage-3-cinema absolute inset-0 bg-[#0A0A0C] flex items-center justify-center p-0 opacity-0 pointer-events-none overflow-hidden">
            {/* Koyu Sinema Odası Ambient Kırmızı Işıltısı */}
            <div
              className="absolute pointer-events-none w-[1600px] h-[900px] rounded-full opacity-40"
              style={{
                background:
                  'radial-gradient(circle, rgba(255,0,0,0.4) 0%, rgba(10,10,12,0) 75%)',
                filter: 'blur(110px)',
              }}
            />

            <div
              id="cinema-fullscreen-player"
              className="relative z-20 w-[1840px] h-[920px] rounded-[36px] bg-black border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col justify-between overflow-hidden"
            >
              {/* Sinema Modu Üst Barı */}
              <div className="h-20 px-10 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-sm">
                    <YouTubeBrandIcon className="w-6 h-6 fill-current" />
                  </div>
                  <span className="font-sans font-bold text-[24px] text-white tracking-tight">
                    THE ART OF MOTION // CINEMA EXPERIENCE
                  </span>
                </div>

                <div className="px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-200 font-mono font-bold text-[18px]">
                  4K ULTRA HD
                </div>
              </div>

              {/* Orta Canlı Kinetik Vektör Alanı */}
              <div className="relative flex-1 w-full flex flex-col items-center justify-center text-center px-16">
                <div className="kinetic-headline-punch flex flex-col items-center gap-4">
                  <KineticBurstWord
                    text="EXPERIENCE BOLD MOTION"
                    className="font-syne text-[56px] text-white font-extrabold tracking-[-0.04em]"
                  />
                  <span className="font-mono text-[22px] text-white/60 tracking-wider">
                    SEAMLESS STREAMING · PURE 60 FPS
                  </span>
                </div>
              </div>

              {/* Alt Kontrol Barı (Kırmızı Scrubber Bar + Kontroller) */}
              <div className="px-10 py-6 border-t border-white/10 bg-black/60 backdrop-blur-md flex flex-col gap-4">
                {/* Scrubber Bar */}
                <div className="relative w-full h-2.5 rounded-full bg-white/20 overflow-hidden flex items-center">
                  <div
                    id="cinema-scrubber-fill"
                    className="absolute left-0 top-0 bottom-0 bg-[#FF0000] rounded-full"
                  />
                </div>

                <div className="flex items-center justify-between text-white/80 font-mono text-[20px]">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3 text-white font-bold">
                      <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                      <span>PLAYING</span>
                    </div>
                    <span>02:14 / 10:00</span>
                  </div>

                  <div className="flex items-center gap-6 text-white/60">
                    <span>THEATRE MODE ACTIVE</span>
                    <span className="text-[#FF0000] font-bold">LIVE 4K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================
              BEAT 4 (f421 - f600): ANITSAL YOUTUBE LOGO KİLİDİ (1.8s STILLNESS)
          =================================================================== */}
          <div className="stage-4-monumental absolute inset-0 bg-[#FAFAFA] flex flex-col items-center justify-center px-12 opacity-0 pointer-events-none">
            <div className="brand-lockup-item flex flex-col items-center gap-8">
              {/* YouTube Kırmızı Oynatma Amblemi */}
              <div className="w-[240px] h-[168px] rounded-[52px] bg-[#FF0000] flex items-center justify-center text-white shadow-[0_24px_80px_rgba(255,0,0,0.45)] border border-white/30 cursor-pointer">
                <svg
                  className="w-24 h-24 text-white drop-shadow-md ml-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>

              {/* YouTube Logotype & Slogan */}
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="font-sans font-black text-[64px] tracking-[-0.05em] text-[#0F0F0F]">
                  YouTube
                </span>
                <span className="font-sans text-[24px] text-gray-500 font-medium tracking-normal">
                  STREAM WHAT YOU LOVE
                </span>
              </div>

              {/* Eyleme Çağrı Butonu (CTA) */}
              <div className="px-10 py-4 rounded-full bg-[#0F0F0F] text-white font-sans font-bold text-[22px] shadow-lg cursor-pointer hover:bg-black">
                Watch Now
              </div>
            </div>
          </div>
        </TheHeroActor>
      </CameraRig>
    </div>
  );
};
