import { buildFullSkillContext, buildKnowledgeContext } from "@/lib/context";
import { formatPlainAnswer } from "@/lib/format-answer";
import { dataUrlFromPayload, validateImages, type ImagePayload } from "@/lib/images";
import { countWords, newRequestId, skillLog, skillSection } from "@/lib/skill-logger";
import { resolveSkillDir } from "@/lib/skill-path";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import type {
  ChatCompletionContentPart,
  ChatCompletionMessageParam,
} from "openai/resources/chat/completions";

export const runtime = "nodejs";
/** Netlify: max 26s (Pro) / 10s (free). */
export const maxDuration = 26;

type ChatMessage = { role: "user" | "assistant"; content: string };

type Body = {
  message?: string;
  history?: ChatMessage[];
  images?: ImagePayload[];
};

const SYSTEM_TEXT = `Sei un tutor per il corso "Agenti Intelligenti — Teoria" (appunti Altair).

REGOLE DI FORMATO (obbligatorie):
- Solo testo piano: vietati markdown, asterischi, cancelletti, elenchi puntati con trattini, grassetto, titoli, link markdown.
- Rispondi in modo completo quanto serve alla domanda; usa numerazione semplice (1. 2. 3.) se utile.
- Citazioni opzionali tra parentesi tonde, es. (ch02).

Contenuto:
1. Leggi domande da testo o foto e rispondi in italiano, diretto e didattico.
2. Vero/Falso: per ogni voce indica Vero o Falso con motivazione chiara.
3. Usa il CONTESTO SKILL quando pertinente; se manca, dillo in una frase.
4. Formule leggibili in testo (es. Kφ ⇒ φ).`;

function buildUserContent(
  context: string,
  message: string,
  hasImages: boolean,
): string {
  const intro = hasImages
    ? "Nell'immagine allegata ci sono domande o esercizi del corso. Rispondi a tutte, nell'ordine in cui compaiono."
    : "";

  const userNote = message
    ? `\n\nNOTA DELL'UTENTE:\n${message}`
    : hasImages
      ? ""
      : "\n\n(Domanda testuale)";

  return `${intro}

CONTESTO DALLA SKILL:

${context}
---${userNote}`;
}

function preview(text: string, max = 120): string {
  const one = text.replace(/\s+/g, " ").trim();
  return one.length <= max ? one : `${one.slice(0, max)}…`;
}

export async function POST(req: Request) {
  const requestId = newRequestId();
  const started = Date.now();

  try {
    skillSection(requestId, "NUOVA RICHIESTA /api/chat");

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      skillLog(requestId, "error", "OPENAI_API_KEY mancante", undefined, "error");
      return NextResponse.json(
        { error: "OPENAI_API_KEY non configurata. Copia .env.example in .env.local" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Body;
    const message = body.message?.trim() ?? "";
    const images = body.images ?? [];

    validateImages(images);
    const hasImages = images.length > 0;
    const history = (body.history ?? []).slice(-6);

    skillLog(requestId, "input", "Richiesta ricevuta", {
      messagePreview: message ? preview(message, 200) : "(vuoto)",
      messageChars: message.length,
      images: images.length,
      historyTurns: history.length,
    });

    if (!message && !hasImages) {
      return NextResponse.json(
        { error: "Inserisci testo o allega almeno una foto" },
        { status: 400 },
      );
    }

    const skillDir = resolveSkillDir();
    skillLog(requestId, "skill", "Directory skill", { skillDir });

    const ctx = message
      ? buildKnowledgeContext(message, requestId)
      : buildFullSkillContext(requestId);

    const { context, sources } = ctx;

    const defaultModel = hasImages ? "gpt-4o" : "gpt-4o-mini";
    const model = process.env.OPENAI_MODEL ?? defaultModel;
    const maxTokens = Number(process.env.OPENAI_MAX_TOKENS ?? "1024");

    const textBlock = buildUserContent(context, message, hasImages);
    const userParts: ChatCompletionContentPart[] = [{ type: "text", text: textBlock }];

    for (const img of images) {
      userParts.push({
        type: "image_url",
        image_url: { url: dataUrlFromPayload(img), detail: "high" },
      });
    }

    skillLog(requestId, "llm", "Invio al modello", {
      model,
      temperature: 0.2,
      maxTokens,
      promptChars: textBlock.length,
      systemRules: "testo piano, senza markdown",
      hasVision: hasImages,
    });

    const client = new OpenAI({ apiKey });

    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_TEXT },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: userParts },
    ];

    const completion = await client.chat.completions.create({
      model,
      temperature: 0.2,
      max_tokens: maxTokens,
      messages,
    });

    const raw =
      completion.choices[0]?.message?.content?.trim() ??
      "Nessuna risposta dal modello.";
    const answer = formatPlainAnswer(raw);

    skillLog(requestId, "llm", "Risposta modello", {
      finishReason: completion.choices[0]?.finish_reason,
      usage: completion.usage,
      rawWords: countWords(raw),
      finalWords: countWords(answer),
      rawPreview: preview(raw, 300),
      finalPreview: preview(answer, 300),
      sources,
    });

    skillLog(requestId, "done", "Richiesta completata", {
      elapsedMs: Date.now() - started,
    });

    return NextResponse.json({
      answer,
      sources,
      skillDir,
      model,
      usedVision: hasImages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Errore sconosciuto";
    skillLog(requestId, "error", msg, { elapsedMs: Date.now() - started }, "error");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
