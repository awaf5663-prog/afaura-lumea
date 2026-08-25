/** Types partagés par toute l'application (front, services, admin). */

export type ProductStatus = 'active' | 'draft' | 'sold_out';

export interface ProductVariantGroup {
  /** ex : "Couleur", "Taille" */
  name: string;
  options: string[];
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
  /** Prix affiché sur SHEIN, saisi par la cliente (texte libre : devise variable). */
  displayedPrice: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface StoreSettings {
  whatsappNumber: string;
  nextGroupingDate: string;
  waveNumber: string;
  orangeMoneyNumber: string;
  /** Frais par zone, surchargent DELIVERY_ZONES. null = à confirmer. */
  deliveryFees: Record<string, number | null>;
  /** Message court affiché en bandeau haut de page. Vide = pas de bandeau. */
  announcement: string;
}
