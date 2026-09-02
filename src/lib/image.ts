/**
 * Compression d'image côté navigateur.
 * Les captures SHEIN sont réduites avant d'être stockées : une photo d'iPhone
 * de 3 Mo devient ~60 Ko, ce qui reste lisible et n'explose pas le stockage.
 * (En mode Supabase, la même image part vers Supabase Storage — voir README.)
 */
function charger(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image illisible.'));
    img.src = src;
  });
}

/**
 * Réduit une image, en retirant au passage les bandes d'une capture d'écran.
 *
 * La détection se fait sur une version réduite — une photo d'iPhone en taille
 * réelle ferait cinquante mégaoctets de pixels à parcourir —, puis la découpe
 * est reportée sur l'original pour ne pas perdre en netteté.
 */
async function reduire(
  image: HTMLImageElement,
  secours: string,
  maxSize: number,
  quality: number,
): Promise<{ data: string; rogne: boolean }> {
  const echelle = Math.min(1, maxSize / Math.max(image.width, image.height));
  const brouillon = document.createElement('canvas');
  brouillon.width = Math.max(1, Math.round(image.width * echelle));
  brouillon.height = Math.max(1, Math.round(image.height * echelle));
  const cb = brouillon.getContext('2d', { willReadFrequently: true });
  if (!cb) return { data: secours, rogne: false };
  cb.drawImage(image, 0, 0, brouillon.width, brouillon.height);

  let zone: Zone | null = null;
  try {
    const d = cb.getImageData(0, 0, brouillon.width, brouillon.height);
    zone = zonePhoto(d.data, brouillon.width, brouillon.height);
  } catch {
    // Une image d'une autre origine salit le canevas : tant pis, on ne rogne pas.
    zone = null;
  }

  // Coordonnées de la découpe dans l'image d'origine.
  const sx = zone ? zone.x / echelle : 0;
  const sy = zone ? zone.y / echelle : 0;
  const sw = zone ? zone.largeur / echelle : image.width;
  const sh = zone ? zone.hauteur / echelle : image.height;

  const finale = Math.min(1, maxSize / Math.max(sw, sh));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(sw * finale));
  canvas.height = Math.max(1, Math.round(sh * finale));
  const context = canvas.getContext('2d');
  if (!context) return { data: secours, rogne: false };
  context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  return { data: canvas.toDataURL('image/jpeg', quality), rogne: zone !== null };
}

export async function compressImage(file: File, maxSize = 720, quality = 0.6): Promise<string> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(file);
  });
  return (await reduire(await charger(dataUrl), dataUrl, maxSize, quality)).data;
}

/**
 * Reprend une photo déjà enregistrée pour lui retirer ses bandes.
 *
 * Sert au bouton « Recadrer les photos » : les captures téléversées avant que
 * le rognage existe gardent leurs bandes noires, et il n'y a aucune raison de
 * les téléverser à nouveau une par une.
 *
 * Rend la photo inchangée, à l'octet près, s'il n'y a rien à retirer : sans
 * quoi un second clic la ré-encoderait pour rien, lui coûtant un peu de
 * netteté et laissant croire qu'on a recadré. Idem pour une photo qui ne vient
 * pas du téléversement.
 */
export async function rognerCapture(src: string, maxSize = 720, quality = 0.72): Promise<string> {
  if (!src.startsWith('data:')) return src;
  try {
    const { data, rogne } = await reduire(await charger(src), src, maxSize, quality);
    return rogne ? data : src;
  } catch {
    return src;
  }
}

/* ─────────────────────────────────────────────────────────────
   Bandes d'une capture d'écran
   ───────────────────────────────────────────────────────────── */

export interface Zone {
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
}

/** Luminance moyenne de chaque ligne (0 = noir, 255 = blanc). */
function luminanceParLigne(pixels: Uint8ClampedArray, largeur: number, hauteur: number): number[] {
  const lignes: number[] = [];
  for (let y = 0; y < hauteur; y += 1) {
    let somme = 0;
    for (let x = 0; x < largeur; x += 1) {
      const i = (y * largeur + x) * 4;
      somme += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
    lignes.push(somme / largeur);
  }
  return lignes;
}

/** Plus longue suite de lignes claires, en [début, fin[. */
function plusLongueSuiteClaire(lignes: number[], seuil: number): [number, number] {
  let meilleurD = 0;
  let meilleurF = lignes.length;
  let meilleur = 0;
  let debut: number | null = null;
  for (let i = 0; i <= lignes.length; i += 1) {
    const claire = i < lignes.length && lignes[i] >= seuil;
    if (claire && debut === null) debut = i;
    if (!claire && debut !== null) {
      if (i - debut > meilleur) {
        meilleur = i - debut;
        meilleurD = debut;
        meilleurF = i;
      }
      debut = null;
    }
  }
  return meilleur === 0 ? [0, lignes.length] : [meilleurD, meilleurF];
}

/**
 * La photo à l'intérieur d'une capture d'écran.
 *
 * Une capture d'iPhone garde tout : la barre d'état, les bandes noires
 * au-dessus et au-dessous de la photo, le bouton « AJOUTER AU PANIER » de
 * l'application. Sur la fiche, ces bords trahissent la capture.
 *
 * On cherche la plus grande zone claire d'un seul tenant, verticalement puis
 * horizontalement : c'est la photo, les bandes sont sombres et les autres
 * blocs clairs (le bandeau du bouton) plus courts.
 *
 * Renvoie null quand il n'y a rien à retirer — une vraie photo sur fond
 * sombre n'a pas de zone claire, et on préfère ne rien faire que la mutiler.
 */
export function zonePhoto(
  pixels: Uint8ClampedArray,
  largeur: number,
  hauteur: number,
  seuil = 60,
): Zone | null {
  const [haut, bas] = plusLongueSuiteClaire(luminanceParLigne(pixels, largeur, hauteur), seuil);

  // Colonnes, mesurées seulement sur la bande retenue.
  const colonnes: number[] = [];
  for (let x = 0; x < largeur; x += 1) {
    let somme = 0;
    for (let y = haut; y < bas; y += 1) {
      const i = (y * largeur + x) * 4;
      somme += 0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2];
    }
    colonnes.push(somme / Math.max(1, bas - haut));
  }
  const [gauche, droite] = plusLongueSuiteClaire(colonnes, seuil);

  const zone = { x: gauche, y: haut, largeur: droite - gauche, hauteur: bas - haut };

  // Deux garde-fous : on ne rogne pas pour rien, et on ne rogne jamais au
  // point de perdre l'article. En dessous, on rend l'image telle quelle.
  const gardeAssez = zone.hauteur >= hauteur * 0.35 && zone.largeur >= largeur * 0.35;
  const retireQuelqueChose =
    zone.hauteur <= hauteur * 0.98 || zone.largeur <= largeur * 0.98;
  return gardeAssez && retireQuelqueChose ? zone : null;
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
