import type { Category, Product } from '@/src/types';

import abayaBeigeLeopard from '@/src/assets/products/abaya-beige-leopard.webp';
import abayaBleuDelave from '@/src/assets/products/abaya-bleu-delave.webp';
import abayaBleuZebre from '@/src/assets/products/abaya-bleu-zebre.webp';
import abayaKakiMarbre from '@/src/assets/products/abaya-kaki-marbre.webp';
import abayaLeopardFauve from '@/src/assets/products/abaya-leopard-fauve.webp';
import abayaLeopardFauveDos from '@/src/assets/products/abaya-leopard-fauve-dos.webp';
import abayaMarbre from '@/src/assets/products/abaya-marbre.webp';
import abayaNoir from '@/src/assets/products/abaya-noir.webp';
import abayaNoirBlanc from '@/src/assets/products/abaya-noir-blanc.webp';
import abayaPrunePlisse from '@/src/assets/products/abaya-prune-plisse.webp';
import abayaRoseCachemire from '@/src/assets/products/abaya-rose-cachemire.webp';
import dentelleBrunRose from '@/src/assets/products/dentelle-brun-rose.webp';
import dentelleColoris from '@/src/assets/products/dentelle-coloris.webp';
import dentelleNoirBlanc from '@/src/assets/products/dentelle-noir-blanc.webp';
import dentelleNoirRose from '@/src/assets/products/dentelle-noir-rose.webp';
import hijabTape from '@/src/assets/products/hijab-tape.webp';
import jerseyBrun from '@/src/assets/products/jersey-brun.webp';
import jerseyNoir from '@/src/assets/products/jersey-noir.webp';
import jerseyNoirTotal from '@/src/assets/products/jersey-noir-total.webp';
import jerseyNude from '@/src/assets/products/jersey-nude.webp';
import jerseyVertCanard from '@/src/assets/products/jersey-vert-canard.webp';
import jerseyFriseColoris from '@/src/assets/products/jersey-frise-coloris.webp';
import jerseyFriseVolants from '@/src/assets/products/jersey-frise-volants.webp';
import mjBlanc from '@/src/assets/products/mj-blanc.webp';
import mjBrunCafe from '@/src/assets/products/mj-brun-cafe.webp';
import mjDimensions from '@/src/assets/products/mj-dimensions.webp';
import mjNoir from '@/src/assets/products/mj-noir.webp';
import mjRosePoudre from '@/src/assets/products/mj-rose-poudre.webp';
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
import viscoseBordeaux from '@/src/assets/products/viscose-bordeaux.webp';
import viscoseEcru from '@/src/assets/products/viscose-ecru.webp';
import viscoseKhaki from '@/src/assets/products/viscose-khaki.webp';
import viscoseNoir from '@/src/assets/products/viscose-noir.webp';

