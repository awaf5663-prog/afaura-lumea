import { Minus, Plus } from 'lucide-react';
import { cn } from '@/src/lib/cn';

interface Props {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label }: Props) {
  const dim = size === 'sm' ? 'size-9' : 'size-11';
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white">
      <button
        type="button"
        aria-label={`Retirer une unité${label ? ` de ${label}` : ''}`}
        className={cn(dim, 'press grid place-items-center rounded-full text-ink disabled:text-stone/40')}
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-4" />
      </button>
      <span
        aria-live="polite"
        className={cn('min-w-8 text-center text-sm font-semibold tabular-nums', size === 'sm' && 'text-[13px]')}
      >
        {value}
      </span>
      <button
        type="button"
        aria-label={`Ajouter une unité${label ? ` de ${label}` : ''}`}
        className={cn(dim, 'press grid place-items-center rounded-full text-ink disabled:text-stone/40')}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
