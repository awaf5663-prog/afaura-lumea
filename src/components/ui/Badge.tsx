import type { ReactNode } from 'react';
import { cn } from '@/src/lib/cn';

type Tone = 'new' | 'popular' | 'neutral' | 'soldout' | 'accent';

const TONES: Record<Tone, string> = {
  new: 'bg-ink text-ivory',
  popular: 'bg-blush text-mauve',
  neutral: 'bg-cream text-stone',
  soldout: 'bg-stone/85 text-white',
  accent: 'bg-sand text-graphite',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
