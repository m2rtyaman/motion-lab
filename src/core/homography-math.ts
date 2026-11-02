/**
 * HOMOGRAPHY MATHEMATICS & PERSPECTIVE PLANAR SOLVER
 * 
 * Based on Opus 5.5 Sports Telestrator & Forensic Reconstruction:
 * Solves 4-point projective homography matrices H mapping source plane (e.g. pitch markers,
 * tilted document corners, or perspective screen bounds) to destination plane (orthographic board).
 */
import type { Point2D } from './bezier-trajectories.ts';
export type { Point2D };

/**
 * Computes a 3x3 projective transformation matrix H (normalized with H[8] = 1.0)
 * mapping 4 source points to 4 destination points.
 * 
 * Solves the 8x8 linear equation system via Gaussian elimination with partial pivoting.
 * 
 * @param srcPts Array of 4 source points [{x, y}, ...]
 * @param dstPts Array of 4 destination points [{x, y}, ...]
 * @returns 9-element array representing row-major 3x3 matrix [h00, h01, h02, h10, h11, h12, h20, h21, h22]
 */
export function computeHomography(srcPts: Point2D[], dstPts: Point2D[]): number[] {
  if (srcPts.length < 4 || dstPts.length < 4) {
    throw new Error('computeHomography requires at least 4 source and 4 destination points.');
  }

  // Construct 8x8 matrix A and 8x1 vector B for: A * h = B
  const A: number[][] = [];
  const B: number[] = [];

  for (let i = 0; i < 4; i++) {
    const { x, y } = srcPts[i];
    const { x: u, y: v } = dstPts[i];

    // Row 2*i:   x, y, 1, 0, 0, 0, -u*x, -u*y = u
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    B.push(u);

    // Row 2*i+1: 0, 0, 0, x, y, 1, -v*x, -v*y = v
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    B.push(v);
  }

  // Gaussian elimination with partial pivoting
  const n = 8;
  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      const val = Math.abs(A[r][col]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = r;
      }
    }

    if (maxVal < 1e-12) {
      throw new Error('Singular or degenerate point configuration in computeHomography.');
    }

    // Swap rows
    if (maxRow !== col) {
      const tempRow = A[col];
      A[col] = A[maxRow];
      A[maxRow] = tempRow;

      const tempB = B[col];
      B[col] = B[maxRow];
      B[maxRow] = tempB;
    }

    // Eliminate below
    const pivot = A[col][col];
    for (let r = col + 1; r < n; r++) {
      const factor = A[r][col] / pivot;
      for (let c = col; c < n; c++) {
        A[r][c] -= factor * A[col][c];
      }
      B[r] -= factor * B[col];
    }
  }

  // Back-substitution
  const h = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let sum = B[r];
    for (let c = r + 1; c < n; c++) {
      sum -= A[r][c] * h[c];
    }
    h[r] = sum / A[r][r];
  }

  // Return full 3x3 row-major homography matrix with h22 = 1.0
  return [
    h[0], h[1], h[2],
    h[3], h[4], h[5],
    h[6], h[7], 1.0,
  ];
}

/**
 * Applies a 3x3 homography matrix to transform a 2D point (x, y).
 * 
 * [u', v', w']^T = H * [x, y, 1]^T
 * u = u' / w', v = v' / w'
 * 
 * @param H 9-element array [h00..h22] or 3x3 nested array
 * @param x Input X coordinate
 * @param y Input Y coordinate
 * @returns Transformed Point2D {x, y}
 */
export function applyHomography(
  H: number[] | number[][],
  x: number,
  y: number
): Point2D {
  if (!H || !Array.isArray(H) || !Number.isFinite(x) || !Number.isFinite(y)) {
    return { x: 0, y: 0 };
  }

  const flatH = Array.isArray(H[0]) ? (H as number[][]).flat() : (H as number[]);
  if (flatH.length < 9) {
    return { x: 0, y: 0 };
  }

  const h00 = flatH[0], h01 = flatH[1], h02 = flatH[2];
  const h10 = flatH[3], h11 = flatH[4], h12 = flatH[5];
  const h20 = flatH[6], h21 = flatH[7], h22 = flatH[8];

  const w = h20 * x + h21 * y + h22;
  if (Math.abs(w) < 1e-12) {
    return { x: 0, y: 0 };
  }

  return {
    x: (h00 * x + h01 * y + h02) / w,
    y: (h10 * x + h11 * y + h12) / w,
  };
}

/**
 * Converts a 3x3 2D homography matrix into a CSS 4x4 matrix3d string
 * for GPU-accelerated perspective rendering in CSS styles.
 */
export function homographyToCssMatrix3d(H: number[]): string {
  if (!H || !Array.isArray(H) || H.length < 9) {
    return 'matrix3d(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1)';
  }

  // CSS matrix3d is column-major:
  // [ m00, m10, m20, m30,
  //   m01, m11, m21, m31,
  //   m02, m12, m22, m32,
  //   m03, m13, m23, m33 ]
  const [h00, h01, h02, h10, h11, h12, h20, h21, h22] = H;

  const m = [
    h00, h10, 0, h20,
    h01, h11, 0, h21,
    0,   0,   1, 0,
    h02, h12, 0, h22,
  ];

  return `matrix3d(${m.map((v) => Number(v.toFixed(6))).join(',')})`;
}
