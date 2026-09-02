import { AlertCircle, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { RappelMesures } from '@/src/components/guide/GuideMesures';
import { GroupingCapacity } from '@/src/components/shein/GroupingCapacity';
import { ConfirmerEnvoi, type LigneRecap } from '@/src/components/order/ConfirmerEnvoi';
import { PromoCodeField } from '@/src/components/order/PromoCodeField';
import { PromotionNotice } from '@/src/components/shein/PromotionNotice';
import { QuoteSummary } from '@/src/components/shein/QuoteSummary';
import { Button } from '@/src/components/ui/Button';
import { ErrorText, FormRow, Input, Label, Textarea } from '@/src/components/ui/Field';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { Select } from '@/src/components/ui/Field';
import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings, useWhatsapp } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { computeQuote } from '@/src/lib/pricing';
import { visiblePromotions } from '@/src/lib/pricing/promotions';
import { MAX_UPLOAD_BYTES, compressImage } from '@/src/lib/image';
import { cn } from '@/src/lib/cn';
import { formatFcfa, isValidSenegalPhone, normalizePhone, prettyPhone } from '@/src/lib/format';
import { Link, useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import { buildSheinMessage } from '@/src/lib/whatsapp';
import { openWhatsapp } from '@/src/lib/whatsappHandoff';
import { db } from '@/src/services';
import type { SheinItem } from '@/src/types';

const emptyItem = (currency: string): SheinItem => ({
  productUrl: '',
  reference: '',
  size: '',
  color: '',
  quantity: 1,
  displayedPrice: '',
  priceAmount: null,
  priceCurrency: currency,
});

const CURRENCY_LABELS: Record<string, string> = {
  XOF: 'FCFA',
  EUR: '€',
  USD: '$',
};

/** Texte lisible du prix, réutilisé dans le message WhatsApp. */
function priceLabel(amount: number | null, currency: string): string {
  if (amount === null) return '';
  const symbol = CURRENCY_LABELS[currency] ?? currency;
  return `${amount.toLocaleString('fr-FR')} ${symbol}`;
}

export function SheinRequestPage() {
  const { navigate } = useRouter();
  const { notify } = useToast();
  const { settings } = useSettings();
  const whatsapp = useWhatsapp();
  const { active, displayed } = useGroupings();

  const pricing = settings?.pricing;
  const currencies = useMemo(() => Object.keys(pricing?.conversionRates ?? { XOF: 1 }), [pricing]);
  const defaultCurrency = pricing?.defaultCurrency ?? 'XOF';

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [deliveryOptionId, setDeliveryOptionId] = useState('');
  const [isStudent, setIsStudent] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [items, setItems] = useState<SheinItem[]>([emptyItem('XOF')]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /* Dernière relecture : voir components/order/ConfirmerEnvoi. */
  const [relecture, setRelecture] = useState(false);

  useSeo({
    title: 'Transmettre mon panier SHEIN',
    description: 'Envoyez-nous vos articles SHEIN : lien, taille, couleur, quantité et prix affiché.',
  });

  // Les réglages arrivent de façon asynchrone : on aligne devise et livraison dessus.
  useEffect(() => {
    if (!pricing) return;
    setDeliveryOptionId((current) => current || pricing.deliveryOptions[0]?.id || '');
    setItems((prev) =>
      prev.map((item) =>
        item.priceAmount === null && item.priceCurrency === 'XOF'
          ? { ...item, priceCurrency: pricing.defaultCurrency }
          : item,
      ),
    );
  }, [pricing]);

  /**
   * Offres en cours sur les demandes SHEIN. Sert à décider ce qu'on affiche —
   * l'encadré de l'offre, la question « êtes-vous étudiante ? » — jamais à
   * calculer un montant : le devis définitif est refait côté données.
   */
  const offers = useMemo(
    () => visiblePromotions(settings?.promotions ?? [], 'shein'),
    [settings?.promotions],
  );
  const asksStudent = offers.some((offer) => offer.studentOnly);

  /** Estimation affichée en direct. Elle est recalculée côté données à l'envoi. */
  const promoContext = useMemo(
    () => ({
      kind: 'shein' as const,
      isStudent,
      // Le groupage n'est attribué qu'à l'enregistrement : ici on ne restreint
      // pas, l'estimation reste une estimation.
      groupingId: null,
      deliveryOptionId,
    }),
    [isStudent, deliveryOptionId],
  );

  const quote = useMemo(
    () =>
      pricing
        ? computeQuote(items, deliveryOptionId, pricing, settings?.promotions ?? [], {
            ...promoContext,
            code: promoCode,
          })
        : null,
    [items, deliveryOptionId, pricing, settings?.promotions, promoContext, promoCode],
  );

  const updateItem = (index: number, patch: Partial<SheinItem>) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
    setErrors((prev) => ({ ...prev, [`item-${index}`]: '' }));
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem(defaultCurrency)]);

  const removeItem = (index: number) =>
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));

  const handleScreenshot = async (index: number, file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      notify('Image trop lourde (8 Mo maximum).', 'error');
      return;
    }
    try {
      const data = await compressImage(file);
      updateItem(index, { screenshotName: file.name, screenshotData: data });
    } catch {
      notify("Cette image n'a pas pu être lue.", 'error');
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!customerName.trim()) next.customerName = 'Indiquez votre nom.';
    if (!phone.trim()) next.phone = 'Le numéro WhatsApp est indispensable pour vous répondre.';
    else if (!isValidSenegalPhone(phone)) next.phone = 'Numéro invalide. Exemple : 77 123 45 67';

    const hasOne = items.some((item) => item.productUrl.trim() || item.reference.trim());
    if (!hasOne) next['item-0'] = 'Ajoutez au moins un lien ou une référence.';

    items.forEach((item, index) => {
      const filled = item.productUrl.trim() || item.reference.trim();
      if (!filled && items.length > 1) return;
      if (item.productUrl.trim() && !/^https?:\/\//i.test(item.productUrl.trim())) {
        next[`item-${index}`] = 'Le lien doit commencer par https://';
      }
    });

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) {
      notify('Vérifiez les champs signalés.', 'error');
      return;
    }
    setSubmitError(null);
    setRelecture(true);
  };

  const envoyer = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const request = await db.createSheinRequest({
        customerName,
        phone,
        note,
        deliveryOptionId,
        isStudent,
        promoCode,
        items: items.filter((item) => item.productUrl.trim() || item.reference.trim()),
      });

      const mine = readJson<Array<{ requestNumber: string; phone: string }>>(STORAGE_KEYS.myShein, []);
      writeJson(STORAGE_KEYS.myShein, [
        { requestNumber: request.requestNumber, phone: normalizePhone(phone) },
        ...mine.filter((m) => m.requestNumber !== request.requestNumber),
      ]);

      setRelecture(false);
      navigate(`/shein/confirmation/${request.requestNumber}`);
      // WhatsApp part avec la demande en main : c'est ce message qui
      // prévient la boutique qu'une demande vient d'arriver.
      openWhatsapp(whatsapp.url(buildSheinMessage(request)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Envoi impossible pour le moment.';
      setSubmitError(message);
      notify(message, 'error');
      setSubmitting(false);
      setRelecture(false);
    }
  };

  const retenus = items.filter((item) => item.productUrl.trim() || item.reference.trim());
  const nbArticles = retenus.reduce((n, i) => n + Math.max(1, i.quantity), 0);
  const optionLivraison = (pricing?.deliveryOptions ?? []).find((o) => o.id === deliveryOptionId);
  const recapitulatif: LigneRecap[] = [
    { label: 'Nom', value: customerName.trim() || '—' },
    { label: 'Téléphone', value: prettyPhone(phone) || '—', cle: true },
    { label: 'Livraison', value: optionLivraison?.label ?? '—' },
    { label: 'Articles', value: `${nbArticles} article${nbArticles > 1 ? 's' : ''}` },
    {
      label: 'Estimation',
      value:
        quote && quote.total !== null
          ? `${formatFcfa(quote.total)} — à confirmer`
          : 'confirmée avant paiement',
    },
  ];

  return (
    <form onSubmit={submit} className="container-page py-8">
      {/*
        Sur téléphone, une seule colonne étroite : c'est le bon format pour
        remplir un formulaire au pouce. Sur ordinateur, le devis passe à droite
        et reste visible pendant la saisie — sinon il se trouve à deux mille
        pixels plus bas, et la cliente remplit sans jamais voir ce qu'elle paie.
      */}
      <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
        <p className="eyebrow">Commande SHEIN</p>
        <h1 className="mt-3 text-[32px] sm:text-[42px]">Transmettre mon panier</h1>
        <p className="mt-3 max-w-xl text-[15px] text-graphite">
          Un article = un bloc. Le lien suffit dans la plupart des cas ; le reste nous aide à commander
          exactement ce que vous voulez.
        </p>

        <div className="mt-6 space-y-3">
          <PromotionNotice kind="shein" />

          <GroupingCapacity grouping={displayed} settings={settings} compact />

          {!active && displayed && (
            <p className="mt-2.5 text-[12.5px] leading-relaxed text-stone">
              Ce départ est complet : votre demande sera rattachée au groupage suivant dès son
              ouverture. Vous ne payez rien avant d'avoir reçu et validé votre montant.
            </p>
          )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-14">
          <div>
            <section className="mt-10">
              <h2 className="text-[22px]">Vos coordonnées</h2>
              <div className="mt-5 grid gap-x-4 sm:grid-cols-2">
                <FormRow>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      setErrors((prev) => ({ ...prev, customerName: '' }));
                    }}
                    error={errors.customerName}
                    autoComplete="name"
                  />
                  <ErrorText>{errors.customerName}</ErrorText>
                </FormRow>
                <FormRow>
                  <Label htmlFor="phone">Numéro WhatsApp</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="77 123 45 67"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setErrors((prev) => ({ ...prev, phone: '' }));
                    }}
                    error={errors.phone}
                    autoComplete="tel"
                  />
                  <ErrorText>{errors.phone}</ErrorText>
                </FormRow>
              </div>
            </section>

            <section className="mt-8">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-[22px]">Vos articles</h2>
                <span className="text-[13px] text-stone">
                  {items.length} article{items.length > 1 ? 's' : ''}
                </span>
              </div>

              <ul className="mt-5 space-y-4">
                {items.map((item, index) => (
                  <li key={index} className="rounded-[--radius-lg] border border-line bg-white p-5">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-[19px]">Article {index + 1}</p>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="press inline-flex items-center gap-1.5 text-[12.5px] text-stone hover:text-[#8a2f2f]"
                        >
                          <Trash2 className="size-3.5" /> Retirer
                        </button>
                      )}
                    </div>

                    <div className="mt-4">
                      <FormRow>
                        <Label htmlFor={`url-${index}`}>Lien du produit SHEIN</Label>
                        <Input
                          id={`url-${index}`}
                          type="url"
                          inputMode="url"
                          placeholder="https://…"
                          value={item.productUrl}
                          onChange={(e) => updateItem(index, { productUrl: e.target.value })}
                          error={errors[`item-${index}`]}
                        />
                        <ErrorText>{errors[`item-${index}`]}</ErrorText>
                      </FormRow>

                      <div className="grid gap-x-4 sm:grid-cols-2">
                        <FormRow>
                          <Label htmlFor={`ref-${index}`} hint="(si vous l'avez)">
                            Référence / nom
                          </Label>
                          <Input
                            id={`ref-${index}`}
                            value={item.reference}
                            onChange={(e) => updateItem(index, { reference: e.target.value })}
                            placeholder="Ex : sw2309… ou « robe satin noire »"
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor={`price-${index}`} hint="tel qu'affiché">
                            Prix sur SHEIN
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              id={`price-${index}`}
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="0.01"
                              className="flex-1"
                              value={item.priceAmount ?? ''}
                              onChange={(e) => {
                                const amount = e.target.value === '' ? null : Number(e.target.value);
                                updateItem(index, {
                                  priceAmount: amount,
                                  displayedPrice: priceLabel(amount, item.priceCurrency),
                                });
                              }}
                              placeholder="12,99"
                            />
                            {/* Le champ occupe toute la largeur de son conteneur :
                                c'est le conteneur qui porte la largeur, sinon les
                                classes se neutralisent et la liste déborde. */}
                            <div className="w-24 shrink-0">
                              <Select
                                aria-label="Devise"
                                value={item.priceCurrency}
                                onChange={(e) => {
                                  const currency = e.target.value;
                                  updateItem(index, {
                                    priceCurrency: currency,
                                    displayedPrice: priceLabel(item.priceAmount, currency),
                                  });
                                }}
                              >
                                {currencies.map((code) => (
                                  <option key={code} value={code}>
                                    {CURRENCY_LABELS[code] ?? code}
                                  </option>
                                ))}
                              </Select>
                            </div>
                          </div>
                        </FormRow>
                        <FormRow>
                          <Label htmlFor={`size-${index}`}>Taille</Label>
                          <Input
                            id={`size-${index}`}
                            value={item.size}
                            onChange={(e) => updateItem(index, { size: e.target.value })}
                            placeholder="M, 38, XL…"
                          />
                        </FormRow>
                        <FormRow>
                          <Label htmlFor={`color-${index}`}>Couleur</Label>
                          <Input
                            id={`color-${index}`}
                            value={item.color}
                            onChange={(e) => updateItem(index, { color: e.target.value })}
                            placeholder="Noir, beige…"
                          />
                        </FormRow>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <p className="mb-2 text-[13px] font-medium text-graphite">Quantité</p>
                          <QuantityStepper
                            value={item.quantity}
                            onChange={(quantity) => updateItem(index, { quantity })}
                            size="sm"
                          />
                        </div>

                        <div>
                          {item.screenshotData ? (
                            <div className="flex items-center gap-3">
                              <img
                                src={item.screenshotData}
                                alt=""
                                className="size-14 rounded-[--radius-xs] object-cover"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateItem(index, { screenshotData: undefined, screenshotName: undefined })
                                }
                                className="press inline-flex items-center gap-1.5 text-[12.5px] text-stone"
                              >
                                <X className="size-3.5" /> Retirer la capture
                              </button>
                            </div>
                          ) : (
                            <label className="press inline-flex cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[13px]">
                              <ImagePlus className="size-4" />
                              Ajouter une capture
                              <input
                                type="file"
                                accept="image/*"
                                className="sr-only"
                                onChange={(e) => void handleScreenshot(index, e.target.files?.[0])}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={addItem}
                className="press mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[--radius-md] border border-dashed border-line bg-white/60 py-4 text-[14px] font-medium"
              >
                <Plus className="size-4" /> Ajouter un article
              </button>
            </section>

            <section className="mt-10">
              <h2 className="text-[22px]">Livraison</h2>
              <p className="mt-1.5 text-[13.5px] text-stone">
                Comment souhaitez-vous récupérer votre commande une fois le groupage arrivé ?
              </p>
              <div className="mt-4 space-y-3">
                {(pricing?.deliveryOptions ?? []).map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      'press flex cursor-pointer items-start gap-3 rounded-[--radius-md] border bg-white p-4 transition-colors',
                      deliveryOptionId === option.id ? 'border-ink' : 'border-line',
                    )}
                  >
                    <input
                      type="radio"
                      name="shein-delivery"
                      value={option.id}
                      checked={deliveryOptionId === option.id}
                      onChange={() => setDeliveryOptionId(option.id)}
                      className="mt-1 accent-[#8e2961]"
                    />
                    <span className="flex-1">
                      <span className="flex items-baseline justify-between gap-3">
                        <span className="text-[15px] font-medium">{option.label}</span>
                        <span className="shrink-0 text-[13.5px] tabular-nums text-graphite">
                          {option.fee === null
                            ? 'Tarif communiqué après validation'
                            : option.fee === 0
                              ? 'Gratuit'
                              : formatFcfa(option.fee)}
                        </span>
                      </span>
                      {option.hint && <span className="mt-1 block text-[12.5px] text-stone">{option.hint}</span>}
                    </span>
                  </label>
                ))}
              </div>

              {asksStudent && (
                <div className="mt-4 rounded-[--radius-md] border border-line bg-cream/60 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      className="mt-1 size-4 accent-[#8e2961]"
                    />
                    <span className="text-[13.5px] leading-relaxed text-graphite">
                      <span className="font-medium">Je suis étudiante</span>
                      <span className="mt-1 block text-[12.5px] text-stone">
                        Une offre en cours est réservée aux étudiantes. Nous vous demanderons
                        simplement votre carte d'étudiante sur WhatsApp avant de l'appliquer.
                      </span>
                    </span>
                  </label>
                </div>
              )}

              <div className="mt-4">
                <PromoCodeField value={promoCode} onChange={setPromoCode} context={promoContext} />
              </div>
            </section>

            <section className="mt-8">
              <FormRow>
                <Label htmlFor="note" hint="(facultatif)">
                  Un mot pour nous
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ex : si le noir n'est pas disponible, prenez le beige."
                />
              </FormRow>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:mt-10 lg:self-start">
            {quote && quote.itemCount > 0 && (
              <>
                <h2 className="text-[22px]">Ce que vous allez payer</h2>
                <div className="mt-4">
                  <QuoteSummary quote={quote} />
                </div>
              </>
            )}

            {submitError && (
              <p className="mt-4 flex gap-2 rounded-[--radius-sm] bg-[#f6e9e9] px-4 py-3 text-[13px] text-[#8a2f2f]">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                {submitError}
              </p>
            )}

            <div className="mt-6">
              <RappelMesures contexte="shein" />
            </div>

            <div className="mt-4">
              <Button type="submit" size="lg" full loading={submitting}>
                Envoyer ma demande
              </Button>
              <p className="mt-3 text-center text-[12.5px] leading-relaxed text-stone">
                Un doute sur une taille ?{' '}
                <Link to="/guide-des-tailles" className="underline underline-offset-2">
                  Guide des tailles
                </Link>
              </p>
              <p className="mt-2 text-center text-[12.5px] leading-relaxed text-stone">
                Vous recevez un numéro de demande
                {whatsapp.prefill ? ", puis WhatsApp s'ouvre avec le message déjà écrit" : ''}.
                Aucun paiement n'est demandé à cette étape.
              </p>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmerEnvoi
        open={relecture}
        onClose={() => setRelecture(false)}
        onConfirm={() => void envoyer()}
        busy={submitting}
        lignes={recapitulatif}
        action="Oui, envoyer ma demande"
        rappel="Vérifiez les tailles saisies : elles varient beaucoup d'un article SHEIN à l'autre, et un article commandé ne s'échange pas. Le guide des mesures est sur la page, au-dessus du bouton d'envoi."
      />
    </form>
  );
}
