import { useState } from 'react';
import { X } from 'lucide-react';
import type { Food, MealKey } from '@/types';
import { Button, Card, Pill } from '@/components/ui';
import { FoodThumb } from '@/components/food/FoodThumb';
import { scaleFoodToGrams, scaleFoodToServings } from '@/utils/unitConversion';

const MEALS: { key: MealKey; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export function FoodDetailModal({
  food,
  onClose,
  onAdd,
}: {
  food: Food;
  onClose: () => void;
  onAdd: (mealKey: MealKey, grams: number) => void;
}) {
  const [mode, setMode] = useState<'serving' | 'grams'>('serving');
  const [qty, setQty] = useState(1);
  const [grams, setGrams] = useState(food.defaultServingGrams);
  const [mealKey, setMealKey] = useState<MealKey>('lunch');

  const actualGrams = mode === 'serving' ? food.defaultServingGrams * qty : grams;
  const nutrition = mode === 'serving' ? scaleFoodToServings(food, qty) : scaleFoodToGrams(food, grams);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center modal-overlay p-0 md:p-4" onClick={onClose}>
      <Card
        modal
        padding="lg"
        className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-b-none md:rounded-b-xl"
        style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-handle md:hidden" />
        <div className="flex items-start justify-between mb-2">
          <FoodThumb food={food} size="md" />
          <button onClick={onClose} className="cursor-pointer text-[var(--color-outline)]"><X size={20} /></button>
        </div>
        <h3 className="text-lg font-bold mb-1">{food.name}</h3>
        <div className="text-xs text-[var(--color-outline)] mb-4">{food.cat}</div>

        <div className="flex gap-2 mb-3">
          <Pill active={mode === 'serving'} onClick={() => setMode('serving')}>By Serving</Pill>
          <Pill active={mode === 'grams'} onClick={() => setMode('grams')}>Custom Grams</Pill>
        </div>

        {mode === 'serving' ? (
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => setQty((q) => Math.max(0.5, q - 0.5))} className="w-9 h-9 rounded-full glass cursor-pointer font-bold">–</button>
            <span className="font-mono-num font-bold text-lg w-16 text-center">{qty}×</span>
            <button onClick={() => setQty((q) => q + 0.5)} className="w-9 h-9 rounded-full glass cursor-pointer font-bold">+</button>
            <span className="text-xs text-[var(--color-outline)]">{food.defaultServingLabel}</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 mb-4">
            <input
              type="number"
              value={grams}
              onChange={(e) => setGrams(Number(e.target.value))}
              className="w-24 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-3 py-2 text-sm font-mono-num outline-none focus:border-[var(--color-primary)]"
            />
            <span className="text-sm text-[var(--color-outline)]">grams</span>
          </div>
        )}

        <div className="glass rounded-md p-4 mb-4">
          <div className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--color-primary)' }}>
            Nutrition Facts ({actualGrams}g)
          </div>
          <div className="flex justify-between text-sm font-bold mb-2 pb-2 border-b border-[var(--glass-border)]">
            <span>Calories</span><span className="font-mono-num">{nutrition.kcal}</span>
          </div>
          {[
            ['Protein', nutrition.protein, 'var(--color-protein)'],
            ['Carbs', nutrition.carbs, 'var(--color-carbs)'],
            ['Fat', nutrition.fat, 'var(--color-fat)'],
            ['Fiber', nutrition.fiber, undefined],
            ['Sugar', nutrition.sugar, undefined],
          ].map(([label, val, color]) => (
            <div key={label as string} className="flex justify-between text-xs py-1.5">
              <span style={{ color: (color as string) ?? 'var(--color-on-surface-variant)' }}>{label}</span>
              <span className="font-mono-num">{val}g</span>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-xs font-semibold text-[var(--color-on-surface-variant)] mb-2">Add to</div>
          <div className="grid grid-cols-4 gap-1.5">
            {MEALS.map((m) => (
              <Pill key={m.key} active={mealKey === m.key} onClick={() => setMealKey(m.key)}>{m.label}</Pill>
            ))}
          </div>
        </div>

        <Button size="lg" className="w-full" onClick={() => onAdd(mealKey, actualGrams)}>Add Entry</Button>
      </Card>
    </div>
  );
}
