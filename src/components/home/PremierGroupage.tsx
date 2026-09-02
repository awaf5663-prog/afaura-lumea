import { CalendarClock, Sparkles, Truck, Users } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useCountdown } from '@/src/hooks/useCountdown';
import { groupingCount } from '@/src/hooks/useGroupings';
import { useOuvertureGroupage } from '@/src/hooks/useOuvertureGroupage';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDate } from '@/src/lib/format';
import { visiblePromotions } from '@/src/lib/pricing/promotions';
import { useRouter } from '@/src/lib/router';

/**
 * Un chiffre du compte à rebours.
 *
 * `key={value}` remonte le composant à chaque changement, ce qui rejoue
 * l'animation : les minutes battent, les jours restent immobiles. C'est la
 * seule animation en boucle de la page, et elle suit une vraie horloge.
 */
function Chiffre({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <span
        key={value}
        className="animate-pop block font-display text-[30px] leading-none tabular-nums text-rosedark sm:text-[36px]"
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 block text-[10.5px] uppercase tracking-[0.14em] text-stone">
        {label}
      </span>
    </div>
  );
}

function Puce({ icon: Icon, children }: { icon: typeof Truck; children: React.ReactNode }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full border border-mauve/20 bg-white/70 px-3.5 py-1.5 text-[12.5px] text-graphite">
      <Icon className="size-3.5 shrink-0 text-mauve" strokeWidth={1.8} />
      {children}
    </li>
  );
}

/**
 * Bandeau d'ouverture du groupage, en haut de l'accueil.
 *
 * Tout ce qu'il affiche est lu quelque part :
 *  — les dates viennent du groupage, ou des réglages à défaut ;
 *  — « premier » n'est écrit que si la boutique n'a réellement enregistré
 *    qu'un seul groupage ;
 *  — les places restantes ne s'affichent que si un nombre maximum est fixé ;
 *  — la livraison offerte ne s'affiche que si une offre correspondante est
 *    active dans les réglages — c'est elle qui met les frais à zéro au
 *    moment de la commande, pas ce bandeau.
 *
 * Rien n'est écrit en dur : sans dates configurées, le bandeau n'existe pas.
 */
