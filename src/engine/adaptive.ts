import type { Goal, WeighIn } from '@/types';
import { GOAL_META } from '@/types';

const KG_TOLERANCE_PER_WEEK = 0.1; // if actual vs target rate is off by more than this, adjust
const ADJUSTMENT_STEP_KCAL = 100;

export interface AdaptiveResult {
  adjustmentKcal: number; // apply on top of base target calories, can be negative
  actualRateKgPerWeek: number | null; // null if not enough data
  targetRateKgPerWeek: number;
  message: string;
  hasEnoughData: boolean;
}

/**
 * Compares the user's actual weight-change rate (from real logged weigh-ins,
 * over the last ~14 days / 2 check-ins) against their goal's target rate.
 * Recommends a ±100 kcal/day adjustment when off track by more than 0.1 kg/week.
 */
export function getAdaptiveAdjustment(weighIns: WeighIn[], goal: Goal): AdaptiveResult {
  const targetRateKgPerWeek = GOAL_META[goal].targetRateKgPerWeek;

  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));

  if (sorted.length < 2) {
    return {
      adjustmentKcal: 0,
      actualRateKgPerWeek: null,
      targetRateKgPerWeek,
      hasEnoughData: false,
      message: 'Log at least two weigh-ins to activate adaptive calorie adjustments.',
    };
  }

  // Use the earliest and latest weigh-in within the last 21 days (biweekly cadence with slack)
  const now = new Date(sorted[sorted.length - 1].date);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 21);

  const windowed = sorted.filter((w) => new Date(w.date) >= cutoff);
  const first = windowed[0] ?? sorted[0];
  const last = windowed[windowed.length - 1] ?? sorted[sorted.length - 1];

  const daysBetween = Math.max(1, (new Date(last.date).getTime() - new Date(first.date).getTime()) / 86_400_000);
  if (daysBetween < 7) {
    return {
      adjustmentKcal: 0,
      actualRateKgPerWeek: null,
      targetRateKgPerWeek,
      hasEnoughData: false,
      message: 'Keep logging weigh-ins — adaptive adjustments kick in after about a week of data.',
    };
  }

  const weightDeltaKg = last.weightKg - first.weightKg;
  const actualRateKgPerWeek = Math.round((weightDeltaKg / daysBetween) * 7 * 100) / 100;

  const diff = actualRateKgPerWeek - targetRateKgPerWeek; // +ve = losing/gaining slower than wanted... see below

  let adjustmentKcal = 0;
  let message = "You're right on track — no changes needed.";

  if (Math.abs(diff) > KG_TOLERANCE_PER_WEEK) {
    // If actual rate is "less negative" than target (losing too slowly) -> decrease calories.
    // If actual rate is "more negative" than target (losing too fast) -> increase calories.
    // For surplus goals, mirror the logic in the opposite direction.
    if (diff > 0) {
      // actual > target: for a loss goal this means losing too slowly (or gaining) -> cut calories
      // for a gain goal this means gaining too fast -> cut calories
      adjustmentKcal = -ADJUSTMENT_STEP_KCAL;
      message = `Progress is slower than planned. We recommend decreasing your daily calories by ${ADJUSTMENT_STEP_KCAL} kcal.`;
    } else {
      adjustmentKcal = ADJUSTMENT_STEP_KCAL;
      message = `Progress is faster than planned. We recommend increasing your daily calories by ${ADJUSTMENT_STEP_KCAL} kcal.`;
    }
  }

  return {
    adjustmentKcal,
    actualRateKgPerWeek,
    targetRateKgPerWeek,
    hasEnoughData: true,
    message,
  };
}
