import { CalendarClock, CheckCircle2, Users } from 'lucide-react';
import { groupingCount, groupingFillRate } from '@/src/hooks/useGroupings';
import { cn } from '@/src/lib/cn';
import { formatDate } from '@/src/lib/format';
import type { Grouping } from '@/src/types';

/**
 * Bloc « prochain groupage » côté cliente.
 * N'affiche que ce qui la concerne : places, date, disponibilité.
 * Jamais les coûts, les marges ni le seuil de rentabilité.
 */
export function GroupingCapacity({
  grouping,
  compact,
}: {
  grouping: Grouping | null;
  compact?: boolean;
}) {
  if (!grouping) {
    return (
      <div className="rounded-[--radius-lg] border border-line bg-white p-5">
        <p className="eyebrow">Prochain groupage</p>
        <p className="mt-2 text-[14px] leading-relaxed text-graphite">
          Aucun départ n'est ouvert pour le moment. Envoyez votre demande : elle sera intégrée au
          prochain groupage et vous recevrez la date dès qu'elle est fixée.
        </p>
      </div>
    );
  }

  const count = groupingCount(grouping);
  const rate = groupingFillRate(grouping);
  const remaining = Math.max(0, grouping.maxOrders - count);
  const isFull = remaining === 0 || grouping.status === 'full';
  const segments = Math.min(grouping.maxOrders, 20);
  const filledSegments = Math.round((rate / 100) * segments);

  return (
    <div className="rounded-[--radius-lg] border border-line bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="eyebrow inline-flex items-center gap-1.5">
            <Users className="size-3.5" /> Prochain groupage
          </p>
          <p className="mt-2 font-display text-[26px] leading-none">
            {count} / {grouping.maxOrders}
            <span className="ml-2 font-sans text-[14px] text-stone">commandes</span>
          </p>
        </div>
        {grouping.destination && (
          <span className="rounded-full bg-cream px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] text-graphite">
            {grouping.destination}
          </span>
        )}
      </div>

      <div className="mt-4" role="img" aria-label={`Groupage rempli à ${rate} %`}>
        <div className="flex gap-[3px]">
          {Array.from({ length: segments }).map((_, index) => (
            <span
              key={index}
              className={cn(
                'h-2.5 flex-1 rounded-[2px] transition-colors duration-500',
                index < filledSegments ? (isFull ? 'bg-rosedark' : 'bg-mauve') : 'bg-sand',
              )}
            />
          ))}
        </div>
      </div>

      <p className="mt-3 text-[13.5px]">
        {isFull ? (
          <span className="inline-flex items-center gap-2 font-medium text-mauve">
            <CheckCircle2 className="size-4" /> Groupage complet
          </span>
        ) : (
          <span className="text-graphite">
            <span className="font-medium">
              {remaining} place{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
            </span>{' '}
            sur ce départ.
          </span>
        )}
      </p>

      {isFull && (
        <p className="mt-1.5 text-[12.5px] text-stone">
          Les nouvelles demandes sont enregistrées pour le départ suivant, dont la date vous est
          communiquée sur WhatsApp.
        </p>
      )}

      {!compact && grouping.closingDate && !isFull && (
        <p className="mt-3 inline-flex items-center gap-2 text-[12.5px] text-stone">
          <CalendarClock className="size-3.5" />
          Clôture des inscriptions le {formatDate(grouping.closingDate)}
        </p>
      )}

      {grouping.minOrders > 0 && count < grouping.minOrders && !isFull && (
        <p className="mt-3 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-graphite">
          Ce départ part à partir de {grouping.minOrders} commandes. En dessous, nous vous prévenons
          et votre demande bascule sur le groupage suivant — sans rien payer entre-temps.
        </p>
      )}
    </div>
  );
}
