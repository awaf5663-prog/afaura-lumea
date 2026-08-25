import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductCard } from '@/src/components/product/ProductCard';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { Sheet } from '@/src/components/ui/Sheet';
import { CATEGORIES } from '@/src/data/seed';
import { useProducts } from '@/src/hooks/useProducts';
import { cn } from '@/src/lib/cn';
import { formatFcfa } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import type { Product } from '@/src/types';

type Sort = 'nouveautes' | 'populaires' | 'prix-asc' | 'prix-desc';

const SORTS: Array<{ id: Sort; label: string }> = [
  { id: 'nouveautes', label: 'Nouveautés' },
  { id: 'populaires', label: 'Populaires' },
  { id: 'prix-asc', label: 'Prix croissant' },
  { id: 'prix-desc', label: 'Prix décroissant' },
];

export function ShopPage() {
  const { products, loading, error, reload } = useProducts();
  const { search, navigate } = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(search.get('q') ?? '');
  const [category, setCategory] = useState(search.get('categorie') ?? 'all');
  const [sort, setSort] = useState<Sort>((search.get('tri') as Sort) ?? 'nouveautes');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useSeo({
    title: 'Boutique — foulards, hijabs et accessoires',
    description:
      'Toutes les pièces disponibles immédiatement : jersey, modal, satin, dentelle et accessoires. Prix en FCFA, livraison à Dakar ou retrait.',
  });

  // La catégorie reste synchronisée avec l'URL (liens du menu, partage de lien).
  useEffect(() => {
    setCategory(search.get('categorie') ?? 'all');
    if (search.get('focus') === 'recherche') searchInputRef.current?.focus();
  }, [search]);

  const ceiling = useMemo(
    () => products.reduce((max, p) => Math.max(max, p.price), 0),
    [products],
  );

  const effectiveMax = maxPrice ?? ceiling;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const list = products.filter((product) => {
      if (product.status === 'draft') return false;
      if (category !== 'all' && product.category !== category) return false;
      if (ceiling > 0 && product.price > effectiveMax) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      );
    });
    return sortProducts(list, sort);
  }, [products, query, category, effectiveMax, ceiling, sort]);

  const updateCategory = (next: string) => {
    setCategory(next);
    navigate(next === 'all' ? '/boutique' : `/boutique?categorie=${next}`, { keepScroll: true });
  };

  const activeFilters = (category !== 'all' ? 1 : 0) + (maxPrice !== null ? 1 : 0);

  return (
    <div className="container-page pt-8">
      <header>
        <p className="eyebrow">Boutique</p>
        <h1 className="mt-3 text-[34px] sm:text-[44px]">Disponible maintenant</h1>
        <p className="mt-3 max-w-xl text-[15px] text-graphite">
          Ces pièces sont en stock chez nous : commandez, et on vous livre sans attendre le groupage.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-5 mt-6 bg-ivory/95 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" />
            <input
              ref={searchInputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un article…"
              aria-label="Rechercher un article"
              className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-9 text-[14px] focus:border-ink focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Effacer la recherche"
                className="press absolute right-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-cream"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="press relative inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13.5px]"
          >
            <SlidersHorizontal className="size-4" />
            Filtres
            {activeFilters > 0 && (
              <span className="grid size-[18px] place-items-center rounded-full bg-ink text-[10px] text-ivory">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
          <Chip active={category === 'all'} onClick={() => updateCategory('all')}>
            Tout
          </Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} active={category === c.id} onClick={() => updateCategory(c.id)}>
              {c.name}
            </Chip>
          ))}
          <span className="w-px shrink-0 self-stretch bg-line" aria-hidden />
          {SORTS.map((s) => (
            <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
              {s.label}
            </Chip>
          ))}
        </div>
      </div>

      <p className="mt-4 text-[12.5px] text-stone" aria-live="polite">
        {loading ? 'Chargement…' : `${filtered.length} article${filtered.length > 1 ? 's' : ''}`}
      </p>

      {error ? (
        <EmptyState
          title="Le catalogue n'a pas pu être chargé"
          description={error}
          action={<Button onClick={() => void reload()}>Réessayer</Button>}
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, index) => <ProductCardSkeleton key={index} />)
            : filtered.map((product, index) => (
                <ProductCard key={product.id} product={product} priority={index < 4} />
              ))}
        </div>
      )}

      {!loading && !error && filtered.length === 0 && (
        <EmptyState
          title="Aucun article ne correspond"
          description="Essayez un autre mot-clé, ou retirez les filtres pour voir toute la boutique."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setMaxPrice(null);
                updateCategory('all');
              }}
            >
              Réinitialiser
            </Button>
          }
        />
      )}

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filtres"
        side="bottom"
        footer={
          <div className="flex gap-3">
            <Button
              variant="secondary"
              full
              onClick={() => {
                setMaxPrice(null);
                updateCategory('all');
              }}
            >
              Tout effacer
            </Button>
            <Button full onClick={() => setFiltersOpen(false)}>
              Voir {filtered.length} article{filtered.length > 1 ? 's' : ''}
            </Button>
          </div>
        }
      >
        <div className="space-y-8 pb-2">
          <div>
            <p className="eyebrow mb-3">Catégorie</p>
            <div className="flex flex-wrap gap-2">
              <Chip active={category === 'all'} onClick={() => updateCategory('all')}>
                Tout
              </Chip>
              {CATEGORIES.map((c) => (
                <Chip key={c.id} active={category === c.id} onClick={() => updateCategory(c.id)}>
                  {c.name}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow mb-3">Prix maximum</p>
            <input
              type="range"
              min={0}
              max={ceiling || 10000}
              step={500}
              value={effectiveMax}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#16110f]"
              aria-label="Prix maximum"
            />
            <p className="mt-2 text-[13px] text-stone">
              Jusqu'à <span className="font-medium text-ink">{formatFcfa(effectiveMax)}</span>
            </p>
          </div>

          <div>
            <p className="eyebrow mb-3">Trier par</p>
            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <Chip key={s.id} active={sort === s.id} onClick={() => setSort(s.id)}>
                  {s.label}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

function sortProducts(list: Product[], sort: Sort): Product[] {
  const copy = [...list];
  switch (sort) {
    case 'prix-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'prix-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'populaires':
      return copy.sort((a, b) => Number(b.isPopular ?? false) - Number(a.isPopular ?? false));
    default:
      return copy.sort(
        (a, b) =>
          Number(b.isNew ?? false) - Number(a.isNew ?? false) ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'press shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors',
        active ? 'border-ink bg-ink text-ivory' : 'border-line bg-white text-graphite',
      )}
    >
      {children}
    </button>
  );
}
