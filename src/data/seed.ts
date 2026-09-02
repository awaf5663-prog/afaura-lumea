import type { Category, Product } from '@/src/types';

import adaptateurUsb from '@/src/assets/products/adaptateur-usb.webp';
import bicsSouligneurs from '@/src/assets/products/bics-souligneurs.webp';
import blocNote from '@/src/assets/products/bloc-note.webp';
import classeur from '@/src/assets/products/classeur.webp';
import coqueTelephone from '@/src/assets/products/coque-telephone.webp';
import gourde from '@/src/assets/products/gourde.webp';
import miniGourde from '@/src/assets/products/mini-gourde.webp';
import miroir from '@/src/assets/products/miroir.webp';
import pack5ens1 from '@/src/assets/products/pack5ens-1.webp';
import pack5ens2 from '@/src/assets/products/pack5ens-2.webp';
import pack5ens3 from '@/src/assets/products/pack5ens-3.webp';
import pack5ts1 from '@/src/assets/products/pack5ts-1.webp';
import pack5ts2 from '@/src/assets/products/pack5ts-2.webp';
import pack5ts3 from '@/src/assets/products/pack5ts-3.webp';
import pack5ts4 from '@/src/assets/products/pack5ts-4.webp';
import pack5ts5 from '@/src/assets/products/pack5ts-5.webp';
import pack71 from '@/src/assets/products/pack7-1.webp';
import pack72 from '@/src/assets/products/pack7-2.webp';
import pack73 from '@/src/assets/products/pack7-3.webp';
import pack8a1 from '@/src/assets/products/pack8a-1.webp';
import pack8a2 from '@/src/assets/products/pack8a-2.webp';
import pack8a3 from '@/src/assets/products/pack8a-3.webp';
import pack8b1 from '@/src/assets/products/pack8b-1.webp';
import pack8b2 from '@/src/assets/products/pack8b-2.webp';
import pack8b3 from '@/src/assets/products/pack8b-3.webp';
import protecOrdinateur from '@/src/assets/products/protec-ordinateur.webp';
import sacOrdinateur from '@/src/assets/products/sac-ordinateur.webp';
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
  /*
   * Cadre portrait, comme les voiles. On a essayé le carré « photo entière » :
   * les photos de la boutique sont des captures d'écran bordées de bandes
   * noires, et le carré les montrait justement en entier. Le portrait les
   * recadre, et c'est ce qu'on veut ici.
   */
  { id: 'rentree', name: 'Rentrée' },
  /*
   * Prêt-à-porter vendu par lots. Chaque photo montre une tenue du lot,
   * détourée sur le fond beige des visuels : cadre carré et vue entière, pour
   * qu'un pantalon long ne soit pas coupé aux chevilles.
   */
  { id: 'packs', name: 'Packs', photo: 'carre' },
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

