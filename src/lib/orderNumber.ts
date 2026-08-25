import { STORAGE_KEYS, readJson, writeJson } from './storage';

type Counters = Record<string, number>;

/**
 * Numérotation lisible : CMD-2026-00124 / SHEIN-2026-00124.
 * En mode local, le compteur vit dans le navigateur du commerçant.
 * En mode Supabase, c'est une séquence Postgres (voir supabase/schema.sql)
 * afin de garantir l'unicité entre appareils.
 */
export function nextNumber(prefix: 'CMD' | 'SHEIN'): string {
  const year = new Date().getFullYear();
  const key = `${prefix}-${year}`;
  const counters = readJson<Counters>(STORAGE_KEYS.counters, {});
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeJson(STORAGE_KEYS.counters, counters);
  return `${prefix}-${year}-${String(next).padStart(5, '0')}`;
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
