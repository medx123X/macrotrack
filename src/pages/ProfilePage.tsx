import { useRef } from 'react';
import { Sun, Moon, Monitor, Download, Upload, Trash2 } from 'lucide-react';
import type { Profile } from '@/types';
import { Card, Button, Pill } from '@/components/ui';
import { useSettingsStore } from '@/store/useSettingsStore';
import { settingsRepository } from '@/repositories';

export function ProfilePage({ profile }: { profile: Profile }) {
  const { settings, update, resetAllData } = useSettingsStore();
  const fileInput = useRef<HTMLInputElement>(null);

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
        <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}>
          {profile.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="font-bold">{profile.name}</div>
          <div className="text-xs text-[var(--color-on-surface-variant)]">{profile.age} yrs • {profile.heightCm}cm • {profile.weightKg}kg</div>
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
        <p className="text-xs text-[var(--color-on-surface-variant)] mb-3">Automatically adjust your daily target based on real weigh-in progress.</p>
        <div className="flex gap-2">
          <Pill active={settings.adaptiveCalories} onClick={() => update({ adaptiveCalories: true })}>On</Pill>
          <Pill active={!settings.adaptiveCalories} onClick={() => update({ adaptiveCalories: false })}>Off</Pill>
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
