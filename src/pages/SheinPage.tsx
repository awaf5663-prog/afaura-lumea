import { ArrowRight, CircleHelp, Globe, Info, Package, Plane, Ship, Sparkles } from 'lucide-react';
import { GroupingCapacity } from '@/src/components/shein/GroupingCapacity';
import { PromotionNotice } from '@/src/components/shein/PromotionNotice';
import { HowItWorks } from '@/src/components/home/HowItWorks';
import { WhatsAppCommunityCard } from '@/src/components/brand/WhatsAppCommunityCard';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings } from '@/src/hooks/useSettings';
import { formatFcfa } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

const WHAT_WE_NEED = [
  'Le lien de l’article (ou bouton « Partager » sur l’application SHEIN ou ALIBABA)',
  'La taille, variante et couleur exactes',
  'La quantité souhaitée (à l’unité ou en gros pour Alibaba)',
  'Le prix affiché sur la plateforme (en FCFA, USD $ ou EUR €)',
  'Une capture d’écran de votre panier si c’est plus simple pour vous',
];

export function SheinPage() {
  const { navigate } = useRouter();
  const { displayed } = useGroupings();
  const { settings } = useSettings();
  const pricing = settings?.pricing;

  useSeo({
    title: 'Commandes Groupées SHEIN & ALIBABA — Espace AFAURA',
    description:
      'Transmettez-nous vos articles SHEIN ou ALIBABA : validation officielle, groupage mutualisé, prise en charge de A à Z sans transitaire et livraison à Saint-Louis, Dakar, Thiès et Louga.',
  });

  return (
    <div className="pt-8">
      <section className="container-page">
        <p className="eyebrow inline-flex items-center gap-1.5">
          <Sparkles className="size-3.5" />
          Service de commande groupée officiel · SHEIN & ALIBABA
        </p>
        <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.06] sm:text-[52px]">
          Tu choisis sur SHEIN ou ALIBABA. Nous, on s'occupe de TOUT.
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-graphite">
          Pas de carte bancaire internationale, pas de compte en devises, et surtout{' '}
          <strong className="font-medium text-ink">aucun transitaire à chercher</strong>. Vous nous
          transmettez vos liens ou captures, nous confirmons le montant exact en FCFA, et votre
          commande voyage avec notre groupage sécurisé jusqu'à Saint-Louis, Dakar, Thiès et Louga.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/shein/demande')}>
            Transmettre mon panier SHEIN / ALIBABA
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/suivi')}>
            Suivre une demande
          </Button>
        </div>

        {/* Atouts clés SHEIN & ALIBABA */}
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-[--radius-md] border border-mauve/20 bg-cream/70 p-4">
            <div className="flex items-center gap-2 text-[14px] font-medium text-rosedark">
              <Package className="size-4 text-brand" />
              <span>SHEIN Express</span>
            </div>
            <p className="mt-1 text-[12.5px] text-graphite">
              Acheminement régulier par groupage, réception en <strong className="font-medium text-ink">15 jours max</strong> (2 semaines).
            </p>
          </div>

          <div className="rounded-[--radius-md] border border-mauve/20 bg-cream/70 p-4">
            <div className="flex items-center gap-2 text-[14px] font-medium text-rosedark">
              <Plane className="size-4 text-brand" />
              <span>ALIBABA Fret Avion</span>
            </div>
            <p className="mt-1 text-[12.5px] text-graphite">
              Idéal grossistes & commandes urgentes, réception en <strong className="font-medium text-ink">15 à 20 jours</strong>.
            </p>
          </div>

          <div className="rounded-[--radius-md] border border-mauve/20 bg-cream/70 p-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 text-[14px] font-medium text-rosedark">
              <Ship className="size-4 text-brand" />
              <span>ALIBABA Fret Maritime</span>
            </div>
            <p className="mt-1 text-[12.5px] text-graphite">
              Ultra économique pour les gros volumes & cartons, délai 2 à 3 mois maximum.
            </p>
          </div>
        </div>

        <div className="mt-6 max-w-md space-y-3">
          <PromotionNotice kind="shein" />
          <GroupingCapacity grouping={displayed} settings={settings} />
        </div>

        <div className="mt-8">
          <WhatsAppCommunityCard />
        </div>

        <p className="mt-8 flex max-w-2xl gap-2.5 rounded-[--radius-md] border border-line bg-cream/60 px-4 py-3.5 text-[13px] leading-relaxed text-graphite">
          <Info className="mt-0.5 size-4 shrink-0 text-mauve" />
          <span>
            Espace AFAURA est un service de conciergerie logistique et commande groupée. Nous validons,
            achetons pour vous, mutualisons le fret et assurons le dédouanement et la livraison locale.
            Montant 100% garanti en FCFA avant tout paiement.
          </span>
        </p>
      </section>

      <HowItWorks variant="shein" />

      <section className="container-page mt-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <h2 className="text-[28px] sm:text-[34px]">Ce dont nous avons besoin</h2>
            <ul className="mt-6 space-y-3">
              {WHAT_WE_NEED.map((item, index) => (
                <li key={item} className="flex gap-3 text-[14.5px] text-graphite">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-cream text-[11px] font-semibold">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[13px] leading-relaxed text-stone">
              Le formulaire vous laisse ajouter autant d'articles que vous voulez, un par un. Il n'y a
              pas de connexion à votre compte SHEIN : personne ne récupère votre panier à votre place,
              c'est vous qui décidez de ce que vous nous transmettez.
            </p>
          </Reveal>

          <Reveal delay={90}>
            <div className="rounded-[--radius-lg] border border-line bg-white p-6">
              <p className="inline-flex items-center gap-2 text-[13px] font-medium">
                <CircleHelp className="size-4" /> Questions fréquentes
              </p>
              <dl className="mt-5 space-y-5 text-[14px]">
                <div>
                  <dt className="font-medium">Quand est-ce que je paie ?</dt>
                  <dd className="mt-1 text-stone">
                    Après notre vérification, une fois le montant total confirmé en FCFA. Jamais avant.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Comment le montant est-il calculé ?</dt>
                  <dd className="mt-1 text-stone">
                    Prix des articles convertis en FCFA, plus la part des frais d'acheminement du
                    groupage. Le détail vous est envoyé avant paiement.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Et si un article n'est plus disponible ?</dt>
                  <dd className="mt-1 text-stone">
                    Nous vous prévenons avant de commander : vous choisissez de le remplacer ou de le
                    retirer de la demande.
                  </dd>
                </div>
                <div>
                  <dt className="font-medium">Combien de temps dure l'acheminement ?</dt>
                  <dd className="mt-1 text-stone">
                    Cela dépend du départ et du transporteur. Le délai estimé vous est communiqué au
                    moment de la confirmation, pas avant : nous préférons une date tenue à une
                    promesse.
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="container-page mt-24">
        <Reveal>
          <h2 className="text-[28px] sm:text-[34px]">Ce que vous payez, ligne par ligne</h2>
          <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-graphite">
            Nous séparons toujours le prix de vos articles et nos frais de service. Ces frais
            couvrent la vérification, la commande, le regroupement, l'organisation de
            l'acheminement et le suivi — ce ne sont pas des frais facturés par SHEIN.
          </p>

          <div className="mt-7 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[--radius-lg] border border-line bg-white p-5">
              <p className="eyebrow">Frais de traitement</p>
              <ul className="mt-4 divide-y divide-line">
                {(pricing?.tiers ?? []).map((tier) => (
                  <li key={tier.id} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px]">
                    <span>
                      {tier.maxItems === null
                        ? `${tier.minItems} articles et plus`
                        : `${tier.minItems} à ${tier.maxItems} articles`}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {tier.fee === null ? (
                        <span className="text-[13px] text-stone">Calcul personnalisé</span>
                      ) : (
                        formatFcfa(tier.fee)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[--radius-lg] border border-line bg-white p-5">
              <p className="eyebrow">Livraison</p>
              <ul className="mt-4 divide-y divide-line">
                {(pricing?.deliveryOptions ?? []).map((option) => (
                  <li key={option.id} className="flex items-baseline justify-between gap-4 py-2.5 text-[14px]">
                    <span>
                      {option.label}
                      {option.hint && (
                        <span className="mt-0.5 block text-[12px] leading-snug text-stone">{option.hint}</span>
                      )}
                    </span>
                    <span className="shrink-0 tabular-nums">
                      {option.fee === null ? (
                        <span className="text-[13px] text-stone">Communiqué après validation</span>
                      ) : option.fee === 0 ? (
                        'Gratuit'
                      ) : (
                        formatFcfa(option.fee)
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="mt-4 text-[12.5px] leading-relaxed text-stone">
            Le prix des articles s'ajoute à ces frais. Le montant final vous est confirmé après
            vérification, avant tout paiement.
          </p>
        </Reveal>
      </section>

      <section className="container-page mt-20">
        <div className="rounded-[--radius-xl] bg-rosedark px-6 py-12 text-center text-ivory sm:px-12">
          <h2 className="text-[28px] text-ivory sm:text-[36px]">Prête à envoyer votre sélection ?</h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ivory/70">
            Comptez deux minutes. Vous recevez ensuite votre numéro de demande et notre réponse sur
            WhatsApp.
          </p>
          <Button
            size="lg"
            variant="light"
            className="mt-7"
            onClick={() => navigate('/shein/demande')}
          >
            Transmettre mon panier SHEIN
          </Button>
        </div>
      </section>
    </div>
  );
}
