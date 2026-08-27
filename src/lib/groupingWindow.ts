import type { Grouping, StoreSettings } from '@/src/types';

/**
 * Fenêtre d'inscription d'un groupage : du jour où on peut envoyer sa demande
 * au jour où c'est trop tard.
 *
 * Une seule fonction pour tout le site : l'accueil, le bloc groupage et la
 * page SHEIN racontaient sinon trois histoires légèrement différentes.
 */
export type GroupingPhase =
  /** Aucune date arrêtée : on ne promet rien. */
  | 'aucune'
  /** L'ouverture est encore devant nous. */
  | 'avant'
  /** Les inscriptions sont prises. */
  | 'ouvert'
  /** La clôture est passée. */
  | 'termine';

export interface GroupingWindow {
  /** Ouverture des inscriptions (ISO). '' = non fixée. */
  start: string;
  /** Clôture des inscriptions (ISO). '' = non fixée. */
  end: string;
  phase: GroupingPhase;
  /** Date vers laquelle compter : l'ouverture avant, la clôture pendant. */
  target: string;
}

export function groupingWindow(
  grouping: Grouping | null | undefined,
  settings: StoreSettings | null | undefined,
  now: number = Date.now(),
): GroupingWindow {
  /*
   * Le groupage fait autorité, et il fait autorité en entier : mélanger sa
   * date d'ouverture avec la date de repli des réglages afficherait une
   * fenêtre qui n'existe nulle part. Les réglages ne servent que lorsqu'aucun
   * groupage n'est affiché.
   */
  const start = grouping ? grouping.openingDate : (settings?.nextGroupingOpening ?? '');
  const end = grouping ? grouping.closingDate : (settings?.nextGroupingDate ?? '');

  const instant = (iso: string): number | null => {
    if (!iso) return null;
    const t = new Date(iso).getTime();
    return Number.isNaN(t) ? null : t;
  };

  const debut = instant(start);
  const fin = instant(end);

  if (debut === null && fin === null) return { start: '', end: '', phase: 'aucune', target: '' };
  if (fin !== null && now >= fin) return { start, end, phase: 'termine', target: end };
  if (debut !== null && now < debut) return { start, end, phase: 'avant', target: start };
  return { start, end, phase: 'ouvert', target: end };
}
