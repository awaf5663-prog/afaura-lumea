import {
  DELIVERY_ZONES,
  ORANGE_MONEY_NUMBER,
  PAYMENT_METHODS,
  WAVE_NUMBER,
  WHATSAPP_LINK,
  WHATSAPP_NUMBER,
} from '@/src/config/site';
import { DEFAULT_PROMOTIONS } from '@/src/config/pricing';
import { SEED_IMAGES } from '@/src/data/seed';
import { normalizePhone } from '@/src/lib/format';
import { fromStoredImages, toStoredImages } from '@/src/lib/image';
import type { Grouping, Order, Product, SheinRequest, StoreSettings } from '@/src/types';
import { normalizeAlertThresholds, normalizePricing, normalizePromotions } from './settingsShape';
import type {
  AlertSettings,
  DataSource,
  OrderDraft,
  SheinDraft,
  VisitStats,
} from './types';

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

/**
 * L'étape 7 de mise-a-jour.sql n'est pas passée : la table et les fonctions
 * de l'alerte n'existent pas encore. On le dit en clair, plutôt que de
 * laisser remonter un code d'erreur PostgREST.
 */
function alerteNonInstallee(error: unknown): Error {
  const message = error instanceof Error ? error.message : '';
  if (/alert_settings|ntfy_topic|tester_alerte|resultat_alerte|PGRST(202|204|205)|404/i.test(message)) {
    return new Error(
      "L'alerte n'est pas encore installée dans votre base. Ouvrez Supabase → SQL Editor, " +
        'exécutez supabase/mise-a-jour.sql, puis revenez ici.',
    );
  }
  return error instanceof Error ? error : new Error(String(error));
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
  // « return=minimal » répond 201 sans contenu : demander du JSON à un corps
  // vide lèverait une erreur alors que l'écriture a réussi.
  const texte = await res.text();
  if (!texte) return undefined as T;
  return JSON.parse(texte) as T;
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
  // Les repères « seed:… » sont retraduits, les photos de la boutique gardées,
  // et les adresses d'anciennes publications écartées. Voir lib/image.
  images: fromStoredImages(r.images, r.id, SEED_IMAGES[r.id]),
  variants: r.variants ?? [],
  stock: r.stock,
  status: r.status,
  isNew: r.is_new ?? false,
  isPopular: r.is_popular ?? false,
  otherColorsAvailable: r.other_colors_available ?? false,
  colorChartId: r.color_chart_id ?? null,
  // Colonne absente tant que la mise à jour SQL n'est pas passée : l'article
  // garde alors simplement son prix unique.
  optionPrices:
    r.option_prices && typeof r.option_prices === 'object' ? r.option_prices : undefined,
  measurements: Array.isArray(r.measurements) ? r.measurements : [],
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
  // On n'enregistre jamais l'adresse d'une photo livrée avec le site : elle
  // change à chaque publication, et les fiches se retrouveraient sans photo.
  images: toStoredImages(p.images, p.id, SEED_IMAGES[p.id]),
  variants: p.variants,
  stock: p.stock,
  status: p.status,
  is_new: p.isNew ?? false,
  is_popular: p.isPopular ?? false,
  other_colors_available: p.otherColorsAvailable ?? false,
  color_chart_id: p.colorChartId ?? null,
  option_prices: p.optionPrices ?? {},
  measurements: p.measurements ?? [],
});

/**
 * Intitulés lisibles de la zone de livraison et du moyen de paiement.
 *
 * La fonction serveur n'a que les identifiants (« city », « orange_money ») :
 * les libellés vivent dans la configuration du site, et le navigateur ne les
 * envoie pas — on ne fait confiance qu'aux identifiants. On les résout donc à
 * la lecture, ce qui répare aussi les commandes déjà enregistrées.
 */
const zoneLabel = (id: string, stocke?: string): string =>
  DELIVERY_ZONES.find((z) => z.id === id)?.label ?? stocke ?? id;

const paiementLabel = (id: string, stocke?: string): string =>
  PAYMENT_METHODS.find((m) => m.id === id)?.label ?? stocke ?? id;

/*
 * Colonnes arrivées APRÈS la première mise en place de la base.
 *
 * Tant que supabase/mise-a-jour.sql n'a pas été passé, elles n'existent pas et
 * PostgREST refuse l'enregistrement entier. On réessaie donc sans elles, pour
 * que le reste passe — mais JAMAIS en silence : si la boutique avait saisi
 * quelque chose dedans, sa saisie n'est pas enregistrée, et le lui cacher
 * derrière un « c'est enregistré » lui ferait retaper la même chose sans
 * jamais comprendre pourquoi elle disparaît.
 */
