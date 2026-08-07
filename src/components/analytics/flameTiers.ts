/** Five-tier flame evolution system. Colors and thresholds match the
 *  reference badge designs exactly (dark red -> purple -> green -> gold -> blue). */
export interface FlameTier {
  id: number;
  name: string;
  minDays: number;
  maxDays: number | null;
  meaning: string;
  feeling: string;
  emoji: string;
  core: string;   // hottest inner color (white-hot for gold/blue)
  mid: string;    // main flame body color
  dark: string;   // back-layer / shadow color
  glow: string;   // ambient glow / border / particle color
  heightScale: number; // relative flame height, taller for higher tiers
  particleCount: number;
}

export const FLAME_TIERS: FlameTier[] = [
  {
    id: 1, name: 'Dark Red', minDays: 1, maxDays: 7,
    meaning: 'Beginning the journey.', feeling: 'Raw determination.', emoji: '🔴',
    core: '#FF6B4A', mid: '#DC2626', dark: '#450A0A', glow: '#B91C1C',
    heightScale: 0.8, particleCount: 6,
  },
  {
    id: 2, name: 'Purple', minDays: 8, maxDays: 14,
    meaning: 'Momentum.', feeling: 'The habit is taking hold.', emoji: '🟣',
    core: '#E9D5FF', mid: '#A855F7', dark: '#3B0764', glow: '#9333EA',
    heightScale: 0.9, particleCount: 9,
  },
  {
    id: 3, name: 'Green', minDays: 15, maxDays: 21,
    meaning: 'Consistency.', feeling: 'Consistency has become part of the user.', emoji: '🟢',
    core: '#D9F99D', mid: '#22C55E', dark: '#052E1A', glow: '#16A34A',
    heightScale: 1.0, particleCount: 12,
  },
  {
    id: 4, name: 'Gold', minDays: 22, maxDays: 28,
    meaning: 'Mastery.', feeling: 'Legendary.', emoji: '🟨',
    core: '#FFFFFF', mid: '#FFD700', dark: '#7C5800', glow: '#FBBF24',
    heightScale: 1.1, particleCount: 16,
  },
  {
    id: 5, name: 'Blue', minDays: 29, maxDays: null,
    meaning: 'Elite.', feeling: 'The highest achievement.', emoji: '🔵',
    core: '#EAF6FF', mid: '#3B82F6', dark: '#0B1F4D', glow: '#1D4ED8',
    heightScale: 1.2, particleCount: 20,
  },
];

export function tierForStreak(days: number): FlameTier {
  return FLAME_TIERS.find((t) => days >= t.minDays && (t.maxDays === null || days <= t.maxDays)) ?? FLAME_TIERS[0];
}

export function nextTier(current: FlameTier): FlameTier | null {
  return FLAME_TIERS.find((t) => t.id === current.id + 1) ?? null;
}

const ENCOURAGEMENT_POOLS: Record<number, string[]> = {
  0: ["Log a meal today to start your streak.", "Every streak starts with day one. Today's the day."],
  1: [
    "You're building a powerful habit. Keep going!",
    "Day one down. Momentum starts now.",
    "Good start — don't let it slip tomorrow.",
  ],
  2: [
    "Two weeks strong. Consistency beats perfection.",
    "The habit is starting to feel automatic.",
    "This is no longer an accident — it's a pattern.",
  ],
  3: [
    "Three weeks of dedication. You're becoming unstoppable.",
    "Consistency has become part of who you are.",
    "Most people quit before this point. You didn't.",
  ],
  4: [
    "One month of discipline. Incredible work.",
    "Gold-tier consistency. Genuinely rare.",
    "This is what mastery looks like, one day at a time.",
  ],
  5: [
    "Legends aren't born. They're built every day.",
    "Elite Hacker Status. Keep the fire alive.",
    "Few people ever see this flame. You're one of them.",
  ],
};

export function encouragementFor(streak: number, tier: FlameTier): string {
  const pool = ENCOURAGEMENT_POOLS[tier.id] ?? ENCOURAGEMENT_POOLS[1];
  if (streak === 0) {
    const zeroPool = ENCOURAGEMENT_POOLS[0];
    return zeroPool[Math.floor(Math.random() * zeroPool.length)];
  }
  // Milestone overrides (50/100 days) per spec, checked before tier pool
  if (streak >= 100) return 'Elite Hacker Status. Keep the fire alive.';
  if (streak >= 50) return "Legends aren't born. They're built every day.";
  return pool[Math.floor(Math.random() * pool.length)];
}
