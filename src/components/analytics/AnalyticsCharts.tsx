import { ResponsiveContainer, BarChart, Bar, XAxis, PieChart, Pie, Cell, Tooltip, LineChart, Line } from 'recharts';
import type { DailyLog, DailyTotals, Food, WeighIn } from '@/types';
import { Card } from '@/components/ui';
import { dayTotals } from '@/utils/nutritionTotals';
import { weekdayLabel } from '@/utils/date';

export function WeeklyCaloriesChart({ logs, foodsById }: { logs: DailyLog[]; foodsById: Map<string, Food> }) {
  const data = logs.map((l) => ({ day: weekdayLabel(l.date), kcal: dayTotals(l, foodsById).kcal }));
  const avg = data.length ? Math.round(data.reduce((s, d) => s + d.kcal, 0) / data.length) : 0;
  return (
    <Card padding="lg">
      <h3 className="font-bold text-sm mb-0.5">Weekly Calorie Consumption</h3>
      <p className="text-xs text-[var(--color-outline)] mb-3">Average: {avg.toLocaleString()} kcal</p>
      {data.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-[var(--color-outline)]">Not enough data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--color-outline)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="kcal" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function MacroDonutChart({ totals }: { totals: DailyTotals }) {
  const proteinCal = totals.protein * 4;
  const carbsCal = totals.carbs * 4;
  const fatCal = totals.fat * 9;
  const total = proteinCal + carbsCal + fatCal || 1;
  const data = [
    { name: 'Protein', value: proteinCal, color: 'var(--color-protein)' },
    { name: 'Carbs', value: carbsCal, color: 'var(--color-carbs)' },
    { name: 'Fat', value: fatCal, color: 'var(--color-fat)' },
  ];
  return (
    <Card padding="lg" className="flex flex-col items-center">
      <h3 className="font-bold text-sm self-start mb-0.5">Daily Split</h3>
      <p className="text-xs text-[var(--color-outline)] self-start mb-2">Macronutrient Target</p>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={45} outerRadius={65} paddingAngle={3}>
            {data.map((d) => <Cell key={d.name} fill={d.color} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-1">
        {data.map((d) => (
          <div key={d.name} className="text-center">
            <div className="flex items-center gap-1 justify-center">
              <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
              <span className="font-mono-num text-xs font-bold">{Math.round((d.value / total) * 100)}%</span>
            </div>
            <div className="text-[10px] text-[var(--color-outline)]">{d.name}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ProteinConsistencyChart({ logs, foodsById, target }: { logs: DailyLog[]; foodsById: Map<string, Food>; target: number }) {
  const data = logs.map((l) => ({ day: weekdayLabel(l.date), protein: dayTotals(l, foodsById).protein }));
  return (
    <Card padding="lg">
      <h3 className="font-bold text-sm mb-0.5">Protein Consistency</h3>
      <p className="text-xs text-[var(--color-outline)] mb-3">Target: {target}g/day</p>
      {data.length === 0 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--color-outline)]">Not enough data yet.</div>
      ) : (
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: 'var(--color-outline)' }} axisLine={false} tickLine={false} />
            <Line type="monotone" dataKey="protein" stroke="var(--color-protein)" strokeWidth={3} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export function WeightTrajectoryChart({ weighIns }: { weighIns: WeighIn[] }) {
  const data = weighIns.map((w) => ({ date: w.date, weight: w.weightKg }));
  const totalLoss = data.length > 1 ? Math.round((data[0].weight - data[data.length - 1].weight) * 10) / 10 : 0;
  return (
    <Card padding="lg">
      <h3 className="font-bold text-sm mb-0.5">Weight Trajectory</h3>
      <p className="text-xs text-[var(--color-outline)] mb-3">{data.length ? `Current: ${data[data.length - 1].weight} kg` : 'No weigh-ins yet'}</p>
      {data.length < 2 ? (
        <div className="h-32 flex items-center justify-center text-sm text-[var(--color-outline)]">Not enough data yet.</div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={130}>
            <LineChart data={data}>
              <Line type="monotone" dataKey="weight" stroke="var(--color-water)" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="text-center mt-2">
            <span className="text-[10px] uppercase text-[var(--color-outline)]">Total Change: </span>
            <span className="font-mono-num text-sm font-bold" style={{ color: totalLoss >= 0 ? 'var(--color-primary)' : 'var(--color-tertiary)' }}>
              {totalLoss > 0 ? `-${totalLoss}` : `+${Math.abs(totalLoss)}`} kg
            </span>
          </div>
        </>
      )}
    </Card>
  );
}
