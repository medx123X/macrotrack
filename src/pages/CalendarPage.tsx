import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import type { DailyLog, Food, Profile } from '@/types';
import { Card, EmptyState } from '@/components/ui';
import { logRepository, foodRepository } from '@/repositories';
import { daysInMonth, toDateStr } from '@/utils/date';
import { dayTotals } from '@/utils/nutritionTotals';

export function CalendarPage({ profile }: { profile: Profile }) {
  const [viewDate, setViewDate] = useState(new Date());
  const [logsByDate, setLogsByDate] = useState<Map<string, DailyLog>>(new Map());
  const [foodsById, setFoodsById] = useState<Map<string, Food>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  useEffect(() => {
    (async () => {
      const [all, foods] = await Promise.all([logRepository.getAll(profile.id), foodRepository.getAllFoods()]);
      setLogsByDate(new Map(all.map((l) => [l.date, l])));
      setFoodsById(new Map(foods.map((f) => [f.id, f])));
    })();
  }, [profile.id]);

  const days = useMemo(() => {
    const total = daysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Monday-first
    const cells: (string | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= total; d++) cells.push(toDateStr(new Date(year, month, d)));
    return cells;
  }, [year, month]);

  const selectedLog = selected ? logsByDate.get(selected) : undefined;
  const selectedTotals = selectedLog ? dayTotals(selectedLog, foodsById) : null;
  const hasAnyLogs = Array.from(logsByDate.values()).some((l) => Object.values(l.meals).some((m) => m.length > 0));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
      <h1 className="text-2xl font-extrabold mb-4" style={{ color: 'var(--color-primary)' }}>Calendar</h1>

      <Card padding="lg" className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="cursor-pointer glass rounded-full p-1.5">
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-sm">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="cursor-pointer glass rounded-full p-1.5">
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center mb-2">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="text-[10px] font-bold text-[var(--color-outline)]">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((date, i) => {
            if (!date) return <div key={i} />;
            const hasLog = logsByDate.has(date) && Object.values(logsByDate.get(date)!.meals).some((m) => m.length > 0);
            const isSelected = selected === date;
            return (
              <button
                key={date}
                onClick={() => setSelected(date)}
                className="aspect-square rounded-md text-xs font-semibold flex flex-col items-center justify-center cursor-pointer relative"
                style={{
                  background: isSelected ? 'var(--color-primary)' : 'transparent',
                  color: isSelected ? 'var(--color-on-primary)' : 'var(--color-on-surface)',
                }}
              >
                {Number(date.slice(-2))}
                {hasLog && !isSelected && (
                  <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: 'var(--color-primary)' }} />
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card padding="lg">
          <h3 className="font-bold text-sm mb-3">{selected}</h3>
          {!selectedTotals || selectedTotals.kcal === 0 ? (
            <p className="text-sm text-[var(--color-outline)]">No entries logged this day.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center">
              <div><div className="font-mono-num font-bold text-sm">{selectedTotals.kcal}</div><div className="text-[10px] text-[var(--color-outline)]">kcal</div></div>
              <div><div className="font-mono-num font-bold text-sm" style={{ color: 'var(--color-protein)' }}>{selectedTotals.protein}g</div><div className="text-[10px] text-[var(--color-outline)]">protein</div></div>
              <div><div className="font-mono-num font-bold text-sm" style={{ color: 'var(--color-carbs)' }}>{selectedTotals.carbs}g</div><div className="text-[10px] text-[var(--color-outline)]">carbs</div></div>
              <div><div className="font-mono-num font-bold text-sm" style={{ color: 'var(--color-fat)' }}>{selectedTotals.fat}g</div><div className="text-[10px] text-[var(--color-outline)]">fat</div></div>
            </div>
          )}
        </Card>
      )}

      {!selected && !hasAnyLogs && (
        <EmptyState
          icon={CalendarDays}
          title="No history yet"
          message="Once you log a few days in the Tracker tab, tap any date above to see what you ate that day."
        />
      )}
    </div>
  );
}
