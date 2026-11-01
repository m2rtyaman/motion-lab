import React, { useRef, useLayoutEffect } from 'react';
import rough from 'roughjs';

export interface RoughShape {
  type: 'rectangle' | 'circle' | 'line' | 'ellipse' | 'polygon';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  points?: [number, number][];
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  roughness?: number;
  bowing?: number;
  fillStyle?: 'hachure' | 'solid' | 'zigzag' | 'cross-hatch' | 'dots';
}

export interface RoughCanvasProps {
  /** Çizilecek şekiller dizisi */
  shapes: RoughShape[];
  /** Deterministik rastgelelik tohumu (Varsayılan: 42) */
  seed?: number;
  /** Genişlik (Varsayılan: '100%') */
  width?: number | string;
  /** Yükseklik (Varsayılan: '100%') */
  height?: number | string;
  /** Konteyner CSS sınıfı */
  className?: string;
}

/**
 * <RoughCanvas>
 * 
 * Opus Animasyon Rehberi ilhamlı el çizimi, defter, karalama ve mimari eskiz katmanı.
 * roughjs motorunu deterministik tohum (seed) ile çalıştırarak kareler arasında
 * rastgele titreme olmaksızın organik el çizimi hissi üretir.
 */
export const RoughCanvas: React.FC<RoughCanvasProps> = ({
  shapes,
  seed = 42,
  width = '100%',
  height = '100%',
  className = 'w-full h-full pointer-events-none absolute inset-0',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Önceki çizimleri temizle
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }

    const rc = rough.svg(svg);

    shapes.forEach((s) => {
      const options = {
        seed,
        stroke: s.stroke || '#0f172a',
        fill: s.fill,
        strokeWidth: s.strokeWidth || 2,
        roughness: s.roughness ?? 1.5,
        bowing: s.bowing ?? 1,
        fillStyle: s.fillStyle || 'hachure',
      };

      let node: SVGGElement | null = null;

      switch (s.type) {
        case 'rectangle':
          if (s.x !== undefined && s.y !== undefined && s.width && s.height) {
            node = rc.rectangle(s.x, s.y, s.width, s.height, options);
          }
          break;
        case 'circle':
          if (s.x !== undefined && s.y !== undefined && s.width) {
            node = rc.circle(s.x, s.y, s.width, options);
          }
          break;
        case 'ellipse':
          if (s.x !== undefined && s.y !== undefined && s.width && s.height) {
            node = rc.ellipse(s.x, s.y, s.width, s.height, options);
          }
          break;
        case 'line':
          if (
            s.x1 !== undefined &&
            s.y1 !== undefined &&
            s.x2 !== undefined &&
            s.y2 !== undefined
          ) {
            node = rc.line(s.x1, s.y1, s.x2, s.y2, options);
          }
          break;
        case 'polygon':
          if (s.points && s.points.length > 2) {
            node = rc.polygon(s.points, options);
          }
          break;
      }

      if (node) {
        svg.appendChild(node);
      }
    });
  }, [shapes, seed]);

  return (
    <svg
      ref={svgRef}
      className={className}
      style={{ width, height }}
      xmlns="http://www.w3.org/2000/svg"
    />
  );
};
