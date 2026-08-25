import type { AlertThresholds, PricingConfig } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  TARIFICATION DU SERVICE SHEIN — valeurs de départ
 * ─────────────────────────────────────────────────────────────
 *  Ce fichier ne sert qu'à initialiser la boutique la première fois.
 *  Ensuite, TOUT se modifie depuis /admin → Tarification, sans toucher
 *  au code : tranches, montants, livraison, taux de change, seuils.
 *
 *  Aucun de ces montants n'est un tarif officiel : ce sont des frais de
 *  service (traitement, regroupement, organisation logistique, suivi),
 *  distincts du prix des articles facturés par SHEIN.
 */

export const DEFAULT_PRICING: PricingConfig = {
  strategy: 'item_tiers',

  /** Frais de traitement par tranche de nombre d'articles. */
  tiers: [
    { id: 't1', minItems: 1, maxItems: 3, fee: 2000 },
    { id: 't2', minItems: 4, maxItems: 6, fee: 2500 },
    { id: 't3', minItems: 7, maxItems: 10, fee: 3000 },
    // Au-delà de 10 articles : aucun montant annoncé automatiquement.
    { id: 't4', minItems: 11, maxItems: null, fee: null },
  ],

  /** Stratégie alternative : pourcentage de la valeur déclarée des articles. */
  valuePercent: { percent: 12, minFee: 2000, maxFee: null },

  /** Livraison propre au service SHEIN (destination du groupage). */
  deliveryOptions: [
    {
      id: 'pickup',
      label: 'Retrait en main propre',
      hint: 'Point de remise communiqué sur WhatsApp.',
      fee: 0,
      type: 'pickup',
    },
    {
      id: 'local',
      label: 'Livraison locale',
      hint: 'Dans la ville de destination du groupage.',
      fee: null,
      type: 'delivery',
    },
    {
      id: 'home',
      label: 'Livraison à domicile',
      hint: 'Adresse précise, hors ville de destination.',
      fee: null,
      type: 'delivery',
    },
  ],

  /**
   * Conversion vers le FCFA.
   * L'euro a une parité fixe avec le franc CFA (1 € = 655,957 FCFA) : ce taux
   * n'est pas une estimation. Les autres devises flottent, donc leur taux
   * reste vide tant qu'il n'est pas saisi — le site affiche alors « à confirmer »
   * plutôt qu'un montant inventé.
   */
  conversionRates: {
    XOF: 1,
    EUR: 655.957,
    USD: null,
  },

  defaultCurrency: 'EUR',
};

/** Valeurs de départ d'un nouveau groupage, modifiables à la création. */
export const DEFAULT_GROUPING = {
  destination: 'Saint-Louis',
  maxOrders: 15,
  minOrders: 10,
  logisticsCost: 17000 as number | null,
};

export const DEFAULT_ALERT_THRESHOLDS: AlertThresholds = {
  warning: 50,
  almostFull: 80,
};
