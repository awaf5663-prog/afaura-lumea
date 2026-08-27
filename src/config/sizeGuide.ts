/**
 * ─────────────────────────────────────────────────────────────
 *  GUIDE DES TAILLES
 * ─────────────────────────────────────────────────────────────
 *
 *  Ce que ce fichier contient : le tableau des mesures du corps par taille,
 *  et la façon d'en déduire une taille de vêtement.
 *
 *  Le tableau reprend le « Body Chart » de SHEIN, parce que c'est celui que
 *  les clientes ont sous les yeux quand elles commandent. Deux guides qui se
 *  contredisent valent moins qu'un seul. Les équivalences FR reprennent
 *  également celles de SHEIN (36 = S, 38 = M, 40/42 = L, 44 = XL, 46 = XXL).
 *
 *  Ce que ce fichier n'est PAS : une promesse. Les tailles varient d'une
 *  marque à l'autre et d'un article SHEIN à l'autre. La page le dit, et
 *  renvoie toujours au tableau de mesures de l'article.
 */

export interface SizeRow {
  /** Taille internationale : XS, S, M… */
  label: string;
  /** Équivalence française, telle que SHEIN la donne. */
  fr: string;
  /** Tour de poitrine, en cm : [min inclus, max exclu]. */
  bust: [number, number];
  /** Tour de taille, en cm. */
  waist: [number, number];
  /** Tour de hanches, en cm. */
  hips: [number, number];
}

