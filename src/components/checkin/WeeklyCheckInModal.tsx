import { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button, Card, Field, Input } from '@/components/ui';
import type { WeighIn } from '@/types';
import { todayStr } from '@/utils/date';

export function WeeklyCheckInModal({
  profileId,
  currentWeight,
  onClose,
  onSave,
}: {
  profileId: string;
  currentWeight: number;
  onClose: () => void;
  onSave: (weighIn: WeighIn) => void;
}) {
  const [weight, setWeight] = useState(String(currentWeight));
  const [waist, setWaist] = useState('');

  const save = () => {
    if (!weight) return;
    const w: WeighIn = {
      id: `w-${Date.now()}`,
      profileId,
      date: todayStr(),
      weightKg: Number(weight),
      waistCm: waist ? Number(waist) : undefined,
      createdAt: new Date().toISOString(),
    };
    onSave(w);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-overlay p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
      <Card modal padding="lg" className="w-full" style={{ marginBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Weekly Check-In</h3>
          <button onClick={onClose} className="cursor-pointer text-[var(--color-outline)]"><X size={20} /></button>
        </div>
        <Field label="Current Weight (kg)">
          <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} autoFocus />
        </Field>
        <Field label="Waist Measurement (cm) — optional">
          <Input type="number" step="0.1" value={waist} onChange={(e) => setWaist(e.target.value)} placeholder="e.g. 85" />
        </Field>
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-5">
          We'll recalculate your BMR, TDEE, and daily targets using this weigh-in, and adjust your plan if your progress is off track.
        </p>
        <Button size="lg" className="w-full" onClick={save}>Save Check-In</Button>
      </Card>
      </motion.div>
    </motion.div>
  );
}
