import type { Exercise, ExerciseDailyLog, ExerciseLogEntry } from '@/types';
import { emptyExerciseDay } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

let catalogCache: Exercise[] | null = null;
let catalogPromise: Promise<Exercise[]> | null = null;

/** Loads the static exercise catalog once per session and caches it in memory —
 *  same pattern as FoodRepository's loadCatalog(). */
async function loadCatalog(): Promise<Exercise[]> {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = fetch('/exercises/exercises.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load exercise catalog: ${res.status}`);
        return res.json();
      })
      .then((data: Exercise[]) => {
        catalogCache = data;
        return data;
      });
  }
  return catalogPromise;
}

export class ExerciseRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  async getAllExercises(): Promise<Exercise[]> {
    return loadCatalog();
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    const all = await this.getAllExercises();
    return all.find((e) => e.id === id);
  }

  async searchExercises(query: string, categoryFilter?: string): Promise<Exercise[]> {
    const all = await this.getAllExercises();
    const q = query.trim().toLowerCase();
    return all.filter((e) => {
      const matchesQuery = !q || e.name.toLowerCase().includes(q);
      const matchesCat = !categoryFilter || categoryFilter === 'All' || e.category === categoryFilter;
      return matchesQuery && matchesCat;
    });
  }

  async getDay(profileId: string, date: string): Promise<ExerciseDailyLog> {
    const log = await this.provider.getExerciseDay(profileId, date);
    return log ?? emptyExerciseDay(profileId, date);
  }

  getAll(profileId: string): Promise<ExerciseDailyLog[]> {
    return this.provider.getAllExerciseLogs(profileId);
  }

  saveDay(log: ExerciseDailyLog): Promise<void> {
    return this.provider.saveExerciseDay(log);
  }

  async addEntry(profileId: string, date: string, entry: ExerciseLogEntry): Promise<ExerciseDailyLog> {
    const day = await this.getDay(profileId, date);
    const next = { ...day, entries: [...day.entries, entry] };
    await this.saveDay(next);
    return next;
  }

  async removeEntry(profileId: string, date: string, entryId: string): Promise<ExerciseDailyLog> {
    const day = await this.getDay(profileId, date);
    const next = { ...day, entries: day.entries.filter((e) => e.id !== entryId) };
    await this.saveDay(next);
    return next;
  }
}

export const exerciseRepository = new ExerciseRepository();
