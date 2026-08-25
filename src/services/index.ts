import { localAdapter } from './localAdapter';
import { isSupabaseConfigured, supabaseAdapter } from './supabaseAdapter';
import type { DataSource } from './types';

/**
 * Point d'entrée unique des données.
 * Le reste de l'application n'importe QUE `db` : changer de backend
 * ne demande aucune modification dans les composants.
 */
export const db: DataSource = isSupabaseConfigured() ? supabaseAdapter : localAdapter;

export { isSupabaseConfigured };
export type { DataSource, OrderDraft, SheinDraft } from './types';
