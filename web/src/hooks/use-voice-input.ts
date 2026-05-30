"use client";

import { mobileMicBlockedReason } from "@/lib/mobile-env";
import { preferredRecorderMime } from "@/lib/recorder-mime";
import {
  extractQuestionText,
  hasQuestionIntent,
  QUESTION_WORD_THRESHOLD,
} from "@/lib/voice-question";
import { useCallback, useEffect, useRef, useState } from "react";

export type VoicePhase = "idle" | "listening" | "muted" | "transcribing";

type Options = {
  onUtterance: (text: string) => void;
  onError: (message: string) => void;
  disabled?: boolean;
};

const UTTERANCE_END_MS = 1600;

function getSpeechRecognition(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function normalizeHeard(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function getRms(analyser: AnalyserNode): number {
  const data = new Uint8Array(analyser.fftSize);
  analyser.getByteTimeDomainData(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const v = (data[i] - 128) / 128;
    sum += v * v;
  }
  return Math.sqrt(sum / data.length);
}

export function useVoiceInput({ onUtterance, onError, disabled }: Options) {
  const [phase, setPhase] = useState<VoicePhase>("idle");
  const [heardText, setHeardText] = useState("");
  const [questionDetected, setQuestionDetected] = useState(false);
  const [muted, setMuted] = useState(false);

  const onUtteranceRef = useRef(onUtterance);
  const onErrorRef = useRef(onError);
  const srRef = useRef<SpeechRecognition | null>(null);
  const finalsRef = useRef("");
  const finalizeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const vadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenEnabledRef = useRef(false);
  const useSrRef = useRef(true);
  const submittingRef = useRef(false);
  const utteranceFinalizedRef = useRef(false);
  const disabledRef = useRef(disabled);
  const mutedRef = useRef(muted);

  useEffect(() => {
    onUtteranceRef.current = onUtterance;
    onErrorRef.current = onError;
  }, [onUtterance, onError]);

  useEffect(() => {
    disabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  const clearFinalizeTimer = useCallback(() => {
    if (finalizeTimerRef.current) {
      clearTimeout(finalizeTimerRef.current);
      finalizeTimerRef.current = null;
    }
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const cleanupStream = useCallback(() => {
    if (vadTimerRef.current) {
      clearTimeout(vadTimerRef.current);
      vadTimerRef.current = null;
    }
    if (recorderRef.current?.state === "recording") {
      try {
        recorderRef.current.stop();
      } catch {
        /* ignore */
      }
    }
    recorderRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    void audioCtxRef.current?.close();
    audioCtxRef.current = null;
  }, []);

  const resetPhraseBuffer = useCallback(() => {
    clearFinalizeTimer();
    finalsRef.current = "";
    setHeardText("");
    setQuestionDetected(false);
  }, [clearFinalizeTimer]);

  const updateHeardDisplay = useCallback((utterance: string) => {
    setHeardText(utterance);
    setQuestionDetected(hasQuestionIntent(utterance));
  }, []);

  const dispatchQuestion = useCallback((rawUtterance: string) => {
    const question = extractQuestionText(rawUtterance);
    if (!question) return;
    submittingRef.current = true;
    resetPhraseBuffer();
    onUtteranceRef.current(question);
  }, [resetPhraseBuffer]);

  const finalizeUtterance = useCallback(() => {
    if (utteranceFinalizedRef.current) return;
    clearFinalizeTimer();
    const full = normalizeHeard(finalsRef.current);
    if (!full) return;
    utteranceFinalizedRef.current = true;

    if (hasQuestionIntent(full) && !submittingRef.current) {
      dispatchQuestion(full);
    } else {
      resetPhraseBuffer();
    }
  }, [clearFinalizeTimer, dispatchQuestion, resetPhraseBuffer]);

  const scheduleUtteranceEnd = useCallback(() => {
    clearFinalizeTimer();
    finalizeTimerRef.current = setTimeout(() => {
      finalizeTimerRef.current = null;
      finalizeUtterance();
    }, UTTERANCE_END_MS);
  }, [clearFinalizeTimer, finalizeUtterance]);

  const stopRecognition = useCallback(() => {
    clearRestartTimer();
    clearFinalizeTimer();
    try {
      srRef.current?.abort();
    } catch {
      /* ignore */
    }
    srRef.current = null;
    cleanupStream();
    resetPhraseBuffer();
  }, [cleanupStream, clearFinalizeTimer, clearRestartTimer, resetPhraseBuffer]);

  const transcribeBlob = useCallback(async (blob: Blob) => {
    setPhase("transcribing");
    const form = new FormData();
    form.append("audio", blob, "voice.m4a");
    const res = await fetch("/api/transcribe", { method: "POST", body: form });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Trascrizione fallita");
    return (data.text as string).trim();
  }, []);

  const scheduleRestart = useCallback((delayMs = 300) => {
    clearRestartTimer();
    if (!listenEnabledRef.current) return;
    restartTimerRef.current = setTimeout(() => {
      restartTimerRef.current = null;
      if (!listenEnabledRef.current) return;
      if (useSrRef.current) {
        startSpeechRecognitionRef.current?.();
      } else {
        void startVadRef.current?.();
      }
    }, delayMs);
  }, [clearRestartTimer]);

  const startSpeechRecognitionRef = useRef<(() => boolean) | null>(null);
  const startVadRef = useRef<(() => Promise<void>) | null>(null);

  const startSpeechRecognition = useCallback(() => {
    const Ctor = getSpeechRecognition();
    if (!Ctor || !listenEnabledRef.current) return false;

    try {
      srRef.current?.abort();
    } catch {
      /* ignore */
    }

    const sr = new Ctor();
    sr.lang = "it-IT";
    sr.continuous = true;
    sr.interimResults = true;
    sr.maxAlternatives = 1;

    finalsRef.current = "";
    utteranceFinalizedRef.current = false;

    sr.onspeechstart = () => {
      utteranceFinalizedRef.current = false;
      clearFinalizeTimer();
    };

    sr.onresult = (ev) => {
      let interim = "";
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const r = ev.results[i];
        if (r.isFinal) finalsRef.current += r[0].transcript;
        else interim += r[0].transcript;
      }

      const utterance = normalizeHeard(finalsRef.current + interim);
      if (utterance) updateHeardDisplay(utterance);
      if (utterance) scheduleUtteranceEnd();
    };

    sr.onspeechend = () => {
      finalizeUtterance();
    };

    sr.onerror = (ev) => {
      if (ev.error === "aborted" || ev.error === "no-speech") return;
      if (ev.error === "not-allowed") {
        listenEnabledRef.current = false;
        setMuted(true);
        setPhase("muted");
        onErrorRef.current("Consenti il microfono per l'ascolto continuo.");
        return;
      }
      srRef.current = null;
      scheduleRestart(700);
    };

    sr.onend = () => {
      srRef.current = null;
      if (listenEnabledRef.current && !submittingRef.current) {
        scheduleRestart(250);
      }
    };

    srRef.current = sr;
    setPhase("listening");
    try {
      sr.start();
      return true;
    } catch {
      srRef.current = null;
      scheduleRestart(600);
      return false;
    }
  }, [
    clearFinalizeTimer,
    finalizeUtterance,
    scheduleRestart,
    scheduleUtteranceEnd,
    updateHeardDisplay,
  ]);

  startSpeechRecognitionRef.current = startSpeechRecognition;

  const startVad = useCallback(async () => {
    if (!listenEnabledRef.current) return;

    cleanupStream();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
    });
    streamRef.current = stream;

    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    if (ctx.state === "suspended") await ctx.resume();

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    const source = ctx.createMediaStreamSource(stream);
    source.connect(analyser);

    const mime = preferredRecorderMime();
    let recording = false;
    let silenceMs = 0;
    let recordStart = 0;
    const CHECK_MS = 100;
    const SILENCE_MS = 1400;
    const MIN_RECORD_MS = 900;
    const MAX_RECORD_MS = 45_000;
    const SPEECH_RMS = 0.012;

    setPhase("listening");

    const tick = () => {
      if (!listenEnabledRef.current) return;

      const rms = getRms(analyser);
      const speech = rms > SPEECH_RMS;

      if (!recording && speech) {
        recording = true;
        silenceMs = 0;
        recordStart = Date.now();
        setHeardText("…");
        setQuestionDetected(false);
        chunksRef.current = [];
        const rec = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
        recorderRef.current = rec;
        rec.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };
        rec.onstop = async () => {
          recording = false;
          recorderRef.current = null;
          const blob = new Blob(chunksRef.current, {
            type: rec.mimeType || "audio/mp4",
          });
          chunksRef.current = [];
          if (blob.size < 800 || !listenEnabledRef.current) {
            resetPhraseBuffer();
            return;
          }
          try {
            const text = await transcribeBlob(blob);
            if (!listenEnabledRef.current) return;
            setPhase("listening");
            updateHeardDisplay(text);
            if (hasQuestionIntent(text)) {
              dispatchQuestion(text);
            } else {
              resetPhraseBuffer();
            }
          } catch (e) {
            setPhase("listening");
            onErrorRef.current(
              e instanceof Error ? e.message : "Errore trascrizione",
            );
          } finally {
            submittingRef.current = false;
          }
        };
        rec.start(250);
      } else if (recording) {
        if (!speech) silenceMs += CHECK_MS;
        else silenceMs = 0;

        const elapsed = Date.now() - recordStart;
        if (
          (silenceMs >= SILENCE_MS && elapsed >= MIN_RECORD_MS) ||
          elapsed >= MAX_RECORD_MS
        ) {
          if (recorderRef.current?.state === "recording") {
            recorderRef.current.stop();
          }
        }
      }

      vadTimerRef.current = setTimeout(tick, CHECK_MS);
    };

    tick();
  }, [
    cleanupStream,
    dispatchQuestion,
    resetPhraseBuffer,
    transcribeBlob,
    updateHeardDisplay,
  ]);

  startVadRef.current = startVad;

  const ensureMicPermission = useCallback(async (): Promise<boolean> => {
    const blocked = mobileMicBlockedReason();
    if (blocked) {
      listenEnabledRef.current = false;
      setMuted(true);
      setPhase("muted");
      onErrorRef.current(blocked);
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      stream.getTracks().forEach((t) => t.stop());
      return true;
    } catch (e) {
      listenEnabledRef.current = false;
      setMuted(true);
      setPhase("muted");
      onErrorRef.current(
        e instanceof Error
          ? e.message
          : "Consenti l'accesso al microfono nelle impostazioni Safari",
      );
      return false;
    }
  }, []);

  const beginListening = useCallback(() => {
    if (mutedRef.current || disabledRef.current) return;
    listenEnabledRef.current = true;
    submittingRef.current = false;
    resetPhraseBuffer();

    const hasSr = Boolean(getSpeechRecognition());
    useSrRef.current = hasSr;

    void (async () => {
      const ok = await ensureMicPermission();
      if (!ok || !listenEnabledRef.current) return;

      if (hasSr) {
        startSpeechRecognition();
        return;
      }

      try {
        await startVad();
      } catch (e) {
        listenEnabledRef.current = false;
        setPhase("idle");
        onErrorRef.current(
          e instanceof Error
            ? e.message
            : "Consenti l'accesso al microfono nelle impostazioni Safari",
        );
      }
    })();
  }, [ensureMicPermission, resetPhraseBuffer, startSpeechRecognition, startVad]);

  const pauseListening = useCallback(() => {
    listenEnabledRef.current = false;
    submittingRef.current = false;
    stopRecognition();
    if (!mutedRef.current) setPhase("idle");
    else setPhase("muted");
  }, [stopRecognition]);

  useEffect(() => {
    if (disabled || muted) {
      pauseListening();
      return;
    }
    beginListening();
    return () => pauseListening();
    // Solo disabled/muted: evita loop di restart che blocca il riconoscimento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, muted]);

  useEffect(() => {
    if (!disabled && !submittingRef.current && !muted) {
      submittingRef.current = false;
    }
  }, [disabled, muted]);

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      mutedRef.current = next;
      if (next) {
        listenEnabledRef.current = false;
        stopRecognition();
        setPhase("muted");
        resetPhraseBuffer();
      }
      return next;
    });
  }, [resetPhraseBuffer, stopRecognition]);

  const busy = phase === "transcribing";
  const active = phase === "listening";

  const label = muted
    ? "Microfono in pausa (tocca per riattivare)"
    : phase === "transcribing"
      ? "Trascrizione…"
      : questionDetected
        ? "Domanda rilevata — continua a parlare…"
        : active
          ? `In ascolto… (dopo ${QUESTION_WORD_THRESHOLD} parole invio automatico)`
          : disabled
            ? "Microfono in pausa (risposta in corso)"
            : "Avvio microfono…";

  return {
    phase,
    heardText,
    questionDetected,
    muted,
    toggle: toggleMute,
    stop: pauseListening,
    busy,
    active: active && !muted,
    label,
    alwaysOn: active && !muted && !disabled,
  };
}
