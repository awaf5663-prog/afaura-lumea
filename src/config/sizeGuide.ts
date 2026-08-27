/**
 * ─────────────────────────────────────────────────────────────
 *  GUIDE DES TAILLES
 * ─────────────────────────────────────────────────────────────
 *
 *  Ce que ce fichier est : un tableau de correspondances standard entre des
 *  mesures du corps (en centimètres) et les tailles courantes du prêt-à-porter
 *  féminin européen.
 *
 *  Ce qu'il n'est PAS : une promesse. Les tailles varient d'une marque à
 *  l'autre, et énormément chez SHEIN d'un article à l'autre. Le site le dit
 *  clairement à la cliente, et l'invite toujours à vérifier le tableau de
 *  mesures publié sur la fiche de l'article.
 *
 *  Les fourchettes ci-dessous suivent la norme européenne EN 13402 pour le
 *  vêtement féminin. Rien n'est inventé pour arranger un résultat.
 */

export interface SizeRow {
  /** Taille internationale : XS, S, M… */
  label: string;
  /** Équivalence française (34, 36, 38…). */
  fr: number;
  /** Tour de poitrine, en cm [min, max]. */
  bust: [number, number];
  /** Tour de taille, en cm. */
  waist: [number, number];
  /** Tour de hanches, en cm. */
  hips: [number, number];
}

export const SIZE_CHART: SizeRow[] = [
  { label: 'XS', fr: 34, bust: [78, 82], waist: [60, 64], hips: [86, 90] },
  { label: 'S', fr: 36, bust: [82, 86], waist: [64, 68], hips: [90, 94] },
  { label: 'S/M', fr: 38, bust: [86, 90], waist: [68, 72], hips: [94, 98] },
  { label: 'M', fr: 40, bust: [90, 94], waist: [72, 76], hips: [98, 102] },
  { label: 'L', fr: 42, bust: [94, 99], waist: [76, 81], hips: [102, 107] },
  { label: 'XL', fr: 44, bust: [99, 104], waist: [81, 86], hips: [107, 112] },
  { label: 'XXL', fr: 46, bust: [104, 110], waist: [86, 92], hips: [112, 118] },
  { label: '3XL', fr: 48, bust: [110, 116], waist: [92, 98], hips: [118, 124] },
  { label: '4XL', fr: 50, bust: [116, 124], waist: [98, 106], hips: [124, 132] },
];

/** Comment prendre chaque mesure. Le geste compte autant que le chiffre. */
export const HOW_TO_MEASURE = [
  {
    id: 'bust',
    label: 'Tour de poitrine',
    hint: "Au niveau le plus fort de la poitrine, le mètre bien à plat dans le dos, sans serrer.",
  },
  {
    id: 'waist',
    label: 'Tour de taille',
    hint: "À l'endroit le plus creux du buste, au-dessus du nombril. Respirez normalement.",
  },
  {
    id: 'hips',
    label: 'Tour de hanches',
    hint: "Au niveau le plus fort des hanches, environ 20 cm sous la taille, pieds joints.",
  },
  {
    id: 'inseam',
    label: 'Entrejambe',
    hint: "De l'aine jusqu'à la cheville, le long de la jambe. Utile pour la longueur d'un pantalon.",
  },
];

export type Confidence = 'measured' | 'estimated';

export interface SizeSuggestion {
  /** Taille conseillée pour un haut, chemisier, top. */
  top: SizeRow | null;
  /** Taille conseillée pour un pantalon, une jupe. */
  bottom: SizeRow | null;
  /** Taille conseillée pour une robe : la plus grande des deux. */
  dress: SizeRow | null;
  /** D'où vient le résultat : mesures réelles, ou estimation taille/poids. */
  confidence: Confidence;
  /** Précisions à afficher : entre deux tailles, morphologie contrastée… */
  notes: string[];
}

/** Ligne dont la fourchette contient la mesure, sinon la plus proche. */
function rowFor(value: number, key: 'bust' | 'waist' | 'hips'): SizeRow | null {
  if (!Number.isFinite(value) || value <= 0) return null;
  const inside = SIZE_CHART.find((row) => value >= row[key][0] && value <= row[key][1]);
  if (inside) return inside;
  // Hors tableau : on renvoie l'extrémité la plus proche plutôt que rien,
  // et l'appelant précisera que la mesure sort des tailles courantes.
  const first = SIZE_CHART[0];
  const last = SIZE_CHART[SIZE_CHART.length - 1];
  return value < first[key][0] ? first : last;
}

const bigger = (a: SizeRow | null, b: SizeRow | null): SizeRow | null => {
  if (!a) return b;
  if (!b) return a;
  return a.fr >= b.fr ? a : b;
};

/**
 * Taille conseillée à partir des mesures réelles.
 *
 * Règle du vêtement : on part de la mesure la plus contraignante. Un haut se
 * choisit sur la poitrine, un bas sur les hanches, une robe sur la plus grande
 * des deux — un vêtement trop petit à un endroit ne se porte pas, alors qu'un
 * peu large se reprend.
 */
