import type { PricingConfig, Promotion, Quote, SheinItem } from '@/src/types';
import { getStrategy } from './index';
import { findPromotion, type PromotionContext } from './promotions';

/** Convertit un montant vers le FCFA. null si le taux n'est pas configuré. */
export function convertToFcfa(
  amount: number,
  currency: string,
  config: PricingConfig,
): number | null {
  const rate = config.conversionRates[currency];
  if (rate === null || rate === undefined) return null;
  return Math.round(amount * rate);
}

/**
 * Calcule l'estimation d'une demande SHEIN.
 *
 * Trois lignes distinctes, jamais mélangées :
 *   • le prix des articles, tel que la cliente l'a déclaré ;
 *   • les frais de traitement, qui sont NOTRE service ;
 *   • la livraison.
 *
 * Toute ligne inconnue laisse le total « partiel » : le site l'annonce comme
 * une estimation et n'invente jamais le montant manquant.
 *
 * Appelée par la couche de données au moment d'enregistrer la demande — jamais
 * à partir de montants envoyés par le navigateur, qui ne transmet que les prix
 * déclarés, les quantités et un éventuel code promo.
 */

/**
 * Applique l'offre éventuelle aux lignes du devis.
 *
 * Le tarif d'origine est conservé : la cliente voit « 2 000 FCFA → offerte »
 * plutôt qu'un zéro sans explication, et la boutique retrouve le vrai tarif si
 * l'offre est retirée. Une ligne dont le montant n'est pas encore fixé n'est
 * pas « offerte » : on ne peut pas offrir un montant qu'on ne connaît pas.
 */
function applyPromotion(
  lines: { deliveryFee: number | null; serviceFee: number | null; base: number },
  promotions: Promotion[],
  context: PromotionContext | undefined,
): {
  deliveryFee: number | null;
  deliveryBefore: number | null;
  serviceFee: number | null;
  discount: number;
  label: string | null;
} {
  const untouched = {
    deliveryFee: lines.deliveryFee,
    deliveryBefore: null,
    serviceFee: lines.serviceFee,
    discount: 0,
    label: null,
  };
  if (!context) return untouched;
  const promotion = findPromotion(promotions, context);
  if (!promotion) return untouched;

  switch (promotion.effect.type) {
    case 'free_delivery':
      if (lines.deliveryFee === null || lines.deliveryFee === 0) return untouched;
      return { ...untouched, deliveryFee: 0, deliveryBefore: lines.deliveryFee, label: promotion.label };
    case 'free_service_fee':
      if (lines.serviceFee === null || lines.serviceFee === 0) return untouched;
      return { ...untouched, serviceFee: 0, label: promotion.label };
    case 'discount_amount': {
      // Plafonnée au montant connu : une remise ne rend jamais d'argent.
      const discount = Math.min(Math.max(0, promotion.effect.amount), lines.base);
      if (discount === 0) return untouched;
      return { ...untouched, discount, label: promotion.label };
    }
  }
}

export function computeQuoteFromInput(
  input: { itemCount: number; declaredValue: number | null; deliveryOptionId: string },
  config: PricingConfig,
): Quote {
  const strategy = getStrategy(config.strategy);
  const service = strategy.compute(
    { itemCount: input.itemCount, declaredValue: input.declaredValue },
    config,
  );
  const option =
    config.deliveryOptions.find((o) => o.id === input.deliveryOptionId) ?? config.deliveryOptions[0];

  return {
    itemCount: input.itemCount,
    itemsSubtotal: input.declaredValue,
    unconvertedCurrencies: [],
    serviceFee: service.fee,
    serviceFeeReason: service.reason,
    deliveryOptionId: option?.id ?? '',
    deliveryLabel: option?.label ?? '',
    deliveryFee: option?.fee ?? null,
    total: (input.declaredValue ?? 0) + (service.fee ?? 0) + (option?.fee ?? 0),
    isPartial:
      input.declaredValue === null || service.fee === null || (option?.fee ?? null) === null,
    strategy: config.strategy,
    computedAt: new Date().toISOString(),
  };
}

export function computeQuote(
  items: SheinItem[],
  deliveryOptionId: string,
  config: PricingConfig,
  promotions: Promotion[] = [],
  context?: PromotionContext,
): Quote {
  const itemCount = items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0);

  let itemsSubtotal: number | null = 0;
  const unconverted = new Set<string>();

  items.forEach((item) => {
    if (item.priceAmount === null || item.priceAmount === undefined) {
      itemsSubtotal = null;
      return;
    }
    const converted = convertToFcfa(item.priceAmount, item.priceCurrency, config);
    if (converted === null) {
      unconverted.add(item.priceCurrency);
      itemsSubtotal = null;
      return;
    }
    if (itemsSubtotal !== null) itemsSubtotal += converted * Math.max(1, item.quantity);
  });

  const strategy = getStrategy(config.strategy);
  const service = strategy.compute(
    { itemCount, declaredValue: itemsSubtotal, totalWeightKg: null, totalVolumeL: null },
    config,
  );

  const option =
    config.deliveryOptions.find((o) => o.id === deliveryOptionId) ?? config.deliveryOptions[0];

  const base = (itemsSubtotal ?? 0) + (service.fee ?? 0) + (option?.fee ?? 0);
  const promo = applyPromotion(
    { deliveryFee: option?.fee ?? null, serviceFee: service.fee, base },
    promotions,
    // Le sous-total est calculé ici, pas reçu : une offre à montant minimum se
    // vérifie sur le prix des articles, jamais sur ce que la page affirme.
    context ? { ...context, subtotal: itemsSubtotal } : undefined,
  );

  const total =
    (itemsSubtotal ?? 0) + (promo.serviceFee ?? 0) + (promo.deliveryFee ?? 0) - promo.discount;

  return {
    itemCount,
    itemsSubtotal,
    unconvertedCurrencies: [...unconverted],
    serviceFee: promo.serviceFee,
    serviceFeeReason: service.reason,
    deliveryOptionId: option?.id ?? '',
    deliveryLabel: option?.label ?? '',
    deliveryFee: promo.deliveryFee,
    deliveryFeeBeforePromotion: promo.deliveryBefore,
    discount: promo.discount,
    promotionLabel: promo.label,
    total,
    isPartial: itemsSubtotal === null || service.fee === null || promo.deliveryFee === null,
    strategy: config.strategy,
    computedAt: new Date().toISOString(),
  };
}
