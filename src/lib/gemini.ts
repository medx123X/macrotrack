/**
 * Client for the app's own /api/gemini serverless function (see api/gemini.ts
 * at the repo root). The browser never sees the actual Gemini API key —
 * only this app's own domain, which forwards to Google server-side.
 */

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  /** Optional photo attached to a user message (nutrition label, packaging, plate of food, etc). */
  image?: { mimeType: string; base64: string };
}

export async function askGemini(history: ChatMessage[], systemContext: string): Promise<string> {
  const res = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ history, systemContext }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || `Assistant request failed (${res.status}).`);
  }
  if (!data?.text) {
    throw new Error('Assistant returned an empty response. Try rephrasing your question.');
  }
  return data.text as string;
}
