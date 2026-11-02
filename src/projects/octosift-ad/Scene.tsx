import { useRef, type FC } from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
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
  VirtualCanvas,
  BrowserFrame,
  AppShell,
  MetricCardRow,
  DataTable,
  SlideOverDrawer,
  CalendarGrid,
  ModalDialog,
  InteractiveMap,
  SimulatedCursor,
  KineticHeadline,
  TemplateFrame,
  type MapPin,
  type CalendarEvent,
  type MetricCardItem,
  type DataTableColumn,
  type DataTableRow,
} from '../../primitives';

import projectData from './data.json';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

/**
 * Storyboard Beat Tanımları (spec.json ile tam senkronize)
 */
export const BEATS = [
  { id: 'radar-discovery', startFrame: 0, endFrame: 49 },
  { id: 'lead-intel', startFrame: 50, endFrame: 144 },
  { id: 'appointment-action', startFrame: 145, endFrame: 209 },
  { id: 'field-route', startFrame: 210, endFrame: 304 },
  { id: 'hero-resolve', startFrame: 305, endFrame: 360 },
];

/**
 * Projeye Özel Veriler (data.json üzerinden prop-driven yüklenir)
 */
const METRIC_CARDS: MetricCardItem[] = projectData.metricCards.map((c) => ({
  ...c,
  actionSlot: c.id === 'credits' ? (
    <div className="px-3.5 py-1.5 rounded-xl bg-[#2563eb] text-white font-bold text-[16px] text-center shadow-sm">
      + Kredi Yükle
    </div>
  ) : undefined,
}));

const TABLE_COLUMNS: DataTableColumn[] = projectData.tableColumns as DataTableColumn[];
const TABLE_ROWS: DataTableRow[] = projectData.tableRows;
const CALENDAR_EVENTS: CalendarEvent[] = projectData.calendarEvents;
const MAP_PINS: MapPin[] = projectData.mapPins;
const MAP_ROUTE = projectData.mapRoute;

