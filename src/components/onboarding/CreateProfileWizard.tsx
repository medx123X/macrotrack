import { useState } from 'react';
import type { ActivityInputs, Gender, Goal, Profile, StepsBand, TrainingDaysBand } from '@/types';
import { Field, Input, Button, Pill } from '@/components/ui';
import { TRAINING_DAYS_OPTIONS, STEPS_OPTIONS } from '@/engine/activity';

const GOALS: { id: Goal; label: string; desc: string }[] = [
  { id: 'lose', label: 'Lose Fat', desc: 'Calorie deficit, preserve muscle' },
  { id: 'recomp', label: 'Body Recomposition', desc: 'Slight deficit, build strength' },
  { id: 'maintain', label: 'Maintain Weight', desc: 'Stay at current weight' },
  { id: 'leanbulk', label: 'Lean Bulk', desc: 'Slow, controlled surplus' },
  { id: 'musclegain', label: 'Muscle Gain', desc: 'Higher surplus, max growth' },
];

interface FormState {
  name: string;
  pin: string;
  age: string;
  gender: Gender;
  height: string;
  weight: string;
  goal: Goal;
  trainingDays: TrainingDaysBand;
  steps: StepsBand;
}

export function CreateProfileWizard({ onDone }: { onDone: (profile: Profile) => void }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<FormState>({
    name: '', pin: '', age: '', gender: 'male', height: '', weight: '',
    goal: 'maintain', trainingDays: 3, steps: '7.5-10k',
  });
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setF((prev) => ({ ...prev, [k]: v }));

  const steps = ['Personal Info', 'Activity Level', 'Your Goal'];
  const canNext = step === 0 ? Boolean(f.name && f.age && f.height && f.weight) : true;

  const finish = () => {
    const now = new Date().toISOString();
    const activity: ActivityInputs = { trainingDays: f.trainingDays, steps: f.steps };
    const profile: Profile = {
      id: `p-${Date.now()}`,
      name: f.name,
      pin: f.pin || undefined,
      age: Number(f.age),
      gender: f.gender,
      heightCm: Number(f.height),
      weightKg: Number(f.weight),
      goal: f.goal,
      activity,
      units: 'metric',
      createdAt: now,
      updatedAt: now,
    };
    onDone(profile);
  };

  return (
    <div className="min-h-screen p-5 pb-24 max-w-md mx-auto flex flex-col">
      <div className="flex gap-1.5 mb-6">
        {steps.map((s, i) => (
          <div
            key={s}
            className="flex-1 h-1 rounded-full"
            style={{ background: i <= step ? 'var(--color-primary)' : 'var(--color-outline-variant)' }}
          />
        ))}
      </div>
      <div className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'var(--color-primary)' }}>
        Step {step + 1} of {steps.length}
      </div>
      <h2 className="text-2xl font-extrabold mb-5">{steps[step]}</h2>

      {step === 0 && (
        <>
          <Field label="Profile Name">
            <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Mohammed" />
          </Field>
          <Field label="4-Digit PIN (optional)">
            <Input value={f.pin} maxLength={4} onChange={(e) => set('pin', e.target.value.replace(/\D/g, ''))} placeholder="••••" />
          </Field>
          <div className="flex gap-3">
            <Field label="Age"><Input type="number" value={f.age} onChange={(e) => set('age', e.target.value)} placeholder="28" /></Field>
            <Field label="Gender">
              <div className="flex gap-2">
                <Pill active={f.gender === 'male'} onClick={() => set('gender', 'male')}>Male</Pill>
                <Pill active={f.gender === 'female'} onClick={() => set('gender', 'female')}>Female</Pill>
              </div>
            </Field>
          </div>
          <div className="flex gap-3">
            <Field label="Height (cm)"><Input type="number" value={f.height} onChange={(e) => set('height', e.target.value)} placeholder="175" /></Field>
            <Field label="Weight (kg)"><Input type="number" value={f.weight} onChange={(e) => set('weight', e.target.value)} placeholder="82" /></Field>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <p className="text-sm text-[var(--color-on-surface-variant)] mb-4">
            We use both training frequency and daily steps to estimate your activity factor more accurately than a single label.
          </p>
          <Field label="Training days per week">
            <div className="grid grid-cols-1 gap-2">
              {TRAINING_DAYS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => set('trainingDays', o.value)}
                  className="text-left px-4 py-3 rounded-md border cursor-pointer transition-colors"
                  style={{
                    borderColor: f.trainingDays === o.value ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    background: f.trainingDays === o.value ? 'var(--color-primary-container)' + '22' : 'transparent',
                  }}
                >
                  <span className="font-semibold text-sm">{o.label}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Average daily steps">
            <div className="grid grid-cols-1 gap-2">
              {STEPS_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => set('steps', o.value)}
                  className="text-left px-4 py-3 rounded-md border cursor-pointer transition-colors"
                  style={{
                    borderColor: f.steps === o.value ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                    background: f.steps === o.value ? 'var(--color-primary-container)' + '22' : 'transparent',
                  }}
                >
                  <span className="font-semibold text-sm">{o.label}</span>
                </button>
              ))}
            </div>
          </Field>
        </>
      )}

      {step === 2 && (
        <div className="grid gap-2.5">
          {GOALS.map((g) => (
            <button
              key={g.id}
              onClick={() => set('goal', g.id)}
              className="text-left px-4 py-3.5 rounded-md border cursor-pointer transition-colors"
              style={{
                borderColor: f.goal === g.id ? 'var(--color-primary)' : 'var(--color-outline-variant)',
                background: f.goal === g.id ? 'var(--color-primary-container)' + '22' : 'transparent',
              }}
            >
              <div className="font-bold text-sm">{g.label}</div>
              <div className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      )}

      <div className="mt-auto pt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>Back</Button>
        )}
        {step < steps.length - 1 ? (
          <Button className="flex-1" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continue</Button>
        ) : (
          <Button className="flex-1" onClick={finish}>See My Plan</Button>
        )}
      </div>
    </div>
  );
}
