# Anti-AI-Word — Plan

## Goal
A simple, clean web page with a textarea and a button. User pastes AI-sounding text, clicks the button, and gets back a natural, human-sounding rewrite. 100% free to host.

## Tech Stack
- **Hosting:** Cloudflare Pages (free, unlimited bandwidth, free HTTPS + custom domain)
- **API layer:** Cloudflare Pages Functions (same deploy, no separate Worker) — keeps the Gemini API key server-side
- **Frontend:** Zero framework — plain HTML + vanilla TypeScript
- **Styling:** Tailwind CSS
- **Build tool:** Vite (bundler/dev server only, not a framework) — compiles TS + Tailwind to static files
- **LLM:** Google Gemini `gemini-flash-latest` via REST (one `fetch` call, no SDK)
  - Free tier via Google AI Studio: ~15 RPM, 1500 requests/day, no credit card

## Project Structure
```
/
├── public/
│   └── index.html       # the page (textarea + button + result area)
├── src/
│   ├── main.ts          # textarea wiring + fetch to /api/rewrite
│   └── styles.css       # tailwind directives
├── functions/
│   └── api/
│       └── rewrite.ts   # Cloudflare Pages Function → Gemini API
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Data Flow
1. User types/pastes text into textarea
2. Click "Rewrite" → `POST /api/rewrite` with `{ text }`
3. Pages Function reads `GEMINI_API_KEY` from env, calls Gemini with a rewrite prompt
4. Returns rewritten text → displayed below the textarea

## Rewrite Prompt Goals
Strip common AI tells while preserving meaning:
- Em-dashes, "delve", "it's important to note", "navigate", "leverage", "tapestry"
- Overly balanced sentence structure ("not only... but also")
- Hedging and filler ("in essence", "ultimately")
- Output: natural, conversational, human-sounding prose

## Deploy
1. Push repo to GitHub
2. Connect to Cloudflare Pages
3. Set `GEMINI_API_KEY` env var in Pages dashboard
4. Build command: `npm run build` · Output dir: `dist`

## Constraints
- No database (stateless)
- API key never exposed to the browser
- Single page, no routing
