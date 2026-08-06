import Dexie, { type Table } from 'dexie';
import type { DailyLog, ExerciseDailyLog, Food, MealTemplate, Profile, WeighIn } from '@/types';

export interface KVRow {
  key: string;
  value: unknown;
}

export class MacroTrackDB extends Dexie {
  profiles!: Table<Profile, string>;
  weighIns!: Table<WeighIn, string>;
  dailyLogs!: Table<DailyLog, [string, string]>; // compound key [profileId, date]
  customFoods!: Table<Food, string>;
  mealTemplates!: Table<MealTemplate, string>;
  kv!: Table<KVRow, string>; // settings, favorites, recent, active profile pointer
  exerciseLogs!: Table<ExerciseDailyLog, [string, string]>; // compound key [profileId, date]

  constructor() {
    super('macrotrack-egypt');
    this.version(1).stores({
      profiles: 'id, name, createdAt',
      weighIns: 'id, profileId, date',
      dailyLogs: '[profileId+date], profileId, date',
      customFoods: 'id, name, isCustom',
      mealTemplates: 'id, profileId, mealKey',
      kv: 'key',
    });
    // v2 adds exercise logging — all v1 tables repeated unchanged, per Dexie's
    // requirement that each version() call fully redeclares the schema.
    this.version(2).stores({
      profiles: 'id, name, createdAt',
      weighIns: 'id, profileId, date',
      dailyLogs: '[profileId+date], profileId, date',
      customFoods: 'id, name, isCustom',
      mealTemplates: 'id, profileId, mealKey',
      kv: 'key',
      exerciseLogs: '[profileId+date], profileId, date',
    });
  }
}

export const db = new MacroTrackDB();
