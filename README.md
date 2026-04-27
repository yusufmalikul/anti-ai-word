# Humanize (anti-ai-word)

Rewrite AI-sounding text into natural, human prose. Free to host on Cloudflare Pages.

## Stack
- Plain HTML + vanilla TypeScript (no framework)
- Tailwind CSS
- Vite (build tool)
- Cloudflare Pages + Pages Functions
- Gemini `gemini-flash-latest`

## Local dev

1. Install: `npm install`
2. Get a free Gemini API key: https://aistudio.google.com/apikey
3. Copy `.dev.vars.example` to `.dev.vars` and paste your key
4. Run with Pages Functions:
   ```
   npm run build
   npx wrangler pages dev dist
   ```
   Or for frontend-only iteration: `npm run dev` (the `/api/rewrite` call won't work without wrangler)

## Deploy
1. Push to GitHub
2. Cloudflare dashboard → Pages → Connect repo
3. Build command: `npm run build` · Output directory: `dist`
4. Settings → Environment variables → add `GEMINI_API_KEY`
