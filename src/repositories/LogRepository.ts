import type { DailyLog, MealKey, MealEntry, WeighIn } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

function emptyDay(profileId: string, date: string): DailyLog {
  return { profileId, date, meals: { breakfast: [], lunch: [], dinner: [], snack: [] }, waterMl: 0 };
}

export class LogRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  async getDay(profileId: string, date: string): Promise<DailyLog> {
    const log = await this.provider.getDailyLog(profileId, date);
    return log ?? emptyDay(profileId, date);
  }

  getRange(profileId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
    return this.provider.getDailyLogsInRange(profileId, startDate, endDate);
  }

  getAll(profileId: string): Promise<DailyLog[]> {
    return this.provider.getAllDailyLogs(profileId);
  }

  saveDay(log: DailyLog): Promise<void> {
    return this.provider.saveDailyLog(log);
  }

  async addEntry(profileId: string, date: string, mealKey: MealKey, entry: MealEntry): Promise<DailyLog> {
    const day = await this.getDay(profileId, date);
    const meals = { ...day.meals, [mealKey]: [...day.meals[mealKey], entry] };
    const next = { ...day, meals };
    await this.saveDay(next);
    return next;
  }

  async removeEntry(profileId: string, date: string, entryId: string): Promise<DailyLog> {
    const day = await this.getDay(profileId, date);
    const meals = { ...day.meals };
    (Object.keys(meals) as MealKey[]).forEach((k) => {
      meals[k] = meals[k].filter((e) => e.id !== entryId);
    });
    const next = { ...day, meals };
    await this.saveDay(next);
    return next;
  }

  async updateEntryGrams(profileId: string, date: string, entryId: string, grams: number): Promise<DailyLog> {
    const day = await this.getDay(profileId, date);
    const meals = { ...day.meals };
    (Object.keys(meals) as MealKey[]).forEach((k) => {
      meals[k] = meals[k].map((e) => (e.id === entryId ? { ...e, grams } : e));
    });
    const next = { ...day, meals };
    await this.saveDay(next);
    return next;
  }

  async addWater(profileId: string, date: string, ml: number): Promise<DailyLog> {
    const day = await this.getDay(profileId, date);
    const next = { ...day, waterMl: Math.max(0, day.waterMl + ml) };
    await this.saveDay(next);
    return next;
  }

  getWeighIns(profileId: string): Promise<WeighIn[]> {
    return this.provider.getWeighIns(profileId);
  }

  saveWeighIn(weighIn: WeighIn): Promise<void> {
    return this.provider.saveWeighIn(weighIn);
  }
}

export const logRepository = new LogRepository();
