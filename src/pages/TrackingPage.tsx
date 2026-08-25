import { PackageSearch, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusTimeline } from '@/src/components/order/StatusTimeline';
import { Button } from '@/src/components/ui/Button';
import { ErrorText, FormRow, Input, Label } from '@/src/components/ui/Field';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDateTime, formatFcfa, isValidSenegalPhone } from '@/src/lib/format';
import {
  ORDER_STEPS,
  PAYMENT_STATUS_LABEL,
  SHEIN_STATUS_LABEL,
  SHEIN_STEPS,
} from '@/src/lib/orderStatus';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { STORAGE_KEYS, readJson } from '@/src/lib/storage';
import { buildTrackingMessage, isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { Order, SheinRequest } from '@/src/types';

type Result = { kind: 'order'; data: Order } | { kind: 'shein'; data: SheinRequest };

export function TrackingPage() {
  const { search } = useRouter();
  const { settings } = useSettings();

  const [reference, setReference] = useState(search.get('numero') ?? '');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ reference?: string; phone?: string }>({});
  const [result, setResult] = useState<Result | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useSeo({
    title: 'Suivre ma commande',
    description:
      'Entrez votre numéro de commande ou de demande SHEIN et votre numéro WhatsApp pour connaître l’avancement.',
  });

  useEffect(() => {
    const orders = readJson<Array<{ orderNumber: string }>>(STORAGE_KEYS.myOrders, []).map(
      (o) => o.orderNumber,
    );
    const shein = readJson<Array<{ requestNumber: string }>>(STORAGE_KEYS.myShein, []).map(
      (s) => s.requestNumber,
    );
    setRecent([...orders, ...shein].slice(0, 6));
  }, []);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const next: typeof errors = {};
    if (!reference.trim()) next.reference = 'Entrez le numéro reçu à la commande.';
    if (!phone.trim()) next.phone = 'Entrez le numéro WhatsApp utilisé pour commander.';
    else if (!isValidSenegalPhone(phone)) next.phone = 'Numéro invalide.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const ref = reference.trim().toUpperCase();
      if (ref.startsWith('SHEIN')) {
        const found = await db.findSheinRequest(ref, phone);
        if (found) setResult({ kind: 'shein', data: found });
        else setNotFound(true);
      } else {
        const found = await db.findOrder(ref, phone);
        if (found) setResult({ kind: 'order', data: found });
        else setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const number = settings?.whatsappNumber ?? '';

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <p className="eyebrow">Suivi</p>
        <h1 className="mt-3 text-[34px] sm:text-[44px]">Où en est ma commande ?</h1>
        <p className="mt-3 text-[15px] text-graphite">
          Entrez le numéro reçu à la validation (CMD-… ou SHEIN-…) et le numéro WhatsApp utilisé.
        </p>

        <form onSubmit={submit} className="mt-8 rounded-[--radius-lg] border border-line bg-white p-6">
          <div className="grid gap-x-4 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="reference">Numéro de commande</Label>
              <Input
                id="reference"
                value={reference}
                onChange={(e) => {
                  setReference(e.target.value);
                  setErrors((prev) => ({ ...prev, reference: undefined }));
                }}
                placeholder="CMD-2026-00001"
                autoCapitalize="characters"
                error={errors.reference}
              />
              <ErrorText>{errors.reference}</ErrorText>
            </FormRow>
            <FormRow>
              <Label htmlFor="track-phone">Numéro WhatsApp</Label>
              <Input
                id="track-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setErrors((prev) => ({ ...prev, phone: undefined }));
                }}
                placeholder="77 123 45 67"
                error={errors.phone}
              />
              <ErrorText>{errors.phone}</ErrorText>
            </FormRow>
          </div>

          {recent.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-[12.5px] text-stone">Sur cet appareil :</span>
              {recent.map((ref) => (
                <button
                  key={ref}
                  type="button"
                  onClick={() => setReference(ref)}
                  className="press rounded-full bg-cream px-3 py-1.5 text-[12px]"
                >
                  {ref}
                </button>
              ))}
            </div>
          )}

          <Button type="submit" full size="lg" loading={loading} icon={<Search className="size-4" />}>
            Rechercher
          </Button>
        </form>

        {notFound && (
          <div className="mt-6 rounded-[--radius-md] border border-line bg-cream/70 p-5 text-[14px] text-graphite">
            <p className="font-medium">Aucune commande ne correspond.</p>
            <p className="mt-1.5 text-stone">
              Vérifiez le numéro et le numéro WhatsApp saisi. Si la commande a été passée par
              message plutôt que sur le site, elle n'apparaît pas ici — écrivez-nous, on vous répond
              avec l'avancement.
            </p>
            {isWhatsappConfigured(number) && (
              <Button
                className="mt-4"
                variant="whatsapp"
                onClick={() =>
                  window.open(
                    whatsappLink(number, buildTrackingMessage(reference.trim().toUpperCase())),
                    '_blank',
                    'noopener',
                  )
                }
              >
                Demander sur WhatsApp
              </Button>
            )}
          </div>
        )}

        {result?.kind === 'order' && (
          <ResultCard
            title={result.data.orderNumber}
            createdAt={result.data.createdAt}
            rows={[
              ['Montant', `${formatFcfa(result.data.total)}${result.data.deliveryFee === null ? ' + livraison' : ''}`],
              ['Livraison', result.data.deliveryLabel],
              ['Paiement', `${result.data.paymentMethodLabel} — ${PAYMENT_STATUS_LABEL[result.data.paymentStatus]}`],
            ]}
          >
            <StatusTimeline
              steps={ORDER_STEPS}
              currentId={result.data.orderStatus}
              cancelled={result.data.orderStatus === 'cancelled'}
            />
          </ResultCard>
        )}

        {result?.kind === 'shein' && (
          <ResultCard
            title={result.data.requestNumber}
            createdAt={result.data.createdAt}
            rows={[
              ['Articles', String(result.data.items.length)],
              [
                'Montant confirmé',
                result.data.quotedTotal === null
                  ? 'En cours de vérification'
                  : formatFcfa(result.data.quotedTotal),
              ],
              ['Étape', SHEIN_STATUS_LABEL[result.data.status]],
            ]}
          >
            <StatusTimeline
              steps={SHEIN_STEPS}
              currentId={result.data.status}
              cancelled={result.data.status === 'cancelled'}
            />
          </ResultCard>
        )}

        {!result && !notFound && (
          <div className="mt-10 flex items-start gap-3 text-[13px] text-stone">
            <PackageSearch className="mt-0.5 size-4 shrink-0" />
            <p>
              Le suivi affiche l'étape exacte enregistrée par notre équipe. Il est mis à jour au fur et
              à mesure — pas de statut automatique inventé entre deux étapes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultCard({
  title,
  createdAt,
  rows,
  children,
}: {
  title: string;
  createdAt: string;
  rows: Array<[string, string]>;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-fade mt-8 rounded-[--radius-lg] border border-line bg-white p-6">
      <p className="eyebrow">Commande trouvée</p>
      <h2 className="mt-1 font-display text-[26px]">{title}</h2>
      <p className="mt-1 text-[12.5px] text-stone">Créée le {formatDateTime(createdAt)}</p>

      <dl className="mt-5 space-y-2.5 border-y border-line py-5 text-[14px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4">
            <dt className="text-stone">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6">{children}</div>
    </div>
  );
}
