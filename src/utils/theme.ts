import type { ThemePreference } from '@/types';

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function resolveTheme(pref: ThemePreference): 'light' | 'dark' {
  return pref === 'system' ? getSystemTheme() : pref;
}

export function applyThemeToDom(pref: ThemePreference): void {
  const resolved = resolveTheme(pref);
  document.documentElement.setAttribute('data-theme', resolved);
}
