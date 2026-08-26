import type {
  Grouping,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  SheinRequest,
  SheinStatus,
  StoreSettings,
} from '@/src/types';

/** Ce que le navigateur envoie pour créer une commande : jamais de montant. */
export interface OrderDraft {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  note?: string;
  deliveryZoneId: string;
  paymentMethod: string;
  items: Array<{ productId: string; quantity: number; options: Record<string, string> }>;
}

export interface SheinDraft {
  customerName: string;
  phone: string;
  note?: string;
  deliveryOptionId: string;
  items: SheinRequest['items'];
  /** Déclaration de la cliente, jamais une vérification. */
  isStudent: boolean;
}

/**
 * Contrat commun aux différentes sources de données.
 * Deux implémentations : `localAdapter` (navigateur, zéro configuration)
 * et `supabaseAdapter` (Postgres + RLS, activé dès que les variables
 * VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY sont définies).
 */
export interface DataSource {
  mode: 'local' | 'supabase';

  listProducts(): Promise<Product[]>;
  saveProduct(product: Product): Promise<Product>;
  deleteProduct(id: string): Promise<void>;

  createOrder(draft: OrderDraft): Promise<Order>;
  listOrders(): Promise<Order[]>;
  findOrder(orderNumber: string, phone: string): Promise<Order | null>;
  updateOrder(
    id: string,
    patch: Partial<Pick<Order, 'orderStatus' | 'paymentStatus' | 'deliveryFee' | 'note'>>,
  ): Promise<Order>;

  createSheinRequest(draft: SheinDraft): Promise<SheinRequest>;
  listSheinRequests(): Promise<SheinRequest[]>;
  findSheinRequest(requestNumber: string, phone: string): Promise<SheinRequest | null>;
  updateSheinRequest(
    id: string,
    patch: Partial<Pick<SheinRequest, 'status' | 'quotedTotal' | 'note'>>,
  ): Promise<SheinRequest>;

  listGroupings(): Promise<Grouping[]>;
  saveGrouping(grouping: Grouping): Promise<Grouping>;
  deleteGrouping(id: string): Promise<void>;
  /** Déplace toutes les demandes d'un groupage vers un autre (ou vers aucun). */
  transferRequests(fromGroupingId: string, toGroupingId: string | null): Promise<number>;

  getSettings(): Promise<StoreSettings>;
  saveSettings(settings: StoreSettings): Promise<StoreSettings>;
}

export type {
  Grouping,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  SheinRequest,
  SheinStatus,
  StoreSettings,
};
