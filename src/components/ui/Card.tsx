import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({
  children,
  className,
  strong,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; strong?: boolean }) {
  return (
    <div
      className={cn(
        strong ? 'glass-strong' : 'glass',
        'rounded-3xl p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({
  children,
  tone = 'canopy',
  className,
}: {
  children: ReactNode;
  tone?: 'canopy' | 'gold' | 'soil' | 'olive';
  className?: string;
}) {
  const tones: Record<string, string> = {
    canopy: 'bg-canopy-100 text-canopy-800 dark:bg-canopy-800 dark:text-canopy-100',
    gold: 'bg-gold-300/60 text-gold-600 dark:bg-gold-600/30 dark:text-gold-300',
    soil: 'bg-soil-100 text-soil-700 dark:bg-soil-700/30 dark:text-soil-100',
    olive: 'bg-olive-300/40 text-olive-700 dark:bg-olive-700/30 dark:text-olive-300',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
