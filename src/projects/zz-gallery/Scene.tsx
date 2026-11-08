import { type FC, type ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { useRemotionGSAP } from '../../core/useRemotionGSAP';
import { beat, enter, holdFinal } from '../../core/presets';
import { getTheme } from '../../core/theme-contract';
import {
  AppShell, BackdropField, BrowserFrame, ChartCanvas, DataTable, DeviceMockupStage, KanbanBoard, CalendarGrid,
  InteractiveMap, ModalDialog, SlideOverDrawer, MetricCardRow, SimulatedCursor, SpecularCard, TerminalShell,
  PrecisionDashboardShell, CapsulePill, KickerBadge, TelemetryTile, CodeStreamBlock, HairlineGrid, ProceduralWaveform,
  CounterValue, AnimatedCounter, KineticHeadline, KineticText, KineticBurstWord, SpotlightStage, BroadcastPackageStrap,
  TactileCapsule, CapsuleCluster, MetronomeGauge, WaveformVisualizer, MusicPillInterface, VoiceControlCard, WordBurstSwap,
  LayeredStage3D, LayerPlane, LoupeMagnifier, LedgerCardStage, TechnicalDraftingStage,
} from '../../primitives';
import manifest from './manifest.json';

const light = getTheme('light');
const dark = getTheme('dark');

const CHART = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'].map((label, i) => ({ label, value: [34, 52, 47, 71, 66, 88][i] }));
const ROWS = [
  { id: 'r1', name: 'Northwind Studio', plan: 'Team', mrr: '$1,240', score: '92' },
  { id: 'r2', name: 'Alder & Finch', plan: 'Business', mrr: '$3,860', score: '88' },
  { id: 'r3', name: 'Kite Labs', plan: 'Team', mrr: '$960', score: '74' },
  { id: 'r4', name: 'Marlow Dental', plan: 'Starter', mrr: '$420', score: '61' },
];
const COLS = [
  { key: 'name', label: 'Account' }, { key: 'plan', label: 'Plan' },
  { key: 'mrr', label: 'MRR', align: 'right' as const }, { key: 'score', label: 'Score', align: 'right' as const },
];
const KANBAN = [
  { id: 'new', title: 'New', count: 3, cards: [{ id: 'a', title: 'Northwind Studio', subtitle: 'Brand refresh', amount: '$12,400' }, { id: 'b', title: 'Kite Labs', subtitle: 'Onboarding', amount: '$4,800' }] },
  { id: 'prop', title: 'Proposal', count: 2, cards: [{ id: 'c', title: 'Alder & Finch', subtitle: 'Annual plan', amount: '$38,600' }] },
  { id: 'won', title: 'Won', count: 4, cards: [{ id: 'd', title: 'Marlow Dental', subtitle: 'Renewal', amount: '$5,200' }] },
];
const CODE = [
  { number: 1, tokens: [{ text: 'const ', color: '#c084fc' }, { text: 'total', color: '#fafafa' }, { text: ' = ', color: '#a1a1aa' }, { text: 'sum(rows)', color: '#7dd3fc' }] },
  { number: 2, tokens: [{ text: 'await ', color: '#c084fc' }, { text: 'reconcile(total)', color: '#7dd3fc' }] },
  { number: 3, tokens: [{ text: '// 214 matched', color: '#71717a' }] },
];

const Cap: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="mb-[6px] text-[20px] font-semibold text-zinc-400">{children}</div>
);

