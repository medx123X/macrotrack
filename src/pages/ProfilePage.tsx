import { useRef, useState } from 'react';
import { Sun, Moon, Monitor, Download, Upload, Trash2, Camera } from 'lucide-react';
import type { Profile } from '@/types';
import { Card, Button, Pill, Avatar } from '@/components/ui';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useProfileStore } from '@/store/useProfileStore';
import { settingsRepository } from '@/repositories';
import { fileToResizedDataUrl } from '@/utils/image';

export function ProfilePage({ profile }: { profile: Profile }) {
  const { settings, update, resetAllData } = useSettingsStore();
  const createOrUpdateProfile = useProfileStore((s) => s.createOrUpdateProfile);
  const fileInput = useRef<HTMLInputElement>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);

  const handlePhotoChange = async (file: File) => {
    setPhotoError(null);
    setPhotoBusy(true);
    try {
      const photoUrl = await fileToResizedDataUrl(file);
      await createOrUpdateProfile({ ...profile, photoUrl, updatedAt: new Date().toISOString() });
    } catch (err) {
      setPhotoError(err instanceof Error ? err.message : 'Could not set that photo.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    await createOrUpdateProfile({ ...profile, photoUrl: undefined, updatedAt: new Date().toISOString() });
  };

  const exportData = async () => {
    const data = await settingsRepository.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `macrotrack-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await settingsRepository.importAll(data);
    window.location.reload();
  };

  const resetData = async () => {
    if (!confirm('This will permanently delete all your data. Continue?')) return;
    await resetAllData();
    window.location.reload();
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
      <h1 className="text-2xl font-extrabold mb-6" style={{ color: 'var(--color-primary)' }}>Profile & Settings</h1>

      <Card padding="lg" className="mb-4 flex items-center gap-4">
        <div className="relative shrink-0">
          <Avatar profile={profile} size="lg" />
          <button
            onClick={() => photoInput.current?.click()}
            disabled={photoBusy}
            aria-label="Change profile photo"
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60"
            style={{ background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: '2px solid var(--color-surface)' }}
          >
            <Camera size={13} />
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => e.target.files?.[0] && handlePhotoChange(e.target.files[0])}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold">{profile.name}</div>
          <div className="text-xs text-[var(--color-on-surface-variant)]">{profile.age} yrs • {profile.heightCm}cm • {profile.weightKg}kg</div>
          <div className="flex items-center gap-2 mt-1.5">
            <button onClick={() => photoInput.current?.click()} className="text-xs font-semibold cursor-pointer" style={{ color: 'var(--color-primary)' }}>
              {photoBusy ? 'Uploading…' : profile.photoUrl ? 'Change photo' : 'Add photo'}
            </button>
            {profile.photoUrl && (
              <button onClick={removePhoto} className="text-xs font-semibold cursor-pointer text-[var(--color-outline)]">Remove</button>
            )}
          </div>
          {photoError && <div className="text-xs mt-1" style={{ color: 'var(--color-error)' }}>{photoError}</div>}
        </div>
      </Card>

      <Card padding="lg" className="mb-4">
        <h3 className="font-bold text-sm mb-3">Appearance</h3>
        <div className="flex gap-2">
          <Pill active={settings.theme === 'light'} onClick={() => update({ theme: 'light' })}><Sun size={12} className="inline mr-1" />Light</Pill>
          <Pill active={settings.theme === 'dark'} onClick={() => update({ theme: 'dark' })}><Moon size={12} className="inline mr-1" />Dark</Pill>
          <Pill active={settings.theme === 'system'} onClick={() => update({ theme: 'system' })}><Monitor size={12} className="inline mr-1" />System</Pill>
        </div>
      </Card>

      <Card padding="lg" className="mb-4">
        <h3 className="font-bold text-sm mb-3">Units</h3>
        <div className="flex gap-2">
          <Pill active={settings.units === 'metric'} onClick={() => update({ units: 'metric' })}>Metric (kg/cm)</Pill>
          <Pill active={settings.units === 'imperial'} onClick={() => update({ units: 'imperial' })}>Imperial (lb/ft)</Pill>
        </div>
      </Card>

      <Card padding="lg" className="mb-4">
        <h3 className="font-bold text-sm mb-1">Adaptive Calories</h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
          Your starting target is a formula-based estimate. Once you've logged a couple of weekly
          weigh-ins, we compare your actual weight trend against your goal and nudge your daily
          calorie target up or down by ~100 kcal if you're off pace — so your plan gets more
          accurate the longer you use it, instead of relying on the day-1 estimate forever.
        </p>
        <div className="flex gap-2">
          <Pill active={settings.adaptiveCalories} onClick={() => update({ adaptiveCalories: true })}>On</Pill>
          <Pill active={!settings.adaptiveCalories} onClick={() => update({ adaptiveCalories: false })}>Off</Pill>
        </div>
      </Card>

      <Card padding="lg" className="mb-4">
        <h3 className="font-bold text-sm mb-1">Exercise Calories Affect Daily Goal</h3>
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">
          Your calorie target already accounts for your activity level from onboarding. Leave this
          Disabled (recommended) to see food and exercise calories separately without double-counting
          activity. Enable it to add logged exercise calories back into your remaining-calories total.
        </p>
        <div className="flex gap-2">
          <Pill active={settings.exerciseAffectsGoal} onClick={() => update({ exerciseAffectsGoal: true })}>Enabled</Pill>
          <Pill active={!settings.exerciseAffectsGoal} onClick={() => update({ exerciseAffectsGoal: false })}>Disabled</Pill>
        </div>
      </Card>

      <Card padding="lg" className="mb-4">
        <h3 className="font-bold text-sm mb-3">Data</h3>
        <div className="grid gap-2">
          <Button variant="secondary" onClick={exportData}><Download size={14} /> Export Data</Button>
          <Button variant="secondary" onClick={() => fileInput.current?.click()}><Upload size={14} /> Import Data</Button>
          <input ref={fileInput} type="file" accept="application/json" hidden onChange={(e) => e.target.files?.[0] && importData(e.target.files[0])} />
          <Button variant="danger" onClick={resetData}><Trash2 size={14} /> Reset All Data</Button>
        </div>
      </Card>
    </div>
  );
}