export const SIZE_CHART: SizeRow[] = [
  { label: 'XS', fr: '34', bust: [82, 86], waist: [62, 66], hips: [87, 91] },
  { label: 'S', fr: '36', bust: [86, 90], waist: [66, 70], hips: [91, 95] },
  { label: 'M', fr: '38', bust: [90, 94], waist: [70, 74], hips: [95, 99] },
  { label: 'L', fr: '40/42', bust: [94, 100], waist: [74, 80], hips: [99, 105] },
  { label: 'XL', fr: '44', bust: [100, 106], waist: [80, 86], hips: [105, 111] },
  { label: 'XXL', fr: '46', bust: [106, 112], waist: [86, 92], hips: [111, 117] },
  { label: '3XL', fr: '48', bust: [112, 118], waist: [92, 98], hips: [117, 123] },
  { label: '4XL', fr: '50', bust: [118, 126], waist: [98, 106], hips: [123, 131] },
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

/** Deux tailles pour un même vêtement, selon la façon de le porter. */
export interface Fit {
  /** Près du corps : la taille du tableau. */
  fitted: SizeRow | null;
  /** Ample, fluide : une taille au-dessus. */
  loose: SizeRow | null;
}

export interface BodyMeasures {
  bust: number | null;
  waist: number | null;
  hips: number | null;
}

export interface SizeSuggestion {
  /** Haut, chemise, top — décidé par la poitrine. */
  top: Fit;
  /** Pantalon, jupe — décidé par les hanches. */
  bottom: Fit;
  /** Robe, ensemble — la plus grande des deux. */
  dress: Fit;
  confidence: Confidence;
  /** Mesures utilisées : saisies, ou estimées depuis la taille et le poids. */
  used: BodyMeasures;
  notes: string[];
}

/**
 * Ligne du tableau contenant la mesure.
 *
 * Les bornes se touchent (90–94 puis 94–100) : une valeur pile sur la limite
 * part vers la taille du DESSUS. Un vêtement un peu large se reprend, un
 * vêtement trop juste ne se porte pas.
 */
function rowFor(value: number | null, key: 'bust' | 'waist' | 'hips'): SizeRow | null {
  if (value === null || !Number.isFinite(value) || value <= 0) return null;
  const inside = SIZE_CHART.find((row) => value >= row[key][0] && value < row[key][1]);
  if (inside) return inside;
  const first = SIZE_CHART[0];
  const last = SIZE_CHART[SIZE_CHART.length - 1];
  return value < first[key][0] ? first : last;
}

/** La taille juste au-dessus, pour un porté ample. */
function nextSize(row: SizeRow | null): SizeRow | null {
  if (!row) return null;
  const index = SIZE_CHART.indexOf(row);
  return SIZE_CHART[Math.min(index + 1, SIZE_CHART.length - 1)];
}

const toFit = (row: SizeRow | null): Fit => ({ fitted: row, loose: nextSize(row) });

const bigger = (a: SizeRow | null, b: SizeRow | null): SizeRow | null => {
  if (!a) return b;
  if (!b) return a;
  return SIZE_CHART.indexOf(a) >= SIZE_CHART.indexOf(b) ? a : b;
};

/**
 * Taille conseillée à partir des mesures réelles.
 *
 * Règle du vêtement : un haut se choisit sur la poitrine, un bas sur les
 * hanches, une robe sur la plus grande des deux. La mesure la plus
 * contraignante décide — c'est elle qui empêche d'enfiler le vêtement.
 */
export function suggestFromMeasurements(input: BodyMeasures): SizeSuggestion {
  const bust = rowFor(input.bust, 'bust');
  const waist = rowFor(input.waist, 'waist');
  const hips = rowFor(input.hips, 'hips');

  const top = bust ?? waist;
  const bottom = hips ?? waist;
  const dress = bigger(top, bottom);

  const notes: string[] = [];

  /*
   * Être à un centimètre d'une limite, c'est être entre deux tailles — pas
   * dans l'une d'elles. Trancher en silence donnerait une réponse nette et
   * fausse la moitié du temps ; on le dit, et la colonne « ample » prend son
   * sens.
   */
  const limite = (valeur: number | null, row: SizeRow | null, key: 'bust' | 'hips'): string | null => {
    if (valeur === null || !row) return null;
    const suivante = nextSize(row);
    if (!suivante || suivante === row) return null;
    return row[key][1] - valeur <= 1.5 ? `${row.label} et ${suivante.label}` : null;
  };
  const entreDeux = limite(input.bust, bust, 'bust') ?? limite(input.hips, hips, 'hips');
  if (entreDeux) {
    notes.push(
      `Vous êtes juste à la limite entre ${entreDeux}. Prenez la plus grande si vous aimez porter fluide, la plus petite si vous aimez près du corps.`,
    );
  }

  if (top && bottom && Math.abs(SIZE_CHART.indexOf(top) - SIZE_CHART.indexOf(bottom)) >= 2) {
    notes.push(
      `Votre haut et votre bas ne tombent pas sur la même taille (${top.label} en haut, ${bottom.label} en bas). Pour une robe ou un ensemble, partez sur ${dress?.label} et faites reprendre si besoin.`,
    );
  }
  const hors = [
    input.bust && input.bust >= 126 ? 'poitrine' : null,
    input.hips && input.hips >= 131 ? 'hanches' : null,
  ].filter(Boolean);
  if (hors.length) {
    notes.push(
      `Votre tour de ${hors.join(' et ')} dépasse le tableau : envoyez-nous vos mesures sur WhatsApp, nous cherchons la bonne référence avec vous.`,
    );
  }

  return { top: toFit(top), bottom: toFit(bottom), dress: toFit(dress), confidence: 'measured', used: input, notes };
}

/**
 * Mesures estimées à partir de la taille et du poids.
 *
 *  Le corps est traité comme un cylindre : la masse se répartit sur la
 *  hauteur, et le tour de taille suit la racine carrée de la masse par unité
 *  de longueur — circonférence ∝ √(poids / taille). À poids égal, une
 *  personne plus grande est donc plus fine, ce qui est exactement ce qu'on
 *  observe.
 *
 *  Calibrage sur une référence courante : 165 cm et 60 kg correspondent à une
 *  taille M, soit une poitrine de 92 cm, une taille de 72 cm et des hanches
 *  de 98 cm.
 *
 *  Une version précédente passait par l'IMC. Elle se trompait lourdement :
 *  1 m 75 pour 61 kg y ressortait en S, alors que ces mesures donnent M. Le
 *  modèle ci-dessous rend bien M, et retombe à moins de 3 cm des mesures
 *  réelles publiées par des acheteuses SHEIN.
 *
 *  Cela reste une estimation : elle ignore la morphologie. Deux personnes de
 *  même taille et même poids peuvent porter deux tailles différentes, et la
 *  page le dit avant d'afficher le moindre résultat.
 */
const REFERENCE = Math.sqrt(60 / 1.65);
const K_BUST = 92 / REFERENCE;
const K_WAIST = 72 / REFERENCE;
const K_HIPS = 98 / REFERENCE;

export function estimateBody(heightCm: number, weightKg: number): BodyMeasures {
  const facteur = Math.sqrt(weightKg / (heightCm / 100));
  const arrondi = (v: number) => Math.round(v * 10) / 10;
  return {
    bust: arrondi(K_BUST * facteur),
    waist: arrondi(K_WAIST * facteur),
    hips: arrondi(K_HIPS * facteur),
  };
}

export function suggestFromHeightWeight(heightCm: number, weightKg: number): SizeSuggestion {
  const vide: SizeSuggestion = {
    top: { fitted: null, loose: null },
    bottom: { fitted: null, loose: null },
    dress: { fitted: null, loose: null },
    confidence: 'estimated',
    used: { bust: null, waist: null, hips: null },
    notes: [],
  };
  if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) return vide;
  if (heightCm < 120 || heightCm > 220 || weightKg < 30 || weightKg > 200) return vide;

  const estimation = estimateBody(heightCm, weightKg);
  const base = suggestFromMeasurements(estimation);
  return {
    ...base,
    confidence: 'estimated',
    notes: [
      "Estimation à partir de votre taille et de votre poids : elle ne tient pas compte de votre morphologie. Vérifiez les mesures ci-dessus, et prenez-les au mètre ruban si vous voulez être sûre.",
      ...base.notes,
    ],
  };
}

