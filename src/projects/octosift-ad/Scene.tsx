import { useRef, type FC } from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { DURATIONS, EASING } from '../../core/tokens';
import { LIGHT_SAAS_THEME } from '../../core/theme-contract';
import {
  applyIsometricTilt,
  applyFocusZoom,
  applyCanvasPan,
} from '../../core/spatial-camera';
import {
  SpatialCamera,
  BrowserFrame,
  AppShell,
  InteractiveMap,
  SlideOverDrawer,
  ModalDialog,
  CalendarGrid,
  KanbanBoard,
  SimulatedCursor,
  type MapPin,
  type KanbanColumnData,
  type CalendarEvent,
} from '../../primitives';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

/**
 * Storyboard Beat Tanımları (spec.json ile tam senkronize)
 */
export const BEATS = [
  { id: 'map-radar', startFrame: 0, endFrame: 80 },
  { id: 'lead-drawer', startFrame: 81, endFrame: 160 },
  { id: 'appointment-modal', startFrame: 161, endFrame: 240 },
  { id: 'pipeline-kanban', startFrame: 241, endFrame: 310 },
  { id: 'cta-resolve', startFrame: 311, endFrame: 360 },
];

/**
 * 1. Harita Verileri (İzmir / Alsancak B2B Arama)
 */
const MAP_PINS: MapPin[] = [
  { id: 'pin-1', x: 38, y: 32, label: 'Varuna Gezgin', badge: '★ 4.6', color: '#10b981', active: true },
  { id: 'pin-2', x: 42, y: 22, label: 'Inn Coffee', badge: '★ 4.9', color: '#2563eb' },
  { id: 'pin-3', x: 32, y: 48, label: 'İkonik Coffee', badge: '★ 5.0', color: '#10b981' },
  { id: 'pin-4', x: 62, y: 55, label: 'Elle Cafe', badge: '★ 4.3', color: '#10b981' },
  { id: 'pin-5', x: 74, y: 38, label: 'Buckin Coffee', badge: '★ 4.7', color: '#2563eb' },
];

const MAP_ROUTE = [
  { x: 32, y: 48 },
  { x: 38, y: 32 },
  { x: 42, y: 22 },
  { x: 62, y: 55 },
  { x: 74, y: 38 },
];

/**
 * 2. Takvim Verileri (Randevu & Görüşme Akışı)
 */
const CALENDAR_EVENTS: CalendarEvent[] = [
  { id: 'e1', time: '09:00', title: 'Inn Coffee', client: 'B2B CRM & Yazılım Sunumu', type: 'Toplantı' },
  { id: 'e2', time: '11:30', title: 'Varuna Gezgin', client: 'Web & Sosyal Medya Teklifi', type: 'Saha Ziyareti' },
  { id: 'e3', time: '14:00', title: 'İkonik Coffee', client: 'Portföy Görüşmesi', type: 'Telefon' },
];

/**
 * 3. Satış Boru Hattı Verileri (Kanban Pipeline)
 */
const KANBAN_COLUMNS: KanbanColumnData[] = [
  {
    id: 'leads',
    title: 'Yeni Adaylar',
    color: '#f59e0b',
    count: 2,
    cards: [
      { id: 'c1', title: 'İkonik Coffee', subtitle: 'Kahve dükkanı • Alsancak', badge: 'Skor: 57', tags: ['Alsancak', 'Yüksek Hacim'], amount: '₺25.000' },
      { id: 'c2', title: 'Elle Cafe', subtitle: 'Kafe • Konak', badge: 'Skor: 65', tags: ['Konak'], amount: '₺18.000' },
    ],
  },
  {
    id: 'contacted',
    title: 'Görüşüldü',
    color: '#2563eb',
    count: 1,
    cards: [
      { id: 'c3', title: 'Varuna Gezgin', subtitle: 'Kafe • Alsancak', badge: 'Skor: 65', tags: ['Web Eksik', 'Sıcak Müşteri'], amount: '₺35.000' },
    ],
  },
  {
    id: 'won',
    title: 'Satış Yapıldı',
    color: '#10b981',
    count: 2,
    cards: [
      { id: 'c4', title: 'Inn Coffee', subtitle: 'Kahve dükkanı • Alsancak', badge: 'Skor: 88', tags: ['Sözleşme İmzalandı'], amount: '₺42.000' },
    ],
  },
];

