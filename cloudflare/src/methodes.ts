/**
 * LE RÉPARTITEUR.
 *
 *  Une méthode, une fonction. Rien d'astucieux ici, et c'est le but : ce
 *  fichier doit se lire comme une table des matières, pour qu'on voie
 *  d'un coup d'œil si une méthode manque ou si deux se ressemblent trop.
 *
 *  Le contrôle d'accès a DÉJÀ eu lieu quand on arrive ici (voir index.ts
 *  et acces.ts). Une seule exception passe plus loin : `listGroupings`,
 *  qui a besoin de savoir QUI appelle — la boutique voit le coût
 *  logistique, une cliente non.
 */
import type { Env } from './index';
import { ErreurLisible } from './index';
import * as catalogue from './catalogue';
import * as commandes from './commandes';
import * as shein from './shein';
import * as divers from './divers';

type Corps = Record<string, unknown>;
type Methode = (corps: Corps, env: Env, boutique: boolean) => Promise<unknown>;

const TABLE: Record<string, Methode> = {
  // Catalogue
  listProducts: catalogue.listProducts,
  getProductImages: catalogue.getProductImages,
  saveProduct: catalogue.saveProduct,
  deleteProduct: catalogue.deleteProduct,

  // Commandes
  createOrder: commandes.createOrder,
  findOrder: commandes.findOrder,
  listOrders: commandes.listOrders,
  updateOrder: commandes.updateOrder,
  updateOrdersTrash: commandes.updateOrdersTrash,
  deleteOrders: commandes.deleteOrders,

  // SHEIN
  createSheinRequest: shein.createSheinRequest,
  findSheinRequest: shein.findSheinRequest,
  listSheinRequests: shein.listSheinRequests,
  updateSheinRequest: shein.updateSheinRequest,
  updateSheinTrash: shein.updateSheinTrash,
  deleteSheinRequests: shein.deleteSheinRequests,

  // Groupages
  listGroupings: divers.listGroupings,
  saveGrouping: divers.saveGrouping,
  deleteGrouping: divers.deleteGrouping,
  transferRequests: divers.transferRequests,

  // Réglages
  getSettings: divers.getSettings,
  saveSettings: divers.saveSettings,

  // Fréquentation
  recordVisit: divers.recordVisit,
  getVisitStats: divers.getVisitStats,

  // Alertes
  getAlertSettings: divers.getAlertSettings,
  saveAlertSettings: divers.saveAlertSettings,
  testAlert: divers.testAlert,
};

export async function appliquer(methode: string, corps: unknown, env: Env, boutique: boolean) {
  const fonction = Object.prototype.hasOwnProperty.call(TABLE, methode) ? TABLE[methode] : undefined;
  /*
   * Ne devrait jamais arriver : acces.ts a déjà refusé l'inconnu. Mais si
   * les deux tables se désaccordaient un jour, le défaut doit être un
   * REFUS, pas un appel à une fonction absente.
   */
  if (!fonction) throw new ErreurLisible('Requête refusée.', 404);
  return fonction((corps && typeof corps === 'object' ? corps : {}) as Corps, env, boutique);
}

/** Les méthodes réellement branchées — pour que les recettes les comparent. */
export const BRANCHEES = Object.keys(TABLE);
