import { useState } from 'react';
import type { Food } from '@/types';

/**
 * Renders a food's photo when `imageUrl` is present, and falls back to the emoji
 * (in a soft tinted tile) when it's missing OR the image fails to load — so a
 * broken/expired Unsplash URL never leaves a blank gap in the UI.
 */
export function FoodThumb({
  food,
  size = 'md',
  className = '',
}: {
  food: Food;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const dims = size === 'sm' ? 'w-10 h-10 text-xl' : size === 'lg' ? 'w-full h-32 text-5xl' : 'w-14 h-14 text-3xl';
  const radius = size === 'lg' ? 'rounded-xl' : 'rounded-lg';

  if (food.imageUrl && !failed) {
    return (
      <img
        src={food.imageUrl}
        alt={food.name}
        onError={() => setFailed(true)}
        loading="lazy"
        className={`${dims} ${radius} object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${dims} ${radius} flex items-center justify-center shrink-0 ${className}`}
      style={{ background: 'var(--color-surface-container-high)' }}
    >
      <span>{food.emoji}</span>
    </div>
  );
}
