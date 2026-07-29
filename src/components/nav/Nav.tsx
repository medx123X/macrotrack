import { Home, UtensilsCrossed, BarChart3, Calendar, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabKey = 'dashboard' | 'tracker' | 'analytics' | 'calendar' | 'profile';

const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: 'dashboard', label: 'Dashboard', icon: Home },
  { key: 'tracker', label: 'Tracker', icon: UtensilsCrossed },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'calendar', label: 'Calendar', icon: Calendar },
  { key: 'profile', label: 'Profile', icon: User },
];

interface NavProps {
  tab: TabKey;
  setTab: (t: TabKey) => void;
}

export function BottomNav({ tab, setTab }: NavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-elevated border-t border-[var(--glass-border)] flex justify-around px-2 py-2 z-20">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex flex-col items-center gap-0.5 px-3 py-1 cursor-pointer"
          >
            <Icon size={20} color={active ? 'var(--color-primary)' : 'var(--color-outline)'} />
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? 'var(--color-primary)' : 'var(--color-outline)' }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export function TopNav({ tab, setTab }: NavProps) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {TABS.map(({ key, label, icon: Icon }) => {
        const active = tab === key;
        return (
          <button
            key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer font-semibold text-sm transition-colors"
            style={{
              color: active ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
              background: active ? 'var(--color-primary-container)' + '22' : 'transparent',
            }}
          >
            <Icon size={16} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}
