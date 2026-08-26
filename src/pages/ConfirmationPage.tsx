import { Check, Copy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusTimeline } from '@/src/components/order/StatusTimeline';
import { PaymentInstructions } from '@/src/components/order/PaymentInstructions';
import { WhatsAppHandoff } from '@/src/components/order/WhatsAppHandoff';
import { WhatsappOpening } from '@/src/components/order/WhatsappOpening';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { ORDER_STEPS, PAYMENT_STATUS_LABEL } from '@/src/lib/orderStatus';
import { Link, useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { STORAGE_KEYS, readJson } from '@/src/lib/storage';
import { buildOrderMessage } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { Order } from '@/src/types';

export function ConfirmationPage({ orderNumber }: { orderNumber: string }) {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({ title: `Commande ${orderNumber} confirmée`, description: 'Récapitulatif de commande.', noIndex: true });

  useEffect(() => {
    const mine = readJson<Array<{ orderNumber: string; phone: string }>>(STORAGE_KEYS.myOrders, []);
    const entry = mine.find((m) => m.orderNumber === orderNumber);
    if (!entry) {
      setLoading(false);
      return;
    }
    void db
      .findOrder(entry.orderNumber, entry.phone)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="container-page grid place-items-center py-32 text-stone">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Récapitulatif introuvable sur cet appareil"
          description="Retrouvez votre commande depuis la page de suivi avec son numéro et votre numéro WhatsApp."
          action={<Button onClick={() => navigate('/suivi')}>Suivre ma commande</Button>}
        />
      </div>
    );
  }

  const message = buildOrderMessage(order);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <WhatsappOpening reference={orderNumber} message={message} />
        <div className="animate-fade flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-mauve text-ivory">
            <Check className="size-7" />
          </span>
          <h1 className="mt-5 text-[34px] sm:text-[42px]">Commande confirmée</h1>
          <p className="mt-3 max-w-md text-[15px] text-graphite">
            Merci pour votre confiance. Voici votre récapitulatif — nous poursuivons sur WhatsApp.
          </p>
        </div>

        <div className="mt-8 rounded-[--radius-lg] border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Numéro de commande</p>
              <p className="mt-1 font-display text-[24px]">{order.orderNumber}</p>
            </div>
            <button
              type="button"
              className="press inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[12.5px]"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(order.orderNumber)
                  .then(() => notify('Numéro copié'))
                  .catch(() => notify('Copie impossible', 'error'));
              }}
            >
              <Copy className="size-3.5" /> Copier
            </button>
          </div>

          <dl className="mt-6 space-y-2.5 border-t border-line pt-5 text-[14px]">
            <Row label="Montant">
              {formatFcfa(order.total)}
              {order.deliveryFee === null && <span className="text-[12.5px] text-stone"> + livraison</span>}
            </Row>
            <Row label="Livraison">
              {order.deliveryLabel}
              {order.deliveryFeeBeforePromotion ? (
                <span className="ml-2 text-mauve">— offerte</span>
              ) : null}
            </Row>
            {order.promotionLabel && (
              <Row label="Offre appliquée">
                <span className="text-mauve">{order.promotionLabel}</span>
                {order.discount > 0 && (
                  <span className="ml-1 text-mauve">(− {formatFcfa(order.discount)})</span>
                )}
              </Row>
            )}
            <Row label="Paiement">{order.paymentMethodLabel}</Row>
            <Row label="Statut du paiement">{PAYMENT_STATUS_LABEL[order.paymentStatus]}</Row>
          </dl>

          <ul className="mt-5 space-y-2 border-t border-line pt-5 text-[13.5px]">
            {order.items.map((item, index) => (
              <li key={index} className="flex justify-between gap-3">
                <span className="min-w-0">
                  <span className="block truncate">
                    {item.name} × {item.quantity}
                  </span>
                  {Object.keys(item.options).length > 0 && (
                    <span className="block truncate text-[12px] text-stone">
                      {Object.entries(item.options)
                        .map(([k, v]) => `${k} : ${v}`)
                        .join(' · ')}
                    </span>
                  )}
                </span>
                <span className="shrink-0 tabular-nums">{formatFcfa(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        {order.paymentStatus === 'pending' && (
          <div className="mt-6">
            <PaymentInstructions
              methodId={order.paymentMethod}
              amount={order.total}
              amountIsFinal={order.deliveryFee !== null}
            />
          </div>
        )}

        <WhatsAppHandoff message={message} />

        <section className="mt-10">
          <h2 className="text-[22px]">Et maintenant ?</h2>
          <div className="mt-5">
            <StatusTimeline steps={ORDER_STEPS} currentId={order.orderStatus} />
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/suivi"
            className="press inline-flex h-12 flex-1 items-center justify-center rounded-full border border-ink/25 text-[14px]"
          >
            Suivre ma commande
          </Link>
          <Link
            to="/boutique"
            className="press inline-flex h-12 flex-1 items-center justify-center rounded-full bg-cream text-[14px]"
          >
            Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-stone">{label}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}
