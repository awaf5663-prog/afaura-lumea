import { GroupingSection } from '@/src/components/home/GroupingSection';
import { HowItWorks } from '@/src/components/home/HowItWorks';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { PAYMENT_METHODS } from '@/src/config/site';
import { useSettings } from '@/src/hooks/useSettings';
import { formatFcfa, prettyPhone } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

export function HowItWorksPage() {
  const { navigate } = useRouter();
  const { zones, settings } = useSettings();

  const payoutNumber = (id: string) =>
    id === 'wave' ? settings?.waveNumber ?? '' : id === 'orange_money' ? settings?.orangeMoneyNumber ?? '' : '';

  useSeo({
    title: 'Comment ça marche',
    description:
      'Deux parcours simples : les pièces disponibles en boutique, et les commandes SHEIN groupées. Paiement, livraison et suivi expliqués.',
  });

  return (
    <div className="pt-8">
      <section className="container-page">
        <p className="eyebrow">Le fonctionnement</p>
        <h1 className="mt-3 max-w-2xl text-[36px] leading-[1.07] sm:text-[50px]">
          Vous savez à chaque instant ce qui se passe.
        </h1>
        <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-graphite">
          Rien n'est caché : voici exactement comment on commande, comment on paie, ce que coûte la
          livraison et comment suivre son colis.
        </p>
      </section>

      <HowItWorks />

      <section className="container-page mt-24">
        <Reveal>
          <h2 className="text-[28px] sm:text-[34px]">Livraison</h2>
          <div className="mt-6 overflow-hidden rounded-[--radius-lg] border border-line bg-white">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-cream/70 text-[12px] uppercase tracking-[0.1em] text-stone">
                <tr>
                  <th className="px-5 py-3 font-medium">Zone</th>
                  <th className="px-5 py-3 text-right font-medium">Frais</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {zones.map((zone) => (
                  <tr key={zone.id}>
                    <td className="px-5 py-4">
                      <span className="block">{zone.label}</span>
                      {zone.hint && <span className="mt-0.5 block text-[12.5px] text-stone">{zone.hint}</span>}
                    </td>
                    <td className="px-5 py-4 text-right tabular-nums">
                      {zone.fee === null ? (
                        <span className="text-stone">Confirmés sur WhatsApp</span>
                      ) : zone.fee === 0 ? (
                        'Gratuit'
                      ) : (
                        formatFcfa(zone.fee)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[12.5px] text-stone">
            Lorsque les frais d'une zone ne sont pas encore fixés, nous ne les inventons pas : le
            montant exact vous est confirmé avant tout paiement.
          </p>
        </Reveal>
      </section>

      <section className="container-page mt-20">
        <Reveal>
          <h2 className="text-[28px] sm:text-[34px]">Paiement</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {PAYMENT_METHODS.map((method) => (
              <div key={method.id} className="rounded-[--radius-lg] border border-line bg-white p-5">
                <p className="font-display text-[20px]">{method.label}</p>
                {payoutNumber(method.id) && (
                  <p className="mt-1 text-[14px] font-medium tabular-nums">
                    {prettyPhone(payoutNumber(method.id))}
                  </p>
                )}
                <p className="mt-2 text-[13.5px] leading-relaxed text-stone">{method.description}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-graphite">
            Aucun paiement n'est prélevé sur ce site : vous validez votre commande, nous confirmons le
            montant, puis vous réglez par le moyen choisi. Vous nous transmettez la capture de
            confirmation sur WhatsApp, et nous marquons le paiement comme vérifié une fois reçu.
          </p>
        </Reveal>
      </section>

      <GroupingSection />

      <section className="container-page mt-20 pb-4">
        <div className="rounded-[--radius-xl] border border-line bg-white px-6 py-12 text-center">
          <h2 className="text-[28px]">Une question avant de commander ?</h2>
          <p className="mx-auto mt-3 max-w-md text-[14.5px] text-stone">
            La FAQ répond à l'essentiel, et nous restons joignables sur WhatsApp.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button onClick={() => navigate('/faq')}>Lire la FAQ</Button>
            <Button variant="secondary" onClick={() => navigate('/boutique')}>
              Voir la boutique
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
