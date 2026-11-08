/**
 * CURATED PRIMITIVES - the only primitives harness v2 scenes should import (plus `characters/RigCharacter`).
 * Every export was rendered and graded KEEP in docs/COMPONENT_GALLERY.md (thumbnails in docs/gallery/).
 * Everything else in ./index.ts is legacy and kept only for older projects.
 *
 * Widgets and shells are drawn at native web scale (labels 16 px). Wrap them in a `zoom` wrapper of 1.2 to 1.7 so the
 * text on the final 1080p frame is 18 px or larger (see docs/DESIGN_SYSTEM.md, "UI at broadcast scale").
 */

// ---- Shells: every piece of UI lives inside one of these ----
/** use for: a web app shown full-frame (light or dark window chrome with address bar). */
export { BrowserFrame, type BrowserFrameProps } from './shells/BrowserFrame';
/** use for: a SaaS dashboard with sidebar, search and header around your content. */
export { AppShell, type AppShellProps, type AppShellNavItem } from './shells/AppShell';
/** use for: CLI, build or deploy scenes (dark terminal window, mono type). */
export { TerminalShell, type TerminalShellProps } from './shells/TerminalShell';
/** use for: one big dashboard slab that can tilt and morph into the next scene. */
export { PrecisionDashboardShell, type PrecisionDashboardShellProps } from '../components-v5/PrecisionDashboardShell';
/** use for: a phone or desktop device bezel around app content. */
export { DeviceMockupStage, type DeviceMockupStageProps } from '../components-v5/DeviceMockupStage';
/** use for: a fixed-size virtual desktop that a camera can pan and zoom over. */
export { VirtualCanvas, type VirtualCanvasProps } from './shells/VirtualCanvas';

// ---- Widgets: real product anatomy inside a shell ----
/** use for: a row of 3 KPI cards (title, big number, delta). */
export { MetricCardRow, type MetricCardRowProps, type MetricCardItem } from './widgets/MetricCardRow';
/** use for: one hero chart (area, line or bar) with a headline value and delta. */
export { ChartCanvas, type ChartCanvasProps, type ChartDataPoint } from './widgets/ChartCanvas';
/** use for: a customer or transaction table with one highlighted row for the camera. */
export { DataTable, type DataTableProps, type DataTableColumn, type DataTableRow } from './widgets/DataTable';
/** use for: a sales pipeline or task board with columns of cards. */
export { KanbanBoard, type KanbanBoardProps, type KanbanCardData, type KanbanColumnData } from './widgets/KanbanBoard';
/** use for: a month picker plus a day schedule list. */
export { CalendarGrid, type CalendarGridProps, type CalendarEvent } from './widgets/CalendarGrid';
/** use for: a confirm dialog that appears over the app after a click. */
export { ModalDialog, type ModalDialogProps } from './widgets/ModalDialog';
/** use for: a detail panel that slides in from the right after a row click. */
export { SlideOverDrawer, type SlideOverDrawerProps, type DrawerBadge, type DrawerStatusOption } from './widgets/SlideOverDrawer';

// ---- Atoms and molecules ----
/** use for: a small status pill (neutral, accent, emerald, amber) with an optional pulse dot. */
export { CapsulePill, type CapsulePillProps } from './atoms/CapsulePill';
/** use for: a numbered section kicker above a headline. */
export { KickerBadge, type KickerBadgeProps } from './atoms/KickerBadge';
/** use for: a quiet hairline grid layer behind content (layer 1 depth). */
export { HairlineGrid, type HairlineGridProps } from './atoms/HairlineGrid';
/** use for: a big number that counts up on a frame range. */
export { CounterValue, type CounterValueProps } from './atoms/CounterValue';
/** use for: a count-up number with prefix, suffix and a delta badge (time-based). */
export { AnimatedCounter, type AnimatedCounterProps } from './AnimatedCounter';
/** use for: a KPI tile (label, value, delta, footer) on dark surfaces. */
export { TelemetryTile, type TelemetryTileProps } from './molecules/TelemetryTile';
/** use for: syntax-coloured code lines that stream in; put it inside TerminalShell. */
export { CodeStreamBlock, type CodeStreamBlockProps, type CodeLineItem } from './molecules/CodeStreamBlock';
/** use for: an audio waveform strip (white bars) in a voice or music scene. */
export { ProceduralWaveform, type ProceduralWaveformProps } from './molecules/WaveformVisualizer';
/** use for: a pointer that glides to a control and shows a click ripple. */
export { SimulatedCursor, type SimulatedCursorProps } from '../engine/SimulatedCursor';
/** use for: a verified-account style cursor tag (named cursor). */
export { VerifiedCursor, type VerifiedCursorProps } from './atoms/VerifiedCursor';

// ---- Type, surfaces and backgrounds ----
/** use for: a centred kicker, headline and subtitle block; `size="xl"` for broadcast scale. */
export { KineticHeadline, type KineticHeadlineProps } from './typography/KineticHeadline';
/** use for: a sentence whose words are animated one by one, with pill or colour highlights. */
export { KineticText, type KineticTextProps, type KineticHighlightTone } from './KineticText';
/** use for: one short word whose letters burst in (CTA word, brand word). */
export { KineticBurstWord, type KineticBurstWordProps } from './kinetic/KineticBurstWord';
/** use for: a dark specular card with a status bar (dark scenes only). */
export { SpecularCard, type SpecularCardProps, type CardAccentTone } from './SpecularCard';
/** use for: a dark vignette stage with optional HUD tags around centred content. */
export { SpotlightStage, type SpotlightStageProps } from './SpotlightStage';
/** use for: a themed mesh, grid, rings or rays background layer. */
export { BackdropField, type BackdropFieldProps, type BackdropVariant } from './BackdropField';

// ---- Depth, camera and continuity ----
/** use for: 3D stacked planes (z depth, specular rim, elevation shadow) with a tilted rig. */
export { LayeredStage3D, LayerPlane, type LayeredStage3DProps, type LayerPlaneProps } from './LayeredStage3D';
/** use for: a wrapper that a timeline can push, pan or roll as a camera. */
export { CameraRig, type CameraRigProps } from './CameraRig';
/** use for: a 3D camera with a cursor slot that stays aligned while the camera moves. */
export { SpatialCamera, type SpatialCameraProps } from '../stage/SpatialCamera';
/** use for: the one object that stays on screen from frame 0 to the end and morphs between scenes. */
export { TheHeroActor, type TheHeroActorProps } from './bridges/TheHeroActor';
/** use for: slots that the hero actor morphs between. */
export { ContainerMorphBridge, SceneSlot, type ContainerMorphBridgeProps, type SceneSlotProps } from './bridges/ContainerMorphBridge';
/** use for: SVG gooey and speech-bubble filters (utility, no visual of its own). */
export { SvgFilterLab, SpeechBubbleTailSVG, GooeyMorphGroup, type SvgFilterLabProps, type SpeechBubbleTailSVGProps, type GooeyMorphGroupProps } from './SvgFilterLab';

// ---- Voice-over (functional, not graded visually) ----
export {
  HarvestVoiceOver, type HarvestVoiceOverProps,
  HarvestKineticSubtitles, type HarvestKineticSubtitlesProps, type HarvestHighlightTone,
  HarvestBRollBackground, type HarvestBRollBackgroundProps,
} from '../core/harvest';
