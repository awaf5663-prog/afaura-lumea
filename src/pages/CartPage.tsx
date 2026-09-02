import { ArrowRight, ShoppingBag } from 'lucide-react';
import { CartLine } from '@/src/components/cart/CartLine';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { useCart } from '@/src/hooks/useCart';
import { useProducts } from '@/src/hooks/useProducts';
import { useSettings } from '@/src/hooks/useSettings';
import { formatFcfa } from '@/src/lib/format';
import { fraisBoutique } from '@/src/lib/pricing/storeFee';
import { useRouter } from '@/src/lib/router';
import { useSeo } from '@/src/lib/seo';

export function CartPage() {
  const { items, subtotal, setQuantity, remove, updateOptions, count } = useCart();
  const { products } = useProducts();
  const { settings } = useSettings();
  const { navigate } = useRouter();

  /*
   * Le même calcul qu'à la validation, pour que le montant ne surgisse pas à la
   * dernière étape. La grille vient des réglages, et la base recalcule tout à
   * l'enregistrement : cet aperçu ne décide de rien.
   */
  const serviceFee = fraisBoutique(count, settings?.storeFeeTiers ?? []);

  useSeo({
    title: 'Mon panier',
    description: 'Vérifiez vos articles, ajustez les quantités et validez votre commande.',
    noIndex: true,
  });

  if (items.length === 0) {
    return (
      <div className="container-page py-12">
        <h1 className="mb-8 text-[34px]">Mon panier</h1>
        <EmptyState
          icon={<ShoppingBag className="size-8" strokeWidth={1.2} />}
          title="Votre panier est vide"
          description="Ajoutez des pièces depuis la boutique, ou envoyez-nous votre sélection SHEIN."
          action={
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => navigate('/boutique')}>Découvrir la boutique</Button>
              <Button variant="secondary" onClick={() => navigate('/shein')}>
                Commander sur SHEIN
              </Button>
            </div>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-8">
      <h1 className="text-[34px] sm:text-[42px]">Mon panier</h1>
      <p className="mt-2 text-[14px] text-stone">
        {count} article{count > 1 ? 's' : ''} — modifiable jusqu'à la validation.
      </p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.key}>
              <CartLine
                item={item}
                product={products.find((p) => p.id === item.productId)}
                onQuantity={(quantity) => setQuantity(item.key, quantity)}
                onRemove={() => remove(item.key)}
                onOptions={(options) => updateOptions(item.key, options)}
              />
            </li>
          ))}
        </ul>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[--radius-lg] border border-line bg-white p-6">
            <h2 className="text-[20px]">Récapitulatif</h2>
            <dl className="mt-5 space-y-3 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-stone">Sous-total</dt>
                <dd className="tabular-nums">{formatFcfa(subtotal)}</dd>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-stone">Frais de traitement</dt>
                  <dd className="tabular-nums">{formatFcfa(serviceFee)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-stone">Livraison</dt>
                <dd className="text-stone">Choisie à l'étape suivante</dd>
              </div>
              <div className="hairline flex justify-between pt-3 text-[17px]">
                <dt>Total</dt>
                <dd className="font-medium tabular-nums">{formatFcfa(subtotal + serviceFee)}</dd>
              </div>
            </dl>

            <Button
              full
              size="lg"
              className="mt-6"
              onClick={() => navigate('/commander')}
            >
              Valider ma commande
              <ArrowRight className="size-4" />
            </Button>

            <button
              type="button"
              onClick={() => navigate('/boutique')}
              className="mt-3 w-full text-center text-[13px] text-stone underline underline-offset-2"
            >
              Continuer mes achats
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
