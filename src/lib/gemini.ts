/**
 * Minimal client for the Gemini API's generateContent REST endpoint.
 *
 * SECURITY NOTE: This calls the Gemini API directly from the browser using
 * VITE_GEMINI_API_KEY, which means the key is bundled into the client JS and
 * visible to anyone who inspects network requests or the built bundle. That's
 * an acceptable tradeoff for a personal, locally-run app — but if this app is
 * ever deployed somewhere public, this key WILL be extractable by anyone who
 * visits the site. At that point, move this call behind a small backend/edge
 * function that holds the key server-side instead.
 *
 * Setup: create a .env file (already gitignored) with:
 *   VITE_GEMINI_API_KEY=your_key_here
 * Get a key at https://aistudio.google.com/apikey
 */

const DEFAULT_MODEL = 'gemini-2.5-flash';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function hasGeminiKey(): boolean {
  return Boolean(import.meta.env.VITE_GEMINI_API_KEY);
}

export async function askGemini(history: ChatMessage[], systemContext: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error(
      'No Gemini API key configured. Add VITE_GEMINI_API_KEY to a .env file in the project root, then restart the dev server.'
    );
  }
  const model = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || DEFAULT_MODEL;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemContext }] },
        contents: history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 400 && body.includes('API_KEY_INVALID')) {
      throw new Error('That Gemini API key looks invalid. Double-check it at aistudio.google.com/apikey.');
    }
    if (res.status === 429) {
      throw new Error("You've hit the Gemini free-tier rate limit. Wait a minute and try again.");
    }
    throw new Error(`Gemini request failed (${res.status}). ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  if (!text) throw new Error('Gemini returned an empty response. Try rephrasing your question.');
  return text;
}
