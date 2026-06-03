import { Product } from './types';

export const CATEGORIES = [
  { id: 'all', name: 'Toutes les créations' },
  { id: 'foulard_cotton', name: 'Foulards Coton' },
  { id: 'hijab_jersey', name: 'Hijabs Jersey' },
  { id: 'essentiels', name: 'Essentiels Modest' }
];

export const AVAILABLE_COLORS = [
  { name: 'Sable Naturel', hex: '#D2B48C', bgClass: 'bg-[#D2B48C]' },
  { name: 'Blanc Cassé', hex: '#FCF9F2', bgClass: 'bg-[#FCF9F2]' },
  { name: 'Café au Lait', hex: '#C2B280', bgClass: 'bg-[#C2B280]' },
  { name: 'Taupe Luxueux', hex: '#8B8589', bgClass: 'bg-[#8B8589]' },
  { name: 'Ébène Noir', hex: '#111111', bgClass: 'bg-[#111111]' },
  { name: 'Charbon Doux', hex: '#4A4A4A', bgClass: 'bg-[#4A4A4A]' },
  { name: 'Argile Blush', hex: '#E8D3C3', bgClass: 'bg-[#E8D3C3]' }
];

export const PRODUCTS: Product[] = [
  {
    id: 'foulard-sable-divin',
    name: "Foulard Coton 'Sable Divin'",
    price: 42,
    category: 'foulard_cotton',
    categoryLabel: 'Foulards Coton',
    image: '/src/assets/images/foulard_coton_sable_1780455334087.png',
    images: [
      '/src/assets/images/foulard_coton_sable_1780455334087.png',
      '/src/assets/images/hero_modest_banner_1780455318951.png'
    ],
    description: 'Un drapé d\'une légèreté et d\'une fluidité exceptionnelles.',
    longDescription: 'Le Foulard Coton Sable Divin incarne le luxe discret du quotidien. Tissé à partir de fibres de coton 100% premium brossé respirant et hypoallergénique, il offre une souplesse divine et un drapé naturel qui s\'associera à merveille avec vos silhouettes intemporelles.',
    sizes: ['1m60', '1m80', '2m10'],
    colors: [
      { name: 'Sable Naturel', hex: '#D2B48C', bgClass: 'bg-[#D2B48C]' },
      { name: 'Blanc Cassé', hex: '#FCF9F2', bgClass: 'bg-[#FCF9F2]' },
      { name: 'Café au Lait', hex: '#C2B280', bgClass: 'bg-[#C2B280]' }
    ],
    fabric: '100% Coton Premium peigné, tissage artisanal',
    isNew: true,
    isPopular: true
  },
  {
    id: 'jersey-supreme-taupe',
    name: 'Jersey Suprême Taupe',
    price: 38,
    category: 'hijab_jersey',
    categoryLabel: 'Hijabs Jersey',
    image: '/src/assets/images/hijab_jersey_premium_1780455349520.png',
    images: [
      '/src/assets/images/hijab_jersey_premium_1780455349520.png',
      '/src/assets/images/hero_modest_banner_1780455318951.png'
    ],
    description: 'Le confort absolu d\'un jersey premium extensible à la tenue irréprochable.',
    longDescription: 'Notre Jersey Suprême est tricoté à partir de coton sélectionné de qualité supérieure avec une infime quantité d\'élasthanne pour assurer une élasticité naturelle et résiliente, sans déformation. Ne nécessite aucune épingle pour rester en place tout au long de la journée active.',
    sizes: ['1m80', '2m10'],
    colors: [
      { name: 'Taupe Luxueux', hex: '#8B8589', bgClass: 'bg-[#8B8589]' },
      { name: 'Sable Naturel', hex: '#D2B48C', bgClass: 'bg-[#D2B48C]' },
      { name: 'Charbon Doux', hex: '#4A4A4A', bgClass: 'bg-[#4A4A4A]' }
    ],
    fabric: 'Jersey de coton de luxe extensible et thermorégulateur',
    isPopular: true
  },
  {
    id: 'voile-coton-blanc',
    name: "Voile Coton d'Orient Blanc",
    price: 35,
    category: 'essentiels',
    categoryLabel: 'Essentiels Modest',
    image: '/src/assets/images/voile_essentiel_blanc_1780455365335.png',
    images: [
      '/src/assets/images/voile_essentiel_blanc_1780455365335.png',
      '/src/assets/images/foulard_coton_sable_1780455334087.png'
    ],
    description: 'Un voile aérien, d\'une douceur veloutée pour un porter raffiné et discret.',
    longDescription: 'Alliant pudeur et légèreté respirante, le voile d\'Orient est conçu dans un tissage de coton particulièrement fluide, assurant de l\'élégance pour les saisons chaudes comme froides. Sa luminosité blanche fait ressortir les teints les plus radieux.',
    sizes: ['1m60', '1m80', '2m00'],
    colors: [
      { name: 'Blanc Cassé', hex: '#FCF9F2', bgClass: 'bg-[#FCF9F2]' },
      { name: 'Argile Blush', hex: '#E8D3C3', bgClass: 'bg-[#E8D3C3]' }
    ],
    fabric: '100% Mousseline de coton premium ultra-respirante',
    isNew: true
  },
  {
    id: 'foulard-ebene-profond',
    name: 'Foulard Coton Ébène Profond',
    price: 45,
    category: 'foulard_cotton',
    categoryLabel: 'Foulards Coton',
    image: '/src/assets/images/accessoire_foulard_noir_1780455383236.png',
    images: [
      '/src/assets/images/accessoire_foulard_noir_1780455383236.png',
      '/src/assets/images/hijab_jersey_premium_1780455349520.png'
    ],
    description: 'L\'élégance suprême du noir absolu en pur coton d\'exception.',
    longDescription: 'Pour celles qui privilégient un minimalisme rigoureux et profond. Ce foulard en coton égyptien longue-fibre offre un noir d\'encre dense et élégant. Sa structure légère mais opaque assure une pudeur optimale et une sophistication instantanée.',
    sizes: ['1m80', '2m10'],
    colors: [
      { name: 'Ébène Noir', hex: '#111111', bgClass: 'bg-[#111111]' },
      { name: 'Charbon Doux', hex: '#4A4A4A', bgClass: 'bg-[#4A4A4A]' }
    ],
    fabric: '100% Coton égyptien longue fibre à tissage structuré',
    isPopular: true
  },
  {
    id: 'jersey-onyx-noir',
    name: 'Jersey Iconique Onyx',
    price: 38,
    category: 'hijab_jersey',
    categoryLabel: 'Hijabs Jersey',
    image: '/src/assets/images/accessoire_foulard_noir_1780455383236.png', // Fallback black jersey look
    images: [
      '/src/assets/images/accessoire_foulard_noir_1780455383236.png'
    ],
    description: 'Le jersey lourd de tous les jours, mat, infroissable et chic.',
    longDescription: 'Idéal pour le travail ou le voyage, le Jersey Iconique Onyx offre un tombé lourd sans égal. Sa couleur noire opaque et profonde s\'associe avec n\'importe quelle tenue pour conférer à votre style une élégance souveraine immédiate.',
    sizes: ['1m80', '2m00', '2m10'],
    colors: [
      { name: 'Ébène Noir', hex: '#111111', bgClass: 'bg-[#111111]' },
      { name: 'Charbon Doux', hex: '#4A4A4A', bgClass: 'bg-[#4A4A4A]' }
    ],
    fabric: 'Jersey de coton lourd extensible infroissable',
    isNew: false
  },
  {
    id: 'sous-hijab-seconde-peau',
    name: 'Sous-Hijab "Seconde Peau"',
    price: 18,
    category: 'essentiels',
    categoryLabel: 'Essentiels Modest',
    image: '/src/assets/images/voile_essentiel_blanc_1780455365335.png', // Nice clean drape
    images: [
      '/src/assets/images/voile_essentiel_blanc_1780455365335.png'
    ],
    description: 'Le sous-bonnet respirant indispensable pour une tenue et un confort impeccables.',
    longDescription: 'Ce bonnet ergonomique invisible glisse délicatement sur vos cheveux pour les bloquer tout en préservant le bulbe capillaire. Réalisé sans coutures abrasives en coton biologique peigné de haute qualité, il assure un port agréable qui ne provoque aucune migraine.',
    sizes: ['Unique'],
    colors: [
      { name: 'Argile Blush', hex: '#E8D3C3', bgClass: 'bg-[#E8D3C3]' },
      { name: 'Blanc Cassé', hex: '#FCF9F2', bgClass: 'bg-[#FCF9F2]' },
      { name: 'Ébène Noir', hex: '#111111', bgClass: 'bg-[#111111]' }
    ],
    fabric: '100% Coton peigné biologique et hypoallergénique',
    isNew: true
  }
];
