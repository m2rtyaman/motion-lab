import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCurrentFrame, useVideoConfig, delayRender, continueRender } from 'remotion';
import { isDocumentReady, seekDocumentAnimations, neutralizeBlockingResources } from '../core/time-driver';

export interface HtmlFrameDriverProps {
  /** The HTML frame source string or template markup */
  html: string;
  width?: number;
  height?: number;
  /** Optional theme CSS variables to inject into :root */
  themeVariables?: Record<string, string>;
  style?: React.CSSProperties;
  className?: string;
}

function frameDoc(iframe: HTMLIFrameElement | null): Document | undefined {
  try {
    return iframe?.contentWindow?.document ?? undefined;
  } catch {
    return undefined;
  }
}

export const HtmlFrameDriver: React.FC<HtmlFrameDriverProps> = ({
  html,
  width = 1920,
  height = 1080,
  themeVariables,
  style,
  className,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const tMs = (frame / fps) * 1000;

  // Process HTML: neutralize blocking link stylesheets & inject theme variables if provided
  const preparedHtml = React.useMemo(() => {
    let out = neutralizeBlockingResources(html);
    if (themeVariables && Object.keys(themeVariables).length > 0) {
      const vars = Object.entries(themeVariables)
        .map(([k, v]) => `${k.startsWith('--') ? k : `--${k}`}: ${v};`)
        .join(' ');
      const styleTag = `<style id="injected-theme">:root { ${vars} }</style>`;
      if (out.includes('</head>')) {
        out = out.replace('</head>', `${styleTag}</head>`);
      } else {
        out = `${styleTag}${out}`;
      }
    }
    return out;
  }, [html, themeVariables]);

  const seek = useCallback((timeMs: number) => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    const doc = frameDoc(iframe);
    seekDocumentAnimations(doc, win, timeMs);
  }, []);

  const [handle] = useState(() => delayRender('HTML frame seek @0ms'));
  const firstClearedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const h = firstClearedRef.current
      ? delayRender(`HTML frame seek @${Math.round(tMs)}ms`)
      : handle;
    let tries = 0;

    const finish = () => {
      if (cancelled) return;
      seek(tMs);
      requestAnimationFrame(() => {
        if (cancelled) return;
        firstClearedRef.current = true;
        continueRender(h);
      });
    };

    const tick = () => {
      if (cancelled) return;
      const iframe = iframeRef.current;
      const doc = frameDoc(iframe);
      const win = iframe?.contentWindow ?? undefined;
      if (isDocumentReady(doc, win) || tries++ >= 200) {
        finish();
      } else {
        setTimeout(tick, 25);
      }
    };

    tick();

    return () => {
      cancelled = true;
    };
  }, [tMs, seek, handle]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={preparedHtml}
      width={width}
      height={height}
      className={className}
      sandbox="allow-same-origin allow-scripts"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        display: 'block',
        pointerEvents: 'none',
        ...style,
      }}
      title="HTML Frame Driver"
    />
  );
};
