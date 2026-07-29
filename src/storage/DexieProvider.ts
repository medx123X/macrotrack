import { db } from '@/database/db';
import { migrateSettings } from '@/database/migrations';
import type { DailyLog, Food, MealTemplate, Profile, Settings, WeighIn } from '@/types';
import { defaultSettings } from '@/types';
import type { StorageProvider } from './StorageProvider';

const ACTIVE_PROFILE_KEY = 'activeProfileId';
const SETTINGS_KEY = 'settings';
const FAVORITES_KEY = 'favoriteFoodIds';
const RECENT_KEY = 'recentFoodIds';

async function getKV<T>(key: string): Promise<T | undefined> {
  const row = await db.kv.get(key);
  return row?.value as T | undefined;
}

async function setKV(key: string, value: unknown): Promise<void> {
  await db.kv.put({ key, value });
}

export class DexieProvider implements StorageProvider {
  async getProfile(id: string): Promise<Profile | undefined> {
    return db.profiles.get(id);
  }

  async getActiveProfile(): Promise<Profile | undefined> {
    const id = await getKV<string>(ACTIVE_PROFILE_KEY);
    if (!id) return undefined;
    return db.profiles.get(id);
  }

  async saveProfile(profile: Profile): Promise<void> {
    await db.profiles.put(profile);
    await setKV(ACTIVE_PROFILE_KEY, profile.id);
  }

  async deleteProfile(id: string): Promise<void> {
    await db.profiles.delete(id);
  }

  async getWeighIns(profileId: string): Promise<WeighIn[]> {
    return db.weighIns.where('profileId').equals(profileId).sortBy('date');
  }

  async saveWeighIn(weighIn: WeighIn): Promise<void> {
    await db.weighIns.put(weighIn);
    // keep profile weight in sync with the latest weigh-in
    const profile = await db.profiles.get(weighIn.profileId);
    if (profile) {
      const all = await this.getWeighIns(weighIn.profileId);
      const latest = all[all.length - 1];
      if (latest && latest.id === weighIn.id) {
        await db.profiles.put({ ...profile, weightKg: weighIn.weightKg, updatedAt: new Date().toISOString() });
      }
    }
  }

  async getDailyLog(profileId: string, date: string): Promise<DailyLog | undefined> {
    return db.dailyLogs.get([profileId, date]);
  }

  async getDailyLogsInRange(profileId: string, startDate: string, endDate: string): Promise<DailyLog[]> {
    return db.dailyLogs
      .where('profileId')
      .equals(profileId)
      .and((log) => log.date >= startDate && log.date <= endDate)
      .toArray();
  }

  async getAllDailyLogs(profileId: string): Promise<DailyLog[]> {
    return db.dailyLogs.where('profileId').equals(profileId).sortBy('date');
  }

  async saveDailyLog(log: DailyLog): Promise<void> {
    await db.dailyLogs.put(log);
  }

  async getCustomFoods(): Promise<Food[]> {
    return db.customFoods.toArray();
  }

  async saveCustomFood(food: Food): Promise<void> {
    await db.customFoods.put(food);
  }

  async getFavoriteFoodIds(): Promise<string[]> {
    return (await getKV<string[]>(FAVORITES_KEY)) ?? [];
  }

  async setFavoriteFoodIds(ids: string[]): Promise<void> {
    await setKV(FAVORITES_KEY, ids);
  }

  async getRecentFoodIds(): Promise<string[]> {
    return (await getKV<string[]>(RECENT_KEY)) ?? [];
  }

  async setRecentFoodIds(ids: string[]): Promise<void> {
    await setKV(RECENT_KEY, ids);
  }

  async getMealTemplates(profileId: string): Promise<MealTemplate[]> {
    return db.mealTemplates.where('profileId').equals(profileId).toArray();
  }

  async saveMealTemplate(template: MealTemplate): Promise<void> {
    await db.mealTemplates.put(template);
  }

  async deleteMealTemplate(id: string): Promise<void> {
    await db.mealTemplates.delete(id);
  }

  async getSettings(): Promise<Settings> {
    const raw = await getKV<unknown>(SETTINGS_KEY);
    if (!raw) return defaultSettings();
    return migrateSettings(raw);
  }

  async saveSettings(settings: Settings): Promise<void> {
    await setKV(SETTINGS_KEY, settings);
  }

  async exportAll(): Promise<Record<string, unknown>> {
    const [profiles, weighIns, dailyLogs, customFoods, mealTemplates, kv] = await Promise.all([
      db.profiles.toArray(),
      db.weighIns.toArray(),
      db.dailyLogs.toArray(),
      db.customFoods.toArray(),
      db.mealTemplates.toArray(),
      db.kv.toArray(),
    ]);
    return { exportedAt: new Date().toISOString(), profiles, weighIns, dailyLogs, customFoods, mealTemplates, kv };
  }

  async importAll(data: Record<string, unknown>): Promise<void> {
    await db.transaction('rw', [db.profiles, db.weighIns, db.dailyLogs, db.customFoods, db.mealTemplates, db.kv], async () => {
      if (Array.isArray(data.profiles)) await db.profiles.bulkPut(data.profiles as Profile[]);
      if (Array.isArray(data.weighIns)) await db.weighIns.bulkPut(data.weighIns as WeighIn[]);
      if (Array.isArray(data.dailyLogs)) await db.dailyLogs.bulkPut(data.dailyLogs as DailyLog[]);
      if (Array.isArray(data.customFoods)) await db.customFoods.bulkPut(data.customFoods as Food[]);
      if (Array.isArray(data.mealTemplates)) await db.mealTemplates.bulkPut(data.mealTemplates as MealTemplate[]);
      if (Array.isArray(data.kv)) await db.kv.bulkPut(data.kv as { key: string; value: unknown }[]);
    });
  }

  async resetAll(): Promise<void> {
    await db.transaction('rw', [db.profiles, db.weighIns, db.dailyLogs, db.customFoods, db.mealTemplates, db.kv], async () => {
      await Promise.all([
        db.profiles.clear(),
        db.weighIns.clear(),
        db.dailyLogs.clear(),
        db.customFoods.clear(),
        db.mealTemplates.clear(),
        db.kv.clear(),
      ]);
    });
  }
}
