import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { resolved, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className={`glass rounded-full p-2.5 hover:scale-105 transition-transform cursor-pointer ${className}`}
    >
      {resolved === 'dark' ? <Sun size={18} color="var(--color-primary)" /> : <Moon size={18} color="var(--color-primary)" />}
    </button>
  );
}
