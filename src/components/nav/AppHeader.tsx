import logo from '@/assets/logo.png';
import type { Profile } from '@/types';
import { Avatar } from '@/components/ui';
import { ThemeToggle } from './ThemeToggle';
import { TopNav, type TabKey } from './Nav';

export function AppHeader({ tab, setTab, profile }: { tab: TabKey; setTab: (t: TabKey) => void; profile?: Profile }) {
  return (
    <header className="sticky top-0 z-10 glass-elevated border-b border-[var(--glass-border)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="MacroTrack Egypt" className="w-8 h-8 rounded-md object-contain bg-white" />
          <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>MacroTrack Egypt</span>
        </div>
        <TopNav tab={tab} setTab={setTab} />
        <div className="flex items-center gap-3">
          {profile && (
            <div className="hidden md:flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--color-on-surface-variant)]">{profile.name}</span>
              <Avatar profile={profile} size="sm" />
            </div>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
