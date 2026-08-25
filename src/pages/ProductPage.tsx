import { ArrowLeft, Check, Loader2, ShieldCheck, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { useCart } from '@/src/hooks/useCart';
import { useProducts } from '@/src/hooks/useProducts';
import { useSettings } from '@/src/hooks/useSettings';
import { useToast } from '@/src/hooks/useToast';
import { formatFcfa } from '@/src/lib/format';
import { Link, useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';
import { buildProductMessage, isWhatsappConfigured, whatsappLink } from '@/src/lib/whatsapp';

export function ProductPage({ slug }: { slug: string }) {
  const { products, loading } = useProducts();
  const { add } = useCart();
  const { notify } = useToast();
  const { settings } = useSettings();
  const { navigate } = useRouter();

  const product = products.find((p) => p.slug === slug || p.id === slug);

  const [options, setOptions] = useState<Record<string, string>>({});
  const [colorWish, setColorWish] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const soldOut = product?.status === 'sold_out' || product?.stock === 0;
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

  const handleAdd = () => {
    if (missingOption) {
      notify(`Choisissez : ${missingOption.name}`, 'error');
      return;
    }
    const finalOptions = { ...options };
    if (colorWish.trim()) finalOptions['Couleur souhaitée'] = colorWish.trim();
    add(product, finalOptions, quantity);
    notify(`${product.name} ajouté au panier`);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const whatsappNumber = settings?.whatsappNumber ?? '';

  return (
    <div className="container-page pt-6">
      <Link to="/boutique" className="inline-flex items-center gap-2 text-[13px] text-stone">
        <ArrowLeft className="size-4" /> Boutique
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-2 lg:gap-14">
        <Gallery images={product.images} alt={product.name} />

        <div>
          <div className="flex flex-wrap items-center gap-2">
            {product.isNew && <Badge tone="new">Nouveau</Badge>}
            {product.isPopular && <Badge tone="popular">Populaire</Badge>}
            <Badge tone="neutral">
              {product.category === 'accessoire' ? 'Accessoire' : 'Hijab & voile'}
            </Badge>
          </div>

          <h1 className="mt-3 text-[32px] sm:text-[40px]">{product.name}</h1>

          <Price
            amount={product.price}
            compareAt={product.compareAtPrice}
            className="mt-3 text-[22px]"
          />

          <p className="mt-2 inline-flex items-center gap-2 text-[13.5px]">
            {soldOut ? (
              <span className="text-[#8a2f2f]">Épuisé pour le moment</span>
            ) : (
              <>
                <span className="size-2 rounded-full bg-[#1f9c53]" aria-hidden />
                <span className="text-graphite">
                  Disponible
                  {product.stock !== null ? ` — ${product.stock} en stock` : ''}
                </span>
              </>
            )}
          </p>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-graphite">{product.description}</p>

          <div className="mt-7 space-y-6">
            {product.variants.length > 0 && (
              <VariantPicker groups={product.variants} value={options} onChange={setOptions} />
            )}

            {product.variants.length === 0 && (
              <div className="max-w-xs">
                <Label htmlFor="couleur" hint="(facultatif)">
                  Couleur souhaitée
                </Label>
                <Input
                  id="couleur"
                  value={colorWish}
                  onChange={(e) => setColorWish(e.target.value)}
                  placeholder="Ex : noir, beige…"
                />
                <p className="mt-1.5 text-[12px] text-stone">
                  Nous confirmons la disponibilité de la couleur sur WhatsApp avant l'envoi.
                </p>
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
            {isWhatsappConfigured(whatsappNumber) && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() =>
                  window.open(
                    whatsappLink(
                      whatsappNumber,
                      buildProductMessage(
                        product.name,
                        formatFcfa(product.price),
                        `${SITE_URL}/produit/${product.slug}`,
                      ),
                    ),
                    '_blank',
                    'noopener',
                  )
                }
              >
                Commander via WhatsApp
              </Button>
            )}
          </div>

          <ul className="mt-8 space-y-2.5 border-t border-line pt-6 text-[13.5px] text-stone">
            <li className="flex items-center gap-2.5">
              <Truck className="size-4" strokeWidth={1.6} />
              Livraison Dakar, banlieue et régions — ou retrait sur place.
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4" strokeWidth={1.6} />
              Le montant total vous est confirmé avant tout paiement.
            </li>
          </ul>
        </div>
      </div>

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
              'Épuisé'
            ) : (
              <>Ajouter · {formatFcfa(product.price * quantity)}</>
            )}
          </Button>
        </div>
        {isWhatsappConfigured(whatsappNumber) && (
          <a
            href={whatsappLink(
              whatsappNumber,
              buildProductMessage(
                product.name,
                formatFcfa(product.price),
                `${SITE_URL}/produit/${product.slug}`,
              ),
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-center text-[12.5px] text-stone underline underline-offset-2"
          >
            Une question ? Écrire sur WhatsApp
          </a>
        )}
      </div>
      <div className="h-28 lg:hidden" aria-hidden />
    </div>
  );
}
