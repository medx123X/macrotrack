import type { Settings } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

export class SettingsRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  get(): Promise<Settings> {
    return this.provider.getSettings();
  }

  save(settings: Settings): Promise<void> {
    return this.provider.saveSettings(settings);
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const current = await this.get();
    const next = { ...current, ...patch } as Settings;
    await this.save(next);
    return next;
  }

  exportAll(): Promise<Record<string, unknown>> {
    return this.provider.exportAll();
  }

  importAll(data: Record<string, unknown>): Promise<void> {
    return this.provider.importAll(data);
  }

  resetAll(): Promise<void> {
    return this.provider.resetAll();
  }
}

export const settingsRepository = new SettingsRepository();
