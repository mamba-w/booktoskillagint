import { newRequestId, skillLog, skillSection } from "@/lib/skill-logger";
import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 26;

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(req: Request) {
  const requestId = newRequestId();

  try {
    skillSection(requestId, "TRASCRIZIONE VOCE /api/transcribe");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY non configurata" }, { status: 500 });
    }

    const form = await req.formData();
    const audio = form.get("audio");
    if (!audio || !(audio instanceof Blob)) {
      return NextResponse.json({ error: "Audio mancante" }, { status: 400 });
    }

    if (audio.size > MAX_BYTES) {
      return NextResponse.json({ error: "Registrazione troppo lunga" }, { status: 400 });
    }

    skillLog(requestId, "input", "Audio ricevuto", {
      bytes: audio.size,
      type: audio.type,
    });

    const ext = audio.type.includes("mp4") ? "m4a" : audio.type.includes("webm") ? "webm" : "wav";
    const file = new File([await audio.arrayBuffer()], `voice.${ext}`, {
      type: audio.type || "audio/mp4",
    });

    const client = new OpenAI({ apiKey });
    skillLog(requestId, "whisper", "Trascrizione Whisper", { model: "whisper-1", language: "it" });

    const result = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
      language: "it",
      response_format: "json",
    });

    const text = result.text?.trim() ?? "";
    if (!text) {
      skillLog(requestId, "whisper", "Nessun testo riconosciuto", undefined, "warn");
      return NextResponse.json(
        { error: "Nessun testo riconosciuto. Riprova parlando più chiaro." },
        { status: 422 },
      );
    }

    skillLog(requestId, "whisper", "Testo trascritto → verrà inviato a /api/chat", {
      textPreview: text.slice(0, 200),
      chars: text.length,
    });

    return NextResponse.json({ text });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Trascrizione fallita";
    skillLog(requestId, "error", msg, undefined, "error");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
