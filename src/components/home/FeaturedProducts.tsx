import { ProductCard } from '@/src/components/product/ProductCard';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { Reveal } from '@/src/components/ui/Reveal';
import { Link } from '@/src/lib/router';
import type { Product } from '@/src/types';

export function FeaturedProducts({
  products,
  loading,
}: {
  products: Product[];
  loading: boolean;
}) {
  const selection = products.filter((p) => p.status === 'active').slice(0, 4);

  return (
    <section className="container-page mt-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Disponible tout de suite</p>
            <h2 className="mt-3 text-[30px] sm:text-[38px]">La sélection du moment</h2>
          </div>
          <Link to="/boutique" className="link-underline hidden shrink-0 text-[13.5px] text-stone sm:block">
            Voir toute la boutique →
          </Link>
        </div>
      </Reveal>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : selection.map((product, index) => (
              <Reveal key={product.id} delay={index * 60}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
      </div>

      <Link to="/boutique" className="link-underline mt-8 block text-[13.5px] text-stone sm:hidden">
        Voir toute la boutique →
      </Link>
    </section>
  );
}
