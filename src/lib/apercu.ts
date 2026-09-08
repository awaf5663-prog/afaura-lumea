/**
 * ─────────────────────────────────────────────────────────────
 *  APERÇUS : LA BONNE PHOTO POUR LA BONNE PLACE
 * ─────────────────────────────────────────────────────────────
 *  Une vignette de boutique fait 167 pixels de large sur un téléphone. On y
 *  envoyait une photo de 900 : trois fois trop, et sur une connexion mobile
 *  cela se voit — la grille se remplit lentement, article après article.
 *
 *  À côté de chaque photo vit donc un aperçu de 500 pixels, assez large pour
 *  un écran très fin, trois fois plus léger. La fiche produit, elle, garde la
 *  grande : c'est là qu'on regarde vraiment un tissu.
 *
 *  Les deux dossiers sont parcourus au chargement, et appariés par nom de
 *  fichier — les adresses finales portent une empreinte différente à chaque
 *  publication, impossible de deviner l'une à partir de l'autre.
 */

const nomDeFichier = (chemin: string) => chemin.slice(chemin.lastIndexOf('/') + 1);

const grandes = import.meta.glob('/src/assets/products/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const apercus = import.meta.glob('/src/assets/products/apercus/*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

/** Adresse publiée de la grande photo → adresse de son aperçu. */
const table = new Map<string, string>();
for (const [chemin, url] of Object.entries(grandes)) {
  const petit = apercus['/src/assets/products/apercus/' + nomDeFichier(chemin)];
  if (petit) table.set(url, petit);
}

/**
 * L'aperçu d'une photo du catalogue, ou la photo elle-même.
 *
 * Les images téléversées par la boutique depuis l'administration n'ont pas
 * d'aperçu : elles ne passent pas par le dossier des sources. On rend alors
 * l'originale — mieux vaut une photo lourde qu'une case vide.
 */
export function apercuDe(url: string | undefined): string | undefined {
  if (!url) return url;
  return table.get(url) ?? url;
}
