import type { DailyTotals, Food } from '@/types';

/** Scales a food's per-100g base nutrition to an arbitrary gram amount. */
export function scaleFoodToGrams(food: Food, grams: number): DailyTotals {
  const factor = grams / 100;
  const b = food.basePer100g;
  return {
    kcal: Math.round(b.kcal * factor),
    protein: Math.round(b.protein * factor * 10) / 10,
    carbs: Math.round(b.carbs * factor * 10) / 10,
    fat: Math.round(b.fat * factor * 10) / 10,
    fiber: Math.round(b.fiber * factor * 10) / 10,
    sugar: Math.round(b.sugar * factor * 10) / 10,
  };
}

/** Scales to the food's default serving size (qty = number of servings). */
export function scaleFoodToServings(food: Food, qty: number): DailyTotals {
  return scaleFoodToGrams(food, food.defaultServingGrams * qty);
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10;
}

export function cmToFtIn(cm: number): { ft: number; inch: number } {
  const totalInches = cm / 2.54;
  const ft = Math.floor(totalInches / 12);
  const inch = Math.round(totalInches % 12);
  return { ft, inch };
}

export function ftInToCm(ft: number, inch: number): number {
  return Math.round((ft * 12 + inch) * 2.54);
}

export function mlToFlOz(ml: number): number {
  return Math.round((ml / 29.5735) * 10) / 10;
}
