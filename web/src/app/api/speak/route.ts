import {
  getApiSpeechSpeed,
  getDesiredSpeechSpeed,
  getPlaybackRate,
  MAX_TTS_CHARS,
  synthesizeSpeech,
} from "@/lib/elevenlabs-tts";
import { cleanTextForSpeech } from "@/lib/speech-words";
import { countWords, newRequestId, skillLog, skillSection } from "@/lib/skill-logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 26;

export async function GET() {
  return NextResponse.json({
    mode: "continuous",
    desiredSpeed: getDesiredSpeechSpeed(),
    apiSpeed: getApiSpeechSpeed(),
    playbackRate: getPlaybackRate(),
  });
}

export async function POST(req: Request) {
  const requestId = newRequestId();

  try {
    skillSection(requestId, "SINTESI VOCALE ElevenLabs (continua)");

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ELEVENLABS_API_KEY non configurata in .env.local" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as { text?: string };
    const text = body.text?.trim() ?? "";
    if (!text) {
      return NextResponse.json({ error: "Testo vuoto" }, { status: 400 });
    }

    const voiceId =
      process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";
    const modelId =
      process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

    const clean = cleanTextForSpeech(text);

    skillLog(requestId, "tts", "Audio continuo", {
      words: countWords(clean),
      chars: clean.length,
      desiredSpeed: getDesiredSpeechSpeed(),
      apiSpeed: getApiSpeechSpeed(),
      playbackRate: getPlaybackRate(),
      maxChars: MAX_TTS_CHARS,
      preview: clean.slice(0, 120),
    });

    const audio = await synthesizeSpeech(text, apiKey, voiceId, modelId);

    skillLog(requestId, "tts", "Audio pronto", { bytes: audio.byteLength });

    return new NextResponse(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
        "X-TTS-Mode": "continuous",
        "X-Playback-Rate": String(getPlaybackRate()),
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Sintesi vocale fallita";
    skillLog(requestId, "error", msg, undefined, "error");
    const status = msg.includes("429") ? 429 : 500;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "Limite ElevenLabs raggiunto. Riprova tra qualche secondo."
            : msg,
      },
      { status },
    );
  }
}
