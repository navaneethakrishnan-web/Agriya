import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'gold';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const variants: Record<string, string> = {
    primary:
      'bg-canopy-700 hover:bg-canopy-600 text-cream-50 shadow-md shadow-canopy-800/20',
    secondary:
      'bg-soil-500 hover:bg-soil-700 text-cream-50 shadow-md shadow-soil-700/20',
    outline:
      'border border-canopy-600 text-canopy-700 dark:text-canopy-200 dark:border-canopy-400 hover:bg-canopy-100 dark:hover:bg-canopy-800',
    ghost: 'text-canopy-700 dark:text-canopy-200 hover:bg-canopy-100 dark:hover:bg-canopy-800',
    gold: 'bg-gold-500 hover:bg-gold-600 text-canopy-950 shadow-md shadow-gold-600/30',
  };

  const sizes: Record<string, string> = {
    sm: 'text-sm px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
