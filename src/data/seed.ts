import type { Category, Product } from '@/src/types';

import dentelle from '@/src/assets/products/dentelle.webp';
import hijabTape from '@/src/assets/products/hijab-tape.webp';
import jersey from '@/src/assets/products/jersey.webp';
import jerseyFrise from '@/src/assets/products/jersey-frise.webp';
import modalImprime from '@/src/assets/products/modal-imprime.webp';
import modalSimple from '@/src/assets/products/modal-simple.webp';
import pieceCremeFleuri from '@/src/assets/products/piece-creme-fleuri.webp';
import pieceEcruOr from '@/src/assets/products/piece-ecru-or.webp';
import pieceFauve from '@/src/assets/products/piece-fauve.webp';
import pieceNoirFleuri from '@/src/assets/products/piece-noir-fleuri.webp';
import pieceTaupeFleuri from '@/src/assets/products/piece-taupe-fleuri.webp';
import satinImprime from '@/src/assets/products/satin-imprime.webp';

export const CATEGORIES: Category[] = [
  { id: 'piece_unique', name: 'Pièce unique' },
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
    createdAt: '2026-01-05T10:25:00.000Z',
  },
  {
    id: 'satin-imprime',
    slug: 'hijab-satin-imprime',
    name: 'Satin imprimé',
    description:
      "Satin fluide aux imprimés colorés, avec ce léger reflet qui habille immédiatement une tenue simple.",
    price: 3500,
    compareAtPrice: null,
    category: 'hijab',
    images: [satinImprime],
    variants: [],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:05:00.000Z',
  },
  {
    id: 'modal-simple',
    slug: 'hijab-modal-simple',
    name: 'Modal simple',
    description:
      "Modal uni, doux et respirant, très léger à porter. Un drapé souple qui reste impeccable toute la journée.",
    price: 4500,
    compareAtPrice: null,
    category: 'hijab',
    images: [modalSimple],
    variants: [],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:10:00.000Z',
  },
  {
    id: 'modal-imprime',
    slug: 'hijab-modal-imprime',
    name: 'Modal imprimé',
    description:
      "Le confort du modal avec un imprimé travaillé. Vendu à l'unité.",
    price: 5500,
    compareAtPrice: null,
    category: 'hijab',
    images: [modalImprime],
    variants: [],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:15:00.000Z',
  },
  {
    id: 'dentelle',
    slug: 'hijab-dentelle',
    name: 'Dentelle',
    description:
      "Hijab bordé de dentelle, pour les occasions : cérémonies, fêtes, invitations. Disponible en noir et en blanc.",
    price: 5000,
    compareAtPrice: null,
    category: 'hijab',
    images: [dentelle],
    variants: [{ name: 'Couleur', options: ['Noir', 'Blanc'] }],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'piece-noir-fleuri',
    slug: 'piece-noir-fleuri',
    name: "Pièce unique · Noir fleuri",
    description:
      "Fond gris profond couvert d'un motif floral noir en relief. Un modèle habillé, qui se suffit à lui-même sur une tenue sobre.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    images: [pieceNoirFleuri],
    variants: [],
    // Chaque modèle existe en un seul exemplaire : une fois parti, il disparaît
    // de la boutique. Ajustable depuis /admin si un modèle revient.
    stock: 1,
    status: 'active',
    createdAt: '2026-01-05T10:34:00.000Z',
  },
  {
    id: 'piece-creme-fleuri',
    slug: 'piece-creme-fleuri',
    name: "Pièce unique · Crème fleuri",
    description:
      "Crème à maille texturée, semé de fleurs noires. La version claire du modèle fleuri, pour les soirées et les cérémonies.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    images: [pieceCremeFleuri],
    variants: [],
    // Chaque modèle existe en un seul exemplaire : une fois parti, il disparaît
    // de la boutique. Ajustable depuis /admin si un modèle revient.
    stock: 1,
    status: 'active',
    createdAt: '2026-01-05T10:33:00.000Z',
  },
  {
    id: 'piece-taupe-fleuri',
    slug: 'piece-taupe-fleuri',
    name: "Pièce unique · Taupe fleuri",
    description:
      "Taupe clair à motif floral sombre, tissage gaufré. Se marie avec le noir comme avec le beige.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    images: [pieceTaupeFleuri],
    variants: [],
    // Chaque modèle existe en un seul exemplaire : une fois parti, il disparaît
    // de la boutique. Ajustable depuis /admin si un modèle revient.
    stock: 1,
    status: 'active',
    createdAt: '2026-01-05T10:32:00.000Z',
  },
  {
    id: 'piece-fauve',
    slug: 'piece-fauve',
    name: "Pièce unique · Fauve",
    description:
      "Imprimé animalier brun et sable, tombé fluide. Le modèle qui suffit à réveiller une tenue unie.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    images: [pieceFauve],
    variants: [],
    // Chaque modèle existe en un seul exemplaire : une fois parti, il disparaît
    // de la boutique. Ajustable depuis /admin si un modèle revient.
    stock: 1,
    status: 'active',
    createdAt: '2026-01-05T10:31:00.000Z',
  },
  {
    id: 'piece-ecru-or',
    slug: 'piece-ecru-or',
    name: "Pièce unique · Écru & or",
    description:
      "Écru parsemé de touches noires et dorées, matière légère. Pensé pour les journées chaudes et la lumière du dehors.",
    price: 6000,
    compareAtPrice: null,
    category: 'piece_unique',
    images: [pieceEcruOr],
    variants: [],
    // Chaque modèle existe en un seul exemplaire : une fois parti, il disparaît
    // de la boutique. Ajustable depuis /admin si un modèle revient.
    stock: 1,
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
