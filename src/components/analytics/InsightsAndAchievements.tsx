import { Sparkles, TrendingUp, Droplet, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DailyLog, Food, NutritionPlan } from '@/types';
import { Card } from '@/components/ui';
import { dayTotals } from '@/utils/nutritionTotals';

interface Insight {
  icon: typeof Sparkles;
  title: string;
  body: string;
}

/** Derives simple, honest insights from real logged data — no fabricated numbers. */
function buildInsights(logs: DailyLog[], foodsById: Map<string, Food>, plan: NutritionPlan): Insight[] {
  if (logs.length === 0) {
    return [{ icon: Info, title: 'Not enough data yet', body: 'Log a few days of meals and we\'ll surface real patterns here.' }];
  }
  const totalsPerDay = logs.map((l) => dayTotals(l, foodsById));
  const avgProtein = Math.round(totalsPerDay.reduce((s, t) => s + t.protein, 0) / totalsPerDay.length);
  const avgKcal = Math.round(totalsPerDay.reduce((s, t) => s + t.kcal, 0) / totalsPerDay.length);
  const insights: Insight[] = [];

  if (avgProtein < plan.protein * 0.9) {
    insights.push({
      icon: TrendingUp,
      title: 'Protein Below Target',
      body: `Your average protein intake is ${avgProtein}g, below your ${plan.protein}g goal. Try adding ful, eggs, or grilled chicken to close the gap.`,
    });
  } else {
    insights.push({
      icon: TrendingUp,
      title: 'Protein On Track',
      body: `You're averaging ${avgProtein}g of protein per day against a ${plan.protein}g goal — solid consistency.`,
    });
  }

  if (avgKcal > plan.targetCalories * 1.1) {
    insights.push({
      icon: Info,
      title: 'Calories Trending High',
      body: `Your average intake (${avgKcal} kcal) is running above your ${plan.targetCalories} kcal target this period.`,
    });
  }

  insights.push({
    icon: Droplet,
    title: 'Stay Hydrated',
    body: 'Consistent water intake helps keep weight fluctuations from logged weigh-ins more accurate.',
  });

  return insights;
}

export function AIInsightsList({ logs, foodsById, plan }: { logs: DailyLog[]; foodsById: Map<string, Food>; plan: NutritionPlan }) {
  const insights = buildInsights(logs, foodsById, plan);
  return (
    <Card padding="lg">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={18} color="var(--color-primary)" />
        <div>
          <h3 className="font-bold text-sm">AI Health Insights</h3>
          <p className="text-[11px] text-[var(--color-outline)]">Personalized for your metabolic profile</p>
        </div>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins) => (
          <div key={ins.title} className="glass rounded-md p-3 flex gap-2.5 items-start">
            <ins.icon size={15} color="var(--color-primary)" className="mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-bold mb-0.5">{ins.title}</div>
              <p className="text-xs text-[var(--color-on-surface-variant)]">{ins.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function AchievementsList({ longestStreak, daysLogged, proteinStreak }: { longestStreak: number; daysLogged: number; proteinStreak: number }) {
  const achievements = [
    { label: 'Protein Goal Streak', value: `${proteinStreak} days`, pct: Math.min(100, (proteinStreak / 7) * 100), color: 'var(--color-protein)' },
    { label: 'Longest Streak', value: `${longestStreak} days`, pct: Math.min(100, (longestStreak / 30) * 100), color: 'var(--color-tertiary)' },
    { label: 'Total Days Logged', value: `${daysLogged}`, pct: Math.min(100, (daysLogged / 30) * 100), color: 'var(--color-secondary)' },
  ];
  return (
    <Card padding="lg">
      <h3 className="font-bold text-sm mb-3">Other Achievements</h3>
      <div className="space-y-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08, ease: 'easeOut' }}
          >
            <div className="flex justify-between text-xs mb-1">
              <span className="font-semibold text-[var(--color-on-surface-variant)]">{a.label}</span>
              <span className="font-mono-num font-bold">{a.value}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: a.color }}
                initial={false}
                animate={{ width: `${a.pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </Card>
  );
}
