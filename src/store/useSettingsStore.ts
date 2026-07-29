import { create } from 'zustand';
import type { Settings } from '@/types';
import { defaultSettings } from '@/types';
import { settingsRepository } from '@/repositories';
import { applyThemeToDom } from '@/utils/theme';

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  update: (patch: Partial<Settings>) => Promise<void>;
  resetAllData: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: defaultSettings(),
  loaded: false,

  load: async () => {
    const settings = await settingsRepository.get();
    applyThemeToDom(settings.theme);
    set({ settings, loaded: true });
  },

  update: async (patch) => {
    const next = await settingsRepository.update(patch);
    if (patch.theme) applyThemeToDom(next.theme);
    set({ settings: next });
  },

  resetAllData: async () => {
    await settingsRepository.resetAll();
    const settings = defaultSettings();
    await settingsRepository.save(settings);
    applyThemeToDom(settings.theme);
    set({ settings });
  },
}));

// Keep theme in sync with OS-level changes when preference is "system"
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { settings } = useSettingsStore.getState();
    if (settings.theme === 'system') applyThemeToDom('system');
  });
}
