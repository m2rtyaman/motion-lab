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

// 3D Hybrid & Kinetic Primitives (v6 Engine Gold Reference Additions)
export {
  InstancedPinGrid3D,
  type InstancedPinGrid3DProps,
} from './InstancedPinGrid3D';
export {
  LiquidChromeTorus3D,
  type LiquidChromeTorus3DProps,
  type ChromeGeometryType,
} from './LiquidChromeTorus3D';
export {
  MobiusTypeRibbon3D,
  type MobiusTypeRibbon3DProps,
} from './MobiusTypeRibbon3D';
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
  SplineCamera3D,
  type SplineCamera3DProps,
} from './SplineCamera3D';
export {
  TesseractWireframe3D,
  type TesseractWireframe3DProps,
} from './TesseractWireframe3D';
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
