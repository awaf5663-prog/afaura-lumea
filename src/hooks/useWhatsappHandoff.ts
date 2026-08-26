import { useEffect, useState } from 'react';
import { useWhatsapp } from '@/src/hooks/useSettings';
import { consumeWhatsappHandoff } from '@/src/lib/whatsappHandoff';

/**
 * Ouvre WhatsApp tout seul, une fois, juste après l'envoi.
 *
 * Pourquoi une navigation de l'onglet et non window.open : les navigateurs
 * mobiles bloquent l'ouverture d'une fenêtre qui ne suit pas immédiatement un
 * geste, et le passage échouerait en silence. Une navigation, elle, aboutit —
 * et le bouton retour ramène sur la page de confirmation, qui reste affichée
 * dessous avec le récapitulatif.
 *
 * Sans numéro configuré (repli sur le lien court WhatsApp Business), le
 * message ne peut pas être pré-rempli : on ne redirige pas, la cliente garde
 * le bouton qui copie le message avant d'ouvrir la conversation.
 */
export function useWhatsappHandoff(reference: string, message: string | null): boolean {
  const whatsapp = useWhatsapp();
  const [opening, setOpening] = useState(false);

  const url = message && whatsapp.prefill ? whatsapp.url(message) : null;

  useEffect(() => {
    if (!url) return;
    if (!consumeWhatsappHandoff(reference)) return;
    setOpening(true);
    window.location.href = url;
  }, [reference, url]);

  return opening;
}
