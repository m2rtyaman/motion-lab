import { type FC } from 'react';
import { useCurrentFrame } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { animateCamera } from '../../core/choreography';
import { SpotlightStage, CameraRig } from '../../primitives';
import {
  Calendar,
  Layers,
  PhoneCall,
  Plus,
  Compass,
  Star,
  CheckCircle,
  FileText,
  AlertCircle,
  Building,
  ChevronRight,
} from 'lucide-react';

export interface SceneProps {
  aspect?: '9:16' | '16:9';
}

const BEATS = [
  { id: 'lead-discovery', startFrame: 0, endFrame: 169 },
  { id: 'field-route', startFrame: 170, endFrame: 359 },
  { id: 'drawer-intelligence', startFrame: 360, endFrame: 539 },
  { id: 'kanban-closing', startFrame: 540, endFrame: 720 },
] as const;

export const Scene: FC<SceneProps> = ({ aspect = '16:9' }) => {
  const frame = useCurrentFrame();

  useRemotionGSAP((tl) => {
    animateCamera(tl, '.camera-rig', [
      { at: 0, duration: 0, scale: 0.98, rotateX: 2 },
      // at: 0.05
      { at: 0.05, duration: 1.2, scale: 1.0, rotateX: 0, ease: 'expo.out' },
      // at: 1.6
      { at: 1.6, duration: 1.2, scale: 1.03, y: -20, ease: 'expo.inOut' },
      // at: 3.0
      { at: 3.0, duration: 1.2, scale: 1.06, rotateZ: -1.0, ease: 'expo.inOut' },
      // at: 4.6
      { at: 4.6, duration: 1.2, scale: 1.02, rotateZ: 0.5, ease: 'power3.out' },
      // at: 6.2
      { at: 6.2, duration: 1.2, scale: 1.05, y: -15, ease: 'expo.out' },
      // at: 7.8
      { at: 7.8, duration: 1.2, scale: 1.02, y: -25, ease: 'expo.inOut' },
      // at: 9.4
      { at: 9.4, duration: 1.2, scale: 1.06, y: -10, ease: 'expo.out' },
      // at: 10.9
      { at: 10.9, duration: 1.0, scale: 1.0, y: 0, ease: 'expo.out' },
    ]);
  }, []);

  const isBeat1 = frame >= BEATS[0].startFrame && frame <= BEATS[0].endFrame;
  const isBeat2 = frame >= BEATS[1].startFrame && frame <= BEATS[1].endFrame;
  const isBeat3 = frame >= BEATS[2].startFrame && frame <= BEATS[2].endFrame;
  const isBeat4 = frame >= BEATS[3].startFrame && frame <= BEATS[3].endFrame;

  // Beat 4 içinde son 1.5 saniye logo kapanış CTA
  const isOutro = frame >= 630;

  return (
    <SpotlightStage aspect={aspect}>
      <CameraRig className="camera-rig w-full h-full relative">
        <div className="w-full h-full bg-[#f8fafc] text-slate-900 flex overflow-hidden">
          {/* 1. SOL DİKEY MENÜ ÇUBUĞU (SIDEBAR) */}
          <div className="w-[88px] h-full bg-white border-r border-slate-200 flex flex-col items-center py-6 justify-between shrink-0 z-30 shadow-xs">
            {/* Logo */}
            <div className="flex flex-col items-center gap-5">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-md">
                <span className="text-white font-black text-[22px] tracking-tight">O</span>
              </div>
              <button className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Plus size={24} />
              </button>
            </div>

            {/* Navigasyon İkonları */}
            <div className="flex flex-col gap-4 text-slate-400">
              <div className={`p-2.5 rounded-xl ${isBeat1 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                <FileText size={24} />
              </div>
              <div className={`p-2.5 rounded-xl ${isBeat4 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                <Layers size={24} />
              </div>
              <div className="p-2.5 rounded-xl hover:bg-slate-100">
                <Calendar size={24} />
              </div>
              <div className={`p-2.5 rounded-xl ${isBeat2 || isBeat3 ? 'bg-blue-600 text-white' : 'hover:bg-slate-100'}`}>
                <Compass size={24} />
              </div>
              <div className="p-2.5 rounded-xl hover:bg-slate-100">
                <PhoneCall size={24} />
              </div>
            </div>

            {/* Alt Profil */}
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-[18px]">
              N
            </div>
          </div>

          {/* 2. ANA ÇALIŞMA ALANI */}
          <div className="flex-1 h-full flex flex-col overflow-hidden bg-[#f8fafc]">
            {/* ÜST GLOBAL HEADER */}
            <div className="h-[74px] bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
              <div className="flex items-center gap-4 text-[18px] font-medium">
                <span className="text-slate-500 font-bold tracking-wide">GÖRÜNÜM KAYNAĞI:</span>
                <span className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-2">
                  <CheckCircle size={18} /> Tüm Portföy (Birleşik CRM) (5)
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Ana Portföyüm (5)
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium">
                  Son Arama (450)
                </span>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-[18px] font-semibold">
                  <span>250 Kredi</span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-600 text-white text-[18px] font-bold shadow-xs">
                  + Yeni Arama Başlat
                </div>
              </div>
            </div>

            {/* İÇERİK TUVALİ */}
            <div className="flex-1 p-8 relative overflow-hidden flex flex-col">
              {/* BEAT 1: MÜŞTERİ LİSTESİ & FIRSAT SKORLAMA */}
              {isBeat1 && (
                <div className="w-full h-full flex flex-col gap-6">
                  {/* 3 Metrik Kartı */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[18px] text-slate-500">
                        <span className="font-bold text-blue-600">• Büyüme Paketi</span>
                        <span>Rehber: 4.376 Firma</span>
                      </div>
                      <div className="my-2">
                        <div className="text-[18px] font-medium text-slate-500">KALAN MÜŞTERİ BULMA HAKKINIZ</div>
                        <div className="text-[44px] font-black text-slate-900 leading-none">250 Firma Kredisi</div>
                      </div>
                      <div className="text-[18px] text-blue-600 font-bold">+ Kredi Yükle</div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div className="text-[18px] text-slate-500 font-bold">İLETİŞİM & NİTELİK DAĞILIMI</div>
                      <div>
                        <div className="text-[44px] font-black text-slate-900 leading-none">30 Firma</div>
                        <div className="text-[18px] text-slate-500 font-medium mt-1">İzmir / Alsancak Taraması</div>
                      </div>
                      <div className="flex items-center gap-3 text-[18px]">
                        <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">WhatsApp</span>
                        <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">Web Eksik: 30</span>
                      </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                      <div className="text-[18px] text-slate-500 font-bold">SATIŞ FIRSATLARI & BORU HATTI</div>
                      <div>
                        <div className="text-[18px] text-slate-500 font-medium">Toplam Teklif Boru Hattı</div>
                        <div className="text-[44px] font-black text-blue-600 leading-none">₺120.000</div>
                      </div>
                      <div className="text-[18px] text-emerald-600 font-bold">Ortalama Fırsat Skoru: ⚡ 65/100</div>
                    </div>
                  </div>

                  {/* Veri Tablosu */}
                  <div className="bg-white border border-slate-200 rounded-2xl flex-1 flex flex-col overflow-hidden shadow-xs">
                    <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[18px] font-bold text-slate-600">
                      <span>FİRMA BİLGİSİ</span>
                      <span>FIRSAT SKORU</span>
                      <span>İNTERNET & SOSYAL</span>
                      <span>MÜŞTERİ PUANI</span>
                      <span>GÖRÜŞME DURUMU</span>
                      <span>İŞLEM</span>
                    </div>

                    <div className="divide-y divide-slate-100 flex-1">
                      {/* Satır 1: inn coffee */}
                      <div className="px-6 py-5 flex items-center justify-between text-[19px] hover:bg-slate-50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center">IC</div>
                          <div>
                            <div className="font-extrabold text-slate-900">inn coffee</div>
                            <div className="text-[18px] text-slate-500">Kahve dükkanı • Alsancak</div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5">
                          ⚡ 65 / 100
                        </div>
                        <span className="text-rose-600 font-semibold text-[18px]">Web Sitesi Yok</span>
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Star size={20} className="fill-amber-400 text-amber-400" /> 4.9 (118)
                        </div>
                        <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-800 font-bold text-[18px]">Yeni Aday</span>
                        <div className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[18px]">+ Portföye Ekle</div>
                      </div>

                      {/* Satır 2: Varuna Gezgin */}
                      <div className="px-6 py-5 flex items-center justify-between text-[19px] bg-blue-50/50">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 font-bold flex items-center justify-center">VG</div>
                          <div>
                            <div className="font-extrabold text-slate-900">Varuna Gezgin</div>
                            <div className="text-[18px] text-slate-500">Kafe / Restoran • Alsancak</div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-bold flex items-center gap-1.5">
                          ⚡ 65 / 100
                        </div>
                        <span className="text-rose-600 font-semibold text-[18px]">Web Sitesi Yok</span>
                        <div className="flex items-center gap-1 font-bold text-slate-800">
                          <Star size={20} className="fill-amber-400 text-amber-400" /> 4.3 (4204)
                        </div>
                        <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold text-[18px]">Hedef Firma</span>
                        <div className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[18px]">İncele & Rota</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BEAT 2: İNTERAKTİF HARİTA & PLASİYER SAHA ROTASI */}
              {isBeat2 && (
                <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-md flex flex-col bg-[#e5e9ec]">
                  {/* Harita Üst Barı */}
                  <div className="h-16 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between border-b border-slate-200 z-10">
                    <div className="flex items-center gap-3 text-[19px] font-bold text-slate-800">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Haritada 5 firma</span>
                      <span className="text-slate-400">|</span>
                      <span className="px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">İzmir / Alsancak</span>
                    </div>
                    <div className="flex items-center gap-3 text-[18px] font-medium text-slate-600">
                      <span>Yarıçap:</span>
                      <span className="px-3 py-1 rounded-md bg-blue-600 text-white font-bold">3 km</span>
                      <span className="px-3 py-1 rounded-md bg-slate-100">5 km</span>
                      <span className="px-3 py-1 rounded-md bg-slate-100">10 km</span>
                    </div>
                  </div>

                  {/* Harita SVG Zemin & Pinler */}
                  <div className="flex-1 relative">
                    <svg className="w-full h-full absolute inset-0 bg-[#e8ecef]" xmlns="http://www.w3.org/2000/svg">
                      {/* İzmir Körfezi Sahil Çizgisi */}
                      <path
                        d="M 0 0 L 420 0 C 440 320, 280 540, 200 900 L 0 900 Z"
                        fill="#cbe3f7"
                      />
                      {/* Şehir Sokak Grid Çizgileri */}
                      <g stroke="#ffffff" strokeWidth="6" opacity="0.8">
                        <line x1="300" y1="120" x2="1600" y2="120" />
                        <line x1="260" y1="280" x2="1600" y2="280" />
                        <line x1="220" y1="460" x2="1600" y2="460" />
                        <line x1="200" y1="640" x2="1600" y2="640" />
                        <line x1="600" y1="0" x2="600" y2="900" />
                        <line x1="940" y1="0" x2="940" y2="900" />
                        <line x1="1280" y1="0" x2="1280" y2="900" />
                      </g>
                      {/* Plasiyer Rota Çizgisi (Dashed Blue Line) */}
                      <path
                        d="M 520 280 Q 720 220 940 380 T 1180 520"
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="5"
                        strokeDasharray="10 8"
                      />
                    </svg>

                    {/* Harita Pinleri */}
                    <div className="absolute top-[260px] left-[500px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-black text-[18px] shadow-lg flex items-center gap-1.5">
                        <Star size={16} className="fill-white" /> 4.6
                      </div>
                      <div className="w-4 h-4 bg-emerald-600 rotate-45 -mt-2" />
                      <span className="mt-2 px-3 py-1 rounded bg-white font-extrabold text-[18px] shadow-md text-slate-900">
                        inn coffee
                      </span>
                    </div>

                    <div className="absolute top-[360px] left-[920px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="px-4 py-2 rounded-full bg-blue-600 text-white font-black text-[20px] shadow-xl flex items-center gap-1.5 scale-110 ring-4 ring-blue-300">
                        <Star size={18} className="fill-white" /> 4.3
                      </div>
                      <div className="w-4 h-4 bg-blue-600 rotate-45 -mt-2" />
                      <span className="mt-2 px-4 py-1.5 rounded-lg bg-blue-900 font-black text-[20px] shadow-lg text-white">
                        Varuna Gezgin (Hedef)
                      </span>
                    </div>

                    <div className="absolute top-[500px] left-[1160px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <div className="px-3.5 py-1.5 rounded-full bg-emerald-600 text-white font-black text-[18px] shadow-lg flex items-center gap-1.5">
                        <Star size={16} className="fill-white" /> 4.6
                      </div>
                      <div className="w-4 h-4 bg-emerald-600 rotate-45 -mt-2" />
                      <span className="mt-2 px-3 py-1 rounded bg-white font-extrabold text-[18px] shadow-md text-slate-900">
                        Buckin Coffee
                      </span>
                    </div>

                    {/* Sağ Alt Yüzen Rota Paneli */}
                    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-6 shadow-xl flex items-center gap-6">
                      <div>
                        <div className="text-[20px] font-black text-slate-900">Plasiyer Saha Rotası</div>
                        <div className="text-[18px] text-slate-500 font-medium">3 Firma Seçildi • Toplam 4.2 km</div>
                      </div>
                      <div className="px-6 py-3 rounded-xl bg-blue-600 text-white font-black text-[18px] shadow-md flex items-center gap-2">
                        Rotayı Başlat <ChevronRight size={20} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BEAT 3: MÜŞTERİ DETAY ÇEKMECESİ (SLIDEOVER DRAWER) */}
              {isBeat3 && (
                <div className="w-full h-full relative rounded-2xl overflow-hidden border border-slate-200 shadow-md flex">
                  {/* Arka Plan Buzlu Tablo */}
                  <div className="flex-1 bg-white/70 backdrop-blur-xs p-6 opacity-40 flex flex-col gap-4">
                    <div className="h-12 bg-slate-200 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-16 bg-slate-100 rounded-xl" />
                  </div>

                  {/* Sağ Çekmece Paneli */}
                  <div className="w-[680px] h-full bg-white border-l border-slate-200 p-8 flex flex-col justify-between shadow-2xl z-20">
                    <div>
                      {/* Başlık ve Rozetler */}
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[32px] font-black text-slate-900 leading-tight">Varuna Gezgin</div>
                          <div className="text-[18px] text-slate-500 font-medium flex items-center gap-2 mt-1">
                            <Building size={18} /> Kafe • Alsancak • Harita Kaydı
                          </div>
                        </div>
                        <div className="px-3.5 py-1.5 rounded-lg bg-amber-100 text-amber-800 font-black text-[19px]">
                          ⚡ 65/100 Skor
                        </div>
                      </div>

                      {/* Etiket Rozetleri */}
                      <div className="flex items-center gap-2 mt-4 text-[18px]">
                        <span className="px-3 py-1 rounded bg-slate-100 font-semibold text-slate-700">★ 4.3 (4204 Yorum)</span>
                        <span className="px-3 py-1 rounded bg-amber-50 text-amber-800 font-semibold">Yüksek Tüketim Hacmi</span>
                        <span className="px-3 py-1 rounded bg-rose-50 text-rose-700 font-bold">Web Sitesi Yok</span>
                      </div>

                      {/* Görüşme Durumu */}
                      <div className="mt-6">
                        <div className="text-[18px] font-bold text-slate-700 mb-2">Görüşme Durumu</div>
                        <div className="grid grid-cols-3 gap-2 text-[18px]">
                          <span className="py-2 text-center rounded-lg bg-amber-500 text-white font-bold">Yeni Aday</span>
                          <span className="py-2 text-center rounded-lg bg-slate-100 text-slate-600 font-medium">Ulaşıldı</span>
                          <span className="py-2 text-center rounded-lg bg-slate-100 text-slate-600 font-medium">Teklif Verildi</span>
                        </div>
                      </div>

                      {/* Teklif Tutarı ve Tür */}
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[18px] text-slate-500 font-medium">Teklif / Satış Tutarı</div>
                          <div className="text-[28px] font-black text-blue-600 mt-1">₺25.000</div>
                        </div>
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="text-[18px] text-slate-500 font-medium">Görüşme Türü</div>
                          <div className="text-[20px] font-extrabold text-slate-900 mt-1 flex items-center gap-2">
                            <PhoneCall size={20} className="text-blue-600" /> Telefon Araması
                          </div>
                        </div>
                      </div>

                      {/* Yapay Zeka Satış Argümanı Uyarısı */}
                      <div className="mt-6 p-5 rounded-xl bg-amber-50/90 border border-amber-200 flex items-start gap-4">
                        <AlertCircle size={28} className="text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-[19px] font-black text-amber-900">Otomatik Fırsat Analizi</div>
                          <div className="text-[18px] text-amber-800 font-medium leading-relaxed mt-1">
                            Bu firmanın henüz bir web sitesi yok — Web tasarım veya sosyal medya yönetimi teklif edebilirsiniz!
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 rounded-xl bg-blue-600 text-white font-black text-[20px] text-center shadow-lg">
                      Görüşmeyi Başlat & Teklifi Kaydet
                    </div>
                  </div>
                </div>
              )}

              {/* BEAT 4: KANBAN TAKİP PANOSU & CTA */}
              {isBeat4 && !isOutro && (
                <div className="w-full h-full flex flex-col gap-6">
                  {/* Kanban Header */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="text-[28px] font-black text-slate-900">Satış Takip Panosu</div>
                      <div className="text-[18px] text-slate-500 font-medium">
                        Müşteri kartlarını sütunlar arasında sürükleyerek görüşme aşamalarını yönetin.
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <div className="text-[18px] text-slate-500 font-medium">TOPLAM BORU HATTI</div>
                        <div className="text-[32px] font-black text-slate-900">₺120.000</div>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-emerald-100 text-emerald-800">
                        <div className="text-[18px] font-medium">KAZANILAN SATIŞ</div>
                        <div className="text-[32px] font-black">₺25.000</div>
                      </div>
                    </div>
                  </div>

                  {/* Kanban Kolonları */}
                  <div className="grid grid-cols-4 gap-6 flex-1">
                    {/* Kolon 1: Yeni Adaylar */}
                    <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="text-[18px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Yeni Adaylar</span>
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-center text-[16px]">2</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                        <div className="font-extrabold text-[19px] text-slate-900">İkonik Coffee</div>
                        <div className="text-[18px] text-slate-500">Alsancak • ⚡ 57 Skor</div>
                      </div>
                    </div>

                    {/* Kolon 2: Görüşüldü */}
                    <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="text-[18px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Görüşüldü</span>
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-center text-[16px]">1</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                        <div className="font-extrabold text-[19px] text-slate-900">inn coffee</div>
                        <div className="text-[18px] text-slate-500">Alsancak • ⚡ 65 Skor</div>
                      </div>
                    </div>

                    {/* Kolon 3: Teklif İletildi */}
                    <div className="bg-slate-100/70 border border-slate-200 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="text-[18px] font-bold text-slate-700 flex items-center justify-between">
                        <span>Teklif İletildi</span>
                        <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-center text-[16px]">1</span>
                      </div>
                      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
                        <div className="font-extrabold text-[19px] text-slate-900">Elle Cafe</div>
                        <div className="text-[18px] text-slate-500">₺18.000 Teklif</div>
                      </div>
                    </div>

                    {/* Kolon 4: Satış Yapıldı (Hedef Başarı) */}
                    <div className="bg-emerald-50/60 border border-emerald-300 rounded-2xl p-4 flex flex-col gap-3 ring-2 ring-emerald-400">
                      <div className="text-[18px] font-black text-emerald-800 flex items-center justify-between">
                        <span>Satış Yapıldı</span>
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white text-center text-[16px]">2</span>
                      </div>
                      {/* Taşınan Müşteri Kartı */}
                      <div className="bg-white p-5 rounded-xl shadow-md border-2 border-emerald-500">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-[20px] text-slate-900">Varuna Gezgin</span>
                          <CheckCircle size={22} className="text-emerald-500 fill-emerald-100" />
                        </div>
                        <div className="text-[18px] text-slate-600 mt-1">Web Tasarım Paketi</div>
                        <div className="mt-3 text-[24px] font-black text-emerald-600">₺25.000 Kazanıldı</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* BEAT 4 OUTRO: BÜYÜK OCTOSIFT MARKA KAPANIŞI */}
              {isOutro && (
                <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl flex flex-col items-center justify-center p-12 text-center text-white relative shadow-2xl">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-2xl mb-8">
                    <span className="text-white font-black text-[54px] tracking-tight">O</span>
                  </div>

                  <div className="text-[64px] font-black tracking-tight leading-none uppercase">
                    OCTOSIFT
                  </div>
                  <div className="text-[26px] font-medium text-slate-300 max-w-2xl mt-4 leading-relaxed">
                    B2B Potansiyel Müşteri Keşfi, Saha Satış Rotaları ve Akıllı CRM Tek Bir Platformda.
                  </div>

                  <div className="mt-8 flex items-center gap-6">
                    <div className="px-8 py-4 rounded-xl bg-blue-600 text-white font-black text-[22px] shadow-lg">
                      14 Gün Ücretsiz Deneyin
                    </div>
                    <div className="text-[20px] font-mono text-emerald-400 font-bold">
                      Kredi Kartı Gerekmez • Anında Kurulum
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CameraRig>
    </SpotlightStage>
  );
};

export default Scene;
