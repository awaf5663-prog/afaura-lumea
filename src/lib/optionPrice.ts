import { CATEGORIES } from '@/src/data/seed';
import type { Product } from '@/src/types';

/**
 * Prix unitaire d'un article une fois ses options choisies.
 *
 * Un article peut se vendre en plusieurs conditionnements — un lot de 4 et un
 * lot de 12 n'ont pas le même prix. L'option choisie porte alors son montant,
 * et `price` sert de valeur par défaut.
 *
 * Ce calcul est un CONFORT D'AFFICHAGE. Le montant qui fait foi est celui que
 * la base recalcule au moment de la commande, à partir des mêmes colonnes
 * (voir create_order). Le navigateur n'envoie jamais de prix.
 *
 * Si plusieurs groupes portaient un prix, le résultat dépendrait de l'ordre
 * des clés : on parcourt donc les groupes triés et on retient le premier qui
 * correspond, exactement comme le fait le serveur.
 */
export function prixUnitaire(product: Product, options: Record<string, string>): number {
  const grilles = product.optionPrices;
  if (!grilles) return product.price;
  for (const groupe of Object.keys(grilles).sort()) {
    const choix = options[groupe];
    const prix = choix === undefined ? undefined : grilles[groupe]?.[choix];
    if (typeof prix === 'number' && Number.isFinite(prix) && prix >= 0) return prix;
  }
  return product.price;
}

/** Le plus bas des prix possibles : ce qu'on annonce sur la vignette. */
export function prixLePlusBas(product: Product): number {
  const tous = Object.values(product.optionPrices ?? {}).flatMap((g) => Object.values(g));
  const valides = tous.filter((p) => typeof p === 'number' && Number.isFinite(p) && p >= 0);
  return valides.length ? Math.min(product.price, ...valides) : product.price;
}

/** L'article se vend-il à plusieurs prix selon l'option ? */
export function plusieursPrix(product: Product): boolean {
  const tous = Object.values(product.optionPrices ?? {}).flatMap((g) => Object.values(g));
  return new Set([...tous, product.price]).size > 1;
}

/** Comment cadrer les photos de cet article : voir Category.photo. */
export function cadragePhoto(product: Pick<Product, 'category'>): 'portrait' | 'carre' {
  return CATEGORIES.find((c) => c.id === product.category)?.photo ?? 'portrait';
}
