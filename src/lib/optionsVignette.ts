import { findColorChart } from '@/src/config/colorCharts';
import { teinteDuNom } from '@/src/lib/couleurs';
import type { Product } from '@/src/types';

/** Une valeur montrée sur la vignette : un nom, parfois une teinte. */
export interface ValeurVignette {
  nom: string;
  /** Teinte de la pastille, ou `null` quand le nom sera écrit en toutes lettres. */
  hex: string | null;
  epuise: boolean;
}

export interface ResumeVignette {
  /** « taille » s'affiche en cases, « couleur » en pastilles. */
  type: 'taille' | 'couleur';
  /** Nom du groupe d'options : « Couleur », « Pointure »… */
  libelle: string;
  valeurs: ValeurVignette[];
  /** Options existantes mais non montrées, faute de place. */
  reste: number;
}

/** Combien de valeurs tiennent sous une vignette sans la surcharger. */
const MAX_COULEURS = 5;
const MAX_TAILLES = 4;

const TAILLE = /taille|pointure|size/i;
const COULEUR = /couleur|coloris|teinte|nuance|mod[èe]le|motif/i;

/**
 * Ce qu'une vignette peut montrer des options d'un article, sans rien
 * inventer : les tailles telles qu'elles sont saisies, les couleurs
 * telles qu'elles sont nommées.
 *
 * La taille passe avant la couleur : c'est elle qui décide si l'article
 * peut convenir. Une fiche sans groupe d'options reconnu n'affiche rien
 * — mieux vaut une vignette sobre qu'un résumé approximatif.
 */
export function resumeVignette(product: Product): ResumeVignette | null {
  const groupeTaille = product.variants.find((g) => TAILLE.test(g.name));
  const groupe = groupeTaille ?? product.variants.find((g) => COULEUR.test(g.name));

  if (groupe && groupe.options.length > 0) {
    const type = groupe === groupeTaille ? 'taille' : 'couleur';
    const max = type === 'taille' ? MAX_TAILLES : MAX_COULEURS;
    const epuisees = new Set(groupe.soldOutOptions ?? []);
    return {
      type,
      libelle: groupe.name,
      valeurs: groupe.options.slice(0, max).map((nom) => ({
        nom,
        hex: type === 'couleur' ? teinteDuNom(nom) : null,
        epuise: epuisees.has(nom),
      })),
      reste: Math.max(0, groupe.options.length - max),
    };
  }

  // Pas de groupe d'options, mais un nuancier fournisseur : ses teintes
  // sont relevées sur le nuancier lui-même, on peut les montrer telles quelles.
  const nuancier = findColorChart(product.colorChartId);
  if (nuancier && nuancier.swatches.length > 0) {
    return {
      type: 'couleur',
      libelle: nuancier.label,
      valeurs: nuancier.swatches.slice(0, MAX_COULEURS).map((teinte) => ({
        nom: teinte.name ? `${teinte.code} · ${teinte.name}` : `Teinte ${teinte.code}`,
        hex: teinte.hex,
        epuise: false,
      })),
      reste: Math.max(0, nuancier.swatches.length - MAX_COULEURS),
    };
  }

  return null;
}

/**
 * Remise réelle, en pourcentage entier, quand un ancien prix est renseigné.
 *
 * Rien n'est affiché sous 5 % : une pastille « −2 % » attire l'œil pour
 * une économie que la cliente ne sentira pas.
 */
export function pourcentageRemise(product: Product): number | null {
  const avant = product.compareAtPrice;
  if (!avant || avant <= product.price) return null;
  const remise = Math.round((1 - product.price / avant) * 100);
  return remise >= 5 ? remise : null;
}

/**
 * Ce qui tient réellement sous une vignette.
 *
 * Une pastille de couleur prend une place fixe ; un nom écrit en prend
 * beaucoup plus. On garde donc au plus deux noms, et seulement ceux qui
 * se lisent d'un coup d'œil — « Bic bleu » oui, « Lot de 6 stylos et
 * souligneurs » non : coupé au milieu, il n'apprend rien.
 */
const NOM_LISIBLE = 15;

export function valeursMontrees(resume: ResumeVignette): {
  montrees: ValeurVignette[];
  caches: number;
} {
  let mots = resume.type === 'taille' ? MAX_TAILLES : 2;
  const montrees = resume.valeurs.filter((valeur) => {
    if (valeur.hex) return true;
    if (mots === 0 || valeur.nom.length > NOM_LISIBLE) return false;
    mots -= 1;
    return true;
  });
  return { montrees, caches: resume.reste + (resume.valeurs.length - montrees.length) };
}
