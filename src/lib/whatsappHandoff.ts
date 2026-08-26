/**
 * Ouverture automatique de WhatsApp après un envoi.
 *
 * La commande est d'abord enregistrée — c'est elle qui donne le numéro de
 * suivi et qui apparaît dans l'administration — puis le message part sur
 * WhatsApp sans que la cliente ait un second geste à faire.
 *
 * Le drapeau ne vaut que pour UN passage : la page de confirmation rouverte
 * plus tard, ou revisitée avec le bouton retour, ne renvoie pas sur WhatsApp.
 * Il vit dans sessionStorage, donc il disparaît avec l'onglet.
 */

const KEY = 'lumea.whatsapp.a-ouvrir';

/** À appeler juste avant d'aller sur la page de confirmation. */
export function armWhatsappHandoff(reference: string): void {
  try {
    sessionStorage.setItem(KEY, reference);
  } catch {
    // Stockage indisponible : la cliente utilisera le bouton, rien n'est cassé.
  }
}

/** Vrai une seule fois, pour la référence qui vient d'être créée. */
export function consumeWhatsappHandoff(reference: string): boolean {
  try {
    if (sessionStorage.getItem(KEY) !== reference) return false;
    sessionStorage.removeItem(KEY);
    return true;
  } catch {
    return false;
  }
}
