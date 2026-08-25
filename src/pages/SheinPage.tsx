import { ArrowRight, CircleHelp, Info } from 'lucide-react';
import { GroupingCapacity } from '@/src/components/shein/GroupingCapacity';
import { HowItWorks } from '@/src/components/home/HowItWorks';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { useGroupings } from '@/src/hooks/useGroupings';
import { useSettings } from '@/src/hooks/useSettings';
import { formatFcfa } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

const WHAT_WE_NEED = [
  'Le lien de l’article (le bouton « Partager » de SHEIN copie le lien)',
  'La taille et la couleur exactes',
  'La quantité',
  'Le prix affiché sur SHEIN',
  'Une capture d’écran si c’est plus simple pour vous',
];

export function SheinPage() {
  const { navigate } = useRouter();
  const { displayed } = useGroupings();
  const { settings } = useSettings();
  const pricing = settings?.pricing;

  useSeo({
    title: 'Commander sur SHEIN depuis le Sénégal',
    description:
      'Transmettez-nous vos articles SHEIN : nous vérifions, confirmons le montant en FCFA et intégrons votre commande au prochain groupage vers Dakar.',
  });

  return (
    <div className="pt-8">
      <section className="container-page">
        <p className="eyebrow">Service de commande groupée</p>
        <h1 className="mt-3 max-w-3xl text-[36px] leading-[1.06] sm:text-[52px]">
          Tu choisis sur SHEIN. Nous, on s'occupe de la commande.
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-graphite">
          Pas de carte bancaire internationale, pas de frais surprise, pas d'adresse à l'étranger à
          trouver. Vous nous envoyez ce que vous voulez, nous vous donnons un montant clair en FCFA,
          et votre commande voyage avec notre prochain groupage.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" onClick={() => navigate('/shein/demande')}>
            Transmettre mon panier SHEIN
            <ArrowRight className="size-4" />
          </Button>
          <Button size="lg" variant="secondary" onClick={() => navigate('/suivi')}>
            Suivre une demande
          </Button>
        </div>

        <div className="mt-8 max-w-md">
          <GroupingCapacity grouping={displayed} />
        </div>

        <p className="mt-8 flex max-w-2xl gap-2.5 rounded-[--radius-md] border border-line bg-cream/60 px-4 py-3.5 text-[13px] leading-relaxed text-graphite">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            Nous sommes un service indépendant de commande groupée. Nous ne sommes ni SHEIN, ni un
            revendeur officiel, ni affiliés à la marque. Nous achetons les articles pour vous et
            organisons leur acheminement jusqu'à Dakar.
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
            className="mt-7 bg-ivory text-ink hover:bg-cream"
            onClick={() => navigate('/shein/demande')}
          >
            Transmettre mon panier SHEIN
          </Button>
        </div>
      </section>
    </div>
  );
}
