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
}

export type Settings = SettingsV1;

export function defaultSettings(): Settings {
  return {
    version: CURRENT_SETTINGS_VERSION,
    units: 'metric',
    theme: 'system',
    calculationMethod: 'mifflin',
    adaptiveCalories: true,
  };
}
