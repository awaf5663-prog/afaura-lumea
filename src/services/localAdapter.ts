import {
  DELIVERY_ZONES,
  NEXT_GROUPING_DATE,
  ORANGE_MONEY_NUMBER,
  PAYMENT_METHODS,
  WAVE_NUMBER,
  WHATSAPP_LINK,
  WHATSAPP_NUMBER,
} from '@/src/config/site';
import { DEFAULT_ALERT_THRESHOLDS, DEFAULT_PRICING, DEFAULT_PROMOTIONS } from '@/src/config/pricing';
import { SEED_PRODUCTS } from '@/src/data/seed';
import { computeQuote } from '@/src/lib/pricing';
import { findPromotion } from '@/src/lib/pricing/promotions';
import { nextNumber, uid } from '@/src/lib/orderNumber';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import { normalizePhone } from '@/src/lib/format';
import type { Grouping, Order, Product, SheinRequest, StoreSettings } from '@/src/types';
import type { DataSource, OrderDraft, SheinDraft } from './types';

/**
 * Source de données locale (localStorage).
 * Elle rend le site immédiatement fonctionnel — commandes, suivi, admin —
 * sans aucun backend. Les données vivent dans le navigateur : c'est parfait
 * pour démarrer, et l'adaptateur Supabase prend le relais dès qu'il est
 * configuré, sans toucher au reste du code.
 */

function defaultSettings(): StoreSettings {
  return {
    whatsappNumber: WHATSAPP_NUMBER,
    whatsappLink: WHATSAPP_LINK,
    nextGroupingDate: NEXT_GROUPING_DATE,
    waveNumber: WAVE_NUMBER,
    orangeMoneyNumber: ORANGE_MONEY_NUMBER,
    deliveryFees: Object.fromEntries(DELIVERY_ZONES.map((z) => [z.id, z.fee])),
    announcement: '',
    pricing: DEFAULT_PRICING,
    alertThresholds: DEFAULT_ALERT_THRESHOLDS,
    promotions: DEFAULT_PROMOTIONS,
  };
}

function loadGroupings(): Grouping[] {
  return readJson<Grouping[]>(STORAGE_KEYS.groupings, []);
}

/** Groupage qui accueille les nouvelles demandes : ouvert, non plein, clôture la plus proche. */
export function pickOpenGrouping(groupings: Grouping[]): Grouping | null {
  return (
    groupings
      .filter((g) => g.status === 'open' && g.reservedCount + g.manualOrderCount < g.maxOrders)
      .sort((a, b) => {
        if (!a.closingDate) return 1;
        if (!b.closingDate) return -1;
        return new Date(a.closingDate).getTime() - new Date(b.closingDate).getTime();
      })[0] ?? null
  );
}

function loadProducts(): Product[] {
  const stored = readJson<Product[] | null>(STORAGE_KEYS.products, null);
  if (stored && Array.isArray(stored) && stored.length > 0) return stored;
  writeJson(STORAGE_KEYS.products, SEED_PRODUCTS);
  return SEED_PRODUCTS;
}

const delay = <T,>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), 120));

