/** Types partagés par toute l'application (front, services, admin). */

export type ProductStatus = 'active' | 'draft' | 'sold_out';

/** Une teinte du nuancier fournisseur, identifiée par son numéro. */
export interface ColorSwatch {
  code: string;
  /** Teinte moyenne, utilisée seule quand aucune photo n'accompagne la pastille. */
  hex: string;
  /** Photo de la matière dans cette teinte : plus juste qu'un aplat pour la dentelle. */
  image?: string;
  name?: string;
}

export interface ColorChart {
  id: string;
  label: string;
  swatches: ColorSwatch[];
  /** Précision affichée sous le nuancier quand la matière demande une nuance. */
  note?: string;
}

export interface ProductVariantGroup {
  /** ex : "Modèle", "Couleur", "Taille" */
  name: string;
  options: string[];
  /** Options momentanément indisponibles : affichées barrées, impossibles à commander. */
  soldOutOptions?: string[];
  /**
   * Modèle correspondant à chaque photo, dans l'ordre des photos.
   *
   * Sans ça, la galerie ne se synchronise avec les options que s'il y a
   * exactement autant de photos que de modèles. Avec ça, un modèle peut avoir
   * plusieurs photos — une vue de face et une vue de dos, par exemple.
   */
  photoOptions?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  /** Prix unitaire en FCFA (entier, jamais de centimes). */
  price: number;
  /** Ancien prix barré, en FCFA. Uniquement si la promotion est réelle. */
  compareAtPrice?: number | null;
  category: string;
  images: string[];
  variants: ProductVariantGroup[];
  /** null = stock non suivi (article réapprovisionné à la demande). */
  stock: number | null;
  status: ProductStatus;
  isNew?: boolean;
  isPopular?: boolean;
  /**
   * D'autres coloris existent hors des photos publiées : la cliente peut
   * préciser celui qu'elle cherche, et nous confirmons la disponibilité.
   */
  otherColorsAvailable?: boolean;
  /** Nuancier rattaché : la cliente choisit un numéro de teinte. */
  colorChartId?: string | null;
  /**
   * Prix propre à certaines options, en FCFA.
   *
   * Forme : { "Format": { "Lot de 4": 550, "Lot de 12": 1200 } }
   *
   * Le même article peut se vendre en plusieurs conditionnements : un paquet
   * de 4 crayons n'a pas le prix d'un paquet de 12. L'option choisie porte
   * alors son propre prix, et `price` sert de valeur par défaut pour les
   * options qui n'en ont pas.
   *
   * Un SEUL groupe devrait porter des prix : si plusieurs en portaient, le
   * montant dépendrait de l'ordre des groupes, ce qui n'aurait aucun sens
   * pour la cliente. Le serveur, lui, tranche de façon déterministe (voir
   * create_order dans supabase/schema.sql).
   *
   * ⚠️ Ce n'est PAS ce que le navigateur envoie. Il ne transmet qu'un
   * libellé d'option ; le montant est relu ici, côté serveur.
   */
  optionPrices?: Record<string, Record<string, number>>;
  /**
   * Mesures réelles de l'article, saisies depuis l'administration.
   *
   * Jamais de valeur inventée ici : tant que la boutique n'a pas mesuré la
   * pièce, la fiche n'affiche pas de tableau plutôt qu'un chiffre approximatif
   * sur lequel une cliente choisirait sa taille.
   */
  measurements?: ProductMeasurement[];
  createdAt: string;
}

/** Une ligne du tableau de mesures : « Longueur totale » → « 140 cm ». */
export interface ProductMeasurement {
  label: string;
  value: string;
}

/**
 * Avis d'une cliente, saisi par la boutique après accord de l'intéressée.
 *
 * Il n'y a pas de formulaire public : un avis n'apparaît que si la boutique
 * l'a réellement reçu et l'a recopié. Aucun avis n'est généré ni inventé.
 */
export interface Review {
  id: string;
  customerName: string;
  /** Ville de la cliente. Vide = non précisée. */
  city: string;
  /** 1 à 5. */
  rating: number;
  text: string;
  /** Article concerné, si l'avis en vise un. Vide = avis sur la boutique. */
  productId: string;
  /** Date de l'avis (ISO). */
  date: string;
  published: boolean;
}

