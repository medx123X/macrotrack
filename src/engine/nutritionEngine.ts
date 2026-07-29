import type { NutritionPlan, Profile, WeighIn } from '@/types';
import { GOAL_META } from '@/types';
import { getActivityFactor } from './activity';
import { getAdaptiveAdjustment } from './adaptive';

/**
 * BMR calculation strategies. Only Mifflin-St Jeor is implemented for v1;
 * Katch-McArdle / Cunningham can be added here later without touching callers.
 */
function bmrMifflinStJeor(weightKg: number, heightCm: number, age: number, gender: Profile['gender']): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'male' ? base + 5 : base - 161;
}

function calcBmi(weightKg: number, heightCm: number): number {
  return weightKg / (heightCm / 100) ** 2;
}

function classifyBmi(bmi: number): NutritionPlan['bmiClass'] {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

function estimateBodyFat(bmi: number, age: number, gender: Profile['gender']): number {
  const base = gender === 'male' ? 1.2 * bmi + 0.23 * age - 16.2 : 1.2 * bmi + 0.23 * age - 5.4;
  return Math.round(base * 10) / 10;
}

/**
 * Single source of truth for the entire nutrition plan.
 * BMI -> BMR -> Activity -> TDEE -> Adaptive Calories -> Macros -> Water -> Summary
 */
export function calculateNutritionPlan(
  profile: Profile,
  weighIns: WeighIn[] = [],
  opts?: { adaptiveEnabled?: boolean; proteinGPerKgOverride?: number; fatGPerKgOverride?: number }
): NutritionPlan {
  const { weightKg, heightCm, age, gender, goal, activity } = profile;
  const adaptiveEnabled = opts?.adaptiveEnabled ?? true;

  const bmr = bmrMifflinStJeor(weightKg, heightCm, age, gender);
  const activityFactor = getActivityFactor(activity);
  const tdee = bmr * activityFactor;

  const goalMeta = GOAL_META[goal];
  const baseCalories = tdee * goalMeta.calMultiplier;

  const adaptive = adaptiveEnabled
    ? getAdaptiveAdjustment(weighIns, goal)
    : { adjustmentKcal: 0, actualRateKgPerWeek: null, targetRateKgPerWeek: goalMeta.targetRateKgPerWeek, hasEnoughData: false, message: '' };

  const targetCalories = Math.round(baseCalories + adaptive.adjustmentKcal);

  const proteinGPerKg = opts?.proteinGPerKgOverride ?? goalMeta.proteinGPerKg;
  const protein = Math.round(weightKg * proteinGPerKg);

  const fatGPerKg = opts?.fatGPerKgOverride;
  const fat = fatGPerKg
    ? Math.round(weightKg * fatGPerKg)
    : Math.round((targetCalories * 0.25) / 9);

  const carbsCal = targetCalories - protein * 4 - fat * 9;
  const carbs = Math.max(0, Math.round(carbsCal / 4));

  const bmi = calcBmi(weightKg, heightCm);
  const healthyWeightMinKg = Math.round(18.5 * (heightCm / 100) ** 2);
  const healthyWeightMaxKg = Math.round(24.9 * (heightCm / 100) ** 2);
  const bodyFatEstimate = estimateBodyFat(bmi, age, gender);

  const highActivityBonus = activityFactor >= 1.7 ? 500 : 0;
  const water = Math.round(weightKg * 35 + highActivityBonus);

  const deficit = tdee - targetCalories;
  const weeklyChangeKg = Math.round(((deficit * 7) / 7700) * 100) / 100;

  return {
    bmr: Math.round(bmr),
    activityFactor,
    tdee: Math.round(tdee),
    targetCalories,
    adaptiveAdjustment: adaptive.adjustmentKcal,
    protein,
    carbs,
    fat,
    water,
    bmi: Math.round(bmi * 10) / 10,
    bmiClass: classifyBmi(bmi),
    healthyWeightMinKg,
    healthyWeightMaxKg,
    bodyFatEstimate,
    weeklyChangeKg,
    goalLabel: goalMeta.label,
  };
}

export { getActivityFactor } from './activity';
export { getAdaptiveAdjustment } from './adaptive';
export type { AdaptiveResult } from './adaptive';
