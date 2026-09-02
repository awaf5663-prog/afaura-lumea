import { Info, Plus, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { QuoteSummary } from '@/src/components/shein/QuoteSummary';
import { Button } from '@/src/components/ui/Button';
import { FormRow, Input, Label, Select } from '@/src/components/ui/Field';
import { PromotionEditor } from '@/src/components/admin/PromotionEditor';
import { useSettings } from '@/src/hooks/useSettings';
import { useSettingsDraft } from '@/src/hooks/useSettingsDraft';
import { DraftStatus } from '@/src/components/admin/DraftStatus';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { uid } from '@/src/lib/orderNumber';
import { SERVICE_FEE_STRATEGIES, computeQuoteFromInput, describeStrategy } from '@/src/lib/pricing';
import type { Grouping, PricingConfig } from '@/src/types';

/**
 * PARAMÈTRES → TARIFICATION
 * Tout ce qui chiffre une demande SHEIN se règle ici. Aucun montant n'est
 * écrit dans un composant : les pages lisent cette configuration.
 */
export function AdminPricing({ groupings = [] }: { groupings?: Grouping[] }) {
  const { settings } = useSettings();
  const { notify } = useToast();
  // La saisie survit à un échec d'enregistrement, à un changement d'onglet et
  // même à la fermeture du navigateur. Voir useSettingsDraft.
  const { draft, setDraft, restored, saving, error, commit, discard } =
    useSettingsDraft('lumea.admin.draft.tarification');

  // Simulateur
  const [simItems, setSimItems] = useState(4);
  const [simValue, setSimValue] = useState<number | null>(12000);
  const [simDelivery, setSimDelivery] = useState('');

  useEffect(() => {
    setSimDelivery((current) => current || settings?.pricing?.deliveryOptions?.[0]?.id || '');
  }, [settings]);

  const pricing = draft?.pricing;

  // L'aperçu utilise le brouillon : on teste AVANT de publier les tarifs.
  const preview = useMemo(
    () =>
      pricing
        ? computeQuoteFromInput(
            { itemCount: simItems, declaredValue: simValue, deliveryOptionId: simDelivery },
            pricing,
          )
        : null,
    [pricing, simItems, simValue, simDelivery],
  );

  if (!draft || !pricing) return null;

  const setPricing = (patch: Partial<PricingConfig>) =>
    setDraft({ ...draft, pricing: { ...pricing, ...patch } });


  const enregistrer = async () => {
    const invalid = pricing.tiers.find((t) => t.maxItems !== null && t.maxItems < t.minItems);
    if (invalid) {
      notify('Une tranche a un maximum inférieur à son minimum.', 'error');
      return;
    }
    if (await commit()) notify('Tarification enregistrée');
    // En cas d'échec, le détail s'affiche dans <DraftStatus> et la saisie reste.
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    void enregistrer();
  };

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="min-w-0">
        <h2 className="text-[24px]">Tarification</h2>
        <p className="mt-1.5 text-[13px] text-stone">
          Ces montants sont des frais de service, distincts du prix des articles.
        </p>

        <DraftStatus
          restored={restored}
          error={error}
          saving={saving}
          onDiscard={discard}
          onRetry={() => void enregistrer()}
        />

        {/* ── Stratégie ─────────────────────────────────────── */}
        <section className="mt-6 rounded-[--radius-lg] border border-line bg-white p-5">
          <h3 className="text-[18px]">Mode de calcul des frais de traitement</h3>
          <FormRow className="mt-4">
            <Label htmlFor="strategy">Stratégie active</Label>
            <Select
              id="strategy"
              value={pricing.strategy}
              onChange={(e) => setPricing({ strategy: e.target.value as PricingConfig['strategy'] })}
            >
              {SERVICE_FEE_STRATEGIES.map((strategy) => (
                <option key={strategy.id} value={strategy.id}>
                  {strategy.label}
                </option>
              ))}
            </Select>
            <p className="mt-1.5 text-[12px] text-stone">{describeStrategy(pricing)}</p>
          </FormRow>

          <p className="flex gap-2 rounded-[--radius-sm] bg-cream/70 px-3.5 py-3 text-[12px] leading-relaxed text-graphite">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Le nombre d'articles ne mesure pas le poids réel : une paire de chaussures pèse plus que
            dix accessoires. D'autres modes de calcul (poids, volume, catégorie) se branchent dans
            <code className="mx-1 break-all rounded bg-white px-1">src/lib/pricing/strategies</code> et
            apparaîtront dans cette liste sans autre modification.
          </p>
        </section>

        {/* ── Tranches ──────────────────────────────────────── */}
        {/*
          Cette grille sert AUSSI aux commandes de la boutique : elle reste
          donc affichée même quand SHEIN utilise un autre mode de calcul. Un
          montant facturé ne doit jamais se régler dans un écran caché.
        */}
        <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-[18px]">Tranches par nombre d'articles</h3>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() =>
                  setPricing({
                    tiers: [
                      ...pricing.tiers,
                      { id: uid(), minItems: 1, maxItems: null, fee: null },
                    ],
                  })
                }
              >
                <Plus className="size-4" /> Tranche
              </Button>
            </div>

            <ul className="mt-4 space-y-3">
              {pricing.tiers.map((tier, index) => (
                <li
                  key={tier.id}
                  className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_1.2fr_auto]"
                >
                  <label className="text-[11.5px] text-stone">
                    De
                    <Input
                      type="number"
                      min={1}
                      className="mt-1"
                      value={tier.minItems}
                      onChange={(e) =>
                        setPricing({
                          tiers: pricing.tiers.map((t, i) =>
                            i === index ? { ...t, minItems: Number(e.target.value) } : t,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="text-[11.5px] text-stone">
                    À <span className="text-[10px]">(vide = ∞)</span>
                    <Input
                      type="number"
                      min={1}
                      className="mt-1"
                      value={tier.maxItems ?? ''}
                      onChange={(e) =>
                        setPricing({
                          tiers: pricing.tiers.map((t, i) =>
                            i === index
                              ? { ...t, maxItems: e.target.value === '' ? null : Number(e.target.value) }
                              : t,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="text-[11.5px] text-stone">
                    Frais <span className="text-[10px]">(vide = devis)</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      className="mt-1"
                      placeholder="Devis manuel"
                      value={tier.fee ?? ''}
                      onChange={(e) =>
                        setPricing({
                          tiers: pricing.tiers.map((t, i) =>
                            i === index
                              ? { ...t, fee: e.target.value === '' ? null : Number(e.target.value) }
                              : t,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    type="button"
                    aria-label="Supprimer la tranche"
                    onClick={() =>
                      setPricing({ tiers: pricing.tiers.filter((_, i) => i !== index) })
                    }
                    className="press mb-1 col-span-2 grid size-10 justify-self-end place-items-center rounded-full bg-cream text-[#8a2f2f] sm:col-span-1"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              ))}
            </ul>

            <p className="mt-4 flex gap-2 rounded-[--radius-sm] bg-cream/70 px-3.5 py-3 text-[12px] leading-relaxed text-graphite">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              Une seule grille pour les deux services : elle chiffre les demandes SHEIN et les
              commandes de la boutique. Les articles se comptent en unités, pas en lignes — douze
              cahiers font douze articles. Une tranche laissée à « devis manuel » ne facture rien
              sur une commande de la boutique, qui part sans passage par un devis.
            </p>
          </section>

        {pricing.strategy === 'value_percent' && (
          <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
            <h3 className="text-[18px]">Pourcentage de la valeur</h3>
            <div className="mt-4 grid gap-x-4 sm:grid-cols-3">
              <FormRow>
                <Label htmlFor="vp-percent">Pourcentage</Label>
                <Input
                  id="vp-percent"
                  type="number"
                  min={0}
                  step="any"
                  value={pricing.valuePercent.percent}
                  onChange={(e) =>
                    setPricing({
                      valuePercent: { ...pricing.valuePercent, percent: Number(e.target.value) },
                    })
                  }
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="vp-min">Frais minimum</Label>
                <Input
                  id="vp-min"
                  type="number"
                  min={0}
                  step={1}
                  value={pricing.valuePercent.minFee}
                  onChange={(e) =>
                    setPricing({
                      valuePercent: { ...pricing.valuePercent, minFee: Number(e.target.value) },
                    })
                  }
                />
              </FormRow>
              <FormRow>
                <Label htmlFor="vp-max" hint="(vide = aucun)">
                  Plafond
                </Label>
                <Input
                  id="vp-max"
                  type="number"
                  min={0}
                  step={1}
                  value={pricing.valuePercent.maxFee ?? ''}
                  onChange={(e) =>
                    setPricing({
                      valuePercent: {
                        ...pricing.valuePercent,
                        maxFee: e.target.value === '' ? null : Number(e.target.value),
                      },
                    })
                  }
                />
              </FormRow>
            </div>
          </section>
        )}

        {/* ── Livraison ─────────────────────────────────────── */}
        <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-[18px]">Livraison</h3>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                setPricing({
                  deliveryOptions: [
                    ...pricing.deliveryOptions,
                    { id: uid(), label: 'Nouvelle option', fee: null, type: 'delivery' },
                  ],
                })
              }
            >
              <Plus className="size-4" /> Option
            </Button>
          </div>
          <p className="mt-1.5 text-[12px] text-stone">
            Laissez le tarif vide pour afficher « Tarif communiqué après validation de la commande ».
          </p>

          <ul className="mt-4 space-y-3">
            {pricing.deliveryOptions.map((option, index) => (
              <li
                key={option.id}
                className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1.6fr_1fr_auto]"
              >
                <label className="text-[11.5px] text-stone">
                  Intitulé
                  <Input
                    className="mt-1"
                    value={option.label}
                    onChange={(e) =>
                      setPricing({
                        deliveryOptions: pricing.deliveryOptions.map((o, i) =>
                          i === index ? { ...o, label: e.target.value } : o,
                        ),
                      })
                    }
                  />
                </label>
                <label className="text-[11.5px] text-stone">
                  Tarif <span className="text-[10px]">(vide = à confirmer)</span>
                  <Input
                    className="mt-1"
                    type="number"
                    min={0}
                    step={1}
                    placeholder="À confirmer"
                    value={option.fee ?? ''}
                    onChange={(e) =>
                      setPricing({
                        deliveryOptions: pricing.deliveryOptions.map((o, i) =>
                          i === index
                            ? { ...o, fee: e.target.value === '' ? null : Number(e.target.value) }
                            : o,
                        ),
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  aria-label="Supprimer l'option"
                  onClick={() =>
                    setPricing({
                      deliveryOptions: pricing.deliveryOptions.filter((_, i) => i !== index),
                    })
                  }
                  className="press mb-1 col-span-2 grid size-10 justify-self-end place-items-center rounded-full bg-cream text-[#8a2f2f] sm:col-span-1"
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Devises ───────────────────────────────────────── */}
        <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
          <h3 className="text-[18px]">Conversion vers le FCFA</h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
            L'euro a une parité fixe (1 € = 655,957 FCFA). Les autres devises flottent : tant que le
            taux est vide, le site affiche « à confirmer » au lieu d'un montant approximatif.
          </p>
          <div className="mt-4 grid gap-x-4 sm:grid-cols-3">
            {Object.entries(pricing.conversionRates).map(([code, rate]) => (
              <FormRow key={code}>
                <Label htmlFor={`rate-${code}`}>1 {code} =</Label>
                <Input
                  id={`rate-${code}`}
                  type="number"
                  min={0}
                  step="any"
                  placeholder="Non configuré"
                  disabled={code === 'XOF'}
                  value={rate ?? ''}
                  onChange={(e) =>
                    setPricing({
                      conversionRates: {
                        ...pricing.conversionRates,
                        [code]: e.target.value === '' ? null : Number(e.target.value),
                      },
                    })
                  }
                />
              </FormRow>
            ))}
          </div>
          <FormRow className="mb-0 max-w-xs">
            <Label htmlFor="default-currency">Devise proposée par défaut</Label>
            <Select
              id="default-currency"
              value={pricing.defaultCurrency}
              onChange={(e) => setPricing({ defaultCurrency: e.target.value })}
            >
              {Object.keys(pricing.conversionRates).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </Select>
          </FormRow>
        </section>

        {/* ── Seuils d'alerte ───────────────────────────────── */}
        <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
          <h3 className="text-[18px]">Seuils d'alerte des groupages</h3>
          <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="th-warning">« Commence à se remplir » (%)</Label>
              <Input
                id="th-warning"
                type="number"
                min={1}
                max={100}
                value={draft.alertThresholds.warning}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    alertThresholds: { ...draft.alertThresholds, warning: Number(e.target.value) },
                  })
                }
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="th-almost">« Presque complet » (%)</Label>
              <Input
                id="th-almost"
                type="number"
                min={1}
                max={100}
                value={draft.alertThresholds.almostFull}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    alertThresholds: { ...draft.alertThresholds, almostFull: Number(e.target.value) },
                  })
                }
              />
            </FormRow>
          </div>
        </section>

        {/* ── Offres ────────────────────────────────────────── */}
        <section className="mt-5 rounded-[--radius-lg] border border-line bg-white p-5">
          <h3 className="text-[18px]">Offres</h3>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-stone">
            Les conditions se cumulent : une offre s'applique quand toutes celles que vous
            renseignez sont remplies. Ce qui reste vide ne restreint rien.
          </p>
          <div className="mt-4">
            <PromotionEditor
              promotions={draft.promotions}
              deliveryOptions={pricing.deliveryOptions}
              groupings={groupings}
              onChange={(promotions) => setDraft({ ...draft, promotions })}
            />
          </div>
        </section>

        <Button type="submit" size="lg" className="mt-6" loading={saving}>
          Enregistrer les modifications
        </Button>
      </div>

      {/* ── Aperçu du calcul ────────────────────────────────── */}
      <aside className="min-w-0 lg:sticky lg:top-6">
        <div className="rounded-[--radius-lg] border border-line bg-cream/50 p-5">
          <h3 className="text-[18px]">Aperçu du calcul</h3>
          <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
            Testez une commande avec les valeurs ci-contre <strong>avant</strong> de les enregistrer.
          </p>

          <div className="mt-4 grid gap-x-3 sm:grid-cols-2">
            <FormRow>
              <Label htmlFor="sim-items">Nombre d'articles</Label>
              <Input
                id="sim-items"
                type="number"
                min={1}
                value={simItems}
                onChange={(e) => setSimItems(Math.max(1, Number(e.target.value)))}
              />
            </FormRow>
            <FormRow>
              <Label htmlFor="sim-value" hint="(FCFA)">
                Valeur articles
              </Label>
              <Input
                id="sim-value"
                type="number"
                min={0}
                step={1}
                placeholder="Inconnue"
                value={simValue ?? ''}
                onChange={(e) => setSimValue(e.target.value === '' ? null : Number(e.target.value))}
              />
            </FormRow>
          </div>
          <FormRow>
            <Label htmlFor="sim-delivery">Livraison</Label>
            <Select
              id="sim-delivery"
              value={simDelivery}
              onChange={(e) => setSimDelivery(e.target.value)}
            >
              {pricing.deliveryOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormRow>

          {preview && (
            <div className="mt-2">
              <QuoteSummary quote={preview} title="Ce que verrait la cliente" />
              <p className="mt-3 text-[12px] text-stone">
                Frais de traitement encaissés sur cette commande :{' '}
                <span className="font-medium text-ink">
                  {preview.serviceFee === null ? 'devis manuel' : formatFcfa(preview.serviceFee)}
                </span>
              </p>
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