interface ColonneRecente {
  colonne: string;
  etiquette: string;
}

const aDuContenu = (valeur: unknown): boolean =>
  Array.isArray(valeur) ? valeur.length > 0 : valeur !== null && valeur !== undefined && valeur !== '';

/**
 * Enregistre `colonnes`, en retirant une à une les colonnes récentes que la
 * base ne connaît pas encore. Lève si une colonne retirée portait une valeur.
 */
async function enregistrerSansColonnesAbsentes<T>(
  envoyer: (corps: Row) => Promise<T>,
  colonnes: Row,
  recentes: readonly ColonneRecente[],
): Promise<T> {
  let corps: Row = { ...colonnes };
  const retirees: ColonneRecente[] = [];
  let resultat: T | undefined;

  // PostgREST ne signale qu'une colonne manquante à la fois : on boucle.
  for (let essai = 0; essai <= recentes.length; essai += 1) {
    try {
      resultat = await envoyer(corps);
      break;
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      const manquante = recentes.find(
        (c) => !retirees.includes(c) && message.toLowerCase().includes(c.colonne),
      );
      if (!manquante) throw error;
      retirees.push(manquante);
      const { [manquante.colonne]: _absente, ...reste } = corps;
      corps = reste;
    }
  }

  const perdues = retirees.filter((c) => aDuContenu(colonnes[c.colonne]));
  if (perdues.length) {
    /*
     * Formulation volontairement neutre : le panneau qui affiche ce message
     * est titré « Enregistrement impossible », et écrire « le reste a bien
     * été enregistré » juste en dessous se contredirait. On nomme ce qui
     * n'est pas passé, puis on rassure sur le reste.
     */
    throw new Error(
      `Non enregistré : ${perdues.map((c) => c.etiquette).join(', ')}. ` +
        "Votre base n'a pas encore reçu la mise à jour — le reste, lui, est bien passé. " +
        'Ouvrez Supabase → SQL Editor, exécutez supabase/mise-a-jour.sql, puis réessayez.',
    );
  }
  return resultat as T;
}

/**
 * Mise à la corbeille ou restauration, en une seule requête.
 *
 * La colonne `deleted_at` est arrivée après la première mise en place de la
 * base : si elle manque, on le dit clairement plutôt que de laisser croire
 * que la commande a été rangée quelque part.
 */
async function corbeille(table: string, ids: string[], trashed: boolean): Promise<void> {
  if (!ids.length) return;
  try {
    await rest(`${table}?id=in.(${ids.join(',')})`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({ deleted_at: trashed ? new Date().toISOString() : null }),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/deleted_at/i.test(message)) throw error;
    throw new Error(
      "La corbeille n'est pas encore installée dans la base. Passez supabase/mise-a-jour.sql dans le SQL editor de Supabase, puis réessayez.",
    );
  }
}

const toOrder = (r: Row): Order => ({
  id: r.id,
  orderNumber: r.order_number,
  customerName: r.customer_name,
  phone: r.phone,
  address: r.address ?? '',
  city: r.city ?? '',
  note: r.note ?? undefined,
  // Colonne absente tant que la mise à jour SQL n'est pas passée : la
  // boutique fonctionne sans, simplement sans frais de traitement.
  serviceFee: Number(r.service_fee ?? 0) || 0,
  deliveryZoneId: r.delivery_zone_id,
  deliveryLabel: zoneLabel(r.delivery_zone_id, r.delivery_label),
  deliveryFee: r.delivery_fee,
  deliveryFeeBeforePromotion: r.delivery_fee_before_promotion ?? null,
  subtotal: r.subtotal,
  discount: r.discount ?? 0,
  promotionLabel: r.promotion_label ?? null,
  promoCode: r.promo_code ?? '',
  total: r.total,
  paymentMethod: r.payment_method,
  paymentMethodLabel: paiementLabel(r.payment_method, r.payment_method_label),
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
  deletedAt: r.deleted_at ?? null,
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
  deletedAt: r.deleted_at ?? null,
});

