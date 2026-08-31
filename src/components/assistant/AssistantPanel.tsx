import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles, AlertCircle, Paperclip, XCircle } from 'lucide-react';
import type { Profile, NutritionPlan, DailyTotals } from '@/types';
import { askGemini, type ChatMessage } from '@/lib/gemini';
import { fileToBase64Image } from '@/utils/image';

function buildSystemContext(profile: Profile, plan: NutritionPlan, totals: DailyTotals): string {
  return `You are a friendly, concise nutrition assistant inside "MacroTrack Egypt", a calorie/macro tracking app.
You can see the user's current profile and today's logged nutrition below. Use it to answer questions about
their progress, give food suggestions (the app has strong Egyptian food coverage — ful, koshary, molokhia, etc.
alongside international foods), or general nutrition guidance. Keep answers short and practical (a few sentences
unless asked for detail). You are not a doctor — for medical concerns, suggest they consult a professional.

The user can attach a photo. If they do, look at it and help with whatever it is:
- Nutrition facts panel (e.g. the back of a UK/Egyptian packaged product): read off calories, protein, carbs,
  fat, and serving size as printed, and note the serving size clearly since that's what the numbers refer to.
- A packaged product where the label isn't fully visible, or a product's front packaging/logo only: use search
  to identify the product and its brand-published or typical nutrition facts, and say clearly that these are
  looked up rather than read off the packaging in front of them.
- A plate of food, meal, or restaurant dish: give your best estimate of calories and macros based on what's
  visible, and say clearly that it's an estimate.
Always state your source (label vs. search vs. visual estimate) so the user knows how reliable the number is.

USER PROFILE
Name: ${profile.name}
Age: ${profile.age}, Gender: ${profile.gender}
Height: ${profile.heightCm}cm, Current weight: ${profile.weightKg}kg
Goal: ${plan.goalLabel}

DAILY TARGETS
Calories: ${plan.targetCalories} kcal
Protein: ${plan.protein}g, Carbs: ${plan.carbs}g, Fat: ${plan.fat}g
Water: ${(plan.water / 1000).toFixed(1)}L

TODAY SO FAR
Calories eaten: ${totals.kcal} kcal (${Math.max(0, plan.targetCalories - totals.kcal)} remaining)
Protein: ${totals.protein}g, Carbs: ${totals.carbs}g, Fat: ${totals.fat}g`;
}

export function AssistantPanel({
  profile,
  plan,
  totals,
  onClose,
}: {
  profile: Profile;
  plan: NutritionPlan;
  totals: DailyTotals;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingImage, setPendingImage] = useState<{ dataUrl: string; base64: string; mimeType: string } | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleFilePicked = async (file: File | undefined) => {
    if (!file) return;
    setImageError(null);
    try {
      const img = await fileToBase64Image(file);
      setPendingImage(img);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not read that image.');
    }
  };

  const send = async () => {
    const text = input.trim();
    if ((!text && !pendingImage) || loading) return;
    setError(null);
    const nextHistory: ChatMessage[] = [
      ...messages,
      {
        role: 'user',
        text: text || (pendingImage ? 'What can you tell me about this?' : ''),
        ...(pendingImage ? { image: { mimeType: pendingImage.mimeType, base64: pendingImage.base64 } } : {}),
      },
    ];
    setMessages(nextHistory);
    setInput('');
    setPendingImage(null);
    setLoading(true);
    try {
      const reply = await askGemini(nextHistory, buildSystemContext(profile, plan, totals));
      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 md:bg-transparent"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="fixed inset-x-0 bottom-0 h-[82vh] rounded-t-2xl md:inset-x-auto md:left-4 md:bottom-24 md:h-[560px] md:w-96 md:rounded-2xl z-50 glass-modal flex flex-col overflow-hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[var(--glass-border)] shrink-0">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4285F4, #9B72CB, #D96570)' }}
          >
            <Sparkles size={15} color="#fff" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm">Assistant</div>
            <div className="text-[10px] text-[var(--color-outline)]">Knows your goals & today's log</div>
          </div>
          <button onClick={onClose} className="cursor-pointer p-1"><X size={18} /></button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-xs text-[var(--color-outline)] text-center py-8">
              Ask me anything about your nutrition — e.g. "What should I eat for dinner to hit my protein goal?"
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap"
                style={
                  m.role === 'user'
                    ? { background: 'var(--color-primary)', color: 'var(--color-on-primary)' }
                    : { background: 'var(--color-surface-container-high)', color: 'var(--color-on-surface)' }
                }
              >
                {m.image && (
                  <img
                    src={`data:${m.image.mimeType};base64,${m.image.base64}`}
                    alt="Attached"
                    className="rounded-lg mb-2 max-h-40 w-auto"
                  />
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-3.5 py-2.5 flex gap-1" style={{ background: 'var(--color-surface-container-high)' }}>
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-current opacity-60"
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 text-xs rounded-lg p-3" style={{ background: 'color-mix(in srgb, var(--color-error) 14%, transparent)', color: 'var(--color-error)' }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {imageError && (
          <div className="mx-3 mb-2 flex items-start gap-2 text-xs rounded-lg p-2.5 shrink-0" style={{ background: 'color-mix(in srgb, var(--color-error) 14%, transparent)', color: 'var(--color-error)' }}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{imageError}</span>
          </div>
        )}

        {pendingImage && (
          <div className="mx-3 mb-2 flex items-center gap-2 shrink-0">
            <div className="relative">
              <img src={pendingImage.dataUrl} alt="Attached preview" className="h-14 w-14 object-cover rounded-lg border border-[var(--color-outline-variant)]" />
              <button
                onClick={() => setPendingImage(null)}
                aria-label="Remove attached photo"
                className="absolute -top-1.5 -right-1.5 cursor-pointer rounded-full bg-[var(--color-surface)]"
              >
                <XCircle size={16} />
              </button>
            </div>
            <span className="text-xs text-[var(--color-outline)]">Photo attached — ask about it or just send</span>
          </div>
        )}

        <div className="p-3 border-t border-[var(--glass-border)] flex items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              handleFilePicked(e.target.files?.[0]);
              e.target.value = '';
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Attach photo"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer text-[var(--color-outline)] hover:text-[var(--color-on-surface)]"
          >
            <Paperclip size={18} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about your nutrition, or attach a photo…"
            className="flex-1 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={send}
            disabled={loading || (!input.trim() && !pendingImage)}
            aria-label="Send"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          >
            <Send size={16} />
          </button>
        </div>
      </motion.div>
    </>
  );
}
