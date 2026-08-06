import type { DailyLog, ExerciseDailyLog, Food, MealTemplate, Profile, Settings, WeighIn } from '@/types';

/**
 * Contract every storage backend must implement. Today only Dexie (IndexedDB)
 * implements this. A future API-backed provider (Supabase/Firebase/custom)
 * can implement the same interface with zero changes to repositories or UI.
 */
export interface StorageProvider {
  // profiles
  getProfile(id: string): Promise<Profile | undefined>;
  getActiveProfile(): Promise<Profile | undefined>;
  saveProfile(profile: Profile): Promise<void>;
  deleteProfile(id: string): Promise<void>;

  // weigh-ins
  getWeighIns(profileId: string): Promise<WeighIn[]>;
  saveWeighIn(weighIn: WeighIn): Promise<void>;

  // daily logs
  getDailyLog(profileId: string, date: string): Promise<DailyLog | undefined>;
  getDailyLogsInRange(profileId: string, startDate: string, endDate: string): Promise<DailyLog[]>;
  getAllDailyLogs(profileId: string): Promise<DailyLog[]>;
  saveDailyLog(log: DailyLog): Promise<void>;

  // foods (custom + favorites + recent live locally; catalog is static JSON via FoodRepository)
  getCustomFoods(): Promise<Food[]>;
  saveCustomFood(food: Food): Promise<void>;
  getFavoriteFoodIds(): Promise<string[]>;
  setFavoriteFoodIds(ids: string[]): Promise<void>;
  getRecentFoodIds(): Promise<string[]>;
  setRecentFoodIds(ids: string[]): Promise<void>;

  // meal templates
  getMealTemplates(profileId: string): Promise<MealTemplate[]>;
  saveMealTemplate(template: MealTemplate): Promise<void>;
  deleteMealTemplate(id: string): Promise<void>;

  // exercise logs (catalog is static JSON via ExerciseRepository, same pattern as foods)
  getExerciseDay(profileId: string, date: string): Promise<ExerciseDailyLog | undefined>;
  getAllExerciseLogs(profileId: string): Promise<ExerciseDailyLog[]>;
  saveExerciseDay(log: ExerciseDailyLog): Promise<void>;

  // settings
  getSettings(): Promise<Settings>;
  saveSettings(settings: Settings): Promise<void>;

  // bulk
  exportAll(): Promise<Record<string, unknown>>;
  importAll(data: Record<string, unknown>): Promise<void>;
  resetAll(): Promise<void>;
}
