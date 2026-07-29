import { ArrowRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui';

export function Welcome({ onNew, onContinue, hasProfile }: { onNew: () => void; onContinue: () => void; hasProfile: boolean }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      <div
        className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-primary-container), transparent 70%)', opacity: 0.25 }}
      />
      <div
        className="absolute -bottom-24 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, var(--color-secondary-container), transparent 70%)', opacity: 0.2 }}
      />
      <div className="relative z-10 max-w-md w-full text-center">
        <img src={logo} alt="MacroTrack Egypt" className="w-24 h-24 mx-auto rounded-2xl bg-white shadow-lg object-contain p-2 mb-6" />
        <h1 className="text-3xl md:text-4xl font-extrabold leading-tight" style={{ color: 'var(--color-primary)' }}>
          Welcome to Your Health Journey
        </h1>
        <p className="mt-3 text-[var(--color-on-surface-variant)] leading-relaxed">
          Calories and macros built for koshary, ful, and shawarma nights — with clinical precision, not guesswork.
        </p>
        <div className="mt-10 grid gap-3">
          <Button size="lg" onClick={onNew} className="justify-between">
            Create New Profile <ArrowRight size={18} />
          </Button>
          {hasProfile && (
            <Button size="lg" variant="secondary" onClick={onContinue}>
              Continue Existing Profile
            </Button>
          )}
        </div>
        <p className="mt-10 text-[10px] uppercase tracking-widest text-[var(--color-outline)]">
          Clinical Precision • Egyptian Excellence • Offline-First
        </p>
      </div>
    </div>
  );
}
