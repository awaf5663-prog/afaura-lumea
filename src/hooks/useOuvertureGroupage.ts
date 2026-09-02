import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings } from '@/src/hooks/useSettings';
import { groupingWindow, type GroupingWindow } from '@/src/lib/groupingWindow';
import type { Grouping } from '@/src/types';

export interface OuvertureGroupage {
  fenetre: GroupingWindow;
  /** Groupage affiché, s'il y en a un. */
  displayed: Grouping | null;
  /** Nombre de groupages enregistrés — sert à savoir si celui-ci est le premier. */
  total: number;
  /**
   * Le bandeau d'ouverture a-t-il quelque chose à annoncer ?
   *
   * Une seule réponse pour tout le site : le bandeau et la carte posée sur la
   * photo d'accueil racontent le même compte à rebours, et les afficher tous
   * les deux revient à répéter la même phrase à dix centimètres d'écart.
   */
  bandeau: boolean;
}

export function useOuvertureGroupage(): OuvertureGroupage {
  const { settings } = useSettings();
  const { groupings, displayed } = useGroupings();
  const fenetre = groupingWindow(displayed, settings);
  return {
    fenetre,
    displayed,
    total: groupings.length,
    bandeau: fenetre.phase === 'ouvert' || fenetre.phase === 'avant',
  };
}
