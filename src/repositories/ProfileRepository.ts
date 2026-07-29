import type { Profile } from '@/types';
import type { StorageProvider } from '@/storage/StorageProvider';
import { DexieProvider } from '@/storage/DexieProvider';

export class ProfileRepository {
  private provider: StorageProvider;
  constructor(provider: StorageProvider = new DexieProvider()) {
    this.provider = provider;
  }

  getActive(): Promise<Profile | undefined> {
    return this.provider.getActiveProfile();
  }

  getById(id: string): Promise<Profile | undefined> {
    return this.provider.getProfile(id);
  }

  save(profile: Profile): Promise<void> {
    return this.provider.saveProfile(profile);
  }

  delete(id: string): Promise<void> {
    return this.provider.deleteProfile(id);
  }
}

export const profileRepository = new ProfileRepository();
