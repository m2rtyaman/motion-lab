/**
 * Time Driver and Resource Neutralizer for deterministic Remotion iframe rendering.
 * Prevents FOUT (Flash of Unstyled Text) and black-frame rendering by neutralizing
 * blocking font links and enforcing frame-deterministic CSS/GSAP seeking.
 */

type GsapTimeline = { pause: () => void; time: (s?: number) => unknown };
export type GsapWindow = Window & { gsap?: { globalTimeline?: GsapTimeline } };

/**
 * Make an HTML frame safe to render inside Remotion's headless Chromium iframe.
 *
 * A render-blocking external `<link rel="stylesheet">` (e.g. Google Fonts) keeps
 * the iframe's render tree from painting until the stylesheet resolves. In the
 * headless render environment that request can be slow or offline, so it never
 * resolves and Remotion screenshots a fully black frame.
 *
 * We convert blocking external stylesheet links into non-blocking async loads
 * (media="print" + onload swap). Paint is never blocked, and fonts apply when ready.
 */
export function neutralizeBlockingResources(html: string): string {
  return html.replace(
    /<link\b[^>]*\brel=(["']?)stylesheet\1[^>]*>/gi,
    (tag) => {
      // Only neutralize links to an external origin (http/https/protocol-relative)
      if (!/\bhref=(["'])(?:https?:)?\/\//i.test(tag)) return tag;
      if (/\bmedia=/i.test(tag)) return tag; // already has media handling
      return tag.replace(
        /\s*\/?>$/,
        ` media="print" onload="this.media='all'">`,
      );
    },
  );
}

/**
 * Checks if the iframe document is fully ready for deterministic seek + screenshot:
 * 1. Content is parsed (body has content or animations exist).
 * 2. Web fonts / external stylesheets have settled (fonts.status !== 'loading').
 */
export function isDocumentReady(doc: Document | undefined, win?: Window | undefined): boolean {
  if (!doc || !doc.body) return false;
  const hasAnims = (doc.getAnimations?.()?.length ?? 0) > 0;
  const hasBody = doc.body.innerHTML.trim().length > 0;
  const hasTimelines = Boolean((win as any)?.__timelines && Object.keys((win as any).__timelines).length > 0);
  if (!hasAnims && !hasBody && !hasTimelines) return false;

  const fontsLoaded = (doc as Document & { fonts?: FontFaceSet }).fonts?.status !== 'loading';
  return fontsLoaded;
}

/**
 * Synchronize all CSS Web Animations and GSAP Timelines to the exact frame time.
 */
export function seekDocumentAnimations(
  doc: Document | null | undefined,
  win: Window | null | undefined,
  timeMs: number,
): void {
  if (!doc || !win) return;

  // (A) CSS Animations / Web Animations API
  try {
    const anims = (doc.getAnimations?.() ?? []) as Animation[];
    for (const a of anims) {
      try {
        a.pause();
        a.currentTime = timeMs;
      } catch {
        // finished or idle animations can reject currentTime, safe to ignore
      }
    }
  } catch {
    // getAnimations unsupported or restricted
  }

  // (B) GSAP Global Timeline & Registered Compositions (RFC-08 §3.2)
  try {
    const timeSec = timeMs / 1000;
    const gsapWin = win as GsapWindow & {
      __timelines?: Record<string, { pause?: () => void; time?: (t: number) => unknown }>;
    };

    const globalTl = gsapWin.gsap?.globalTimeline;
    if (globalTl) {
      globalTl.pause();
      globalTl.time(timeSec);
    }

    if (gsapWin.__timelines && typeof gsapWin.__timelines === 'object') {
      for (const key of Object.keys(gsapWin.__timelines)) {
        const tl = gsapWin.__timelines[key];
        if (tl && typeof tl.pause === 'function') {
          tl.pause();
          if (typeof tl.time === 'function') {
            tl.time(timeSec);
          }
        }
      }
    }
  } catch {
    // no GSAP present
  }
}
