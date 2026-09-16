import { Plus, Trash2 } from 'lucide-react';
import { ErrorText, FormRow, Input, Label, Select, Textarea } from '@/src/components/ui/Field';
import { CATEGORIES } from '@/src/data/seed';
import { describeEffect } from '@/src/lib/pricing/promotions';
import { cn } from '@/src/lib/cn';
import type {
  Grouping,
  Promotion,
  PromotionQuantityTier,
  SheinDeliveryOption,
} from '@/src/types';

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
        minSubtotal: null,
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
                  className="size-4 accent-[#8e2961]"
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
                    patch(index, { effect: effetVierge(type) });
                  }}
                >
                  <option value="free_delivery">Livraison offerte</option>
                  <option value="free_service_fee">Frais de traitement offerts</option>
                  <option value="discount_amount">Remise en FCFA</option>
                  <option value="percent_by_quantity">Remise par quantité (pack)</option>
                </Select>
              </FormRow>
            </div>

            {promotion.effect.type === 'percent_by_quantity' && (
              <PaliersDuPack
                effect={promotion.effect}
                onChange={(effect) => patch(index, { effect })}
                index={index}
              />
            )}

            {promotion.effect.type === 'discount_amount' && (
              <FormRow>
                <Label htmlFor={`p-amount-${index}`}>Montant de la remise (FCFA)</Label>
                <Input
                  id={`p-amount-${index}`}
                  type="number"
                  min={0}
                  step={1}
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

            <FormRow>
              <Label htmlFor={`p-min-${index}`} hint="vide = aucun minimum">
                Montant minimum d'articles (FCFA)
              </Label>
              <Input
                id={`p-min-${index}`}
                type="number"
                inputMode="numeric"
                min={0}
                step={100}
                placeholder="25000"
                value={promotion.minSubtotal ?? ''}
                onChange={(e) =>
                  patch(index, { minSubtotal: e.target.value === '' ? null : Number(e.target.value) })
                }
              />
              <p className="mt-1.5 text-[12px] leading-relaxed text-stone">
                L'offre ne s'applique qu'au-delà de ce montant d'articles — les frais de traitement,
                la livraison et le transport ne comptent pas pour l'atteindre. Une remise sort de
                votre poche : ce seuil vous évite de la donner sur une toute petite commande, et
                pousse à compléter le panier pour l'atteindre.
                {promotion.effect.type === 'discount_amount' &&
                  promotion.minSubtotal !== null &&
                  promotion.minSubtotal > 0 &&
                  ` Ici : remise de ${promotion.effect.amount.toLocaleString('fr-FR')} FCFA à partir de ${promotion.minSubtotal.toLocaleString('fr-FR')} FCFA d'articles.`}
              </p>
            </FormRow>

            <label className="flex cursor-pointer items-start gap-2.5 text-[13px] text-graphite">
              <input
                type="checkbox"
                checked={promotion.studentOnly}
                onChange={(e) => patch(index, { studentOnly: e.target.checked })}
                className="mt-0.5 size-4 accent-[#8e2961]"
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

/**
 * Un effet tout neuf, avec des valeurs de départ qui tiennent debout.
 *
 * Changer de type d'effet ne doit jamais laisser une offre à moitié remplie :
 * une remise par quantité sans palier ne remise rien, et une remise en FCFA
 * sans montant non plus. Chaque type part donc de quelque chose d'utilisable,
 * que la boutique ajuste ensuite.
 */
function effetVierge(type: Promotion['effect']['type']): Promotion['effect'] {
  switch (type) {
    case 'discount_amount':
      return { type, amount: 1000 };
    case 'percent_by_quantity':
      return { type, categories: [], tiers: [{ minQuantity: 3, percent: 5 }] };
    default:
      return { type };
  }
}

/**
 * Les paliers d'une offre par quantité, et les rayons sur lesquels elle porte.
 *
 * Deux règles s'affichent ici plutôt que de rester dans le code :
 *   • le palier retenu est le plus élevé atteint, donc dépasser le dernier ne
 *     fait jamais perdre la remise ;
 *   • sans rayon coché, l'offre porte sur tout le panier.
 */
function PaliersDuPack({
  effect,
  onChange,
  index,
}: {
  effect: Extract<Promotion['effect'], { type: 'percent_by_quantity' }>;
  onChange: (effect: Promotion['effect']) => void;
  index: number;
}) {
  const setPaliers = (tiers: PromotionQuantityTier[]) => onChange({ ...effect, tiers });

  return (
    <div className="rounded-[--radius-md] border border-line bg-cream/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[13.5px] font-medium">Paliers de remise</p>
        <button
          type="button"
          onClick={() =>
            setPaliers([
              ...effect.tiers,
              {
                minQuantity: Math.max(1, ...effect.tiers.map((t) => t.minQuantity + 1)),
                percent: 5,
              },
            ])
          }
          className="press flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12.5px]"
        >
          <Plus className="size-3.5" /> Palier
        </button>
      </div>

      <ul className="mt-3 space-y-2">
        {effect.tiers.map((palier, i) => (
          <li key={i} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
            <FormRow>
              <Label htmlFor={`pack-min-${index}-${i}`}>À partir de</Label>
              <Input
                id={`pack-min-${index}-${i}`}
                type="number"
                min={1}
                step={1}
                value={palier.minQuantity}
                onChange={(e) =>
                  setPaliers(
                    effect.tiers.map((t, j) =>
                      j === i ? { ...t, minQuantity: Math.max(1, Number(e.target.value)) } : t,
                    ),
                  )
                }
              />
            </FormRow>
            <FormRow>
              <Label htmlFor={`pack-pct-${index}-${i}`}>Remise (%)</Label>
              <Input
                id={`pack-pct-${index}-${i}`}
                type="number"
                min={0}
                max={100}
                step={1}
                value={palier.percent}
                onChange={(e) =>
                  setPaliers(
                    effect.tiers.map((t, j) =>
                      j === i
                        ? { ...t, percent: Math.min(100, Math.max(0, Number(e.target.value))) }
                        : t,
                    ),
                  )
                }
              />
            </FormRow>
            <button
              type="button"
              aria-label={`Supprimer le palier ${i + 1}`}
              onClick={() => setPaliers(effect.tiers.filter((_, j) => j !== i))}
              className="press mb-1 grid size-10 place-items-center rounded-full bg-white text-[#8a2f2f]"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-2 text-[12px] leading-relaxed text-stone">
        La cliente obtient le palier le plus élevé qu'elle atteint. En prendre plus ne fait
        donc jamais perdre la remise.
      </p>

      <p className="mt-4 text-[13.5px] font-medium">Rayons concernés</p>
      <p className="mt-1 text-[12px] leading-relaxed text-stone">
        Seuls ces rayons comptent — pour atteindre un palier comme pour calculer la remise.
        Aucun coché : l'offre porte sur tout le panier.
      </p>
      <ul className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-2">
        {CATEGORIES.map((rayon) => {
          const coche = effect.categories.includes(rayon.id);
          return (
            <li key={rayon.id}>
              <label className="flex cursor-pointer items-center gap-2.5 py-1 text-[13px]">
                <input
                  type="checkbox"
                  checked={coche}
                  onChange={() =>
                    onChange({
                      ...effect,
                      categories: coche
                        ? effect.categories.filter((id) => id !== rayon.id)
                        : [...effect.categories, rayon.id],
                    })
                  }
                  className="size-4 accent-[--color-brand]"
                />
                <span>{rayon.name}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
