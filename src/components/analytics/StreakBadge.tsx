import { useState } from 'react';
import { motion } from 'framer-motion';
import { HexFlameBadge } from './HexFlameBadge';
import { AchievementUnlockModal } from './AchievementUnlockModal';
import { tierForStreak, encouragementFor } from './flameTiers';

/** Compact inline streak card (Dashboard/Analytics). Click it to open the
 *  full-screen AchievementUnlockModal with the richer animated experience. */
export function StreakBadge({ name, streak }: { name: string; streak: number }) {
  const [open, setOpen] = useState(false);
  const tier = tierForStreak(streak);
  const [message] = useState(() => encouragementFor(streak, tier));

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden w-full cursor-pointer"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${tier.dark}33, var(--color-surface-container-lowest))`,
          border: `1px solid ${tier.glow}44`,
        }}
      >
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-outline)] mb-1">{name}</div>
        <div className="text-[11px] text-[var(--color-outline)] mb-1">
          {streak > 0 ? 'is on a streak' : "hasn't started a streak yet"}
        </div>

        <HexFlameBadge tier={tier} streak={streak} size={110} />

        <div className="font-extrabold text-base mt-1 mb-0.5">{streak} Day{streak === 1 ? '' : 's'} Streak</div>
        <div className="text-xs font-semibold mb-2" style={{ color: tier.mid }}>{tier.emoji} {tier.name}</div>
        <p className="text-xs text-[var(--color-on-surface-variant)] max-w-[220px]">{message}</p>
        <div className="text-[10px] text-[var(--color-outline)] mt-3">Tap to view achievement</div>
      </motion.button>

      {open && <AchievementUnlockModal name={name} streak={streak} onClose={() => setOpen(false)} />}
    </>
  );
}
