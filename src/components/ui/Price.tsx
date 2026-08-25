import { formatFcfa } from '@/src/lib/format';
import { cn } from '@/src/lib/cn';

export function Price({
  amount,
  compareAt,
  className,
}: {
  amount: number;
  compareAt?: number | null;
  className?: string;
}) {
  return (
    <span className={cn('inline-flex items-baseline gap-2', className)}>
      <span className="font-medium tabular-nums">{formatFcfa(amount)}</span>
      {compareAt && compareAt > amount ? (
        <span className="text-[13px] text-stone line-through tabular-nums">{formatFcfa(compareAt)}</span>
      ) : null}
    </span>
  );
}
