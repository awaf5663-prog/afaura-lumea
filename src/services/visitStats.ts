import type { VisitStats } from './types';

/** Une page vue telle qu'elle est conservée en mode local. */
export interface VisitEntry {
  visitor: string;
  path: string;
  at: string;
}

/** Jour au format AAAA-MM-JJ. Le Sénégal est à l'heure UTC : les journées
 *  découpées ici tombent exactement comme celles calculées par Postgres. */
function jour(iso: string | Date): string {
  return new Date(iso).toISOString().slice(0, 10);
}

function reculer(depuis: Date, jours: number): Date {
  const d = new Date(depuis);
  d.setUTCDate(d.getUTCDate() - jours);
  return d;
}

function periode(entries: VisitEntry[], depuis: string | null) {
  const retenues = depuis ? entries.filter((e) => e.at >= depuis) : entries;
  return {
    visites: retenues.length,
    visiteurs: new Set(retenues.map((e) => e.visitor)).size,
  };
}

/**
 * Même découpage que la fonction `stats_visites()` de Supabase, pour que le
 * mode local et le mode connecté racontent la même chose.
 */
export function aggregateVisits(entries: VisitEntry[], now = new Date()): VisitStats {
  const aujourdhui = jour(now);
  const debut = (jours: number) => `${jour(reculer(now, jours))}T00:00:00.000Z`;

  const trenteJours = entries.filter((e) => e.at >= debut(29));

  const parJour: VisitStats['parJour'] = [];
  for (let i = 29; i >= 0; i -= 1) {
    const date = jour(reculer(now, i));
    const duJour = trenteJours.filter((e) => e.at.slice(0, 10) === date);
    parJour.push({
      date,
      visites: duJour.length,
      visiteurs: new Set(duJour.map((e) => e.visitor)).size,
    });
  }

  const compteur = new Map<string, number>();
  trenteJours.forEach((e) => compteur.set(e.path, (compteur.get(e.path) ?? 0) + 1));
  const pages = [...compteur.entries()]
    .map(([path, visites]) => ({ path, visites }))
    .sort((a, b) => b.visites - a.visites)
    .slice(0, 8);

  return {
    jour: periode(entries, `${aujourdhui}T00:00:00.000Z`),
    semaine: periode(entries, debut(6)),
    mois: periode(entries, debut(29)),
    annee: periode(entries, debut(364)),
    total: periode(entries, null),
    parJour,
    pages,
  };
}
