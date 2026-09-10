import { Heart, Plus, SlidersHorizontal } from 'lucide-react';
import { apercuDe } from '@/src/lib/apercu';
import { cn } from '@/src/lib/cn';
import { cadragePhoto, plusieursPrix, prixLePlusBas } from '@/src/lib/optionPrice';
import {
  pourcentageRemise,
  resumeVignette,
  valeursMontrees,
  type ResumeVignette,
} from '@/src/lib/optionsVignette';
import { Badge } from '@/src/components/ui/Badge';
import { Price } from '@/src/components/ui/Price';
import { useCart } from '@/src/hooks/useCart';
import { useFavoris } from '@/src/hooks/useFavoris';
import { useToast } from '@/src/hooks/useToast';
import { Link } from '@/src/lib/router';
import type { Product } from '@/src/types';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const { estFavori, basculer } = useFavoris();
  const { notify } = useToast();
  const favori = estFavori(product.id);
  const soldOut = product.status === 'sold_out' || product.stock === 0;
  const needsChoice = product.variants.length > 0;
  /** Nombre de modèles proposés, quand la fiche en regroupe plusieurs. */
  const choiceCount = product.variants[0]?.options.length ?? 0;
  const carre = cadragePhoto(product) === 'carre';
  // « dès 550 FCFA » quand le prix dépend du conditionnement choisi.
  const aPlusieursPrix = plusieursPrix(product);
  // Tailles ou couleurs visibles sans ouvrir la fiche.
  const resume = resumeVignette(product);
  const remise = pourcentageRemise(product);

  return (
    <article className="group relative">
      <Link to={`/produit/${product.slug}`} className="block">
        {/*
          Deux cadrages selon la catégorie. Un voile porté remplit un cadre
          portrait ; une gourde photographiée sur fond neutre, elle, y perdait
          son bouchon ou son pied. Voir Category.photo.
        */}
        <div
          className={cn(
            'relative overflow-hidden rounded-[--radius-md]',
            // `isolate` : le fondu de la photo (voir plus bas) doit rester
            // dans la vignette et ne pas déteindre sur la page.
            carre ? 'isolate aspect-square bg-rosecreme' : 'aspect-[3/4] bg-cream',
          )}
        >
          {product.images[0] ? (
            <img
              /* Une vignette n'a pas besoin de la grande photo. Voir lib/apercu. */
              src={apercuDe(product.images[0])}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'size-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]',
                // `contain` : on montre l'article entier, quitte à laisser du
                // fond rose autour. `cover` remplit, mais rogne.
                //
                // `mix-blend-multiply` fond le blanc de la photo dans le rose
                // crème : un article photographié sur fond blanc paraît
                // découpé, posé sur la couleur de la boutique. C'est réservé
                // aux packshots (cadrage carré) ; une photo portée garde son
                // décor intact.
                carre ? 'object-contain p-2 mix-blend-multiply' : 'object-cover',
              )}
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-stone">Photo à venir</div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {/* La remise se lit sur la photo, comme le prix barré se lit dessous.
                Le pourcentage vient de l'ancien prix réel : pas de pastille sans
                promotion saisie en administration. */}
            {remise !== null && (
              <span className="rounded-full bg-brand px-2 py-1 text-[11px] font-semibold tabular-nums text-white">
                −{remise} %
              </span>
            )}
            {product.isNew && <Badge tone="new">Nouveau</Badge>}
            {product.isPopular && <Badge tone="popular">Populaire</Badge>}
            {/* Ce qui attend en boutique se dit tout de suite : c'est
                l'argument le plus fort face à un délai de groupage. */}
            {product.readyToShip && <Badge tone="stock">En stock</Badge>}
          </div>

          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-ivory/70">
              <Badge tone="soldout">Indisponible</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Hors du lien : un cœur cliqué met de côté, il n'ouvre pas la fiche. */}
      <button
        type="button"
        aria-pressed={favori}
        aria-label={favori ? `Retirer ${product.name} des favoris` : `Mettre ${product.name} de côté`}
        onClick={() => {
          const ajoute = basculer(product.id);
          notify(ajoute ? `${product.name} mis de côté` : `${product.name} retiré des favoris`);
        }}
        className="press absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full bg-ivory/85 text-ink backdrop-blur-sm transition-colors hover:bg-ivory"
      >
        <Heart className={cn('size-[17px]', favori && 'fill-brand text-brand')} strokeWidth={1.7} />
      </button>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/produit/${product.slug}`}>
            <h3 className="line-clamp-2 font-display text-[17px] leading-tight">{product.name}</h3>
          </Link>
          <span className="mt-1 flex items-baseline gap-1.5 whitespace-nowrap">
            {aPlusieursPrix && <span className="text-[12.5px] text-stone">dès</span>}
            <Price
              amount={prixLePlusBas(product)}
              compareAt={product.compareAtPrice}
              className="text-[14px]"
            />
          </span>
          {/* Les options se montrent quand elles se lisent ; sinon on se
              contente de dire combien il y en a. */}
          {resume && valeursMontrees(resume).montrees.length > 0 ? (
            <OptionsVignette resume={resume} />
          ) : (
            choiceCount > 1 && (
              <p className="mt-0.5 text-[12px] text-mauve">{choiceCount} modèles au choix</p>
            )
          )}
        </div>

        {!soldOut &&
          (needsChoice ? (
            <Link
              to={`/produit/${product.slug}`}
              aria-label={`Choisir les options de ${product.name}`}
              className="press grid size-10 shrink-0 place-items-center rounded-full border border-line bg-white text-ink"
            >
              <SlidersHorizontal className="size-4" />
            </Link>
          ) : (
            <button
              type="button"
              aria-label={`Ajouter ${product.name} au panier`}
              onClick={() => {
                add(product, {});
                notify(`${product.name} ajouté au panier`);
              }}
              className="press grid size-10 shrink-0 place-items-center rounded-full bg-ink text-ivory"
            >
              <Plus className="size-4" />
            </button>
          ))}
      </div>
    </article>
  );
}

/**
 * Les options telles qu'elles sont saisies : une pastille quand le nom est
 * un mot de couleur, le nom en toutes lettres sinon, et un compte pour le
 * reste. Le tri est fait par valeursMontrees.
 */
function OptionsVignette({ resume }: { resume: ResumeVignette }) {
  const { montrees, caches } = valeursMontrees(resume);

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1">
      <span className="sr-only">
        {resume.libelle} : {resume.valeurs.map((valeur) => valeur.nom).join(', ')}
        {caches > 0 ? ` et ${caches} autre${caches > 1 ? 's' : ''}` : ''}
      </span>
      {montrees.map((valeur) =>
        valeur.hex ? (
          <span
            key={valeur.nom}
            title={valeur.nom}
            aria-hidden="true"
            style={{ backgroundColor: valeur.hex }}
            className={cn(
              'size-[15px] rounded-full border border-line',
              valeur.epuise && 'opacity-40',
            )}
          />
        ) : (
          <span
            key={valeur.nom}
            title={valeur.nom}
            aria-hidden="true"
            className={cn(
              'max-w-[86px] truncate rounded-full border border-line px-1.5 py-[1px] text-[10.5px] leading-[1.5] text-stone',
              valeur.epuise && 'line-through opacity-50',
            )}
          >
            {valeur.nom}
          </span>
        ),
      )}
      {caches > 0 && (
        <span aria-hidden="true" className="text-[11px] tabular-nums text-stone">
          +{caches}
        </span>
      )}
    </div>
  );
}
