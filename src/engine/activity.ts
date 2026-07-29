import type { ActivityInputs, StepsBand, TrainingDaysBand } from '@/types';

/**
 * Base activity factor by training days/week band.
 * Bands: 0, 1-2, 3-4, 5-6, 7 — represented by their lower bound (0,1,3,5,7).
 */
const BASE_BY_TRAINING_DAYS: Record<TrainingDaysBand, number> = {
  0: 1.2,
  1: 1.35,
  3: 1.5,
  5: 1.65,
  7: 1.8,
};

/**
 * Bonus added on top of the training-days base, driven by average daily steps.
 * Represents non-exercise activity (NEAT).
 */
const STEP_BONUS: Record<StepsBand, number> = {
  'lt5k': 0,
  '5-7.5k': 0.05,
  '7.5-10k': 0.1,
  '10-12.5k': 0.15,
  'gt12.5k': 0.2,
};

export const TRAINING_DAYS_OPTIONS: { value: TrainingDaysBand; label: string }[] = [
  { value: 0, label: '0 days/week' },
  { value: 1, label: '1–2 days/week' },
  { value: 3, label: '3–4 days/week' },
  { value: 5, label: '5–6 days/week' },
  { value: 7, label: '7 days/week' },
];

export const STEPS_OPTIONS: { value: StepsBand; label: string }[] = [
  { value: 'lt5k', label: 'Under 5,000 steps/day' },
  { value: '5-7.5k', label: '5,000–7,500 steps/day' },
  { value: '7.5-10k', label: '7,500–10,000 steps/day' },
  { value: '10-12.5k', label: '10,000–12,500 steps/day' },
  { value: 'gt12.5k', label: 'Over 12,500 steps/day' },
];

/**
 * Blends training frequency with daily step count into a single TDEE
 * activity multiplier, clamped to a physiologically sane 1.2–1.9 range.
 */
export function getActivityFactor(inputs: ActivityInputs): number {
  const base = BASE_BY_TRAINING_DAYS[inputs.trainingDays] ?? 1.2;
  const bonus = STEP_BONUS[inputs.steps] ?? 0;
  const factor = base + bonus;
  return Math.min(1.9, Math.max(1.2, Math.round(factor * 100) / 100));
}
