export type ExerciseCategory = 'Gym' | 'Home Workouts' | 'Cardio' | 'Sports' | 'Mobility';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type HomeOrGym = 'home' | 'gym' | 'both';

export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  icon: string; // emoji fallback, used when imageUrl is missing or fails to load
  /** Optional photo URL, same pattern as Food.imageUrl — populated by
   *  scripts/fetch-exercise-images.ts. Falls back to `icon` wherever missing. */
  imageUrl?: string;
  metValue: number;
  description: string;
  difficulty: Difficulty;
  homeOrGym: HomeOrGym;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  equipment: string[];
  recommendedDurationMin: number;
}

export interface ExerciseLogEntry {
  id: string;
  exerciseId: string;
  loggedAt: string;
  durationMin: number;
  sets?: number;
  reps?: number;
  distanceKm?: number;
  notes?: string;
  /** Computed at log time from MET × 3.5 × bodyWeightKg / 200 × duration, using
   *  the user's weight *at the moment of logging* — this is a historical record
   *  of what was actually burned, not a live-recalculating value. Today's
   *  live estimate (e.g. in the detail modal before logging) always uses
   *  current weight; see calculateCaloriesBurned below. */
  caloriesBurned: number;
}

export interface ExerciseDailyLog {
  profileId: string;
  date: string; // YYYY-MM-DD
  entries: ExerciseLogEntry[];
}

/** Standard MET formula. Never store a fixed number — always derive it from
 *  the user's current bodyweight so it stays accurate as weight changes. */
export function calculateCaloriesBurned(metValue: number, bodyWeightKg: number, durationMin: number): number {
  return Math.round((metValue * 3.5 * bodyWeightKg / 200) * durationMin);
}

export function emptyExerciseDay(profileId: string, date: string): ExerciseDailyLog {
  return { profileId, date, entries: [] };
}
