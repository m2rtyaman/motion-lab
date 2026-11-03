export { SpotlightStage, type SpotlightStageProps } from './SpotlightStage';
export { CameraRig, type CameraRigProps } from './CameraRig';
export { SpatialCamera, type SpatialCameraProps } from '../stage/SpatialCamera';

// Shells
export { BrowserFrame, type BrowserFrameProps } from './shells/BrowserFrame';
export { AppShell, type AppShellProps, type AppShellNavItem } from './shells/AppShell';
export { VirtualCanvas, type VirtualCanvasProps } from './shells/VirtualCanvas';

// Widgets
export {
  DataTable,
  type DataTableProps,
  type DataTableColumn,
  type DataTableRow,
} from './widgets/DataTable';
export {
  MetricCardRow,
  type MetricCardRowProps,
  type MetricCardItem,
} from './widgets/MetricCardRow';
export {
  InteractiveMap,
  type InteractiveMapProps,
  type MapPin,
  type MapRoutePoint,
} from './widgets/InteractiveMap';
export {
  SlideOverDrawer,
  type SlideOverDrawerProps,
  type DrawerBadge,
  type DrawerStatusOption,
} from './widgets/SlideOverDrawer';
export {
  CalendarGrid,
  type CalendarGridProps,
  type CalendarEvent,
} from './widgets/CalendarGrid';
export { ModalDialog, type ModalDialogProps } from './widgets/ModalDialog';
export {
  KanbanBoard,
  type KanbanBoardProps,
  type KanbanCardData,
  type KanbanColumnData,
} from './widgets/KanbanBoard';
export {
  ChartCanvas,
  type ChartCanvasProps,
  type ChartDataPoint,
} from './widgets/ChartCanvas';

// Actors & Typography
export { SimulatedCursor, type SimulatedCursorProps } from './actors/SimulatedCursor';
export { KineticHeadline, type KineticHeadlineProps } from './typography/KineticHeadline';

// Legacy / Specialized primitives
export {
  KineticText,
  type KineticTextProps,
  type KineticHighlightTone,
} from './KineticText';
export {
  SpecularCard,
  type SpecularCardProps,
  type CardAccentTone,
} from './SpecularCard';
export {
  AnimatedCounter,
  type AnimatedCounterProps,
} from './AnimatedCounter';
export { VectorDraw, type VectorDrawProps } from './VectorDraw';

export {
  TechnicalDraftingStage,
  type TechnicalDraftingStageProps,
  type DraftingGridTheme,
} from './TechnicalDraftingStage';
export {
  RoughCanvas,
  type RoughCanvasProps,
  type RoughShape,
} from './RoughCanvas';
export {
  ContainerMorph,
  type ContainerMorphProps,
  type MorphStage,
} from './ContainerMorph';
export {
  PaperTextureOverlay,
  type PaperTextureOverlayProps,
} from './PaperTextureOverlay';
export {
  ChalkboardStage,
  type ChalkboardStageProps,
} from './ChalkboardStage';
export { BackdropField, type BackdropFieldProps, type BackdropVariant } from './BackdropField';
export { TemplateFrame, type TemplateFrameProps } from './TemplateFrame';

export {
  SvgFilterLab,
  SpeechBubbleTailSVG,
  GooeyMorphGroup,
  type SvgFilterLabProps,
  type SpeechBubbleTailSVGProps,
  type GooeyMorphGroupProps,
} from './SvgFilterLab';
export {
  LayeredStage3D,
  LayerPlane,
  type LayeredStage3DProps,
  type LayerPlaneProps,
} from './LayeredStage3D';

// Opus 5.5 Archival, Forensic & Visual Investigation Primitives
export {
  LoupeMagnifier,
  type LoupeMagnifierProps,
  type LoupePoint,
} from './LoupeMagnifier';
export {
  LedgerCardStage,
  type LedgerCardStageProps,
  type LedgerEntry,
} from './LedgerCardStage';
export {
  BroadcastPackageStrap,
  type BroadcastPackageStrapProps,
} from './BroadcastPackageStrap';
export {
  CutoutPuppetStage,
  type CutoutPuppetStageProps,
  type PuppetJointAngles,
} from './CutoutPuppetStage';

// Kinetic Vector & Motion Graphics Primitives
export {
  KineticVectorStage,
  DynamicSwissGrid,
  SwissCrosshair,
  GeometricBurst,
  SwissVectorCross,
  type KineticVectorStageProps,
  type DynamicSwissGridProps,
  type SwissCrosshairProps,
  type GeometricBurstProps,
  type SwissVectorCrossProps,
} from './KineticVectorStage';

// Editorial Specimen Architectural Primitives
export {
  EDITORIAL_PALETTE,
  type EditorialSpecimenPalette,
  EditorialSpecimenStage,
  type EditorialSpecimenStageProps,
  RegistrationGrid,
  type RegistrationGridProps,
  CornerHandles,
  type CornerHandlesProps,
  AnnotationCallout,
  type AnnotationCalloutProps,
  MeasurementArc,
  type MeasurementArcProps,
  ComponentStrip,
  type ComponentStripProps,
  type ComponentStripItem,
  TypeInterlock,
  type TypeInterlockProps,
} from './EditorialSpecimenStage';

// Calm, Tactile 3D Product Editorial Primitives
export {
  TACTILE_PALETTE,
  type TactilePalette,
  TactileCapsule,
  type TactileCapsuleProps,
  CapsuleCluster,
  type CapsuleClusterProps,
  type CapsuleClusterItem,
  CurvedBrace,
  type CurvedBraceProps,
  PerspectiveDashboardSlab,
  type PerspectiveDashboardSlabProps,
  SquareConfettiBurst,
  type SquareConfettiBurstProps,
  SpotlightCone,
  type SpotlightConeProps,
} from './TactileProductStage';

