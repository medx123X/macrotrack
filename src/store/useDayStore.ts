import { create } from 'zustand';
import type { DailyLog, DailyTotals, Food, MealEntry, MealKey } from '@/types';
import { logRepository, foodRepository } from '@/repositories';
import { dayTotals, emptyTotals } from '@/utils/nutritionTotals';
import { todayStr } from '@/utils/date';

interface DayState {
  date: string;
  log: DailyLog | undefined;
  foodsById: Map<string, Food>;
  loaded: boolean;

  loadFoods: () => Promise<void>;
  loadDay: (profileId: string, date?: string) => Promise<void>;
  totals: () => DailyTotals;
  addFood: (profileId: string, mealKey: MealKey, food: Food, grams: number) => Promise<void>;
  removeEntry: (profileId: string, entryId: string) => Promise<void>;
  updateEntryGrams: (profileId: string, entryId: string, grams: number) => Promise<void>;
  addWater: (profileId: string, ml: number) => Promise<void>;
}

export const useDayStore = create<DayState>((set, get) => ({
  date: todayStr(),
  log: undefined,
  foodsById: new Map(),
  loaded: false,

  loadFoods: async () => {
    const all = await foodRepository.getAllFoods();
    set({ foodsById: new Map(all.map((f) => [f.id, f])) });
  },

  loadDay: async (profileId, date = todayStr()) => {
    if (get().foodsById.size === 0) await get().loadFoods();
    const log = await logRepository.getDay(profileId, date);
    set({ date, log, loaded: true });
  },

  totals: () => {
    const { log, foodsById } = get();
    if (!log) return emptyTotals();
    return dayTotals(log, foodsById);
  },

  addFood: async (profileId, mealKey, food, grams) => {
    const { date } = get();
    const entry: MealEntry = {
      id: `${food.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      foodId: food.id,
      grams,
      loggedAt: new Date().toISOString(),
    };
    const log = await logRepository.addEntry(profileId, date, mealKey, entry);
    await foodRepository.pushRecent(food.id);
    set({ log });
  },

  removeEntry: async (profileId, entryId) => {
    const { date } = get();
    const log = await logRepository.removeEntry(profileId, date, entryId);
    set({ log });
  },

  updateEntryGrams: async (profileId, entryId, grams) => {
    const { date } = get();
    const log = await logRepository.updateEntryGrams(profileId, date, entryId, grams);
    set({ log });
  },

  addWater: async (profileId, ml) => {
    const { date } = get();
    const log = await logRepository.addWater(profileId, date, ml);
    set({ log });
  },
}));