export interface Category {
  /**
   * Cadrage des photos de la catégorie.
   *
   * `portrait` (défaut) : photo recadrée en 3/4, comme un voile porté par un
   * mannequin — on remplit le cadre, quitte à rogner les bords.
   * `carre` : photo entière dans un carré, sans rien rogner. C'est ce qu'il
   * faut pour des articles photographiés sur fond neutre — une gourde
   * recadrée en portrait perdait son bouchon ou son pied.
   */
  photo?: 'portrait' | 'carre';
  id: string;
  name: string;
}

export interface CartItem {
  /** productId + variantes sélectionnées, sert de clé unique en panier. */
  key: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  unitPrice: number;
  quantity: number;
  /** { Couleur: "Noir", Taille: "1m80" } */
  options: Record<string, string>;
}

export type OrderStatus =
  | 'received'
  | 'payment_confirmed'
  | 'grouped'
  | 'in_transit'
  | 'arrived'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'proof_sent' | 'confirmed' | 'refused';

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  options: Record<string, string>;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  deliveryZoneId: string;
  deliveryLabel: string;
  /** null = frais non encore paramétrés, à confirmer avec la cliente. */
  deliveryFee: number | null;
  subtotal: number;
  /**
   * Frais de traitement, calculés par la base d'après la grille des réglages
   * et le nombre d'articles. 0 = aucun. Voir PricingConfig.tiers.
   */
  serviceFee: number;
  /** Frais de livraison avant promotion, quand une offre les a annulés. */
  deliveryFeeBeforePromotion?: number | null;
  /** Remise appliquée, en FCFA. 0 = aucune. */
  discount: number;
  /** Nom de l'offre appliquée, pour l'afficher à la cliente. */
  promotionLabel: string | null;
  /** Code saisi par la cliente, tel quel. Vide = aucun. */
  promoCode: string;
  /** subtotal + serviceFee + deliveryFee − discount (deliveryFee null compté comme 0, l'UI le signale). */
  total: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  /**
   * Mise à la corbeille. null = ligne active.
   *
   * Rien n'est effacé par une mise à la corbeille : une commande porte de
   * l'argent et un engagement pris auprès d'une cliente. Elle se restaure
   * tant que la boutique n'a pas vidé la corbeille elle-même.
   */
  deletedAt?: string | null;
}

export interface SheinItem {
  productUrl: string;
  reference: string;
  size: string;
  color: string;
  quantity: number;
  /** Prix affiché sur SHEIN, sous forme lisible (« 12,99 € »). Dérivé des deux champs suivants. */
  displayedPrice: string;
  /** Montant saisi par la cliente. null = elle ne l'a pas renseigné. */
  priceAmount: number | null;
  /** Devise du montant saisi : 'XOF', 'EUR', 'USD'… */
  priceCurrency: string;
  /** Nom du fichier de capture d'écran, transmis ensuite sur WhatsApp. */
  screenshotName?: string;
  /** Aperçu compressé (data URL) visible dans l'espace admin. */
  screenshotData?: string;
}

export type SheinStatus =
  | 'received'
  | 'quoted'
  | 'payment_confirmed'
  | 'grouped'
  | 'in_transit'
  | 'arrived'
  | 'ready'
  | 'delivered'
  | 'cancelled';

export interface SheinRequest {
  id: string;
  requestNumber: string;
  customerName: string;
  phone: string;
  note?: string;
  items: SheinItem[];
  status: SheinStatus;
  /** Montant en FCFA confirmé par l'équipe après vérification. null tant qu'il n'est pas établi. */
  quotedTotal: number | null;
  /** Groupage auquel la demande est rattachée. null = aucun groupage ouvert au moment de l'envoi. */
  groupingId: string | null;
  /** Estimation calculée à la réception, à partir des tarifs en vigueur. Jamais définitive. */
  quote: Quote | null;
  /** Option de livraison choisie par la cliente. */
  deliveryOptionId: string;
  /**
   * La cliente s'est déclarée étudiante. C'est une déclaration, pas une
   * vérification : le site ne contrôle aucune carte. La boutique confirme
   * avant d'accorder l'offre, et le site le dit à la cliente.
   */
  isStudent: boolean;
  /** Code promo saisi par la cliente, tel quel. Vide = aucun. */
  promoCode: string;
  createdAt: string;
  updatedAt: string;
  /**
   * Mise à la corbeille. null = ligne active.
   *
   * Rien n'est effacé par une mise à la corbeille : une commande porte de
   * l'argent et un engagement pris auprès d'une cliente. Elle se restaure
   * tant que la boutique n'a pas vidé la corbeille elle-même.
   */
  deletedAt?: string | null;
}