export const Scene: FC<SceneProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useRemotionGSAP(
    (tl) => {
      // -----------------------------------------------------------------------
      // 1. UZAMSAL KAMERA KOREOGRAFİSİ (spec.json ile tam uyumlu)
      // -----------------------------------------------------------------------

      // Kamera 1: 3D izometrik açıdan harita merkezine yaklaşma
      // at: 0.05
      applyIsometricTilt(tl, '.spatial-camera', 0.05, {
        rotateX: 4,
        rotateY: -3,
        rotateZ: 0,
        scale: 1.02,
        duration: DURATIONS.camera,
        ease: EASING.expoOut,
      });

      // Kamera 2: Müşteri çekmecesine ve 65/100 fırsat skoruna yaklaşma
      // at: 1.35
      applyFocusZoom(tl, '.spatial-camera', 1.35, {
        targetX: 60,
        targetY: 20,
        scale: 1.18,
        rotateX: 2,
        rotateY: 4,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      });

      // Kamera 3: Randevu modal penceresine odaklanma
      // at: 2.6
      applyFocusZoom(tl, '.spatial-camera', 2.6, {
        targetX: 0,
        targetY: -10,
        scale: 1.25,
        rotateX: 0,
        rotateY: 0,
        duration: DURATIONS.camera,
        ease: EASING.expoOut,
      });

      // Kamera 4: Satış takip panosu sütunlarına uzamsal kayış
      // at: 3.9
      applyCanvasPan(tl, '.spatial-camera', 3.9, {
        toX: 40,
        toY: -30,
        scale: 1.08,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      });

      // Kamera 5: 2.5D stüdyo eğimine geri çekilme ve marka kilitlenmesi
      // at: 5.1
      applyIsometricTilt(tl, '.spatial-camera', 5.1, {
        rotateX: 10,
        rotateY: -12,
        rotateZ: 0,
        scale: 1.0,
        duration: DURATIONS.item,
        ease: EASING.expoInOut,
      });

      // -----------------------------------------------------------------------
      // 2. İÇERİK KATMANLARI VE WIDGET GEÇİŞLERİ (UZAMSAL SÜREKLİLİK)
      // -----------------------------------------------------------------------

      // Beat 1 -> Beat 2: Çekmecenin sağdan kayarak açılması (Frame 81 / 1.35s)
      tl.fromTo(
        '.slide-over-drawer',
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
        1.35
      );

      // Beat 2 -> Beat 3: Çekmece kapanışı, Harita gizleme, Takvim ve Modal belirişi (Frame 161 / 2.68s)
      tl.to('.slide-over-drawer', { x: '110%', opacity: 0, duration: DURATIONS.micro, ease: EASING.quickIn }, 2.6);
      tl.to('.view-map-layer', { opacity: 0, duration: DURATIONS.micro }, 2.6);
      tl.fromTo(
        '.view-calendar-layer',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1.0, duration: DURATIONS.item, ease: EASING.expoOut },
        2.62
      );
      tl.fromTo(
        '.modal-dialog-overlay',
        { opacity: 0, scale: 0.92, y: 30 },
        { opacity: 1, scale: 1.0, y: 0, duration: DURATIONS.item, ease: EASING.backOut },
        2.68
      );

      // Beat 3 -> Beat 4: Modaldan Satış Takip Panosuna (Kanban) Geçiş (Frame 241 / 4.02s)
      tl.to('.modal-dialog-overlay', { opacity: 0, scale: 1.05, duration: DURATIONS.micro, ease: EASING.quickIn }, 3.9);
      tl.to('.view-calendar-layer', { opacity: 0, duration: DURATIONS.micro }, 3.9);
      tl.fromTo(
        '.view-kanban-layer',
        { opacity: 0, x: 60, scale: 0.98 },
        { opacity: 1, x: 0, scale: 1.0, duration: DURATIONS.panel, ease: EASING.expoOut },
        3.92
      );

      // Kanban İçinde Fırsat Kartının "Satış Yapıldı" Sütununa Taşınması
      tl.to(
        '.kanban-card-c3',
        {
          x: 280,
          scale: 1.04,
          duration: DURATIONS.panel,
          ease: EASING.expoOut,
        },
        4.35
      );

      // Beat 5: Final CTA Rozetinin Belirişi (Frame 311 / 5.18s)
      tl.fromTo(
        '.hero-brand-cta',
        { opacity: 0, y: 40, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.panel, ease: EASING.backOut },
        5.15
      );

      // -----------------------------------------------------------------------
      // 3. SİMÜLE EDİLMİŞ İMLEÇ HAREKETLERİ (PARALLAX-FREE SPATIAL CURSOR)
      // -----------------------------------------------------------------------

      // İmleç Haritadaki Alsancak Pinine Uçuyor ve Tıklıyor (f10 -> f45)
      tl.fromTo(
        '.simulated-cursor',
        { x: 780, y: 1100, opacity: 0, scale: 0.8 },
        { x: 420, y: 680, opacity: 1, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut },
        0.18
      );

      // Tıklama 1: Pin Tıklama Dalgası (f45 / 0.75s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 1.8, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        0.75
      );

      // İmleç Çekmecedeki "+ Randevu Oluştur" Butonuna Gidiyor ve Tıklıyor (f90 -> f135)
      tl.to(
        '.simulated-cursor',
        {
          x: 810,
          y: 720,
          duration: DURATIONS.camera,
          ease: EASING.expoOut,
        },
        1.5
      );

      // Tıklama 2: Çekmece Aksiyon Tıklaması (f135 / 2.25s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 1.8, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        2.25
      );

      // İmleç Modal İçindeki "Takvime Kaydet" Butonuna Gidiyor (f170 -> f215)
      tl.to(
        '.simulated-cursor',
        {
          x: 740,
          y: 980,
          duration: DURATIONS.camera,
          ease: EASING.expoOut,
        },
        2.85
      );

      // Tıklama 3: Modal Kaydet Tıklaması (f215 / 3.58s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 2.0, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        3.58
      );

      // İmleç Kanban Kartını Sürüklüyor (f260 -> f295)
      tl.to(
        '.simulated-cursor',
        {
          x: 780,
          y: 730,
          duration: DURATIONS.panel,
          ease: EASING.expoOut,
        },
        4.25
      );

      // Kapanışta İmleç Zarifçe Kayboluyor
      tl.to('.simulated-cursor', { opacity: 0, scale: 0.7, duration: DURATIONS.micro }, 5.1);
    },
    []
  );

  return (
    <AbsoluteFill ref={containerRef} className="bg-[#f8fafc] overflow-hidden select-none">
      {/* 1. KARE KİLİTLİ PROFESYONEL SES EFEKTLERİ */}
      <Audio src={staticFile('sfx/whoosh-pan.wav')} startFrom={0} endAt={70} />
      <Audio src={staticFile('sfx/ui-lock.wav')} startFrom={0} endAt={45} />
      <Audio src={staticFile('sfx/ui-lock.wav')} startFrom={0} endAt={45} />
      <Audio src={staticFile('sfx/whoosh-pan.wav')} startFrom={0} endAt={70} />
      <Audio src={staticFile('sfx/ui-lock.wav')} startFrom={0} endAt={45} />

      {/* 2. EVRENSEL UZAMSAL KAMERA & PARALLAX-FREE CURSOR YUVASI */}
      <SpatialCamera
        theme={LIGHT_SAAS_THEME}
        perspective={1200}
        cameraClassName="spatial-camera"
        worldClassName="spatial-world"
        backgroundVariant="subtle-grid"
        cursorSlot={
          <SimulatedCursor
            x={0}
            y={0}
            color="#0f172a"
            rippleColor="rgba(37, 99, 235, 0.45)"
            cursorClassName="simulated-cursor"
            rippleClassName="cursor-ripple"
          />
        }
      >
        {/* 3. ANA TARAYICI VE SAAS UYGULAMA İSKELETİ (DEAD-SPACE FREE) */}
        <div className="relative w-[980px] h-[1420px] flex items-center justify-center">
          <BrowserFrame
            theme={LIGHT_SAAS_THEME}
            url="https://app.octosift.com/leads/izmir"
            title="Octosift — B2B Lead Engine"
            width="100%"
            height="100%"
            showAddressBar={true}
            showTrafficLights={true}
          >
            <AppShell
              theme={LIGHT_SAAS_THEME}
              brandName="Octosift"
              brandLogo={
                <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center text-white font-black text-[22px] shadow-md">
                  O
                </div>
              }
              headerTitle="B2B Müşteri İstihbaratı"
              headerSubtitle="İzmir / Alsancak • 30 Firma Bulundu"
              searchPlaceholder="Firma, sektör veya konum ara..."
              navItems={[
                { id: 'radar', label: 'B2B Radar', active: true, badge: '30' },
                { id: 'pipeline', label: 'Boru Hattı', badge: '₺120k' },
                { id: 'calendar', label: 'Randevular' },
                { id: 'analytics', label: 'İstihbarat' },
              ]}
              headerActionsSlot={
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] font-mono font-bold text-[16px]">
                    250 Kredi
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] shadow-sm">
                    + Yeni Arama
                  </div>
                </div>
              }
            >
              {/* TUVAL İÇERİĞİ: WIDGET'LARIN UZAMSAL KATMANLARI */}
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                {/* KATMAN A: VEKTÖREL HARİTA & SAHA ROTASI */}
                <div className="view-map-layer absolute inset-0 w-full h-full z-10">
                  <InteractiveMap
                    theme={LIGHT_SAAS_THEME}
                    pins={MAP_PINS}
                    route={MAP_ROUTE}
                    routeProgress={1}
                    topBarSlot={
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full bg-[#10b981] animate-pulse" />
                          <span className="font-bold text-[17px] text-slate-800">
                            Haritada 5 Hedef Firma
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-blue-50 text-[#2563eb] font-semibold text-[16px]">
                            İzmir / Alsancak
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-medium text-[16px]">
                            Yarıçap: 3 km
                          </span>
                        </div>
                      </div>
                    }
                    floatingCardSlot={
                      <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-xl flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#2563eb] font-bold text-[18px]">
                          📍
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-[17px] text-slate-900">
                            Plasiyer Saha Rotası
                          </span>
                          <span className="text-[16px] text-slate-500">
                            5 firma optimize edildi
                          </span>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] ml-auto">
                          Rota Başlat
                        </div>
                      </div>
                    }
                  />
                </div>

                {/* KATMAN B: SAĞDAN KAYAN MÜŞTERİ İSTİHBARAT ÇEKMECESİ */}
                <SlideOverDrawer
                  theme={LIGHT_SAAS_THEME}
                  width="480px"
                  title="Varuna Gezgin"
                  subtitle="Kafe & Restoran • Alsancak / İzmir"
                  badges={[
                    { label: 'Harita Kaydı', color: '#2563eb' },
                    { label: 'Fırsat Skoru: 65/100', color: '#f59e0b' },
                    { label: '★ 4.6 (4200 yorum)', color: '#10b981' },
                  ]}
                  statusOptions={[
                    { id: 'new', label: 'Yeni Aday', active: true },
                    { id: 'reached', label: 'Ulaşıldı' },
                    { id: 'pending', label: 'Yanıt Bekleniyor' },
                    { id: 'offer', label: 'Teklif Verildi' },
                  ]}
                  footerSlot={
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-[16px]">
                        Detaylı İncele
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] shadow-sm">
                        + Randevu Ekle
                      </div>
                    </div>
                  }
                >
                  <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex flex-col gap-1.5">
                      <span className="font-bold text-[17px] text-amber-900">
                        ⚡ Web Sitesi ve Reklam Analizi
                      </span>
                      <p className="text-[16px] text-amber-800 leading-relaxed">
                        Bu firmanın henüz bir web sitesi veya aktif reklamı yok. Kurumsal web tasarımı veya sosyal medya yönetimi teklif edilebilir!
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-[17px] text-slate-800">
                        Potansiyel Teklif Tutarı
                      </span>
                      <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-[20px] text-slate-900">
                        ₺35.000 / Proje
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-[17px] text-slate-800">
                        Müşteri Etiketleri
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {['#Öncelikli', '#Reklam Fırsatı', '#Kurumsal', '#Sıcak Müşteri'].map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[16px]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </SlideOverDrawer>

                {/* KATMAN C: RANDEVU TAKVİMİ & MERKEZİ DİYALOG (MODAL) */}
                <div className="view-calendar-layer absolute inset-0 w-full h-full opacity-0 pointer-events-none bg-white z-30">
                  <CalendarGrid
                    theme={LIGHT_SAAS_THEME}
                    monthTitle="Kasım 2026"
                    selectedDay={28}
                    events={CALENDAR_EVENTS}
                  />

                  <ModalDialog
                    theme={LIGHT_SAAS_THEME}
                    title="Yeni Randevu / Etkinlik Ekle"
                    subtitle="Müşteri takip takvimine yeni bir zaman bloğu ekleyin."
                    width="540px"
                    footerSlot={
                      <div className="flex items-center gap-3">
                        <div className="px-4 py-2 rounded-xl text-slate-600 font-medium text-[16px]">
                          İptal
                        </div>
                        <div className="px-6 py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] shadow-md">
                          Takvime Kaydet
                        </div>
                      </div>
                    }
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[16px] text-slate-700">
                          Müşteri / İşletme Seçin:
                        </span>
                        <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-semibold text-[17px] text-slate-900">
                          Inn coffee (Kahve dükkanı)
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-[16px] text-slate-700">Tarih:</span>
                          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[16px] text-slate-800">
                            28.10.2026
                          </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span className="font-bold text-[16px] text-slate-700">Saat:</span>
                          <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[16px] text-slate-800">
                            09:00
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <span className="font-bold text-[16px] text-slate-700">
                          Görüşme Notu / Ajanda:
                        </span>
                        <div className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[16px] text-slate-600">
                          B2B Teklif sunumu ve şartname analizi
                        </div>
                      </div>
                    </div>
                  </ModalDialog>
                </div>

                {/* KATMAN D: SATIŞ TAKİP PANOSU (KANBAN BOARD) */}
                <div className="view-kanban-layer absolute inset-0 w-full h-full opacity-0 pointer-events-none bg-white z-30">
                  <KanbanBoard
                    theme={LIGHT_SAAS_THEME}
                    boardTitle="Satış Takip Panosu"
                    boardSubtitle="Müşteri kartlarını aşamalar arasında sürükleyerek boru hattınızı yönetin."
                    headerStats={[
                      { label: 'TOPLAM BORU HATTI', value: '₺120.000' },
                      { label: 'KAZANILAN TUTAR', value: '₺42.000' },
                    ]}
                    columns={KANBAN_COLUMNS}
                  />
                </div>
              </div>
            </AppShell>
          </BrowserFrame>
        </div>

        {/* 4. KULLANICI DÖNÜŞÜM CTA ROZETİ (FINAL BEAT) */}
        <div className="hero-brand-cta absolute bottom-24 flex flex-col items-center gap-3 pointer-events-none opacity-0">
          <div className="px-7 py-3.5 rounded-2xl bg-[#0f172a] text-white shadow-2xl border border-white/10 flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center font-black text-white text-[18px]">
              O
            </div>
            <span className="font-bold text-[20px] tracking-tight">
              Octosift ile B2B Müşterilerinizi Otomatikleştirin
            </span>
            <span className="px-3 py-1 rounded-lg bg-[#2563eb] text-white font-mono font-bold text-[16px] ml-2">
              octosift.com
            </span>
          </div>
        </div>
      </SpatialCamera>
    </AbsoluteFill>
  );
};
