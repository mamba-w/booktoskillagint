"use client";

import { LiveTranscript } from "@/components/live-transcript";
import { MobileSetupBanner } from "@/components/mobile-setup-banner";
import { useSpeechOutput } from "@/hooks/use-speech-output";
import { useVisualViewport } from "@/hooks/use-visual-viewport";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { compressImageForUpload } from "@/lib/compress-image";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
  imagePreviews?: string[];
};

type PendingImage = { id: string; preview: string; mimeType: string; base64: string };

const STARTERS = [
  "Coordinazione vs cooperazione vs negoziazione",
  "Assiomi logica epistemica (K)",
];

const AUTO_SPEAK_KEY = "tutor-auto-speak";

async function fileToPayload(file: File): Promise<PendingImage> {
  const compressed = await compressImageForUpload(file);
  const buffer = await compressed.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  const preview = URL.createObjectURL(compressed);
  return {
    id: crypto.randomUUID(),
    preview,
    mimeType: compressed.type || "image/jpeg",
    base64,
  };
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [skillOk, setSkillOk] = useState<boolean | null>(null);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const sendRef = useRef<
    (text: string, images?: PendingImage[], fromVoice?: boolean) => Promise<void>
  >(async () => {});

  const { speak, stop: stopSpeak, speaking, supported: ttsOk } = useSpeechOutput();
  useVisualViewport();

  useEffect(() => {
    const stored = localStorage.getItem(AUTO_SPEAK_KEY);
    if (stored !== null) setAutoSpeak(stored === "1");
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setSkillOk(Boolean(d.ok)))
      .catch(() => setSkillOk(false));
  }, []);

  const revokePending = useCallback((imgs: PendingImage[]) => {
    imgs.forEach((i) => URL.revokeObjectURL(i.preview));
  }, []);

  const send = useCallback(
    async (text: string, images: PendingImage[] = pendingImages, fromVoice = false) => {
      const trimmed = text.trim();
      if ((!trimmed && images.length === 0) || loading) return;

      stopSpeak();
      setError(null);
      setInput("");
      const snapshots = [...images];
      setPendingImages([]);

      const userLabel =
        trimmed ||
        (snapshots.length === 1
          ? "Foto con domande"
          : `${snapshots.length} foto con domande`);

      const userMsg: Message = {
        role: "user",
        content: fromVoice ? `🎤 ${userLabel}` : userLabel,
        imagePreviews: snapshots.map((i) => i.preview),
      };
      setMessages((m) => [...m, userMsg]);
      setLoading(true);

      try {
        const history = messages.map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            history,
            images: snapshots.map(({ mimeType, base64 }) => ({ mimeType, base64 })),
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Errore API");

        const answer = data.answer as string;
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: answer,
            sources: data.sources,
          },
        ]);

        if ((fromVoice || autoSpeak) && ttsOk) {
          void speak(answer).catch((e) =>
            setError(e instanceof Error ? e.message : "Sintesi vocale fallita"),
          );
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Errore di rete");
        revokePending(snapshots);
        setPendingImages(snapshots);
      } finally {
        setLoading(false);
      }
    },
    [autoSpeak, loading, messages, pendingImages, revokePending, speak, stopSpeak, ttsOk],
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  const voice = useVoiceInput({
    onUtterance: (text) => void sendRef.current(text, [], true),
    onError: setError,
    disabled: loading || speaking,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, pendingImages.length, voice.heardText]);

  async function ingestFiles(files: FileList | File[]) {
    setError(null);
    const added: PendingImage[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      try {
        added.push(await fileToPayload(file));
      } catch {
        setError("Impossibile elaborare un'immagine");
      }
    }
    if (added.length) {
      setPendingImages((prev) => [...prev, ...added].slice(0, 4));
    }
  }

  async function onCamera(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await ingestFiles(e.target.files);
    e.target.value = "";
  }

  async function onGallery(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) await ingestFiles(e.target.files);
    e.target.value = "";
  }

  function removePending(id: string) {
    setPendingImages((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) URL.revokeObjectURL(removed.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input, pendingImages, false);
  }

  function toggleAutoSpeak() {
    setAutoSpeak((v) => {
      const next = !v;
      localStorage.setItem(AUTO_SPEAK_KEY, next ? "1" : "0");
      if (!next) stopSpeak();
      return next;
    });
  }

  const canSend = (input.trim() || pendingImages.length > 0) && !loading;
  const voiceBusy = loading || speaking || voice.busy;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <MobileSetupBanner />

      {skillOk === false && (
        <div className="mx-1 mb-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs leading-snug text-amber-100">
          Skill non trovata: configura SKILL_DIR in .env.local
        </div>
      )}

      <div className="scroll-chat min-h-0 flex-1 space-y-3 overflow-y-auto px-0.5 pb-2 pt-2">
        {messages.length === 0 && (
          <div className="space-y-4 px-0.5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4">
              <p className="text-[15px] leading-relaxed text-zinc-300">
                Il <strong className="text-zinc-100">microfono è sempre in ascolto</strong>: dopo
                più di 5 parole consecutive la domanda viene inviata automaticamente. Oppure scatta una
                foto del compito.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void send(s, [], false)}
                  disabled={voiceBusy}
                  className="touch-target rounded-2xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-3 text-left text-[15px] leading-snug text-zinc-300 active:bg-zinc-800 disabled:opacity-40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "bubble-user rounded-2xl rounded-br-md bg-emerald-600/25 px-3.5 py-3 text-[15px] leading-relaxed text-zinc-100"
                : "bubble-assistant rounded-2xl rounded-bl-md border border-zinc-800 bg-zinc-900/95 px-3.5 py-3 text-[15px] leading-relaxed text-zinc-200"
            }
          >
            {m.imagePreviews && m.imagePreviews.length > 0 && (
              <div className="-mx-0.5 mb-2 space-y-2">
                {m.imagePreviews.map((src, j) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={j}
                    src={src}
                    alt="Allegato"
                    className="w-full max-w-full rounded-xl border border-zinc-700/80 object-contain"
                    style={{ maxHeight: "min(50vh, 320px)" }}
                  />
                ))}
              </div>
            )}
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
              {m.content}
            </p>
            {m.sources && m.sources.length > 0 && (
              <p className="mt-2 border-t border-zinc-800/80 pt-2 text-[11px] leading-snug text-zinc-500">
                {m.sources.join(" · ")}
              </p>
            )}
            {m.role === "assistant" && ttsOk && i === messages.length - 1 && !loading && (
              <button
                type="button"
                onClick={() =>
                  void speak(m.content).catch((e) =>
                    setError(e instanceof Error ? e.message : "Sintesi vocale fallita"),
                  )
                }
                disabled={speaking}
                className="touch-target mt-3 w-full rounded-xl border border-violet-500/40 bg-violet-600/15 py-2.5 text-sm font-medium text-violet-100 active:bg-violet-600/25 disabled:opacity-40"
              >
                {speaking ? "Lettura…" : "▶ Ascolta risposta"}
              </button>
            )}
          </div>
        ))}

        {loading && (
          <div className="bubble-assistant flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-3 text-sm text-zinc-500">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-500" />
            Elaboro la risposta…
          </div>
        )}

        {speaking && !loading && (
          <div className="mx-1 flex flex-col items-center gap-2 rounded-2xl border border-violet-500/40 bg-violet-950/50 px-4 py-3">
            <p className="text-center text-xs text-violet-300">Lettura in corso…</p>
            <button
              type="button"
              onClick={stopSpeak}
              className="touch-target rounded-full border border-zinc-700 px-4 py-2 text-sm text-zinc-400 active:bg-zinc-800"
            >
              Interrompi lettura
            </button>
          </div>
        )}

        <LiveTranscript
          text={voice.heardText}
          questionDetected={voice.questionDetected}
          listening={voice.alwaysOn && !voice.muted}
        />

        <div ref={bottomRef} className="h-1 shrink-0" aria-hidden />
      </div>

      <div className="composer-bar shrink-0 border-t border-zinc-800/90 bg-zinc-950/95 backdrop-blur-md">
        {error && (
          <p className="px-2 pt-2 text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {pendingImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto px-2 pt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {pendingImages.map((img) => (
              <div key={img.id} className="relative shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.preview}
                  alt="In attesa"
                  className="h-[4.5rem] w-[4.5rem] rounded-xl border-2 border-emerald-600/50 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePending(img.id)}
                  className="touch-target absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-base text-zinc-200 shadow-lg active:bg-red-600"
                  aria-label="Rimuovi foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={onSubmit} className="flex flex-col gap-2 px-2 pb-1 pt-2">
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={onCamera}
          />
          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={onGallery}
          />

          <button
            type="button"
            onClick={() => voice.toggle()}
            className={`touch-target flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-base font-semibold transition ${
              voice.muted
                ? "border border-zinc-600 bg-zinc-900/80 text-zinc-400"
                : voice.questionDetected
                  ? "voice-active border border-emerald-500/60 bg-emerald-600/20 text-emerald-100"
                  : voice.alwaysOn
                    ? "voice-active border border-violet-500/50 bg-violet-600/20 text-violet-100"
                    : "border border-zinc-700 bg-zinc-900 text-zinc-300"
            }`}
            aria-pressed={!voice.muted}
          >
            <span className="text-2xl" aria-hidden>
              {voice.muted ? "🔇" : "🎤"}
            </span>
            {voice.muted ? "Riattiva microfono" : voice.label}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => cameraRef.current?.click()}
              disabled={voiceBusy || pendingImages.length >= 4}
              className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-emerald-600/40 bg-emerald-600/15 py-3 text-[15px] font-medium text-emerald-100 active:bg-emerald-600/25 disabled:opacity-40"
            >
              📷 Scatta
            </button>
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              disabled={voiceBusy || pendingImages.length >= 4}
              className="touch-target flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 py-3 text-[15px] font-medium text-zinc-200 active:bg-zinc-800 disabled:opacity-40"
            >
              🖼 Galleria
            </button>
          </div>

          <div className="flex items-end gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Testo opzionale…"
              disabled={voiceBusy}
              enterKeyHint="send"
              autoComplete="off"
              className="min-h-[44px] min-w-0 flex-1 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-base text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-600 focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="touch-target shrink-0 rounded-2xl bg-emerald-600 px-5 py-3 text-base font-semibold text-white active:bg-emerald-500 disabled:opacity-40"
            >
              Invia
            </button>
          </div>

          {ttsOk && (
            <label className="flex cursor-pointer items-center justify-center gap-2 py-1 text-xs text-zinc-500">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={() => toggleAutoSpeak()}
                className="h-4 w-4 rounded border-zinc-600 accent-emerald-600"
              />
              Leggi risposte (ElevenLabs)
            </label>
          )}
        </form>
      </div>
    </div>
  );
}
