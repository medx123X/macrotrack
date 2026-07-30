import { motion } from 'framer-motion';

interface ProgressRingProps {
  size?: number;
  stroke?: number;
  progress: number; // 0-1
  color: string;
  track?: string;
}

export function ProgressRing({ size = 64, stroke = 7, progress, color, track = 'var(--color-outline-variant)' }: ProgressRingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} opacity={0.35} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeLinecap="round"
        initial={false}
        animate={{ strokeDashoffset: c - c * pct }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      />
    </svg>
  );
}
