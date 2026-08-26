/**
 * Diffusion des changements de données.
 *
 * Quand la boutique enregistre quelque chose dans l'admin, les écrans déjà
 * affichés doivent le refléter sans qu'on ait à recharger la page.
 *
 * Trois canaux, parce qu'aucun ne suffit seul :
 *   • l'onglet qui écrit prévient ses propres écrans, directement ;
 *   • les AUTRES onglets du même appareil sont prévenus par l'événement
 *     `storage`, qui ne se déclenche jamais dans l'onglet qui écrit ;
 *   • revenir sur un onglet laissé de côté déclenche une relecture, sinon il
 *     resterait figé sur ce qu'il affichait il y a une heure.
 */

type Listener = () => void;

const listeners = new Set<Listener>();

/** Clé « sonnette » : sa valeur ne sert à rien, seul son changement compte. */
const SIGNAL_KEY = 'lumea.changed.at';

function fire() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Un écran qui échoue à se rafraîchir ne doit pas empêcher les autres.
    }
  });
}

/** À appeler après toute écriture. */
export function notifyDataChanged() {
  fire();
  try {
    localStorage.setItem(SIGNAL_KEY, String(Date.now()));
  } catch {
    // Navigation privée, stockage plein : les autres onglets ne sauront pas,
    // l'onglet courant est déjà à jour.
  }
}

/** S'abonner. Renvoie la fonction de désabonnement. */
export function onDataChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    // La sonnette, ou n'importe quelle donnée de la boutique écrite ailleurs.
    if (event.key === null || event.key === SIGNAL_KEY || event.key.startsWith('lumea.')) {
      fire();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') fire();
  });
}
