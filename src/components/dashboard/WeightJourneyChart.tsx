import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip } from 'recharts';
import type { WeighIn } from '@/types';
import { Card } from '@/components/ui';

export function WeightJourneyChart({ weighIns, goalWeightKg }: { weighIns: WeighIn[]; goalWeightKg?: number }) {
  const data = weighIns.map((w) => ({ date: w.date, weight: w.weightKg }));
  const current = data.length ? data[data.length - 1].weight : undefined;
  const totalChange = data.length > 1 ? Math.round((data[data.length - 1].weight - data[0].weight) * 10) / 10 : 0;

  return (
    <Card padding="lg">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>Weight Journey</h3>
          <p className="text-xs text-[var(--color-on-surface-variant)]">
            {goalWeightKg ? `Progressing toward ${goalWeightKg}kg goal` : 'Track your progress over time'}
          </p>
        </div>
        {data.length > 0 && (
          <div className="flex gap-4 text-right">
            <div>
              <div className="text-[10px] uppercase text-[var(--color-outline)]">Current</div>
              <div className="font-mono-num font-bold text-sm">{current} kg</div>
            </div>
            <div>
              <div className="text-[10px] uppercase text-[var(--color-outline)]">Total Change</div>
              <div className="font-mono-num font-bold text-sm" style={{ color: totalChange <= 0 ? 'var(--color-primary)' : 'var(--color-tertiary)' }}>
                {totalChange > 0 ? '+' : ''}{totalChange} kg
              </div>
            </div>
          </div>
        )}
      </div>
      {data.length < 2 ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--color-outline)]">
          Not enough data yet — log a weekly check-in to see your trend.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--color-outline)' }} tickFormatter={(d) => d.slice(5)} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="weight" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}
