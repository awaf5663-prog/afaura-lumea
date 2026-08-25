import type { ElementType, ReactNode } from 'react';
import { useReveal } from '@/src/hooks/useReveal';
import { cn } from '@/src/lib/cn';

/** Enveloppe « apparition au scroll ». Utilisée avec parcimonie, une fois par bloc. */
export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
}) {
  const ref = useReveal<HTMLDivElement>(delay);
  return (
    <Tag ref={ref} className={cn('reveal', className)}>
      {children}
    </Tag>
  );
}
