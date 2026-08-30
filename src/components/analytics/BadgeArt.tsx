import { motion } from 'framer-motion';
import type { FlameTier } from './flameTiers';
import flame1 from '@/assets/badges/flame-1-red.webp';
import flame2 from '@/assets/badges/flame-2-purple.webp';
import flame3 from '@/assets/badges/flame-3-green.webp';
import flame4 from '@/assets/badges/flame-4-gold.webp';
import { HexFlameBadge } from './HexFlameBadge';

/** Real generated artwork per tier (see src/assets/badges/). Tier 5 (Blue)
 *  has no source image yet, so it falls back to the procedural HexFlameBadge
 *  below until one is provided. */
const TIER_ART: Record<number, string> = {
  1: flame1,
  2: flame2,
  3: flame3,
  4: flame4,
};

export function BadgeArt({
  tier,
  streak,
  size = 160,
  showNumber = true,
  locked = false,
  numberNode,
}: {
  tier: FlameTier;
  streak: number;
  size?: number;
  showNumber?: boolean;
  locked?: boolean;
  /** Optional custom node to render inside the number-cover pill instead of
   *  the default static digits — used by the unlock modal to show an
   *  animated count-up in the same covered spot. */
  numberNode?: React.ReactNode;
}) {
  const art = TIER_ART[tier.id];

  if (!art) {
    // No source image for this tier yet — use the procedural hexagon flame.
    return <HexFlameBadge tier={tier} streak={streak} size={size} showNumber={showNumber} locked={locked} />;
  }

  return (
    <div style={{ width: size, height: size, position: 'relative' }}>
      <motion.div
        style={{ width: size, height: size, position: 'relative' }}
        animate={locked ? undefined : { filter: ['drop-shadow(0 0 10px ' + tier.glow + '66)', 'drop-shadow(0 0 20px ' + tier.glow + 'aa)', 'drop-shadow(0 0 10px ' + tier.glow + '66)'] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        <img
          src={art}
          alt={`${tier.name} flame`}
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            mixBlendMode: 'screen', // the source has a pure-black background — screen makes it drop out entirely
            opacity: locked ? 0.28 : 1,
            filter: locked ? 'grayscale(1)' : undefined,
          }}
        />
      </motion.div>

      {showNumber && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* covers the baked-in placeholder number from the source art, then draws the real live streak number in the same spot/style */}
          <div
            style={{
              width: size * 0.42, height: size * 0.24, borderRadius: size * 0.06,
              background: 'radial-gradient(circle, rgba(0,0,0,0.88), rgba(0,0,0,0.65) 70%, transparent 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span
              className="font-mono-num font-extrabold"
              style={{
                fontSize: size * 0.22,
                color: locked ? '#666' : tier.core,
                WebkitTextStroke: locked ? '1px #333' : `1px ${tier.dark}`,
                textShadow: locked ? 'none' : `0 0 6px ${tier.glow}, 0 0 16px ${tier.glow}99`,
              }}
            >
              {numberNode ?? streak}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
