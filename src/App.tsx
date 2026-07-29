import { useEffect, useState } from 'react';
import type { Profile } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useDayStore } from '@/store/useDayStore';
import { Welcome } from '@/components/onboarding/Welcome';
import { CreateProfileWizard } from '@/components/onboarding/CreateProfileWizard';
import { PlanReveal } from '@/components/onboarding/PlanReveal';
import { AppHeader } from '@/components/nav/AppHeader';
import { BottomNav } from '@/components/nav/Nav';
import type { TabKey } from '@/components/nav/Nav';
import { DashboardPage } from '@/pages/DashboardPage';
import { TrackerPage } from '@/pages/TrackerPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { calculateNutritionPlan } from '@/engine/nutritionEngine';

type Stage = 'loading' | 'welcome' | 'wizard' | 'planReveal' | 'app';

export default function App() {
  const [stage, setStage] = useState<Stage>('loading');
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<TabKey>('dashboard');

  const loadSettings = useSettingsStore((s) => s.load);
  const { profile, plan, weighIns, load: loadProfile, createOrUpdateProfile } = useProfileStore();
  const dayTotals = useDayStore((s) => s.totals);
  const loadDay = useDayStore((s) => s.loadDay);
  const loadFoods = useDayStore((s) => s.loadFoods);

  useEffect(() => {
    (async () => {
      await loadSettings();
      await loadProfile();
      const active = useProfileStore.getState().profile;
      setStage(active ? 'app' : 'welcome');
    })();
  }, []);

  useEffect(() => {
    if (stage === 'app' && profile) {
      loadFoods();
      loadDay(profile.id);
    }
  }, [stage, profile?.id]);

  if (stage === 'loading') {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-outline)]">Loading…</div>;
  }

  if (stage === 'welcome') {
    return (
      <Welcome
        hasProfile={Boolean(profile)}
        onNew={() => setStage('wizard')}
        onContinue={() => setStage('app')}
      />
    );
  }

  if (stage === 'wizard') {
    return (
      <CreateProfileWizard
        onDone={(p) => {
          setDraftProfile(p);
          setStage('planReveal');
        }}
      />
    );
  }

  if (stage === 'planReveal' && draftProfile) {
    const previewPlan = calculateNutritionPlan(draftProfile, []);
    return (
      <PlanReveal
        plan={previewPlan}
        onStart={async () => {
          await createOrUpdateProfile(draftProfile);
          setStage('app');
        }}
      />
    );
  }

  if (!profile || !plan) {
    return <div className="min-h-screen flex items-center justify-center text-sm text-[var(--color-outline)]">Loading profile…</div>;
  }

  return (
    <div className="min-h-screen">
      <AppHeader tab={tab} setTab={setTab} name={profile.name} />
      {tab === 'dashboard' && <DashboardPage profile={profile} plan={plan} weighIns={weighIns} totals={dayTotals()} />}
      {tab === 'tracker' && <TrackerPage profile={profile} plan={plan} />}
      {tab === 'analytics' && <AnalyticsPage profile={profile} plan={plan} weighIns={weighIns} />}
      {tab === 'calendar' && <CalendarPage profile={profile} />}
      {tab === 'profile' && <ProfilePage profile={profile} />}
      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
