import { Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/src/components/ui/Button';
import { useWhatsapp } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';

/**
 * Passage du site à WhatsApp avec le message déjà rédigé.
 *
 * Deux situations, toutes deux gérées sans jamais faire croire qu'un message
 * est parti alors qu'il ne l'est pas :
 *  • un numéro est configuré  → WhatsApp s'ouvre message pré-rempli ;
 *  • seul le lien court existe → le message est copié, puis WhatsApp s'ouvre
 *    et la cliente n'a qu'à coller (le lien wa.me/message/… ne peut pas
 *    transporter de texte).
 */
export function WhatsAppHandoff({ message, hint }: { message: string; hint?: string }) {
  const whatsapp = useWhatsapp();
  const { notify } = useToast();
  const [showMessage, setShowMessage] = useState(false);

  const copy = () => {
    void navigator.clipboard
      ?.writeText(message)
      .then(() => notify('Message copié'))
      .catch(() => notify('Copie impossible, sélectionnez le texte à la main', 'error'));
  };

  if (!whatsapp.available) {
    return (
      <div className="mt-6 rounded-[--radius-md] border border-line bg-cream/70 p-5 text-[13.5px]">
        <p className="font-medium">Message prêt à envoyer</p>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] text-stone">{message}</pre>
        <Button className="mt-4" variant="secondary" onClick={copy}>
          Copier le message
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <Button
        full
        size="lg"
        variant="whatsapp"
        onClick={() => {
          void whatsapp.open(message).then((copied) => {
            if (copied) notify('Message copié — collez-le dans la conversation');
          });
        }}
      >
        {whatsapp.prefill ? 'Continuer sur WhatsApp' : 'Copier et ouvrir WhatsApp'}
      </Button>

      <p className="mt-2.5 text-center text-[12.5px] text-stone">
        {whatsapp.prefill
          ? hint ?? "Le message est déjà rédigé : il ne reste qu'à l'envoyer."
          : 'Le message est copié automatiquement : collez-le dans la conversation qui s’ouvre.'}
      </p>

      <div className="mt-3 text-center">
        <button
          type="button"
          onClick={() => setShowMessage((open) => !open)}
          className="text-[12.5px] text-stone underline underline-offset-2"
        >
          {showMessage ? 'Masquer le message' : 'Voir le message'}
        </button>
      </div>

      {showMessage && (
        <div className="animate-fade mt-3 rounded-[--radius-md] border border-line bg-cream/60 p-4">
          <pre className="whitespace-pre-wrap font-sans text-[13px] text-stone">{message}</pre>
          <button
            type="button"
            onClick={copy}
            className="press mt-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px]"
          >
            <Copy className="size-3.5" /> Copier
          </button>
        </div>
      )}
    </div>
  );
}
