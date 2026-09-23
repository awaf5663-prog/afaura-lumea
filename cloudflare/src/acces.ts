/**
 * ═══════════════════════════════════════════════════════════════════════
 *  QUI A LE DROIT D'APPELER QUOI
 * ═══════════════════════════════════════════════════════════════════════
 *
 *  Postgres portait treize politiques RLS : la base elle-même refusait
 *  une lecture interdite, même si le code se trompait. SQLite n'a rien de
 *  tel. Cette garantie doit donc vivre ici — et vivre EN UN SEUL ENDROIT,
 *  déclarée, pas dispersée dans vingt-sept fonctions où l'on finirait par
 *  en oublier une.
 *
 *  La règle de lecture est volontairement inversée : une méthode ABSENTE
 *  de cette table est refusée. Ajouter une méthode sans y penser la rend
 *  inaccessible — c'est bruyant, et c'est exactement ce qu'on veut. Le
 *  contraire (ouverte par défaut) laisserait passer un oubli en silence.
 */

/** Ce qu'une méthode exige de celui qui l'appelle. */
export type Exigence =
  /** N'importe qui : une cliente qui passe sur la boutique. */
  | 'public'
  /** La boutique seule, connectée à l'administration. */
  | 'boutique';

export const ACCES: Record<string, Exigence> = {
  // ── Le catalogue ─────────────────────────────────────────────────────
  //  Une boutique en ligne se lit sans se connecter. Écrire, non.
  listProducts: 'public',
  getProductImages: 'public',
  saveProduct: 'boutique',
  deleteProduct: 'boutique',

  // ── Les commandes ────────────────────────────────────────────────────
  //  Une cliente peut EN CRÉER une, et retrouver LA SIENNE — avec son
  //  numéro ET son téléphone, les deux. Elle ne peut pas les lister :
  //  ce serait donner le carnet d'adresses de la boutique.
  createOrder: 'public',
  findOrder: 'public',
  listOrders: 'boutique',
  updateOrder: 'boutique',
  updateOrdersTrash: 'boutique',
  deleteOrders: 'boutique',

  // ── Les demandes SHEIN ───────────────────────────────────────────────
  createSheinRequest: 'public',
  findSheinRequest: 'public',
  listSheinRequests: 'boutique',
  updateSheinRequest: 'boutique',
  updateSheinTrash: 'boutique',
  deleteSheinRequests: 'boutique',

  // ── Les groupages ────────────────────────────────────────────────────
  //  La boutique annonce ses dates sur les pages publiques : la lecture
  //  est donc ouverte. Le coût logistique, lui, ne sort jamais — c'est le
  //  Worker qui le retire, voir groupages.ts.
  listGroupings: 'public',
  saveGrouping: 'boutique',
  deleteGrouping: 'boutique',
  transferRequests: 'boutique',

  // ── Les réglages ─────────────────────────────────────────────────────
  getSettings: 'public',
  saveSettings: 'boutique',

  // ── La fréquentation ─────────────────────────────────────────────────
  //  Signaler sa visite : tout le monde. La consulter : la boutique.
  //  C'était déjà la règle dans Postgres, on la garde telle quelle.
  recordVisit: 'public',
  getVisitStats: 'boutique',

  // ── Les alertes ──────────────────────────────────────────────────────
  //  CES RÉGLAGES PORTENT DES SECRETS : le jeton du robot Telegram et le
  //  canal ntfy. Qui connaît le canal lit les notifications de commandes.
  //  Jamais public, à aucune condition.
  getAlertSettings: 'boutique',
  saveAlertSettings: 'boutique',
  testAlert: 'boutique',
};

/** Les méthodes que le site est autorisé à appeler, et rien d'autre. */
export const METHODES = Object.keys(ACCES);

/**
 * Cette méthode existe-t-elle, et qu'exige-t-elle ?
 * Rend `null` pour une méthode inconnue — qui sera refusée.
 */
export function exigence(methode: string): Exigence | null {
  /* `?? null` et non `ACCES[methode]` : avec `noUncheckedIndexedAccess`,
     une lecture d'index peut valoir `undefined`, et on veut UNE seule
     façon de dire « inconnue ». */
  return Object.prototype.hasOwnProperty.call(ACCES, methode) ? (ACCES[methode] ?? null) : null;
}
