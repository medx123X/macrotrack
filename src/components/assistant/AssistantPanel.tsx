import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Sparkles, AlertCircle } from 'lucide-react';
import type { Profile, NutritionPlan, DailyTotals } from '@/types';
import { askGemini, type ChatMessage } from '@/lib/gemini';

function buildSystemContext(profile: Profile, plan: NutritionPlan, totals: DailyTotals): string {
  return `You are a friendly, concise nutrition assistant inside "MacroTrack Egypt", a calorie/macro tracking app.
You can see the user's current profile and today's logged nutrition below. Use it to answer questions about
their progress, give food suggestions (the app has strong Egyptian food coverage — ful, koshary, molokhia, etc.
alongside international foods), or general nutrition guidance. Keep answers short and practical (a few sentences
unless asked for detail). You are not a doctor — for medical concerns, suggest they consult a professional.

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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const nextHistory: ChatMessage[] = [...messages, { role: 'user', text }];
    setMessages(nextHistory);
    setInput('');
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

        <div className="p-3 border-t border-[var(--glass-border)] flex items-center gap-2 shrink-0">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Ask about your nutrition…"
            className="flex-1 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-full px-4 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
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
