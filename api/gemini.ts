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
const FALLBACK_MODEL = 'gemini-3.6-flash';

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

  const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const modelsToTry = [primaryModel, ...(FALLBACK_MODEL !== primaryModel ? [FALLBACK_MODEL] : [])];

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 503 means Gemini's own servers are momentarily overloaded (not our fault,
  // not a quota issue) — usually resolved within seconds, so retry a couple
  // of times with backoff. If it's still 503ing after that, it may be a
  // capacity issue specific to that one model, so try a fallback model too
  // before giving up.
  const MAX_ATTEMPTS_PER_MODEL = 3;

  try {
    let upstream: Response | null = null;
    let lastBody = '';

    outer: for (const model of modelsToTry) {
      const requestBody = JSON.stringify({
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
        // It's also skipped whenever any message carries an image: combining
        // the grounding tool with inline image data has been observed to
        // trigger MALFORMED_FUNCTION_CALL on some Gemini models.
        ...(process.env.GEMINI_ENABLE_SEARCH === 'true' && !history.some((m) => m.image)
          ? { tools: [{ google_search: {} }] }
          : {}),
      });

      for (let attempt = 1; attempt <= MAX_ATTEMPTS_PER_MODEL; attempt++) {
        upstream = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: requestBody,
          }
        );

        // 429 = quota exhausted for this specific model (often per-model daily
        // cap) — retrying the same model won't help, but a different model may
        // still have quota, so move straight to the next one in modelsToTry.
        if (upstream.status === 429) continue outer;

        if (upstream.status !== 503) break outer;

        lastBody = await upstream.text().catch(() => '');
        await sleep(Math.min(500 * 2 ** (attempt - 1), 2000)); // 500ms, 1s, 2s
      }
      // Exhausted retries on this model and it's still 503 — loop continues
      // to the next model in modelsToTry, if any.
    }

    if (!upstream) {
      res.status(502).json({ error: 'No response from Gemini.' });
      return;
    }

    if (!upstream.ok) {
      const body = upstream.status === 503 && lastBody ? lastBody : await upstream.text().catch(() => '');
      if (upstream.status === 400 && body.includes('API_KEY_INVALID')) {
        res.status(400).json({ error: 'The configured Gemini API key is invalid.' });
        return;
      }
      if (upstream.status === 429) {
        res.status(429).json({
          error: body.toLowerCase().includes('search')
            ? `Gemini rejected the request (grounding/search quota): ${body.slice(0, 200)}`
            : "Daily free-tier limit reached on all available models. This resets at midnight Pacific time.",
        });
        return;
      }
      if (upstream.status === 503) {
        res.status(503).json({ error: "Gemini's servers are experiencing high demand right now. Please try again in a moment." });
        return;
      }
      res.status(upstream.status).json({ error: `Gemini request failed (${upstream.status}). ${body.slice(0, 200)}` });
      return;
    }

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    if (!text) {
      const finishReason = data?.candidates?.[0]?.finishReason;
      const blockReason = data?.promptFeedback?.blockReason;
      if (blockReason) {
        res.status(502).json({
          error: `Gemini blocked this request (${blockReason}). Try a different photo or rephrase your question.`,
        });
        return;
      }
      if (finishReason === 'SAFETY') {
        res.status(502).json({
          error: "Gemini flagged this photo/message under its safety filters and wouldn't respond. Try a clearer or different photo.",
        });
        return;
      }
      if (finishReason === 'MAX_TOKENS') {
        res.status(502).json({ error: 'Gemini ran out of room mid-response. Try asking a more specific question.' });
        return;
      }
      if (finishReason === 'MALFORMED_FUNCTION_CALL') {
        res.status(502).json({
          error: 'Gemini had a tool-calling glitch on that request. Please try sending it again.',
        });
        return;
      }
      res.status(502).json({
        error: `Gemini returned an empty response${finishReason ? ` (reason: ${finishReason})` : ''}.`,
      });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Unexpected server error.' });
  }
}
