import { ArrowUpRight, Copy } from 'lucide-react';
import { MoyenPaiementIcone } from '@/src/components/order/MoyenPaiementIcone';
import { PAYMENT_METHODS } from '@/src/config/site';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa, prettyPhone } from '@/src/lib/format';
import { lienPaiement } from '@/src/lib/paiement';

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
  /*
   * Lien de paiement renseigné en administration : la cliente touche un
   * bouton, son application s'ouvre avec le compte de la boutique déjà
   * rempli. Le numéro n'a alors plus à être écrit en clair sur le site.
   */
  const lien = lienPaiement(settings, methodId);

  const copy = (value: string, quoi: string) => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => notify(`${quoi} copié`))
      .catch(() => notify('Copie impossible', 'error'));
  };

  return (
    <div className="rounded-[--radius-md] border border-line bg-cream/60 p-4 text-[13px] leading-relaxed text-graphite">
      <p className="flex items-center gap-2.5 font-medium">
        <MoyenPaiementIcone id={method.id} />
        Comment payer en {method.label}
      </p>

      {lien ? (
        <>
          <a
            href={lien}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-3 flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-[14px] font-medium text-ivory"
          >
            Ouvrir {method.label}
            <ArrowUpRight className="size-4" />
          </a>

          {amount !== undefined && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[--radius-sm] border border-line bg-white px-4 py-3">
              <span>
                <span className="block text-[11px] uppercase tracking-[0.14em] text-stone">
                  Montant à saisir
                </span>
                <span className="mt-0.5 block text-[16px] font-medium tabular-nums">
                  {formatFcfa(amount)}
                  {!amountIsFinal && ' + livraison'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => copy(String(amount), 'Montant')}
                className="press inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3 py-2 text-[12px]"
              >
                <Copy className="size-3.5" /> Copier
              </button>
            </div>
          )}

          <ol className="mt-3 list-decimal space-y-1 pl-4">
            <li>
              Touchez « Ouvrir {method.label} » : notre compte est déjà rempli.
            </li>
            <li>
              Saisissez{' '}
              {amount !== undefined ? (
                <span className="font-medium">
                  {formatFcfa(amount)}
                  {!amountIsFinal && ' + les frais de livraison confirmés'}
                </span>
              ) : (
                'le montant total'
              )}
              , puis validez l'envoi.
            </li>
            <li>Envoyez la capture de confirmation dans la conversation WhatsApp.</li>
          </ol>
          <p className="mt-2.5 text-[12px] text-stone">
            Votre commande est marquée « payée » seulement après vérification de notre côté.
          </p>
        </>
      ) : number ? (
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
              onClick={() => copy(prettyPhone(number), 'Numéro')}
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
