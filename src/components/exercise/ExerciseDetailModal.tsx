import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Flame } from 'lucide-react';
import type { Exercise } from '@/types';
import { calculateCaloriesBurned } from '@/types';
import { Button, Card, PhotoThumb } from '@/components/ui';

export function ExerciseDetailModal({
  exercise,
  bodyWeightKg,
  onClose,
  onLog,
}: {
  exercise: Exercise;
  bodyWeightKg: number;
  onClose: () => void;
  onLog: (input: { durationMin: number; sets?: number; reps?: number; distanceKm?: number; notes?: string }) => void;
}) {
  const [duration, setDuration] = useState(exercise.recommendedDurationMin);
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [distance, setDistance] = useState('');
  const [notes, setNotes] = useState('');

  const liveCalories = calculateCaloriesBurned(exercise.metValue, bodyWeightKg, duration);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-overlay p-0 md:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <Card
          modal
          padding="lg"
          className="w-full max-h-[85vh] overflow-y-auto rounded-b-none md:rounded-b-xl"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          <div className="modal-handle md:hidden" />
          <div className="flex items-start justify-between mb-2">
            <PhotoThumb subject={exercise} fallback={exercise.icon} size="md" />
            <button onClick={onClose} className="cursor-pointer text-[var(--color-outline)]"><X size={20} /></button>
          </div>
          <h3 className="text-lg font-bold mb-1">{exercise.name}</h3>
          <div className="text-xs text-[var(--color-outline)] mb-3">{exercise.category} · <span className="capitalize">{exercise.difficulty}</span></div>
          <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">{exercise.description}</p>

          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            {exercise.primaryMuscles.length > 0 && (
              <div><span className="text-[var(--color-outline)]">Primary: </span>{exercise.primaryMuscles.join(', ')}</div>
            )}
            {exercise.secondaryMuscles.length > 0 && (
              <div><span className="text-[var(--color-outline)]">Secondary: </span>{exercise.secondaryMuscles.join(', ')}</div>
            )}
            {exercise.equipment.length > 0 && (
              <div className="col-span-2"><span className="text-[var(--color-outline)]">Equipment: </span>{exercise.equipment.join(', ')}</div>
            )}
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-[var(--color-on-surface-variant)] block mb-1.5">Duration (minutes)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setDuration((d) => Math.max(5, d - 5))} className="w-9 h-9 rounded-full glass cursor-pointer font-bold">–</button>
              <span className="font-mono-num font-bold text-lg w-14 text-center">{duration}</span>
              <button onClick={() => setDuration((d) => d + 5)} className="w-9 h-9 rounded-full glass cursor-pointer font-bold">+</button>
              <span className="text-xs text-[var(--color-outline)]">min</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-on-surface-variant)] block mb-1">Sets</label>
              <input type="number" value={sets} onChange={(e) => setSets(e.target.value)} placeholder="—"
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-2 py-2 text-sm font-mono-num outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-on-surface-variant)] block mb-1">Reps</label>
              <input type="number" value={reps} onChange={(e) => setReps(e.target.value)} placeholder="—"
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-2 py-2 text-sm font-mono-num outline-none focus:border-[var(--color-primary)]" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-[var(--color-on-surface-variant)] block mb-1">Dist. (km)</label>
              <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} placeholder="—"
                className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-2 py-2 text-sm font-mono-num outline-none focus:border-[var(--color-primary)]" />
            </div>
          </div>

          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-sm outline-none focus:border-[var(--color-primary)] mb-4"
          />

          <div className="glass rounded-md p-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame size={16} color="var(--color-fat)" />
              <span className="text-xs font-bold uppercase tracking-wide">Est. Calories Burned</span>
            </div>
            <span className="font-mono-num text-lg font-extrabold" style={{ color: 'var(--color-fat)' }}>{liveCalories}</span>
          </div>

          <Button
            size="lg"
            className="w-full"
            onClick={() => onLog({
              durationMin: duration,
              sets: sets ? Number(sets) : undefined,
              reps: reps ? Number(reps) : undefined,
              distanceKm: distance ? Number(distance) : undefined,
              notes: notes || undefined,
            })}
          >
            Log Exercise
          </Button>
        </Card>
      </motion.div>
    </motion.div>
  );
}
