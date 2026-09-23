import { localAdapter } from './localAdapter';
import { isSupabaseConfigured, supabaseAdapter } from './supabaseAdapter';
import { cloudflareAdapter, isWorkerConfigured } from './cloudflareAdapter';
import { notifyDataChanged } from './changes';
import type { DataSource } from './types';

/**
 * Point d'entrée unique des données.
 * Le reste de l'application n'importe QUE `db` : changer de backend
 * ne demande aucune modification dans les composants.
 *
 * L'ORDRE COMPTE. Le Worker Cloudflare passe avant Supabase : le jour où
 * la boutique déménage, les deux configurations coexistent forcément un
 * moment — le temps de vérifier que tout répond avant d'effacer
 * l'ancienne. Sans ordre déclaré, on ne saurait pas laquelle des deux
 * sert vraiment, et on corrigerait une base pendant que le site lit
 * l'autre. Avec cet ordre, la réponse est toujours la même : dès que
 * VITE_WORKER_URL existe, c'est Cloudflare, et rien d'autre.
 */
const source: DataSource = isWorkerConfigured()
  ? cloudflareAdapter
  : isSupabaseConfigured()
    ? supabaseAdapter
    : localAdapter;

/**
 * Quelle source sert, en un mot.
 *
 * Les écrans posaient jusqu'ici la question « Supabase est-il branché ? »
 * alors qu'ils voulaient savoir « les commandes sont-elles partagées entre
 * les appareils, ou seulement dans ce navigateur ? ». Ce n'est pas la même
 * question, et la différence s'est vue le jour où une troisième source est
 * arrivée.
 */
export const modeDonnees = (): DataSource['mode'] => source.mode;

/** `true` dès qu'un vrai serveur répond — Cloudflare ou Supabase. */
export const isServeurConfigure = (): boolean => source.mode !== 'local';

/**
 * Toute méthode qui écrit prévient les écrans ouverts.
 *
 * Passer par un intermédiaire plutôt que d'ajouter l'appel à la main dans
 * chaque méthode : une méthode ajoutée plus tard est couverte d'office, et on
 * ne peut pas oublier le jour où on est pressé. La convention de nommage
 * (create / update / save / delete / transfer) est la règle — une nouvelle
 * méthode qui écrit doit suivre ce préfixe.
 */
const WRITES = /^(create|update|save|delete|transfer)/;

export const db: DataSource = new Proxy(source, {
  get(target, property, receiver) {
    const value = Reflect.get(target, property, receiver);
    if (typeof value !== 'function') return value;
    const name = String(property);
    if (!WRITES.test(name)) return value.bind(target);
    return async (...args: unknown[]) => {
      const result = await (value as (...a: unknown[]) => Promise<unknown>).apply(target, args);
      notifyDataChanged();
      return result;
    };
  },
});

export { isSupabaseConfigured };
export { isWorkerConfigured };
export { onDataChanged } from './changes';
export type { DataSource, OrderDraft, SheinDraft, VisitPeriod, VisitStats } from './types';
