import { readJson, writeJson } from './storage';

/**
 * Identifiant de navigateur pour le comptage des visites.
 *
 * Ce n'est pas une identité : c'est un numéro tiré au hasard, sans lien avec
 * un nom, un téléphone ou une adresse IP. Il sert uniquement à ne pas compter
 * dix pages vues comme dix personnes. Effacer les données du navigateur suffit
 * à en repartir un autre — et ce chiffre-là redevient donc une estimation.
 */
const KEY = 'lumea.visiteur.v1';

/** 16 caractères : assez pour ne pas se croiser, assez court pour la base. */
function tirage(): string {
  const bytes = new Uint8Array(8);
  try {
    crypto.getRandomValues(bytes);
  } catch {
    for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function visitorId(): string {
  const stocke = readJson<string>(KEY, '');
  if (typeof stocke === 'string' && /^[0-9a-f]{16}$/.test(stocke)) return stocke;
  const neuf = tirage();
  writeJson(KEY, neuf);
  return neuf;
}

/**
 * Garde-fou contre le double comptage immédiat.
 *
 * React remonte parfois un écran deux fois de suite ; ce n'est pas deux
 * visites. Au-delà de quelques secondes en revanche, une page rouverte est
 * une vraie page vue — c'est exactement ce que compte la colonne « pages
 * vues », et l'écraser fausserait le chiffre dans l'autre sens.
 */
const FENETRE = 5 * 1000;
const vues = new Map<string, number>();

export function shouldRecord(path: string, now = Date.now()): boolean {
  const dernier = vues.get(path);
  if (dernier !== undefined && now - dernier < FENETRE) return false;
  vues.set(path, now);
  return true;
}
