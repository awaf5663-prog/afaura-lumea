/** Accès localStorage tolérant aux navigations privées / stockage bloqué. */
export function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* stockage indisponible : l'app continue de fonctionner en mémoire */
  }
}

export function removeKey(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* no-op */
  }
}

export const STORAGE_KEYS = {
  cart: 'lumea.cart.v1',
  products: 'lumea.products.v3',
  orders: 'lumea.orders.v1',
  sheinRequests: 'lumea.shein.v1',
  groupings: 'lumea.groupings.v1',
  settings: 'lumea.settings.v1',
  counters: 'lumea.counters.v1',
  adminSession: 'lumea.admin.session.v1',
  myOrders: 'lumea.myorders.v1',
  myShein: 'lumea.myshein.v1',
} as const;
