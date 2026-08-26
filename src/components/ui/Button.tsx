import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'light' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-ivory hover:bg-graphite disabled:bg-stone',
  secondary: 'bg-transparent text-ink border border-ink/25 hover:border-ink hover:bg-ink/[0.03]',
  ghost: 'bg-cream text-ink hover:bg-sand',
  /** Sur fond sombre : impossible à obtenir par surcharge, les classes se neutralisent. */
  light: 'bg-ivory text-ink hover:bg-cream',
  danger: 'bg-[#8a2f2f] text-white hover:bg-[#742727]',
};

const SIZES: Record<Size, string> = {
  sm: 'h-10 px-4 text-[13px]',
  md: 'h-12 px-6 text-[14px]',
  lg: 'h-14 px-7 text-[15px]',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  full,
  loading,
  icon,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'press inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-wide',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
        'disabled:cursor-not-allowed disabled:opacity-60',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        icon
      )}
      {children}
    </button>
  );
}
