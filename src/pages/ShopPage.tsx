import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProductCard } from '@/src/components/product/ProductCard';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/src/components/ui/Skeleton';
import { Sheet } from '@/src/components/ui/Sheet';
import { famillesGarnies, familleDe } from '@/src/data/familles';
import { useProducts } from '@/src/hooks/useProducts';
import { cn } from '@/src/lib/cn';
import { formatFcfa } from '@/src/lib/format';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import type { Product } from '@/src/types';

type Sort = 'nouveautes' | 'populaires' | 'prix-asc' | 'prix-desc';

/* Le classement des rayons ne bouge pas : calculé une fois, pas à chaque rendu. */
const FAMILLES_GARNIES = famillesGarnies();

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
  /*
   * La famille ouverte. Elle se déduit de la catégorie quand on arrive par un
   * lien direct (« /boutique?categorie=jersey » depuis le menu) : la cliente
   * doit voir où elle se trouve, et pouvoir remonter d'un cran.
   */
  const [famille, setFamille] = useState(
    () => search.get('famille') ?? familleDe(search.get('categorie') ?? '')?.id ?? 'all',
  );
  const [sort, setSort] = useState<Sort>((search.get('tri') as Sort) ?? 'nouveautes');
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useSeo({
    title: 'Boutique — voiles, abayas et hijab tape',
    description:
      'Jersey, modal, satin, dentelle, viscose et abayas sur commande, glosses et huiles à lèvres disponibles tout de suite. Prix en FCFA, livraison à Saint-Louis ou retrait.',
  });

  // La catégorie reste synchronisée avec l'URL (liens du menu, partage de lien).
  useEffect(() => {
    const cat = search.get('categorie') ?? 'all';
    setCategory(cat);
    setFamille(search.get('famille') ?? familleDe(cat)?.id ?? 'all');
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
      // Une famille ouverte sans rubrique précise montre tout ce qu'elle contient.
      if (category === 'all' && famille !== 'all') {
        const f = FAMILLES_GARNIES.find((x) => x.id === famille);
        if (f && !f.categories.includes(product.category)) return false;
      }
      if (ceiling > 0 && product.price > effectiveMax) return false;
      if (!needle) return true;
      return (
        product.name.toLowerCase().includes(needle) ||
        product.description.toLowerCase().includes(needle)
      );
    });
    return sortProducts(list, sort);
  }, [products, query, category, famille, effectiveMax, ceiling, sort]);

  /*
   * Une catégorie sans article visible ne s'affiche pas : cliquer dessus
   * mènerait à « 0 article », ce qui donne l'impression d'une boutique vide
   * plutôt que d'une catégorie en préparation. Elle réapparaît d'elle-même
   * dès qu'un article y est publié.
   */
  const categoriesVisibles = useMemo(
    () =>
      new Set(
        products.filter((product) => product.status !== 'draft').map((product) => product.category),
      ),
    [products],
  );

  /*
   * Une famille dont aucune rubrique n'a d'article ne s'affiche pas, et une
   * rubrique vide non plus : appuyer dessus mènerait à « 0 article », ce qui
   * donne l'impression d'une boutique vide plutôt que d'un rayon en
   * préparation. Elles reviennent d'elles-mêmes dès qu'un article y paraît.
   */
  const famillesVisibles = useMemo(
    () =>
      FAMILLES_GARNIES.map((f) => ({
        ...f,
        rubriques: f.rubriques.filter((c) => categoriesVisibles.has(c.id)),
      })).filter((f) => f.rubriques.length > 0),
    [categoriesVisibles],
  );

  /*
   * Les rubriques de la famille ouverte. On ne les propose qu'à partir de deux :
   * un seul bouton sous « Sacs » ne ferait que répéter le titre au-dessus.
   */
  const rubriques = useMemo(() => {
    const f = famillesVisibles.find((x) => x.id === famille);
    return f && f.rubriques.length > 1 ? f.rubriques : [];
  }, [famillesVisibles, famille]);

  const updateCategory = (next: string) => {
    setCategory(next);
    const f = next === 'all' ? famille : (familleDe(next)?.id ?? 'all');
    setFamille(f);
    const params = new URLSearchParams();
    if (f !== 'all') params.set('famille', f);
    if (next !== 'all') params.set('categorie', next);
    const q = params.toString();
    navigate(q ? `/boutique?${q}` : '/boutique', { keepScroll: true });
  };

  /** Ouvrir une famille remet la rubrique à zéro : on montre tout le rayon. */
  const updateFamille = (next: string) => {
    setFamille(next);
    setCategory('all');
    navigate(next === 'all' ? '/boutique' : `/boutique?famille=${next}`, { keepScroll: true });
  };

  const activeFilters =
    (famille !== 'all' ? 1 : 0) + (category !== 'all' ? 1 : 0) + (maxPrice !== null ? 1 : 0);

  return (
    <div className="container-page pt-8">
      <header>
        <p className="eyebrow">Boutique</p>
        <h1 className="mt-3 text-[34px] sm:text-[44px]">Notre sélection</h1>
        <p className="mt-3 max-w-xl text-[15px] text-graphite">
          La plupart des pièces sont <strong className="font-medium text-ink">sur commande</strong> :
          vous choisissez ici, nous commandons pour vous, et votre pièce part avec le prochain
          groupage. Nous vous confirmons le délai sur WhatsApp avant tout paiement. Les articles
          marqués <strong className="font-medium text-ink">« en stock »</strong>, eux, sont déjà
          en boutique et se remettent tout de suite.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-5 mt-6 bg-ivory/95 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 lg:max-w-xl">
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

        {/*
          Premier rang : les grandes familles. C'est tout ce qu'on voit tant
          qu'on n'est entré nulle part — une dizaine de mots, pas vingt-deux.
        */}
        <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:gap-y-2.5 lg:overflow-x-visible lg:px-0">
          <Chip active={famille === 'all'} onClick={() => updateFamille('all')}>
            Tout
          </Chip>
          {famillesVisibles.map((f) => (
            <Chip key={f.id} active={famille === f.id} onClick={() => updateFamille(f.id)}>
              {f.name}
            </Chip>
          ))}
        </div>

        {/*
          Second rang : le détail du rayon ouvert. Il n'existe que là, et
          disparaît dès qu'on ressort — c'est ce qui garde la barre lisible.
        */}
        {rubriques.length > 0 && (
          <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:gap-y-2 lg:overflow-x-visible lg:px-0">
            <Chip small active={category === 'all'} onClick={() => updateCategory('all')}>
              Tout {famillesVisibles.find((f) => f.id === famille)?.name.toLowerCase()}
            </Chip>
            {rubriques.map((c) => (
              <Chip key={c.id} small active={category === c.id} onClick={() => updateCategory(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        )}

        <div className="no-scrollbar -mx-5 mt-2 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:gap-y-2.5 lg:overflow-x-visible lg:px-0">
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
          {/*
            Le panneau montre tout, mais rangé : chaque rayon avec ses
            rubriques en dessous. C'est la même carte que la barre du haut,
            dépliée d'un coup — utile quand on cherche sans savoir où c'est.
          */}
          <div>
            <p className="eyebrow mb-3">Rayon</p>
            <div className="mb-4 flex flex-wrap gap-2">
              <Chip
                active={famille === 'all' && category === 'all'}
                onClick={() => updateFamille('all')}
              >
                Tout
              </Chip>
            </div>
            <div className="space-y-4">
              {famillesVisibles.map((f) => (
                <div key={f.id}>
                  <div className="flex flex-wrap gap-2">
                    <Chip
                      active={famille === f.id && category === 'all'}
                      onClick={() => updateFamille(f.id)}
                    >
                      {f.name}
                    </Chip>
                    {f.rubriques.length > 1 &&
                      f.rubriques.map((c) => (
                        <Chip
                          key={c.id}
                          small
                          active={category === c.id}
                          onClick={() => updateCategory(c.id)}
                        >
                          {c.name}
                        </Chip>
                      ))}
                  </div>
                </div>
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
              className="w-full accent-[#8e2961]"
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
  /* Le second rang est plus discret que le premier : c'est un détail de rayon,
     pas un rayon. Même forme, moins de poids. */
  small,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'press shrink-0 whitespace-nowrap rounded-full border transition-colors',
        small ? 'px-3.5 py-1.5 text-[12.5px]' : 'px-4 py-2 text-[13px]',
        active
          ? small
            ? 'border-mauve bg-blush/70 text-ink'
            : 'border-ink bg-ink text-ivory'
          : 'border-line bg-white text-graphite',
      )}
    >
      {children}
    </button>
  );
}
