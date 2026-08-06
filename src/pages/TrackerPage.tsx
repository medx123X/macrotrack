import { useEffect, useMemo, useState } from 'react';
import { Plus, Droplet } from 'lucide-react';
import type { Food, MealKey, Profile, NutritionPlan } from '@/types';
import { FoodSearchBar, CategoryList, FoodCard } from '@/components/tracker/FoodCard';
import { FoodDetailModal } from '@/components/food/FoodDetailModal';
import { CustomFoodForm } from '@/components/tracker/CustomFoodForm';
import { Card, MacroBar, ProgressRing, Button } from '@/components/ui';
import { useFoodStore } from '@/store/useFoodStore';
import { useDayStore } from '@/store/useDayStore';

export function TrackerPage({ profile, plan }: { profile: Profile; plan: NutritionPlan }) {
  const { load, results, allFoods, favoriteIds, toggleFavorite, addCustomFood, query, setQuery, category, setCategory } = useFoodStore();
  const { loadDay, totals, addFood, addWater, log } = useDayStore();
  const [detailFood, setDetailFood] = useState<Food | null>(null);
  const [showCustomForm, setShowCustomForm] = useState(false);

  useEffect(() => {
    load();
    loadDay(profile.id);
  }, [profile.id]);

  const categories = useMemo(() => Array.from(new Set(allFoods.map((f) => f.cat))).sort(), [allFoods]);
  const list = results();
  const t = totals();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-8 grid md:grid-cols-[160px_1fr_280px] gap-5">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-outline)] mb-2 hidden md:block">Categories</div>
        <CategoryList categories={categories} active={category} onSelect={setCategory} />
      </div>

      <div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1"><FoodSearchBar value={query} onChange={setQuery} /></div>
          <Button variant="secondary" onClick={() => setShowCustomForm(true)}><Plus size={16} /></Button>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((food, i) => (
            <FoodCard
              key={food.id}
              food={food}
              index={i}
              isFavorite={favoriteIds.includes(food.id)}
              onToggleFavorite={() => toggleFavorite(food.id)}
              onLog={() => setDetailFood(food)}
              onOpenDetail={() => setDetailFood(food)}
            />
          ))}
          {list.length === 0 && (
            <div className="col-span-2 text-center text-sm text-[var(--color-outline)] py-10">No foods match your search.</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card padding="lg" className="flex flex-col items-center text-center">
          <div className="self-start text-xs font-bold uppercase text-[var(--color-outline)] mb-1">Today's Summary</div>
          <div className="relative flex items-center justify-center my-2">
            <ProgressRing size={110} stroke={10} progress={t.kcal / Math.max(1, plan.targetCalories)} color="var(--color-primary)" />
            <div className="absolute flex flex-col items-center">
              <span className="font-mono-num text-2xl font-extrabold">{Math.max(0, plan.targetCalories - t.kcal)}</span>
              <span className="text-[9px] uppercase text-[var(--color-outline)]">left of {plan.targetCalories}</span>
            </div>
          </div>
          <div className="w-full mt-2">
            <MacroBar label="Protein" value={t.protein} target={plan.protein} unit="g" color="var(--color-protein)" />
            <MacroBar label="Carbs" value={t.carbs} target={plan.carbs} unit="g" color="var(--color-carbs)" />
            <MacroBar label="Fat" value={t.fat} target={plan.fat} unit="g" color="var(--color-fat)" />
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold flex items-center gap-1.5"><Droplet size={13} color="var(--color-water)" /> WATER</span>
            <span className="font-mono-num text-xs font-bold">{((log?.waterMl ?? 0) / 1000).toFixed(1)}L / {(plan.water / 1000).toFixed(1)}L</span>
          </div>
          <div className="flex gap-2">
            {[250, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(profile.id, ml)}
                className="flex-1 glass rounded-md py-2 text-xs font-semibold cursor-pointer"
              >
                +{ml}ml
              </button>
            ))}
          </div>
        </Card>
      </div>

      {detailFood && (
        <FoodDetailModal
          food={detailFood}
          onClose={() => setDetailFood(null)}
          onAdd={async (mealKey: MealKey, grams) => {
            await addFood(profile.id, mealKey, detailFood, grams);
            setDetailFood(null);
          }}
        />
      )}

      {showCustomForm && (
        <CustomFoodForm
          onClose={() => setShowCustomForm(false)}
          onSave={async (food) => {
            await addCustomFood(food);
            setShowCustomForm(false);
          }}
        />
      )}
    </div>
  );
}
