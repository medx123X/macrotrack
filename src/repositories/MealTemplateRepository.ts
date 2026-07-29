import type { MealTemplate } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

export class MealTemplateRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  getAll(profileId: string): Promise<MealTemplate[]> {
    return this.provider.getMealTemplates(profileId);
  }

  save(template: MealTemplate): Promise<void> {
    return this.provider.saveMealTemplate(template);
  }

  delete(id: string): Promise<void> {
    return this.provider.deleteMealTemplate(id);
  }
}

export const mealTemplateRepository = new MealTemplateRepository();
