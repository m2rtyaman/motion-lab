import React, { useState, useRef, useCallback } from 'react';

/**
 * TARAYICI İÇİ HIZLI KAYIT VE WEBM DIŞA AKTARICI
 * (Opus 5.5 Master Rehber — Sayfa 2, MP4'e Nasıl Çevrilir: Yol 2)
 * 
 * "Sayfaya bir Kaydet düğmesi ekle, canvas'ı MediaRecorder ile WebM olarak indirsin.
 * Ekran kaydından temizdir."
 */

export interface CanvasRecorderOptions {
  /** Kayıt kare hızı (Varsayılan: 60) */
  fps?: number;
  /** Video veri hızı (Varsayılan: 8_000_000 bps = 8 Mbps) */
  videoBitsPerSecond?: number;
  /** Desteklenen MIME türü (Varsayılan: 'video/webm;codecs=vp9' veya 'video/webm') */
  mimeType?: string;
}

export interface CanvasRecorderSession {
  /** Kaydı durdurup bitmiş Blob nesnesini döndürür */
  stop: () => Promise<Blob>;
  /** Kaydı durdurup tarayıcı üzerinden dosya indirme işlemini başlatır */
  download: (filename?: string) => Promise<void>;
}

/**
 * HTMLCanvasElement üzerinden doğrudan MediaRecorder başlatır.
 */
export function startCanvasRecorder(
  canvas: HTMLCanvasElement,
  options: CanvasRecorderOptions = {}
): CanvasRecorderSession {
  const { fps = 60, videoBitsPerSecond = 8_000_000 } = options;

  let mimeType = options.mimeType;
  if (!mimeType) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
      mimeType = 'video/webm;codecs=vp9';
    } else {
      mimeType = 'video/webm';
    }
  }

  const stream = canvas.captureStream(fps);
  const recorder = new MediaRecorder(stream, {
    mimeType,
    videoBitsPerSecond,
  });

  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  recorder.start(100); // 100ms parçalar

  const stopPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const fullBlob = new Blob(chunks, { type: mimeType });
      resolve(fullBlob);
    };
  });

  return {
    stop: async () => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      return stopPromise;
    },
    download: async (filename = 'motion-export.webm') => {
      if (recorder.state !== 'inactive') {
        recorder.stop();
      }
      const blob = await stopPromise;
      triggerBlobDownload(blob, filename);
    },
  };
}

/**
 * Üretilen video Blob'unu kullanıcı bilgisayarına .webm olarak indirir
 */
export function triggerBlobDownload(blob: Blob, filename = 'motion-export.webm'): void {
  if (typeof window === 'undefined') return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * React bileşenleri için tek tuşla hızlı kayıt kancası
 */
export function useCanvasRecorder(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  defaultFilename = 'scene-preview.webm'
) {
  const [isRecording, setIsRecording] = useState(false);
  const sessionRef = useRef<CanvasRecorderSession | null>(null);

  const start = useCallback(() => {
    if (!canvasRef.current) return;
    sessionRef.current = startCanvasRecorder(canvasRef.current);
    setIsRecording(true);
  }, [canvasRef]);

  const stop = useCallback(async () => {
    if (!sessionRef.current) return null;
    const blob = await sessionRef.current.stop();
    setIsRecording(false);
    sessionRef.current = null;
    return blob;
  }, []);

  const download = useCallback(
    async (filename?: string) => {
      if (!sessionRef.current) return;
      await sessionRef.current.download(filename || defaultFilename);
      setIsRecording(false);
      sessionRef.current = null;
    },
    [defaultFilename]
  );

  return { isRecording, start, stop, download };
}
