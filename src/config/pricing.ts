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
    { id: 't1', minItems: 1, maxItems: 10, fee: 2000 },
    { id: 't2', minItems: 11, maxItems: 20, fee: 2500 },
    { id: 't3', minItems: 21, maxItems: null, fee: 3000 },
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
    /*
     * Taux du dollar fixé par la boutique, et non relevé sur un marché : il
     * couvre aussi les frais de transfert, que le cours brut ignore. Il se
     * change depuis Administration → Tarification le jour où elle le décide.
     */
    USD: 550,
  },

  defaultCurrency: 'EUR',

  /**
   * Rayons dispensés de frais de traitement en boutique.
   *
   * Les voiles et les glosses sont achetés par lots, pour la boutique, et
   * gardés sur place : choisir un voile ne déclenche aucune commande, donc
   * aucun travail à facturer. Les autres rayons — et TOUTES les demandes
   * SHEIN — restent soumis à la grille.
   *
   * Cette liste se modifie depuis Administration → Tarification. Elle est
   * donnée par rayon et non par famille : une famille est un regroupement
   * d'affichage, elle peut être remaniée sans qu'on y pense, et les frais
   * suivraient alors en silence.
   */
  feeExemptCategories: [
    // Voiles
    'voile_viscose',
    'voile_mj',
    'modal_imprime',
    'modal_simple',
    'satin_imprime',
    'dentelle',
    'jersey',
    'jersey_frise',
    'hijab_tape',
    'voile_rayures',
    'modal_fulani',
    'modal_nayra',
    'silk_imprime',
    'organza_degrade',
    'voile_imprime',
    // Glosses et huiles à lèvres
    'lips',
  ],
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
 * Offres livrées avec le site : AUCUNE.
 *
 * Le « Pack Afaura » et l'« Offre rentrée » ont été retirés en septembre 2026,
 * la boutique les ayant déclarés terminés. Rien ne les remplace d'office : une
 * remise qui s'appliquerait toute seule sans que la boutique l'ait voulue
 * ferait perdre de l'argent à chaque commande.
 *
 * Une nouvelle offre se crée depuis /admin → Tarification. Les dates y restent
 * vides tant que la boutique n'en fixe pas : aucune période n'est inventée
 * ici, et « vide » pour les groupages signifie « tous les groupages ».
 */
export const DEFAULT_PROMOTIONS: Promotion[] = [];
