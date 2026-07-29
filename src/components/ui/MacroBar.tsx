import type { LucideIcon } from 'lucide-react';

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon?: LucideIcon;
}

export function MacroBar({ label, value, target, unit, color, icon: Icon }: MacroBarProps) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          {Icon && <Icon size={13} color={color} />}
          <span className="text-xs font-semibold text-[var(--color-on-surface-variant)]">{label}</span>
        </div>
        <span className="font-mono-num text-xs font-semibold text-[var(--color-on-surface)]">
          {Math.round(value)}
          <span className="text-[var(--color-outline)]">/{Math.round(target)}{unit}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--color-surface-container-high)] overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${pct * 100}%`, background: color }}
        />
      </div>
    </div>
  );
}
