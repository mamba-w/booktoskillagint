"use client";

import { QUESTION_WORD_THRESHOLD } from "@/lib/voice-question";

type Props = {
  text: string;
  questionDetected: boolean;
  listening: boolean;
};

export function LiveTranscript({ text, questionDetected, listening }: Props) {
  const words = text.trim().split(/\s+/).filter(Boolean);

  if (!listening && words.length === 0) return null;

  return (
    <div
      className={`mx-1 rounded-2xl border px-3.5 py-3 ${
        questionDetected
          ? "border-emerald-600/50 bg-emerald-950/40"
          : "border-zinc-800 bg-zinc-900/70"
      }`}
      aria-live="polite"
      aria-atomic="false"
    >
      {questionDetected && (
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-emerald-400">
          Stai per inviare una domanda
        </p>
      )}
      {words.length > 0 ? (
        <p className="text-[17px] leading-relaxed">
          {words.map((word, i) => (
            <span
              key={`${i}-${word}`}
              className={
                questionDetected && i >= QUESTION_WORD_THRESHOLD
                  ? "font-medium text-emerald-200"
                  : "text-zinc-100"
              }
            >
              {word}{" "}
            </span>
          ))}
        </p>
      ) : (
        <p className="text-sm text-zinc-500">
          {listening ? "Parla: ogni parola apparirà qui…" : ""}
        </p>
      )}
    </div>
  );
}
