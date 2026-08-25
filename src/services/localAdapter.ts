import {
  DELIVERY_ZONES,
  NEXT_GROUPING_DATE,
  ORANGE_MONEY_NUMBER,
  PAYMENT_METHODS,
  WAVE_NUMBER,
  WHATSAPP_LINK,
  WHATSAPP_NUMBER,
} from '@/src/config/site';
import { SEED_PRODUCTS } from '@/src/data/seed';
import { nextNumber, uid } from '@/src/lib/orderNumber';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import { normalizePhone } from '@/src/lib/format';
import type { Order, Product, SheinRequest, StoreSettings } from '@/src/types';
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
  };
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
    const deliveryFee = settings.deliveryFees[zone.id] ?? zone.fee;
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

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
      subtotal,
      total: subtotal + (deliveryFee ?? 0),
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
      createdAt: now,
      updatedAt: now,
    };

    const all = readJson<SheinRequest[]>(STORAGE_KEYS.sheinRequests, []);
    all.unshift(request);
    writeJson(STORAGE_KEYS.sheinRequests, all);
    return delay(request);
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
