/**
 * Declarative Template Library (Unified html-video & Native Remotion Engine).
 *
 * Provides typed access to all 23 templates:
 * - 1 Native Remotion template (`frame-data-rollup`)
 * - 22 Bridge HTML/CSS/GSAP templates with frame-deterministic time-driver seeking
 */

export * from './catalog';
export { DataRollup, type DataRollupProps, type DataRollupItem } from './frame-data-rollup/source/DataRollup';
