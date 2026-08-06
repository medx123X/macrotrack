import { useState } from 'react';
import { Bell } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import logo from '@/assets/logo.png';
import type { Profile } from '@/types';
import { ThemeToggle } from './ThemeToggle';
import { AvatarMenu } from './AvatarMenu';
import { TopNav, type TabKey } from './Nav';

export function AppHeader({ tab, setTab, profile }: { tab: TabKey; setTab: (t: TabKey) => void; profile?: Profile }) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 glass-elevated border-b border-[var(--glass-border)]">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 px-5 py-3">
        <button onClick={() => setTab('dashboard')} className="flex items-center gap-2.5 cursor-pointer" aria-label="Go to Dashboard">
          <img src={logo} alt="MacroTrack Egypt" className="w-8 h-8 rounded-md object-contain bg-white" />
          <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>MacroTrack Egypt</span>
        </button>
        <TopNav tab={tab} setTab={setTab} />
        <div className="flex items-center gap-2 relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            aria-label="Notifications"
            className="glass rounded-full p-2.5 hover:scale-105 transition-transform cursor-pointer relative"
          >
            <Bell size={18} color="var(--color-primary)" />
          </button>
          <AnimatePresence>
            {notifOpen && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-10 mt-2 w-56 glass-elevated rounded-xl p-4 z-50"
                >
                  <p className="text-xs text-[var(--color-on-surface-variant)]">No notifications yet.</p>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <ThemeToggle />
          {profile && <AvatarMenu profile={profile} setTab={setTab} />}
        </div>
      </div>
    </header>
  );
}