/*
 * Rentrée. Prix et intitulés repris de la liste « FAC 🎓 » de la boutique.
 * Deux articles sont en brouillon — donc invisibles sur le site — parce que
 * leur prix n'était pas lisible sur la liste : le sac ordinateur, dont la
 * ligne était coupée, et la mini-gourde, sans prix indiqué. La boutique les
 * renseigne et les publie depuis /admin → Produits.
 *
 * Les visuels viennent des vignettes de la liste : environ 230 px d'origine,
 * agrandis. À remplacer par de vraies photos dès que possible.
 */
  {
    id: 'bics-souligneurs',
    slug: 'bics-souligneurs',
    name: 'Bics et souligneurs',
    description:
      "Lot de 6 stylos et souligneurs, coloris rose. Commandé pour vous et acheminé avec le prochain groupage.",
    price: 550,
    compareAtPrice: null,
    category: 'rentree',
    images: [bicsSouligneurs],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:00:00.000Z',
  },
  {
    id: 'classeur',
    slug: 'classeur',
    name: 'Classeur à soufflets',
    description:
      "Classeur à compartiments pour trier cours, feuilles et documents, coloris rose. Planche d'étiquettes de couleur fournie.",
    price: 1000,
    compareAtPrice: null,
    category: 'rentree',
    images: [classeur],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:01:00.000Z',
  },
  {
    id: 'protec-ordinateur',
    slug: 'protec-ordinateur',
    name: 'Protection de clavier',
    description:
      "Film souple à poser sur le clavier de l’ordinateur, coloris rose translucide, contre la poussière et les éclaboussures. Précisez le modèle de votre ordinateur au moment de commander.",
    price: 1000,
    compareAtPrice: null,
    category: 'rentree',
    images: [protecOrdinateur],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:02:00.000Z',
  },
  {
    id: 'coque-telephone',
    slug: 'coque-telephone',
    name: 'Coque de téléphone',
    description:
      "Coque transparente, motif squelette et fleurs. Précisez le modèle de votre téléphone au moment de commander : nous confirmons la disponibilité avant paiement.",
    price: 1500,
    compareAtPrice: null,
    category: 'rentree',
    images: [coqueTelephone],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:03:00.000Z',
  },
  {
    id: 'adaptateur-usb',
    slug: 'adaptateur-usb',
    name: 'Adaptateur USB',
    description:
      "Adaptateur pour brancher une clé USB ou un disque sur téléphone et tablette, coloris lilas. Précisez le type de prise de votre appareil au moment de commander.",
    price: 3000,
    compareAtPrice: null,
    category: 'rentree',
    images: [adaptateurUsb],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:04:00.000Z',
  },
  {
    id: 'gourde',
    slug: 'gourde',
    name: 'Gourde',
    description:
      "Gourde isotherme pour la journée de cours. Plusieurs coloris : précisez celui que vous souhaitez, nous confirmons la disponibilité.",
    price: 3500,
    compareAtPrice: null,
    category: 'rentree',
    images: [gourde],
    variants: [{ name: 'Couleur', options: ['Rose', 'Blanc', 'Noir'] }],
    stock: null,
    status: 'active',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-08-30T11:05:00.000Z',
  },
  {
    id: 'bloc-note',
    slug: 'bloc-note',
    name: 'Bloc-notes',
    description:
      "Carnet à spirale, couverture rigide gravée, coloris rose. Pour les cours, les listes ou le planning de la semaine.",
    price: 4000,
    compareAtPrice: null,
    category: 'rentree',
    images: [blocNote],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:06:00.000Z',
  },
  {
    id: 'miroir',
    slug: 'miroir',
    name: 'Miroir',
    description:
      "Petit miroir à poser, cadre ondulé, coloris rose poudré. Pour le bureau, la chambre ou la table de chevet.",
    price: 400,
    compareAtPrice: null,
    category: 'rentree',
    images: [miroir],
    variants: [],
    stock: null,
    status: 'active',
    isNew: true,
    createdAt: '2026-08-30T11:07:00.000Z',
  },
  {
    id: 'sac-ordinateur',
    slug: 'sac-ordinateur',
    name: 'Sac ordinateur',
    description:
      "Housse matelassée pour ordinateur portable. Précisez la taille de votre écran au moment de commander.",
    price: 10000,
    compareAtPrice: null,
    category: 'rentree',
    images: [sacOrdinateur],
    variants: [{ name: 'Couleur', options: ['Blanc', 'Noir', 'Rose'] }],
    stock: null,
    status: 'draft',
    isNew: true,
    createdAt: '2026-08-30T11:08:00.000Z',
  },
  {
    id: 'mini-gourde',
    slug: 'mini-gourde',
    name: 'Mini-gourde',
    description:
      "Petite gourde isotherme à emporter. Plusieurs coloris : précisez celui que vous souhaitez, nous confirmons la disponibilité.",
    price: 0,
    compareAtPrice: null,
    category: 'rentree',
    images: [miniGourde],
    variants: [{ name: 'Couleur', options: ['Crème', 'Rose poudré', 'Lilas'] }],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-08-30T11:09:00.000Z',
  },
  /*
   * Packs de prêt-à-porter, repris des visuels de la boutique. Une photo par
   * tenue, dans l'ordre des tenues : la galerie choisit alors la tenue, et
   * chacune peut porter son propre prix (voir lib/optionPrice).
   *
   * Livrés en brouillon, à 0 FCFA : les prix ne sont pas encore arrêtés et on
   * n'en invente pas. Ils restent invisibles pour les clientes tant que la
   * boutique ne les a pas fixés depuis l'administration.
   */
  {
    id: 'pack-8-tops-flare',
    slug: 'pack-8-tops-flare',
    name: 'Pack 8 — Tops drapés & flare',
    description:
      "Trois tenues : top asymétrique drapé à pan tombant, et pantalon flare taille haute à boucle dorée.\n(1) Bold & Sleek — noir. Existe aussi en crème et bordeaux.\n(2) Soft & Flow — blanc. Existe aussi en marron, crème, bordeaux et noir.\n(3) Wild & Chic — top léopard, pantalon crème. Existe aussi en noir, crème, orange et marron.\nChoisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.",
    price: 0,
    compareAtPrice: null,
    category: 'packs',
    images: [pack8a1, pack8a2, pack8a3],
    variants: [{ name: 'Tenue', options: ['Bold & Sleek', 'Soft & Flow', 'Wild & Chic'] }],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-09-02T11:00:00.000Z',
  },
  {
    id: 'pack-8-tshirts-jupes',
    slug: 'pack-8-tshirts-jupes',
    name: 'Pack 8 — T-shirts, flare & jupes',
    description:
      "Trois tenues : haut ajusté drapé, avec pantalon flare ou jupe sirène.\n(1) Bold & Sleek — t-shirt drapé noir ou bordeaux, pantalon flare crème, bordeaux ou noir ; jupe assortie disponible.\n(2) Soft & Flow — haut col montant blanc ou noir, jupe sirène léopard, marron ou noire.\n(3) Sweet & Feminine — haut blanc, rose ou fleuri, jupe sirène léopard, fleurie ou rose.\nChoisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.",
    price: 0,
    compareAtPrice: null,
    category: 'packs',
    images: [pack8b1, pack8b2, pack8b3],
    variants: [{ name: 'Tenue', options: ['Bold & Sleek', 'Soft & Flow', 'Sweet & Feminine'] }],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-09-02T11:01:00.000Z',
  },
  {
    id: 'pack-7',
    slug: 'pack-7',
    name: 'Pack 7 — Chemises & jean',
    description:
      "Trois tenues autour du jean.\n(1) Soft Pink Chic — chemise rayée rose froncée, jean large brodé de fleurs. Chemise aussi en beige, blanc et rose.\n(2) Sunny Yellow Vibes — chemise jaune, débardeur blanc, bermuda en jean. Chemise aussi en rayé rose et rayé noir.\n(3) Clean & Sweet — haut rose à col carré, jean large brodé. Haut aussi en blanc, bleu ciel et noir.\nChoisissez la tenue ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.",
    price: 0,
    compareAtPrice: null,
    category: 'packs',
    images: [pack71, pack72, pack73],
    variants: [
      { name: 'Tenue', options: ['Soft Pink Chic', 'Sunny Yellow Vibes', 'Clean & Sweet'] },
    ],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-09-02T11:02:00.000Z',
  },
  {
    id: 'pack-5-ensembles',
    slug: 'pack-5-ensembles',
    name: 'Pack 5 — Ensembles chic',
    description:
      "Trois ensembles assortis, deux pièces chacun.\n(1) Chemise blanche à nouer, pantalon large coffee brown.\n(2) Chemise marron à carreaux, pantalon large noir.\n(3) Ensemble bleu : top et jupe fluide fendue.\nChoisissez l'ensemble ci-dessus. Pour un coloris absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.",
    price: 0,
    compareAtPrice: null,
    category: 'packs',
    images: [pack5ens1, pack5ens2, pack5ens3],
    variants: [
      {
        name: 'Ensemble',
        options: [
          'Chemise blanche + pantalon marron',
          'Chemise à carreaux + pantalon noir',
          'Ensemble bleu top + jupe',
        ],
      },
    ],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-09-02T11:03:00.000Z',
  },
  {
    id: 'pack-5-tshirts',
    slug: 'pack-5-tshirts',
    name: 'Pack 5 — T-shirts sport',
    description:
      "Cinq trios de t-shirts imprimés, esprit varsity et sport américain.\n(1) NY Varsity — New York marine, 80 rose, Brooklyn blanc.\n(2) Legendary 01 — 01 rose, California crème, Chicago noir.\n(3) Vintage Sport — 01 bordeaux, 98 marron, 23 léopard.\n(4) Athletic Chic — Los Angeles 91 noir, California 08 rose, Hawaii 86 blanc.\n(5) Retro Racing — Switch 07 noir, Speedway 23 rose, Racing 07 noir.\nChoisissez le trio ci-dessus. Pour un modèle absent des photos, dites-le nous : nous confirmons la disponibilité avant paiement.",
    price: 0,
    compareAtPrice: null,
    category: 'packs',
    images: [pack5ts1, pack5ts2, pack5ts3, pack5ts4, pack5ts5],
    variants: [
      {
        name: 'Trio',
        options: ['NY Varsity', 'Legendary 01', 'Vintage Sport', 'Athletic Chic', 'Retro Racing'],
      },
    ],
    stock: null,
    status: 'draft',
    isNew: true,
    otherColorsAvailable: true,
    createdAt: '2026-09-02T11:04:00.000Z',
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
