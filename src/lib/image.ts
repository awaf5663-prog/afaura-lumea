/**
 * Compression d'image côté navigateur.
 * Les captures SHEIN sont réduites avant d'être stockées : une photo d'iPhone
 * de 3 Mo devient ~60 Ko, ce qui reste lisible et n'explose pas le stockage.
 * (En mode Supabase, la même image part vers Supabase Storage — voir README.)
 */
export async function compressImage(file: File, maxSize = 720, quality = 0.6): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible.'));
    img.src = dataUrl;
  });

  const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.width * scale);
  canvas.height = Math.round(image.height * scale);
  const context = canvas.getContext('2d');
  if (!context) return dataUrl;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', quality);
}

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/* ─────────────────────────────────────────────────────────────
   Photos d'article : ce qu'on enregistre, ce qu'on résout
   ───────────────────────────────────────────────────────────── */

/**
 * Une photo réellement fournie par la boutique.
 *
 * Une photo téléversée depuis l'administration devient une donnée `data:`,
 * et une photo hébergée ailleurs une adresse `http`. Les photos livrées avec
 * le site, elles, sont des fichiers compilés dont l'adresse (« /assets/…-
 * A1B2C3.webp ») change à chaque publication et dépend du chemin de base.
 */
export function isUploadedImage(src: string): boolean {
  return /^(data:|https?:)/i.test(src.trim());
}

/**
 * Repère d'une photo livrée avec le site : « seed:jersey#2 ».
 *
 * Pourquoi ne pas enregistrer l'adresse directement : elle a changé le jour
 * où le site est passé sur son propre domaine, et toutes les fiches déjà
 * enregistrées se sont retrouvées avec des photos vides. Un repère, lui, ne
 * dépend d'aucune publication — il est retraduit en adresse à la lecture.
 */
const SEED_MARK = /^seed:(.+)#(\d+)$/;

/** Ce qui part en base : les photos de la boutique, et des repères pour le reste. */
export function toStoredImages(
  images: string[],
  productId: string,
  seed: string[] | undefined,
): string[] {
  return images
    .map((src) => {
      if (isUploadedImage(src)) return src;
      const index = (seed ?? []).indexOf(src);
      // Adresse ni téléversée ni reconnue : reste d'une ancienne publication,
      // qui ne mène plus nulle part. On ne la conserve pas.
      return index >= 0 ? `seed:${productId}#${index}` : null;
    })
    .filter((src): src is string => src !== null);
}

/** Ce qui revient de la base : repères retraduits, adresses mortes écartées. */
export function fromStoredImages(
  stored: unknown,
  productId: string,
  seed: string[] | undefined,
): string[] {
  const liste = Array.isArray(stored) ? (stored as string[]) : [];
  const resolues = liste
    .map((src) => {
      if (typeof src !== 'string') return null;
      if (isUploadedImage(src)) return src;
      const m = SEED_MARK.exec(src);
      if (m && m[1] === productId) return (seed ?? [])[Number(m[2])] ?? null;
      return null;
    })
    .filter((src): src is string => Boolean(src));

  // Aucune photo exploitable : on reprend celles livrées avec le site plutôt
  // que d'afficher une fiche vide.
  return resolues.length ? resolues : (seed ?? []);
}
