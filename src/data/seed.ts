import type { Category, Product } from '@/src/types';

import dentelleBrunRose from '@/src/assets/products/dentelle-brun-rose.webp';
import dentelleColoris from '@/src/assets/products/dentelle-coloris.webp';
import dentelleNoirBlanc from '@/src/assets/products/dentelle-noir-blanc.webp';
import dentelleNoirRose from '@/src/assets/products/dentelle-noir-rose.webp';
import hijabTape from '@/src/assets/products/hijab-tape.webp';
import jersey from '@/src/assets/products/jersey.webp';
import jerseyFrise from '@/src/assets/products/jersey-frise.webp';
import modalAquarelle from '@/src/assets/products/modal-aquarelle.webp';
import modalLeopard from '@/src/assets/products/modal-leopard.webp';
import modalPoisBlanc from '@/src/assets/products/modal-pois-blanc.webp';
import modalPoisBrun from '@/src/assets/products/modal-pois-brun.webp';
import modalZebreBordeaux from '@/src/assets/products/modal-zebre-bordeaux.webp';
import modalSimpleBordeaux from '@/src/assets/products/modal-simple-bordeaux.webp';
import modalSimpleColoris from '@/src/assets/products/modal-simple-coloris.webp';
import modalSimpleKakiNoir from '@/src/assets/products/modal-simple-kaki-noir.webp';
import modalSimpleNoir from '@/src/assets/products/modal-simple-noir.webp';
import pieceCremeFleuri from '@/src/assets/products/piece-creme-fleuri.webp';
import pieceEcruOr from '@/src/assets/products/piece-ecru-or.webp';
import pieceFauve from '@/src/assets/products/piece-fauve.webp';
import pieceNoirFleuri from '@/src/assets/products/piece-noir-fleuri.webp';
import pieceTaupeFleuri from '@/src/assets/products/piece-taupe-fleuri.webp';
import satinDegradeVertBleu from '@/src/assets/products/satin-degrade-vert-bleu.webp';
import satinDegradeVertRouille from '@/src/assets/products/satin-degrade-vert-rouille.webp';
import satinNoirPaillete from '@/src/assets/products/satin-noir-paillete.webp';
import satinSablePaillete from '@/src/assets/products/satin-sable-paillete.webp';
import satinVertEau from '@/src/assets/products/satin-vert-eau.webp';

export const CATEGORIES: Category[] = [
  { id: 'piece_unique', name: 'Pièce unique' },
  { id: 'modal_imprime', name: 'Modal imprimé' },
  { id: 'modal_simple', name: 'Modal simple' },
  { id: 'satin_imprime', name: 'Satin imprimé' },
  { id: 'dentelle', name: 'Dentelle' },
  { id: 'hijab', name: 'Hijabs & voiles' },
  { id: 'accessoire', name: 'Accessoires' },
];

/**
 * Catalogue réel repris du catalogue WhatsApp « HIJAB 🌸 ».
 * Prix en FCFA, identiques à ceux du catalogue.
 * Les visuels proviennent des vignettes du catalogue : à remplacer par des
 * photos haute définition depuis /admin → Produits dès qu'elles sont disponibles.
 */
