import type { ProductVariantGroup } from '@/src/types';

export interface VariantesLues {
  groups: ProductVariantGroup[];
  /** { "Modèle": { "Lot de 3 trousses": 4000 } } — voir lib/optionPrice. */
  optionPrices: Record<string, Record<string, number>>;
}

/**
 * Lit le champ « Variantes » de l'administration.
 *
 * Une ligne par groupe, `Groupe: option, option`. Deux marqueurs, dans
 * n'importe quel ordre :
 *   (épuisé) → le modèle reste visible, barré, mais n'est plus commandable
 *   (4000)   → prix propre à cette option, en FCFA
 *
 * Fonction pure et sans dépendance à React : l'éditeur s'en sert pour montrer
 * en direct ce qu'il a compris, et l'enregistrement pour produire ce qu'il
 * écrit. Les deux doivent lire le texte de la même façon — sinon l'aperçu
 * ment.
 */
export function lireVariantes(texte: string): VariantesLues {
  const optionPrices: Record<string, Record<string, number>> = {};

  const groups = texte
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, rawOptions = ''] = line.split(':');
      const groupName = name.trim();
      const options: string[] = [];
      const soldOutOptions: string[] = [];

      for (const entry of rawOptions
        .split(',')
        .map((option) => option.trim())
        .filter(Boolean)) {
        const epuise = /\(épuisé\)/i.test(entry);
        const prix = /\((\d[\d\s]*)\)/.exec(entry);
        const label = entry
          .replace(/\(épuisé\)/gi, '')
          .replace(/\(\d[\d\s]*\)/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        if (!label) continue;
        options.push(label);
        if (epuise) soldOutOptions.push(label);
        if (prix) {
          const montant = Number(prix[1].replace(/\s/g, ''));
          if (Number.isFinite(montant) && montant >= 0) {
            optionPrices[groupName] = { ...optionPrices[groupName], [label]: montant };
          }
        }
      }

      return { name: groupName, options, soldOutOptions };
    })
    .filter((group) => group.name && group.options.length > 0);

  return { groups, optionPrices };
}

/** Remet en texte ce que la base a enregistré, pour rouvrir l'éditeur. */
export function ecrireVariantes(
  groups: ProductVariantGroup[],
  optionPrices: Record<string, Record<string, number>> | undefined,
): string {
  return groups
    .map((group) => {
      const options = group.options.map((option) => {
        const prix = optionPrices?.[group.name]?.[option];
        const marqueurs = [
          typeof prix === 'number' ? `(${prix})` : '',
          (group.soldOutOptions ?? []).includes(option) ? '(épuisé)' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return marqueurs ? `${option} ${marqueurs}` : option;
      });
      return `${group.name}: ${options.join(', ')}`;
    })
    .join('\n');
}
