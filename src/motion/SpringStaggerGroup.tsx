import React from 'react';
import { useCurrentFrame, useVideoConfig, spring } from 'remotion';

export type StaggerDirection = 'up' | 'down' | 'left' | 'right' | 'scale';

export interface SpringConfig {
  mass?: number;
  damping?: number;
  stiffness?: number;
}

export interface SpringStaggerGroupProps {
  children: React.ReactNode;
  staggerFrames?: number;
  delayFrames?: number;
  springConfig?: SpringConfig;
  direction?: StaggerDirection;
  distance?: number;
  className?: string;
  itemClassName?: string;
}

const DEFAULT_SPRING: SpringConfig = {
  mass: 0.8,
  damping: 14,
  stiffness: 120,
};

export const SpringStaggerGroup: React.FC<SpringStaggerGroupProps> = ({
  children,
  staggerFrames = 3,
  delayFrames = 0,
  springConfig = DEFAULT_SPRING,
  direction = 'up',
  distance = 24,
  className = '',
  itemClassName = '',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const childArray = React.Children.toArray(children).filter(Boolean);

  return (
    <div className={className}>
      {childArray.map((child, index) => {
        const itemDelay = delayFrames + index * staggerFrames;
        const localFrame = Math.max(0, frame - itemDelay);

        const progress = spring({
          frame: localFrame,
          fps,
          config: {
            mass: springConfig.mass ?? DEFAULT_SPRING.mass,
            damping: springConfig.damping ?? DEFAULT_SPRING.damping,
            stiffness: springConfig.stiffness ?? DEFAULT_SPRING.stiffness,
          },
        });

        const opacity = Math.min(1, Math.max(0, progress));

        let transform = '';
        if (direction === 'up') {
          const translateY = (1 - progress) * distance;
          transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
        } else if (direction === 'down') {
          const translateY = -(1 - progress) * distance;
          transform = `translate3d(0, ${translateY.toFixed(2)}px, 0)`;
        } else if (direction === 'left') {
          const translateX = (1 - progress) * distance;
          transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;
        } else if (direction === 'right') {
          const translateX = -(1 - progress) * distance;
          transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;
        } else if (direction === 'scale') {
          const scale = 0.85 + progress * 0.15;
          transform = `scale(${scale.toFixed(3)})`;
        }

        return (
          <div
            key={index}
            className={itemClassName}
            style={{
              opacity,
              transform,
              willChange: 'transform, opacity',
            }}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
};
