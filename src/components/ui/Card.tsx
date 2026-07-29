import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  elevated?: boolean;
  modal?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = { sm: 'p-3', md: 'p-6', lg: 'p-8' };

export function Card({ children, elevated, modal, padding = 'md', className = '', ...rest }: CardProps) {
  const surfaceClass = modal ? 'glass-modal' : elevated ? 'glass-elevated' : 'glass';
  return (
    <div
      className={`${surfaceClass} rounded-xl ${paddingMap[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
