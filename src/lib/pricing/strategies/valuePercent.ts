import { formatFcfa } from '@/src/lib/format';
import type { ServiceFeeStrategy } from '../types';

/** Frais de traitement proportionnels à la valeur déclarée des articles. */
export const valuePercentStrategy: ServiceFeeStrategy = {
  id: 'value_percent',
  label: 'Pourcentage de la valeur des articles',

  describe: (config) => {
    const { percent, minFee, maxFee } = config.valuePercent;
    const cap = maxFee === null ? 'sans plafond' : `plafonné à ${formatFcfa(maxFee)}`;
    return `${percent} % de la valeur déclarée, minimum ${formatFcfa(minFee)}, ${cap}`;
  },

  compute: ({ declaredValue }, config) => {
    const { percent, minFee, maxFee } = config.valuePercent;

    if (declaredValue === null) {
      return {
        fee: null,
        reason: 'La valeur des articles doit être connue pour calculer ces frais.',
        requiresManualQuote: true,
      };
    }

    const raw = Math.round((declaredValue * percent) / 100);
    const withMin = Math.max(minFee, raw);
    const fee = maxFee === null ? withMin : Math.min(maxFee, withMin);

    return {
      fee,
      reason: `${percent} % de la valeur déclarée (minimum ${formatFcfa(minFee)}).`,
      requiresManualQuote: false,
    };
  },
};
