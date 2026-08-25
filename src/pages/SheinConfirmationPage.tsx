import { Check, Copy, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusTimeline } from '@/src/components/order/StatusTimeline';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { SHEIN_STEPS } from '@/src/lib/orderStatus';
import { Link, useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { STORAGE_KEYS, readJson } from '@/src/lib/storage';
import { buildSheinMessage, isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';
import { db } from '@/src/services';
import type { SheinRequest } from '@/src/types';

export function SheinConfirmationPage({ requestNumber }: { requestNumber: string }) {
  const { settings } = useSettings();
  const { navigate } = useRouter();
  const { notify } = useToast();
  const [request, setRequest] = useState<SheinRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useSeo({ title: `Demande ${requestNumber} envoyée`, description: 'Récapitulatif de la demande SHEIN.', noIndex: true });

  useEffect(() => {
    const mine = readJson<Array<{ requestNumber: string; phone: string }>>(STORAGE_KEYS.myShein, []);
    const entry = mine.find((m) => m.requestNumber === requestNumber);
    if (!entry) {
      setLoading(false);
      return;
    }
    void db
      .findSheinRequest(entry.requestNumber, entry.phone)
      .then(setRequest)
      .finally(() => setLoading(false));
  }, [requestNumber]);

  if (loading) {
    return (
      <div className="container-page grid place-items-center py-32 text-stone">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Demande introuvable sur cet appareil"
          description="Retrouvez-la depuis la page de suivi avec son numéro et votre numéro WhatsApp."
          action={<Button onClick={() => navigate('/suivi')}>Suivre ma demande</Button>}
        />
      </div>
    );
  }

  const number = settings?.whatsappNumber ?? '';
  const message = buildSheinMessage(request);
  const hasScreenshots = request.items.some((item) => item.screenshotName);

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-2xl">
        <div className="animate-fade flex flex-col items-center text-center">
          <span className="grid size-14 place-items-center rounded-full bg-ink text-ivory">
            <Check className="size-7" />
          </span>
          <h1 className="mt-5 text-[34px] sm:text-[42px]">Demande envoyée</h1>
          <p className="mt-3 max-w-md text-[15px] text-graphite">
            Nous vérifions vos articles et vous revenons avec le montant total en FCFA.
          </p>
        </div>

        <div className="mt-8 rounded-[--radius-lg] border border-line bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Numéro de demande</p>
              <p className="mt-1 font-display text-[24px]">{request.requestNumber}</p>
            </div>
            <button
              type="button"
              className="press inline-flex items-center gap-2 rounded-full border border-line px-3.5 py-2 text-[12.5px]"
              onClick={() => {
                void navigator.clipboard
                  ?.writeText(request.requestNumber)
                  .then(() => notify('Numéro copié'))
                  .catch(() => notify('Copie impossible', 'error'));
              }}
            >
              <Copy className="size-3.5" /> Copier
            </button>
          </div>

          <ul className="mt-6 space-y-3 border-t border-line pt-5 text-[13.5px]">
            {request.items.map((item, index) => (
              <li key={index} className="flex gap-3">
                {item.screenshotData ? (
                  <img src={item.screenshotData} alt="" className="size-12 rounded-[--radius-xs] object-cover" />
                ) : null}
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.reference || `Article ${index + 1}`}</p>
                  <p className="truncate text-[12.5px] text-stone">
                    {[item.size && `Taille ${item.size}`, item.color, `Qté ${item.quantity}`]
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
        </div>

        {isWhatsappConfigured(number) ? (
          <div className="mt-6">
            <Button
              full
              size="lg"
              variant="whatsapp"
              onClick={() => window.open(whatsappLink(number, message), '_blank', 'noopener')}
            >
              Continuer sur WhatsApp
            </Button>
            <p className="mt-2.5 text-center text-[12.5px] text-stone">
              {hasScreenshots
                ? 'Le message est prêt : envoyez-le, puis joignez vos captures dans la conversation.'
                : 'Le message est déjà rédigé : il ne reste qu’à l’envoyer.'}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-[--radius-md] border border-line bg-cream/70 p-5 text-[13.5px]">
            <p className="font-medium">Message prêt à copier</p>
            <pre className="mt-3 whitespace-pre-wrap font-sans text-[13px] text-stone">{message}</pre>
            <Button
              className="mt-4"
              variant="secondary"
              onClick={() => void navigator.clipboard?.writeText(message).then(() => notify('Message copié'))}
            >
              Copier le message
            </Button>
          </div>
        )}

        <section className="mt-10">
          <h2 className="text-[22px]">Les étapes à venir</h2>
          <div className="mt-5">
            <StatusTimeline steps={SHEIN_STEPS} currentId={request.status} />
          </div>
        </section>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/suivi"
            className="press inline-flex h-12 flex-1 items-center justify-center rounded-full border border-ink/25 text-[14px]"
          >
            Suivre ma demande
          </Link>
          <Link
            to="/boutique"
            className="press inline-flex h-12 flex-1 items-center justify-center rounded-full bg-cream text-[14px]"
          >
            Voir la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}
