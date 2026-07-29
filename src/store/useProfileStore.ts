import { create } from 'zustand';
import type { NutritionPlan, Profile, WeighIn } from '@/types';
import { profileRepository, logRepository } from '@/repositories';
import { calculateNutritionPlan } from '@/engine/nutritionEngine';
import { useSettingsStore } from './useSettingsStore';

interface ProfileState {
  profile: Profile | undefined;
  weighIns: WeighIn[];
  plan: NutritionPlan | undefined;
  loaded: boolean;

  load: () => Promise<void>;
  createOrUpdateProfile: (profile: Profile) => Promise<void>;
  recalculate: () => void;
  addWeighIn: (weighIn: WeighIn) => Promise<void>;
}

function derivePlan(profile: Profile | undefined, weighIns: WeighIn[]): NutritionPlan | undefined {
  if (!profile) return undefined;
  const { settings } = useSettingsStore.getState();
  return calculateNutritionPlan(profile, weighIns, {
    adaptiveEnabled: settings.adaptiveCalories,
    proteinGPerKgOverride: settings.proteinGPerKgOverride,
    fatGPerKgOverride: settings.fatGPerKgOverride,
  });
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: undefined,
  weighIns: [],
  plan: undefined,
  loaded: false,

  load: async () => {
    const profile = await profileRepository.getActive();
    const weighIns = profile ? await logRepository.getWeighIns(profile.id) : [];
    set({ profile, weighIns, plan: derivePlan(profile, weighIns), loaded: true });
  },

  createOrUpdateProfile: async (profile) => {
    await profileRepository.save(profile);
    const weighIns = await logRepository.getWeighIns(profile.id);
    set({ profile, weighIns, plan: derivePlan(profile, weighIns) });
  },

  recalculate: () => {
    const { profile, weighIns } = get();
    set({ plan: derivePlan(profile, weighIns) });
  },

  addWeighIn: async (weighIn) => {
    await logRepository.saveWeighIn(weighIn);
    const profile = await profileRepository.getById(weighIn.profileId);
    const weighIns = await logRepository.getWeighIns(weighIn.profileId);
    // Recalculates BMR/TDEE/targets against the freshly-updated profile weight —
    // this is the "recalculate on every weigh-in" behavior from the architecture review.
    set({ profile, weighIns, plan: derivePlan(profile, weighIns) });
  },
}));
