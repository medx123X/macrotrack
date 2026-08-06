import { create } from 'zustand';
import type { Exercise, ExerciseDailyLog, ExerciseLogEntry } from '@/types';
import { calculateCaloriesBurned } from '@/types';
import { exerciseRepository } from '@/repositories';
import { todayStr } from '@/utils/date';

interface ExerciseDayState {
  date: string;
  log: ExerciseDailyLog | undefined;
  loaded: boolean;

  loadDay: (profileId: string, date?: string) => Promise<void>;
  addEntry: (
    profileId: string,
    exercise: Exercise,
    bodyWeightKg: number,
    input: { durationMin: number; sets?: number; reps?: number; distanceKm?: number; notes?: string }
  ) => Promise<void>;
  removeEntry: (profileId: string, entryId: string) => Promise<void>;
}

export const useExerciseDayStore = create<ExerciseDayState>((set, get) => ({
  date: todayStr(),
  log: undefined,
  loaded: false,

  loadDay: async (profileId, date = todayStr()) => {
    const log = await exerciseRepository.getDay(profileId, date);
    set({ date, log, loaded: true });
  },

  addEntry: async (profileId, exercise, bodyWeightKg, input) => {
    const { date } = get();
    const entry: ExerciseLogEntry = {
      id: `${exercise.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      exerciseId: exercise.id,
      loggedAt: new Date().toISOString(),
      durationMin: input.durationMin,
      sets: input.sets,
      reps: input.reps,
      distanceKm: input.distanceKm,
      notes: input.notes,
      caloriesBurned: calculateCaloriesBurned(exercise.metValue, bodyWeightKg, input.durationMin),
    };
    const log = await exerciseRepository.addEntry(profileId, date, entry);
    set({ log });
  },

  removeEntry: async (profileId, entryId) => {
    const { date } = get();
    const log = await exerciseRepository.removeEntry(profileId, date, entryId);
    set({ log });
  },
}));

/** Pure helper, not a store method — call this directly wherever totals are
 *  needed so the caller reads the live `log` value they're already subscribed
 *  to, rather than a memoized/stable function reference (see the dashboard
 *  refresh bug we fixed in useDayStore/App.tsx for why this matters). */
export function exerciseDayTotals(log: ExerciseDailyLog | undefined) {
  const entries = log?.entries ?? [];
  return {
    caloriesBurned: entries.reduce((sum, e) => sum + e.caloriesBurned, 0),
    minutes: entries.reduce((sum, e) => sum + e.durationMin, 0),
    count: entries.length,
  };
}
