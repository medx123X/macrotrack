import { useState } from 'react';
import { X } from 'lucide-react';
import type { Food } from '@/types';
import { Button, Card, Field, Input } from '@/components/ui';

export function CustomFoodForm({ onClose, onSave }: { onClose: () => void; onSave: (food: Food) => void }) {
  const [name, setName] = useState('');
  const [grams, setGrams] = useState('100');
  const [kcal, setKcal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const canSave = name && kcal;

  const save = () => {
    const servingGrams = Number(grams) || 100;
    const factor = 100 / servingGrams;
    const food: Food = {
      id: `custom-${Date.now()}`,
      name,
      cat: 'Custom',
      emoji: '🍽️',
      defaultServingLabel: `${servingGrams}g serving`,
      defaultServingGrams: servingGrams,
      basePer100g: {
        kcal: Math.round(Number(kcal) * factor),
        protein: Math.round(Number(protein || 0) * factor * 10) / 10,
        carbs: Math.round(Number(carbs || 0) * factor * 10) / 10,
        fat: Math.round(Number(fat || 0) * factor * 10) / 10,
        fiber: 0,
        sugar: 0,
      },
      isCustom: true,
    };
    onSave(food);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-overlay p-0 md:p-4" onClick={onClose}>
      <Card
        modal
        padding="lg"
        className="w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-b-none md:rounded-b-xl"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle md:hidden" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Add Custom Food</h3>
          <button onClick={onClose} className="cursor-pointer text-[var(--color-outline)]"><X size={20} /></button>
        </div>
        <Field label="Food Name"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mom's Kofta" /></Field>
        <Field label="Serving Size (grams)"><Input type="number" value={grams} onChange={(e) => setGrams(e.target.value)} /></Field>
        <Field label="Calories (per serving)"><Input type="number" value={kcal} onChange={(e) => setKcal(e.target.value)} /></Field>
        <div className="grid grid-cols-3 gap-2">
          <Field label="Protein (g)"><Input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} /></Field>
          <Field label="Carbs (g)"><Input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} /></Field>
          <Field label="Fat (g)"><Input type="number" value={fat} onChange={(e) => setFat(e.target.value)} /></Field>
        </div>
        <Button size="lg" className="w-full mt-2" disabled={!canSave} onClick={save}>Save Food</Button>
      </Card>
    </div>
  );
}
