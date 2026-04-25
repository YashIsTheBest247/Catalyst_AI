# Catalyst AI — Standalone Backend

A Node + Express server that mirrors the three Supabase Edge Functions used by the Catalyst AI frontend. Use this if you want to host the backend yourself instead of relying on Supabase Edge Functions.

> ℹ️ The frontend in this repo currently calls the Supabase Edge Functions in `supabase/functions/`. This standalone backend is a drop-in replacement for self-hosting (Render, Railway, Fly, a VPS, etc.). It is **not** required for the live preview to work.

## Endpoints

| Method | Path              | Purpose                                            |
| ------ | ----------------- | -------------------------------------------------- |
| GET    | `/health`         | Liveness check                                     |
| POST   | `/extract-skills` | Extract & compare skills from JD + resume          |
| POST   | `/chat-assess`    | Streaming conversational interviewer (SSE)         |
| POST   | `/generate-plan`  | Score skills + generate phased learning plan       |

Request/response shapes match `supabase/functions/*/index.ts` exactly.

## Setup

```bash
cd backend
cp .env.example .env     
npm install
npm run dev                 # http://localhost:8787
```

## Environment variables

| Variable          | Required | Default                                                      |
| ----------------- | -------- | ------------------------------------------------------------ |
| `AI_MODEL`        | yes      | `google/gemini-3-flash-preview`                              |
| `PORT`            | no       | `8787`                                                       |

`AI_GATEWAY_URL` and `AI_MODEL` are OpenAI-compatible — point them at any provider that accepts the same chat-completions schema (OpenAI, OpenRouter, Groq, etc.).

## Pointing the frontend at this backend

The frontend currently calls Supabase Edge Functions via `supabase.functions.invoke(...)`. To use this server instead, replace those three call sites in `src/pages/Assess.tsx`, `src/pages/Chat.tsx`, and `src/pages/Dashboard.tsx` with `fetch` calls to your deployed URL, e.g.:

```ts
const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/extract-skills`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ jobDescription, resume }),
});
const data = await res.json();
```

## Deploy

Any Node 20+ host works. Example (Render):

1. New Web Service → connect this repo, root directory `backend`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Add `GEMINI_API_KEY` as an environment variable.

## Project layout

```
backend/
├── package.json
├── .env.example
└── src/
    ├── server.js          # Express app
    ├── aiClient.js        # Shared AI gateway helper
    └── routes/
        ├── extractSkills.js
        ├── chatAssess.js
        └── generatePlan.js
```