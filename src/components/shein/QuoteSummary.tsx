import { Info } from 'lucide-react';
import { formatFcfa } from '@/src/lib/format';
import type { Quote } from '@/src/types';

/**
 * Récapitulatif d'une estimation SHEIN.
 *
 * Trois lignes toujours séparées, pour que la cliente sache exactement ce
 * qu'elle paie : le prix des articles (facturé par SHEIN), nos frais de
 * traitement (notre service), et la livraison. Une ligne inconnue est
 * affichée « à confirmer » — jamais fondue dans une autre ni devinée.
 */
export function QuoteSummary({ quote, title = 'Estimation' }: { quote: Quote; title?: string }) {
  return (
    <div className="rounded-[--radius-lg] border border-line bg-white p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[18px]">{title}</h3>
        <span className="text-[12px] text-stone">
          {quote.itemCount} article{quote.itemCount > 1 ? 's' : ''}
        </span>
      </div>

      <dl className="mt-4 space-y-3 text-[14px]">
        <Line
          label="Articles SHEIN"
          hint="D'après les prix que vous avez indiqués."
          value={quote.itemsSubtotal}
          missing={
            quote.unconvertedCurrencies.length > 0
              ? `Taux ${quote.unconvertedCurrencies.join(', ')} non configuré`
              : 'À confirmer'
          }
        />
        <Line
          label="Frais de traitement"
          hint={quote.serviceFeeReason}
          value={quote.serviceFee}
          missing="Calcul personnalisé"
        />
        {/*
          Livraison offerte : on montre le tarif barré plutôt qu'un zéro sec.
          « Offerte » sans le prix d'origine ne dit rien de la valeur de l'offre.
        */}
        {quote.promotionLabel && quote.deliveryFeeBeforePromotion ? (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="min-w-0">
              <span className="block">{quote.deliveryLabel || 'Livraison'}</span>
              <span className="mt-0.5 block text-[12px] leading-snug text-mauve">
                {quote.promotionLabel}
              </span>
            </dt>
            <dd className="shrink-0 text-right tabular-nums">
              <span className="text-stone line-through">
                {formatFcfa(quote.deliveryFeeBeforePromotion)}
              </span>
              <span className="ml-2 font-medium text-mauve">Offerte</span>
            </dd>
          </div>
        ) : (
          <Line label={quote.deliveryLabel || 'Livraison'} value={quote.deliveryFee} missing="À confirmer" />
        )}

        <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
          <dt className="text-[16px]">Total estimé</dt>
          <dd className="text-[20px] font-medium tabular-nums">
            {formatFcfa(quote.total)}
            {quote.isPartial && <span className="ml-1 text-[13px] font-normal text-stone">+ à confirmer</span>}
          </dd>
        </div>
      </dl>

      <p className="mt-4 flex gap-2 rounded-[--radius-sm] bg-cream/70 px-3.5 py-3 text-[12px] leading-relaxed text-graphite">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        Le montant final peut être ajusté après vérification des articles et des frais logistiques.
        Vous le validez avant tout paiement.
      </p>

      <p className="mt-2.5 text-[11.5px] leading-relaxed text-stone">
        Les frais de traitement couvrent notre service : vérification, commande, regroupement,
        organisation de l'acheminement et suivi. Ce ne sont pas des frais facturés par SHEIN.
      </p>
    </div>
  );
}

function Line({
  label,
  hint,
  value,
  missing,
}: {
  label: string;
  hint?: string;
  value: number | null;
  missing: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="min-w-0">
        <span className="block">{label}</span>
        {hint && <span className="mt-0.5 block text-[12px] leading-snug text-stone">{hint}</span>}
      </dt>
      <dd className="shrink-0 tabular-nums">
        {value === null ? <span className="text-[13px] text-stone">{missing}</span> : formatFcfa(value)}
      </dd>
    </div>
  );
}
