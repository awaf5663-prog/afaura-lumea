import { DEFAULT_PROMOTIONS } from '@/src/config/pricing';
import { SEED_IMAGES } from '@/src/data/seed';
import { normalizePhone } from '@/src/lib/format';
import type { Grouping, Order, Product, SheinRequest, StoreSettings } from '@/src/types';
import { normalizeAlertThresholds, normalizePricing, normalizePromotions } from './settingsShape';
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

/**
 * Un en-tête HTTP n'accepte que des caractères imprimables ASCII. Un jeton
 * abîmé (retour à la ligne, accent, valeur tronquée) fait échouer la
 * construction de la requête AVANT tout appel réseau, avec un message
 * technique du navigateur — sur Safari « The string did not match the
 * expected pattern. » — qui ne dit rien à personne. On préfère détecter le
 * jeton illisible ici, l'effacer, et repartir sur une session propre.
 */
const HEADER_SAFE = /^[\x21-\x7e]+$/;

function accessToken(): string | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const token = raw.trim();
    if (!token || token === 'undefined' || token === 'null' || !HEADER_SAFE.test(token)) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

/** Une session Supabase est-elle réellement ouverte ? */
export function hasSupabaseSession(): boolean {
  return accessToken() !== null;
}

export async function supabaseSignIn(email: string, password: string): Promise<void> {
  const res = await fetch(`${URL_BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Identifiants refusés.');
  const data = (await res.json()) as { access_token?: string };
  // Sans jeton exploitable, se déclarer connectée ne servirait qu'à faire
  // échouer le premier enregistrement.
  const token = (data.access_token ?? '').trim();
  if (!token || !HEADER_SAFE.test(token)) {
    throw new Error("La base n'a pas renvoyé de session utilisable. Réessayez.");
  }
  localStorage.setItem(TOKEN_KEY, token);
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
  let res: Response;
  try {
    res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
      ...init,
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${token ?? ANON_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
        ...(init.headers ?? {}),
      },
    });
  } catch (cause) {
    // Réseau coupé, requête refusée par le navigateur : sans ce filtre, le
    // message brut du navigateur arrivait tel quel devant la boutique.
    const detail = cause instanceof Error ? `${cause.name} : ${cause.message}` : String(cause);
    throw new Error(
      `La base n'a pas pu être jointe. Vérifiez votre connexion, puis réessayez. (${detail})`,
    );
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    if (res.status === 401 || res.status === 403) {
      throw new Error(
        "Enregistrement refusé par la base : votre session d'administration a expiré. " +
          'Quittez puis reconnectez-vous, votre saisie est conservée.',
      );
    }
    throw new Error(`Supabase : ${res.status} ${body}`);
  }
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
  // Pas de photo en base : on reprend celles livrées avec le site plutôt que
  // d'afficher une fiche vide. Voir SEED_IMAGES.
  images: (r.images?.length ? r.images : SEED_IMAGES[r.id]) ?? [],
  variants: r.variants ?? [],
  stock: r.stock,
  status: r.status,
  isNew: r.is_new ?? false,
  isPopular: r.is_popular ?? false,
  otherColorsAvailable: r.other_colors_available ?? false,
  colorChartId: r.color_chart_id ?? null,
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
  color_chart_id: p.colorChartId ?? null,
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
  deliveryFeeBeforePromotion: r.delivery_fee_before_promotion ?? null,
  subtotal: r.subtotal,
  discount: r.discount ?? 0,
  promotionLabel: r.promotion_label ?? null,
  promoCode: r.promo_code ?? '',
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
  isStudent: r.is_student ?? false,
  promoCode: r.promo_code ?? '',
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
        // Le numéro part normalisé (221…), comme il est enregistré côté
        // navigateur pour retrouver la commande. Sans ça, « 78 107 16 04 »
        // et « 221781071604 » désignent la même cliente sans jamais se
        // correspondre, et le récapitulatif devient introuvable.
        p_phone: normalizePhone(draft.phone),
        p_address: draft.address,
        p_city: draft.city,
        p_note: draft.note ?? null,
        p_delivery_zone_id: draft.deliveryZoneId,
        p_payment_method: draft.paymentMethod,
        p_promo_code: draft.promoCode,
        p_is_student: draft.isStudent,
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
        p_phone: normalizePhone(draft.phone),
        p_note: draft.note ?? null,
        p_delivery_option_id: draft.deliveryOptionId,
        p_is_student: draft.isStudent,
        p_promo_code: draft.promoCode,
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
    /** La ligne a-t-elle déjà été enregistrée depuis l'admin ? */
    const configured = Boolean(r.pricing && Object.keys(r.pricing).length);
    return {
      whatsappNumber: r.whatsapp_number ?? '',
      whatsappLink: r.whatsapp_link ?? '',
      nextGroupingDate: r.next_grouping_date ?? '',
      waveNumber: r.wave_number ?? '',
      orangeMoneyNumber: r.orange_money_number ?? '',
      deliveryFees: r.delivery_fees ?? {},
      announcement: r.announcement ?? '',
      // La ligne créée par schema.sql arrive avec `{}` dans ces colonnes :
      // on les complète champ par champ, sinon l'admin plante à l'affichage.
      pricing: normalizePricing(r.pricing),
      alertThresholds: normalizeAlertThresholds(r.alert_thresholds),
      // Tableau vide : sur une ligne jamais enregistrée depuis l'admin, cela
      // veut dire « pas encore configuré » → on installe les offres livrées
      // avec le site. Une fois un enregistrement fait, un tableau vide
      // signifie vraiment « aucune offre » et on le respecte.
      promotions:
        Array.isArray(r.promotions) && (r.promotions.length || configured)
          ? normalizePromotions(r.promotions)
          : DEFAULT_PROMOTIONS,
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
        promotions: settings.promotions,
        alert_thresholds: settings.alertThresholds,
      }),
    });
    return settings;
  },
};
