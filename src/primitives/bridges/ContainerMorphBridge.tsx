import type { FC, ReactNode } from 'react';

export interface SceneSlotProps {
  id: string;
  active: boolean;
  children: ReactNode;
  className?: string;
}

export const SceneSlot: FC<SceneSlotProps> = ({
  id,
  active,
  children,
  className = '',
}) => {
  return (
    <div
      id={id}
      className={`scene-slot absolute inset-0 flex items-center justify-center transition-none ${className}`}
      style={{
        pointerEvents: active ? 'auto' : 'none',
        visibility: active ? 'visible' : 'hidden',
      }}
    >
      {children}
    </div>
  );
};

export interface ContainerMorphBridgeProps {
  id?: string;
  className?: string;
  children: ReactNode;
  aspect?: '16:9' | '9:16';
}

/**
 * ContainerMorphBridge:
 * Çoklu şablon/arketip sahnelerini tek bir fiziksel tuval üzerinde toplayıp,
 * donanım kabukları veya kinetik tuval katmanları arasında kesintisiz devir teslim sağlayan köprü taşıyıcı.
 */
export const ContainerMorphBridge: FC<ContainerMorphBridgeProps> = ({
  id = 'morph-bridge',
  className = '',
  children,
}) => {
  return (
    <div
      id={id}
      className={`relative w-full h-full overflow-hidden flex items-center justify-center select-none ${className}`}
    >
      {children}
    </div>
  );
};
