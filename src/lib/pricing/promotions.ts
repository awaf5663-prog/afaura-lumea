import type { Promotion } from '@/src/types';

/**
 * Le contexte d'une commande, tel que la couche de données le connaît au
 * moment d'enregistrer. Rien ici ne vient d'un calcul du navigateur : la
 * cliente déclare seulement être étudiante, tout le reste est établi par le
 * site (type de commande, groupage retenu, option de livraison, date).
 */
export interface PromotionContext {
  kind: 'shein' | 'store';
  isStudent: boolean;
  groupingId: string | null;
  deliveryOptionId: string;
  /** Date de la commande. Injectée pour rester testable. */
  now?: Date;
}

/** Une date de fin est incluse : l'offre court jusqu'au bout de la journée. */
function withinPeriod(promotion: Promotion, now: Date): boolean {
  const day = now.toISOString().slice(0, 10);
  if (promotion.startsAt && day < promotion.startsAt) return false;
  if (promotion.endsAt && day > promotion.endsAt) return false;
  return true;
}

/**
 * La promotion s'applique-t-elle ?
 *
 * Toutes les conditions renseignées doivent être remplies. Une liste vide ne
 * restreint rien : `groupingIds: []` veut dire « tous les groupages », pas
 * « aucun ».
 */
export function promotionApplies(promotion: Promotion, context: PromotionContext): boolean {
  if (!promotion.active) return false;
  if (promotion.scope !== 'all' && promotion.scope !== context.kind) return false;
  if (promotion.studentOnly && !context.isStudent) return false;
  if (!withinPeriod(promotion, context.now ?? new Date())) return false;
  if (promotion.groupingIds.length > 0) {
    if (!context.groupingId || !promotion.groupingIds.includes(context.groupingId)) return false;
  }
  if (promotion.deliveryOptionIds.length > 0) {
    if (!promotion.deliveryOptionIds.includes(context.deliveryOptionId)) return false;
  }
  return true;
}

/** Première promotion applicable, ou null. */
export function findPromotion(
  promotions: Promotion[],
  context: PromotionContext,
): Promotion | null {
  return promotions.find((promotion) => promotionApplies(promotion, context)) ?? null;
}

/**
 * Promotions qu'une cliente peut espérer, sans connaître encore son groupage
 * ni son option de livraison. Sert uniquement à décider ce qu'on affiche —
 * le bandeau d'annonce, la question « êtes-vous étudiante ? » — jamais à
 * calculer un montant.
 */
export function visiblePromotions(
  promotions: Promotion[],
  kind: 'shein' | 'store',
  now: Date = new Date(),
): Promotion[] {
  return promotions.filter(
    (promotion) =>
      promotion.active &&
      (promotion.scope === 'all' || promotion.scope === kind) &&
      withinPeriod(promotion, now),
  );
}
