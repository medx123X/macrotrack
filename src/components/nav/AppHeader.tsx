import logo from '@/assets/logo.png';
import { ThemeToggle } from './ThemeToggle';
import { TopNav, type TabKey } from './Nav';

export function AppHeader({ tab, setTab, name }: { tab: TabKey; setTab: (t: TabKey) => void; name?: string }) {
  return (
    <header className="sticky top-0 z-10 glass-elevated border-b border-[var(--glass-border)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="MacroTrack Egypt" className="w-8 h-8 rounded-md object-contain bg-white" />
          <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>MacroTrack Egypt</span>
        </div>
        <TopNav tab={tab} setTab={setTab} />
        <div className="flex items-center gap-3">
          {name && <span className="hidden md:block text-sm font-semibold text-[var(--color-on-surface-variant)]">{name}</span>}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
