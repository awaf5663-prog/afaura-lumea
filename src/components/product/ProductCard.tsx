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
  /*
   * La vignette prend l'aperçu quand il existe : 40 Ko au lieu de 300, pour
   * une case de 167 px de large. `apercuDe` fait le même travail pour les
   * photos livrées avec le site.
   */
  const vignette = apercuDe(product.thumbnails?.[0] ?? product.images[0]);
  // « dès 550 FCFA » quand le prix dépend du conditionnement choisi.
  const aPlusieursPrix = plusieursPrix(product);
  // Tailles ou couleurs visibles sans ouvrir la fiche.
  const resume = resumeVignette(product);
  const remise = pourcentageRemise(product);

  return (
    <article className="card-3d group relative flex flex-col p-2.5 sm:p-3.5 bg-white border border-[#F4C7D3]/60 hover:border-[#E296A9] rounded-2xl sm:rounded-3xl transition-all duration-300 shadow-xs hover:shadow-md select-none">
      <Link to={`/produit/${product.slug}`} className="block">
        <div
          className={cn(
            'relative overflow-hidden rounded-[16px] sm:rounded-[20px] border border-[#F4C7D3]/40',
            carre ? 'isolate aspect-square bg-white' : 'aspect-[4/5] bg-gradient-to-b from-[#FAF3F4] via-[#FCE8EE]/50 to-[#F5E6EA]',
          )}
        >
          {vignette ? (
            <img
              src={vignette}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className={cn(
                'size-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]',
                carre ? 'object-contain p-2 mix-blend-multiply' : 'object-cover',
              )}
            />
          ) : (
            <div className="grid size-full place-items-center px-3 text-center">
              <span className="font-display text-[15px] leading-tight text-[#7E1E3C]">
                {product.name}
              </span>
            </div>
          )}

          {/* Badges on the photo */}
          <div className="absolute left-2 top-2 flex flex-col items-start gap-1">
            {remise !== null && (
              <span className="rounded-md bg-[#7E1E3C] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white shadow-xs">
                −{remise} %
              </span>
            )}
            {(product.wholesaleLot || product.priceDizaine) && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-[#581127] text-[#FCE8EE] shadow-xs">
                Gros {product.priceDizaine && product.wholesaleLot ? '10/12p' : product.priceDizaine ? '10p' : '12p'}
              </span>
            )}
            {product.isNew && <Badge tone="new">Nouveau</Badge>}
            {product.isPopular && <Badge tone="popular">Populaire</Badge>}
            {product.readyToShip && <Badge tone="stock">En stock</Badge>}
          </div>

          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-ivory/70 backdrop-blur-xs">
              <Badge tone="soldout">Indisponible</Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Heart Wishlist button */}
      <button
        type="button"
        aria-pressed={favori}
        aria-label={favori ? `Retirer ${product.name} des favoris` : `Mettre ${product.name} de côté`}
        onClick={() => {
          const ajoute = basculer(product.id);
          notify(ajoute ? `${product.name} mis de côté` : `${product.name} retiré des favoris`);
        }}
        className={cn(
          'press absolute right-4 top-4 grid size-8 sm:size-8.5 place-items-center rounded-full transition-all shadow-xs',
          favori ? 'bg-[#E296A9] text-[#581127] shadow-sm' : 'bg-white/90 hover:bg-white text-[#8A6470] border border-[#F4C7D3]/60',
        )}
      >
        <Heart className={cn('size-4', favori && 'fill-[#581127] text-[#581127]')} strokeWidth={1.8} />
      </button>

      {/* Info & Price */}
      <div className="mt-2.5 flex flex-col flex-grow min-w-0">
        <Link to={`/produit/${product.slug}`} className="block">
          <h3 className="line-clamp-2 text-xs sm:text-sm font-medium text-[#3D1220] group-hover:text-[#7E1E3C] transition-colors leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Wholesale extra hint if defined */}
        {(product.priceDizaine || product.wholesaleLot) && (
          <p className="text-[10px] text-[#8A6470] font-medium mt-0.5">
            Tarif gros : {product.priceDizaine ? `${product.priceDizaine.toLocaleString('fr-FR')} F (10p)` : `${product.wholesaleLot?.price.toLocaleString('fr-FR')} F (${product.wholesaleLot?.quantity}p)`}
          </p>
        )}

        {/* Options / Colors */}
        {resume && valeursMontrees(resume).montrees.length > 0 ? (
          <OptionsVignette resume={resume} />
        ) : (
          choiceCount > 1 && (
            <p className="mt-1 text-[11px] text-[#7E1E3C] font-medium">{choiceCount} modèles au choix</p>
          )
        )}

        {/* Bottom price + Action */}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-[#F4C7D3]/30 min-w-0 gap-1.5">
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-bold text-[#7E1E3C] truncate leading-tight">
              {aPlusieursPrix && <span className="text-[11px] font-normal text-[#8A6470] mr-1">dès</span>}
              <Price amount={prixLePlusBas(product)} compareAt={product.compareAtPrice} className="text-xs sm:text-sm" />
            </span>
          </div>

          {!soldOut &&
            (needsChoice ? (
              <Link
                to={`/produit/${product.slug}`}
                aria-label={`Choisir les options de ${product.name}`}
                className="press grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl border border-[#F4C7D3] bg-[#FAF3F4] text-[#581127] hover:bg-[#FCE8EE] transition-colors"
              >
                <SlidersHorizontal className="size-3.5" />
              </Link>
            ) : (
              <button
                type="button"
                aria-label={`Ajouter ${product.name} au panier`}
                onClick={() => {
                  add(product, {});
                  notify(`${product.name} ajouté au panier`);
                }}
                className="press grid size-8 sm:size-9 shrink-0 place-items-center rounded-xl button-3d-rose-fonce text-white shadow-xs cursor-pointer"
              >
                <Plus className="size-4 stroke-[2.5]" />
              </button>
            ))}
        </div>
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
