import { create } from 'zustand';
import type { Food } from '@/types';
import { foodRepository } from '@/repositories';

interface FoodState {
  allFoods: Food[];
  favoriteIds: string[];
  recentIds: string[];
  query: string;
  category: string;
  loaded: boolean;

  load: () => Promise<void>;
  setQuery: (q: string) => void;
  setCategory: (c: string) => void;
  results: () => Food[];
  toggleFavorite: (foodId: string) => Promise<void>;
  addCustomFood: (food: Food) => Promise<void>;
}

export const useFoodStore = create<FoodState>((set, get) => ({
  allFoods: [],
  favoriteIds: [],
  recentIds: [],
  query: '',
  category: 'All',
  loaded: false,

  load: async () => {
    const [allFoods, favoriteIds, recentIds] = await Promise.all([
      foodRepository.getAllFoods(),
      foodRepository.getFavoriteIds(),
      foodRepository.getRecentIds(),
    ]);
    set({ allFoods, favoriteIds, recentIds, loaded: true });
  },

  setQuery: (q) => set({ query: q }),
  setCategory: (c) => set({ category: c }),

  results: () => {
    const { allFoods, query, category } = get();
    const q = query.trim().toLowerCase();
    return allFoods.filter((f) => {
      const matchesQuery = !q || f.name.toLowerCase().includes(q);
      const matchesCat = category === 'All' || f.cat === category;
      return matchesQuery && matchesCat;
    });
  },

  toggleFavorite: async (foodId) => {
    const favoriteIds = await foodRepository.toggleFavorite(foodId);
    set({ favoriteIds });
  },

  addCustomFood: async (food) => {
    await foodRepository.saveCustomFood(food);
    const allFoods = await foodRepository.getAllFoods();
    set({ allFoods });
  },
}));
