import { ArrowRight, Clock, ShieldCheck, Truck } from 'lucide-react';
import logo from '@/src/assets/brand/logo-sombre.webp';
import heroImage from '@/src/assets/products/dentelle-noir-blanc.webp';
import { Button } from '@/src/components/ui/Button';
import { BRAND } from '@/src/config/site';
import { useOuvertureGroupage } from '@/src/hooks/useOuvertureGroupage';
import { Link, useRouter } from '@/src/lib/router';
import { GroupingBadge } from './GroupingBadge';

export function Hero() {
  const { navigate } = useRouter();
  /*
   * Quand le bandeau d'ouverture s'affiche juste en dessous, il porte déjà le
   * même compte à rebours et les mêmes dates. La carte posée sur la photo
   * ferait doublon : on la garde pour tous les autres cas — groupage clôturé,
   * date pas encore fixée — où elle est la seule à dire où on en est.
   */
  const { bandeau } = useOuvertureGroupage();

  return (
    <section className="container-page pt-6 lg:pt-14">
      <div className="grid items-center gap-9 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div className="animate-fade">
          {/*
            Le logo de la boutique, en tête. Ombre portée douce plutôt qu'un faux
            relief : le tracé du voile a déjà son propre modelé, l'écraser sous un
            effet 3D lui ferait perdre sa finesse.
          */}
          <img
            src={logo}
            alt={BRAND.name}
            width={720}
            height={720}
            className="h-24 w-auto object-contain drop-shadow-[0_12px_26px_rgba(23,17,15,0.20)] sm:h-32"
          />

          <p className="eyebrow mt-6">Saint-Louis · Voiles & commandes SHEIN</p>

          <h1 className="mt-4 text-[33px] leading-[1.07] sm:text-[48px] lg:text-[58px]">
            Commande ce qui te plaît.
            <span className="block text-mauve">On s'occupe de tout le reste.</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-graphite">{BRAND.pitch}</p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" onClick={() => navigate('/boutique')}>
              Découvrir la boutique
              <ArrowRight className="size-4" />
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/shein')}>
              Commander sur SHEIN
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-[13px] text-stone">
            <li className="inline-flex items-center gap-2">
              <ShieldCheck className="size-4" strokeWidth={1.6} />
              Prix confirmés en FCFA avant paiement
            </li>
            <li className="inline-flex items-center gap-2">
              <Clock className="size-4" strokeWidth={1.6} />
              Tout est sur commande, délai annoncé d'avance
            </li>
            <li className="inline-flex items-center gap-2">
              <Truck className="size-4" strokeWidth={1.6} />
              Livraison Saint-Louis ou point de retrait
            </li>
          </ul>
        </div>

        <div>
          <div className="relative">
            <div className="overflow-hidden rounded-[--radius-xl] bg-blush">
              <img
                src={heroImage}
                alt="Hijabs en dentelle noir et blanc portés par deux modèles"
                className="aspect-[5/4] max-h-[52vh] w-full object-cover sm:aspect-[5/4] sm:max-h-none lg:aspect-[4/5]"
                fetchPriority="high"
                decoding="async"
              />
            </div>
            {!bandeau && (
              <div className="absolute -bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[268px]">
                <GroupingBadge />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-16 hairline pt-6">
        <Link to="/comment-ca-marche" className="link-underline text-[13px] text-stone">
          Première commande ? Voir comment ça marche en 4 étapes →
        </Link>
      </div>
    </section>
  );
}
