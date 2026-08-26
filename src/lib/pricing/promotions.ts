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
  /** Code saisi par la cliente. Vide = aucun. */
  code?: string;
  /** Date de la commande. Injectée pour rester testable. */
  now?: Date;
}

/** Les codes se comparent sans casse ni espaces : « rentree25 » = « RENTREE25 ». */
export function normalizeCode(code: string | undefined | null): string {
  return (code ?? '').trim().toUpperCase();
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
  // Une offre à code ne s'applique jamais toute seule, même si tout le reste
  // est rempli : c'est la cliente qui la déclenche.
  if (normalizeCode(promotion.code) !== normalizeCode(context.code)) return false;
  return true;
}

/** Décrit l'effet en une ligne, pour l'admin comme pour la cliente. */
export function describeEffect(effect: Promotion['effect']): string {
  switch (effect.type) {
    case 'free_delivery':
      return 'Livraison offerte';
    case 'free_service_fee':
      return 'Frais de traitement offerts';
    case 'discount_amount':
      return `Remise de ${effect.amount.toLocaleString('fr-FR')} FCFA`;
  }
}

/**
 * Pourquoi un code ne passe pas.
 *
 * Renvoie null quand tout va bien. Sert à répondre à la cliente autre chose
 * que « code invalide » quand le code existe mais que la commande ne remplit
 * pas les conditions — c'est la différence entre une cliente qui corrige et
 * une cliente qui abandonne.
 */
export function explainCode(
  promotions: Promotion[],
  context: PromotionContext,
): { promotion: Promotion } | { reason: string } | null {
  const typed = normalizeCode(context.code);
  if (!typed) return null;

  const match = promotions.find((p) => normalizeCode(p.code) === typed);
  if (!match) return { reason: "Ce code n'existe pas." };
  if (promotionApplies(match, context)) return { promotion: match };

  const now = context.now ?? new Date();
  if (!match.active) return { reason: "Cette offre n'est plus active." };
  if (!withinPeriod(match, now)) return { reason: "Cette offre n'est pas en cours." };
  if (match.scope !== 'all' && match.scope !== context.kind) {
    return {
      reason:
        match.scope === 'shein'
          ? 'Ce code est réservé aux commandes SHEIN.'
          : 'Ce code est réservé aux commandes de la boutique.',
    };
  }
  if (match.studentOnly && !context.isStudent) {
    return { reason: 'Ce code est réservé aux étudiantes : cochez la case ci-dessus.' };
  }
  if (
    match.deliveryOptionIds.length > 0 &&
    !match.deliveryOptionIds.includes(context.deliveryOptionId)
  ) {
    return { reason: "Ce code ne s'applique pas au mode de livraison choisi." };
  }
  return { reason: "Ce code ne s'applique pas à cette commande." };
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
