import type { Category, Product } from '@/src/types';

import dentelle from '@/src/assets/products/dentelle.webp';
import hijabTape from '@/src/assets/products/hijab-tape.webp';
import jersey from '@/src/assets/products/jersey.webp';
import jerseyFrise from '@/src/assets/products/jersey-frise.webp';
import modalImprime from '@/src/assets/products/modal-imprime.webp';
import modalSimple from '@/src/assets/products/modal-simple.webp';
import pieceUnique from '@/src/assets/products/piece-unique.webp';
import satinImprime from '@/src/assets/products/satin-imprime.webp';

export const CATEGORIES: Category[] = [
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
    id: 'piece-unique',
    slug: 'hijab-piece-unique',
    name: 'Pièce unique',
    description:
      "Modèle rare, texturé et imprimé, reçu en très petite quantité. Écrivez-nous pour vérifier ce qu'il reste avant de commander.",
    price: 6000,
    compareAtPrice: null,
    category: 'hijab',
    images: [pieceUnique],
    variants: [],
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
