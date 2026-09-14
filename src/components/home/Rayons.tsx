import { ArrowRight } from 'lucide-react';
import { apercuDe } from '@/src/lib/apercu';
import { cn } from '@/src/lib/cn';
import { famillesGarnies } from '@/src/data/familles';
import { Reveal } from '@/src/components/ui/Reveal';
import { Link } from '@/src/lib/router';
import type { Product } from '@/src/types';

const FAMILLES = famillesGarnies();

/**
 * ─────────────────────────────────────────────────────────────
 *  LES RAYONS DE LA BOUTIQUE
 * ─────────────────────────────────────────────────────────────
 *  Afaura Luméa a commencé avec des voiles et un service de commande
 *  groupée. La boutique compte aujourd'hui des parfums, des soins, des
 *  sacs, des chaussures, du maquillage, des tenues de nuit — et la page
 *  d'accueil n'en disait rien. Une visiteuse repartait en croyant à une
 *  boutique de hijabs qui fait aussi du SHEIN.
 *
 *  Cette section montre les rayons tels qu'ils existent, avec une photo
 *  prise dans chacun d'eux. Rien n'est annoncé qui ne soit en vente : un
 *  rayon vide ne s'affiche pas, et la photo est celle d'un vrai article.
 */
export function Rayons({ products }: { products: Product[] }) {
  const rayons = FAMILLES.map((famille) => {
    const dedans = products.filter((p) => famille.categories.includes(p.category));
    const illustre = dedans.find((p) => p.thumbnails?.[0] ?? p.images[0]);
    return {
      id: famille.id,
      name: famille.name,
      nombre: dedans.length,
      photo: illustre ? apercuDe(illustre.thumbnails?.[0] ?? illustre.images[0]) : undefined,
    };
  }).filter((rayon) => rayon.nombre > 0);

  // Rien en base pour le moment : mieux vaut ne rien annoncer du tout.
  if (rayons.length === 0) return null;

  return (
    <section className="container-page mt-24">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Les rayons</p>
            <h2 className="mt-3 max-w-xl text-[28px] leading-tight sm:text-[34px]">
              Tout ce qu'une jeune femme cherche, au même endroit.
            </h2>
          </div>
          <Link to="/boutique" className="link-underline inline-flex items-center gap-1.5 text-[13.5px]">
            Voir toute la boutique
            <ArrowRight className="size-4" />
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
          {rayons.map((rayon) => (
            <li key={rayon.id}>
              <Link to={`/boutique?famille=${rayon.id}`} className="group block">
                <div className="relative overflow-hidden rounded-[--radius-md] bg-rosecreme">
                  {rayon.photo ? (
                    <img
                      src={rayon.photo}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={cn(
                        'aspect-square w-full object-cover transition-transform duration-[600ms]',
                        'ease-out group-hover:scale-[1.05]',
                      )}
                    />
                  ) : (
                    /*
                      Un rayon sans photo garde sa place : il a des articles, et
                      la cliente doit pouvoir y entrer. Son nom en grand vaut
                      mieux qu'un « photo à venir » qui fait trou dans la vitrine.
                    */
                    <div className="grid aspect-square w-full place-items-center px-3 text-center">
                      <span className="font-display text-[19px] leading-tight text-mauve">
                        {rayon.name}
                      </span>
                    </div>
                  )}
                </div>
                <p className="mt-2.5 font-display text-[16px] leading-tight">{rayon.name}</p>
                <p className="mt-0.5 text-[12px] text-stone">
                  {rayon.nombre} article{rayon.nombre > 1 ? 's' : ''}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
