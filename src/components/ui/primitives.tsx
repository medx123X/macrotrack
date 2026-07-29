import type { ReactNode, InputHTMLAttributes } from 'react';

export function StatCard({ label, value, sub, color }: { label: string; value: ReactNode; sub?: string; color?: string }) {
  return (
    <div className="glass rounded-md p-3.5 flex-1 min-w-[130px]">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-[var(--color-outline)] mb-1.5">{label}</div>
      <div className="font-mono-num text-xl font-bold" style={{ color: color ?? 'var(--color-on-surface)' }}>{value}</div>
      {sub && <div className="text-[11px] text-[var(--color-on-surface-variant)] mt-0.5">{sub}</div>}
    </div>
  );
}

export function Pill({
  active,
  children,
  onClick,
  color = 'var(--color-primary)',
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap cursor-pointer transition-all border"
      style={{
        borderColor: active ? color : 'var(--color-outline-variant)',
        background: active ? color : 'transparent',
        color: active ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)',
      }}
    >
      {children}
    </button>
  );
}

export function MacroChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <span
      className="text-xs font-semibold px-2.5 py-1 rounded-full border font-mono-num"
      style={{ background: `${color}26`, borderColor: color, color }}
    >
      {label}: {value}
    </span>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-[var(--color-on-surface-variant)] mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] rounded-md px-3.5 py-3 text-[var(--color-on-surface)] text-sm outline-none focus:border-[var(--color-primary)] transition-colors ${props.className ?? ''}`}
    />
  );
}
