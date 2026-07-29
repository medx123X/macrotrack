import { useSettingsStore } from '@/store/useSettingsStore';
import { resolveTheme } from '@/utils/theme';
import type { ThemePreference } from '@/types';

export function useTheme() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);

  const resolved = resolveTheme(settings.theme);

  const setTheme = (pref: ThemePreference) => update({ theme: pref });
  const toggle = () => setTheme(resolved === 'dark' ? 'light' : 'dark');

  return { preference: settings.theme, resolved, setTheme, toggle };
}