// Mobile App Sting & 9:16 Pastel 3D Editorial Primitives
export {
  MOBILE_STING_PALETTE,
  PASTEL_EDITORIAL_PALETTE,
  WavyRibbon,
  type WavyRibbonProps,
  CircularApertureWipe,
  type CircularApertureWipeProps,
  TiltedPhoneStage,
  type TiltedPhoneStageProps,
  WordBurstSwap,
  type WordBurstSwapProps,
  type WordSwapItem,
  VoiceControlCard,
  type VoiceControlCardProps,
  CreatorLogPanel,
  type CreatorLogPanelProps,
  type CreatorLogItem,
  ClapperboardCTA,
  type ClapperboardCTAProps,
  WaveformPulse,
  type WaveformPulseProps,
} from './MobileStingStage';

// Papercraft Cutout & Editorial Primitives
export {
  PAPERCRAFT_PALETTE,
  JaggedPaperTear,
  type JaggedPaperTearProps,
  ObjectScatter,
  type ObjectScatterProps,
  type ObjectScatterItem,
  MetronomeGauge,
  type MetronomeGaugeProps,
  ScribbleAnchor,
  type ScribbleAnchorProps,
  PastelBubbleOcclusion,
  type PastelBubbleOcclusionProps,
  ChecklistScrubber,
  type ChecklistScrubberProps,
  type ChecklistItemData,
  PaperCard,
  type PaperCardProps,
  PapercraftCutoutStage,
  type PapercraftCutoutStageProps,
} from './PapercraftCutoutStage';

// Dark Red Audio / Equalizer Waveform Primitives (Gemini Omni Flash Paradigm)
export {
  DARK_RED_AUDIO_PALETTE,
  computeEqualizerBarHeight,
  WaveformVisualizer,
  type WaveformVisualizerProps,
  MusicPillInterface,
  type MusicPillInterfaceProps,
  SelectiveEmphasisText,
  type SelectiveEmphasisTextProps,
  EqualizerWaveformStage,
  type EqualizerWaveformStageProps,
} from './EqualizerWaveformStage';

// Structural Deconstructive Typography Primitives (Kinetic Letter Decomposition)
export {
  DECONSTRUCTIVE_MINT_PALETTE,
  IlluminatedFloorSurface,
  type IlluminatedFloorSurfaceProps,
  HorizontalGraphicSlit,
  type HorizontalGraphicSlitProps,
  DeconstructiveTypographyStage,
  type DeconstructiveTypographyStageProps,
  DeconstructiveWordAssembly,
  type DeconstructiveWordAssemblyProps,
} from './DeconstructiveTypographyStage';

// Sculptural Motion Reel Primitives (Gemini Omni Flash 10-Beat Archetype)
export {
  SCULPTURAL_REEL_PALETTE,
  ChampagneBeveledRing,
  type ChampagneBeveledRingProps,
  DiagonalGradientSweep,
  type DiagonalGradientSweepProps,
  PerspectiveDiscCascade,
  type PerspectiveDiscCascadeProps,
  PaletteGridReset,
  type PaletteGridResetProps,
  SculpturalReelStage,
  type SculpturalReelStageProps,
} from './SculpturalReelStage';

// Interactive App Promo Primitives (20-Second Dynamic Write-On & Warp Frame Archetype)
export {
  PROMO_PALETTE,
  WriteOnScript,
  type WriteOnScriptProps,
  WarpShapeFrame,
  type WarpShapeFrameProps,
  VerticalPanelReset,
  type VerticalPanelResetProps,
  InteractivePromoStage,
  type InteractivePromoStageProps,
} from './InteractivePromoStage';

// ============================================================================
// Shared Atomic Primitives & Hybrid Archetype Orchestration Layer
// ============================================================================

// Atoms
export { CapsulePill, type CapsulePillProps } from './atoms/CapsulePill';
export { KickerBadge, type KickerBadgeProps } from './atoms/KickerBadge';
export { HairlineGrid, type HairlineGridProps } from './atoms/HairlineGrid';
export { CounterValue, type CounterValueProps } from './atoms/CounterValue';
export { VerifiedCursor, type VerifiedCursorProps } from './atoms/VerifiedCursor';

// Molecules
export { TelemetryTile, type TelemetryTileProps } from './molecules/TelemetryTile';
export { CodeStreamBlock, type CodeStreamBlockProps, type CodeLineItem } from './molecules/CodeStreamBlock';
export { ProceduralWaveform, type ProceduralWaveformProps } from './molecules/WaveformVisualizer';

// Shells & Anchors
export { TerminalShell, type TerminalShellProps } from './shells/TerminalShell';
export { PrecisionDashboardShell, type PrecisionDashboardShellProps } from '../components-v5/PrecisionDashboardShell';
export { DeviceMockupStage, type DeviceMockupStageProps } from '../components-v5/DeviceMockupStage';

// Bridges & Hero Actor
export { TheHeroActor, type TheHeroActorProps } from './bridges/TheHeroActor';
export { ContainerMorphBridge, SceneSlot, type ContainerMorphBridgeProps, type SceneSlotProps } from './bridges/ContainerMorphBridge';

// Kinetic Engines
export { KineticBurstWord, type KineticBurstWordProps } from './kinetic/KineticBurstWord';
export { SculpturalRings, type SculpturalRingsProps } from './kinetic/SculpturalRings';