/* ─────────────────────────────────────────────────────────────
   Tarification du service SHEIN
   ───────────────────────────────────────────────────────────── */

/** Tranche de frais de traitement selon le nombre d'articles. */
export interface ServiceFeeTier {
  id: string;
  minItems: number;
  /** null = pas de limite haute. */
  maxItems: number | null;
  /** null = devis manuel : aucun montant n'est annoncé automatiquement. */
  fee: number | null;
}

export interface SheinDeliveryOption {
  id: string;
  label: string;
  hint?: string;
  /** null = tarif non configuré → « communiqué après validation ». */
  fee: number | null;
  type: 'pickup' | 'delivery';
}

/** Identifiant de la stratégie de calcul des frais de traitement. */
export type ServiceFeeStrategyId = 'item_tiers' | 'value_percent';

export interface PricingConfig {
  /** Stratégie active. D'autres se branchent sans toucher au reste du site. */
  strategy: ServiceFeeStrategyId;
  /** Tranches utilisées par la stratégie « nombre d'articles ». */
  tiers: ServiceFeeTier[];
  /** Paramètres de la stratégie « pourcentage de la valeur ». */
  valuePercent: {
    percent: number;
    minFee: number;
    /** null = pas de plafond. */
    maxFee: number | null;
  };
  /** Options de livraison propres au service SHEIN. */
  deliveryOptions: SheinDeliveryOption[];
  /**
   * Taux de conversion vers le FCFA. XOF = 1.
   * EUR = 655,957 (parité fixe officielle du franc CFA).
   * null = devise non convertible tant que le taux n'est pas renseigné.
   */
  conversionRates: Record<string, number | null>;
  /** Devise proposée par défaut dans le formulaire. */
  defaultCurrency: string;
}

/** Détail d'une estimation, ligne par ligne. */
export interface Quote {
  itemCount: number;
  /** Somme des prix articles convertie en FCFA. null = au moins un prix non convertible. */
  itemsSubtotal: number | null;
  /** Devises que le taux configuré ne permet pas de convertir. */
  unconvertedCurrencies: string[];
  /** Frais de traitement. null = devis manuel. */
  serviceFee: number | null;
  serviceFeeReason: string;
  deliveryOptionId: string;
  deliveryLabel: string;
  /** null = tarif non configuré. Vaut 0 quand une promotion offre la livraison. */
  deliveryFee: number | null;
  /**
   * Frais de livraison avant promotion, quand une promotion s'applique.
   * Permet d'afficher « 2 000 FCFA → offerte » plutôt qu'un zéro sans
   * explication, et de retrouver le tarif normal si la promotion est retirée.
   */
  deliveryFeeBeforePromotion?: number | null;
  /** Remise appliquée sur le total, en FCFA. 0 = aucune. */
  discount?: number;
  /** Nom de la promotion appliquée, pour l'afficher à la cliente. */
  promotionLabel?: string | null;
  /** Somme des lignes connues. */
  total: number;
  /** true si une ligne manque : le total affiché est partiel. */
  isPartial: boolean;
  /** Stratégie utilisée, pour tracer un calcul a posteriori. */
  strategy: ServiceFeeStrategyId;
  computedAt: string;
}

export type GroupingStatus =
  | 'open'
  | 'full'
  | 'closed'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'postponed'
  | 'cancelled';

