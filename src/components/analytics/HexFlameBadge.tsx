import { motion } from 'framer-motion';
import type { FlameTier } from './flameTiers';

const HEX_PATH = 'M60,17 L101.6,41 L101.6,89 L60,113 L18.4,89 L18.4,41 Z';

interface EmberSpec {
  x: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
}

function generateEmbers(count: number, seed: number): EmberSpec[] {
  // Deterministic pseudo-random so a given badge doesn't re-shuffle every render
  const embers: EmberSpec[] = [];
  let s = seed || 1;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  for (let i = 0; i < count; i++) {
    embers.push({
      x: 30 + rand() * 60,
      delay: rand() * 2,
      duration: 1.6 + rand() * 1.4,
      size: 1.5 + rand() * 2.5,
      drift: (rand() - 0.5) * 20,
    });
  }
  return embers;
}

export function HexFlameBadge({
  tier,
  streak,
  size = 160,
  showNumber = true,
  locked = false,
  animated = true,
}: {
  tier: FlameTier;
  streak: number;
  size?: number;
  showNumber?: boolean;
  locked?: boolean;
  animated?: boolean;
}) {
  const embers = generateEmbers(locked ? 0 : tier.particleCount, tier.id * 17 + streak);
  const opacity = locked ? 0.35 : 1;
  const flameScale = tier.heightScale;

  return (
    <div style={{ width: size, height: size * 1.15, position: 'relative' }}>
      {/* outer ambient glow */}
      {!locked && (
        <motion.div
          style={{
            position: 'absolute', inset: -size * 0.15, borderRadius: '50%',
            background: `radial-gradient(circle, ${tier.glow}66, transparent 70%)`,
            filter: `blur(${size * 0.08}px)`,
          }}
          animate={animated ? { opacity: [0.5, 0.9, 0.6, 0.85, 0.5], scale: [1, 1.06, 0.99, 1.04, 1] } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      <svg viewBox="0 0 120 140" width={size} height={size * 1.15} style={{ position: 'relative', opacity }}>
        <defs>
          <linearGradient id={`hexGrad-${tier.id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={locked ? '#2a2a2a' : tier.glow} stopOpacity={0.9} />
            <stop offset="100%" stopColor={locked ? '#111' : tier.dark} stopOpacity={0.9} />
          </linearGradient>
        </defs>

        {/* embers rising behind the flame, clipped loosely to the hex area */}
        {!locked && embers.map((e, i) => (
          <motion.circle
            key={i}
            cx={e.x}
            cy={95}
            r={e.size}
            fill={i % 2 === 0 ? tier.core : tier.glow}
            initial={{ opacity: 0 }}
            animate={{
              cy: [95, 95 - 90],
              cx: [e.x, e.x + e.drift],
              opacity: [0, 0.9, 0],
            }}
            transition={{ duration: e.duration, repeat: Infinity, delay: e.delay, ease: 'easeOut' }}
          />
        ))}

        {/* flame layers, scaled by tier height */}
        {!locked && (
          <g transform={`translate(60,113) scale(1,${flameScale}) translate(-60,-113)`}>
            <motion.path
              d="M50 10 C20 45 15 65 25 90 C32 108 45 118 50 122 C55 118 68 108 75 90 C85 65 80 45 50 10 Z"
              fill={tier.dark}
              transform="translate(10,0)"
              animate={animated ? {
                d: [
                  'M50 10 C20 45 15 65 25 90 C32 108 45 118 50 122 C55 118 68 108 75 90 C85 65 80 45 50 10 Z',
                  'M50 14 C22 48 17 66 26 88 C33 106 46 116 50 122 C54 116 67 106 74 88 C83 66 78 48 50 14 Z',
                  'M50 10 C20 45 15 65 25 90 C32 108 45 118 50 122 C55 118 68 108 75 90 C85 65 80 45 50 10 Z',
                ],
              } : undefined}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M50 22 C30 50 27 66 34 86 C39 100 46 110 50 116 C54 110 61 100 66 86 C73 66 70 50 50 22 Z"
              fill={tier.mid}
              transform="translate(10,0)"
              animate={animated ? {
                d: [
                  'M50 22 C30 50 27 66 34 86 C39 100 46 110 50 116 C54 110 61 100 66 86 C73 66 70 50 50 22 Z',
                  'M50 26 C32 52 29 66 35 84 C40 98 46 108 50 114 C54 108 60 98 65 84 C71 66 68 52 50 26 Z',
                  'M50 20 C29 49 26 65 33 87 C38 101 46 111 50 118 C54 111 62 101 67 87 C74 65 71 49 50 20 Z',
                  'M50 22 C30 50 27 66 34 86 C39 100 46 110 50 116 C54 110 61 100 66 86 C73 66 70 50 50 22 Z',
                ],
              } : undefined}
              transition={{ duration: 1.3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.path
              d="M50 40 C38 58 36 68 40 82 C43 92 47 100 50 105 C53 100 57 92 60 82 C64 68 62 58 50 40 Z"
              fill={tier.core}
              transform="translate(10,0)"
              animate={animated ? {
                d: [
                  'M50 40 C38 58 36 68 40 82 C43 92 47 100 50 105 C53 100 57 92 60 82 C64 68 62 58 50 40 Z',
                  'M50 44 C40 60 38 68 41 80 C44 90 47 98 50 103 C53 98 56 90 59 80 C62 68 60 60 50 44 Z',
                  'M50 38 C37 57 35 67 39 83 C42 93 47 101 50 107 C53 101 58 93 61 83 C65 67 63 57 50 38 Z',
                  'M50 40 C38 58 36 68 40 82 C43 92 47 100 50 105 C53 100 57 92 60 82 C64 68 62 58 50 40 Z',
                ],
              } : undefined}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        )}

        {/* hexagon frame, drawn on top so the flame reads as "inside" it */}
        <path d={HEX_PATH} fill="none" stroke={`url(#hexGrad-${tier.id})`} strokeWidth={4} strokeLinejoin="round" />
        <path d={HEX_PATH} fill="none" stroke={locked ? '#444' : tier.glow} strokeWidth={1.5} strokeLinejoin="round" opacity={0.6} />
      </svg>

      {showNumber && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity }}>
          <span
            className="font-mono-num font-extrabold"
            style={{
              fontSize: size * 0.26,
              color: locked ? '#666' : tier.core,
              WebkitTextStroke: locked ? '1px #333' : `1px ${tier.dark}`,
              textShadow: locked ? 'none' : `0 0 6px ${tier.glow}, 0 0 18px ${tier.glow}88, 0 2px 0 ${tier.dark}`,
            }}
          >
            {streak}
          </span>
        </div>
      )}
    </div>
  );
}
