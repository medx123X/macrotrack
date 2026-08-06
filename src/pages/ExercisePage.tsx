import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { Exercise, Profile } from '@/types';
import { ExerciseCard } from '@/components/exercise/ExerciseCard';
import { ExerciseDetailModal } from '@/components/exercise/ExerciseDetailModal';
import { CategoryList } from '@/components/tracker/FoodCard'; // generic, reused as-is
import { Card, StatCard } from '@/components/ui';
import { useExerciseStore } from '@/store/useExerciseStore';
import { useExerciseDayStore, exerciseDayTotals } from '@/store/useExerciseDayStore';

export function ExercisePage({ profile }: { profile: Profile }) {
  const { load, results, allExercises, query, setQuery, category, setCategory } = useExerciseStore();
  const { log, loadDay, addEntry, removeEntry } = useExerciseDayStore();
  const [detailExercise, setDetailExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    load();
    loadDay(profile.id);
  }, [profile.id]);

  const categories = useMemo(() => Array.from(new Set(allExercises.map((e) => e.category))).sort(), [allExercises]);
  const list = results();
  const totals = exerciseDayTotals(log);

  const favoriteExercise = useMemo(() => {
    if (!log || log.entries.length === 0) return null;
    const counts = new Map<string, number>();
    log.entries.forEach((e) => counts.set(e.exerciseId, (counts.get(e.exerciseId) ?? 0) + 1));
    const topId = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    return allExercises.find((e) => e.id === topId)?.name ?? null;
  }, [log, allExercises]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 pb-24 md:pb-8 grid md:grid-cols-[160px_1fr_280px] gap-5">
      <div>
        <div className="text-xs font-bold uppercase tracking-wide text-[var(--color-outline)] mb-2 hidden md:block">Categories</div>
        <CategoryList categories={categories} active={category} onSelect={setCategory} />
      </div>

      <div>
        <div className="glass rounded-xl flex items-center gap-2.5 px-4 py-3 mb-4">
          <Search size={18} color="var(--color-outline)" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercises…"
            className="bg-transparent outline-none flex-1 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)]"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map((exercise, i) => (
            <ExerciseCard key={exercise.id} exercise={exercise} index={i} onOpen={() => setDetailExercise(exercise)} />
          ))}
          {list.length === 0 && (
            <div className="col-span-2 text-center text-sm text-[var(--color-outline)] py-10">No exercises match your search.</div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <Card padding="lg">
          <div className="text-xs font-bold uppercase text-[var(--color-outline)] mb-3">Today's Exercise Summary</div>
          <div className="flex flex-wrap gap-2.5 mb-1">
            <StatCard label="Completed" value={totals.count} />
            <StatCard label="Minutes" value={totals.minutes} />
            <StatCard label="Calories" value={totals.caloriesBurned} color="var(--color-fat)" />
          </div>
          {favoriteExercise && (
            <div className="text-xs text-[var(--color-on-surface-variant)] mt-3">
              Favorite today: <span className="font-semibold text-[var(--color-on-surface)]">{favoriteExercise}</span>
            </div>
          )}
        </Card>

        {log && log.entries.length > 0 && (
          <Card padding="lg">
            <div className="text-xs font-bold uppercase text-[var(--color-outline)] mb-3">Logged Today</div>
            <div className="space-y-2">
              {log.entries.map((entry) => {
                const ex = allExercises.find((e) => e.id === entry.exerciseId);
                return (
                  <div key={entry.id} className="flex items-center gap-2.5 text-sm">
                    <span className="text-xl">{ex?.icon ?? '🏋️'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{ex?.name ?? 'Exercise'}</div>
                      <div className="text-[11px] text-[var(--color-outline)]">{entry.durationMin} min · {entry.caloriesBurned} kcal</div>
                    </div>
                    <button
                      onClick={() => removeEntry(profile.id, entry.id)}
                      className="text-xs text-[var(--color-outline)] cursor-pointer px-2"
                      aria-label="Remove entry"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {detailExercise && (
        <ExerciseDetailModal
          exercise={detailExercise}
          bodyWeightKg={profile.weightKg}
          onClose={() => setDetailExercise(null)}
          onLog={async (input) => {
            await addEntry(profile.id, detailExercise, profile.weightKg, input);
            setDetailExercise(null);
          }}
        />
      )}
    </div>
  );
}
