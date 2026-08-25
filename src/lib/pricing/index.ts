import type { PricingConfig, ServiceFeeStrategyId } from '@/src/types';
import { itemTiersStrategy } from './strategies/itemTiers';
import { valuePercentStrategy } from './strategies/valuePercent';
import type { ServiceFeeStrategy } from './types';

/**
 * Registre des stratégies de calcul des frais de traitement.
 *
 * Pour en ajouter une (au poids, au volume, par catégorie de produit…) :
 *   1. créer un fichier dans strategies/ qui implémente ServiceFeeStrategy ;
 *   2. l'ajouter à ce tableau ;
 *   3. ajouter son identifiant à ServiceFeeStrategyId dans src/types.
 * Aucun composant, aucune page, aucune table n'est à modifier :
 * l'admin la voit apparaître dans la liste des stratégies disponibles.
 */
export const SERVICE_FEE_STRATEGIES: ServiceFeeStrategy[] = [
  itemTiersStrategy,
  valuePercentStrategy,
];

export function getStrategy(id: ServiceFeeStrategyId): ServiceFeeStrategy {
  return SERVICE_FEE_STRATEGIES.find((s) => s.id === id) ?? itemTiersStrategy;
}

export function describeStrategy(config: PricingConfig): string {
  return getStrategy(config.strategy).describe(config);
}

export type { ServiceFeeInput, ServiceFeeResult, ServiceFeeStrategy } from './types';
export { computeQuote, computeQuoteFromInput, convertToFcfa } from './quote';
