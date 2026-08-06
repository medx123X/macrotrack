export const CURRENT_SETTINGS_VERSION = 1;

export type CalculationMethod = 'mifflin'; // future: 'katch-mcardle' | 'cunningham'
export type ThemePreference = 'light' | 'dark' | 'system';

export interface SettingsV1 {
  version: 1;
  units: 'metric' | 'imperial';
  theme: ThemePreference;
  calculationMethod: CalculationMethod;
  adaptiveCalories: boolean;
  proteinGPerKgOverride?: number;
  fatGPerKgOverride?: number;
  /** When true, Remaining Calories = Target + Exercise Burned − Food Eaten.
   *  Defaults to false because the calorie target already accounts for
   *  activity level via the two-question training-days/steps model at
   *  onboarding — enabling this by default would double-count activity. */
  exerciseAffectsGoal: boolean;
}

export type Settings = SettingsV1;

export function defaultSettings(): Settings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    units: 'metric',
    theme: 'system',
    calculationMethod: 'mifflin',
    adaptiveCalories: true,
    exerciseAffectsGoal: false,
  };
}
