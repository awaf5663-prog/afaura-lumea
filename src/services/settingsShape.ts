import {
  DEFAULT_ALERT_THRESHOLDS,
  DEFAULT_PRICING,
  DEFAULT_PROMOTIONS,
} from '@/src/config/pricing';
import type { AlertThresholds, PricingConfig, Promotion, StoreSettings } from '@/src/types';

/**
 * Remise en forme des réglages lus depuis une source externe.
 *
 * Pourquoi ce fichier existe : la ligne `settings` créée par schema.sql part
 * avec `pricing = '{}'` et `alert_thresholds = '{}'`. Un simple `?? DEFAULT`
 * ne rattrape pas ça — `{}` n'est ni `null` ni `undefined` — et l'admin
 * plantait alors sur `pricing.tiers.map(...)` (page blanche). Même risque
 * côté localStorage, où un navigateur peut garder des réglages enregistrés
 * avant l'ajout d'un champ.
 *
 * La règle est donc : on complète champ par champ, et une valeur vide
 * (objet sans clés, tableau sans élément) compte comme absente.
 */

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Renvoie la valeur si elle est réellement renseignée, sinon la valeur par défaut. */
function filled<T>(value: unknown, fallback: T): T {
  if (value === null || value === undefined) return fallback;
  if (Array.isArray(value)) return (value.length ? value : fallback) as T;
  if (isObject(value)) return (Object.keys(value).length ? value : fallback) as T;
  return value as T;
}

export function normalizePricing(raw: unknown): PricingConfig {
  const p = isObject(raw) ? raw : {};
  return {
    strategy: filled(p.strategy, DEFAULT_PRICING.strategy),
    tiers: filled(p.tiers, DEFAULT_PRICING.tiers),
    valuePercent: {
      ...DEFAULT_PRICING.valuePercent,
      ...(isObject(p.valuePercent) ? p.valuePercent : {}),
    },
    deliveryOptions: filled(p.deliveryOptions, DEFAULT_PRICING.deliveryOptions),
    conversionRates: filled(p.conversionRates, DEFAULT_PRICING.conversionRates),
    defaultCurrency: filled(p.defaultCurrency, DEFAULT_PRICING.defaultCurrency),
  };
}

export function normalizeAlertThresholds(raw: unknown): AlertThresholds {
  const t = isObject(raw) ? raw : {};
  return {
    warning: filled(t.warning, DEFAULT_ALERT_THRESHOLDS.warning),
    almostFull: filled(t.almostFull, DEFAULT_ALERT_THRESHOLDS.almostFull),
  };
}

export function normalizePromotions(raw: unknown): Promotion[] {
  if (!Array.isArray(raw)) return DEFAULT_PROMOTIONS;
  // Un tableau vide est un choix légitime : la boutique a pu supprimer
  // toutes ses offres. On ne les réinstalle donc pas.
  return raw as Promotion[];
}

/** Complète des réglages partiels (base ou navigateur) en réglages utilisables. */
export function normalizeSettings(raw: unknown, base: StoreSettings): StoreSettings {
  const r = isObject(raw) ? raw : {};
  return {
    ...base,
    ...r,
    deliveryFees: isObject(r.deliveryFees) ? (r.deliveryFees as StoreSettings['deliveryFees']) : base.deliveryFees,
    pricing: normalizePricing(r.pricing ?? base.pricing),
    alertThresholds: normalizeAlertThresholds(r.alertThresholds ?? base.alertThresholds),
    promotions: 'promotions' in r ? normalizePromotions(r.promotions) : base.promotions,
  };
}