export function PremierGroupage() {
  const { settings } = useSettings();
  const { fenetre, displayed, total, bandeau } = useOuvertureGroupage();
  const { navigate } = useRouter();

  const countdown = useCountdown(fenetre.target);

  // Rien à annoncer tant qu'aucune fenêtre n'est ouverte ou annoncée.
  if (!bandeau) return null;

  const avant = fenetre.phase === 'avant';
  const premier = total === 1;

  // Places : uniquement si un maximum a été fixé, et jamais en dessous de zéro.
  const restantes =
    displayed && displayed.maxOrders > 0
      ? Math.max(0, displayed.maxOrders - groupingCount(displayed))
      : null;

  // Livraison offerte : on relaie l'offre réellement enregistrée, avec son
  // propre libellé. Pas d'offre, pas de mention.
  const livraisonOfferte = visiblePromotions(settings?.promotions ?? [], 'shein').find(
    (offre) => offre.effect.type === 'free_delivery',
  );

  return (
    <section className="container-page mt-10">
      <div className="lueur relative overflow-hidden rounded-[--radius-xl] border border-mauve/20 bg-blush/50 px-5 py-6 sm:px-8 sm:py-7">
        <div className="relative grid gap-6 lg:grid-cols-[1.35fr_auto] lg:items-center lg:gap-10">
          <div>
            <p className="eyebrow inline-flex items-center gap-2">
              <span className="pouls relative inline-flex size-2 rounded-full bg-brand" />
              {avant ? 'Ouverture annoncée' : 'Inscriptions ouvertes'}
            </p>

            <h2 className="mt-2.5 text-[24px] leading-tight sm:text-[30px]">
              {premier ? 'Premier groupage SHEIN' : 'Groupage SHEIN en cours'}
            </h2>

            <p className="mt-2.5 max-w-xl text-[14px] leading-relaxed text-graphite">
              {avant ? (
                <>
                  Les inscriptions ouvrent le{' '}
                  <strong className="font-medium">{formatDate(fenetre.start)}</strong>
                  {fenetre.end ? (
                    <>
                      {' '}
                      et se ferment le{' '}
                      <strong className="font-medium">{formatDate(fenetre.end)}</strong>
                    </>
                  ) : null}
                  . Vous pouvez déjà transmettre votre panier : il est rattaché à ce départ.
                </>
              ) : (
                <>
                  {fenetre.start ? (
                    <>
                      Ouvert depuis le{' '}
                      <strong className="font-medium">{formatDate(fenetre.start)}</strong>.{' '}
                    </>
                  ) : null}
                  {fenetre.end ? (
                    <>
                      Tout panier transmis avant le{' '}
                      <strong className="font-medium">{formatDate(fenetre.end)}</strong> part avec
                      ce groupage.
                    </>
                  ) : (
                    <>La date de clôture est annoncée sur WhatsApp dès qu'elle est fixée.</>
                  )}
                </>
              )}
            </p>

            {(restantes !== null || livraisonOfferte) && (
              <ul className="mt-4 flex flex-wrap gap-2">
                {restantes !== null && (
                  <Puce icon={Users}>
                    {restantes > 0 ? (
                      <span>
                        <strong className="font-medium">{restantes}</strong>
                        {` place${restantes > 1 ? 's' : ''} sur ${displayed?.maxOrders}`}
                      </span>
                    ) : (
                      <span>Places complètes pour ce départ</span>
                    )}
                  </Puce>
                )}
                {livraisonOfferte && (
                  <Puce icon={Truck}>
                    {livraisonOfferte.label}
                    {livraisonOfferte.code ? (
                      <>
                        {' · code '}
                        <strong className="font-medium tracking-wide">
                          {livraisonOfferte.code}
                        </strong>
                      </>
                    ) : null}
                    {/* Une offre réservée le dit ici, pas au moment de payer. */}
                    {livraisonOfferte.studentOnly ? ' · étudiantes' : null}
                  </Puce>
                )}
              </ul>
            )}

            {livraisonOfferte ? (
              <p className="mt-2.5 flex items-start gap-2 text-[12.5px] leading-relaxed text-stone">
                <Sparkles className="mt-0.5 size-3.5 shrink-0 text-mauve" strokeWidth={1.8} />
                <span>
                  {livraisonOfferte.description}
                  {/* Les conditions se disent avec l'offre : une cliente ne doit
                      pas les découvrir au moment de payer. */}
                  {livraisonOfferte.studentOnly
                    ? ' Offre réservée aux étudiantes : une carte est demandée sur WhatsApp avant validation.'
                    : ''}
                  {livraisonOfferte.code
                    ? ` Pensez à saisir le code ${livraisonOfferte.code} au moment de la demande.`
                    : ''}
                </span>
              </p>
            ) : null}

            <Button className="mt-5" onClick={() => navigate('/shein')}>
              Transmettre mon panier SHEIN
            </Button>
          </div>

          {countdown.configured && !countdown.isPast ? (
            <div className="rounded-[--radius-lg] border border-line bg-white/85 px-5 py-4 backdrop-blur lg:min-w-[254px]">
              <p className="eyebrow inline-flex items-center gap-1.5">
                <CalendarClock className="size-3.5" />
                {avant ? 'Ouverture dans' : 'Clôture dans'}
              </p>
              <div className="mt-3 flex items-start gap-7">
                <Chiffre value={countdown.days} label={countdown.days > 1 ? 'jours' : 'jour'} />
                <Chiffre value={countdown.hours} label="heures" />
                <Chiffre value={countdown.minutes} label="min" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