const render = (id: string): ReactNode => {
  switch (id) {
    case 'BrowserFrame':
      return <BrowserFrame theme={light} url="app.tallybook.example/october" title="Tallybook"><div className="px-8 pt-6"><div className="text-[40px] font-bold">October close</div><div className="text-[24px] text-slate-600">214 transactions matched</div></div></BrowserFrame>;
    case 'AppShell':
      return <AppShell theme={dark} brandName="Tallybook" headerTitle="Overview" headerSubtitle="October"><div className="p-8 text-[28px] font-bold">Reconciled today</div></AppShell>;
    case 'TerminalShell':
      return <div className="p-6 h-full"><TerminalShell title="deploy" path="~/tallybook"><CodeStreamBlock lines={CODE} promptPath="~/tallybook" /></TerminalShell></div>;
    case 'PrecisionDashboardShell':
      return <div className="p-6 h-full"><PrecisionDashboardShell title="Revenue" subtitle="October" statusBadge="Live" width="100%" height="100%"><div className="p-6 text-[28px] font-bold">$84.2k cleared</div></PrecisionDashboardShell></div>;
    case 'MetricCardRow':
      return <div className="p-4"><MetricCardRow theme={light} cards={[
        { id: 'cash', title: 'Cash cleared', badge: 'Oct', value: '$84.2k', subtitle: '+12.4% vs Sep' },
        { id: 'open', title: 'Open items', badge: 'Live', value: '38', subtitle: '12 need review' },
        { id: 'days', title: 'Days to close', badge: 'Goal 3', value: '2.4', subtitle: 'down from 6' }]} /></div>;
    case 'ChartCanvas':
      return <div className="p-4"><ChartCanvas theme={light} title="Weekly deposits" badge="Weekly" value="$84.2k" change="+12.4%" data={CHART} height={200} /></div>;
    case 'DataTable':
      return <div className="p-4"><DataTable theme={light} columns={COLS} rows={ROWS} highlightedRowIndex={1} /></div>;
    case 'KanbanBoard':
      return <KanbanBoard theme={light} boardTitle="Pipeline" boardSubtitle="Q4" columns={KANBAN} />;
    case 'CalendarGrid':
      return <CalendarGrid theme={light} monthTitle="October" selectedDay={14} events={[{ id: 'e1', time: '10:00', title: 'Client review', client: 'Northwind' }]} />;
    case 'InteractiveMap':
      return <InteractiveMap theme={light} pins={[{ id: 'p1', x: 30, y: 40, label: 'Depot', active: true }, { id: 'p2', x: 68, y: 62, label: 'Stop 2' }]} route={[{ x: 30, y: 40 }, { x: 50, y: 52 }, { x: 68, y: 62 }]} routeProgress={1} />;
    case 'ModalDialog':
      return <div className="relative h-full" style={{ backgroundColor: light.colors.bgPrimary }}><ModalDialog isOpen theme={light} title="Reconcile all?" subtitle="214 transactions will be matched." footerSlot={<div className="px-6 py-3 text-[18px] font-bold">Confirm</div>}><div className="text-[18px]">Review changes before closing.</div></ModalDialog></div>;
    case 'SlideOverDrawer':
      return <div className="relative h-full" style={{ backgroundColor: light.colors.bgPrimary }}><SlideOverDrawer isOpen theme={light} title="Northwind Studio" subtitle="Team plan" badges={[{ label: 'Active', variant: 'subtle' }]} statusOptions={[{ id: 's1', label: 'Open', active: true }, { id: 's2', label: 'Won' }]}><div className="text-[18px]">MRR $1,240</div></SlideOverDrawer></div>;
    case 'DeviceMockupStage':
      return <div className="relative h-full flex items-center justify-center"><DeviceMockupStage deviceType="mobile" title="Tallybook" width={260} height={380}><div className="p-4 text-[18px] font-bold">Close the month</div></DeviceMockupStage><SimulatedCursor x={540} y={250} color={dark.colors.textPrimary} /></div>;
    case 'SpecularCard':
      return <div className="p-8 grid grid-cols-2 gap-6 h-full" style={{ background: '#09090b' }}><SpecularCard accent="emerald"><div className="p-6 text-[28px] font-bold text-white">Reconciled</div></SpecularCard><SpecularCard tone="muted" accent="amber" cornerTicks><div className="p-6 text-[28px] font-bold text-white">Needs review</div></SpecularCard></div>;
    case 'CapsulePill':
      return <div className="p-6 flex flex-wrap items-center gap-4"><CapsulePill label="Neutral" /><CapsulePill label="Accent" tone="accent" /><CapsulePill label="Matched" tone="emerald" pulseDot /><CapsulePill label="Review" tone="amber" /><KickerBadge text="Step" stepNumber="01" /></div>;
    case 'TelemetryTile':
      return <div className="p-6 w-[520px]"><TelemetryTile title="Net revenue" value="84.2" unit="k" change="+12.4%" trend="up" footerNote="vs September" /></div>;
    case 'CounterValue':
      return <div className="p-6 flex items-end gap-10 text-white"><div className="text-[64px] font-black"><CounterValue value={214} /></div><div className="text-[64px] font-black"><AnimatedCounter to={98} startAtSec={0} durationSec={0.01} suffix="%" /></div></div>;
    case 'CodeStreamBlock':
      return <div className="p-6"><CodeStreamBlock lines={CODE} promptPath="~/tallybook" /></div>;
    case 'HairlineGrid':
      return <div className="relative h-full"><HairlineGrid spacing={64} opacity={0.5} showCrosses /></div>;
    case 'ProceduralWaveform':
      return <div className="p-8 text-white"><ProceduralWaveform barCount={40} height={120} frame={30} color="bg-white/80" /></div>;
    case 'KineticHeadline':
      return <div className="relative h-full" style={{ backgroundColor: light.colors.bgPrimary }}><KineticHeadline theme={light} tag="New" title="Close the month before lunch." subtitle="Match every transaction in one click." headlineClassName="gal-headline" size="xl" /></div>;
    case 'KineticText':
      return <div className="p-8 text-white flex flex-col gap-6"><KineticText text="One click closes the month" wordClassName="gal-word" variant="title" highlights={{ month: 'pill' }} /><KineticBurstWord text="Done" className="text-[120px] text-white" /></div>;
    case 'SpotlightStage':
      return <SpotlightStage aspect="16:9" theme={dark} hudTagLeft="Gallery" clean><div className="flex h-full items-center justify-center text-[96px] font-black text-white">Spotlight</div></SpotlightStage>;
    case 'BackdropField':
      return <div className="grid grid-cols-2 h-full">{(['mesh', 'grid', 'rings', 'rays'] as const).map((v) => <div key={v} className="relative overflow-hidden" style={{ backgroundColor: v === 'grid' || v === 'rays' ? '#09090b' : '#f8fafc' }}><BackdropField theme={v === 'grid' || v === 'rays' ? dark : light} variant={v} intensity={0.8} /><div className="relative p-4 text-[24px] font-bold" style={{ color: v === 'grid' || v === 'rays' ? '#fafafa' : '#0f172a' }}>{v}</div></div>)}</div>;
    case 'BroadcastPackageStrap':
      return <div className="relative h-full bg-zinc-900"><div className="absolute bottom-[160px] left-[120px] right-[120px]"><BroadcastPackageStrap headline="Ledger shows 214 matched entries" subline="Reviewed by the finance desk" progress={1} /></div></div>;
    case 'TactileCapsule':
      return <div className="p-8 flex flex-col gap-6" style={{ background: '#f4f1ea' }}><div className="flex gap-4"><TactileCapsule label="Cash" value="$84k" progress={1} /><TactileCapsule label="Open" value={38} progress={1} active /></div><CapsuleCluster progress={1} items={[{ id: '1', label: 'Invoices' }, { id: '2', label: 'Payroll', active: true }, { id: '3', label: 'Tax' }]} /></div>;
    case 'MetronomeGauge':
      return <div className="p-6 flex gap-6 items-center" style={{ background: '#1a0a0c' }}><MetronomeGauge frame={20} size={220} label="Tempo" /><WaveformVisualizer width={260} height={120} frame={30} /><MusicPillInterface title="Night drive" subtitle="Track 04" progress={0.4} frame={30} /></div>;
    case 'MobileStingStage':
      return <div className="p-6 flex gap-6 items-center" style={{ background: '#e8e4f3' }}><VoiceControlCard title="Voice" languagePrompt="Say something" waveProgress={0.6} /><WordBurstSwap words={[{ text: 'Create' }, { text: 'Share' }]} activeIndex={0} popProgress={1} /></div>;
    case 'LayeredStage3D':
      return <div className="h-full" style={{ background: '#09090b' }}><LayeredStage3D rotateX={52} rotateZ={-24} scale={0.9}><LayerPlane z={0} specularRim><div className="w-[480px] h-[300px] p-6 text-[28px] font-bold text-white" style={{ background: '#1c1c22' }}>Plane z0</div></LayerPlane><LayerPlane z={90} elevationShadow specularRim><div className="w-[300px] h-[160px] p-6 text-[28px] font-bold text-white" style={{ background: '#27272f' }}>Plane z90</div></LayerPlane></LayeredStage3D></div>;
    case 'LoupeMagnifier':
      return <div className="relative h-full" style={{ background: light.colors.bgPrimary }}><LoupeMagnifier target={{ x: 300, y: 230 }} loupeCenter={{ x: 620, y: 200 }} progress={1} label="Mismatch"><div className="p-10 text-[32px] font-bold text-slate-900">Invoice 4821 shows $1,240.00 but bank says $1,204.00</div></LoupeMagnifier></div>;
    case 'LedgerCardStage':
      return <LedgerCardStage title="General ledger" ledgerCode="GL-204" date="Oct 2026" entries={[{ date: '10/02', description: 'Office rent', amount: '-1,800' }, { date: '10/05', description: 'Client payment', amount: '+4,200' }]} activeRowIndex={1} />;
    case 'TechnicalDraftingStage':
      return <TechnicalDraftingStage sectionIndex={1} sectionTotal={4} sectionTag="Spec" headline="Tolerance 0.02" subheadline="Drafting stage" />;
    default:
      return <div>{id}</div>;
  }
};

