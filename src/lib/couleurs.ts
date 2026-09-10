/**
 * ─────────────────────────────────────────────────────────────
 *  MOTS DE COULEUR → PASTILLE
 * ─────────────────────────────────────────────────────────────
 *  Une vignette montre une pastille de couleur quand le nom de
 *  l'option EST un mot de couleur connu : « Noir », « Rose poudré ».
 *
 *  La pastille rend le mot, pas le tissu. Un « Bordeaux rayé » ou un
 *  « Léopard » ne reçoit donc rien : le nom s'affiche en toutes
 *  lettres plutôt qu'un aplat qui mentirait sur le motif.
 *
 *  Pour ajouter une teinte : une ligne de plus ici. Le rapprochement
 *  se fait sur le nom exact, sans accents et sans majuscules.
 */
const TEINTES: Record<string, string> = {
  noir: '#1b1b1b',
  blanc: '#fbfbf9',
  'blanc casse': '#f2ece2',
  ecru: '#efe6d6',
  creme: '#f6ecdd',
  ivoire: '#f7f1e6',
  beige: '#e3d2bd',
  sable: '#e2cfb2',
  taupe: '#8c7c6e',
  nude: '#e0bfa8',
  'nude naturel': '#d9b295',
  camel: '#bd8b52',
  moutarde: '#cb9a26',
  or: '#c9a75a',
  argent: '#c3c6cb',
  gris: '#9a9a9d',
  'gris clair': '#c9c9cd',
  'gris souris': '#8b8b90',
  anthracite: '#3b3d42',
  marron: '#6f4b33',
  chocolat: '#4e3126',
  brun: '#6a4632',
  'marron elegant': '#7a5240',
  bordeaux: '#6b1f2c',
  rouge: '#c0272d',
  'rouge brique': '#a2432f',
  corail: '#f07a5f',
  orange: '#e0721f',
  rose: '#eba7bf',
  'rose poudre': '#eec3c9',
  'rose pale': '#f3d3d9',
  'rose subtil': '#e9b4bd',
  'rose vif': '#e0518c',
  fuchsia: '#c92f81',
  magenta: '#c1498b',
  violet: '#7b4b9b',
  lilas: '#c3aede',
  lavande: '#cdc2e6',
  mauve: '#a688b5',
  bleu: '#2f5aa8',
  'bleu ciel': '#a7c8e6',
  'bleu roi': '#1f47a3',
  'bleu marine': '#1d2a4a',
  marine: '#1d2a4a',
  'bleu jean': '#5c7ba8',
  'bleu petrole': '#1f5a63',
  turquoise: '#2fa8a3',
  vert: '#3f7a46',
  "vert d'eau": '#a9cec2',
  'vert foret': '#2c5136',
  'vert olive': '#6b6b35',
  kaki: '#7a7551',
  jaune: '#e8c33f',
  transparent: '#f4f1ee',
};

/** Enlève les accents et la casse pour comparer « Rose poudré » et « rose poudre ». */
function normaliser(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Teinte d'affichage d'un nom d'option, ou `null` quand le nom ne
 * désigne pas une couleur simple (motif, imprimé, référence…).
 */
export function teinteDuNom(nom: string): string | null {
  return TEINTES[normaliser(nom)] ?? null;
}