export const Scene: FC<SceneProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const frame = useCurrentFrame();

  useRemotionGSAP(
    (tl) => {
      // -----------------------------------------------------------------------
      // 1. UZAMSAL KAMERA KOREOGRAFİSİ (spec.json ile tam uyumlu)
      // -----------------------------------------------------------------------

      // Kamera 1: 3D izometrik açıdan müşteri tablosuna ve KPI kartlarına yaklaşma
      // at: 0.05
      applyIsometricTilt(tl, '.spatial-camera', 0.05, {
        rotateX: 4,
        rotateY: -3,
        rotateZ: 0,
        scale: 1.05,
        duration: DURATIONS.camera,
        ease: EASING.expoOut,
      });

      // Kamera 2: Sağa pan ve çekmecedeki web analiz kutusuna odaklanma
      // at: 0.85
      applyFocusZoom(tl, '.spatial-camera', 0.85, {
        targetX: 180,
        targetY: 20,
        scale: 1.35,
        rotateX: 2,
        rotateY: 3,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      });

      // Kamera 3: Merkeze dönüş ve randevu modal penceresine odaklanma
      // at: 2.35
      applyFocusZoom(tl, '.spatial-camera', 2.35, {
        targetX: 0,
        targetY: 10,
        scale: 1.28,
        rotateX: 0,
        rotateY: 0,
        duration: DURATIONS.camera,
        ease: EASING.expoOut,
      });

      // Kamera 4: Saha haritasına ve rota eğrisine uzamsal süzülüş
      // at: 3.45
      applyCanvasPan(tl, '.spatial-camera', 3.45, {
        toX: 40,
        toY: -20,
        scale: 1.15,
        duration: DURATIONS.panel,
        ease: EASING.expoOut,
      });

      // Kamera 5: 2.5D stüdyo eğimine geri çekilme ve marka kilitlenmesi
      // at: 4.95
      applyIsometricTilt(tl, '.spatial-camera', 4.95, {
        rotateX: 11,
        rotateY: -14,
        rotateZ: 0,
        scale: 0.96,
        duration: DURATIONS.item,
        ease: EASING.expoInOut,
      });

      // -----------------------------------------------------------------------
      // 2. PAZARLAMA BAŞLIĞI KATMANLARI (KINETIC HEADLINES)
      // -----------------------------------------------------------------------
      // Beat 1 Başlığı
      tl.fromTo('.hl-beat-1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.expoOut }, 0.08);
      tl.to('.hl-beat-1', { opacity: 0, y: -20, duration: DURATIONS.instant }, 0.8);

      // Beat 2 Başlığı
      tl.fromTo('.hl-beat-2', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.expoOut }, 0.85);
      tl.to('.hl-beat-2', { opacity: 0, y: -20, duration: DURATIONS.instant }, 2.3);

      // Beat 3 Başlığı
      tl.fromTo('.hl-beat-3', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.expoOut }, 2.35);
      tl.to('.hl-beat-3', { opacity: 0, y: -20, duration: DURATIONS.instant }, 3.4);

      // Beat 4 Başlığı
      tl.fromTo('.hl-beat-4', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.expoOut }, 3.45);
      tl.to('.hl-beat-4', { opacity: 0, y: -20, duration: DURATIONS.instant }, 4.9);

      // Beat 5 Başlığı
      tl.fromTo('.hl-beat-5', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: DURATIONS.panel, ease: EASING.backOut }, 4.95);

      // -----------------------------------------------------------------------
      // 3. İÇERİK KATMANLARI VE WIDGET GEÇİŞLERİ (ANTI-GHOSTING & DIMMING)
      // -----------------------------------------------------------------------

      // Beat 1 -> Beat 2: Varuna Gezgin Satırına Tıklama ve Çekmece Açılışı (f50 / 0.85s)
      tl.to('.table-row-varuna', { backgroundColor: 'rgba(37, 99, 235, 0.22)', duration: DURATIONS.instant }, 0.82);
      tl.to('.view-table-layer', { filter: 'blur(6px) brightness(0.92)', opacity: 0.4, duration: DURATIONS.panel }, 0.85);
      tl.fromTo(
        '.slide-over-drawer',
        { x: '100%', opacity: 0 },
        { x: '0%', opacity: 1, duration: DURATIONS.panel, ease: EASING.expoOut },
        0.86
      );

      // Beat 2 -> Beat 3: Çekmece Kapanışı, Tablo Gizleme, Takvim & Modal Açılışı (f145 / 2.35s)
      tl.to('.slide-over-drawer', { x: '110%', opacity: 0, duration: DURATIONS.micro, ease: EASING.quickIn }, 2.32);
      tl.to('.view-table-layer', { opacity: 0, duration: DURATIONS.instant }, 2.35);
      tl.fromTo(
        '.view-calendar-layer',
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1.0, duration: DURATIONS.item, ease: EASING.expoOut },
        2.36
      );
      tl.fromTo(
        '.modal-dialog-overlay',
        { opacity: 0, scale: 0.92, y: 24 },
        { opacity: 1, scale: 1.0, y: 0, duration: DURATIONS.item, ease: EASING.backOut },
        2.40
      );

      // Beat 3 -> Beat 4: Modaldan İzmir Haritasına Geçiş (f210 / 3.45s)
      tl.to('.modal-dialog-overlay', { opacity: 0, scale: 1.04, duration: DURATIONS.micro, ease: EASING.quickIn }, 3.42);
      tl.to('.view-calendar-layer', { opacity: 0, duration: DURATIONS.instant }, 3.44);
      tl.fromTo(
        '.view-map-layer',
        { opacity: 0, scale: 0.96, x: 50 },
        { opacity: 1, scale: 1.0, x: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        3.46
      );

      // Beat 5: Final Hero CTA Kartı Kilitlenmesi (f305 / 4.95s)
      tl.fromTo(
        '.hero-brand-card',
        { opacity: 0, y: 60, scale: 0.86 },
        { opacity: 1, y: 0, scale: 1.0, duration: DURATIONS.panel, ease: EASING.backOut },
        4.98
      );

      // -----------------------------------------------------------------------
      // 4. PARALLAX-FREE SİMÜLE EDİLMİŞ İMLEÇ HAREKETLERİ
      // -----------------------------------------------------------------------

      // İmleç Tablodaki Varuna Gezgin Satırına Uçuyor ve Tıklıyor (f15 -> f50)
      tl.fromTo(
        '.simulated-cursor',
        { x: 920, y: 720, opacity: 0, scale: 0.8 },
        { x: 680, y: 560, opacity: 1, scale: 1.0, duration: DURATIONS.camera, ease: EASING.expoOut },
        0.2
      );

      // Tıklama 1: Satır Tıklama Dalgası (f50 / 0.83s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 1.8, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        0.83
      );

      // İmleç Çekmecedeki "+ Randevu Ekle" Butonuna Uçuyor ve Tıklıyor (f75 -> f125)
      tl.to(
        '.simulated-cursor',
        {
          x: 1280,
          y: 780,
          duration: DURATIONS.camera,
          ease: EASING.expoOut,
        },
        1.1
      );

      // Tıklama 2: Randevu Butonu Tıklaması (f125 / 2.08s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 1.8, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        2.08
      );

      // İmleç Modal İçindeki "Takvime Kaydet" Butonuna Uçuyor ve Tıklıyor (f155 -> f195)
      tl.to(
        '.simulated-cursor',
        {
          x: 880,
          y: 640,
          duration: DURATIONS.camera,
          ease: EASING.expoOut,
        },
        2.55
      );

      // Tıklama 3: Modal Kaydet Tıklaması (f195 / 3.25s)
      tl.fromTo(
        '.cursor-ripple',
        { scale: 0.3, opacity: 0.9 },
        { scale: 2.0, opacity: 0, duration: DURATIONS.panel, ease: EASING.expoOut },
        3.25
      );

      // İmleç Haritadaki Alsancak Pinine Uçuyor (f225 -> f265)
      tl.to(
        '.simulated-cursor',
        {
          x: 640,
          y: 450,
          duration: DURATIONS.camera,
          ease: EASING.expoOut,
        },
        3.7
      );

      // Kapanışta İmleç Kayboluyor
      tl.to('.simulated-cursor', { opacity: 0, scale: 0.7, duration: DURATIONS.micro }, 4.9);
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

      {/* 2. SİNEMATİK ÜST PAZARLAMA BAŞLIKLARI (EDITORIAL OVERLAY) */}
      <KineticHeadline
        theme={LIGHT_SAAS_THEME}
        tag="B2B RADAR"
        title="Web Sitesi Olmayan Sıcak Müşterileri Yakalayın"
        subtitle="İzmir / Alsancak • 30 Hedef Firma Keşfedildi"
        headlineClassName="hl-beat-1"
      />
      <KineticHeadline
        theme={LIGHT_SAAS_THEME}
        tag="YAPAY ZEKA İÇGÖRÜSÜ"
        title="Detaylı Fırsat ve Web Analizi"
        subtitle="Varuna Gezgin • Fırsat Skoru: 65/100"
        headlineClassName="hl-beat-2 opacity-0"
      />
      <KineticHeadline
        theme={LIGHT_SAAS_THEME}
        tag="OTOMATİK TAKVİM"
        title="Tek Tıkla Randevu ve Görüşme Planlayın"
        subtitle="Inn Coffee • 28.10.2026 Saat 09:00"
        headlineClassName="hl-beat-3 opacity-0"
      />
      <KineticHeadline
        theme={LIGHT_SAAS_THEME}
        tag="SAHA ROTASI"
        title="Sahada Akıllı Rota, Maksimum Ciro"
        subtitle="5 Hedef Firma İçin Optimize Edilmiş Rota"
        headlineClassName="hl-beat-4 opacity-0"
      />
      <KineticHeadline
        theme={LIGHT_SAAS_THEME}
        tag="OCTOSIFT CRM"
        title="B2B Satışlarınızı Otomatikleştirin"
        subtitle="Müşteri bulma, randevu takvimi ve saha rotası tek ekranda"
        headlineClassName="hl-beat-5 opacity-0"
      />

      {/* 3. EVRENSEL UZAMSAL KAMERA & AMBIENT DRIFT MOTORU */}
      <SpatialCamera
        theme={LIGHT_SAAS_THEME}
        perspective={1200}
        cameraClassName="spatial-camera"
        worldClassName="spatial-world"
        backgroundVariant="subtle-grid"
        enableAmbientDrift={true}
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
        {/* 4. SANAL TUVAL DECOUPLING (1440x900 MASAÜSTÜ ÖLÇEĞİ) */}
        <VirtualCanvas width={1440} height={900}>
          <BrowserFrame
            theme={LIGHT_SAAS_THEME}
            url="https://app.octosift.com/leads/izmir/alsancak"
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
              headerTitle="Müşteri Listesi"
              headerSubtitle="İzmir / Alsancak • 30 Firma Bulundu"
              searchPlaceholder="Firma veya etkinlik ara..."
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
                    + Yeni Arama Başlat
                  </div>
                </div>
              }
            >
              {/* TUVAL İÇERİĞİ: WIDGET'LARIN UZAMSAL KATMANLARI */}
              <div className="relative w-full h-full overflow-hidden rounded-xl">
                {/* ------------------------------------------------------------- */}
                {/* KATMAN 1: TABLO & KPI ÖZETLERİ (1. EKRAN GÖRÜNTÜSÜ) */}
                {/* ------------------------------------------------------------- */}
                <div className="view-table-layer absolute inset-0 w-full h-full flex flex-col gap-5 overflow-hidden z-10">
                  {/* KPI Kartları Satırı */}
                  <MetricCardRow theme={LIGHT_SAAS_THEME} cards={METRIC_CARDS} />

                  {/* Hibrit Şablon Motoru: Canlı Veri Yuvarlama Telemetrisi (frame-data-rollup) */}
                  <div className="telemetry-rollup-panel w-full h-[180px] rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm bg-white shrink-0">
                    <TemplateFrame
                      templateId="frame-data-rollup"
                      theme={LIGHT_SAAS_THEME}
                      data={{
                        title: 'Doğrulama ve Eşleşme Oranı',
                        unit: '%',
                        items: [
                          { label: 'Telefon', value: 94 },
                          { label: 'E-posta', value: 88 },
                          { label: 'Yetkili', value: 76 },
                          { label: 'Randevu', value: 64 },
                        ],
                      }}
                    />
                  </div>

                  {/* Müşteri Veri Tablosu */}
                  <DataTable
                    theme={LIGHT_SAAS_THEME}
                    columns={TABLE_COLUMNS}
                    rows={TABLE_ROWS}
                    highlightedRowIndex={2} // Varuna Gezgin Satırı Vurgulu
                    renderCell={(row, colKey) => {
                      if (colKey === 'company') {
                        return (
                          <div className="flex flex-col">
                            <span className="font-bold text-[18px] text-slate-900">{row.companyName}</span>
                            <span className="text-[16px] text-slate-500">{row.companyCategory}</span>
                          </div>
                        );
                      }
                      if (colKey === 'score') {
                        return (
                          <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-[16px] inline-flex items-center gap-1">
                            ⚡ {row.score}
                          </div>
                        );
                      }
                      if (colKey === 'rating') {
                        return (
                          <span className="font-bold text-[16px] text-amber-600 font-mono">{row.rating}</span>
                        );
                      }
                      if (colKey === 'status') {
                        return (
                          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563eb] font-semibold text-[16px]">
                            {row.status}
                          </span>
                        );
                      }
                      if (colKey === 'action') {
                        return (
                          <div className="flex items-center justify-end gap-2">
                            <span className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold text-[16px]">
                              + Portföy
                            </span>
                          </div>
                        );
                      }
                      return <span className="text-[16px] text-slate-600">{row[colKey]}</span>;
                    }}
                  />
                </div>

                {/* ------------------------------------------------------------- */}
                {/* KATMAN 2: SAĞDAN KAYAN ÇEKMECE (2. EKRAN GÖRÜNTÜSÜ) */}
                {/* ------------------------------------------------------------- */}
                <SlideOverDrawer
                  isOpen={frame >= 35 && frame <= 125}
                  theme={LIGHT_SAAS_THEME}
                  width="520px"
                  title="Varuna Gezgin"
                  subtitle="Kafe & Restoran • Alsancak / İzmir"
                  badges={[
                    { label: 'Harita Kaydı', color: '#2563eb' },
                    { label: 'Fırsat Skoru: 65/100', color: '#f59e0b' },
                    { label: '★ 4.6 (4204 yorum)', color: '#10b981' },
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
                    <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex flex-col gap-1.5">
                      <span className="font-bold text-[18px] text-amber-900">
                        ⚡ Web Sitesi ve Reklam Analizi
                      </span>
                      <p className="text-[16px] text-amber-800 leading-relaxed">
                        Bu firmanın henüz bir web sitesi veya aktif reklamı yok. Kurumsal web tasarımı ve reklam yönetimi teklif edilebilir!
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-[17px] text-slate-800">
                        Potansiyel Teklif / Satış Tutarı
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

                {/* ------------------------------------------------------------- */}
                {/* KATMAN 3: TAKVİM & RANDEVU MODALI (3. & 4. EKRAN GÖRÜNTÜSÜ) */}
                {/* ------------------------------------------------------------- */}
                <div className="view-calendar-layer absolute inset-0 w-full h-full opacity-0 pointer-events-none bg-white z-30">
                  <CalendarGrid
                    theme={LIGHT_SAAS_THEME}
                    monthTitle="Kasım 2026"
                    selectedDay={28}
                    events={CALENDAR_EVENTS}
                  />

                  <ModalDialog
                    isOpen={frame >= 135 && frame <= 205}
                    theme={LIGHT_SAAS_THEME}
                    title="Yeni Randevu / Etkinlik Ekle"
                    subtitle="Müşteri takip takvimine yeni bir zaman bloğu ekleyin."
                    width="560px"
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

                {/* ------------------------------------------------------------- */}
                {/* KATMAN 4: İZMİR VEKTÖREL HARİTASI (5. EKRAN GÖRÜNTÜSÜ) */}
                {/* ------------------------------------------------------------- */}
                <div className="view-map-layer absolute inset-0 w-full h-full opacity-0 pointer-events-none z-30">
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
              </div>
            </AppShell>
          </BrowserFrame>
        </VirtualCanvas>

        {/* ------------------------------------------------------------------- */}
        {/* 5. HERO KULLANICI DÖNÜŞÜM KARTI (FINAL BEAT MERKEZİ CTA) */}
        {/* ------------------------------------------------------------------- */}
        <div className="hero-brand-card absolute inset-0 z-50 flex items-center justify-center pointer-events-none opacity-0">
          <div className="p-8 rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-white/15 text-white shadow-2xl flex flex-col items-center text-center gap-5 max-w-[620px]">
            <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center font-black text-white text-[32px] shadow-lg">
              O
            </div>
            <div className="flex flex-col gap-1.5">
              <h2 className="text-[32px] font-black tracking-tight leading-snug">
                Octosift ile B2B Satışlarınızı Otomatikleştirin
              </h2>
              <p className="text-[18px] text-slate-300">
                Hedef müşteri keşfi, yapay zeka istihbaratı ve akıllı saha rotası tek platformda.
              </p>
            </div>
            <div className="px-8 py-3.5 rounded-2xl bg-[#2563eb] text-white font-mono font-bold text-[20px] shadow-xl border border-blue-400/30">
              octosift.com
            </div>
          </div>
        </div>
      </SpatialCamera>
    </AbsoluteFill>
  );
};
