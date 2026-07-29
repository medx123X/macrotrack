import { useEffect } from 'react';
import { Download } from 'lucide-react';
import type { NutritionPlan, Profile, WeighIn } from '@/types';
import { WeeklyCaloriesChart, MacroDonutChart, ProteinConsistencyChart, WeightTrajectoryChart } from '@/components/analytics/AnalyticsCharts';
import { AIInsightsList, AchievementsList } from '@/components/analytics/InsightsAndAchievements';
import { useHistory } from '@/hooks/useHistory';
import { useDayStore } from '@/store/useDayStore';
import { Button } from '@/components/ui';
import { computeStreaks, computeProteinGoalStreak } from '@/utils/streaks';
import { dayTotals } from '@/utils/nutritionTotals';
import { logRepository } from '@/repositories';
import { useState } from 'react';
import type { DailyLog } from '@/types';

export function AnalyticsPage({ profile, plan, weighIns }: { profile: Profile; plan: NutritionPlan; weighIns: WeighIn[] }) {
  const { logs, foodsById } = useHistory(profile.id, 7);
  const { totals, loadDay, loadFoods } = useDayStore();
  const [allLogs, setAllLogs] = useState<DailyLog[]>([]);

  useEffect(() => {
    loadFoods();
    loadDay(profile.id);
    logRepository.getAll(profile.id).then(setAllLogs);
  }, [profile.id]);

  const streaks = computeStreaks(allLogs);
  const proteinStreak = computeProteinGoalStreak(allLogs, plan.protein, (l) => dayTotals(l, foodsById));

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wide text-[var(--color-outline)]">Performance Dashboard</div>
          <h1 className="text-2xl font-extrabold" style={{ color: 'var(--color-primary)' }}>Analytics</h1>
        </div>
        <Button variant="secondary" size="sm"><Download size={14} /> Export PDF</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <WeeklyCaloriesChart logs={logs} foodsById={foodsById} />
        <MacroDonutChart totals={totals()} />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ProteinConsistencyChart logs={logs} foodsById={foodsById} target={plan.protein} />
        <WeightTrajectoryChart weighIns={weighIns} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <AIInsightsList logs={logs} foodsById={foodsById} plan={plan} />
        <AchievementsList
          currentStreak={streaks.currentStreak}
          longestStreak={streaks.longestStreak}
          daysLogged={streaks.daysLogged}
          proteinStreak={proteinStreak}
        />
      </div>
    </div>
  );
}
