import { Loader2 } from 'lucide-react';
import { WhatsAppLink } from '@/src/components/whatsapp/WhatsAppLink';
import { useWhatsappHandoff } from '@/src/hooks/useWhatsappHandoff';

/**
 * Bandeau du passage automatique vers WhatsApp.
 *
 * Il ne s'affiche que pendant le basculement, juste après l'envoi. Le lien
 * en dessous est là pour le cas où le navigateur retiendrait la redirection :
 * mieux vaut un lien à toucher qu'une page qui semble figée.
 */
export function WhatsappOpening({ reference, message }: { reference: string; message: string }) {
  const opening = useWhatsappHandoff(reference, message);
  if (!opening) return null;

  return (
    <div className="animate-fade mb-6 rounded-[--radius-md] border border-line bg-cream/70 px-4 py-3.5 text-center">
      <p className="flex items-center justify-center gap-2 text-[13.5px] text-graphite">
        <Loader2 className="size-4 animate-spin" />
        Ouverture de WhatsApp…
      </p>
      <p className="mt-1.5 text-[12px] text-stone">
        Rien ne se passe ?{' '}
        <WhatsAppLink message={message} variant="plain">
          Ouvrir WhatsApp
        </WhatsAppLink>
      </p>
    </div>
  );
}
