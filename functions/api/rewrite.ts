interface Env {
  GEMINI_API_KEY: string;
}

const MODEL = "gemini-2.5-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

const SYSTEM_PROMPT = `You rewrite AI-sounding text so it reads like a real person wrote it. Preserve the original meaning, facts, and rough length. Keep the user's language (if input is Indonesian, reply in Indonesian; if English, reply in English).

Strip these AI tells:
- Em-dashes (—) — use commas, periods, or parentheses instead
- Words like: delve, leverage, navigate, tapestry, realm, landscape, robust, seamless, foster, embark, unleash, elevate, intricate, nuanced, pivotal, paramount
- Phrases like: "it's important to note", "in today's fast-paced world", "in the realm of", "in essence", "ultimately", "moreover", "furthermore", "in conclusion"
- Overly balanced "not only X but also Y" structures
- Empty hedging and throat-clearing intros
- Perfectly uniform sentence lengths — vary them
- Bullet-point summaries when the input was prose

Make it sound conversational and direct. Use contractions. Let sentences breathe with natural rhythm. Do not add preamble or explanation — output only the rewritten text.`;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.GEMINI_API_KEY) {
    return json({ error: "Server not configured: missing GEMINI_API_KEY" }, 500);
  }

  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return json({ error: "Field 'text' is required" }, 400);
  if (text.length > 8000) return json({ error: "Text too long (max 8000 chars)" }, 400);

  const payload = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ role: "user", parts: [{ text }] }],
    generationConfig: {
      temperature: 0.9,
      topP: 0.95,
    },
  });

  let geminiRes: Response | null = null;
  let lastDetail = "";
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 800));
    geminiRes = await fetch(`${ENDPOINT}?key=${env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
    });
    if (geminiRes.ok) break;
    lastDetail = await geminiRes.text();
    if (geminiRes.status !== 503 && geminiRes.status !== 429) break;
  }

  if (!geminiRes || !geminiRes.ok) {
    const status = geminiRes?.status ?? 0;
    if (status === 503 || status === 429) {
      return json(
        { error: "Gemini is busy right now. Give it a few seconds and try again." },
        503,
      );
    }
    return json({ error: `Gemini API error: ${status}`, detail: lastDetail }, 502);
  }

  const data = (await geminiRes.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const rewritten = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!rewritten) return json({ error: "Empty response from model" }, 502);

  return json({ rewritten });
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
