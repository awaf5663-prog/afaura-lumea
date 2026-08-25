import editorial from '@/src/assets/images/atelier-editorial.webp';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { useCountdown } from '@/src/hooks/useCountdown';
import { useSettings } from '@/src/hooks/useSettings';
import { formatDate } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';

/** Explication du groupage, sans jargon logistique, avec compte à rebours réel. */
export function GroupingSection() {
  const { settings } = useSettings();
  const { navigate } = useRouter();
  const target = settings?.nextGroupingDate ?? '';
  const countdown = useCountdown(target);

  const cells = [
    { value: countdown.days, label: countdown.days > 1 ? 'jours' : 'jour' },
    { value: countdown.hours, label: 'heures' },
    { value: countdown.minutes, label: 'minutes' },
  ];

  return (
    <section className="mt-24 bg-cream/70 py-16">
      <div className="container-page grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal>
          <p className="eyebrow">Le groupage, simplement</p>
          <h2 className="mt-3 text-[30px] sm:text-[38px]">Plusieurs commandes, un seul voyage.</h2>
          <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-graphite">
            Nous rassemblons les commandes de plusieurs clientes et les faisons acheminer ensemble.
            C'est ce qui permet de partager les frais, de suivre chaque colis et de vous donner un
            montant clair en FCFA — au lieu de vous laisser gérer un achat international toute seule.
          </p>

          <div className="mt-8 rounded-[--radius-lg] border border-line bg-white p-5">
            {countdown.configured && !countdown.isPast ? (
              <>
                <p className="eyebrow">Clôture du prochain groupage</p>
                <div className="mt-3 flex items-end gap-5">
                  {cells.map((cell) => (
                    <div key={cell.label}>
                      <span className="font-display text-[34px] leading-none tabular-nums">
                        {String(cell.value).padStart(2, '0')}
                      </span>
                      <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-stone">
                        {cell.label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-[13px] text-stone">
                  Toute demande reçue avant le {formatDate(target)} part avec ce groupage.
                </p>
              </>
            ) : countdown.isPast ? (
              <p className="text-[14px] text-graphite">
                Le groupage du {formatDate(target)} est clôturé. Les demandes reçues maintenant sont
                intégrées au départ suivant, dont la date est annoncée sur WhatsApp.
              </p>
            ) : (
              <p className="text-[14px] text-graphite">
                La date du prochain départ n'est pas encore fixée. Envoyez votre demande : elle sera
                intégrée au groupage suivant et vous recevrez la date dès qu'elle est arrêtée.
              </p>
            )}
          </div>

          <Button className="mt-6" onClick={() => navigate('/shein')}>
            Transmettre mon panier SHEIN
          </Button>
        </Reveal>

        <Reveal delay={100}>
          <img
            src={editorial}
            alt="Textiles pliés dans un intérieur clair"
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full rounded-[--radius-xl] object-cover"
          />
        </Reveal>
      </div>
    </section>
  );
}
