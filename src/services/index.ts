import { localAdapter } from './localAdapter';
import { isSupabaseConfigured, supabaseAdapter } from './supabaseAdapter';
import { notifyDataChanged } from './changes';
import type { DataSource } from './types';

/**
 * Point d'entrée unique des données.
 * Le reste de l'application n'importe QUE `db` : changer de backend
 * ne demande aucune modification dans les composants.
 */
const source: DataSource = isSupabaseConfigured() ? supabaseAdapter : localAdapter;

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
export { onDataChanged } from './changes';
export type { DataSource, OrderDraft, SheinDraft } from './types';
