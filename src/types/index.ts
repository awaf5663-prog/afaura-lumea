/** Types partagés par toute l'application (front, services, admin). */

export type ProductStatus = 'active' | 'draft' | 'sold_out';

export interface ProductVariantGroup {
  /** ex : "Modèle", "Couleur", "Taille" */
  name: string;
  options: string[];
  /** Options momentanément indisponibles : affichées barrées, impossibles à commander. */
  soldOutOptions?: string[];
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
  createdAt: string;
}

export interface Category {
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
  /** subtotal + deliveryFee (deliveryFee null compté comme 0, l'UI le signale). */
  total: number;
  paymentMethod: string;
  paymentMethodLabel: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
  updatedAt: string;
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
  /** null = tarif non configuré. */
  deliveryFee: number | null;
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
}
