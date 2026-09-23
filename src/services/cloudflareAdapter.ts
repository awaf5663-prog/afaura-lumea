/**
 * ─────────────────────────────────────────────────────────────
 *  LA BOUTIQUE PARLE AU WORKER CLOUDFLARE
 * ─────────────────────────────────────────────────────────────
 *  Une seule adresse, POST /api/<methode>, un corps JSON. Vingt-sept
 *  méthodes, vingt-sept appels : aucune traduction d'adresses, donc aucun
 *  endroit où se tromper d'adresse.
 *
 *  CE FICHIER NE CALCULE AUCUN MONTANT. Il envoie des choix — quels
 *  articles, combien, vers quelle zone — et lit ce que le Worker répond.
 *  Les prix, les frais, les remises se décident là-bas, où la cliente
 *  n'écrit pas.
 *
 *  Les convertisseurs viennent de l'adaptateur Supabase, et c'est voulu :
 *  le Worker rend des lignes de la même forme. Deux jeux finiraient par se
 *  contredire — un champ ajouté ici, oublié là.
 */
import type {
  AlertSettings, AlertTestResult, DataSource, OrderDraft, SheinDraft, VisitStats,
} from './types';
import type { Grouping, Order, Product, SheinRequest, StoreSettings } from '@/src/types';
import { fromGrouping, fromProduct, toGrouping, toOrder, toProduct, toShein } from './supabaseAdapter';
import { aggregateVisits, type VisitEntry } from './visitStats';
import { normalizeSettings } from './settingsShape';
import { defaultSettings } from './localAdapter';

const env = import.meta.env;

/**
 * L'adresse du Worker. Vide = on ne passe pas par Cloudflare.
 *
 * LA BARRE FINALE EST RETIRÉE, et ce n'est pas de la coquetterie. Les
 * appels se construisent en `adresse + '/api/' + méthode` : une adresse
 * qui finit déjà par une barre donne « …dev//api/getSettings », et le
 * Worker, qui cherche un chemin commençant par « /api/ », ne reconnaît
 * plus rien. Il répond « Requête refusée » à TOUT.
 *
 * La panne ne ressemble pas à sa cause : la boutique est vide, l'admin
 * ne s'ouvre pas, et rien ne dit qu'une barre est en trop. C'est arrivé
 * à la mise en service, où l'adresse avait été collée depuis Cloudflare
 * — qui l'affiche justement avec sa barre.
 *
 * On enlève donc les espaces ET les barres, une fois pour toutes, plutôt
 * que de compter sur la personne qui remplira la variable.
 */
export const WORKER_URL: string = (env.VITE_WORKER_URL ?? '')
  .toString()
  .trim()
  .replace(/\/+$/, '');

/**
 * Le mot de passe de l'administration.
 *
 * Il n'est PAS dans la configuration du site : il serait alors dans le
 * JavaScript envoyé à toutes les visiteuses. La boutique le saisit à la
 * connexion, et il reste dans l'onglet — le temps de la session, pas
 * au-delà.
 */
const CLE_SESSION = 'lumea.worker.motdepasse';

export function ouvrirSession(motDePasse: string): void {
  try {
    sessionStorage.setItem(CLE_SESSION, motDePasse);
  } catch {
    /* Stockage refusé : la session ne survivra pas au changement de page,
       et la boutique devra se reconnecter. Mieux que de ne pas entrer. */
  }
}

export function fermerSession(): void {
  try {
    sessionStorage.removeItem(CLE_SESSION);
  } catch {
    /* rien à faire */
  }
}

function motDePasse(): string | null {
  try {
    return sessionStorage.getItem(CLE_SESSION);
  } catch {
    return null;
  }
}

export const isWorkerConfigured = (): boolean => WORKER_URL !== '';

/** Ce que le Worker répond quand il refuse. */
export class ErreurWorker extends Error {
  constructor(message: string, readonly statut: number) {
    super(message);
  }
}

