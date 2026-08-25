import type { PricingConfig, ServiceFeeStrategyId } from '@/src/types';

/**
 * Entrée du calcul des frais de traitement.
 *
 * Les champs poids / volume / valeur / catégories sont déjà présents alors que
 * la stratégie par défaut ne s'en sert pas : c'est ce qui permet de brancher
 * une tarification au poids ou au volume plus tard sans toucher aux
 * formulaires, aux pages, ni à la couche de données.
 */
export interface ServiceFeeInput {
  itemCount: number;
  /** Valeur déclarée des articles, convertie en FCFA. null si inconnue. */
  declaredValue: number | null;
  totalWeightKg?: number | null;
  totalVolumeL?: number | null;
  categories?: string[];
}

export interface ServiceFeeResult {
  /** null = aucun montant annoncé : la demande passe en devis manuel. */
  fee: number | null;
  /** Phrase courte affichée à la cliente pour expliquer le montant. */
  reason: string;
  requiresManualQuote: boolean;
}

export interface ServiceFeeStrategy {
  id: ServiceFeeStrategyId;
  label: string;
  /** Description affichée dans l'admin, construite à partir des réglages. */
  describe: (config: PricingConfig) => string;
  compute: (input: ServiceFeeInput, config: PricingConfig) => ServiceFeeResult;
}
