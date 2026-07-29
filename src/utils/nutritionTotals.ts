import type { DailyLog, DailyTotals, Food, MealKey } from '@/types';
import { scaleFoodToGrams } from './unitConversion';

const MEAL_KEYS: MealKey[] = ['breakfast', 'lunch', 'dinner', 'snack'];

/** Sums a DailyLog into totals using a food lookup map (id -> Food). */
export function dayTotals(log: DailyLog, foodsById: Map<string, Food>): DailyTotals {
  const totals: DailyTotals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
  MEAL_KEYS.forEach((key) => {
    (log.meals[key] || []).forEach((entry) => {
      const food = foodsById.get(entry.foodId);
      if (!food) return;
      const scaled = scaleFoodToGrams(food, entry.grams);
      totals.kcal += scaled.kcal;
      totals.protein += scaled.protein;
      totals.carbs += scaled.carbs;
      totals.fat += scaled.fat;
      totals.fiber += scaled.fiber;
      totals.sugar += scaled.sugar;
    });
  });
  return {
    kcal: Math.round(totals.kcal),
    protein: Math.round(totals.protein),
    carbs: Math.round(totals.carbs),
    fat: Math.round(totals.fat),
    fiber: Math.round(totals.fiber),
    sugar: Math.round(totals.sugar),
  };
}

export function emptyTotals(): DailyTotals {
  return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 };
}
