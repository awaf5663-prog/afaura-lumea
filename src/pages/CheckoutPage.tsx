import { AlertCircle, Info, Lock, MessageCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ConfirmerEnvoi, type LigneRecap } from '@/src/components/order/ConfirmerEnvoi';
import { RappelMesures } from '@/src/components/guide/GuideMesures';
import { PromoCodeField } from '@/src/components/order/PromoCodeField';
import { PromotionNotice } from '@/src/components/shein/PromotionNotice';
import { Button } from '@/src/components/ui/Button';
import { ErrorText, FormRow, Input, Label, Textarea } from '@/src/components/ui/Field';
import { PAYMENT_METHODS } from '@/src/config/site';
import { useCart } from '@/src/hooks/useCart';
import { useSettings, useWhatsapp } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { findPromotion, visiblePromotions } from '@/src/lib/pricing/promotions';
import { fraisBoutique, nombreArticles } from '@/src/lib/pricing/storeFee';
import { cn } from '@/src/lib/cn';
import { formatFcfa, isValidSenegalPhone, normalizePhone, prettyPhone } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import { buildOrderMessage } from '@/src/lib/whatsapp';
import { openWhatsapp } from '@/src/lib/whatsappHandoff';
import { db } from '@/src/services';

interface FormState {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  zoneId: string;
  paymentMethod: string;
  promoCode: string;
  isStudent: boolean;
}

