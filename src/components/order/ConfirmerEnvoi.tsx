import { AlertTriangle, Phone, Ruler } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Sheet } from '@/src/components/ui/Sheet';

export interface LigneRecap {
  label: string;
  value: string;
  /** Mis en avant : le numéro, qu'une faute de frappe rend injoignable. */
  cle?: boolean;
}

/**
 * Dernière relecture avant d'envoyer.
 *
 * Une commande part avec un numéro de téléphone : c'est par lui que la
 * boutique rappelle, confirme le montant et prévient de l'arrivée du colis.
 * Un chiffre de travers et la cliente n'est plus joignable — d'où ce
 * récapitulatif, où le numéro est écrit en grand, avant le point de
 * non-retour.
 *
 * Ne remplace pas la vérification des champs : elle a déjà eu lieu, et ce
 * panneau ne s'ouvre que si le formulaire est bon. Il demande à la cliente
 * de relire ce qu'elle a écrit, ce qu'aucun contrôle automatique ne sait
 * faire à sa place.
 */
export function ConfirmerEnvoi({
  open,
  onClose,
  onConfirm,
  busy,
  lignes,
  action,
  rappel,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy: boolean;
  lignes: LigneRecap[];
  /** Libellé du bouton qui envoie pour de bon. */
  action: string;
  /**
   * Rappel supplémentaire, affiché sous le numéro. Sert à la taille : un
   * vêtement commandé pour vous ne se ré-essaie pas avant d'arriver.
   */
  rappel?: string;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="bottom"
      title="Avant d'envoyer, relisez"
      footer={
        <div className="flex flex-col gap-2.5">
          <Button full size="lg" loading={busy} onClick={onConfirm}>
            {action}
          </Button>
          <Button full variant="secondary" disabled={busy} onClick={onClose}>
            Non, je corrige
          </Button>
        </div>
      }
    >
      <p className="flex gap-2.5 rounded-[--radius-md] bg-blush/50 px-4 py-3.5 text-[13px] leading-relaxed text-graphite">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-mauve" strokeWidth={1.8} />
        <span>
          Vérifiez surtout <strong className="font-medium">votre numéro</strong> : c'est par là que
          nous vous répondons et que nous confirmons le montant. Un chiffre de travers et nous ne
          pouvons plus vous joindre.
        </span>
      </p>

      {rappel && (
        <p className="mt-3 flex gap-2.5 rounded-[--radius-md] bg-cream/70 px-4 py-3 text-[12.5px] leading-relaxed text-graphite">
          <Ruler className="mt-0.5 size-4 shrink-0 text-mauve" strokeWidth={1.8} />
          <span>{rappel}</span>
        </p>
      )}

      <dl className="mt-4 divide-y divide-line">
        {lignes.map((ligne) => (
          <div key={ligne.label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="shrink-0 text-[12.5px] text-stone">{ligne.label}</dt>
            <dd
              className={
                ligne.cle
                  ? 'inline-flex items-center gap-1.5 text-right font-display text-[19px] tabular-nums text-rosedark'
                  : 'text-right text-[13.5px] text-graphite'
              }
            >
              {ligne.cle && <Phone className="size-4 shrink-0 text-mauve" strokeWidth={1.8} />}
              {ligne.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[12.5px] leading-relaxed text-stone">
        Une erreur après l'envoi n'est pas perdue : écrivez-nous sur WhatsApp, nous corrigeons.
      </p>
    </Sheet>
  );
}
