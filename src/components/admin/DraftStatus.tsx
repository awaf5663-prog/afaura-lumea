import { useEffect, useRef } from 'react';
import { AlertTriangle, FileClock } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

/**
 * État d'un formulaire de réglages : brouillon retrouvé, erreur d'enregistrement.
 *
 * L'erreur est affichée en dur, pas en message qui s'efface : quand un
 * enregistrement échoue, il faut pouvoir la lire, la recopier, et réessayer
 * sans avoir tout retapé.
 */
export function DraftStatus({
  restored,
  error,
  onDiscard,
  onRetry,
  saving,
}: {
  restored: boolean;
  error: string | null;
  onDiscard: () => void;
  onRetry: () => void;
  saving?: boolean;
}) {
  const zone = useRef<HTMLDivElement>(null);

  // Sur téléphone, le bouton d'enregistrement est en bas et ce panneau en
  // haut : sans ça, l'échec passait complètement inaperçu.
  useEffect(() => {
    if (error) zone.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [error]);

  if (!restored && !error) return null;

  return (
    <div ref={zone} className="mt-5 grid gap-3">
      {restored && !error && (
        <div className="flex items-start gap-2.5 rounded-[--radius-md] bg-blush/60 px-4 py-3 text-[12.5px] leading-relaxed text-graphite">
          <FileClock className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong className="font-medium">Saisie retrouvée.</strong> Ce que vous aviez tapé sans
            l'enregistrer a été conservé. Vérifiez, puis enregistrez.{' '}
            <button type="button" onClick={onDiscard} className="underline underline-offset-2">
              Repartir des valeurs enregistrées
            </button>
          </span>
        </div>
      )}

      {error && (
        <div className="rounded-[--radius-md] border border-[#8a2f2f]/30 bg-[#8a2f2f]/5 px-4 py-3.5">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[#8a2f2f]" />
            <div className="min-w-0">
              <p className="text-[13.5px] font-medium text-[#8a2f2f]">
                Enregistrement impossible — rien n'a été perdu.
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-graphite">
                Votre saisie est conservée sur cet appareil : réessayez, elle est toujours là.
              </p>
              <p className="mt-2.5 break-words rounded-[--radius-sm] bg-white px-3 py-2 font-mono text-[11.5px] text-stone">
                {error}
              </p>
              <Button
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={onRetry}
                disabled={saving}
              >
                {saving ? 'Enregistrement…' : 'Réessayer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