export function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { zones, settings } = useSettings();
  const whatsapp = useWhatsapp();
  const { navigate } = useRouter();
  const { notify } = useToast();

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: 'Saint-Louis',
    note: '',
    zoneId: zones[0]?.id ?? 'pickup',
    paymentMethod: PAYMENT_METHODS[0].id,
    promoCode: '',
    isStudent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /*
   * Dernière relecture avant l'envoi. Le formulaire est déjà valide quand ce
   * panneau s'ouvre : on ne redemande pas à la machine de vérifier, on
   * demande à la cliente de relire — un numéro juste en apparence, la machine
   * ne saura jamais le corriger.
   */
  const [relecture, setRelecture] = useState(false);

  useSeo({
    title: 'Validation de commande',
    description: 'Coordonnées, mode de livraison et paiement.',
    noIndex: true,
  });

  const zone = useMemo(() => zones.find((z) => z.id === form.zoneId) ?? zones[0], [zones, form.zoneId]);
  const method = PAYMENT_METHODS.find((m) => m.id === form.paymentMethod) ?? PAYMENT_METHODS[0];
  const rawDeliveryFee = zone?.fee ?? null;

  /**
   * Aperçu de l'offre. Recalculé à l'identique côté données à l'enregistrement :
   * ce que la cliente voit ici ne décide de rien.
   */
  const promoContext = useMemo(
    () => ({
      kind: 'store' as const,
      isStudent: form.isStudent,
      groupingId: null,
      deliveryOptionId: form.zoneId,
    }),
    [form.isStudent, form.zoneId],
  );
  const promotion = findPromotion(settings?.promotions ?? [], {
    ...promoContext,
    code: form.promoCode,
  });
  const freeDelivery =
    promotion?.effect.type === 'free_delivery' && rawDeliveryFee !== null && rawDeliveryFee > 0;
  const deliveryFee = freeDelivery ? 0 : rawDeliveryFee;
  /*
   * Frais de traitement, d'après la grille de Administration → Tarification :
   * la même que pour SHEIN, rien n'est écrit en dur ici. C'est la base de
   * données qui recalcule ce montant à l'enregistrement ; ce que la cliente
   * lit ici n'en est qu'un aperçu fidèle.
   */
  const articles = nombreArticles(items);
  const serviceFee = fraisBoutique(articles, settings?.pricing?.tiers ?? []);
  const discount =
    promotion?.effect.type === 'discount_amount'
      ? Math.min(Math.max(0, promotion.effect.amount), subtotal + serviceFee + (rawDeliveryFee ?? 0))
      : 0;
  const total = subtotal + serviceFee + (deliveryFee ?? 0) - discount;

  const asksStudent = visiblePromotions(settings?.promotions ?? [], 'store').some(
    (offer) => offer.studentOnly,
  );

  if (items.length === 0 && !submitting) {
    return (
      <div className="container-page py-20 text-center">
        <h1 className="text-[30px]">Votre panier est vide</h1>
        <p className="mt-3 text-[15px] text-stone">Ajoutez au moins un article pour commander.</p>
        <Button className="mt-8" onClick={() => navigate('/boutique')}>
          Aller à la boutique
        </Button>
      </div>
    );
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.firstName.trim()) next.firstName = 'Indiquez votre prénom.';
    if (!form.lastName.trim()) next.lastName = 'Indiquez votre nom.';
    if (!form.phone.trim()) next.phone = 'Le numéro WhatsApp est indispensable pour vous répondre.';
    else if (!isValidSenegalPhone(form.phone)) next.phone = 'Numéro invalide. Exemple : 77 123 45 67';
    if (zone?.type === 'delivery') {
      if (!form.address.trim()) next.address = 'Indiquez le quartier et un repère.';
      if (!form.city.trim()) next.city = 'Indiquez la ville.';
    }
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const firstField = document.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      firstField?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      firstField?.focus({ preventScroll: true });
    }
    return Object.keys(next).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitError(null);
    setRelecture(true);
  };

  const envoyer = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Aucun montant n'est transmis : la couche données recalcule tout.
      const order = await db.createOrder({
        customerName: `${form.firstName.trim()} ${form.lastName.trim()}`,
        phone: form.phone,
        address: form.address,
        city: form.city,
        note: form.note,
        deliveryZoneId: form.zoneId,
        paymentMethod: form.paymentMethod,
        promoCode: form.promoCode,
        isStudent: form.isStudent,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          options: item.options,
        })),
      });

      const mine = readJson<Array<{ orderNumber: string; phone: string }>>(STORAGE_KEYS.myOrders, []);
      writeJson(STORAGE_KEYS.myOrders, [
        { orderNumber: order.orderNumber, phone: normalizePhone(form.phone) },
        ...mine.filter((m) => m.orderNumber !== order.orderNumber),
      ]);

      setRelecture(false);
      clear();
      // La confirmation est empilée d'abord : le bouton retour depuis
      // WhatsApp ramène dessus, avec le récapitulatif.
      navigate(`/confirmation/${order.orderNumber}`);
      // Puis WhatsApp, message déjà rédigé, à partir de la commande que
      // l'on tient en main — sans dépendre d'une relecture en base.
      openWhatsapp(whatsapp.url(buildOrderMessage(order)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'La commande n’a pas pu être enregistrée.';
      setSubmitError(message);
      notify(message, 'error');
      setSubmitting(false);
      // On referme la relecture : l'erreur s'affiche dans le formulaire,
      // derrière le panneau, où la cliente peut corriger.
      setRelecture(false);
    }
  };

  const recapitulatif: LigneRecap[] = [
    { label: 'Nom', value: `${form.firstName.trim()} ${form.lastName.trim()}`.trim() || '—' },
    { label: 'Téléphone', value: prettyPhone(form.phone) || '—', cle: true },
    {
      label: 'Livraison',
      value: [zone?.label, form.address.trim(), form.city.trim()].filter(Boolean).join(' — ') || '—',
    },
    { label: 'Paiement', value: method.label },
    {
      label: 'Articles',
      value: `${articles} article${articles > 1 ? 's' : ''}`,
    },
    {
      label: 'Total',
      value: deliveryFee === null ? `${formatFcfa(total)} + livraison` : formatFcfa(total),
    },
  ];

  if (serviceFee > 0) {
    recapitulatif.splice(recapitulatif.length - 1, 0, {
      label: 'Frais de traitement',
      value: formatFcfa(serviceFee),
    });
  }

  return (
    <form onSubmit={submit} className="container-page py-8">
      <h1 className="text-[34px] sm:text-[42px]">Validation</h1>
      <p className="mt-2 text-[14px] text-stone">
        Trois informations, et c'est terminé. Nous vous répondons ensuite sur WhatsApp.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <section>
            <h2 className="text-[22px]">1. Vos coordonnées</h2>
            <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  error={errors.firstName}
                />
                <ErrorText>{errors.firstName}</ErrorText>
              </FormRow>
              <FormRow>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={(e) => set('lastName', e.target.value)}
                  error={errors.lastName}
                />
                <ErrorText>{errors.lastName}</ErrorText>
              </FormRow>
            </div>
            <FormRow>
              <Label htmlFor="phone" hint="celui qui reçoit WhatsApp">
                Numéro WhatsApp
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="77 123 45 67"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                error={errors.phone}
              />
              <ErrorText>{errors.phone}</ErrorText>
            </FormRow>
          </section>

          <section className="mt-10">
            <h2 className="text-[22px]">2. Livraison</h2>
            <div className="mt-5 space-y-3">
              {zones.map((z) => (
                <label
                  key={z.id}
                  className={cn(
                    'press flex cursor-pointer items-start gap-3 rounded-[--radius-md] border bg-white p-4 transition-colors',
                    form.zoneId === z.id ? 'border-ink' : 'border-line',
                  )}
                >
                  <input
                    type="radio"
                    name="zone"
                    value={z.id}
                    checked={form.zoneId === z.id}
                    onChange={() => set('zoneId', z.id)}
                    className="mt-1 accent-[#8e2961]"
                  />
                  <span className="flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="text-[15px] font-medium">{z.label}</span>
                      <span className="shrink-0 text-[13.5px] tabular-nums text-graphite">
                        {z.fee === null ? 'À confirmer' : z.fee === 0 ? 'Gratuit' : formatFcfa(z.fee)}
                      </span>
                    </span>
                    {z.hint && <span className="mt-1 block text-[12.5px] text-stone">{z.hint}</span>}
                  </span>
                </label>
              ))}
            </div>

            {zone?.type === 'delivery' && (
              <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
                <FormRow className="sm:col-span-2">
                  <Label htmlFor="address">Adresse / quartier et repère</Label>
                  <Input
                    id="address"
                    name="address"
                    autoComplete="street-address"
                    placeholder="Ex : Sacré-Cœur 3, en face de la pharmacie"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    error={errors.address}
                  />
                  <ErrorText>{errors.address}</ErrorText>
                </FormRow>
                <FormRow>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) => set('city', e.target.value)}
                    error={errors.city}
                  />
                  <ErrorText>{errors.city}</ErrorText>
                </FormRow>
              </div>
            )}

            {deliveryFee === null && (
              <p className="mt-3 flex gap-2 rounded-[--radius-sm] bg-cream px-4 py-3 text-[12.5px] text-graphite">
                <Info className="mt-0.5 size-4 shrink-0" />
                Les frais de cette zone ne sont pas encore fixés : le montant exact vous est confirmé
                sur WhatsApp avant tout paiement.
              </p>
            )}
          </section>

          <section className="mt-10">
            <PromotionNotice kind="store" />

            {asksStudent && (
              <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[--radius-md] border border-line bg-cream/60 p-4">
                <input
                  type="checkbox"
                  checked={form.isStudent}
                  onChange={(e) => set('isStudent', e.target.checked)}
                  className="mt-1 size-4 accent-[#8e2961]"
                />
                <span className="text-[13.5px] leading-relaxed text-graphite">
                  <span className="font-medium">Je suis étudiante</span>
                  <span className="mt-1 block text-[12.5px] text-stone">
                    Une offre en cours est réservée aux étudiantes. Nous vous demanderons votre
                    carte sur WhatsApp avant de l'appliquer.
                  </span>
                </span>
              </label>
            )}

            <div className="mt-4">
              <PromoCodeField
                value={form.promoCode}
                onChange={(next) => set('promoCode', next)}
                context={promoContext}
              />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-[22px]">3. Paiement</h2>
            <div className="mt-5 space-y-3">
              {PAYMENT_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={cn(
                    'press flex cursor-pointer items-start gap-3 rounded-[--radius-md] border bg-white p-4 transition-colors',
                    form.paymentMethod === m.id ? 'border-ink' : 'border-line',
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.id}
                    checked={form.paymentMethod === m.id}
                    onChange={() => set('paymentMethod', m.id)}
                    className="mt-1 accent-[#8e2961]"
                  />
                  <span>
                    <span className="block text-[15px] font-medium">{m.label}</span>
                    <span className="mt-1 block text-[12.5px] text-stone">{m.description}</span>
                  </span>
                </label>
              ))}
            </div>

            {/*
              Les instructions de paiement (numéro, montant) ne sont plus ici :
              les afficher avant la validation laissait croire que payer
              suffisait, alors que rien n'est vérifié automatiquement. Elles
              apparaissent sur la page de confirmation, une fois la commande
              enregistrée et le numéro attribué — c'est ce numéro qui permet de
              rapprocher un paiement d'une commande.
            */}
            {method.requiresProof && (
              <p className="mt-4 flex gap-2 rounded-[--radius-md] border border-line bg-cream/60 px-4 py-3.5 text-[13px] leading-relaxed text-graphite">
                <Info className="mt-0.5 size-4 shrink-0" />
                Après validation de votre commande, les instructions de paiement s'afficheront et
                vous pourrez envoyer votre preuve de paiement via WhatsApp.
              </p>
            )}
          </section>

          <section className="mt-10">
            <FormRow>
              <Label htmlFor="note" hint="(facultatif)">
                Commentaire
              </Label>
              <Textarea
                id="note"
                name="note"
                placeholder="Une précision sur la couleur, l'horaire de livraison…"
                value={form.note}
                onChange={(e) => set('note', e.target.value)}
              />
            </FormRow>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[--radius-lg] border border-line bg-white p-6">
            <h2 className="text-[20px]">Votre commande</h2>
            <ul className="mt-4 space-y-3 text-[13.5px]">
              {items.map((item) => (
                <li key={item.key} className="flex justify-between gap-3">
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
                  <span className="shrink-0 tabular-nums">
                    {formatFcfa(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Sous-total</dt>
                <dd className="tabular-nums">{formatFcfa(subtotal)}</dd>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone">Frais de traitement</dt>
                  <dd className="tabular-nums">{formatFcfa(serviceFee)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">{zone?.label}</dt>
                <dd className="tabular-nums">
                  {freeDelivery ? (
                    <>
                      <span className="text-stone line-through">{formatFcfa(rawDeliveryFee ?? 0)}</span>
                      <span className="ml-2 font-medium text-mauve">Offerte</span>
                    </>
                  ) : deliveryFee === null ? (
                    'À confirmer'
                  ) : deliveryFee === 0 ? (
                    'Gratuit'
                  ) : (
                    formatFcfa(deliveryFee)
                  )}
                </dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-mauve">{promotion?.label ?? 'Remise'}</dt>
                  <dd className="tabular-nums text-mauve">− {formatFcfa(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-3 text-[18px]">
                <dt>Total</dt>
                <dd className="font-medium tabular-nums">
                  {formatFcfa(total)}
                  {deliveryFee === null && <span className="text-[13px] text-stone"> + livraison</span>}
                </dd>
              </div>
            </dl>

            {submitError && (
              <p className="mt-4 flex gap-2 rounded-[--radius-sm] bg-[#f6e9e9] px-4 py-3 text-[12.5px] text-[#8a2f2f]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {submitError}
              </p>
            )}

            <div className="mt-6">
              <RappelMesures contexte="boutique" />
            </div>

            <Button type="submit" full size="lg" className="mt-4" loading={submitting}>
              <MessageCircle className="size-4" />
              Envoyer ma commande sur WhatsApp
            </Button>
            {/*
              Le bouton enregistre la commande, puis WhatsApp s'ouvre avec le
              message déjà rédigé. Sans numéro configuré, il n'y a rien à
              pré-remplir : on le dit, plutôt que de promettre une ouverture
              qui n'aura pas lieu.
            */}
            <p className="mt-3 text-center text-[11.5px] leading-relaxed text-stone">
              {whatsapp.prefill
                ? "Votre commande est enregistrée et reçoit un numéro, puis WhatsApp s'ouvre avec le message déjà écrit."
                : "Nous enregistrons votre commande et lui donnons un numéro, puis vous l'envoyez sur WhatsApp en un geste."}
            </p>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-[11.5px] text-stone">
              <Lock className="size-3.5" /> Aucun paiement n'est prélevé sur ce site.
            </p>
          </div>
        </aside>
      </div>

      <ConfirmerEnvoi
        open={relecture}
        onClose={() => setRelecture(false)}
        onConfirm={() => void envoyer()}
        busy={submitting}
        lignes={recapitulatif}
        action="Oui, envoyer ma commande"
        rappel="Vérifiez aussi la taille choisie : la pièce est commandée pour vous, elle ne s'essaie pas avant d'arriver. Le guide des mesures est sur la page, sous le récapitulatif."
      />
    </form>
  );
}
