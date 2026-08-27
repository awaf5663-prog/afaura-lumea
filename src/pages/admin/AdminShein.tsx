import { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { AmountField } from '@/src/components/admin/AmountField';
import { ExportButton } from '@/src/components/admin/ExportButton';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Select } from '@/src/components/ui/Field';
import { useToast } from '@/src/hooks/useToast';
import { useTrash } from '@/src/hooks/useTrash';
import { TrashBar } from '@/src/components/admin/TrashBar';
import { cn } from '@/src/lib/cn';
import { formatDateTime, formatFcfa, prettyPhone } from '@/src/lib/format';
import { SHEIN_STATUS_LABEL, SHEIN_STEPS, nextSheinStatus } from '@/src/lib/orderStatus';
import { SITE_URL } from '@/src/config/site';
import { buildStatusMessage, isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { sheinCsv } from '@/src/lib/exportCsv';
import { db } from '@/src/services';
import type { Grouping, SheinRequest, SheinStatus } from '@/src/types';

export function AdminShein({
  requests,
  reload,
  groupings = [],
  newSince = '',
}: {
  requests: SheinRequest[];
  reload: () => Promise<void>;
  groupings?: Grouping[];
  /** Date de la dernière visite : les demandes arrivées après sont signalées. */
  newSince?: string;
}) {
  const { notify } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const trash = useTrash({
    lignes: requests,
    nom: 'demande',
    mettreCorbeille: (ids, trashed) => db.updateSheinTrash(ids, trashed),
    supprimer: (ids) => db.deleteSheinRequests(ids),
    reload,
  });
  const visibles = trash.visibles;

  const patch = async (request: SheinRequest, changes: Parameters<typeof db.updateSheinRequest>[1]) => {
    setBusy(request.id);
    try {
      await db.updateSheinRequest(request.id, changes);
      await reload();
      notify('Demande mise à jour');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Mise à jour impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (requests.length === 0) {
    return (
      <EmptyState
        title="Aucune demande SHEIN"
        description="Les demandes envoyées via le formulaire apparaissent ici, avec les liens et les captures."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[24px]">
          {trash.vueCorbeille ? 'Corbeille' : 'Demandes SHEIN'} ({visibles.length})
        </h2>
        <ExportButton label="Exporter pour Excel" build={() => sheinCsv(visibles)} />
      </div>

      <TrashBar
        nom="demande"
        vueCorbeille={trash.vueCorbeille}
        onChangerVue={trash.changerVue}
        nombreCorbeille={trash.nombreCorbeille}
        selection={trash.selection}
        total={visibles.length}
        onToutSelectionner={trash.toutSelectionner}
        onEffacerSelection={trash.effacerSelection}
        onMettreCorbeille={trash.mettreALaCorbeille}
        onRestaurer={trash.restaurer}
        onSupprimer={trash.supprimerDefinitivement}
        occupe={trash.occupe}
      />

      {visibles.length === 0 && (
        <p className="mt-8 text-[13.5px] text-stone">
          {trash.vueCorbeille
            ? 'La corbeille est vide.'
            : 'Aucune demande en cours. Regardez dans la corbeille si vous en cherchez une.'}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {visibles.map((request) => (
          <li
            key={request.id}
            className={cn(
              'rounded-[--radius-lg] border bg-white p-5',
              newSince && request.createdAt > newSince ? 'border-mauve' : 'border-line',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Sélectionner ${request.requestNumber}`}
                  className="mt-1.5 size-4 shrink-0 accent-[#8f4b5b]"
                  checked={trash.selection.includes(request.id)}
                  onChange={() => trash.basculer(request.id)}
                />
                <div>
                <p className="font-display text-[20px]">
                  {request.requestNumber}
                  {newSince && request.createdAt > newSince && (
                    <span className="ml-2 align-middle rounded-full bg-mauve px-2 py-0.5 text-[11px] font-medium tracking-wide text-ivory">
                      NOUVEAU
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] text-stone">{formatDateTime(request.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="neutral">{SHEIN_STATUS_LABEL[request.status]}</Badge>
                <Badge tone={request.groupingId ? 'accent' : 'neutral'}>
                  {groupings.find((g) => g.id === request.groupingId)?.reference ?? 'Sans groupage'}
                </Badge>
              </div>
            </div>

            <div className="mt-4 border-t border-line pt-4 text-[13.5px]">
              <p className="font-medium">{request.customerName}</p>
              {isWhatsappConfigured(request.phone) ? (
                <a
                  href={whatsappLink(
                    request.phone,
                    `Bonjour, au sujet de votre demande ${request.requestNumber}.`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mauve underline underline-offset-2"
                >
                  {prettyPhone(request.phone)}
                </a>
              ) : (
                <p className="text-stone">{request.phone}</p>
              )}
              {request.note && <p className="mt-2 italic text-stone">« {request.note} »</p>}
            </div>

            <ul className="mt-4 space-y-3 border-t border-line pt-4">
              {request.items.map((item, index) => (
                <li key={index} className="flex gap-3 text-[13px]">
                  {item.screenshotData && (
                    <a href={item.screenshotData} target="_blank" rel="noopener noreferrer">
                      <img
                        src={item.screenshotData}
                        alt=""
                        className="size-16 rounded-[--radius-xs] object-cover"
                      />
                    </a>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium">{item.reference || `Article ${index + 1}`}</p>
                    <p className="text-stone">
                      {[
                        item.size && `Taille ${item.size}`,
                        item.color && `Couleur ${item.color}`,
                        `Qté ${item.quantity}`,
                        item.displayedPrice && `Prix SHEIN ${item.displayedPrice}`,
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                    {item.productUrl && (
                      <a
                        href={item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="block truncate text-[12px] text-mauve underline underline-offset-2"
                      >
                        {item.productUrl}
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {request.quote && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-line pt-4 text-[12.5px] sm:grid-cols-4">
                <QuoteStat label="Articles déclarés" value={request.quote.itemsSubtotal} />
                <QuoteStat label="Frais de traitement" value={request.quote.serviceFee} />
                <QuoteStat label={request.quote.deliveryLabel || 'Livraison'} value={request.quote.deliveryFee} />
                <QuoteStat label="Total estimé" value={request.quote.total} emphasis />
              </dl>
            )}

            <Workflow request={request} busy={busy === request.id} patch={patch} />
          </li>
        ))}
      </ul>
    </div>
  );
}


/**
 * Le parcours d'une demande, du côté de la boutique.
 *
 * Le site n'avance jamais tout seul : c'est ici qu'on enregistre le montant
 * annoncé sur WhatsApp puis qu'on fait passer la demande d'une étape à la
 * suivante. La page de suivi de la cliente lit exactement cet état.
 */
function Workflow({
  request,
  busy,
  patch,
}: {
  request: SheinRequest;
  busy: boolean;
  patch: (
    request: SheinRequest,
    changes: Parameters<typeof db.updateSheinRequest>[1],
  ) => Promise<void>;
}) {
  const stepIndex = SHEIN_STEPS.findIndex((step) => step.id === request.status);
  const step = SHEIN_STEPS[stepIndex];
  const next = nextSheinStatus(request.status);
  const nextStep = SHEIN_STEPS.find((s) => s.id === next);
  const cancelled = request.status === 'cancelled';

  // On ne propose « Montant confirmé » qu'une fois le montant réellement saisi :
  // annoncer l'étape sans le chiffre ne veut rien dire pour la cliente.
  const blockedByAmount = next === 'quoted' && request.quotedTotal === null;

  const message = step
    ? buildStatusMessage({
        reference: request.requestNumber,
        customerName: request.customerName,
        stepLabel: step.label,
        stepHint: step.hint,
        amount: request.quotedTotal === null ? null : formatFcfa(request.quotedTotal),
        trackingUrl: `${SITE_URL}/suivi`,
      })
    : '';

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <AmountField
          label="Montant confirmé (FCFA)"
          value={request.quotedTotal}
          placeholder="Non communiqué"
          disabled={busy}
          onSave={(value) => void patch(request, { quotedTotal: value })}
          hint={
            request.quotedTotal === null
              ? 'À renseigner après vérification des articles.'
              : `Annoncé à la cliente : ${formatFcfa(request.quotedTotal)}`
          }
        />

        <label className="text-[12.5px] text-stone">
          Étape {stepIndex >= 0 && `(${stepIndex + 1} sur ${SHEIN_STEPS.length})`}
          <Select
            className="mt-1"
            disabled={busy}
            value={request.status}
            onChange={(e) => void patch(request, { status: e.target.value as SheinStatus })}
          >
            {Object.entries(SHEIN_STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {next && !cancelled && (
          <button
            type="button"
            disabled={busy || blockedByAmount}
            onClick={() => void patch(request, { status: next })}
            className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-medium text-ivory disabled:cursor-not-allowed disabled:bg-stone"
          >
            Passer à « {nextStep?.label} »
            <ArrowRight className="size-3.5" />
          </button>
        )}

        {isWhatsappConfigured(request.phone) && step && (
          <a
            href={whatsappLink(request.phone, message)}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-graphite"
          >
            <MessageCircle className="size-3.5" />
            Prévenir la cliente
          </a>
        )}
      </div>

      {blockedByAmount && (
        <p className="mt-2 text-[12px] text-stone">
          Renseignez d'abord le montant : c'est lui que la cliente attend à cette étape.
        </p>
      )}

      {!next && !cancelled && (
        <p className="mt-2 text-[12px] text-stone">Dernière étape du parcours.</p>
      )}

      <p className="mt-3 text-[12px] leading-relaxed text-stone">
        La cliente ne reçoit rien automatiquement : le site enregistre l'étape, et « Prévenir la
        cliente » ouvre WhatsApp avec le message déjà écrit. Elle retrouve la même étape sur la page
        Suivi avec son numéro et son téléphone.
      </p>
    </div>
  );
}

function QuoteStat({
  label,
  value,
  emphasis,
}: {
  label: string;
  value: number | null;
  emphasis?: boolean;
}) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.1em] text-stone">{label}</dt>
      <dd className={emphasis ? 'mt-0.5 font-medium tabular-nums' : 'mt-0.5 tabular-nums'}>
        {value === null ? <span className="text-stone">à confirmer</span> : formatFcfa(value)}
      </dd>
    </div>
  );
}