const LIGHT_BG = new Set(['BrowserFrame', 'MetricCardRow', 'ChartCanvas', 'DataTable', 'KanbanBoard', 'CalendarGrid', 'InteractiveMap', 'ModalDialog', 'SlideOverDrawer', 'KineticHeadline', 'LoupeMagnifier']);
const STARTS = [0, 1.2, 2.6, 3.8, 5.0, 6.4, 7.6, 8.9];

export const buildTimeline = (tl: gsap.core.Timeline) => {
  STARTS.forEach((s, i) => {
    tl.set(`.page-${i}`, { autoAlpha: i === 0 ? 1 : 0 }, 0);
    if (i > 0) {
      tl.set(`.page-${i - 1}`, { autoAlpha: 0 }, s);
      tl.set(`.page-${i}`, { autoAlpha: 1 }, s);
    }
    beat(tl, `p${i}`, s);
    enter(tl, `.page-${i} .gal-tile`, 'rise', s + 0.02);
  });
  holdFinal(tl, 9.8, 1.2);
  return tl;
};

export const Scene: FC = () => {
  useRemotionGSAP(buildTimeline);
  return (
    <AbsoluteFill style={{ backgroundColor: '#0b0b0f', color: '#fafafa' }}>
      {manifest.pages.map((name, pi) => (
        <div key={name} className={`page-${pi} absolute inset-0`} style={{ opacity: pi === 0 ? 1 : 0 }}>
          <div className="absolute left-[50px] top-[6px] text-[28px] font-bold">Component gallery - {name}</div>
          {manifest.tiles.filter((t) => t.page === pi).map((t) => (
            <div key={t.id} className="gal-tile absolute" style={{ left: t.x, top: t.y - 36, width: t.w }}>
              <Cap>{t.label}</Cap>
              <div className="relative overflow-hidden rounded-2xl" style={{ width: t.w, height: t.h, backgroundColor: LIGHT_BG.has(t.id) ? '#e5e7eb' : '#09090b' }}>
                <div style={{ width: t.w / t.zoom, height: t.h / t.zoom, zoom: t.zoom, color: LIGHT_BG.has(t.id) ? '#0f172a' : '#fafafa' }} className="relative">
                  {render(t.id)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

export default Scene;
