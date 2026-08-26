import { ArrowRight } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Reveal } from '@/src/components/ui/Reveal';
import { useRouter } from '@/src/lib/router';

export function SheinTeaser() {
  const { navigate } = useRouter();

  return (
    <section className="container-page mt-24">
      <Reveal>
        <div className="overflow-hidden rounded-[--radius-xl] bg-rosedark px-6 py-12 text-ivory sm:px-12 sm:py-16">
          <p className="text-[11px] uppercase tracking-[0.2em] text-ivory/60">Service de commande groupée</p>
          <h2 className="mt-4 max-w-2xl text-[30px] text-ivory sm:text-[40px]">
            Tu as repéré des articles sur SHEIN ? Envoie-les-nous.
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ivory/75">
            Tu nous transmets les liens, tailles et couleurs. On vérifie la disponibilité, on te donne
            le montant total en FCFA, et ta commande part avec le prochain groupage. Pas de carte
            bancaire internationale, pas de calcul de frais dans ton coin.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="light"
              onClick={() => navigate('/shein')}
            >
              Transmettre mon panier SHEIN
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="border-ivory/35 text-ivory hover:border-ivory hover:bg-ivory/10"
              onClick={() => navigate('/comment-ca-marche')}
            >
              Comprendre le service
            </Button>
          </div>
          <p className="mt-8 text-[12px] text-ivory/50">
            Service indépendant : nous ne sommes ni SHEIN, ni un revendeur officiel de SHEIN.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
