import { useState } from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Select } from '@/src/components/ui/Field';
import { useToast } from '@/src/hooks/useToast';
import { formatDateTime, formatFcfa, prettyPhone } from '@/src/lib/format';
import { SHEIN_STATUS_LABEL } from '@/src/lib/orderStatus';
import { isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { SheinRequest, SheinStatus } from '@/src/types';

export function AdminShein({
  requests,
  reload,
}: {
  requests: SheinRequest[];
  reload: () => Promise<void>;
}) {
  const { notify } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

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
      <h2 className="text-[24px]">Demandes SHEIN ({requests.length})</h2>

      <ul className="mt-6 space-y-4">
        {requests.map((request) => (
          <li key={request.id} className="rounded-[--radius-lg] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[20px]">{request.requestNumber}</p>
                <p className="mt-0.5 text-[12.5px] text-stone">{formatDateTime(request.createdAt)}</p>
              </div>
              <Badge tone="neutral">{SHEIN_STATUS_LABEL[request.status]}</Badge>
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

            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
              <label className="text-[12.5px] text-stone">
                Étape
                <Select
                  className="mt-1"
                  disabled={busy === request.id}
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

              <label className="text-[12.5px] text-stone">
                Montant confirmé (FCFA)
                <input
                  type="number"
                  min={0}
                  step={500}
                  defaultValue={request.quotedTotal ?? ''}
                  placeholder="Non communiqué"
                  disabled={busy === request.id}
                  onBlur={(e) => {
                    const next = e.target.value === '' ? null : Number(e.target.value);
                    if (next !== request.quotedTotal) void patch(request, { quotedTotal: next });
                  }}
                  className="mt-1 w-full rounded-[--radius-sm] border border-line bg-white px-4 py-3 text-[15px] focus:border-ink focus:outline-none"
                />
              </label>
            </div>

            {request.quotedTotal !== null && (
              <p className="mt-3 text-[12.5px] text-stone">
                Montant communiqué à la cliente : {formatFcfa(request.quotedTotal)}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
