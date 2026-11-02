/**
 * READABILITY METER & DYNAMIC HOLD CALCULATOR
 * 
 * Based on Opus 5.5 / Lemomo Visual Investigation & Printed Long Take standards:
 * Formula: (cjkChars / 4.5) + (latinWords / 15.0) + 1.5s
 * With a mandatory minimum hold of 2.5s on comparison, verdict, or telemetry screens.
 */

export interface TextUnitsCount {
  cjkChars: number;
  latinWords: number;
}

/**
 * Counts CJK characters (Chinese, Japanese, Korean) and Latin words in a text string.
 * Strips HTML tags, markdown markers, and symbols.
 * 
 * @param text The input string to measure
 * @returns Count of CJK glyphs and Latin/alphanumeric words
 */
export function countTextUnits(text: string): TextUnitsCount {
  if (!text || typeof text !== 'string') {
    return { cjkChars: 0, latinWords: 0 };
  }

  // Remove HTML tags
  const clean = text.replace(/<[^>]*>/g, ' ');

  // Match CJK Unicode ranges (CJK Unified Ideographs, Hiragana, Katakana, Hangul)
  const cjkRegex = /[\u4e00-\u9fff\u3400-\u4dbf\u3040-\u30ff\uac00-\ud7af]/g;
  const cjkMatches = clean.match(cjkRegex);
  const cjkChars = cjkMatches ? cjkMatches.length : 0;

  // Remove CJK characters to isolate latin/alphanumeric words
  const nonCjkText = clean.replace(cjkRegex, ' ');

  // Match words (Latin, Turkish, Cyrillic, accented alphabetic strings with hyphens/apostrophes)
  const wordMatches = nonCjkText.match(
    /[a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+(?:['’-][a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]+)*/g
  );
  const latinWords = wordMatches ? wordMatches.length : 0;

  return { cjkChars, latinWords };
}

/**
 * Calculates the minimum required screen hold duration (in seconds) for comfortable readability.
 * 
 * Lemomo formula:
 * duration = (cjkChars / 4.5) + (latinWords / 15.0) + 1.5s
 * 
 * Holds:
 * - Normal text: Math.max(1.5, duration)
 * - Comparison / Verdict screens: Math.max(2.5, duration)
 * 
 * @param cjkChars Number of CJK characters
 * @param latinWords Number of Latin/alphanumeric words
 * @param isComparisonOrVerdict Whether the screen presents a comparison, verdict, or high-density table
 * @returns Minimum hold time in seconds
 */
export function calculateRequiredReadingTime(
  cjkChars: number,
  latinWords: number,
  isComparisonOrVerdict: boolean = false
): number {
  const safeCjk = Number.isFinite(cjkChars) ? Math.max(0, cjkChars) : 0;
  const safeLatin = Number.isFinite(latinWords) ? Math.max(0, latinWords) : 0;
  const baseTime = (safeCjk / 4.5) + (safeLatin / 15.0) + 1.5;
  const minHold = isComparisonOrVerdict ? 2.5 : 1.5;
  const calculated = Math.max(minHold, baseTime);
  // Round to 2 decimal places for clean timeline beats
  return Math.round(calculated * 100) / 100;
}
