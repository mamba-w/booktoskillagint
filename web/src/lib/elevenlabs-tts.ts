import { withElevenLabsSlot } from "@/lib/elevenlabs-queue";
import { cleanTextForSpeech } from "@/lib/speech-words";

export { cleanTextForSpeech, splitWordsForSpeech } from "@/lib/speech-words";

const ELEVENLABS_API_SPEED_MIN = 0.7;
const ELEVENLABS_API_SPEED_MAX = 1.2;

/** Velocità richiesta (es. 0.3); può essere sotto il minimo API. */
export function getDesiredSpeechSpeed(): number {
  const v = Number(process.env.ELEVENLABS_SPEED ?? "0.3");
  return Math.min(1.2, Math.max(0.1, v));
}

/** Velocità inviata a ElevenLabs (limite API 0.7–1.2). */
export function getApiSpeechSpeed(): number {
  return Math.min(
    ELEVENLABS_API_SPEED_MAX,
    Math.max(ELEVENLABS_API_SPEED_MIN, getDesiredSpeechSpeed()),
  );
}

/** Rallenta in browser se la velocità desiderata è sotto il minimo API. */
export function getPlaybackRate(): number {
  const desired = getDesiredSpeechSpeed();
  const api = getApiSpeechSpeed();
  return Math.min(1, Math.max(0.25, desired / api));
}

export const MAX_TTS_CHARS = 8000;

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 1200;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function synthesizeRawOnce(
  speechText: string,
  apiKey: string,
  voiceId: string,
  modelId: string,
): Promise<ArrayBuffer> {
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text: speechText,
        model_id: modelId,
        voice_settings: {
          stability: 0.55,
          similarity_boost: 0.8,
          style: 0,
          use_speaker_boost: true,
          speed: getApiSpeechSpeed(),
        },
      }),
    },
  );

  if (!res.ok) {
    const err = await res.text().catch(() => "");
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 280)}`);
  }

  return res.arrayBuffer();
}

export async function synthesizeSpeech(
  text: string,
  apiKey: string,
  voiceId: string,
  modelId: string,
): Promise<ArrayBuffer> {
  const speech = cleanTextForSpeech(text).slice(0, MAX_TTS_CHARS);
  if (!speech) throw new Error("Testo vuoto");

  return withElevenLabsSlot(async () => {
    let lastErr: Error | null = null;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        return await synthesizeRawOnce(speech, apiKey, voiceId, modelId);
      } catch (e) {
        lastErr = e instanceof Error ? e : new Error(String(e));
        const retryable =
          lastErr.message.includes("429") ||
          lastErr.message.includes("concurrent");
        if (!retryable || attempt === MAX_RETRIES - 1) throw lastErr;
        await sleep(RETRY_BASE_MS * (attempt + 1));
      }
    }
    throw lastErr ?? new Error("ElevenLabs fallito");
  });
}
