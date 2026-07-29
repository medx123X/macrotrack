/** Base nutrition is always stored per 100g so any serving/gram amount can be scaled. */
export interface Food {
  id: string;
  name: string;
  cat: string;
  emoji: string;
  /** Optional photo URL. Falls back to `emoji` wherever it's missing, so partial
   *  coverage never breaks the UI. Populated by scripts/fetch-food-images.ts. */
  imageUrl?: string;
  defaultServingLabel: string; // e.g. "1 bowl (250g)"
  defaultServingGrams: number;
  basePer100g: {
    kcal: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
  };
  isCustom?: boolean;
}

export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealEntry {
  id: string;
  foodId: string;
  grams: number; // actual logged amount in grams (serving * qty, or custom grams)
  loggedAt: string;
}

export interface DailyLog {
  date: string; // yyyy-mm-dd, primary key
  profileId: string;
  meals: Record<MealKey, MealEntry[]>;
  waterMl: number;
}

export interface DailyTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface MealTemplate {
  id: string;
  profileId: string;
  name: string;
  mealKey: MealKey;
  items: { foodId: string; grams: number }[];
}