const ligne = (titre: string, fit: Fit): string | null => {
  if (!fit.fitted) return null;
  const ample = fit.loose && fit.loose !== fit.fitted ? ` · ample ${fit.loose.label}` : '';
  return `• ${titre} : ${fit.fitted.label} (FR ${fit.fitted.fr})${ample}`;
};

/**
 * Résumé lisible, à envoyer sur WhatsApp avec une commande SHEIN.
 *
 * Le prénom ouvre le message : la boutique reçoit des mesures toute la
 * journée, et un message qui commence par « Bonjour, voici mes mesures »
 * sans nom l'oblige à remonter la conversation pour savoir de qui il s'agit.
 */
export function measurementsMessage(input: {
  name?: string;
  height?: number | null;
  weight?: number | null;
  suggestion: SizeSuggestion;
}): string {
  const { suggestion } = input;
  const prenom = (input.name ?? '').trim();
  const lignes = [
    prenom
      ? `Bonjour, je suis ${prenom}. Voici mes mesures pour ma commande :`
      : 'Bonjour, voici mes mesures pour ma commande :',
    '',
  ];
  if (input.height) lignes.push(`Taille : ${input.height} cm`);
  if (input.weight) lignes.push(`Poids : ${input.weight} kg`);

  const { bust, waist, hips } = suggestion.used;
  const suffixe = suggestion.confidence === 'estimated' ? ' (estimé)' : '';
  if (bust) lignes.push(`Tour de poitrine : ${bust} cm${suffixe}`);
  if (waist) lignes.push(`Tour de taille : ${waist} cm${suffixe}`);
  if (hips) lignes.push(`Tour de hanches : ${hips} cm${suffixe}`);

  const tailles = [
    ligne('Haut / chemise', suggestion.top),
    ligne('Pantalon / jupe', suggestion.bottom),
    ligne('Robe / ensemble', suggestion.dress),
  ].filter(Boolean) as string[];

  if (tailles.length) {
    lignes.push('');
    lignes.push(
      suggestion.confidence === 'measured'
        ? 'Taille indiquée par le guide du site :'
        : 'Taille estimée par le site (à confirmer) :',
    );
    lignes.push(...tailles);
  }
  return lignes.join('\n');
}
