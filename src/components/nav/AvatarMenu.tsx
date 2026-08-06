import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Trophy, Download, Upload, HelpCircle, Info, Trash2, LogOut, X,
} from 'lucide-react';
import type { Profile } from '@/types';
import { Avatar, Button } from '@/components/ui';
import { useSettingsStore } from '@/store/useSettingsStore';
import { settingsRepository } from '@/repositories';
import type { TabKey } from './Nav';

interface AvatarMenuProps {
  profile: Profile;
  setTab: (t: TabKey) => void;
}

export function AvatarMenu({ profile, setTab }: AvatarMenuProps) {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState<'help' | 'about' | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { resetAllData } = useSettingsStore();

  const close = () => setOpen(false);

  const goTo = (tab: TabKey) => {
    setTab(tab);
    close();
  };

  const exportData = async () => {
    const data = await settingsRepository.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `macrotrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    close();
  };

  const importData = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await settingsRepository.importAll(data);
    close();
    window.location.reload();
  };

  const resetData = async () => {
    if (!confirm('This permanently deletes all local data (profile, logs, weigh-ins, settings). This cannot be undone. Continue?')) return;
    await resetAllData();
    close();
    window.location.reload();
  };

  const items = [
    { icon: User, label: 'My Profile', onClick: () => goTo('profile') },
    { icon: User, label: 'Settings', onClick: () => goTo('profile') },
    { icon: Trophy, label: 'Achievements', onClick: () => goTo('analytics') },
    { icon: Download, label: 'Export Data', onClick: exportData },
    { icon: Upload, label: 'Import Data', onClick: () => fileInput.current?.click() },
    { icon: HelpCircle, label: 'Help & Support', onClick: () => { setInfo('help'); setOpen(false); } },
    { icon: Info, label: 'About', onClick: () => { setInfo('about'); setOpen(false); } },
    { icon: Trash2, label: 'Reset All Data', onClick: resetData, danger: true },
    { icon: LogOut, label: 'Sign Out', onClick: () => {}, disabled: true },
  ];

  return (
    <div className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Open profile menu" className="cursor-pointer rounded-full">
        <Avatar profile={profile} size="sm" />
      </button>

      <input
        ref={fileInput}
        type="file"
        accept="application/json"
        hidden
        onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])}
      />

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="fixed md:absolute inset-x-0 bottom-0 md:inset-x-auto md:bottom-auto md:top-full md:right-0 md:mt-2 z-50 md:w-64 glass-modal md:glass-elevated rounded-t-2xl md:rounded-xl overflow-hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              <div className="flex items-center gap-3 p-4 border-b border-[var(--glass-border)] md:hidden">
                <Avatar profile={profile} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold truncate">{profile.name}</div>
                </div>
                <button onClick={close} className="cursor-pointer p-1"><X size={18} /></button>
              </div>

              <div className="py-1.5">
                {items.map(({ icon: Icon, label, onClick, danger, disabled }) => (
                  <button
                    key={label}
                    onClick={disabled ? undefined : onClick}
                    disabled={disabled}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--color-surface-container-high)] transition-colors"
                    style={{ color: danger ? 'var(--color-error)' : 'var(--color-on-surface)' }}
                  >
                    <Icon size={16} />
                    {label}
                    {disabled && <span className="ml-auto text-[10px] font-normal text-[var(--color-outline)]">Soon</span>}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {info && <InfoModal kind={info} onClose={() => setInfo(null)} />}
      </AnimatePresence>
    </div>
  );
}

function InfoModal({ kind, onClose }: { kind: 'help' | 'about'; onClose: () => void }) {
  const content = kind === 'help'
    ? {
        title: 'Help & Support',
        body: 'MacroTrack Egypt tracks calories and macros using the Mifflin-St Jeor equation, a two-question activity model, and weekly adaptive calorie adjustments based on your real weigh-ins. All your data is stored locally on this device. For issues or feedback, reach out to the developer directly.',
      }
    : {
        title: 'About',
        body: 'MacroTrack Egypt — calorie and macro tracking built for Egyptian food, with adaptive planning that improves the longer you use it.',
      };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-96 z-50 glass-modal rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">{content.title}</h3>
          <button onClick={onClose} className="cursor-pointer"><X size={18} /></button>
        </div>
        <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed mb-4">{content.body}</p>
        <Button size="sm" className="w-full" onClick={onClose}>Close</Button>
      </motion.div>
    </>
  );
}
