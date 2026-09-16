import type { CartItem, Product, Promotion, PromotionQuantityTier } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  LE PACK : PLUS ON EN PREND, MOINS ON PAIE
 * ─────────────────────────────────────────────────────────────
 *  « 3 voiles −5 %, 4 à 5 −6 %, 6 et plus −7 % ». La remise grandit avec la
 *  quantité, et ne porte que sur les rayons annoncés : un sac glissé dans un
 *  panier de voiles ne fait ni monter le palier ni baisser son propre prix.
 *
 *  Ce fichier ANNONCE le montant. Celui qui est facturé est recalculé par la
 *  base au moment d'enregistrer (voir create_order dans supabase/schema.sql),
 *  à partir des mêmes paliers et du même catalogue. Si les deux venaient à
 *  diverger, c'est la base qui a raison — le navigateur ne décide jamais
 *  d'une remise.
 */

/** Ce que le panier apporte à une offre par quantité. */
export interface AssietteDuPack {
  /** Unités concernées par l'offre : c'est ce qui décide du palier. */
  quantite: number;
  /** Prix de ces unités, en FCFA : c'est sur lui que porte le pourcentage. */
  montant: number;
}

/**
 * Le palier atteint, ou null.
 *
 * Le PLUS ÉLEVÉ dont le seuil est atteint, et non le premier trouvé : une
 * cliente qui dépasse le dernier palier garde son pourcentage. Sans cette
 * règle, passer de dix à onze voiles ferait monter la facture — un client
 * qui achète plus ne doit jamais payer plus.
 */
export function palierAtteint(
  tiers: PromotionQuantityTier[],
  quantite: number,
): PromotionQuantityTier | null {
  let retenu: PromotionQuantityTier | null = null;
  for (const palier of tiers) {
    if (palier.minQuantity > quantite) continue;
    if (palier.percent <= 0) continue;
    if (retenu === null || palier.minQuantity > retenu.minQuantity) retenu = palier;
  }
  return retenu;
}

/**
 * Ce que le panier apporte à l'offre : les unités des rayons concernés, et
 * leur prix.
 *
 * Le rayon vient du CATALOGUE, jamais du panier : une fiche qui change de
 * rayon vaut aussitôt pour les paniers déjà remplis. Un article absent du
 * catalogue ne compte pas — mieux vaut rater une remise que l'accorder sur
 * un article dont on ne sait plus rien.
 *
 * `categories` vide veut dire « tout le panier » : une offre sans rayon
 * annoncé ne restreint rien, comme partout ailleurs dans les promotions.
 */
export function assiette(
  items: Array<Pick<CartItem, 'productId' | 'quantity' | 'unitPrice'>>,
  catalogue: Array<Pick<Product, 'id' | 'category'>>,
  categories: string[],
): AssietteDuPack {
  const rayons = new Set(categories);
  const parId = new Map(catalogue.map((p) => [p.id, p.category]));
  let quantite = 0;
  let montant = 0;
  for (const item of items) {
    const rayon = parId.get(item.productId);
    if (rayons.size > 0) {
      if (rayon === undefined || !rayons.has(rayon)) continue;
    }
    const unites = Math.max(1, item.quantity);
    quantite += unites;
    montant += item.unitPrice * unites;
  }
  return { quantite, montant };
}

/** La remise en FCFA, arrondie à l'entier. 0 = aucun palier atteint. */
export function remiseDuPack(
  promotion: Promotion,
  items: Array<Pick<CartItem, 'productId' | 'quantity' | 'unitPrice'>>,
  catalogue: Array<Pick<Product, 'id' | 'category'>>,
): number {
  if (promotion.effect.type !== 'percent_by_quantity') return 0;
  const { quantite, montant } = assiette(items, catalogue, promotion.effect.categories);
  const palier = palierAtteint(promotion.effect.tiers, quantite);
  if (palier === null || montant <= 0) return 0;
  // Arrondi à l'entier : le franc CFA n'a pas de centimes, et un montant
  // à virgule sur une facture ferait douter du reste.
  return Math.round((montant * palier.percent) / 100);
}

/**
 * « Encore 1 voile pour −6 % » — ce qu'il manque pour le palier suivant.
 *
 * Renvoie null quand il n'y a plus rien à gagner : aucun palier au-dessus,
 * ou panier sans aucun article concerné. On ne relance pas une cliente qui
 * a déjà le meilleur taux, et on ne parle pas d'une offre à qui n'a pas
 * commencé à la remplir.
 */
export function prochainPalier(
  promotion: Promotion,
  items: Array<Pick<CartItem, 'productId' | 'quantity' | 'unitPrice'>>,
  catalogue: Array<Pick<Product, 'id' | 'category'>>,
): { manque: number; percent: number } | null {
  if (promotion.effect.type !== 'percent_by_quantity') return null;
  const { quantite } = assiette(items, catalogue, promotion.effect.categories);
  if (quantite === 0) return null;
  const actuel = palierAtteint(promotion.effect.tiers, quantite);
  const suivants = promotion.effect.tiers
    .filter((p) => p.minQuantity > quantite && p.percent > (actuel?.percent ?? 0))
    .sort((a, b) => a.minQuantity - b.minQuantity);
  const suivant = suivants[0];
  return suivant ? { manque: suivant.minQuantity - quantite, percent: suivant.percent } : null;
}

/**
 * L'offre par quantité qu'on peut annoncer DÈS LE PANIER, ou null.
 *
 * Le panier ne connaît ni le mode de livraison, ni le groupage, ni le code
 * que la cliente saisira à l'étape suivante. Une offre qui dépend de l'un de
 * ces éléments ne peut donc pas être promise ici : l'annoncer puis la retirer
 * à la validation vaut moins que de se taire.
 *
 * On ne retient que les offres qui s'appliquent d'elles-mêmes : actives, dans
 * leur période, sur la boutique, sans code, sans condition d'étudiante, sans
 * restriction de livraison ni de groupage, et dont le montant minimum est
 * atteint.
 */
export function offreDuPanier(
  promotions: Promotion[],
  sousTotal: number,
  maintenant: Date = new Date(),
): Promotion | null {
  const jour = maintenant.toISOString().slice(0, 10);
  return (
    promotions.find((offre) => {
      if (offre.effect.type !== 'percent_by_quantity') return false;
      if (!offre.active) return false;
      if (offre.scope !== 'all' && offre.scope !== 'store') return false;
      if (offre.startsAt && jour < offre.startsAt) return false;
      if (offre.endsAt && jour > offre.endsAt) return false;
      if (offre.code.trim() !== '') return false;
      if (offre.studentOnly) return false;
      if (offre.deliveryOptionIds.length > 0) return false;
      if (offre.groupingIds.length > 0) return false;
      if (typeof offre.minSubtotal === 'number' && offre.minSubtotal > 0) {
        if (sousTotal < offre.minSubtotal) return false;
      }
      return true;
    }) ?? null
  );
}
