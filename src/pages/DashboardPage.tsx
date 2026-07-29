import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Profile, NutritionPlan, WeighIn, DailyTotals } from '@/types';
import { CalorieRingCard, MacroRingsGrid, MetabolicStatsCard } from '@/components/dashboard/DashboardCards';
import { WeightJourneyChart } from '@/components/dashboard/WeightJourneyChart';
import { WeeklyCheckInModal } from '@/components/checkin/WeeklyCheckInModal';
import { Button } from '@/components/ui';
import { useProfileStore } from '@/store/useProfileStore';

export function DashboardPage({
  profile,
  plan,
  weighIns,
  totals,
}: {
  profile: Profile;
  plan: NutritionPlan;
  weighIns: WeighIn[];
  totals: DailyTotals;
}) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const addWeighIn = useProfileStore((s) => s.addWeighIn);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold" style={{ color: 'var(--color-primary)' }}>
          Today's Nutrition Summary
        </h1>
        <p className="text-sm text-[var(--color-on-surface-variant)]">Monitor your metabolic vital signs and daily targets.</p>
      </div>

      <div className="grid md:grid-cols-[1.1fr_1fr_1fr] gap-4 mb-4">
        <CalorieRingCard totals={totals} plan={plan} />
        <MacroRingsGrid totals={totals} plan={plan} />
        <MetabolicStatsCard plan={plan} />
      </div>

      <div className="relative">
        <WeightJourneyChart weighIns={weighIns} />
        <button
          onClick={() => setCheckInOpen(true)}
          className="absolute -bottom-3 right-4 md:right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg cursor-pointer"
          style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}
          aria-label="Add weigh-in"
        >
          <Plus size={22} />
        </button>
      </div>

      <div className="mt-6 text-center">
        <Button variant="secondary" onClick={() => setCheckInOpen(true)}>Log Weekly Check-In</Button>
      </div>

      {checkInOpen && (
        <WeeklyCheckInModal
          profileId={profile.id}
          currentWeight={profile.weightKg}
          onClose={() => setCheckInOpen(false)}
          onSave={async (w) => {
            await addWeighIn(w);
            setCheckInOpen(false);
          }}
        />
      )}
    </div>
  );
}
