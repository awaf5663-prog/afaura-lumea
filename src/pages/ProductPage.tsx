import { ArrowLeft, Check, Clock, Loader2, Palette, Ruler, ShieldCheck, Truck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { WhatsAppLink } from '@/src/components/whatsapp/WhatsAppLink';
import { Gallery } from '@/src/components/product/Gallery';
import { ProductCard } from '@/src/components/product/ProductCard';
import { VariantPicker } from '@/src/components/product/VariantPicker';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Input, Label } from '@/src/components/ui/Field';
import { Price } from '@/src/components/ui/Price';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { BRAND, SITE_URL } from '@/src/config/site';
import { CATEGORIES } from '@/src/data/seed';
import { findColorChart } from '@/src/config/colorCharts';
import { ColorChartPicker } from '@/src/components/product/ColorChartPicker';
import { ReviewCard, usePublishedReviews } from '@/src/components/home/Reviews';
import { useCart } from '@/src/hooks/useCart';
import { useProducts } from '@/src/hooks/useProducts';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { Link, useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { findPhotoGroup, photoOfOption, photoOptionsOf } from '@/src/lib/variants';
import { buildProductMessage } from '@/src/lib/whatsapp';

export function ProductPage({ slug }: { slug: string }) {
  const { products, loading } = useProducts();
  const { add } = useCart();
  const { notify } = useToast();
  const { navigate } = useRouter();

  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [options, setOptions] = useState<Record<string, string>>({});
  const [colorWish, setColorWish] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [colorCode, setColorCode] = useState<string | undefined>(undefined);
  const [colorError, setColorError] = useState(false);

  const colorChart = findColorChart(product?.colorChartId);

  const photoGroup = product ? findPhotoGroup(product) : undefined;
  /** Modèle montré par la photo n° index. */
  const optionAtPhoto = (index: number) =>
    photoGroup ? photoOptionsOf(photoGroup)[index] : undefined;
  /** Première photo qui montre ce modèle. */
  const photoAtOption = (option: string) => (photoGroup ? photoOfOption(photoGroup, option) : -1);

  const isSoldOutOption = (group: { soldOutOptions?: string[] }, option: string) =>
    (group.soldOutOptions ?? []).includes(option);

  // Première option encore disponible, présélectionnée à l'ouverture.
  useEffect(() => {
    if (!photoGroup) return;
    const first = photoGroup.options.find((option) => !isSoldOutOption(photoGroup, option));
    if (first === undefined) return;
    setPhotoIndex(Math.max(0, photoAtOption(first)));
    setOptions((current) =>
      current[photoGroup.name] ? current : { ...current, [photoGroup.name]: first },
    );
  }, [product?.id]);

  /** Faire défiler la galerie choisit le modèle correspondant. */
  const handlePhotoIndex = (index: number) => {
    setPhotoIndex(index);
    const option = optionAtPhoto(index);
    if (photoGroup && option) {
      setOptions((current) => ({ ...current, [photoGroup.name]: option }));
    }
  };

  /** Choisir un modèle amène sa photo. */
  const handleOptions = (next: Record<string, string>) => {
    setOptions(next);
    if (photoGroup) {
      const index = photoAtOption(next[photoGroup.name]);
      // Une photo déjà en train de montrer ce modèle : on ne bouge pas.
      if (index >= 0 && optionAtPhoto(photoIndex) !== next[photoGroup.name]) setPhotoIndex(index);
    }
  };

  /** Toutes les options d'un groupe vendues : l'article entier est épuisé. */
  const everyOptionSoldOut = Boolean(
    product?.variants.some(
      (group) =>
        group.options.length > 0 &&
        group.options.every((option) => (group.soldOutOptions ?? []).includes(option)),
    ),
  );
  const soldOut = product?.status === 'sold_out' || product?.stock === 0 || everyOptionSoldOut;
  const missingOption = product?.variants.find((group) => !options[group.name]);

  useSeo({
    title: product ? `${product.name} — ${formatFcfa(product.price)}` : 'Article',
    description: product?.description ?? 'Article de la boutique.',
    image: product?.images[0],
    jsonLd: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.images.map((i) => (i.startsWith('http') ? i : `${SITE_URL}${i}`)),
          brand: { '@type': 'Brand', name: BRAND.name },
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'XOF',
            availability: soldOut
              ? 'https://schema.org/OutOfStock'
              : 'https://schema.org/InStock',
          },
        }
      : undefined,
  });

  const related = useMemo(
    () =>
      products
        .filter((p) => p.id !== product?.id && p.category === product?.category && p.status === 'active')
        .slice(0, 4),
    [products, product],
  );

  // Avis recueillis auprès des clientes sur cette pièce précise.
  const avis = usePublishedReviews(product?.id);

  // Une ligne dont la valeur n'est pas encore mesurée n'a rien à faire sur la
  // fiche : elle se lirait comme une mesure manquante plutôt qu'à venir.
  const mesures = (product?.measurements ?? []).filter(
    (m) => m.label.trim() && m.value.trim(),
  );

  if (loading) {
    return (
      <div className="container-page grid place-items-center py-32 text-stone">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-16">
        <EmptyState
          title="Cet article n'existe plus"
          description="Il a peut-être été retiré du catalogue. Le reste de la boutique vous attend."
          action={<Button onClick={() => navigate('/boutique')}>Retour à la boutique</Button>}
        />
      </div>
    );
  }

  const productMessage = buildProductMessage(
    product.name,
    formatFcfa(product.price),
    `${SITE_URL}/produit/${product.slug}`,
  );

  const handleAdd = () => {
    if (missingOption) {
      notify(`Choisissez : ${missingOption.name}`, 'error');
      return;
    }
    if (colorChart && !colorCode) {
      setColorError(true);
      notify('Choisissez un numéro de couleur.', 'error');
      document.getElementById('nuancier')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    const finalOptions = { ...options };
    if (colorChart && colorCode) finalOptions['Couleur'] = `n° ${colorCode}`;
    if (colorWish.trim()) finalOptions['Coloris souhaité'] = colorWish.trim();
    add(product, finalOptions, quantity);
    notify(`${product.name} ajouté au panier`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };



  return (
    <div className="container-page pt-6">
      <Link to="/boutique" className="inline-flex items-center gap-2 text-[13px] text-stone">
        <ArrowLeft className="size-4" /> Boutique
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Gallery
          images={product.images}
          alt={product.name}
          labels={photoGroup && photoOptionsOf(photoGroup)}
          activeIndex={photoIndex}
          onIndexChange={handlePhotoIndex}
        />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && <Badge tone="new">Nouveau</Badge>}
            {product.isPopular && <Badge tone="popular">Populaire</Badge>}
            <Badge tone="neutral">
              {CATEGORIES.find((c) => c.id === product.category)?.name ?? 'Boutique'}
            </Badge>
          </div>

          <h1 className="mt-3 text-[32px] sm:text-[40px]">{product.name}</h1>

          <Price
            amount={product.price}
            compareAt={product.compareAtPrice}
            className="mt-3 text-[22px]"
          />

          {/*
            Rien n'est en stock : tout est commandé pour la cliente. Un point vert
            « Disponible » laisserait croire que la pièce part le jour même, et la
            déception se paierait à la livraison.
          */}
          <p className="mt-2 inline-flex items-center gap-2 text-[13.5px]">
            {soldOut ? (
              <span className="text-[#8a2f2f]">Momentanément indisponible</span>
            ) : (
              <>
                <Clock className="size-3.5 text-stone" aria-hidden />
                <span className="text-graphite">
                  Sur commande
                  {product.stock !== null ? ` — ${product.stock} pièce(s) réservée(s)` : ''}
                </span>
              </>
            )}
          </p>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-graphite">{product.description}</p>

          <div className="mt-7 space-y-6">
            {product.variants.length > 0 && (
              <VariantPicker groups={product.variants} value={options} onChange={handleOptions} />
            )}

            {colorChart && (
              <div id="nuancier">
                <ColorChartPicker
                  chart={colorChart}
                  value={colorCode}
                  error={colorError}
                  onChange={(code) => {
                    setColorCode(code);
                    setColorError(false);
                  }}
                />
              </div>
            )}

            {product.otherColorsAvailable && (
              <div className="rounded-[--radius-md] border border-line bg-blush/40 p-4">
                <p className="flex gap-2 text-[13.5px] leading-relaxed text-graphite">
                  <Palette className="mt-0.5 size-4 shrink-0 text-mauve" strokeWidth={1.6} />
                  <span>
                    <span className="font-medium">D'autres coloris existent</span>
                    {product.variants.length > 0 ? ' en dehors des photos ci-dessus.' : '.'} Dites-nous
                    lequel vous cherchez : nous confirmons la disponibilité avant l'envoi.
                  </span>
                </p>
                <div className="mt-3 max-w-xs">
                  <Label htmlFor="couleur" hint="(facultatif)">
                    Coloris souhaité
                  </Label>
                  <Input
                    id="couleur"
                    value={colorWish}
                    onChange={(e) => setColorWish(e.target.value)}
                    placeholder="Ex : noir, beige, bordeaux…"
                  />
                </div>
              </div>
            )}

            <div>
              <p className="mb-2 text-[13px] font-medium text-graphite">Quantité</p>
              <QuantityStepper
                value={quantity}
                onChange={setQuantity}
                max={product.stock ?? 99}
                label={product.name}
              />
            </div>
          </div>

          <div className="mt-8 hidden gap-3 lg:flex">
            <Button size="lg" onClick={handleAdd} disabled={soldOut} className="flex-1">
              {added ? (
                <>
                  <Check className="size-4" /> Ajouté
                </>
              ) : (
                <>Ajouter au panier · {formatFcfa(product.price * quantity)}</>
              )}
            </Button>
            <WhatsAppLink
              message={productMessage}
              variant="plain"
              className="press inline-flex h-14 items-center justify-center rounded-full border border-ink/25 px-7 text-[15px] font-medium no-underline hover:border-ink"
            >
              Commander via WhatsApp
            </WhatsAppLink>
          </div>

          {/* Mesures réelles de la pièce. Rien ne s'affiche tant que la
              boutique ne les a pas saisies : une cliente ne doit pas choisir
              sa taille sur un chiffre approximatif. */}
          {mesures.length > 0 && (
            <div className="mt-8 rounded-[--radius-md] border border-line bg-cream/40 p-5">
              <h2 className="flex items-center gap-2 text-[16px]">
                <Ruler className="size-4 text-mauve" strokeWidth={1.6} /> Mesures de la pièce
              </h2>
              <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                {mesures.map((m) => (
                  <div key={m.label} className="flex justify-between gap-4 text-[13.5px]">
                    <dt className="text-stone">{m.label}</dt>
                    <dd className="font-medium">{m.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[12px] leading-relaxed text-stone">
                Mesures de l'article à plat, pas du corps.{' '}
                <Link to="/guide-des-tailles" className="underline underline-offset-2">
                  Trouver ma taille
                </Link>
              </p>
            </div>
          )}

          <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-[13.5px] text-stone">
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} />
              Pièce commandée pour vous : elle part avec le prochain groupage. Le délai vous est
              confirmé sur WhatsApp avant tout paiement.
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="size-4" strokeWidth={1.6} />
              Livraison Saint-Louis, environs et régions — ou retrait sur place.
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4" strokeWidth={1.6} />
              Le montant total vous est confirmé avant tout paiement.
            </li>
          </ul>
        </div>
      </div>

      {avis.length > 0 && (
        <section className="mt-20">
          <h2 className="text-[26px]">Avis sur cette pièce</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {avis.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-[26px]">À voir aussi</h2>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4 lg:gap-6">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}

      {/* Barre d'action mobile : le panier reste le geste principal. */}
      <div className="safe-bottom fixed inset-x-0 bottom-[62px] z-[60] border-t border-line bg-ivory/97 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-3">
          <Button full size="lg" onClick={handleAdd} disabled={soldOut}>
            {added ? (
              <>
                <Check className="size-4" /> Ajouté au panier
              </>
            ) : soldOut ? (
              'Indisponible'
            ) : (
              <>Ajouter · {formatFcfa(product.price * quantity)}</>
            )}
          </Button>
        </div>
        <WhatsAppLink
          message={productMessage}
          variant="plain"
          className="mt-2 block text-center text-[12.5px] text-stone"
        >
          Une question ? Écrire sur WhatsApp
        </WhatsAppLink>
      </div>
      <div className="h-28 lg:hidden" aria-hidden />
    </div>
  );
}
