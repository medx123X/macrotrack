import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, animate } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { HexFlameBadge } from './HexFlameBadge';
import { FLAME_TIERS, tierForStreak, nextTier, encouragementFor } from './flameTiers';

function CountUpNumber({ target, color }: { target: number; color: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const controls = animate(0, target, {
      duration: 1.1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [target]);
  return (
    <span className="font-mono-num font-extrabold text-3xl" style={{ color, textShadow: `0 0 14px ${color}` }}>
      {display}
    </span>
  );
}

export function AchievementUnlockModal({
  name,
  streak,
  justEvolved = false,
  onClose,
}: {
  name: string;
  streak: number;
  justEvolved?: boolean;
  onClose: () => void;
}) {
  const tier = tierForStreak(streak);
  const next = nextTier(tier);
  const [message] = useState(() => encouragementFor(streak, tier));
  const cardRef = useRef<HTMLDivElement>(null);

  // subtle cursor-follow tilt
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    rotateY.set(px * 8);
    rotateX.set(-py * 8);
  };
  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const progressInTier = next ? Math.min(1, (streak - tier.minDays + 1) / (next.minDays - tier.minDays)) : 1;
  const daysToNext = next ? Math.max(0, next.minDays - streak) : 0;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(5,5,10,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={onClose}
      >
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            rotateX, rotateY, transformPerspective: 800,
            background: `radial-gradient(circle at 50% 0%, ${tier.dark}55, rgba(10,10,16,0.95))`,
            border: `1px solid ${tier.glow}55`,
            boxShadow: `0 0 60px ${tier.glow}33, 0 20px 60px rgba(0,0,0,0.5)`,
          }}
          className="relative w-full max-w-sm rounded-[22px] p-6 flex flex-col items-center text-center overflow-hidden"
        >
          {/* halo behind everything */}
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: `radial-gradient(circle, ${tier.glow}44, transparent 70%)`, filter: 'blur(20px)' }}
          />

          <button onClick={onClose} className="absolute top-4 right-4 cursor-pointer text-white/50 hover:text-white/90 transition-colors z-10">
            <X size={18} />
          </button>

          {justEvolved && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-[11px] font-bold px-3 py-1 rounded-full mb-2 flex items-center gap-1"
              style={{ background: `${tier.glow}33`, color: tier.core }}
            >
              <Sparkles size={11} /> Flame Evolved! You've unlocked the {tier.name} Flame.
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="relative z-10">
            <div className="text-sm font-bold">{name}</div>
            <div className="text-[11px] uppercase tracking-wide text-white/50 mb-1">Achievement Unlocked</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 my-2"
          >
            <HexFlameBadge tier={tier} streak={streak} size={140} showNumber={false} />
            <div className="absolute inset-0 flex items-center justify-center">
              <CountUpNumber target={streak} color={tier.core} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="relative z-10">
            <div className="font-extrabold text-lg">{streak} Day{streak === 1 ? '' : 's'} Streak</div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.65 }}
            className="text-xs text-white/70 max-w-[240px] mt-1.5 relative z-10"
          >
            {message}
          </motion.p>

          {/* progress to next tier */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="w-full mt-5 relative z-10">
            <div className="flex items-center justify-between text-[10px] font-semibold text-white/50 mb-1.5">
              <span>{tier.emoji} {tier.name}</span>
              {next ? <span>{next.emoji} {next.name}</span> : <span>Max Tier</span>}
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${tier.glow}, ${next?.glow ?? tier.glow})` }}
                initial={{ width: 0 }}
                animate={{ width: `${progressInTier * 100}%` }}
                transition={{ delay: 0.9, duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <div className="text-[10px] text-white/40 mt-1">
              {next ? `${daysToNext} more day${daysToNext === 1 ? '' : 's'} to ${next.name} Flame` : "You've reached the highest flame."}
            </div>
          </motion.div>

          {/* tier collection */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="flex items-center gap-1.5 mt-5 relative z-10">
            {FLAME_TIERS.map((t) => (
              <div key={t.id} title={`${t.name} Flame — Unlocked at ${t.minDays} Days`}>
                <HexFlameBadge tier={t} streak={t.minDays} size={34} showNumber={false} locked={t.id > tier.id} animated={t.id <= tier.id} />
              </div>
            ))}
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            whileTap={{ scale: 0.96 }}
            onClick={onClose}
            className="mt-5 w-full py-2.5 rounded-xl text-sm font-bold cursor-pointer relative z-10"
            style={{ background: tier.glow, color: '#0a0a10' }}
          >
            Nice!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
