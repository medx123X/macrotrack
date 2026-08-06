import { useEffect, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import type { Profile } from '@/types';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useDayStore } from '@/store/useDayStore';
import { useExerciseDayStore, exerciseDayTotals } from '@/store/useExerciseDayStore';
import { Welcome } from '@/components/onboarding/Welcome';
import { CreateProfileWizard } from '@/components/onboarding/CreateProfileWizard';
import { PlanReveal } from '@/components/onboarding/PlanReveal';
import { AppHeader } from '@/components/nav/AppHeader';
import { BottomNav } from '@/components/nav/Nav';
import type { TabKey } from '@/components/nav/Nav';
import { DashboardPage } from '@/pages/DashboardPage';
import { TrackerPage } from '@/pages/TrackerPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { calculateNutritionPlan } from '@/engine/nutritionEngine';

type Stage = 'loading' | 'welcome' | 'wizard' | 'planReveal' | 'app';

/** Shown on first load and while profile/plan data is still being read from
 *  IndexedDB. Mimics the dashboard's layout so there's no jarring blank-to-
 *  full layout jump once real data arrives. */
function LoadingSkeleton() {
  return (
    <div className="min-h-screen p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 rounded-md bg-[var(--color-surface-container-high)] animate-pulse" />
        <div className="h-8 w-8 rounded-full bg-[var(--color-surface-container-high)] animate-pulse" />
      </div>
      <div className="glass rounded-xl p-8 flex flex-col items-center mb-4">
        <div className="w-44 h-44 rounded-full bg-[var(--color-surface-container-high)] animate-pulse mb-2" />
        <div className="h-4 w-40 rounded bg-[var(--color-surface-container-high)] animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-4 flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-[var(--color-surface-container-high)] animate-pulse mb-2" />
            <div className="h-3 w-14 rounded bg-[var(--color-surface-container-high)] animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [stage, setStage] = useState<Stage>('loading');
  const [draftProfile, setDraftProfile] = useState<Profile | null>(null);
  const [tab, setTab] = useState<TabKey>('dashboard');

  const loadSettings = useSettingsStore((s) => s.load);
  const { profile, plan, weighIns, load: loadProfile, createOrUpdateProfile } = useProfileStore();
  const dayLog = useDayStore((s) => s.log);
  const dayFoodsById = useDayStore((s) => s.foodsById);
  const dayTotalsFn = useDayStore((s) => s.totals);
  const loadDay = useDayStore((s) => s.loadDay);
  const loadFoods = useDayStore((s) => s.loadFoods);
  // Subscribing to `log`/`foodsById` directly (not just the stable `totals`
  // function reference) is what makes App actually re-render once the day's
  // data finishes loading after a refresh — see dayTotalsFn() usage below.
  void dayLog;
  void dayFoodsById;

  const exerciseLog = useExerciseDayStore((s) => s.log); // subscribe to data, not a function ref — see note above
  const loadExerciseDay = useExerciseDayStore((s) => s.loadDay);
  const exerciseTotals = exerciseDayTotals(exerciseLog);
  const settings = useSettingsStore((s) => s.settings);

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
      loadExerciseDay(profile.id);
    }
  }, [stage, profile?.id]);

  if (stage === 'loading') {
    return <LoadingSkeleton />;
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
    return <LoadingSkeleton />;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen">
        <AppHeader tab={tab} setTab={setTab} profile={profile} />
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {tab === 'dashboard' && (
              <DashboardPage
                profile={profile}
                plan={plan}
                weighIns={weighIns}
                totals={dayTotalsFn()}
                exerciseCaloriesBurned={exerciseTotals.caloriesBurned}
                exerciseMinutes={exerciseTotals.minutes}
                exerciseAffectsGoal={settings.exerciseAffectsGoal}
              />
            )}
            {tab === 'tracker' && <TrackerPage profile={profile} plan={plan} />}
            {tab === 'exercise' && <ExercisePage profile={profile} />}
            {tab === 'analytics' && <AnalyticsPage profile={profile} plan={plan} weighIns={weighIns} />}
            {tab === 'calendar' && <CalendarPage profile={profile} />}
            {tab === 'profile' && <ProfilePage profile={profile} />}
          </motion.div>
        </AnimatePresence>
        <BottomNav tab={tab} setTab={setTab} />
      </div>
    </MotionConfig>
  );
}
