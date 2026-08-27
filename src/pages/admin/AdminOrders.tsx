import { useState } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';
import { AmountField } from '@/src/components/admin/AmountField';
import { ExportButton } from '@/src/components/admin/ExportButton';
import { Badge } from '@/src/components/ui/Badge';
import { Select } from '@/src/components/ui/Field';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useToast } from '@/src/hooks/useToast';
import { useTrash } from '@/src/hooks/useTrash';
import { TrashBar } from '@/src/components/admin/TrashBar';
import { cn } from '@/src/lib/cn';
import { formatDateTime, formatFcfa, prettyPhone } from '@/src/lib/format';
import { ORDER_STATUS_LABEL, ORDER_STEPS, PAYMENT_STATUS_LABEL, nextOrderStatus } from '@/src/lib/orderStatus';
import { SITE_URL } from '@/src/config/site';
import { buildStatusMessage, isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { ordersCsv } from '@/src/lib/exportCsv';
import { db } from '@/src/services';
import type { Order, OrderStatus, PaymentStatus } from '@/src/types';

export function AdminOrders({
  orders,
  reload,
  newSince = '',
}: {
  orders: Order[];
  reload: () => Promise<void>;
  /** Date de la dernière visite : les commandes arrivées après sont signalées. */
  newSince?: string;
}) {
  const { notify } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const trash = useTrash({
    lignes: orders,
    nom: 'commande',
    mettreCorbeille: (ids, trashed) => db.updateOrdersTrash(ids, trashed),
    supprimer: (ids) => db.deleteOrders(ids),
    reload,
  });
  const visibles = trash.visibles;

  const patch = async (order: Order, changes: Parameters<typeof db.updateOrder>[1]) => {
    setBusy(order.id);
    try {
      await db.updateOrder(order.id, changes);
      await reload();
      notify('Commande mise à jour');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Mise à jour impossible.', 'error');
    } finally {
      setBusy(null);
    }
  };

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Aucune commande pour l'instant"
        description="Les commandes validées depuis le site apparaissent ici, avec leur statut."
      />
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[24px]">
          {trash.vueCorbeille ? 'Corbeille' : 'Commandes'} ({visibles.length})
        </h2>
        <ExportButton label="Exporter pour Excel" build={() => ordersCsv(visibles)} />
      </div>

      <TrashBar
        nom="commande"
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
            ? "La corbeille est vide."
            : "Aucune commande en cours. Regardez dans la corbeille si vous en cherchez une."}
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {visibles.map((order) => (
          <li
            key={order.id}
            className={cn(
              'rounded-[--radius-lg] border bg-white p-5',
              newSince && order.createdAt > newSince ? 'border-mauve' : 'border-line',
            )}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  aria-label={`Sélectionner ${order.orderNumber}`}
                  className="mt-1.5 size-4 shrink-0 accent-[#8f4b5b]"
                  checked={trash.selection.includes(order.id)}
                  onChange={() => trash.basculer(order.id)}
                />
                <div>
                <p className="font-display text-[20px]">
                  {order.orderNumber}
                  {newSince && order.createdAt > newSince && (
                    <span className="ml-2 align-middle rounded-full bg-mauve px-2 py-0.5 text-[11px] font-medium tracking-wide text-ivory">
                      NOUVEAU
                    </span>
                  )}
                </p>
                <p className="mt-0.5 text-[12.5px] text-stone">{formatDateTime(order.createdAt)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[17px] font-medium tabular-nums">
                  {formatFcfa(order.total)}
                  {order.deliveryFee === null && <span className="text-[12px] text-stone"> + livraison</span>}
                </p>
                <Badge tone={order.orderStatus === 'delivered' ? 'accent' : 'neutral'} className="mt-1">
                  {ORDER_STATUS_LABEL[order.orderStatus]}
                </Badge>
              </div>
            </div>

            <div className="mt-4 grid gap-4 border-t border-line pt-4 text-[13.5px] sm:grid-cols-2">
              <div>
                <p className="font-medium">{order.customerName}</p>
                {isWhatsappConfigured(order.phone) ? (
                  <a
                    href={whatsappLink(order.phone, `Bonjour, au sujet de votre commande ${order.orderNumber}.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-mauve underline underline-offset-2"
                  >
                    {prettyPhone(order.phone)}
                  </a>
                ) : (
                  <p className="text-stone">{order.phone}</p>
                )}
                <p className="mt-1 text-stone">
                  {order.deliveryLabel}
                  {order.address ? ` — ${order.address}, ${order.city}` : ''}
                </p>
                <p className="mt-1 text-stone">
                  {order.paymentMethodLabel} · {PAYMENT_STATUS_LABEL[order.paymentStatus]}
                </p>
                {order.note && <p className="mt-2 italic text-stone">« {order.note} »</p>}
              </div>

              <ul className="space-y-1.5 text-stone">
                {order.items.map((item, index) => (
                  <li key={index}>
                    {item.quantity} × {item.name}
                    {Object.keys(item.options).length > 0 && (
                      <span className="text-[12px]">
                        {' '}
                        (
                        {Object.entries(item.options)
                          .map(([k, v]) => `${k} : ${v}`)
                          .join(', ')}
                        )
                      </span>
                    )}{' '}
                    — {formatFcfa(item.unitPrice * item.quantity)}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-3">
              <label className="text-[12.5px] text-stone">
                Statut de la commande
                <Select
                  className="mt-1"
                  disabled={busy === order.id}
                  value={order.orderStatus}
                  onChange={(e) => void patch(order, { orderStatus: e.target.value as OrderStatus })}
                >
                  {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>

              <label className="text-[12.5px] text-stone">
                Paiement
                <Select
                  className="mt-1"
                  disabled={busy === order.id}
                  value={order.paymentStatus}
                  onChange={(e) => void patch(order, { paymentStatus: e.target.value as PaymentStatus })}
                >
                  {Object.entries(PAYMENT_STATUS_LABEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </label>

              <AmountField
                label="Frais de livraison (FCFA)"
                value={order.deliveryFee}
                placeholder="À confirmer"
                disabled={busy === order.id}
                onSave={(value) => void patch(order, { deliveryFee: value })}
                hint={
                  order.deliveryFee === null
                    ? "Renseignez les frais pour figer le total avant d'annoncer le montant."
                    : undefined
                }
              />
            </div>

            <OrderWorkflow order={order} busy={busy === order.id} patch={patch} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Avancer une commande d'une étape, et le dire à la cliente.
 *
 * Même principe que pour les demandes SHEIN : le site enregistre l'étape,
 * le message WhatsApp la porte jusqu'à la cliente, et la page Suivi affiche
 * exactement le même état.
 */
function OrderWorkflow({
  order,
  busy,
  patch,
}: {
  order: Order;
  busy: boolean;
  patch: (order: Order, changes: Parameters<typeof db.updateOrder>[1]) => Promise<void>;
}) {
  const stepIndex = ORDER_STEPS.findIndex((step) => step.id === order.orderStatus);
  const step = ORDER_STEPS[stepIndex];
  const next = nextOrderStatus(order.orderStatus);
  const nextStep = ORDER_STEPS.find((s) => s.id === next);
  const cancelled = order.orderStatus === 'cancelled';

  const message = step
    ? buildStatusMessage({
        reference: order.orderNumber,
        customerName: order.customerName,
        stepLabel: step.label,
        stepHint: step.hint,
        amount: order.deliveryFee === null ? null : formatFcfa(order.total),
        trackingUrl: `${SITE_URL}/suivi`,
      })
    : '';

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
      {stepIndex >= 0 && (
        <span className="text-[12px] text-stone">
          Étape {stepIndex + 1} sur {ORDER_STEPS.length}
        </span>
      )}

      {next && !cancelled && (
        <button
          type="button"
          disabled={busy}
          onClick={() => void patch(order, { orderStatus: next })}
          className="press inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-medium text-ivory disabled:cursor-not-allowed disabled:bg-stone"
        >
          Passer à « {nextStep?.label} »
          <ArrowRight className="size-3.5" />
        </button>
      )}

      {isWhatsappConfigured(order.phone) && step && (
        <a
          href={whatsappLink(order.phone, message)}
          target="_blank"
          rel="noopener noreferrer"
          className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-graphite"
        >
          <MessageCircle className="size-3.5" />
          Prévenir la cliente
        </a>
      )}
    </div>
  );
}

