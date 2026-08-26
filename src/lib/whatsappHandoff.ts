/**
 * Passage automatique sur WhatsApp après un envoi.
 *
 * Le message part depuis l'écran d'envoi lui-même, avec la commande qui
 * vient d'être créée en main. C'est volontaire : la page de confirmation
 * doit relire la commande dans la base pour l'afficher, et si cette
 * relecture échoue (réseau, numéro mal formé), WhatsApp ne s'ouvrait pas.
 * Or l'ouverture de WhatsApp est le moment le plus important du parcours —
 * c'est par là que la boutique apprend qu'une commande existe.
 *
 * Navigation de l'onglet, jamais window.open : les navigateurs mobiles
 * bloquent une fenêtre qui ne suit pas immédiatement un geste, et le
 * passage échouerait en silence. Le bouton retour ramène sur la page de
 * confirmation, qui garde le récapitulatif.
 */
export function openWhatsapp(url: string | null): void {
  if (!url) return;
  window.location.href = url;
}
