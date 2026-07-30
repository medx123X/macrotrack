export type Gender = 'male' | 'female';

export type Goal = 'lose' | 'recomp' | 'maintain' | 'leanbulk' | 'musclegain';

export type TrainingDaysBand = 0 | 1 | 3 | 5 | 7; // representative value of band 0,1-2,3-4,5-6,7
export type StepsBand = 'lt5k' | '5-7.5k' | '7.5-10k' | '10-12.5k' | 'gt12.5k';

export interface ActivityInputs {
  trainingDays: TrainingDaysBand;
  steps: StepsBand;
}

export interface Profile {
  id: string;
  name: string;
  pin?: string;
  /** Data URL (base64) of a resized/compressed profile photo. Optional — falls
   *  back to initials avatar wherever it's missing. Kept small (resized client-
   *  side to ~256px, JPEG ~0.85 quality) since it's stored directly in IndexedDB
   *  and included in the JSON export/import. */
  photoUrl?: string;
  age: number;
  gender: Gender;
  heightCm: number;
  weightKg: number; // current/starting weight, updated on check-ins
  goal: Goal;
  activity: ActivityInputs;
  units: 'metric' | 'imperial';
  createdAt: string;
  updatedAt: string;
}

export interface WeighIn {
  id: string;
  profileId: string;
  date: string; // yyyy-mm-dd
  weightKg: number;
  waistCm?: number;
  createdAt: string;
}

export interface NutritionPlan {
  bmr: number;
  activityFactor: number;
  tdee: number;
  targetCalories: number;
  adaptiveAdjustment: number; // kcal delta applied on top of base target, can be negative
  protein: number;
  carbs: number;
  fat: number;
  water: number; // ml
  bmi: number;
  bmiClass: 'Underweight' | 'Normal' | 'Overweight' | 'Obese';
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
  bodyFatEstimate: number;
  weeklyChangeKg: number; // projected, +ve = losing
  goalLabel: string;
}

export const GOAL_META: Record<Goal, { label: string; targetRateKgPerWeek: number; calMultiplier: number; proteinGPerKg: number }> = {
  lose: { label: 'Lose Fat', targetRateKgPerWeek: -0.4, calMultiplier: 0.8, proteinGPerKg: 2.2 },
  recomp: { label: 'Body Recomposition', targetRateKgPerWeek: -0.15, calMultiplier: 0.92, proteinGPerKg: 2.2 },
  maintain: { label: 'Maintain Weight', targetRateKgPerWeek: 0, calMultiplier: 1.0, proteinGPerKg: 1.8 },
  leanbulk: { label: 'Lean Bulk', targetRateKgPerWeek: 0.25, calMultiplier: 1.1, proteinGPerKg: 2.0 },
  musclegain: { label: 'Muscle Gain', targetRateKgPerWeek: 0.35, calMultiplier: 1.15, proteinGPerKg: 2.2 },
};
