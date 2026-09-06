/**
 * ─────────────────────────────────────────────────────────────
 *  INSTALLER LE SITE COMME UNE APPLICATION
 * ─────────────────────────────────────────────────────────────
 *  Pas de passage par l'App Store ni par le Play Store : le navigateur sait
 *  poser une icône sur l'écran d'accueil et ouvrir le site en plein écran.
 *  C'est gratuit, immédiat, et le site reste à jour tout seul.
 *
 *  Deux mondes, deux comportements :
 *
 *  • Android et Chrome préviennent la page qu'une installation est possible
 *    (« beforeinstallprompt »). On garde cette invitation de côté pour la
 *    présenter au bon moment — l'événement n'arrive qu'une fois, souvent
 *    avant même que l'interface soit affichée, d'où l'écoute posée ici, au
 *    chargement du fichier.
 *
 *  • iPhone n'offre rien de tel : l'installation passe par le menu Partager.
 *    On ne peut que l'expliquer.
 */

/** L'événement d'installation de Chrome, absent des types standard. */
interface EvenementInstallation extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let invitation: EvenementInstallation | null = null;
const abonnes = new Set<() => void>();

const prevenir = () => abonnes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Sans ce preventDefault, Chrome affiche sa propre bannière : on préfère
    // proposer l'installation à notre manière, au moment choisi.
    event.preventDefault();
    invitation = event as EvenementInstallation;
    prevenir();
  });

  window.addEventListener('appinstalled', () => {
    invitation = null;
    prevenir();
  });
}

/** Le site tourne-t-il déjà comme une application installée ? */
export function dejaInstalle(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (window.matchMedia?.('(display-mode: standalone)').matches) return true;
    // Safari sur iPhone : propriété non standard, absente des types.
    return (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  } catch {
    return false;
  }
}

/** iPhone et iPad : l'installation se fait à la main, par le menu Partager. */
export function estIOS(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  // iPadOS se présente comme un Mac : le tactile le distingue d'un vrai Mac.
  const iPadModerne = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /iPhone|iPad|iPod/i.test(ua) || iPadModerne;
}

/** Une installation en un geste est-elle possible ici et maintenant ? */
export function installationPossible(): boolean {
  return invitation !== null;
}

/**
 * Ouvre la fenêtre d'installation du navigateur.
 * Renvoie `true` si la cliente a accepté. L'invitation ne sert qu'une fois.
 */
export async function installer(): Promise<boolean> {
  if (!invitation) return false;
  const evenement = invitation;
  invitation = null;
  prevenir();
  try {
    await evenement.prompt();
    const { outcome } = await evenement.userChoice;
    return outcome === 'accepted';
  } catch {
    return false;
  }
}

/** Prévient quand l'état change. Renvoie de quoi se désabonner. */
export function surChangement(rappel: () => void): () => void {
  abonnes.add(rappel);
  return () => abonnes.delete(rappel);
}
