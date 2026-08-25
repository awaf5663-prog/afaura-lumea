import { formatFcfa } from '@/src/lib/format';
import type { ServiceFeeStrategy } from '../types';

/** Frais de traitement par tranche de nombre d'articles. */
export const itemTiersStrategy: ServiceFeeStrategy = {
  id: 'item_tiers',
  label: "Tranches par nombre d'articles",

  describe: (config) =>
    config.tiers
      .map((tier) => {
        const range = tier.maxItems === null ? `${tier.minItems}+` : `${tier.minItems}–${tier.maxItems}`;
        return `${range} art. : ${tier.fee === null ? 'devis manuel' : formatFcfa(tier.fee)}`;
      })
      .join(' · '),

  compute: ({ itemCount }, config) => {
    const tier = config.tiers.find(
      (t) => itemCount >= t.minItems && (t.maxItems === null || itemCount <= t.maxItems),
    );

    if (!tier) {
      return {
        fee: null,
        reason: "Aucune tranche ne correspond à ce nombre d'articles.",
        requiresManualQuote: true,
      };
    }

    if (tier.fee === null) {
      return {
        fee: null,
        reason: `À partir de ${tier.minItems} articles, le montant est calculé au cas par cas.`,
        requiresManualQuote: true,
      };
    }

    const range =
      tier.maxItems === null ? `${tier.minItems} articles et plus` : `${tier.minItems} à ${tier.maxItems} articles`;

    return { fee: tier.fee, reason: `Tranche ${range}.`, requiresManualQuote: false };
  },
};
