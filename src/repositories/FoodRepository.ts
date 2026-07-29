import type { Food } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

let catalogCache: Food[] | null = null;
let catalogPromise: Promise<Food[]> | null = null;

/** Loads the static, pre-merged food catalog once per session and caches it in memory. */
async function loadCatalog(): Promise<Food[]> {
  if (catalogCache) return catalogCache;
  if (!catalogPromise) {
    catalogPromise = fetch('/foods/foods.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load food catalog: ${res.status}`);
        return res.json();
      })
      .then((data: Food[]) => {
        catalogCache = data;
        return data;
      });
  }
  return catalogPromise;
}

export class FoodRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  async getAllCatalogFoods(): Promise<Food[]> {
    return loadCatalog();
  }

  async getCustomFoods(): Promise<Food[]> {
    return this.provider.getCustomFoods();
  }

  /** Combined catalog + user custom foods. */
  async getAllFoods(): Promise<Food[]> {
    const [catalog, custom] = await Promise.all([this.getAllCatalogFoods(), this.getCustomFoods()]);
    return [...catalog, ...custom];
  }

  async getFood(id: string): Promise<Food | undefined> {
    const all = await this.getAllFoods();
    return all.find((f) => f.id === id);
  }

  async searchFoods(query: string, categoryFilter?: string): Promise<Food[]> {
    const all = await this.getAllFoods();
    const q = query.trim().toLowerCase();
    return all.filter((f) => {
      const matchesQuery = !q || f.name.toLowerCase().includes(q);
      const matchesCat = !categoryFilter || categoryFilter === 'All' || f.cat === categoryFilter;
      return matchesQuery && matchesCat;
    });
  }

  async saveCustomFood(food: Food): Promise<void> {
    await this.provider.saveCustomFood({ ...food, isCustom: true });
  }

  async getFavorites(): Promise<Food[]> {
    const ids = await this.provider.getFavoriteFoodIds();
    const all = await this.getAllFoods();
    return ids.map((id) => all.find((f) => f.id === id)).filter((f): f is Food => Boolean(f));
  }

  async getFavoriteIds(): Promise<string[]> {
    return this.provider.getFavoriteFoodIds();
  }

  async toggleFavorite(foodId: string): Promise<string[]> {
    const ids = await this.provider.getFavoriteFoodIds();
    const next = ids.includes(foodId) ? ids.filter((id) => id !== foodId) : [...ids, foodId];
    await this.provider.setFavoriteFoodIds(next);
    return next;
  }

  async getRecentIds(): Promise<string[]> {
    return this.provider.getRecentFoodIds();
  }

  async pushRecent(foodId: string, max = 12): Promise<string[]> {
    const ids = await this.provider.getRecentFoodIds();
    const next = [foodId, ...ids.filter((id) => id !== foodId)].slice(0, max);
    await this.provider.setRecentFoodIds(next);
    return next;
  }
}

export const foodRepository = new FoodRepository();
