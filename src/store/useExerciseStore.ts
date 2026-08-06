import { create } from 'zustand';
import type { Exercise } from '@/types';
import { exerciseRepository } from '@/repositories';

interface ExerciseState {
  allExercises: Exercise[];
  query: string;
  category: string;
  loaded: boolean;

  load: () => Promise<void>;
  setQuery: (q: string) => void;
  setCategory: (c: string) => void;
  results: () => Exercise[];
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  allExercises: [],
  query: '',
  category: 'All',
  loaded: false,

  load: async () => {
    const allExercises = await exerciseRepository.getAllExercises();
    set({ allExercises, loaded: true });
  },

  setQuery: (q) => set({ query: q }),
  setCategory: (c) => set({ category: c }),

  results: () => {
    const { allExercises, query, category } = get();
    const q = query.trim().toLowerCase();
    return allExercises.filter((e) => {
      const matchesQuery = !q || e.name.toLowerCase().includes(q);
      const matchesCat = category === 'All' || e.category === category;
      return matchesQuery && matchesCat;
    });
  },
}));
