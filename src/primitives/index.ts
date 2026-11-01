export { SpotlightStage, type SpotlightStageProps } from './SpotlightStage';
export { CameraRig, type CameraRigProps } from './CameraRig';
export { SpatialCamera, type SpatialCameraProps } from '../stage/SpatialCamera';

// Shells
export { BrowserFrame, type BrowserFrameProps } from './shells/BrowserFrame';
export { AppShell, type AppShellProps, type AppShellNavItem } from './shells/AppShell';

// Widgets
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

// Actors
export { SimulatedCursor, type SimulatedCursorProps } from './actors/SimulatedCursor';

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
