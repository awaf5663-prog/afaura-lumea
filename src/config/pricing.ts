import type { AlertThresholds, PricingConfig, Promotion } from '@/src/types';

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

  /**
   * Frais de traitement par tranche de nombre d'articles. UNE SEULE grille,
   * pour les demandes SHEIN comme pour les commandes de la boutique : c'est
   * le même travail de préparation.
   */
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

/**
 * Offres livrées avec le site.
 *
 * Les dates sont vides : aucune période n'est inventée ici. L'offre court
 * jusqu'à ce que la boutique fixe une date de fin dans /admin → Tarification,
 * ou la désactive. Les groupages concernés se cochent au même endroit, une
 * fois qu'ils existent — vide signifie « tous les groupages ».
 */
export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'rentree-etudiantes',
    label: 'Offre rentrée',
    description:
      'Commande SHEIN étudiante : la livraison à Saint-Louis est offerte pendant la durée de l’offre.',
    active: true,
    scope: 'shein',
    // Code à communiquer sur Instagram et WhatsApp. Vide = offre automatique.
    code: 'RENTREE',
    studentOnly: true,
    startsAt: null,
    endsAt: null,
    minSubtotal: null,
    groupingIds: [],
    deliveryOptionIds: ['local'],
    effect: { type: 'free_delivery' },
  },
];
