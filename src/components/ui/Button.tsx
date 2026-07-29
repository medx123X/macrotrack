import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const variantClasses: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90',
  secondary: 'glass text-[var(--color-on-surface)] border-[var(--color-secondary)] hover:bg-[var(--color-secondary-container)]/10',
  ghost: 'bg-transparent text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)]',
  danger: 'bg-[var(--color-error)] text-[var(--color-on-error)] hover:opacity-90',
};

const sizeClasses: Record<string, string> = {
  sm: 'text-sm px-3 py-1.5 rounded',
  md: 'text-sm px-4 py-2.5 rounded-lg',
  lg: 'text-base px-6 py-3.5 rounded-xl',
};

export function Button({ children, variant = 'primary', size = 'md', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
