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
  /** Code promo saisi par la cliente. Vide = aucun. */
  promoCode: string;
  /** Déclaration de la cliente, jamais une vérification. */
  isStudent: boolean;
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
  /** Code promo saisi par la cliente. Vide = aucun. */
  promoCode: string;
}

/** Un total de pages vues et le nombre de navigateurs distincts derrière. */
export interface VisitPeriod {
  visites: number;
  visiteurs: number;
}

/**
 * Réglage de l'alerte « nouvelle commande ».
 *
 * Le nom du canal ne transite QU'entre l'administration connectée et la
 * base : il est rangé dans une table sans accès public (voir supabase/
 * mise-a-jour.sql), jamais dans `settings` qui est lisible par tout
 * visiteur du site.
 */
export interface AlertSettings {
  /** Nom du canal ntfy. Secret : qui le connaît reçoit les alertes. */
  ntfyTopic: string;
  enabled: boolean;
  /** Inclure le nom, le téléphone et l'adresse de la cliente. Voir AlertEditor. */
  includeCustomer: boolean;
}

/** Ce que Telegram a répondu au message de test. */
export interface AlertTestResult {
  /** `true` = le message est parti et Telegram l'a accepté. */
  ok: boolean;
  /** `true` tant que la réponse n'est pas encore revenue. */
  enAttente: boolean;
  /** Explication de l'échec, telle que Telegram la donne. Vide si tout va bien. */
  detail: string;
}

/**
 * Fréquentation du site, agrégée côté serveur.
 * L'administration reçoit ces quelques chiffres, jamais la liste des visites.
 */
export interface VisitStats {
  jour: VisitPeriod;
  semaine: VisitPeriod;
  mois: VisitPeriod;
  annee: VisitPeriod;
  total: VisitPeriod;
  /** 30 derniers jours, du plus ancien au plus récent, jours creux compris. */
  parJour: Array<{ date: string; visites: number; visiteurs: number }>;
  /** Pages les plus consultées sur 30 jours, de la plus vue à la moins vue. */
  pages: Array<{ path: string; visites: number }>;
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
  /** Met à la corbeille (`true`) ou restaure (`false`). Rien n'est effacé. */
  updateOrdersTrash(ids: string[], trashed: boolean): Promise<void>;
  /** Suppression définitive, depuis la corbeille uniquement. Irréversible. */
  deleteOrders(ids: string[]): Promise<void>;

  createSheinRequest(draft: SheinDraft): Promise<SheinRequest>;
  listSheinRequests(): Promise<SheinRequest[]>;
  findSheinRequest(requestNumber: string, phone: string): Promise<SheinRequest | null>;
  updateSheinRequest(
    id: string,
    patch: Partial<Pick<SheinRequest, 'status' | 'quotedTotal' | 'note'>>,
  ): Promise<SheinRequest>;
  updateSheinTrash(ids: string[], trashed: boolean): Promise<void>;
  deleteSheinRequests(ids: string[]): Promise<void>;

  listGroupings(): Promise<Grouping[]>;
  saveGrouping(grouping: Grouping): Promise<Grouping>;
  deleteGrouping(id: string): Promise<void>;
  /** Déplace toutes les demandes d'un groupage vers un autre (ou vers aucun). */
  transferRequests(fromGroupingId: string, toGroupingId: string | null): Promise<number>;

  getSettings(): Promise<StoreSettings>;
  saveSettings(settings: StoreSettings): Promise<StoreSettings>;

  /*
   * Fréquentation. Volontairement hors de la convention create/update/save :
   * signaler une page vue n'est pas une modification de la boutique, et cela
   * ne doit pas déclencher le rafraîchissement des écrans ouverts (voir le
   * relais d'écritures dans services/index.ts).
   */

  /** Signale une page vue. N'échoue jamais bruyamment : ce n'est pas vital. */
  recordVisit(path: string, visitor: string): Promise<void>;
  getVisitStats(): Promise<VisitStats>;

  /* Alerte « nouvelle commande ». Réservée à l'administration connectée. */
  getAlertSettings(): Promise<AlertSettings>;
  saveAlertSettings(settings: AlertSettings): Promise<AlertSettings>;
  /** Envoie un message de test et attend la réponse de Telegram. */
  testAlert(): Promise<AlertTestResult>;
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