export function suggestFromMeasurements(input: {
  bust?: number | null;
  waist?: number | null;
  hips?: number | null;
}): SizeSuggestion {
  const bust = rowFor(input.bust ?? 0, 'bust');
  const waist = rowFor(input.waist ?? 0, 'waist');
  const hips = rowFor(input.hips ?? 0, 'hips');

  const top = bust ?? waist;
  const bottom = hips ?? waist;
  const dress = bigger(top, bottom);

  const notes: string[] = [];
  if (top && bottom && Math.abs(top.fr - bottom.fr) >= 4) {
    notes.push(
      `Votre haut et votre bas ne tombent pas sur la même taille (${top.label} en haut, ${bottom.label} en bas). Pour une robe ou un ensemble, prenez ${dress?.label} et faites reprendre si besoin.`,
    );
  }
  const hors = [
    input.bust && input.bust > 124 ? 'poitrine' : null,
    input.hips && input.hips > 132 ? 'hanches' : null,
  ].filter(Boolean);
  if (hors.length) {
    notes.push(
      `Votre tour de ${hors.join(' et ')} dépasse le tableau : envoyez-nous vos mesures sur WhatsApp, nous cherchons la bonne référence avec vous.`,
    );
  }

  return { top, bottom, dress, confidence: 'measured', notes };
}

/**
 * Estimation à partir de la taille et du poids, quand la cliente n'a pas de
 * mètre ruban sous la main.
 *
 * C'est volontairement grossier : deux personnes de même taille et même poids
 * n'ont pas la même morphologie. On passe par l'indice de masse corporelle,
 * qui donne une corpulence, et on la traduit en taille de vêtement. Le
 * résultat est toujours présenté comme une indication à vérifier.
 */
export function suggestFromHeightWeight(heightCm: number, weightKg: number): SizeSuggestion {
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg) || heightCm < 120 || weightKg < 30) {
    return { top: null, bottom: null, dress: null, confidence: 'estimated', notes: [] };
  }

  const metres = heightCm / 100;
  const imc = weightKg / (metres * metres);

  // Corpulence → taille courante. Les seuils suivent les catégories d'IMC
  // usuelles ; la taille du vêtement suit la corpulence, pas le poids seul.
  const bandes: Array<{ max: number; index: number }> = [
    { max: 17.5, index: 0 }, // XS
    { max: 19.5, index: 1 }, // S
    { max: 21.5, index: 2 }, // S/M
    { max: 24, index: 3 }, // M
    { max: 27, index: 4 }, // L
    { max: 30, index: 5 }, // XL
    { max: 34, index: 6 }, // XXL
    { max: 39, index: 7 }, // 3XL
    { max: Infinity, index: 8 }, // 4XL
  ];
  let index = bandes.find((b) => imc < b.max)?.index ?? 4;

  // Une grande taille répartit le même poids sur plus de longueur : à IMC
  // identique, la silhouette est plus fine, et inversement.
  if (heightCm >= 175) index = Math.max(0, index - 1);
  if (heightCm <= 155) index = Math.min(SIZE_CHART.length - 1, index + 1);

  const row = SIZE_CHART[index];
  return {
    top: row,
    bottom: row,
    dress: row,
    confidence: 'estimated',
    notes: [
      "Cette taille est une estimation à partir de votre taille et de votre poids : elle ne tient pas compte de votre morphologie. Prenez vos mesures au mètre ruban pour un résultat fiable.",
    ],
  };
}

/** Résumé lisible, à envoyer sur WhatsApp avec une commande SHEIN. */
export function measurementsMessage(input: {
  height?: number | null;
  weight?: number | null;
  bust?: number | null;
  waist?: number | null;
  hips?: number | null;
  suggestion: SizeSuggestion;
}): string {
  const lignes = ['Bonjour, voici mes mesures pour ma commande :', ''];
  if (input.height) lignes.push(`Taille : ${input.height} cm`);
  if (input.weight) lignes.push(`Poids : ${input.weight} kg`);
  if (input.bust) lignes.push(`Tour de poitrine : ${input.bust} cm`);
  if (input.waist) lignes.push(`Tour de taille : ${input.waist} cm`);
  if (input.hips) lignes.push(`Tour de hanches : ${input.hips} cm`);

  const { top, bottom, dress, confidence } = input.suggestion;
  if (top || bottom || dress) {
    lignes.push('');
    lignes.push(
      confidence === 'measured'
        ? 'Taille indiquée par le guide du site :'
        : 'Taille estimée par le site (à confirmer) :',
    );
    if (top) lignes.push(`• Haut / chemise : ${top.label} (FR ${top.fr})`);
    if (bottom) lignes.push(`• Pantalon / jupe : ${bottom.label} (FR ${bottom.fr})`);
    if (dress) lignes.push(`• Robe / ensemble : ${dress.label} (FR ${dress.fr})`);
  }
  return lignes.join('\n');
}
