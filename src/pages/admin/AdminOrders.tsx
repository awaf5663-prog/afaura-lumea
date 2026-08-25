import { useState } from 'react';
import { Badge } from '@/src/components/ui/Badge';
import { Select } from '@/src/components/ui/Field';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useToast } from '@/src/hooks/useToast';
import { formatDateTime, formatFcfa, prettyPhone } from '@/src/lib/format';
import { ORDER_STATUS_LABEL, PAYMENT_STATUS_LABEL } from '@/src/lib/orderStatus';
import { isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { Order, OrderStatus, PaymentStatus } from '@/src/types';

export function AdminOrders({
  orders,
  reload,
  whatsappNumber,
}: {
  orders: Order[];
  reload: () => Promise<void>;
  whatsappNumber: string;
}) {
  const { notify } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

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
      <h2 className="text-[24px]">Commandes ({orders.length})</h2>

      <ul className="mt-6 space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="rounded-[--radius-lg] border border-line bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[20px]">{order.orderNumber}</p>
                <p className="mt-0.5 text-[12.5px] text-stone">{formatDateTime(order.createdAt)}</p>
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

              <label className="text-[12.5px] text-stone">
                Frais de livraison (FCFA)
                <input
                  type="number"
                  min={0}
                  step={100}
                  defaultValue={order.deliveryFee ?? ''}
                  placeholder="À confirmer"
                  disabled={busy === order.id}
                  onBlur={(e) => {
                    const raw = e.target.value;
                    const next = raw === '' ? null : Number(raw);
                    if (next !== order.deliveryFee) void patch(order, { deliveryFee: next });
                  }}
                  className="mt-1 w-full rounded-[--radius-sm] border border-line bg-white px-4 py-3 text-[15px] focus:border-ink focus:outline-none"
                />
              </label>
            </div>

            {isWhatsappConfigured(whatsappNumber) && order.deliveryFee === null && (
              <p className="mt-3 text-[12px] text-stone">
                Renseignez les frais pour figer le total avant d'annoncer le montant à la cliente.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
