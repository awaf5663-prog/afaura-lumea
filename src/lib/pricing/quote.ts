import type { PricingConfig, Quote, SheinItem } from '@/src/types';
import { getStrategy } from './index';

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
 * Toute ligne inconnue laisse le total « partiel » : le site l'annonce
 * comme une estimation et n'invente jamais le montant manquant.
 *
 * Cette fonction est appelée par la couche de données au moment
 * d'enregistrer la demande — jamais à partir de montants envoyés par le
 * navigateur, qui ne transmet que les prix déclarés et les quantités.
 */
/**
 * Variante utilisée par le simulateur de l'admin : on part de valeurs
 * agrégées plutôt que d'une liste d'articles réelle.
 */
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

  const total =
    (itemsSubtotal ?? 0) + (service.fee ?? 0) + (option?.fee ?? 0);

  return {
    itemCount,
    itemsSubtotal,
    unconvertedCurrencies: [...unconverted],
    serviceFee: service.fee,
    serviceFeeReason: service.reason,
    deliveryOptionId: option?.id ?? '',
    deliveryLabel: option?.label ?? '',
    deliveryFee: option?.fee ?? null,
    total,
    isPartial: itemsSubtotal === null || service.fee === null || (option?.fee ?? null) === null,
    strategy: config.strategy,
    computedAt: new Date().toISOString(),
  };
}
