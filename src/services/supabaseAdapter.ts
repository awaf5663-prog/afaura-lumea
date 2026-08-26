import { DEFAULT_ALERT_THRESHOLDS, DEFAULT_PRICING } from '@/src/config/pricing';
import type { Grouping, Order, Product, SheinRequest, StoreSettings } from '@/src/types';
import type { DataSource, OrderDraft, SheinDraft } from './types';

/**
 * Adaptateur Supabase (PostgREST + Auth) — sans SDK, uniquement `fetch`,
 * pour ne rien ajouter au poids du bundle.
 *
 * Activation : renseigner VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY,
 * puis exécuter supabase/schema.sql dans le SQL editor du projet.
 *
 * Points de sécurité (détaillés dans supabase/schema.sql) :
 *  - la clé « anon » est publique par nature, la sécurité repose sur les RLS ;
 *  - lecture publique des produits actifs uniquement ;
 *  - insertion de commandes autorisée, mais les MONTANTS sont recalculés
 *    côté serveur par la fonction `create_order` (SECURITY DEFINER) :
 *    le navigateur n'envoie que des identifiants produits et des quantités ;
 *  - lecture/écriture de l'espace admin réservée aux utilisateurs authentifiés.
 */

const URL_BASE = import.meta.env.VITE_SUPABASE_URL ?? '';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
const TOKEN_KEY = 'lumea.sb.token';

export function isSupabaseConfigured(): boolean {
  return Boolean(URL_BASE && ANON_KEY);
}

function accessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function supabaseSignIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Identifiants refusés.');
  const data = (await res.json()) as { access_token: string };
  localStorage.setItem(TOKEN_KEY, data.access_token);
}

export function supabaseSignOut(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* no-op */
  }
}

