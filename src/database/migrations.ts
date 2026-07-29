import type { Settings } from '@/types';
import { CURRENT_SETTINGS_VERSION, defaultSettings } from '@/types';

/**
 * Runs any settings shape stored on disk through sequential migrations up to
 * CURRENT_SETTINGS_VERSION. Add a new `if (settings.version === N)` block
 * each time SettingsV(N+1) is introduced — never mutate old version shapes.
 */
export function migrateSettings(raw: unknown): Settings {
  if (!raw || typeof raw !== 'object') return defaultSettings();

  let settings = raw as { version?: number } & Record<string, unknown>;

  if (settings.version === undefined) {
    // pre-versioning data (shouldn't happen in practice, but be defensive)
    settings = { ...defaultSettings(), ...settings, version: 1 };
  }

  // Example future migration:
  // if (settings.version === 1) {
  //   settings = { ...settings, version: 2, newField: 'default' };
  // }

  if (settings.version !== CURRENT_SETTINGS_VERSION) {
    // Unknown/newer version than this build understands — fall back safely.
    return { ...defaultSettings(), ...settings, version: CURRENT_SETTINGS_VERSION } as unknown as Settings;
  }

  return settings as unknown as Settings;
}
