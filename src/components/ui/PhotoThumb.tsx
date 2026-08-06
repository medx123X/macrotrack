import { useState } from 'react';

interface ThumbSubject {
  name: string;
  imageUrl?: string;
}

/**
 * Generic photo-or-fallback thumbnail. Shows `imageUrl` when present, falls
 * back to `fallback` (typically an emoji) if it's missing or fails to load.
 * Shared by FoodThumb-style usages (foods, exercises) so the fallback logic
 * lives in exactly one place.
 */
export function PhotoThumb({
  subject,
  fallback,
  size = 'md',
  className = '',
}: {
  subject: ThumbSubject;
  fallback: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const dims = size === 'sm' ? 'w-10 h-10 text-xl' : size === 'lg' ? 'w-full h-32 text-5xl' : 'w-14 h-14 text-3xl';
  const radius = size === 'lg' ? 'rounded-xl' : 'rounded-lg';

  if (subject.imageUrl && !failed) {
    return (
      <img
        src={subject.imageUrl}
        alt={subject.name}
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
      <span>{fallback}</span>
    </div>
  );
}