const toGrouping = (r: Row): Grouping => ({
  id: r.id,
  reference: r.reference,
  destination: r.destination ?? '',
  // Colonne absente tant que la mise à jour SQL n'est pas passée : le
  // groupage vit sans, simplement sans date d'ouverture affichée.
  openingDate: r.opening_date ?? '',
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
  opening_date: g.openingDate || null,
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
    const corps = fromProduct(product);
    const envoyer = (r: Row) =>
      rest<Row[]>('products?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(r),
      });
    /*
     * Deux colonnes sont arrivées après la première mise en place de la base.
     * Sans la mise à jour SQL, PostgREST refuse TOUTE la fiche à cause d'une
     * seule d'entre elles. On réessaie donc sans, et si le contenu écarté
     * n'était pas vide, on le dit clairement — plutôt que d'annoncer un
     * enregistrement réussi qui a perdu quelque chose en route.
     */
    const rows = await enregistrerSansColonnesAbsentes(envoyer, corps, [
      { colonne: 'measurements', etiquette: 'les mesures de la pièce' },
      { colonne: 'option_prices', etiquette: 'les prix par option' },
    ]);
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
    // Coordonnées. Le numéro est normalisé comme à la création, sans quoi la
    // page Suivi ne retrouverait plus la commande avec le numéro corrigé.
    if (patch.customerName !== undefined) body.customer_name = patch.customerName;
    if (patch.phone !== undefined) body.phone = normalizePhone(patch.phone);
    if (patch.address !== undefined) body.address = patch.address;
    if (patch.city !== undefined) body.city = patch.city;
    const rows = await rest<Row[]>(`orders?id=eq.${id}&select=${ORDER_SELECT}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
    return toOrder(rows[0]);
  },

  async updateOrdersTrash(ids, trashed) {
    await corbeille('orders', ids, trashed);
  },

  async deleteOrders(ids) {
    if (!ids.length) return;
    await rest(`orders?id=in.(${ids.join(',')})`, { method: 'DELETE' });
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
    if (patch.customerName !== undefined) body.customer_name = patch.customerName;
    if (patch.phone !== undefined) body.phone = normalizePhone(patch.phone);
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
    const envoyer = (corps: Row) =>
      rest<Row[]>('groupings?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(corps),
      });

    const rows = await enregistrerSansColonnesAbsentes(envoyer, fromGrouping(grouping), [
      { colonne: 'opening_date', etiquette: "la date d'ouverture des inscriptions" },
    ]);
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

  async updateSheinTrash(ids, trashed) {
    await corbeille('shein_requests', ids, trashed);
  },

  async deleteSheinRequests(ids) {
    if (!ids.length) return;
    await rest(`shein_requests?id=in.(${ids.join(',')})`, { method: 'DELETE' });
  },

  async getSettings() {
    const rows = await rest<Row[]>('settings?select=*&id=eq.1');
    const r = rows[0] ?? {};
    /** La ligne a-t-elle déjà été enregistrée depuis l'admin ? */
    const configured = Boolean(r.pricing && Object.keys(r.pricing).length);
    return {
      /*
       * Un champ vide en base signifie « pas encore renseigné », pas « aucun
       * contact ». Sans ce repli, la ligne créée par schema.sql effaçait le
       * numéro WhatsApp : le site retombait sur « copier puis ouvrir
       * WhatsApp », et le message ne partait plus tout seul.
       */
      whatsappNumber: r.whatsapp_number?.trim() || WHATSAPP_NUMBER,
      whatsappLink: r.whatsapp_link?.trim() || WHATSAPP_LINK,
      nextGroupingOpening: r.next_grouping_opening ?? '',
      nextGroupingDate: r.next_grouping_date ?? '',
      waveNumber: r.wave_number?.trim() || WAVE_NUMBER,
      orangeMoneyNumber: r.orange_money_number?.trim() || ORANGE_MONEY_NUMBER,
      // Pas de repli ici : le montant de la livraison est appliqué par la
      // fonction serveur à partir de cette même colonne. Inventer une valeur
      // côté navigateur ferait afficher des frais que la commande ne compte
      // pas. Une zone sans tarif reste « à confirmer ».
      deliveryFees: r.delivery_fees ?? {},
      announcement: r.announcement ?? '',
      // Colonne absente = aucune tranche, donc aucun frais. On n'installe pas
      // de grille par défaut sur une boutique déjà en service : des frais qui
      // apparaissent tout seuls sur une commande, cela ne se fait pas.
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
      // Colonne absente tant que la mise à jour SQL n'est pas passée : la
      // boutique fonctionne sans, simplement sans avis publiés.
      reviews: Array.isArray(r.reviews) ? (r.reviews as StoreSettings['reviews']) : [],
    } satisfies StoreSettings;
  },

  async saveSettings(settings) {
    const colonnes: Row = {
      id: 1,
      whatsapp_number: settings.whatsappNumber,
      whatsapp_link: settings.whatsappLink,
      next_grouping_opening: settings.nextGroupingOpening || null,
      next_grouping_date: settings.nextGroupingDate || null,
      wave_number: settings.waveNumber,
      orange_money_number: settings.orangeMoneyNumber,
      delivery_fees: settings.deliveryFees,
      announcement: settings.announcement,
      pricing: settings.pricing,
      promotions: settings.promotions,
      alert_thresholds: settings.alertThresholds,
      reviews: settings.reviews,
    };

    const envoyer = (corps: Row) =>
      rest('settings?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(corps),
      });

    await enregistrerSansColonnesAbsentes(envoyer, colonnes, [
      { colonne: 'reviews', etiquette: 'les avis clientes' },
      { colonne: 'next_grouping_opening', etiquette: "la date d'ouverture des inscriptions" },
    ]);
    return settings;
  },

  /*
   * Fréquentation. La table `visits` n'accepte que l'insertion côté public :
   * personne ne peut lire les visites depuis le site, et la ligne écrite ne
   * contient ni adresse IP, ni nom, ni cookie de pistage — un identifiant de
   * navigateur tiré au hasard, la page, l'heure.
   */
  async recordVisit(path, visitor) {
    try {
      await rest('visits', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ visitor, path: path.slice(0, 120) }),
      });
    } catch {
      // Une visite non comptée n'est pas un incident : la cliente ne doit
      // rien en voir, et surtout pas un message d'erreur.
    }
  },

  /*
   * Alerte « nouvelle commande ».
   *
   * Tout se passe côté base : le déclencheur installé par mise-a-jour.sql
   * envoie le message. Ici on ne fait que lire et écrire le réglage, et
   * demander un test. Le jeton du robot n'est jamais exposé au site public
   * — la table n'accorde aucun droit au rôle anonyme.
   */
  async getAlertSettings() {
    try {
      const rows = await rest<Row[]>('alert_settings?select=*&id=eq.1');
      const r = rows[0] ?? {};
      return {
        ntfyTopic: r.ntfy_topic ?? '',
        enabled: Boolean(r.enabled),
        includeCustomer: Boolean(r.include_customer),
      } satisfies AlertSettings;
    } catch (error) {
      throw alerteNonInstallee(error);
    }
  },

  async saveAlertSettings(settings) {
    try {
      await rest('alert_settings?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          id: 1,
          ntfy_topic: settings.ntfyTopic.trim(),
          enabled: settings.enabled,
          include_customer: settings.includeCustomer,
          updated_at: new Date().toISOString(),
        }),
      });
    } catch (error) {
      throw alerteNonInstallee(error);
    }
    return settings;
  },

  async testAlert() {
    let requete: number;
    try {
      requete = await rest<number>('rpc/tester_alerte', {
        method: 'POST',
        body: JSON.stringify({}),
      });
    } catch (error) {
      throw alerteNonInstallee(error);
    }

    /*
     * L'envoi est asynchrone : la base met le message en file, un ouvrier
     * l'expédie, la réponse arrive ensuite. On interroge plutôt que
     * d'annoncer un succès qu'on n'a pas constaté.
     *
     * 25 s d'attente, et non 7 : la base laisse désormais 20 s à Telegram
     * pour répondre (constaté en vrai, la seule poignée de main TLS avait
     * pris 4,9 s). Abandonner au bout de 7 s ferait dire « pas de réponse »
     * alors que le message est encore en route.
     */
    for (let essai = 0; essai < 31; essai += 1) {
      await new Promise((r) => setTimeout(r, 800));
      const reponse = await rest<{ ok: boolean; detail: string } | null>('rpc/resultat_alerte', {
        method: 'POST',
        body: JSON.stringify({ requete }),
      });
      if (reponse) {
        return { ok: Boolean(reponse.ok), enAttente: false, detail: reponse.detail ?? '' };
      }
    }
    return {
      ok: false,
      enAttente: true,
      detail:
        "Telegram n'a pas répondu dans les 25 secondes. Regardez votre téléphone : le message " +
        'est peut-être arrivé quand même. Sinon, réessayez — la connexion est parfois lente.',
    };
  },

  async getVisitStats() {
    try {
      const stats = await rest<VisitStats>('rpc/stats_visites', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      return stats;
    } catch (error) {
      // Tant que la mise à jour SQL n'est pas passée, la fonction n'existe
      // pas encore : on le dit en clair plutôt que d'afficher des zéros qui
      // laisseraient croire que personne n'est venu.
      const message = error instanceof Error ? error.message : '';
      if (/stats_visites|PGRST202|404/i.test(message)) {
        throw new Error(
          "La fréquentation n'est pas encore installée dans votre base. " +
            'Exécutez supabase/mise-a-jour.sql dans Supabase, puis revenez ici.',
        );
      }
      throw error;
    }
  },
};