export const SEED_PRODUCTS: Product[] = [
  {
    id: 'jersey',
    slug: 'hijab-jersey',
    name: 'Jersey',
    description:
      "Le hijab du quotidien. Maille jersey souple, tombé net, aucune épingle nécessaire. La base à avoir en plusieurs exemplaires.",
    price: 1500,
    compareAtPrice: null,
    category: 'hijab',
    images: [jersey],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:20:00.000Z',
  },
  {
    id: 'jersey-frise',
    slug: 'hijab-jersey-frise',
    name: 'Jersey frisé',
    description:
      "Jersey texturé, effet froissé. Il tient tout seul sur la tête et ne glisse pas, même sur une longue journée.",
    price: 2000,
    compareAtPrice: null,
    category: 'hijab',
    images: [jerseyFrise],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:25:00.000Z',
  },
  {
    id: 'satin-imprime',
    slug: 'satin-imprime',
    name: 'Satin imprimé',
    description:
      "Satin fluide au léger reflet, en dégradés et pailletés. Faites défiler les photos pour voir les modèles, puis choisissez le vôtre.",
    price: 3500,
    compareAtPrice: null,
    category: 'satin_imprime',
    images: [
      satinDegradeVertBleu,
      satinSablePaillete,
      satinNoirPaillete,
      satinVertEau,
      satinDegradeVertRouille,
    ],
    variants: [
      {
        name: 'Modèle',
        options: [
          'Dégradé vert & bleu',
          'Sable pailleté',
          'Noir pailleté',
          "Vert d'eau",
          'Dégradé vert & rouille',
        ],
        soldOutOptions: [],
      },
    ],
    stock: null,
    status: 'active',
    otherColorsAvailable: true,
    createdAt: '2026-01-05T10:05:00.000Z',
  },
  {
    id: 'modal-simple',
    slug: 'modal-simple',
    name: 'Modal simple',
    description:
      "Modal uni, doux et respirant, très léger à porter. Un drapé souple qui reste impeccable toute la journée. Choisissez votre teinte dans le nuancier ci-dessous.",
    price: 4500,
    compareAtPrice: null,
    category: 'modal_simple',
    images: [modalSimpleBordeaux, modalSimpleKakiNoir, modalSimpleNoir, modalSimpleColoris],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:10:00.000Z',
  },
  {
    id: 'modal-imprime',
    slug: 'modal-imprime',
    name: 'Modal imprimé',
    description:
      "Le confort du modal avec un imprimé travaillé. Faites défiler les photos pour voir les modèles, puis choisissez celui qui vous plaît. Vendu à l'unité.",
    price: 5500,
    compareAtPrice: null,
    category: 'modal_imprime',
    // L'ordre des photos suit l'ordre des modèles : faire défiler sélectionne.
    images: [modalZebreBordeaux, modalPoisBrun, modalPoisBlanc, modalAquarelle, modalLeopard],
    variants: [
      {
        name: 'Modèle',
        options: ['Zébré bordeaux', 'Pois sur brun', 'Pois sur blanc', 'Aquarelle', 'Léopard'],
        soldOutOptions: [],
      },
    ],
    stock: null,
    status: 'active',
    otherColorsAvailable: true,
    createdAt: '2026-01-05T10:15:00.000Z',
  },
  {
    id: 'dentelle',
    slug: 'dentelle',
    name: 'Dentelle',
    description:
      "Hijab bordé de dentelle, pour les occasions : cérémonies, fêtes, invitations. Choisissez votre teinte dans le nuancier ci-dessous.",
    price: 5000,
    compareAtPrice: null,
    category: 'dentelle',
    images: [dentelleNoirBlanc, dentelleNoirRose, dentelleBrunRose, dentelleColoris],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'dentelle12',
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'piece-unique',
    slug: 'piece-unique',
    name: 'Pièce unique',
    description:
      "Des modèles rares, reçus à l'unité. Faites défiler les photos pour les voir un par un, puis choisissez celui que vous voulez : chaque modèle n'existe qu'en un seul exemplaire.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    // L'ordre des photos suit exactement l'ordre des modèles ci-dessous :
    // faire défiler la galerie sélectionne le modèle correspondant.
    images: [pieceNoirFleuri, pieceCremeFleuri, pieceTaupeFleuri, pieceFauve, pieceEcruOr],
    variants: [
      {
        name: 'Modèle',
        options: ['Noir fleuri', 'Crème fleuri', 'Taupe fleuri', 'Fauve', 'Écru & or'],
        // Un modèle vendu se marque ici depuis /admin → Produits, avec « (épuisé) ».
        soldOutOptions: [],
      },
    ],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:30:00.000Z',
  },
  {
    id: 'hijab-tape',
    slug: 'hijab-tape',
    name: 'Hijab tape',
    description:
      "Les bandes adhésives qui remplacent les épingles : le hijab reste en place sans marquer ni abîmer le tissu.",
    price: 1000,
    compareAtPrice: null,
    category: 'accessoire',
    images: [hijabTape],
    variants: [],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:35:00.000Z',
  },
];
