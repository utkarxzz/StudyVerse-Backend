# StudyVerse Backend (API Proxy)

A tiny serverless proxy that keeps your Groq API key safe on the server, so your GitHub Pages frontend never exposes it in the browser.

## Setup

1. Push this folder to a **new GitHub repo** (e.g. `studyverse-backend`).
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import this repo.
3. In Vercel: **Settings → Environment Variables** → add:
   - Key: `GROQ_API_KEY`
   - Value: your Groq API key
   - Environments: check all (Production, Preview, Development)
4. Deploy. Vercel gives you a URL like:
   `https://studyverse-backend.vercel.app`
5. Your live endpoint is:
   `https://studyverse-backend.vercel.app/api/chat`

## Test it

```bash
curl -X POST https://studyverse-backend.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Explain photosynthesis in one line"}'
```

## Frontend change needed

In your `index.html` (StudyVerse repo), replace the `callGroqAI` function so it calls this endpoint instead of Groq directly — see `frontend-snippet.js` in this folder.
