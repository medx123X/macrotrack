import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from './Card';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Friendly placeholder for pages/sections with no data yet — used instead of
 * rendering blank charts or empty grids, which can read as broken rather than
 * "nothing here yet." Keep title short (a few words) and message to one line.
 */
export function EmptyState({ icon: Icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Card padding="lg" className="flex flex-col items-center text-center py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
        style={{ background: 'var(--color-primary-container)' + '33' }}
      >
        <Icon size={24} color="var(--color-primary)" />
      </motion.div>
      <h3 className="font-bold text-sm mb-1">{title}</h3>
      <p className="text-xs text-[var(--color-on-surface-variant)] max-w-xs mb-4">{message}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>{actionLabel}</Button>
      )}
    </Card>
  );
}
