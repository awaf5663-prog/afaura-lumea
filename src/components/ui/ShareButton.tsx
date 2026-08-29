import { Check, Link2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/src/lib/cn';
import { useToast } from '@/src/hooks/useToast';

/**
 * Partage d'un lien du site.
 *
 * Trois situations, dans cet ordre :
 *  • le téléphone sait partager (`navigator.share`) → le menu du système
 *    s'ouvre, avec WhatsApp, Instagram et le reste. C'est le cas courant,
 *    et de loin le plus utile : la boutique vend surtout en message privé.
 *  • sinon, le presse-papier existe → le lien est copié.
 *  • sinon (vieux navigateur, page non sécurisée) → le lien s'affiche pour
 *    être sélectionné à la main. On ne prétend jamais avoir copié quand ce
 *    n'est pas le cas.
 *
 * `navigator.share` lève `AbortError` quand la personne referme le menu :
 * ce n'est pas une panne, on ne dit rien.
 */
export function ShareButton({
  url,
  title,
  text,
  className,
  label = 'Partager',
}: {
  url: string;
  title: string;
  text?: string;
  className?: string;
  label?: string;
}) {
  const { notify } = useToast();
  const [copie, setCopie] = useState(false);
  const [lienVisible, setLienVisible] = useState(false);

  const partager = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        // Menu refermé sans choisir : la cliente a changé d'avis, c'est tout.
        if (error instanceof Error && error.name === 'AbortError') return;
        // Partage impossible : on retombe sur la copie plutôt que d'échouer.
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      notify('Lien copié');
      window.setTimeout(() => setCopie(false), 2200);
    } catch {
      setLienVisible(true);
      notify('Copie impossible : le lien s’affiche, sélectionnez-le', 'error');
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => void partager()}
        className={cn(
          'press inline-flex items-center gap-2 rounded-full border border-line',
          'px-4 py-2 text-[13px] text-graphite transition-colors hover:border-ink hover:text-ink',
        )}
      >
        {copie ? <Check className="size-4 text-mauve" /> : <Share2 className="size-4" />}
        {copie ? 'Lien copié' : label}
      </button>

      {lienVisible && (
        <p className="mt-2 flex items-start gap-2 break-all text-[12.5px] text-stone">
          <Link2 className="mt-0.5 size-3.5 shrink-0" />
          <span>{url}</span>
        </p>
      )}
    </div>
  );
}
