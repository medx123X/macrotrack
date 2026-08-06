import { motion } from 'framer-motion';
import type { Exercise } from '@/types';
import { Card, PhotoThumb } from '@/components/ui';

export function ExerciseCard({ exercise, index = 0, onOpen }: { exercise: Exercise; index?: number; onOpen: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 12) * 0.03, ease: 'easeOut' }}
    >
      <Card padding="md" onClick={onOpen} className="cursor-pointer">
        <PhotoThumb subject={exercise} fallback={exercise.icon} size="lg" className="mb-2" />
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-bold text-sm leading-tight">{exercise.name}</span>
        </div>
        <div className="text-[11px] text-[var(--color-outline)] mb-2">{exercise.category} · MET {exercise.metValue}</div>
        <div className="flex gap-1.5 flex-wrap">
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
            style={{ background: 'var(--color-primary-container)55', color: 'var(--color-on-primary-container)' }}
          >
            {exercise.difficulty}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full glass capitalize">{exercise.homeOrGym}</span>
        </div>
      </Card>
    </motion.div>
  );
}
