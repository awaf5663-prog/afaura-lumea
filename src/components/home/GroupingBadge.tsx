import { CalendarClock } from 'lucide-react';
import { useCountdown } from '@/src/hooks/useCountdown';
import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDate } from '@/src/lib/format';
import { groupingWindow } from '@/src/lib/groupingWindow';

/** Carte compacte « prochain groupage ». N'affiche rien tant qu'aucune date n'est configurée. */
export function GroupingBadge() {
  const { settings } = useSettings();
  const { displayed } = useGroupings();
  // Le groupage fait autorité ; les réglages servent de repli. Voir
  // lib/groupingWindow : c'est la même lecture partout sur le site.
  const fenetre = groupingWindow(displayed, settings);
  const countdown = useCountdown(fenetre.target);
  const avant = fenetre.phase === 'avant';

  const Carte = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-[--radius-lg] border border-line bg-white/95 p-4 shadow-lg shadow-black/5 backdrop-blur">
      <p className="eyebrow">Groupage SHEIN</p>
      <p className="mt-2 text-[13.5px] leading-snug text-graphite">{children}</p>
    </div>
  );

  if (fenetre.phase === 'aucune') {
    return <Carte>La date du prochain départ est annoncée sur WhatsApp dès qu'elle est fixée.</Carte>;
  }

  if (fenetre.phase === 'termine') {
    return (
      <Carte>
        Le groupage du {formatDate(fenetre.end)} est clôturé. Les demandes reçues maintenant partent
        avec le suivant.
      </Carte>
    );
  }

  // Inscriptions ouvertes, mais sans date de clôture arrêtée : rien à compter,
  // et on le dit tel quel plutôt que de faire disparaître le groupage.
  if (!countdown.configured || countdown.isPast) {
    return (
      <Carte>
        Inscriptions ouvertes{fenetre.start ? ` depuis le ${formatDate(fenetre.start)}` : ''}. La
        date de clôture est annoncée sur WhatsApp dès qu'elle est fixée.
      </Carte>
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
        <CalendarClock className="size-3.5" />
        {avant ? 'Ouverture des inscriptions' : 'Prochain groupage'}
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
      <p className="mt-2 text-[11.5px] text-stone">
        {avant ? (
          <>
            Ouverture le {formatDate(fenetre.start)}
            {fenetre.end ? ` · clôture le ${formatDate(fenetre.end)}` : ''}
          </>
        ) : (
          <>Clôture le {formatDate(fenetre.end)}</>
        )}
      </p>
    </div>
  );
}
