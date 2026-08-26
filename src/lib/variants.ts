import type { Product, ProductVariantGroup } from '@/src/types';

/**
 * Groupe de variantes aligné sur les photos.
 *
 * C'est lui qui permet de faire défiler les modèles et de choisir dans le même
 * geste. Deux façons de l'aligner : soit `photoOptions` nomme le modèle de
 * chaque photo — un modèle peut alors en avoir plusieurs, une vue de face et
 * une vue de dos —, soit il y a exactement autant d'options que de photos.
 *
 * La règle vit ici et pas dans la fiche produit : le panier s'en sert aussi
 * pour afficher la photo du modèle commandé, et les deux doivent répondre la
 * même chose.
 */
export function findPhotoGroup(product: Product): ProductVariantGroup | undefined {
  return product.variants.find(
    (group) =>
      group.photoOptions?.length === product.images.length ||
      (!group.photoOptions && group.options.length === product.images.length),
  );
}

/** Modèle montré par chaque photo, dans l'ordre des photos. */
export function photoOptionsOf(group: ProductVariantGroup): string[] {
  return group.photoOptions ?? group.options;
}

/** Première photo qui montre ce modèle, ou -1. */
export function photoOfOption(group: ProductVariantGroup, option: string): number {
  return photoOptionsOf(group).indexOf(option);
}
