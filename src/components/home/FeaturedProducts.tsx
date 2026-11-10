import { Sparkles, ArrowRight } from 'lucide-react';
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
  const selection = products.filter((p) => p.status === 'active').slice(0, 8);

  return (
    <section className="container-page mt-20 sm:mt-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#7E1E3C]">
              <Sparkles className="size-3.5 text-[#E296A9]" />
              <span>Nouveautés & Coups de Cœur</span>
            </div>
            <h2 className="mt-2 text-[26px] sm:text-[34px] font-serif font-bold text-[#3D1220]">
              La sélection du moment
            </h2>
          </div>
          <Link
            to="/boutique"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#7E1E3C] hover:text-[#581127] hover:underline"
          >
            <span>Catalogue complet ({products.length})</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <ProductCardSkeleton key={index} />)
          : selection.map((product, index) => (
              <Reveal key={product.id} delay={index * 50}>
                <ProductCard product={product} priority={index < 2} />
              </Reveal>
            ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link
          to="/boutique"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E1E3C] hover:underline py-2"
        >
          <span>Catalogue complet ({products.length})</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}
