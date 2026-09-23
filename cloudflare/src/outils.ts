/**
 * Petits outils partagés par les méthodes du Worker.
 */
import { ErreurLisible } from './index';

/** Lit du JSON rangé en texte dans la base. Rend `secours` si c'est illisible. */
export function lireJson<T>(valeur: unknown, secours: T): T {
  if (typeof valeur !== 'string' || valeur === '') return secours;
  try {
    const v = JSON.parse(valeur);
    return v === null ? secours : (v as T);
  } catch {
    /* Une colonne abîmée ne doit pas faire tomber la boutique entière. */
    return secours;
  }
}

/** 0/1 de SQLite vers vrai/faux. */
export const vrai = (v: unknown): boolean => v === 1 || v === true;
/** vrai/faux vers 0/1 pour SQLite. */
export const bit = (v: unknown): 0 | 1 => (v ? 1 : 0);

export const maintenant = (): string => new Date().toISOString();

export const identifiant = (): string => crypto.randomUUID();

/** Un entier propre, borné. Tout ce qui n'est pas un nombre vaut `defaut`. */
export function entier(v: unknown, defaut = 0, min = -Infinity, max = Infinity): number {
  const n = typeof v === 'number' ? v : Number(v);
  if (!Number.isFinite(n)) return defaut;
  return Math.min(max, Math.max(min, Math.trunc(n)));
}

/** Une chaîne propre, taillée. Protège la base d'un champ démesuré. */
export function texte(v: unknown, max = 500): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : '';
}

export function exige(condition: unknown, message: string, statut = 400): asserts condition {
  if (!condition) throw new ErreurLisible(message, statut);
}

/**
 * Le prochain numéro d'une série — CMD-2026-00001, SHE-2026-00001.
 *
 * Postgres avait des séquences ; SQLite n'en a pas. On incrémente une ligne
 * et on RELIT la valeur dans la même instruction (`returning`), ce qui évite
 * que deux commandes simultanées reçoivent le même numéro.
 */
export async function prochainNumero(db: D1Database, compteur: string, prefixe: string) {
  const ligne = await db
    .prepare('update compteurs set valeur = valeur + 1 where nom = ?1 returning valeur')
    .bind(compteur)
    .first<{ valeur: number }>();
  exige(ligne, `Compteur « ${compteur} » absent de la base.`, 500);
  const annee = new Date().getUTCFullYear();
  return `${prefixe}-${annee}-${String(ligne!.valeur).padStart(5, '0')}`;
}

/**
 * LE PRIX D'UN ARTICLE, D'APRÈS LA FICHE — jamais d'après le navigateur.
 *
 * Une option peut porter son propre prix (« 3 mètres », « coffret »). Les
 * groupes sont parcourus DANS L'ORDRE ALPHABÉTIQUE : si deux groupes
 * portaient un prix, le montant ne doit pas dépendre de l'ordre dans lequel
 * le JSON a été rangé. Le site applique la même règle, et Postgres
 * l'appliquait déjà.
 */
export function prixOption(
  prix: number,
  optionPrices: Record<string, Record<string, unknown>>,
  choix: Record<string, unknown>,
): number {
  if (!optionPrices || typeof optionPrices !== 'object') return prix;
  for (const groupe of Object.keys(optionPrices).sort()) {
    const choisi = choix?.[groupe];
    if (typeof choisi !== 'string') continue;
    const valeur = optionPrices[groupe]?.[choisi];
    if (typeof valeur === 'number' && Number.isFinite(valeur)) {
      return Math.max(0, Math.trunc(valeur));
    }
  }
  return prix;
}

/**
 * LES FRAIS DE TRAITEMENT, d'après la grille réglée dans l'administration.
 *
 * Première tranche qui contient ce nombre d'articles, dans l'ordre de la
 * grille — même règle qu'à l'affichage. Une tranche sans montant est une
 * tranche « devis manuel » : rien n'est facturé automatiquement.
 */
export function fraisBoutique(articles: number, tranches: unknown): number {
  if (!articles || articles <= 0 || !Array.isArray(tranches)) return 0;
  for (const t of tranches as Array<Record<string, unknown>>) {
    const min = entier(t?.minItems, 1);
    if (articles < min) continue;
    const max = t?.maxItems;
    if (typeof max === 'number' && articles > max) continue;
    const frais = t?.fee;
    if (typeof frais === 'number' && Number.isFinite(frais)) return Math.max(0, Math.trunc(frais));
    return 0;
  }
  return 0;
}
