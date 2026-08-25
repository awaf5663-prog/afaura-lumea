import { Copy } from 'lucide-react';
import { PAYMENT_METHODS } from '@/src/config/site';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa, prettyPhone } from '@/src/lib/format';

/**
 * Instructions de paiement mobile.
 * Aucune confirmation automatique : le paiement reste « à vérifier » tant que
 * l'équipe ne l'a pas validé dans l'admin. On donne juste à la cliente ce qu'il
 * lui faut pour payer — le bon numéro, le bon montant, en un geste.
 */
export function PaymentInstructions({
  methodId,
  amount,
  amountIsFinal = true,
}: {
  methodId: string;
  /** Montant à régler, si déjà connu. */
  amount?: number;
  /** false quand les frais de livraison ne sont pas encore fixés. */
  amountIsFinal?: boolean;
}) {
  const { settings } = useSettings();
  const { notify } = useToast();

  const method = PAYMENT_METHODS.find((m) => m.id === methodId);
  if (!method || !method.requiresProof) return null;

  const number = methodId === 'wave' ? settings?.waveNumber ?? '' : settings?.orangeMoneyNumber ?? '';

  const copy = (value: string) => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => notify('Numéro copié'))
      .catch(() => notify('Copie impossible', 'error'));
  };

  return (
    <div className="rounded-[--radius-md] border border-line bg-cream/60 p-4 text-[13px] leading-relaxed text-graphite">
      <p className="font-medium">Comment payer en {method.label}</p>

      {number ? (
        <>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-[--radius-sm] border border-line bg-white px-4 py-3">
            <span>
              <span className="block text-[11px] uppercase tracking-[0.14em] text-stone">
                Numéro {method.label}
              </span>
              <span className="mt-0.5 block text-[16px] font-medium tabular-nums">
                {prettyPhone(number)}
              </span>
            </span>
            <button
              type="button"
              onClick={() => copy(prettyPhone(number))}
              className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[12px]"
            >
              <Copy className="size-3.5" /> Copier
            </button>
          </div>

          <ol className="mt-3 list-decimal space-y-1 pl-4">
            <li>
              Envoyez{' '}
              {amount !== undefined ? (
                <span className="font-medium">
                  {formatFcfa(amount)}
                  {!amountIsFinal && ' + les frais de livraison confirmés'}
                </span>
              ) : (
                'le montant total'
              )}{' '}
              à ce numéro.
            </li>
            <li>Faites une capture d'écran de la confirmation.</li>
            <li>Envoyez-la dans la conversation WhatsApp.</li>
          </ol>
          <p className="mt-2.5 text-[12px] text-stone">
            Votre commande est marquée « payée » seulement après vérification de notre côté.
          </p>
        </>
      ) : (
        <p className="mt-2">
          Les coordonnées {method.label} vous sont envoyées sur WhatsApp juste après la validation,
          avec le montant exact à régler. Vous n'avancez rien avant cette confirmation.
        </p>
      )}
    </div>
  );
}
