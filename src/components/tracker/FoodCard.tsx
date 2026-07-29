import { Search, Heart, Plus } from 'lucide-react';
import type { Food } from '@/types';
import { Card } from '@/components/ui';
import { FoodThumb } from '@/components/food/FoodThumb';
import { scaleFoodToServings } from '@/utils/unitConversion';

export function FoodSearchBar({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="glass rounded-xl flex items-center gap-2.5 px-4 py-3">
      <Search size={18} color="var(--color-outline)" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search Egyptian delicacies or any food…"
        className="bg-transparent outline-none flex-1 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]"
      />
    </div>
  );
}

export function CategoryList({ categories, active, onSelect }: { categories: string[]; active: string; onSelect: (c: string) => void }) {
  return (
    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      {['All', ...categories].map((c) => (
        <button
          key={c}
          onClick={() => onSelect(c)}
          className="text-left px-3.5 py-2.5 rounded-md text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors"
          style={{
            background: active === c ? 'var(--color-primary)' : 'transparent',
            color: active === c ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
          }}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function FoodCard({
  food,
  isFavorite,
  onToggleFavorite,
  onLog,
  onOpenDetail,
}: {
  food: Food;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onLog: () => void;
  onOpenDetail: () => void;
}) {
  const nutrition = scaleFoodToServings(food, 1);
  return (
    <Card padding="md" className="relative">
      <button
        onClick={onToggleFavorite}
        className="absolute top-3 right-3 cursor-pointer z-10"
        aria-label="Toggle favorite"
      >
        <Heart size={16} fill={isFavorite ? 'var(--color-fat)' : 'none'} color={isFavorite ? 'var(--color-fat)' : 'var(--color-outline)'} />
      </button>
      <button onClick={onOpenDetail} className="text-left w-full cursor-pointer">
        <FoodThumb food={food} size="lg" className="mb-2" />
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-bold text-sm leading-tight">{food.name}</span>
          <span className="font-mono-num text-xs font-bold shrink-0" style={{ color: 'var(--color-primary)' }}>
            {nutrition.kcal} <span className="text-[10px] font-normal text-[var(--color-outline)]">kcal</span>
          </span>
        </div>
        <div className="text-[11px] text-[var(--color-outline)] mb-2">{food.defaultServingLabel}</div>
        <div className="flex gap-1.5 flex-wrap">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-protein)26', color: 'var(--color-protein)' }}>P: {nutrition.protein}g</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-carbs)26', color: 'var(--color-carbs)' }}>C: {nutrition.carbs}g</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--color-fat)26', color: 'var(--color-fat)' }}>F: {nutrition.fat}g</span>
        </div>
      </button>
      <button
        onClick={onLog}
        className="mt-3 w-full rounded-lg py-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
        style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
      >
        <Plus size={14} /> Log Entry
      </button>
    </Card>
  );
}