export const localAdapter: DataSource = {
  mode: 'local',

  async listProducts() {
    return delay(loadProducts());
  },

  async saveProduct(product) {
    const products = loadProducts();
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) products[index] = product;
    else products.unshift(product);
    writeJson(STORAGE_KEYS.products, products);
    return delay(product);
  },

  async deleteProduct(id) {
    writeJson(
      STORAGE_KEYS.products,
      loadProducts().filter((p) => p.id !== id),
    );
    await delay(null);
  },

  async createOrder(draft: OrderDraft) {
    // Les prix ne viennent JAMAIS du navigateur : ils sont relus dans le catalogue.
    const products = loadProducts();
    const settings = await this.getSettings();

    const items = draft.items.map((line) => {
      const product = products.find((p) => p.id === line.productId);
      if (!product) throw new Error(`Produit introuvable : ${line.productId}`);
      if (product.status !== 'active') throw new Error(`« ${product.name} » n'est plus disponible.`);
      // Une option retirée de la vente ne doit pas passer, même si le
      // navigateur l'envoie : la vérification se fait ici, pas dans l'écran.
      product.variants.forEach((group) => {
        const chosen = line.options[group.name];
        if (chosen && (group.soldOutOptions ?? []).includes(chosen)) {
          throw new Error(`« ${chosen} » vient d'être vendu. Choisissez un autre modèle.`);
        }
      });

      const quantity = Math.max(1, Math.min(99, Math.trunc(line.quantity)));
      if (product.stock !== null && quantity > product.stock) {
        throw new Error(`Stock insuffisant pour « ${product.name} ».`);
      }
      return {
        productId: product.id,
        name: product.name,
        quantity,
        unitPrice: product.price,
        options: line.options,
      };
    });

    if (items.length === 0) throw new Error('Votre panier est vide.');

    const zone = DELIVERY_ZONES.find((z) => z.id === draft.deliveryZoneId) ?? DELIVERY_ZONES[0];
    const method = PAYMENT_METHODS.find((m) => m.id === draft.paymentMethod) ?? PAYMENT_METHODS[0];
    const rawDeliveryFee = settings.deliveryFees[zone.id] ?? zone.fee;
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    // Les offres sont appliquées ici, à partir des règles enregistrées : le
    // navigateur ne transmet qu'un code et une déclaration, jamais un montant.
    const promotion = findPromotion(settings.promotions, {
      kind: 'store',
      isStudent: draft.isStudent,
      groupingId: null,
      deliveryOptionId: zone.id,
      code: draft.promoCode,
    });
    let deliveryFee = rawDeliveryFee;
    let deliveryFeeBeforePromotion: number | null = null;
    let discount = 0;
    if (promotion) {
      if (promotion.effect.type === 'free_delivery' && rawDeliveryFee !== null && rawDeliveryFee > 0) {
        deliveryFee = 0;
        deliveryFeeBeforePromotion = rawDeliveryFee;
      } else if (promotion.effect.type === 'discount_amount') {
        // Plafonnée au montant connu : une remise ne rend jamais d'argent.
        discount = Math.min(Math.max(0, promotion.effect.amount), subtotal + (rawDeliveryFee ?? 0));
      }
      // « Frais de traitement offerts » ne concerne que le service SHEIN :
      // une commande de la boutique n'en a pas.
    }
    const applied = promotion && (deliveryFeeBeforePromotion !== null || discount > 0);

    const now = new Date().toISOString();
    const order: Order = {
      id: uid(),
      orderNumber: nextNumber('CMD'),
      customerName: draft.customerName.trim(),
      phone: normalizePhone(draft.phone),
      address: draft.address.trim(),
      city: draft.city.trim(),
      note: draft.note?.trim() || undefined,
      deliveryZoneId: zone.id,
      deliveryLabel: zone.label,
      deliveryFee,
      deliveryFeeBeforePromotion,
      subtotal,
      discount,
      promotionLabel: applied ? promotion.label : null,
      promoCode: draft.promoCode.trim(),
      total: subtotal + (deliveryFee ?? 0) - discount,
      paymentMethod: method.id,
      paymentMethodLabel: method.label,
      paymentStatus: 'pending',
      orderStatus: 'received',
      items,
      createdAt: now,
      updatedAt: now,
    };

    const orders = readJson<Order[]>(STORAGE_KEYS.orders, []);
    orders.unshift(order);
    writeJson(STORAGE_KEYS.orders, orders);

    // Décrémente le stock suivi.
    const updated = products.map((p) => {
      if (p.stock === null) return p;
      const line = items.find((i) => i.productId === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.quantity) } : p;
    });
    writeJson(STORAGE_KEYS.products, updated);

    return delay(order);
  },

  async listOrders() {
    return delay(readJson<Order[]>(STORAGE_KEYS.orders, []));
  },

  async findOrder(orderNumber, phone) {
    const wanted = orderNumber.trim().toUpperCase();
    const wantedPhone = normalizePhone(phone);
    const found = readJson<Order[]>(STORAGE_KEYS.orders, []).find(
      (o) => o.orderNumber.toUpperCase() === wanted && o.phone === wantedPhone,
    );
    return delay(found ?? null);
  },

  async updateOrder(id, patch) {
    const orders = readJson<Order[]>(STORAGE_KEYS.orders, []);
    const index = orders.findIndex((o) => o.id === id);
    if (index < 0) throw new Error('Commande introuvable.');
    const next: Order = { ...orders[index], ...patch, updatedAt: new Date().toISOString() };
    next.total = next.subtotal + (next.deliveryFee ?? 0);
    orders[index] = next;
    writeJson(STORAGE_KEYS.orders, orders);
    return delay(next);
  },

  async createSheinRequest(draft: SheinDraft) {
    const cleanItems = draft.items
      .filter((item) => item.productUrl.trim() || item.reference.trim())
      .map((item) => ({
        ...item,
        quantity: Math.max(1, Math.min(99, Math.trunc(item.quantity))),
      }));
    if (cleanItems.length === 0) throw new Error('Ajoutez au moins un article (lien ou référence).');

    // Le devis est recalculé ici, à partir des tarifs enregistrés :
    // le navigateur n'envoie que des prix déclarés et des quantités.
    const settings = await this.getSettings();

    const groupings = loadGroupings();
    const target = pickOpenGrouping(groupings);

    // Le groupage est choisi avant le devis : une promotion peut être réservée
    // à un groupage précis, et la cliente n'a pas son mot à dire là-dessus.
    const quote = computeQuote(cleanItems, draft.deliveryOptionId, settings.pricing, settings.promotions, {
      kind: 'shein',
      isStudent: draft.isStudent,
      groupingId: target?.id ?? null,
      deliveryOptionId: draft.deliveryOptionId,
      code: draft.promoCode,
    });

    const now = new Date().toISOString();
    const request: SheinRequest = {
      id: uid(),
      requestNumber: nextNumber('SHEIN'),
      customerName: draft.customerName.trim(),
      phone: normalizePhone(draft.phone),
      note: draft.note?.trim() || undefined,
      items: cleanItems,
      status: 'received',
      quotedTotal: null,
      groupingId: target?.id ?? null,
      quote,
      deliveryOptionId: quote.deliveryOptionId,
      isStudent: draft.isStudent,
      promoCode: draft.promoCode.trim().toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };

    const all = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []);
    all.unshift(request);
    writeJson(STORAGE_KEYS.sheinRequests, all);

    if (target) {
      const reserved = target.reservedCount + 1;
      const full = reserved + target.manualOrderCount >= target.maxOrders;
      writeJson(
        STORAGE_KEYS.groupings,
        groupings.map((g) =>
          g.id === target.id
            ? { ...g, reservedCount: reserved, status: full ? 'full' : g.status, updatedAt: now }
            : g,
        ),
      );
    }

    return delay(request);
  },

  async listGroupings() {
    return delay(
      [...loadGroupings()].sort((a, b) => b.reference.localeCompare(a.reference)),
    );
  },

  async saveGrouping(grouping) {
    const groupings = loadGroupings();
    const index = groupings.findIndex((g) => g.id === grouping.id);
    const next = { ...grouping, updatedAt: new Date().toISOString() };
    if (index >= 0) groupings[index] = next;
    else groupings.unshift(next);
    writeJson(STORAGE_KEYS.groupings, groupings);
    return delay(next);
  },

  async deleteGrouping(id) {
    writeJson(STORAGE_KEYS.groupings, loadGroupings().filter((g) => g.id !== id));
    // Les demandes rattachées ne sont jamais supprimées : elles redeviennent sans groupage.
    const requests = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []);
    writeJson(
      STORAGE_KEYS.sheinRequests,
      requests.map((r) => (r.groupingId === id ? { ...r, groupingId: null } : r)),
    );
    await delay(null);
  },

  async transferRequests(fromGroupingId, toGroupingId) {
    const now = new Date().toISOString();
    const requests = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []);
    const moved = requests.filter(
      (r) => r.groupingId === fromGroupingId && r.status !== 'cancelled' && r.status !== 'delivered',
    );
    writeJson(
      STORAGE_KEYS.sheinRequests,
      requests.map((r) =>
        moved.some((m) => m.id === r.id) ? { ...r, groupingId: toGroupingId, updatedAt: now } : r,
      ),
    );

    const groupings = loadGroupings().map((g) => {
      if (g.id === fromGroupingId) {
        return { ...g, reservedCount: Math.max(0, g.reservedCount - moved.length), updatedAt: now };
      }
      if (toGroupingId && g.id === toGroupingId) {
        const reserved = g.reservedCount + moved.length;
        const full = reserved + g.manualOrderCount >= g.maxOrders;
        return { ...g, reservedCount: reserved, status: full ? ('full' as const) : g.status, updatedAt: now };
      }
      return g;
    });
    writeJson(STORAGE_KEYS.groupings, groupings);

    return delay(moved.length);
  },

  async listSheinRequests() {
    return delay(readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []));
  },

  async findSheinRequest(requestNumber, phone) {
    const wanted = requestNumber.trim().toUpperCase();
    const wantedPhone = normalizePhone(phone);
    const found = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []).find(
      (r) => r.requestNumber.toUpperCase() === wanted && r.phone === wantedPhone,
    );
    return delay(found ?? null);
  },

  async updateSheinRequest(id, patch) {
    const all = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []);
    const index = all.findIndex((r) => r.id === id);
    if (index < 0) throw new Error('Demande introuvable.');
    const next = { ...all[index], ...patch, updatedAt: new Date().toISOString() };
    all[index] = next;
    writeJson(STORAGE_KEYS.sheinRequests, all);
    return delay(next);
  },

  async getSettings() {
    const stored = readJson<Partial<StoreSettings>>(STORAGE_KEYS.settings, {});
    return delay({ ...defaultSettings(), ...stored });
  },

  async saveSettings(settings) {
    writeJson(STORAGE_KEYS.settings, settings);
    return delay(settings);
  },
};