export interface Grouping {
  id: string;
  reference: string;
  destination: string;
  /** Ouverture des inscriptions (ISO). Vide = date pas encore arrêtée. */
  openingDate: string;
  /** Clôture des inscriptions (ISO). Vide = date pas encore arrêtée. */
  closingDate: string;
  maxOrders: number;
  minOrders: number;
  /** Demandes rattachées via le site. Incrémenté par la couche données. */
  reservedCount: number;
  /** Commandes prises hors site (WhatsApp, en personne), saisies par l'admin. */
  manualOrderCount: number;
  /** Coût logistique global. null = pas encore estimé. */
  logisticsCost: number | null;
  status: GroupingStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlertThresholds {
  /** Pourcentages de remplissage déclenchant un avertissement. */
  warning: number;
  almostFull: number;
}

export interface StoreSettings {
  whatsappNumber: string;
  /** Lien court WhatsApp Business, utilisé si aucun numéro n'est renseigné. */
  whatsappLink: string;
  /*
   * Dates de repli, utilisées seulement quand aucun groupage n'est ouvert.
   * `nextGroupingOpening` = ouverture des inscriptions, `nextGroupingDate` =
   * clôture. Le nom historique de la seconde est conservé : le renommer
   * effacerait la date déjà enregistrée dans la base de la boutique.
   */
  nextGroupingOpening: string;
  nextGroupingDate: string;
  waveNumber: string;
  orangeMoneyNumber: string;
  /** Frais par zone, surchargent DELIVERY_ZONES. null = à confirmer. */
  deliveryFees: Record<string, number | null>;
  /** Message court affiché en bandeau haut de page. Vide = pas de bandeau. */
  announcement: string;
  /** Tarification du service SHEIN, entièrement pilotée depuis l'admin. */
  pricing: PricingConfig;
  /** Seuils d'alerte de remplissage des groupages. */
  alertThresholds: AlertThresholds;
  /** Offres en cours. Toutes les conditions sont modifiables depuis l'admin. */
  promotions: Promotion[];
  /** Avis recueillis auprès des clientes et publiés par la boutique. */
  reviews: Review[];
}

/* ─────────────────────────────────────────────────────────────
   Promotions
   ───────────────────────────────────────────────────────────── */

/**
 * Ce qu'une promotion change.
 *
 * Un seul effet par offre : deux réductions qui se cumulent sur une même
 * commande donnent des totaux que personne n'arrive à expliquer à une cliente.
 * Pour cumuler, il faut créer une offre qui le dise.
 */
export type PromotionEffect =
  /** La livraison passe à 0. Sans effet si son tarif n'est pas encore fixé. */
  | { type: 'free_delivery' }
  /** Les frais de traitement du service SHEIN passent à 0. */
  | { type: 'free_service_fee' }
  /** Remise en FCFA sur le total, plafonnée au total pour ne jamais passer sous zéro. */
  | { type: 'discount_amount'; amount: number };

/**
 * Une offre et ses conditions.
 *
 * Toutes les conditions sont cumulatives : une promotion s'applique quand
 * TOUTES celles qui sont renseignées sont remplies. Un champ laissé vide ne
 * restreint rien — `groupingIds` vide vaut « tous les groupages ».
 *
 * Les conditions sont vérifiées côté données au moment d'enregistrer la
 * commande, jamais d'après ce que le navigateur affirme avoir calculé.
 */
export interface Promotion {
  id: string;
  /** Nom court, affiché à la cliente : « Offre rentrée ». */
  label: string;
  /** Une phrase qui explique l'offre, affichée sur le site. */
  description: string;
  /** Interrupteur principal. false = invisible et sans effet. */
  active: boolean;
  /** À quel type de commande elle s'applique. */
  scope: 'shein' | 'store' | 'all';
  /**
   * Code à saisir par la cliente. Vide = l'offre s'applique d'elle-même dès
   * que les autres conditions sont remplies.
   *
   * Un code promo n'est pas un secret : il circule sur Instagram et WhatsApp,
   * et une personne curieuse peut le retrouver dans la page. Il sert à mener
   * une campagne, pas à protéger quelque chose de précieux.
   */
  code: string;
  /** Réservée aux clientes qui se déclarent étudiantes. */
  studentOnly: boolean;
  /** Début de la période (ISO, date seule). null = pas de date de début. */
  startsAt: string | null;
  /** Fin de la période, incluse. null = pas de date de fin. */
  endsAt: string | null;
  /**
   * Montant minimum d'ARTICLES, en FCFA, pour que l'offre s'applique.
   * null = aucun minimum, l'offre vaut quel que soit le panier.
   *
   * Il porte sur le prix des articles seuls : ni les frais de traitement, ni
   * la livraison, ni le transport ne comptent pour l'atteindre. Une remise
   * sort de la poche de la boutique — ce seuil garantit qu'elle n'est donnée
   * que sur une commande assez grosse pour l'absorber.
   */
  minSubtotal: number | null;
  /** Groupages concernés. Vide = tous. */
  groupingIds: string[];
  /** Options de livraison concernées. Vide = toutes. */
  deliveryOptionIds: string[];
  effect: PromotionEffect;
}
