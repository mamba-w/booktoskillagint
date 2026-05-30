# Tutor Agenti Intelligenti (web)

App chat che usa la skill **agenti-intelligenti-altair** (book-to-skill): **foto di domande/esercizi** o testo → router capitoli → risposta OpenAI (vision + skill).

## Requisiti

- Node.js 20+
- Skill installata in `~/.cursor/skills/agenti-intelligenti-altair/` (o `SKILL_DIR` custom)
- Chiave [OpenAI API](https://platform.openai.com/api-keys)

## Deploy su Netlify

Vedi [DEPLOY-NETLIFY.md](../DEPLOY-NETLIFY.md) nella root del repo.

## Avvio

```bash
cd web
cp .env.example .env.local
# Modifica .env.local e inserisci OPENAI_API_KEY

npm install
npm run dev
```

Apri [https://localhost:3000](https://localhost:3000) (il dev server usa **HTTPS**).

### iPhone (Safari) — importante

Su iPhone **non usare `http://192.168.x.x`**: microfono, audio e spesso le API non funzionano senza HTTPS.

1. Mac e iPhone sulla **stessa Wi‑Fi**
2. Sul Mac: `npm run dev` (avvia HTTPS su tutte le interfacce)
3. IP del Mac: `ipconfig getifaddr en0` (es. `192.168.1.72`)
4. Su iPhone Safari: **`https://192.168.1.72:3000`** (con **https**)
5. Avviso certificato: **Avanzate → Continua** (certificato locale di sviluppo)
6. Consenti **microfono** quando richiesto

- Layout full-screen con **safe area** (Dynamic Island, home indicator)
- **Parla**: domanda vocale → trascrizione (Safari o Whisper) → risposta → lettura ad alta voce
- Pulsanti **Scatta** / **Galleria** (target touch ≥ 44pt)
- Tastiera: `interactive-widget: resizes-content` + adattamento visual viewport
- Foto compresse lato client prima dell’upload (rete mobile)
- Aggiungi a Home: Safari → Condividi → **Aggiungi a Home**

### Voce

1. Tocca **Parla** e consenti il microfono
2. Fai la domanda (su Safari spesso basta un tap; altrimenti tap di nuovo per terminare)
3. La domanda viene inviata automaticamente; la risposta può essere letta ad alta voce
4. Su iPhone, se l’audio non parte da solo, tocca **▶ Ascolta risposta**
5. Disattiva «Leggi le risposte» se preferisci solo testo

Solo desktop senza HTTPS: `npm run dev:http`

Richiede `OPENAI_API_KEY` (Whisper per trascrizione + chat).

### Log skill (terminale)

Con `npm run dev`, ogni richiesta stampa nel terminale il ragionamento book-to-skill:

- routing capitoli e keyword match
- file caricati / saltati
- dimensione contesto
- modello LLM e anteprima risposta

Cerca righe con prefisso `[skill][req-...]`.

## Come funziona

1. **Foto**: carica immagine (slide, quiz, V/F); il modello vision (`gpt-4o`) legge le domande nell’immagine.
2. **Testo** (opzionale): restringe o integra (es. “rispondi solo alla 2”).
3. Router (`src/lib/router.ts`) sceglie capitoli skill; con sole foto usa SKILL + cheatsheet + glossary.
4. `POST /api/chat` invia immagini + contesto skill al modello.

Formati foto: JPEG, PNG, WebP, GIF — max 5 MB, fino a 4 immagini per invio.

## Deploy / skill in repo

Per Vercel o server senza `~/.cursor/skills`:

```bash
cp -R ~/.cursor/skills/agenti-intelligenti-altair web/knowledge/agenti-intelligenti-altair
```

Oppure imposta `SKILL_DIR` nelle variabili d’ambiente del hosting.

## API

- `GET /api/health` — verifica che la skill sia leggibile
- `POST /api/chat` — `{ "message": "...", "images": [{ "mimeType": "image/jpeg", "base64": "..." }], "history": [...] }`

## Struttura

```
src/
  app/api/chat/route.ts   # endpoint LLM
  lib/router.ts           # routing capitoli
  lib/context.ts          # assemble contesto
  lib/skill-path.ts       # risoluzione path skill
  components/chat.tsx     # UI
```
