/**
 * Vercel Serverless Function — proxies requests to the Gemini API so the key
 * never reaches the browser. Deployed automatically by Vercel from anything
 * under /api at the repo root; no extra config needed.
 *
 * Uses GEMINI_API_KEY (no VITE_ prefix — that's what keeps it server-only).
 * Set it in Vercel: Project Settings -> Environment Variables.
 *
 * Local testing: plain `npm run dev` does NOT run this function (Vite's dev
 * server doesn't execute /api routes). Use `vercel dev` instead to test the
 * assistant locally with this same code path Vercel uses in production —
 * install with `npm i -g vercel`, then `vercel dev` from the project root.
 * (The rest of the app works fine under plain `npm run dev`; only the
 * assistant needs `vercel dev`.)
 */

const DEFAULT_MODEL = 'gemini-flash-latest';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: { mimeType: string; base64: string };
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: 'GEMINI_API_KEY is not configured on the server. Add it in Vercel: Project Settings → Environment Variables, then redeploy.',
    });
    return;
  }

  const { history, systemContext } = (req.body ?? {}) as { history?: ChatMessage[]; systemContext?: string };
  if (!Array.isArray(history) || history.length === 0) {
    res.status(400).json({ error: 'Missing chat history in request body.' });
    return;
  }

  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: systemContext ? { parts: [{ text: systemContext }] } : undefined,
          contents: history.map((m) => ({
            role: m.role,
            parts: [
              ...(m.text ? [{ text: m.text }] : []),
              ...(m.image ? [{ inline_data: { mime_type: m.image.mimeType, data: m.image.base64 } }] : []),
            ],
          })),
          // Google Search grounding is OFF by default: it sits behind its own
          // quota (often requires billing enabled on the key, separate from
          // normal chat quota), and turning it on unconditionally caused every
          // request to fail with 429 on keys that don't have it enabled.
          // Set GEMINI_ENABLE_SEARCH=true in Vercel env vars once you've
          // confirmed grounding works on your key/tier to turn this back on.
          ...(process.env.GEMINI_ENABLE_SEARCH === 'true' ? { tools: [{ google_search: {} }] } : {}),
        }),
      }
    );

    if (!upstream.ok) {
      const body = await upstream.text().catch(() => '');
      if (upstream.status === 400 && body.includes('API_KEY_INVALID')) {
        res.status(400).json({ error: 'The configured Gemini API key is invalid.' });
        return;
      }
      if (upstream.status === 429) {
        res.status(429).json({
          error: body.toLowerCase().includes('search')
            ? `Gemini rejected the request (grounding/search quota): ${body.slice(0, 200)}`
            : "Gemini's rate limit was hit. Try again in a minute.",
        });
        return;
      }
      res.status(upstream.status).json({ error: `Gemini request failed (${upstream.status}). ${body.slice(0, 200)}` });
      return;
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!text) {
      res.status(502).json({ error: 'Gemini returned an empty response.' });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unexpected server error.' });
  }
}
