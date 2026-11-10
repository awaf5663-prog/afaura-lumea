import { ArrowRight, Check, Package, Sparkles, Tag } from 'lucide-react';
import { useState } from 'react';
import { formatFcfa } from '@/src/lib/format';
import { useCart } from '@/src/hooks/useCart';
import { useToast } from '@/src/hooks/useToast';
import type { Product } from '@/src/types';

interface WholesalePricingCardProps {
  product: Product;
  selectedOptions?: Record<string, string>;
  className?: string;
}

export function WholesalePricingCard({
  product,
  selectedOptions = {},
  className = '',
}: WholesalePricingCardProps) {
  const { add } = useCart();
  const { notify } = useToast();
  const [addedLot, setAddedLot] = useState<string | null>(null);

  // Vérifier si le produit a des tarifs grossiste configurés
  const hasDizaine = Boolean(product.priceDizaine && product.priceDizaine > 0);
  const hasDouzaine = Boolean(product.wholesaleLot && product.wholesaleLot.price > 0);

  // Si aucun lot explicite n'est défini mais qu'il s'agit d'un foulard/voile standard
  const isScarfCategory =
    product.category.includes('modal') ||
    product.category.includes('jersey') ||
    product.category.includes('voile') ||
    product.category.includes('soie') ||
    product.category.includes('dentelle') ||
    product.category.includes('organza');

  // Si pas de tarif grossiste et pas de catégorie éligible, ne rien afficher
  if (!hasDizaine && !hasDouzaine && !isScarfCategory) {
    return null;
  }

  // Tarifs effectifs
  const dizainePrice = hasDizaine
    ? (product.priceDizaine as number)
    : Math.round((product.price * 10 * 0.9) / 500) * 500; // ~10% de remise par défaut
  const douzaineQty = product.wholesaleLot?.quantity || 12;
  const douzainePrice = hasDouzaine
    ? (product.wholesaleLot?.price as number)
    : Math.round((product.price * 12 * 0.85) / 500) * 500; // ~15% de remise par défaut

  const unitDizaine = Math.round(dizainePrice / 10);
  const unitDouzaine = Math.round(douzainePrice / douzaineQty);

  const handleOrderLot = (type: 'dizaine' | 'douzaine') => {
    const qty = type === 'dizaine' ? 10 : douzaineQty;
    const lotPrice = type === 'dizaine' ? dizainePrice : douzainePrice;
    const lotLabel = type === 'dizaine' ? 'Lot de 10 pièces (Grossiste)' : `Lot de ${douzaineQty} pièces (Douzaine)`;

    // Ajouter au panier avec option conditionnement grossiste
    const optionsWithLot = {
      ...selectedOptions,
      Conditionnement: lotLabel,
    };

    // Créer un proxy de produit avec le prix unitaire du lot
    const productForCart: Product = {
      ...product,
      price: Math.round(lotPrice / qty),
    };

    add(productForCart, optionsWithLot, qty);
    setAddedLot(type);
    notify(`${lotLabel} ajouté au panier ! (${formatFcfa(lotPrice)})`);
    setTimeout(() => setAddedLot(null), 2200);
  };

  return (
    <div
      className={`rounded-[--radius-lg] border border-mauve/25 bg-gradient-to-br from-cream/90 via-blush/30 to-cream/70 p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-mauve/15 pb-3">
        <div className="flex items-center gap-2">
          <div className="grid size-7 place-items-center rounded-lg bg-mauve/15 text-mauve">
            <Tag className="size-4" />
          </div>
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider text-rosedark">
              Tarif Grossiste & Revendeurs
            </h4>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-mauve px-2.5 py-0.5 text-[11px] font-semibold text-ivory">
          <Sparkles className="size-3" />
          Prix de Gros
        </span>
      </div>

      <p className="mt-2.5 text-[12.5px] leading-relaxed text-graphite">
        Idéal pour revendeuses, boutiques et commandes groupées. Bénéficiez de réductions immédiates
        sur vos volumes :
      </p>

      <div className="mt-3.5 grid gap-3 sm:grid-cols-2">
        {/* Lot de 10 pièces */}
        <div className="flex flex-col justify-between rounded-[--radius-md] border border-mauve/20 bg-white/90 p-3.5 transition hover:border-mauve/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-stone">
                <Package className="size-3.5 text-mauve" /> Lot de 10 pièces
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Économie
              </span>
            </div>
            <p className="mt-1.5 text-[18px] font-semibold text-rosedark">
              {formatFcfa(dizainePrice)}
            </p>
            <p className="text-[11.5px] text-stone">
              soit <strong className="font-medium text-graphite">{formatFcfa(unitDizaine)}</strong> / pièce
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOrderLot('dizaine')}
            className="press mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-rosedark px-3 py-2 text-[12px] font-medium text-ivory hover:bg-mauve"
          >
            {addedLot === 'dizaine' ? (
              <>
                <Check className="size-3.5 text-emerald-300" />
                <span>Ajouté au panier</span>
              </>
            ) : (
              <>
                <span>Commander le lot de 10</span>
                <ArrowRight className="size-3" />
              </>
            )}
          </button>
        </div>

        {/* Lot de 12 pièces (Douzaine) */}
        <div className="flex flex-col justify-between rounded-[--radius-md] border border-mauve/20 bg-white/90 p-3.5 transition hover:border-mauve/40">
          <div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-[12px] font-medium text-stone">
                <Package className="size-3.5 text-brand" /> Douzaine ({douzaineQty} pièces)
              </span>
              <span className="text-[11px] font-semibold text-mauve bg-mauve/10 px-2 py-0.5 rounded-full">
                Meilleur tarif
              </span>
            </div>
            <p className="mt-1.5 text-[18px] font-semibold text-rosedark">
              {formatFcfa(douzainePrice)}
            </p>
            <p className="text-[11.5px] text-stone">
              soit <strong className="font-medium text-graphite">{formatFcfa(unitDouzaine)}</strong> / pièce
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleOrderLot('douzaine')}
            className="press mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-brand px-3 py-2 text-[12px] font-medium text-ivory hover:bg-rosedark"
          >
            {addedLot === 'douzaine' ? (
              <>
                <Check className="size-3.5 text-emerald-300" />
                <span>Ajouté au panier</span>
              </>
            ) : (
              <>
                <span>Commander la douzaine</span>
                <ArrowRight className="size-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