async function appeler<T>(methode: string, corps: Record<string, unknown> = {}): Promise<T> {
  const cle = motDePasse();
  let reponse: Response;
  try {
    reponse = await fetch(`${WORKER_URL}/api/${methode}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(cle ? { authorization: `Bearer ${cle}` } : {}),
      },
      body: JSON.stringify(corps),
    });
  } catch {
    /* Réseau coupé, Worker injoignable : on le dit dans les mots de la
       boutique, pas dans ceux du navigateur. */
    throw new ErreurWorker(
      "La boutique n'arrive pas à joindre ses données. Vérifiez votre connexion.",
      0,
    );
  }

  const texte = await reponse.text();
  let charge: { resultat?: unknown; erreur?: string } = {};
  try {
    charge = texte ? JSON.parse(texte) : {};
  } catch {
    throw new ErreurWorker('Réponse illisible du serveur.', reponse.status);
  }

  if (!reponse.ok) {
    if (reponse.status === 401) {
      throw new ErreurWorker(
        'Réservé à la boutique : reconnectez-vous à l’espace administrateur.',
        401,
      );
    }
    throw new ErreurWorker(charge.erreur ?? "Quelque chose n'a pas fonctionné.", reponse.status);
  }
  return charge.resultat as T;
}

type Ligne = Record<string, unknown>;

export const cloudflareAdapter: DataSource = {
  mode: 'cloudflare',

  // ── Catalogue ──────────────────────────────────────────────────────
  async listProducts(): Promise<Product[]> {
    return (await appeler<Ligne[]>('listProducts')).map((r) => toProduct(r as never));
  },
  async getProductImages(productId: string): Promise<string[]> {
    return appeler<string[]>('getProductImages', { productId });
  },
  async saveProduct(product: Product): Promise<Product> {
    const ligne = await appeler<Ligne>('saveProduct', { product: fromProduct(product) });
    return toProduct(ligne as never);
  },
  async deleteProduct(id: string): Promise<void> {
    await appeler('deleteProduct', { id });
  },

  // ── Commandes ──────────────────────────────────────────────────────
  async createOrder(draft: OrderDraft): Promise<Order> {
    const ligne = await appeler<Ligne>('createOrder', {
      customer_name: draft.customerName,
      phone: draft.phone,
      address: draft.address,
      city: draft.city,
      note: draft.note ?? '',
      delivery_zone_id: draft.deliveryZoneId,
      payment_method: draft.paymentMethod,
      promo_code: draft.promoCode,
      is_student: draft.isStudent,
      /* On n'envoie QUE des choix : identifiant, quantité, options. Aucun
         prix — celui de la fiche fait foi, et il est relu là-bas. */
      items: draft.items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        options: i.options,
      })),
    });
    return toOrder(ligne as never);
  },
  async listOrders(): Promise<Order[]> {
    return (await appeler<Ligne[]>('listOrders')).map((r) => toOrder(r as never));
  },
  async findOrder(orderNumber: string, phone: string): Promise<Order | null> {
    const ligne = await appeler<Ligne | null>('findOrder', { orderNumber, phone });
    return ligne ? toOrder(ligne as never) : null;
  },
  async updateOrder(id, patch): Promise<Order> {
    const ligne = await appeler<Ligne>('updateOrder', {
      id,
      ...(patch.orderStatus !== undefined ? { order_status: patch.orderStatus } : {}),
      ...(patch.paymentStatus !== undefined ? { payment_status: patch.paymentStatus } : {}),
      ...(patch.deliveryFee !== undefined ? { delivery_fee: patch.deliveryFee } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
      ...(patch.customerName !== undefined ? { customer_name: patch.customerName } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.address !== undefined ? { address: patch.address } : {}),
      ...(patch.city !== undefined ? { city: patch.city } : {}),
    });
    return toOrder(ligne as never);
  },
  async updateOrdersTrash(ids: string[], trashed: boolean): Promise<void> {
    await appeler('updateOrdersTrash', { ids, trashed });
  },
  async deleteOrders(ids: string[]): Promise<void> {
    await appeler('deleteOrders', { ids });
  },

  // ── SHEIN ──────────────────────────────────────────────────────────
  async createSheinRequest(draft: SheinDraft): Promise<SheinRequest> {
    const ligne = await appeler<Ligne>('createSheinRequest', {
      customer_name: draft.customerName,
      phone: draft.phone,
      note: draft.note ?? '',
      delivery_option_id: draft.deliveryOptionId,
      is_student: draft.isStudent,
      promo_code: draft.promoCode,
      items: draft.items.map((i) => ({
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
    });
    return toShein(ligne as never);
  },
  async listSheinRequests(): Promise<SheinRequest[]> {
    return (await appeler<Ligne[]>('listSheinRequests')).map((r) => toShein(r as never));
  },
  async findSheinRequest(requestNumber: string, phone: string): Promise<SheinRequest | null> {
    const ligne = await appeler<Ligne | null>('findSheinRequest', { requestNumber, phone });
    return ligne ? toShein(ligne as never) : null;
  },
  async updateSheinRequest(id, patch): Promise<SheinRequest> {
    const ligne = await appeler<Ligne>('updateSheinRequest', {
      id,
      ...(patch.status !== undefined ? { status: patch.status } : {}),
      ...(patch.quotedTotal !== undefined ? { quoted_total: patch.quotedTotal } : {}),
      ...(patch.customerName !== undefined ? { customer_name: patch.customerName } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.note !== undefined ? { note: patch.note } : {}),
    });
    return toShein(ligne as never);
  },
  async updateSheinTrash(ids: string[], trashed: boolean): Promise<void> {
    await appeler('updateSheinTrash', { ids, trashed });
  },
  async deleteSheinRequests(ids: string[]): Promise<void> {
    await appeler('deleteSheinRequests', { ids });
  },

  // ── Groupages ──────────────────────────────────────────────────────
  async listGroupings(): Promise<Grouping[]> {
    return (await appeler<Ligne[]>('listGroupings')).map((r) => toGrouping(r as never));
  },
  async saveGrouping(grouping: Grouping): Promise<Grouping> {
    const ligne = await appeler<Ligne>('saveGrouping', { grouping: fromGrouping(grouping) });
    return toGrouping(ligne as never);
  },
  async deleteGrouping(id: string): Promise<void> {
    await appeler('deleteGrouping', { id });
  },
  async transferRequests(fromGroupingId: string, toGroupingId: string | null): Promise<number> {
    return appeler<number>('transferRequests', { fromGroupingId, toGroupingId });
  },

  // ── Réglages ───────────────────────────────────────────────────────
  async getSettings(): Promise<StoreSettings> {
    /* Une base est nécessaire : elle porte les valeurs du fichier de
       configuration, que la base de données ne connaît pas. C'est la même
       qu'en mode local. */
    return normalizeSettings(await appeler<Ligne>('getSettings'), defaultSettings());
  },
  async saveSettings(settings: StoreSettings): Promise<StoreSettings> {
    const r = await appeler<Ligne>('saveSettings', { settings: versLignes(settings) });
    return normalizeSettings(r, defaultSettings());
  },

  // ── Fréquentation ──────────────────────────────────────────────────
  async recordVisit(path: string, visitor: string): Promise<void> {
    /* Un comptage n'a jamais à faire échouer une page. */
    try {
      await appeler('recordVisit', { path, visitor });
    } catch {
      /* silence voulu */
    }
  },
  async getVisitStats(): Promise<VisitStats> {
    /* Le Worker rend les visites brutes ; l'agrégation est CELLE DU SITE,
       la même qu'en mode local — sans quoi les deux donneraient des
       chiffres différents. */
    return aggregateVisits(await appeler<VisitEntry[]>('getVisitStats'));
  },

  // ── Alertes ────────────────────────────────────────────────────────
  async getAlertSettings(): Promise<AlertSettings> {
    const r = await appeler<Ligne>('getAlertSettings');
    /*
     * Le jeton Telegram reste en base mais ne remonte PAS jusqu'aux écrans :
     * le contrat du site ne le demande pas, et un secret qui ne voyage pas
     * ne fuit pas. La boutique règle ses alertes par ntfy.
     */
    return {
      ntfyTopic: String(r.ntfy_topic ?? ''),
      includeCustomer: r.include_customer === true,
      enabled: r.enabled === true,
    };
  },
  async saveAlertSettings(settings: AlertSettings): Promise<AlertSettings> {
    await appeler('saveAlertSettings', {
      settings: {
        ntfy_topic: settings.ntfyTopic,
        include_customer: settings.includeCustomer,
        enabled: settings.enabled,
      },
    });
    return this.getAlertSettings();
  },
  async testAlert(): Promise<AlertTestResult> {
    const r = await appeler<{ envoye: boolean; raison: string | null }>('testAlert');
    return { ok: r.envoye, enAttente: false, detail: r.raison ?? '' };
  },
};

/** Les réglages, du vocabulaire des écrans vers celui de la base. */
function versLignes(s: StoreSettings): Record<string, unknown> {
  const r = s as unknown as Record<string, unknown>;
  return {
    whatsapp_number: r.whatsappNumber ?? '',
    whatsapp_link: r.whatsappLink ?? '',
    next_grouping_opening: r.nextGroupingOpening ?? null,
    next_grouping_date: r.nextGroupingDate ?? null,
    wave_number: r.waveNumber ?? '',
    wave_link: r.waveLink ?? '',
    orange_money_number: r.orangeMoneyNumber ?? '',
    orange_money_link: r.orangeMoneyLink ?? '',
    delivery_fees: r.deliveryFees ?? {},
    announcement: r.announcement ?? '',
    pricing: r.pricing ?? {},
    promotions: r.promotions ?? [],
    alert_thresholds: r.alertThresholds ?? {},
    reviews: r.reviews ?? [],
  };
}

/**
 * Connexion à l'administration.
 *
 * Il n'y a pas de méthode « vérifier le mot de passe » dans le Worker, et
 * c'est volontaire : une telle méthode serait un banc d'essai ouvert à
 * tous, où l'on peut essayer mille mots de passe sans rien casser. On
 * range donc le mot de passe, puis on appelle une méthode RÉSERVÉE à la
 * boutique. Si elle répond, le mot de passe est bon ; si elle refuse, on
 * le jette aussitôt — il ne reste pas dans l'onglet après un échec.
 */
export async function cloudflareSignIn(motDePasse: string): Promise<void> {
  ouvrirSession(motDePasse);
  try {
    await appeler('getAlertSettings');
  } catch (erreur) {
    fermerSession();
    if (erreur instanceof ErreurWorker && erreur.statut === 401) {
      throw new Error('Code incorrect.');
    }
    throw erreur;
  }
}

export function cloudflareSignOut(): void {
  fermerSession();
}
