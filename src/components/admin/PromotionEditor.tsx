import { Plus, Trash2 } from 'lucide-react';
import { ErrorText, FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { describeEffect } from '@/src/lib/pricing/promotions';
import { cn } from '@/src/lib/cn';
import type { Grouping, Promotion, SheinDeliveryOption } from '@/src/types';

/**
 * Éditeur des offres.
 *
 * Chaque condition est facultative : laissée vide, elle ne restreint rien.
 * C'est écrit à côté de chaque champ, parce que « aucun groupage coché » se
 * lit spontanément comme « aucun groupage » alors que ça veut dire « tous ».
 *
 * Les conditions sont revérifiées au moment d'enregistrer la commande, côté
 * données : ce formulaire décide de la règle, pas du montant.
 */
export function PromotionEditor({
  promotions,
  deliveryOptions,
  groupings,
  onChange,
}: {
  promotions: Promotion[];
  deliveryOptions: SheinDeliveryOption[];
  groupings: Grouping[];
  onChange: (next: Promotion[]) => void;
}) {
  const patch = (index: number, changes: Partial<Promotion>) =>
    onChange(promotions.map((promotion, i) => (i === index ? { ...promotion, ...changes } : promotion)));

  const toggleIn = (list: string[], id: string) =>
    list.includes(id) ? list.filter((x) => x !== id) : [...list, id];

  const add = () =>
    onChange([
      ...promotions,
      {
        id: `promo-${Date.now().toString(36)}`,
        label: 'Nouvelle offre',
        description: '',
        active: false,
        scope: 'shein',
        code: '',
        studentOnly: false,
        startsAt: null,
        endsAt: null,
        groupingIds: [],
        deliveryOptionIds: [],
        effect: { type: 'free_delivery' },
      },
    ]);

  return (
    <div className="space-y-4">
      {promotions.length === 0 && (
        <p className="text-[13px] text-stone">
          Aucune offre. Les clientes voient les tarifs normaux.
        </p>
      )}

      {promotions.map((promotion, index) => {
        const invalidPeriod =
          promotion.startsAt && promotion.endsAt && promotion.startsAt > promotion.endsAt;
        return (
          <fieldset
            key={promotion.id}
            className={cn(
              'rounded-[--radius-md] border p-4',
              promotion.active ? 'border-mauve/40 bg-blush/25' : 'border-line bg-white',
            )}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13.5px]">
                <input
                  type="checkbox"
                  checked={promotion.active}
                  onChange={(e) => patch(index, { active: e.target.checked })}
                  className="size-4 accent-[#8f4b5b]"
                />
                <span className="font-medium">
                  {promotion.active ? 'Offre en cours' : 'Offre désactivée'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onChange(promotions.filter((_, i) => i !== index))}
                className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-[12px] text-stone"
              >
                <Trash2 className="size-3.5" /> Supprimer
              </button>
            </div>

            <div className="mt-4 grid gap-x-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor={`p-label-${index}`}>Nom affiché</Label>
                <Input
                  id={`p-label-${index}`}
                  value={promotion.label}
                  onChange={(e) => patch(index, { label: e.target.value })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor={`p-scope-${index}`}>S'applique à</Label>
                <Select
                  id={`p-scope-${index}`}
                  value={promotion.scope}
                  onChange={(e) => patch(index, { scope: e.target.value as Promotion['scope'] })}
                >
                  <option value="shein">Commandes SHEIN</option>
                  <option value="store">Commandes de la boutique</option>
                  <option value="all">Les deux</option>
                </Select>
              </FormRow>
            </div>

            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor={`p-code-${index}`} hint="vide = offre automatique">
                  Code promo
                </Label>
                <Input
                  id={`p-code-${index}`}
                  value={promotion.code}
                  placeholder="Ex. RENTREE"
                  autoCapitalize="characters"
                  spellCheck={false}
                  onChange={(e) => patch(index, { code: e.target.value.toUpperCase() })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor={`p-effect-${index}`}>Ce que l'offre change</Label>
                <Select
                  id={`p-effect-${index}`}
                  value={promotion.effect.type}
                  onChange={(e) => {
                    const type = e.target.value as Promotion['effect']['type'];
                    patch(index, {
                      effect:
                        type === 'discount_amount'
                          ? { type, amount: 1000 }
                          : { type },
                    });
                  }}
                >
                  <option value="free_delivery">Livraison offerte</option>
                  <option value="free_service_fee">Frais de traitement offerts</option>
                  <option value="discount_amount">Remise en FCFA</option>
                </Select>
              </FormRow>
            </div>

            {promotion.effect.type === 'discount_amount' && (
              <FormRow>
                <Label htmlFor={`p-amount-${index}`}>Montant de la remise (FCFA)</Label>
                <Input
                  id={`p-amount-${index}`}
                  type="number"
                  min={0}
                  step={500}
                  value={promotion.effect.amount}
                  onChange={(e) =>
                    patch(index, {
                      effect: { type: 'discount_amount', amount: Math.max(0, Number(e.target.value)) },
                    })
                  }
                />
              </FormRow>
            )}

            <FormRow>
              <Label htmlFor={`p-desc-${index}`} hint="visible par la cliente">
                Description
              </Label>
              <Textarea
                id={`p-desc-${index}`}
                rows={2}
                value={promotion.description}
                onChange={(e) => patch(index, { description: e.target.value })}
              />
            </FormRow>

            <div className="grid gap-x-4 sm:grid-cols-2">
              <FormRow>
                <Label htmlFor={`p-start-${index}`} hint="vide = pas de début">
                  Début
                </Label>
                <Input
                  id={`p-start-${index}`}
                  type="date"
                  value={promotion.startsAt ?? ''}
                  onChange={(e) => patch(index, { startsAt: e.target.value || null })}
                />
              </FormRow>
              <FormRow>
                <Label htmlFor={`p-end-${index}`} hint="vide = sans fin">
                  Fin (incluse)
                </Label>
                <Input
                  id={`p-end-${index}`}
                  type="date"
                  value={promotion.endsAt ?? ''}
                  onChange={(e) => patch(index, { endsAt: e.target.value || null })}
                />
                {invalidPeriod && <ErrorText>La fin est avant le début.</ErrorText>}
              </FormRow>
            </div>

            <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-graphite">
              <input
                type="checkbox"
                checked={promotion.studentOnly}
                onChange={(e) => patch(index, { studentOnly: e.target.checked })}
                className="mt-0.5 size-4 accent-[#8f4b5b]"
              />
              <span>
                Réservée aux étudiantes
                <span className="mt-0.5 block text-[12px] text-stone">
                  Une case « Je suis étudiante » apparaît alors sur le formulaire. C'est une
                  déclaration : demandez la carte sur WhatsApp avant de valider le montant.
                </span>
              </span>
            </label>

            <div className="mt-4">
              <p className="text-[12.5px] font-medium text-graphite">
                Livraisons concernées
                <span className="ml-1.5 font-normal text-stone">(aucune cochée = toutes)</span>
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {deliveryOptions.map((option) => (
                  <Chip
                    key={option.id}
                    active={promotion.deliveryOptionIds.includes(option.id)}
                    onClick={() =>
                      patch(index, {
                        deliveryOptionIds: toggleIn(promotion.deliveryOptionIds, option.id),
                      })
                    }
                  >
                    {option.label}
                  </Chip>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[12.5px] font-medium text-graphite">
                Groupages concernés
                <span className="ml-1.5 font-normal text-stone">(aucun coché = tous)</span>
              </p>
              {groupings.length === 0 ? (
                <p className="mt-2 text-[12px] text-stone">
                  Aucun groupage créé pour l'instant : l'offre s'applique à tous.
                </p>
              ) : (
                <div className="mt-2 flex flex-wrap gap-2">
                  {groupings.map((grouping) => (
                    <Chip
                      key={grouping.id}
                      active={promotion.groupingIds.includes(grouping.id)}
                      onClick={() =>
                        patch(index, { groupingIds: toggleIn(promotion.groupingIds, grouping.id) })
                      }
                    >
                      {grouping.reference}
                    </Chip>
                  ))}
                </div>
              )}
            </div>

            <p className="mt-4 rounded-[--radius-sm] bg-cream/70 px-3.5 py-2.5 text-[12px] leading-relaxed text-graphite">
              Effet : <strong className="font-medium">{describeEffect(promotion.effect)}</strong>
              {promotion.code.trim() === ''
                ? ", appliqué dès que les conditions sont remplies, sans que la cliente ait rien à saisir."
                : ` — la cliente doit saisir « ${promotion.code.trim()} ».`}{' '}
              Une ligne dont le montant n'est pas encore fixé n'est jamais offerte : on ne peut pas
              offrir un montant qu'on ne connaît pas.
              {promotion.effect.type === 'free_service_fee' &&
                ' Les frais de traitement n’existent que sur les commandes SHEIN.'}
            </p>
          </fieldset>
        );
      })}

      <button
        type="button"
        onClick={add}
        className="press inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-4 py-2.5 text-[12.5px] font-medium text-graphite"
      >
        <Plus className="size-3.5" /> Ajouter une offre
      </button>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'press rounded-full border px-3.5 py-2 text-[12.5px] transition-colors',
        active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-graphite',
      )}
    >
      {children}
    </button>
  );
}
