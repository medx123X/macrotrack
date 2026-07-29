import { Flame, Beef, Wheat, Droplet } from 'lucide-react';
import type { NutritionPlan } from '@/types';
import { Button, Card, StatCard } from '@/components/ui';

export function PlanReveal({ plan, onStart }: { plan: NutritionPlan; onStart: () => void }) {
  return (
    <div className="min-h-screen p-5 pb-10 max-w-md mx-auto flex flex-col">
      <div className="text-center mt-6 mb-8">
        <div className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-primary)' }}>
          Your Plan Is Ready
        </div>
        <h2 className="text-3xl font-extrabold">{plan.goalLabel}</h2>
        <p className="text-sm text-[var(--color-on-surface-variant)] mt-2">
          Built from your Mifflin-St Jeor BMR and blended activity factor.
        </p>
      </div>

      <Card elevated padding="lg" className="text-center mb-5">
        <Flame size={28} color="var(--color-primary)" className="mx-auto mb-2" />
        <div className="font-mono-num text-4xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
          {plan.targetCalories}
        </div>
        <div className="text-xs uppercase tracking-wide text-[var(--color-outline)] mt-1">Daily Calorie Target</div>
      </Card>

      <div className="grid grid-cols-3 gap-2.5 mb-5">
        <StatCard label="Protein" value={`${plan.protein}g`} color="var(--color-protein)" />
        <StatCard label="Carbs" value={`${plan.carbs}g`} color="var(--color-carbs)" />
        <StatCard label="Fat" value={`${plan.fat}g`} color="var(--color-fat)" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-5">
        <StatCard label="BMR" value={plan.bmr} sub="Basal Metabolism" />
        <StatCard label="TDEE" value={plan.tdee} sub="Daily Expenditure" />
        <StatCard label="BMI" value={plan.bmi} sub={plan.bmiClass} />
        <StatCard label="Water Target" value={`${(plan.water / 1000).toFixed(1)}L`} color="var(--color-water)" />
      </div>

      <Card padding="sm" className="mb-8 flex items-center gap-3">
        <div className="flex gap-1.5">
          <Beef size={16} color="var(--color-protein)" />
          <Wheat size={16} color="var(--color-carbs)" />
          <Droplet size={16} color="var(--color-fat)" />
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)]">
          Healthy weight range: {plan.healthyWeightMinKg}–{plan.healthyWeightMaxKg} kg. We'll refine your calories automatically as you log weekly weigh-ins.
        </p>
      </Card>

      <Button size="lg" onClick={onStart} className="mt-auto">Start Tracking</Button>
    </div>
  );
}
