import { readJson, writeJson } from '@/src/lib/storage';

/**
 * Repère « déjà vu » de l'administration.
 *
 * Ce que ça résout : une commande arrive, elle s'enregistre, et rien ne la
 * distingue des anciennes dans la liste. La boutique doit relire la date de
 * chaque ligne pour savoir ce qui est nouveau depuis sa dernière visite.
 *
 * La date de dernière visite vit dans le navigateur de la boutique — c'est un
 * confort d'affichage, pas une donnée de la boutique : rien ne justifie de
 * l'envoyer en base, et un téléphone qui l'oublie ne perd aucune commande.
 */

export type SeenKind = 'commandes' | 'shein';

const KEY = 'lumea.admin.vu.v1';

type Marques = Partial<Record<SeenKind, string>>;

export function lastSeen(kind: SeenKind): string {
  return readJson<Marques>(KEY, {})[kind] ?? '';
}

export function markSeen(kind: SeenKind, at: string = new Date().toISOString()): void {
  writeJson(KEY, { ...readJson<Marques>(KEY, {}), [kind]: at });
}

/** Nombre d'éléments arrivés après la dernière visite. */
export function countSince<T extends { createdAt: string }>(items: T[], since: string): number {
  if (!since) return 0;
  return items.filter((item) => item.createdAt > since).length;
}
