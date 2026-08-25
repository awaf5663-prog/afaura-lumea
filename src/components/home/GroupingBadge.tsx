import { CalendarClock } from 'lucide-react';
import { useCountdown } from '@/src/hooks/useCountdown';
import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDate } from '@/src/lib/format';

/** Carte compacte « prochain groupage ». N'affiche rien tant qu'aucune date n'est configurée. */
export function GroupingBadge() {
  const { settings } = useSettings();
  const { displayed } = useGroupings();
  // Le groupage fait autorité ; la date des réglages sert de repli.
  const target = displayed?.closingDate || settings?.nextGroupingDate || '';
  const countdown = useCountdown(target);

  if (!countdown.configured) {
    return (
      <div className="rounded-[--radius-lg] border border-line bg-white/95 p-4 shadow-lg shadow-black/5 backdrop-blur">
        <p className="eyebrow">Groupage SHEIN</p>
        <p className="mt-2 text-[13.5px] leading-snug text-graphite">
          La date du prochain départ est annoncée sur WhatsApp dès qu'elle est fixée.
        </p>
      </div>
    );
  }

  if (countdown.isPast) {
    return (
      <div className="rounded-[--radius-lg] border border-line bg-white/95 p-4 shadow-lg shadow-black/5 backdrop-blur">
        <p className="eyebrow">Groupage SHEIN</p>
        <p className="mt-2 text-[13.5px] leading-snug text-graphite">
          Le groupage du {formatDate(target)} est clôturé. Les demandes reçues maintenant partent avec
          le suivant.
        </p>
      </div>
    );
  }

  const cells = [
    { value: countdown.days, label: countdown.days > 1 ? 'jours' : 'jour' },
    { value: countdown.hours, label: 'heures' },
    { value: countdown.minutes, label: 'min' },
  ];

  return (
    <div className="rounded-[--radius-lg] border border-line bg-white/95 p-4 shadow-lg shadow-black/5 backdrop-blur">
      <p className="eyebrow inline-flex items-center gap-1.5">
        <CalendarClock className="size-3.5" /> Prochain groupage
      </p>
      <div className="mt-2.5 flex items-end gap-3">
        {cells.map((cell) => (
          <div key={cell.label}>
            <span className="font-display text-[26px] leading-none tabular-nums">
              {String(cell.value).padStart(2, '0')}
            </span>
            <span className="ml-1 text-[11px] text-stone">{cell.label}</span>
          </div>
        ))}
      </div>
      <p className="mt-2 text-[11.5px] text-stone">Clôture le {formatDate(target)}</p>
    </div>
  );
}
