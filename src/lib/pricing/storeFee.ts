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
 * jusqu'ici. Deux cas y échappent, pour la même raison de fond — le travail
 * n'a pas lieu :
 *
 *   • l'article est DÉJÀ EN BOUTIQUE (`readyToShip`). Il est là, on le
 *     remet, et la livraison se convient de vive voix ;
 *   • son RAYON est dispensé de frais (`categoriesExemptes`). La boutique
 *     achète ses voiles et ses glosses par lots, pour elle : la cliente ne
 *     déclenche aucune commande en les choisissant.
 *
 * Un panier qui n'en contient que de ceux-là n'a donc aucun frais. Un panier
 * mêlé ne paie que pour ce qui doit être commandé.
 *
 * L'état vient du catalogue et non du panier : une fiche qui passe en
 * boutique — ou qui change de rayon — vaut aussitôt pour les paniers déjà
 * remplis, sans qu'il faille les vider. Un article introuvable au catalogue
 * est compté : mieux vaut facturer un article disparu que d'offrir un
 * travail réel.
 *
 * ⚠️ Ce calcul sert à ANNONCER le montant. Celui qui est facturé est
 * recalculé par la base, à partir des mêmes réglages et du même catalogue
 * (voir create_order dans supabase/schema.sql). Le navigateur ne décide
 * jamais qu'un article est exempté.
 */
export function nombreArticlesFactures(
  items: Array<{ productId: string; quantity: number }>,
  catalogue: Array<{ id: string; category?: string; readyToShip?: boolean }>,
  categoriesExemptes: string[] = [],
): number {
  const exemptes = new Set(categoriesExemptes);
  const dispenses = new Set(
    catalogue
      .filter((p) => p.readyToShip || (p.category !== undefined && exemptes.has(p.category)))
      .map((p) => p.id),
  );
  return items.reduce(
    (somme, item) => somme + (dispenses.has(item.productId) ? 0 : Math.max(1, item.quantity)),
    0,
  );
}

/**
 * Rayons du panier qui échappent aux frais, pour le dire à la cliente.
 *
 * Une ligne de frais qui disparaît est muette : la cliente ne sait pas
 * qu'elle y a gagné quelque chose. Cette liste sert à l'écrire — « aucun
 * frais sur les voiles » — à partir de ce que le panier contient vraiment.
 *
 * Elle ne nomme QUE les rayons dispensés par les réglages. Un article
 * « déjà en boutique » ne paie pas non plus, mais c'est une propriété de
 * la fiche, pas du rayon : l'annoncer comme un rayon entier serait faux
 * pour les autres articles du même rayon.
 */
export function rayonsSansFrais(
  items: Array<{ productId: string }>,
  catalogue: Array<{ id: string; category?: string }>,
  categoriesExemptes: string[],
): string[] {
  const exemptes = new Set(categoriesExemptes);
  const parId = new Map(catalogue.map((p) => [p.id, p.category]));
  const presents = new Set<string>();
  for (const item of items) {
    const rayon = parId.get(item.productId);
    if (rayon !== undefined && exemptes.has(rayon)) presents.add(rayon);
  }
  return [...presents];
}
