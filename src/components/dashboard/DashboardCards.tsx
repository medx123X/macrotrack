import { Beef, Wheat, Droplet, GlassWater, Lightbulb } from 'lucide-react';
import type { DailyTotals, NutritionPlan } from '@/types';
import { Card, ProgressRing, StatCard } from '@/components/ui';

export function CalorieRingCard({ totals, plan }: { totals: DailyTotals; plan: NutritionPlan }) {
  const remaining = plan.targetCalories - totals.kcal;
  const pctReached = plan.targetCalories > 0 ? Math.round((totals.kcal / plan.targetCalories) * 100) : 0;
  return (
    <Card padding="lg" className="flex flex-col items-center text-center">
      <div className="self-start font-bold text-sm mb-1">Daily Calories</div>
      <div className="relative flex items-center justify-center my-2">
        <ProgressRing size={180} stroke={14} progress={totals.kcal / Math.max(1, plan.targetCalories)} color="var(--color-primary)" />
        <div className="absolute flex flex-col items-center">
          <span className="font-mono-num text-4xl font-extrabold">{totals.kcal.toLocaleString()}</span>
          <span className="text-[11px] uppercase tracking-wide text-[var(--color-outline)]">of {plan.targetCalories.toLocaleString()} kcal</span>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <span className="text-xs font-semibold px-3 py-1 rounded-full glass">{pctReached}% Reached</span>
        <span className="text-xs font-semibold px-3 py-1 rounded-full glass">
          {remaining >= 0 ? `${remaining} kcal left` : `${Math.abs(remaining)} kcal over`}
        </span>
      </div>
    </Card>
  );
}

export function MacroRingsGrid({ totals, plan }: { totals: DailyTotals; plan: NutritionPlan }) {
  const rings = [
    { label: 'Protein', icon: Beef, value: totals.protein, target: plan.protein, color: 'var(--color-protein)', unit: 'g' },
    { label: 'Carbs', icon: Wheat, value: totals.carbs, target: plan.carbs, color: 'var(--color-carbs)', unit: 'g' },
    { label: 'Fat', icon: Droplet, value: totals.fat, target: plan.fat, color: 'var(--color-fat)', unit: 'g' },
    { label: 'Water', icon: GlassWater, value: 0, target: plan.water / 1000, color: 'var(--color-water)', unit: 'L' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {rings.map((r) => (
        <Card key={r.label} padding="md" className="flex flex-col items-center text-center" style={{ borderColor: r.color }}>
          <div className="self-start flex items-center gap-1.5 text-xs font-bold mb-1" style={{ color: r.color }}>
            <r.icon size={13} /> {r.label.toUpperCase()}
          </div>
          <div className="relative flex items-center justify-center my-1">
            <ProgressRing size={90} stroke={8} progress={r.value / Math.max(0.001, r.target)} color={r.color} />
            <div className="absolute flex flex-col items-center">
              <span className="font-mono-num text-lg font-bold">{r.unit === 'L' ? r.value.toFixed(1) : Math.round(r.value)}{r.unit}</span>
            </div>
          </div>
          <div className="text-[10px] text-[var(--color-outline)] uppercase">Goal: {r.unit === 'L' ? r.target.toFixed(1) : Math.round(r.target)}{r.unit}</div>
        </Card>
      ))}
    </div>
  );
}

export function MetabolicStatsCard({ plan }: { plan: NutritionPlan }) {
  return (
    <Card padding="lg">
      <h3 className="font-bold text-base mb-3" style={{ color: 'var(--color-primary)' }}>Metabolic Stats</h3>
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <StatCard label="BMI" value={plan.bmi} sub={plan.bmiClass} />
        <StatCard label="BMR" value={plan.bmr} sub="Basal Metabolism" />
        <StatCard label="TDEE" value={plan.tdee} sub="Daily Expenditure" />
        <StatCard label="Goal" value={plan.goalLabel.split(' ')[0]} sub={plan.goalLabel} />
      </div>
      <div className="glass rounded-md p-3 flex gap-2.5 items-start">
        <Lightbulb size={16} color="var(--color-primary)" className="mt-0.5 shrink-0" />
        <div>
          <div className="text-xs font-bold mb-0.5">Egyptian Superfood Tip</div>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            Ful Medames is high in plant protein and fiber — a great way to close out your protein goal today.
          </p>
        </div>
      </div>
    </Card>
  );
}
