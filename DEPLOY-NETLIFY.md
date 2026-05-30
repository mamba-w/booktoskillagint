# Deploy su Netlify

## Prerequisiti

- Account [Netlify](https://www.netlify.com/)
- Repository Git (GitHub / GitLab / Bitbucket) con questo progetto
- Chiavi API: OpenAI (obbligatoria), ElevenLabs (per la lettura vocale)

La skill del corso è inclusa in `web/knowledge/agenti-intelligenti-altair/` (non serve `SKILL_DIR` su Netlify).

## Deploy da Git (consigliato)

1. Push del progetto su GitHub (root = cartella `booktoskillagint`, con `netlify.toml` in root).
2. Netlify → **Add new site** → **Import an existing project**.
3. Connetti il repo; Netlify legge `netlify.toml` automaticamente:
   - **Base directory:** `web` (già in `netlify.toml`)
   - **Build command:** `npm ci && npm run build`
   - **Plugin:** `@netlify/plugin-nextjs`
4. **Site settings → Environment variables** (Production):

   | Variabile | Obbligatoria | Esempio |
   |-----------|--------------|---------|
   | `OPENAI_API_KEY` | Sì | `sk-...` |
   | `OPENAI_MODEL` | No | `gpt-4o-mini` o `gpt-4o` |
   | `OPENAI_MAX_TOKENS` | No | `1024` |
   | `ELEVENLABS_API_KEY` | No* | `...` |
   | `ELEVENLABS_VOICE_ID` | No | `pNInz6obpgDQGcFmaJgB` |
   | `ELEVENLABS_MODEL_ID` | No | `eleven_multilingual_v2` |
   | `ELEVENLABS_SPEED` | No | `0.3` |

   \* Senza ElevenLabs la chat funziona; manca solo «Leggi risposte».

5. **Deploy site**.

URL finale: `https://<nome-sito>.netlify.app` (HTTPS: microfono e audio su iPhone funzionano).

## Deploy da CLI

```bash
npm install -g netlify-cli
cd /path/to/booktoskillagint
netlify login
netlify init
netlify env:set OPENAI_API_KEY "sk-..."
# … altre variabili
netlify deploy --build --prod
```

## Limiti Netlify

- Funzioni serverless: timeout **10 s** (piano free) o **26 s** (Pro). Richieste molto lunghe (foto + LLM) possono andare in timeout sul piano free.
- In caso di timeout, passa a Pro o riduci immagini per invio.

## Verifica post-deploy

1. Apri `https://<tuo-sito>.netlify.app`
2. Controlla che non compaia «Skill non trovata»
3. Invia una domanda di testo
4. Su iPhone: consenti microfono; prova voce e «▶ Ascolta risposta»

## Sviluppo locale

```bash
cd web
cp .env.example .env.local
# compila le chiavi
npm run dev
```

HTTPS locale (iPhone in LAN): vedi `web/README.md`.