async function rest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = accessToken();
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: ANON_KEY,
      Authorization: `Bearer ${token ?? ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase : ${res.status} ${await res.text()}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/* ── Correspondance colonnes Postgres ⇄ types TypeScript ─────────────── */

type Row = Record<string, any>;

const toProduct = (r: Row): Product => ({
  id: r.id,
  slug: r.slug,
  name: r.name,
  description: r.description ?? '',
  price: r.price,
  compareAtPrice: r.compare_at_price,
  category: r.category,
  images: r.images ?? [],
  variants: r.variants ?? [],
  stock: r.stock,
  status: r.status,
  isNew: r.is_new ?? false,
  isPopular: r.is_popular ?? false,
  otherColorsAvailable: r.other_colors_available ?? false,
  createdAt: r.created_at,
});

const fromProduct = (p: Product): Row => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  description: p.description,
  price: p.price,
  compare_at_price: p.compareAtPrice ?? null,
  category: p.category,
  images: p.images,
  variants: p.variants,
  stock: p.stock,
  status: p.status,
  is_new: p.isNew ?? false,
  is_popular: p.isPopular ?? false,
  other_colors_available: p.otherColorsAvailable ?? false,
});

const toOrder = (r: Row): Order => ({
  id: r.id,
  orderNumber: r.order_number,
  customerName: r.customer_name,
  phone: r.phone,
  address: r.address ?? '',
  city: r.city ?? '',
  note: r.note ?? undefined,
  deliveryZoneId: r.delivery_zone_id,
  deliveryLabel: r.delivery_label,
  deliveryFee: r.delivery_fee,
  subtotal: r.subtotal,
  total: r.total,
  paymentMethod: r.payment_method,
  paymentMethodLabel: r.payment_method_label,
  paymentStatus: r.payment_status,
  orderStatus: r.order_status,
  items: (r.order_items ?? []).map((i: Row) => ({
    productId: i.product_id,
    name: i.name,
    quantity: i.quantity,
    unitPrice: i.unit_price,
    options: i.options ?? {},
  })),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toShein = (r: Row): SheinRequest => ({
  id: r.id,
  requestNumber: r.request_number,
  customerName: r.customer_name,
  phone: r.phone,
  note: r.note ?? undefined,
  items: (r.shein_items ?? []).map((i: Row) => ({
    productUrl: i.product_url ?? '',
    reference: i.reference ?? '',
    size: i.size ?? '',
    color: i.color ?? '',
    quantity: i.quantity,
    displayedPrice: i.displayed_price ?? '',
    priceAmount: i.price_amount ?? null,
    priceCurrency: i.price_currency ?? 'XOF',
    screenshotName: i.image ?? undefined,
  })),
  status: r.status,
  quotedTotal: r.quoted_total,
  groupingId: r.grouping_id ?? null,
  quote: r.quote ?? null,
  deliveryOptionId: r.delivery_option_id ?? '',
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const toGrouping = (r: Row): Grouping => ({
  id: r.id,
  reference: r.reference,
  destination: r.destination ?? '',
  closingDate: r.closing_date ?? '',
  maxOrders: r.max_orders,
  minOrders: r.min_orders,
  reservedCount: r.reserved_count ?? 0,
  manualOrderCount: r.manual_order_count ?? 0,
  logisticsCost: r.logistics_cost,
  status: r.status,
  note: r.note ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

const fromGrouping = (g: Grouping): Row => ({
  id: g.id,
  reference: g.reference,
  destination: g.destination,
  closing_date: g.closingDate || null,
  max_orders: g.maxOrders,
  min_orders: g.minOrders,
  reserved_count: g.reservedCount,
  manual_order_count: g.manualOrderCount,
  logistics_cost: g.logisticsCost,
  status: g.status,
  note: g.note ?? null,
  updated_at: new Date().toISOString(),
});

const ORDER_SELECT = '*,order_items(*)';
const SHEIN_SELECT = '*,shein_items(*)';

export const supabaseAdapter: DataSource = {
  mode: 'supabase',

  async listProducts() {
    const rows = await rest<Row[]>('products?select=*&order=created_at.desc');
    return rows.map(toProduct);
  },

  async saveProduct(product) {
    const rows = await rest<Row[]>('products?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(fromProduct(product)),
    });
    return toProduct(rows[0]);
  },

  async deleteProduct(id) {
    await rest(`products?id=eq.${id}`, { method: 'DELETE' });
  },

  async createOrder(draft: OrderDraft) {
    // Le serveur recalcule les prix : le navigateur n'envoie aucun montant.
    const row = await rest<Row>('rpc/create_order', {
      method: 'POST',
      body: JSON.stringify({
        p_customer_name: draft.customerName,
        p_phone: draft.phone,
        p_address: draft.address,
        p_city: draft.city,
        p_note: draft.note ?? null,
        p_delivery_zone_id: draft.deliveryZoneId,
        p_payment_method: draft.paymentMethod,
        p_items: draft.items.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          options: i.options,
        })),
      }),
    });
    return toOrder(row);
  },

  async listOrders() {
    const rows = await rest<Row[]>(`orders?select=${ORDER_SELECT}&order=created_at.desc`);
    return rows.map(toOrder);
  },

  async findOrder(orderNumber, phone) {
    const row = await rest<Row>('rpc/find_order', {
      method: 'POST',
      body: JSON.stringify({ p_order_number: orderNumber.trim(), p_phone: phone }),
    });
    return row ? toOrder(row) : null;
  },

  async updateOrder(id, patch) {
    const body: Row = { updated_at: new Date().toISOString() };
    if (patch.orderStatus) body.order_status = patch.orderStatus;
    if (patch.paymentStatus) body.payment_status = patch.paymentStatus;
    if (patch.deliveryFee !== undefined) body.delivery_fee = patch.deliveryFee;
    if (patch.note !== undefined) body.note = patch.note;
    const rows = await rest<Row[]>(`orders?id=eq.${id}&select=${ORDER_SELECT}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return toOrder(rows[0]);
  },

  async createSheinRequest(draft: SheinDraft) {
    const row = await rest<Row>('rpc/create_shein_request', {
      method: 'POST',
      body: JSON.stringify({
        p_customer_name: draft.customerName,
        p_phone: draft.phone,
        p_note: draft.note ?? null,
        p_delivery_option_id: draft.deliveryOptionId,
        p_items: draft.items.map((i) => ({
          product_url: i.productUrl,
          reference: i.reference,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          displayed_price: i.displayedPrice,
          price_amount: i.priceAmount,
          price_currency: i.priceCurrency,
          image: i.screenshotName ?? null,
        })),
      }),
    });
    return toShein(row);
  },

  async listSheinRequests() {
    const rows = await rest<Row[]>(`shein_requests?select=${SHEIN_SELECT}&order=created_at.desc`);
    return rows.map(toShein);
  },

  async findSheinRequest(requestNumber, phone) {
    const row = await rest<Row>('rpc/find_shein_request', {
      method: 'POST',
      body: JSON.stringify({ p_request_number: requestNumber.trim(), p_phone: phone }),
    });
    return row ? toShein(row) : null;
  },

  async updateSheinRequest(id, patch) {
    const body: Row = { updated_at: new Date().toISOString() };
    if (patch.status) body.status = patch.status;
    if (patch.quotedTotal !== undefined) body.quoted_total = patch.quotedTotal;
    if (patch.note !== undefined) body.note = patch.note;
    const rows = await rest<Row[]>(`shein_requests?id=eq.${id}&select=${SHEIN_SELECT}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return toShein(rows[0]);
  },

  async listGroupings() {
    const rows = await rest<Row[]>('groupings?select=*&order=reference.desc');
    return rows.map(toGrouping);
  },

  async saveGrouping(grouping) {
    const rows = await rest<Row[]>('groupings?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
      body: JSON.stringify(fromGrouping(grouping)),
    });
    return toGrouping(rows[0]);
  },

  async deleteGrouping(id) {
    await rest(`groupings?id=eq.${id}`, { method: 'DELETE' });
  },

  async transferRequests(fromGroupingId, toGroupingId) {
    const row = await rest<number>('rpc/transfer_shein_requests', {
      method: 'POST',
      body: JSON.stringify({ p_from: fromGroupingId, p_to: toGroupingId }),
    });
    return Number(row ?? 0);
  },

  async getSettings() {
    const rows = await rest<Row[]>('settings?select=*&id=eq.1');
    const r = rows[0] ?? {};
    return {
      whatsappNumber: r.whatsapp_number ?? '',
      whatsappLink: r.whatsapp_link ?? '',
      nextGroupingDate: r.next_grouping_date ?? '',
      waveNumber: r.wave_number ?? '',
      orangeMoneyNumber: r.orange_money_number ?? '',
      deliveryFees: r.delivery_fees ?? {},
      announcement: r.announcement ?? '',
      pricing: r.pricing ?? DEFAULT_PRICING,
      alertThresholds: r.alert_thresholds ?? DEFAULT_ALERT_THRESHOLDS,
    } satisfies StoreSettings;
  },

  async saveSettings(settings) {
    await rest('settings?on_conflict=id', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: 1,
        whatsapp_number: settings.whatsappNumber,
        whatsapp_link: settings.whatsappLink,
        next_grouping_date: settings.nextGroupingDate || null,
        wave_number: settings.waveNumber,
        orange_money_number: settings.orangeMoneyNumber,
        delivery_fees: settings.deliveryFees,
        announcement: settings.announcement,
        pricing: settings.pricing,
        alert_thresholds: settings.alertThresholds,
      }),
    });
    return settings;
  },
};
