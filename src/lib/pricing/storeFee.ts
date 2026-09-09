import type { ServiceFeeTier } from '@/src/types';

/**
 * Frais de traitement d'une commande de la boutique.
 *
 * La grille est CELLE DÉJÀ RÉGLÉE dans Administration → Tarification
 * (`PricingConfig.tiers`) : une seule grille pour la boutique et pour SHEIN,
 * jamais deux à tenir à jour.
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

/**
 * Nombre d'articles qui déclenchent des frais de traitement.
 *
 * Les frais paient un travail : commander la pièce, la regrouper, la suivre
 * jusqu'ici. Un article déjà en boutique n'a rien de tout cela — il est là, on
 * le remet, et la livraison se convient de vive voix. Le facturer reviendrait
 * à faire payer un travail qui n'a pas lieu.
 *
 * Un panier qui ne contient que des articles en boutique n'a donc aucun frais.
 * Un panier mêlé ne paie que pour ce qui doit être commandé.
 *
 * L'état vient du catalogue et non du panier : une fiche qui passe en boutique
 * — ou qui en sort — vaut aussitôt pour les paniers déjà remplis, sans qu'il
 * faille les vider. Un article introuvable au catalogue est compté : mieux
 * vaut facturer un article disparu que d'offrir un travail réel.
 */
export function nombreArticlesFactures(
  items: Array<{ productId: string; quantity: number }>,
  catalogue: Array<{ id: string; readyToShip?: boolean }>,
): number {
  const enBoutique = new Set(catalogue.filter((p) => p.readyToShip).map((p) => p.id));
  return items.reduce(
    (somme, item) => somme + (enBoutique.has(item.productId) ? 0 : Math.max(1, item.quantity)),
    0,
  );
}
