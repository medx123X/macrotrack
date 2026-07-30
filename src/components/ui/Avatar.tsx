import type { Profile } from '@/types';

const SIZE_MAP = { sm: 32, md: 56, lg: 88 } as const;

export function Avatar({ profile, size = 'md', className = '' }: { profile: Profile; size?: keyof typeof SIZE_MAP; className?: string }) {
  const px = SIZE_MAP[size];
  if (profile.photoUrl) {
    return (
      <img
        src={profile.photoUrl}
        alt={profile.name}
        style={{ width: px, height: px }}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      style={{ width: px, height: px, background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)' }}
      className={`rounded-full flex items-center justify-center font-bold shrink-0 ${className}`}
    >
      <span style={{ fontSize: px * 0.4 }}>{profile.name.charAt(0).toUpperCase()}</span>
    </div>
  );
}
