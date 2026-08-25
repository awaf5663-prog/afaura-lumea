import { Check } from 'lucide-react';
import { cn } from '@/src/lib/cn';

interface Step {
  id: string;
  label: string;
  hint: string;
}

/** Timeline verticale : passé / étape en cours / à venir. */
export function StatusTimeline({
  steps,
  currentId,
  cancelled,
}: {
  steps: Step[];
  currentId: string;
  cancelled?: boolean;
}) {
  const currentIndex = steps.findIndex((s) => s.id === currentId);

  if (cancelled) {
    return (
      <div className="rounded-[--radius-md] border border-line bg-cream/70 p-5 text-[14px] text-graphite">
        Cette commande a été annulée. Écrivez-nous sur WhatsApp si c'est une erreur.
      </div>
    );
  }

  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'grid size-8 shrink-0 place-items-center rounded-full border text-[12px] font-semibold transition-colors',
                  done && 'border-ink bg-ink text-ivory',
                  active && 'border-ink bg-blush text-ink',
                  !done && !active && 'border-line bg-white text-stone',
                )}
              >
                {done ? <Check className="size-4" /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span className={cn('w-px flex-1', done ? 'bg-ink/40' : 'bg-line')} aria-hidden />
              )}
            </div>
            <div className={cn('pb-6', index === steps.length - 1 && 'pb-0')}>
              <p
                className={cn(
                  'text-[15px] leading-tight',
                  active ? 'font-medium text-ink' : done ? 'text-graphite' : 'text-stone',
                )}
              >
                {step.label}
              </p>
              {(active || done) && <p className="mt-1 text-[12.5px] text-stone">{step.hint}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
