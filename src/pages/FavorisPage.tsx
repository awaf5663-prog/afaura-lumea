import { Heart } from 'lucide-react';
import { ProductCard } from '@/src/components/product/ProductCard';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { useFavoris } from '@/src/hooks/useFavoris';
import { useProducts } from '@/src/hooks/useProducts';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

/**
 * La liste d'envies.
 *
 * Les fiches sont relues dans le catalogue : un article retiré de la
 * boutique disparaît d'ici tout seul, et les prix affichés sont ceux
 * d'aujourd'hui, pas ceux du jour où le cœur a été coché.
 */
export function FavorisPage() {
  const { ids, count, vider } = useFavoris();
  const { products, loading } = useProducts();
  const { navigate } = useRouter();

  useSeo({
    title: 'Mes favoris',
    description: 'Les pièces que vous avez mises de côté.',
    noIndex: true,
  });

  // Dans l'ordre où ils ont été ajoutés, le dernier en premier.
  const gardes = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (count === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="mb-8 text-[34px]">Mes favoris</h1>
        <EmptyState
          icon={<Heart className="size-8" strokeWidth={1.2} />}
          title="Aucun favori pour le moment"
          description="Touchez le cœur sur une fiche pour la garder de côté et la retrouver ici."
          action={<Button onClick={() => navigate('/boutique')}>Découvrir la boutique</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[34px] sm:text-[42px]">Mes favoris</h1>
          <p className="mt-2 text-[14px] text-stone">
            {count} pièce{count > 1 ? 's' : ''} mise{count > 1 ? 's' : ''} de côté — gardée
            {count > 1 ? 's' : ''} sur cet appareil.
          </p>
        </div>
        <button type="button" onClick={vider} className="text-[13px] text-stone underline">
          Tout retirer
        </button>
      </div>

      {loading && gardes.length === 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
          {Array.from({ length: Math.min(count, 4) }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      ) : gardes.length === 0 ? (
        <p className="mt-8 text-[14px] text-stone">
          Ces articles ne sont plus en boutique. Ils peuvent revenir : demandez-nous.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
          {gardes.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
