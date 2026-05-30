"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function playBlob(
  blob: Blob,
  signal: AbortSignal,
  playbackRate: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.setAttribute("playsinline", "true");
    audio.playbackRate = Math.min(1, Math.max(0.25, playbackRate));
    const cleanup = () => URL.revokeObjectURL(url);
    const onAbort = () => {
      audio.pause();
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });
    audio.onended = () => {
      signal.removeEventListener("abort", onAbort);
      cleanup();
      resolve();
    };
    audio.onerror = () => {
      signal.removeEventListener("abort", onAbort);
      cleanup();
      reject(new Error("Riproduzione audio fallita"));
    };
    audio.play().catch((e) => {
      cleanup();
      reject(e);
    });
  });
}

export function useSpeechOutput() {
  const [speaking, setSpeaking] = useState(false);
  const supported = true;
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setSpeaking(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const speak = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      stop();
      const controller = new AbortController();
      abortRef.current = controller;
      setSpeaking(true);

      try {
        const res = await fetch("/api/speak", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(
            (data as { error?: string }).error ?? "Sintesi vocale fallita",
          );
        }

        const headerRate = res.headers.get("X-Playback-Rate");
        const playbackRate = headerRate
          ? Math.min(1, Math.max(0.25, Number(headerRate) || 0.43))
          : 0.43;

        const blob = await res.blob();
        if (!controller.signal.aborted) {
          await playBlob(blob, controller.signal, playbackRate);
        }
      } catch (e) {
        if ((e as Error).name !== "AbortError") {
          throw e;
        }
      } finally {
        if (!controller.signal.aborted) {
          stop();
        }
      }
    },
    [stop],
  );

  return { speaking, speak, stop, supported };
}
