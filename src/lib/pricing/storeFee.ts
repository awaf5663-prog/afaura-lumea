import type { ServiceFeeTier } from '@/src/types';

/**
 * Frais de traitement d'une commande de la boutique.
 *
 * Même grille que le devis SHEIN, appliquée aux commandes de la boutique :
 * au-delà d'un certain nombre d'articles, préparer et acheminer la commande
 * demande un travail que le prix des articles ne couvre pas.
 *
 * Cette fonction reproduit exactement `frais_boutique` en SQL. Elle sert à
 * ANNONCER le montant à la cliente ; celui qui est facturé est recalculé par
 * la base au moment d'enregistrer, à partir de la même grille. Si les deux
 * venaient à diverger, c'est la base qui a raison.
 *
 * Une tranche à `fee: null` — « devis manuel » côté SHEIN — ne facture rien
 * ici : la boutique n'a pas d'occasion de confirmer un montant avant que la
 * commande ne parte, contrairement à une demande SHEIN.
 */
export function fraisBoutique(nombreArticles: number, tiers: ServiceFeeTier[]): number {
  if (nombreArticles <= 0) return 0;
  const tranche = tiers.find(
    (t) =>
      nombreArticles >= t.minItems && (t.maxItems === null || nombreArticles <= t.maxItems),
  );
  const frais = tranche?.fee;
  return typeof frais === 'number' && Number.isFinite(frais) && frais > 0 ? Math.round(frais) : 0;
}

/** Nombre d'articles d'un panier : les unités, pas les lignes. */
export function nombreArticles(items: Array<{ quantity: number }>): number {
  return items.reduce((somme, item) => somme + Math.max(1, item.quantity), 0);
}