export const CATEGORIES: Category[] = [
  { id: 'abaya', name: 'Abaya' },
  { id: 'piece_unique', name: 'Pièce unique' },
  { id: 'voile_viscose', name: 'Viscose premium' },
  { id: 'voile_mj', name: 'Voile MJ' },
  { id: 'modal_imprime', name: 'Modal imprimé' },
  { id: 'modal_simple', name: 'Modal simple' },
  { id: 'satin_imprime', name: 'Satin imprimé' },
  { id: 'dentelle', name: 'Dentelle' },
  { id: 'jersey', name: 'Jersey' },
  { id: 'jersey_frise', name: 'Jersey frisé' },
  { id: 'hijab_tape', name: 'Hijab tape' },
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
    slug: 'jersey',
    name: 'Jersey',
    description:
      "Le hijab du quotidien. Maille jersey souple, tombé net, aucune épingle nécessaire. Choisissez votre teinte dans le nuancier ci-dessous.",
    price: 1500,
    compareAtPrice: null,
    category: 'jersey',
    images: [jerseyNoir, jerseyVertCanard, jerseyNude, jerseyBrun, jerseyNoirTotal],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:25:00.000Z',
  },
  {
    id: 'jersey-frise',
    slug: 'jersey-frise',
    name: 'Jersey frisé',
    description:
      "Jersey à bord frisé : la maille est terminée par des volants qui tiennent la forme et habillent le visage sans épingle. Faites défiler les photos pour voir le tombé et le détail du frisé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.",
    price: 2000,
    compareAtPrice: null,
    category: 'jersey_frise',
    images: [jerseyFriseColoris, jerseyFriseVolants],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'frise36',
    createdAt: '2026-01-05T10:30:00.000Z',
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
    createdAt: '2026-01-05T10:15:00.000Z',
  },
  {
    id: 'voile-mj',
    slug: 'voile-mj',
    name: 'Voile MJ',
    description:
      "Notre voile le plus fluide : un mélange de modal et de jersey. Il a la douceur et le tombé du modal, avec le maintien du jersey — il ne glisse pas et ne demande pas d'épingle. 170 × 60 cm. Faites défiler les photos pour voir le tombé, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.",
    price: 4500,
    compareAtPrice: null,
    category: 'voile_mj',
    images: [mjNoir, mjBlanc, mjRosePoudre, mjBrunCafe, mjDimensions],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:35:00.000Z',
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
    createdAt: '2026-01-05T10:05:00.000Z',
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
    createdAt: '2026-01-05T10:20:00.000Z',
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
    createdAt: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'voile-viscose',
    slug: 'voile-viscose',
    name: 'Voile viscose premium',
    description:
      "Ce n'est pas du modal : la viscose est une autre matière, nettement plus légère et plus aérienne. Le voile se pose presque sans poids, avec un tombé long et un léger effet froissé — parfait pour les journées chaudes. Faites défiler les photos pour voir le rendu, puis choisissez votre numéro de teinte dans le nuancier ci-dessous.",
    price: 6500,
    compareAtPrice: null,
    category: 'voile_viscose',
    images: [viscoseKhaki, viscoseBordeaux, viscoseEcru, viscoseNoir],
    variants: [],
    stock: null,
    status: 'active',
    colorChartId: 'modal36',
    createdAt: '2026-01-05T10:40:00.000Z',
  },
  {
    id: 'abaya',
    slug: 'abaya',
    name: 'Abaya',
    description:
      "Abayas longues, coupe ample et ouverte, à porter sur une tenue. Chaque modèle a son propre tissu et son propre imprimé. Faites défiler les photos pour les voir un par un, puis choisissez le vôtre — la coupe et la longueur vous sont confirmées sur WhatsApp avant la validation de la commande.",
    price: 15000,
    compareAtPrice: null,
    category: 'abaya',
    // L'ordre des photos suit exactement l'ordre des modèles ci-dessous :
    // faire défiler la galerie sélectionne le modèle correspondant.
    images: [
      abayaNoirBlanc,
      abayaBleuZebre,
      abayaRoseCachemire,
      abayaBeigeLeopard,
      abayaNoir,
      abayaMarbre,
      abayaBleuDelave,
      abayaPrunePlisse,
      abayaKakiMarbre,
      abayaLeopardFauve,
      abayaLeopardFauveDos,
    ],
    variants: [
      {
        name: 'Modèle',
        options: [
          'Noir & blanc plissé',
          'Bleu zébré',
          'Rose cachemire',
          'Beige léopard satiné',
          'Noir uni',
          'Marbré brun & écru',
          'Bleu délavé',
          'Prune plissé',
          'Kaki marbré',
          'Léopard fauve',
        ],
        // Un modèle épuisé se marque ici depuis /admin → Produits, avec « (épuisé) ».
        soldOutOptions: [],
        // Modèle montré par chaque photo, dans l'ordre des photos. Le léopard
        // fauve en a deux : une vue de face et une vue de dos.
        photoOptions: [
          'Noir & blanc plissé',
          'Bleu zébré',
          'Rose cachemire',
          'Beige léopard satiné',
          'Noir uni',
          'Marbré brun & écru',
          'Bleu délavé',
          'Prune plissé',
          'Kaki marbré',
          'Léopard fauve',
          'Léopard fauve',
        ],
      },
    ],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T10:45:00.000Z',
  },
  {
    id: 'hijab-tape',
    slug: 'hijab-tape',
    name: 'Hijab tape',
    description:
      "Les bandes adhésives double face qui remplacent les épingles : on colle, le voile reste en place toute la journée, et rien ne marque ni n'abîme le tissu. Un sachet contient plusieurs bandes.",
    price: 1000,
    compareAtPrice: null,
    category: 'hijab_tape',
    images: [hijabTape],
    variants: [],
    stock: null,
    status: 'active',
    createdAt: '2026-01-05T09:50:00.000Z',
  },
];

/**
 * Photos livrées avec le site, par identifiant d'article.
 *
 * Les images sont des fichiers du build, pas des URL stables : les stocker en
 * base n'aurait aucun sens, leur adresse change à chaque publication. Quand un
 * article vient de Supabase sans photo, on retombe donc sur celles-ci — et dès
 * que la boutique téléverse les siennes depuis l'admin, ce sont elles qui
 * priment.
 */
export const SEED_IMAGES: Record<string, string[]> = Object.fromEntries(
  SEED_PRODUCTS.map((product) => [product.id, product.images]),
);
