import { CATEGORIES } from './seed';
import type { Category } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  LES GRANDES FAMILLES DE LA BOUTIQUE
 * ─────────────────────────────────────────────────────────────
 *  Le catalogue a grandi plus vite que ses filtres. Vingt-deux boutons alignés
 *  côte à côte — « Modal imprimé », « Jersey frisé », « Satin imprimé » — ne
 *  disent plus rien à qui cherche simplement un voile, et il en arrivera
 *  d'autres.
 *
 *  On remonte donc d'un cran : une dizaine de familles qu'on lit d'un coup
 *  d'œil, et le détail apparaît seulement quand on entre dans l'une d'elles.
 *  Une cliente qui veut un voile appuie sur « Voiles » et voit tous les voiles ;
 *  si elle cherche précisément du jersey frisé, le choix est là, juste en
 *  dessous.
 *
 *  Ajouter une catégorie sans la ranger ici n'est pas une faute : elle
 *  rejoindra la famille « Autres », et se remarquera. Mais la ranger vaut
 *  mieux.
 */
export interface Famille {
  id: string;
  name: string;
  /** Catégories rassemblées sous cette famille, dans l'ordre d'affichage. */
  categories: string[];
}

export const FAMILLES: Famille[] = [
  {
    id: 'voiles',
    name: 'Voiles',
    categories: [
      'voile_viscose',
      'voile_mj',
      'modal_imprime',
      'modal_simple',
      'satin_imprime',
      'dentelle',
      'jersey',
      'jersey_frise',
      'hijab_tape',
    ],
  },
  { id: 'abayas', name: 'Abayas & robes', categories: ['abaya', 'piece_unique', 'robes'] },
  { id: 'outfit', name: 'Outfit', categories: ['packs', 'combinaison'] },
  { id: 'nuit', name: 'Nuit & sous-vêtements', categories: ['lingerie'] },
  { id: 'sacs', name: 'Sacs', categories: ['sac'] },
  { id: 'chaussures', name: 'Chaussures', categories: ['chaussure'] },
  {
    id: 'soins',
    name: 'Soins du corps',
    categories: ['gommage', 'gel_douche', 'lait_corps', 'accessoire_beaute'],
  },
  { id: 'parfums', name: 'Parfums', categories: ['parfum', 'bougie'] },
  { id: 'maquillage', name: 'Maquillage', categories: ['maquillage', 'lips'] },
  { id: 'rentree', name: 'Rentrée', categories: ['rentree'] },
];

/** La famille d'une catégorie, ou `undefined` si personne ne l'a rangée. */
export function familleDe(categorie: string): Famille | undefined {
  return FAMILLES.find((f) => f.categories.includes(categorie));
}

/**
 * Les familles, garnies de leurs catégories réelles.
 *
 * Une catégorie oubliée du classement ci-dessus n'est pas perdue : elle est
 * regroupée dans « Autres », à la fin. Mieux vaut une famille fourre-tout
 * visible qu'un article introuvable.
 */
export function famillesGarnies(): Array<Famille & { rubriques: Category[] }> {
  const rangees = new Set(FAMILLES.flatMap((f) => f.categories));
  const orphelines = CATEGORIES.filter((c) => !rangees.has(c.id));
  const liste = FAMILLES.map((f) => ({
    ...f,
    rubriques: f.categories
      .map((id) => CATEGORIES.find((c) => c.id === id))
      .filter((c): c is Category => Boolean(c)),
  }));
  if (orphelines.length > 0) {
    liste.push({
      id: 'autres',
      name: 'Autres',
      categories: orphelines.map((c) => c.id),
      rubriques: orphelines,
    });
  }
  return liste;
}
