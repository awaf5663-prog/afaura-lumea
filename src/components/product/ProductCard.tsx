import { Plus, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';
import { Price } from '@/src/components/ui/Price';
import { useCart } from '@/src/hooks/useCart';
import { useToast } from '@/src/hooks/useToast';
import { Link } from '@/src/lib/router';
import type { Product } from '@/src/types';

export function ProductCard({ product, priority }: { product: Product; priority?: boolean }) {
  const { add } = useCart();
  const { notify } = useToast();
  const soldOut = product.status === 'sold_out' || product.stock === 0;
  const needsChoice = product.variants.length > 0;
  /** Nombre de modèles proposés, quand la fiche en regroupe plusieurs. */
  const choiceCount = product.variants[0]?.options.length ?? 0;

  return (
    <article className="group relative">
      <Link to={`/produit/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-[--radius-md] bg-cream">
          {product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              loading={priority ? 'eager' : 'lazy'}
              decoding="async"
              className="size-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="grid size-full place-items-center text-xs text-stone">Photo à venir</div>
          )}

          <div className="absolute left-2.5 top-2.5 flex flex-col items-start gap-1.5">
            {product.isNew && <Badge tone="new">Nouveau</Badge>}
            {product.isPopular && <Badge tone="popular">Populaire</Badge>}
          </div>

          {soldOut && (
            <div className="absolute inset-0 grid place-items-center bg-ivory/70">
              <Badge tone="soldout">Épuisé</Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/produit/${product.slug}`}>
            <h3 className="line-clamp-2 font-display text-[17px] leading-tight">{product.name}</h3>
          </Link>
          <Price amount={product.price} compareAt={product.compareAtPrice} className="mt-1 text-[14px]" />
          {choiceCount > 1 && (
            <p className="mt-0.5 text-[12px] text-mauve">{choiceCount} modèles au choix</p>
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
