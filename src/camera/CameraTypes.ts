export type CameraEasing = 'power3.out' | 'power2.inOut' | 'expo.inOut' | 'spring';

export interface CameraKeyframe {
  frame: number;
  /**
   * Kameranın odaklandığı kanvas X ofseti (px)
   */
  x?: number;
  /**
   * Kameranın odaklandığı kanvas Y ofseti (px)
   */
  y?: number;
  /**
   * Zoom / ölçek (1.0 = normal, 2.5 = makro yakın çekim, 0.7 = geniş açı)
   */
  scale?: number;
  /**
   * 3D Perspektif eğimleri (derece)
   */
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  /**
   * Odak dışı alan derinliği bulanıklığı (px)
   */
  dofBlur?: number;
  /**
   * Odaklanan hedef bileşen etiketi / id
   */
  focalTarget?: string;
  easing?: CameraEasing;
}

export interface CameraState {
  x: number;
  y: number;
  scale: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  dofBlur: number;
  focalTarget?: string;
}

export interface StoryboardBeat {
  beatId: string;
  startFrame: number;
  endFrame: number;
  title: string;
  cameraMove: string;
  transitionType: 'spatial-camera-glide' | 'morph-container' | 'whip-pan' | 'focus-rack';
  canvasRegion: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  cameraKeyframe: CameraKeyframe;
  focalPoint?: {
    targetSelector?: string;
    backgroundBlurPx?: number;
    vignetteOpacity?: number;
  };
}

export interface StoryboardContract {
  projectSlug: string;
  canvasSize: {
    width: number;
    height: number;
  };
  beats: StoryboardBeat[];
}
