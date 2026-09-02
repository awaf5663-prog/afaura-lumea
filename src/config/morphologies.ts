/**
 * ─────────────────────────────────────────────────────────────
 *  GUIDE DES MORPHOLOGIES
 * ─────────────────────────────────────────────────────────────
 *  Le texte reprend celui de l'affiche « Guide des morphologies »
 *  d'Afaura Luméa, mot pour mot. L'affiche reste consultable en image ;
 *  ce texte existe pour qu'il se lise aussi sur un petit écran, se
 *  cherche, et se laisse lire à voix haute par un lecteur d'écran.
 *
 *  Une morphologie n'est ni une taille ni une règle : c'est une aide au
 *  choix. Rien ici ne conditionne une commande.
 */

export interface Morphologie {
  id: string;
  /** Nom courant, tel qu'il est écrit sur l'affiche. */
  nom: string;
  /** Nom anglais, souvent celui des fiches SHEIN. */
  anglais: string;
  /** Ce qui la caractérise. */
  silhouette: string;
  /** Conseil de style, jamais un jugement. */
  conseil: string;
  /** Le mot de la fin de l'affiche. */
  mot: string;
}

export const MORPHOLOGIES: Morphologie[] = [
  {
    id: 'sablier',
    nom: 'Sablier',
    anglais: 'Hourglass',
    silhouette: 'Épaules et hanches alignées, taille bien marquée.',
    conseil: 'Mettez en valeur votre taille avec des vêtements cintrés.',
    mot: 'Vous êtes parfaitement équilibrée !',
  },
  {
    id: 'triangle',
    nom: 'Triangle',
    anglais: 'Triangle',
    silhouette: 'Hanches plus larges que les épaules, taille peu marquée.',
    conseil: "Attirez l'attention sur le haut du corps et équilibrez avec des bas unis.",
    mot: 'Vous êtes unique et magnifique !',
  },
  {
    id: 'ronde',
    nom: 'Ronde',
    anglais: 'Rounded',
    silhouette: 'Silhouette aux courbes douces, taille peu définie.',
    conseil: 'Optez pour des matières fluides et des coupes qui allongent la silhouette.',
    mot: 'Votre douceur est votre force !',
  },
  {
    id: 'rectangle',
    nom: 'Rectangle',
    anglais: 'Straight',
    silhouette: 'Épaules, taille et hanches alignées, peu de courbes.',
    conseil: 'Créez du volume avec des superpositions, des ceintures et des détails.',
    mot: 'Jouez avec les volumes et amusez-vous !',
  },
  {
    id: 'triangle-inverse',
    nom: 'Triangle inversé',
    anglais: 'Inverted triangle',
    silhouette: 'Épaules plus larges que les hanches, taille peu marquée.',
    conseil: 'Équilibrez votre silhouette en apportant du volume sur le bas du corps.',
    mot: 'Votre assurance fait toute la différence !',
  },
];

/** Le rappel qui clôt l'affiche. */
export const RAPPEL_MORPHOLOGIE =
  'Chaque corps est beau et unique. Choisissez des vêtements dans lesquels vous vous sentez bien et qui reflètent votre personnalité.';

/**
 * Les trois mesures de l'affiche « Guide des mesures », dans son vocabulaire.
 * (Le formulaire du guide des tailles parle de « tour de poitrine » : c'est la
 * même mesure que le buste, prise au même endroit.)
 */
export const MESURES_AFFICHE = [
  {
    id: 'buste',
    nom: 'Buste',
    hint: 'Mesurez autour de la partie la plus large de votre buste.',
  },
  {
    id: 'taille',
    nom: 'Taille',
    hint: 'Mesurez autour de la partie la plus étroite de votre taille.',
  },
  {
    id: 'hanches',
    nom: 'Hanches',
    hint: 'Mesurez autour de la partie la plus large de vos hanches et de vos fesses.',
  },
];

export const RAPPEL_MESURES =
  'Prenez vos mesures en portant des vêtements moulants ou des sous-vêtements. Gardez le mètre bien droit et parallèle au sol.';
