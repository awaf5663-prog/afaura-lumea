import { Trash2 } from 'lucide-react';
import { QuantityStepper } from '@/src/components/ui/QuantityStepper';
import { VariantPicker } from '@/src/components/product/VariantPicker';
import { formatFcfa } from '@/src/lib/format';
import { Link } from '@/src/lib/router';
import type { CartItem, Product } from '@/src/types';

interface Props {
  item: CartItem;
  product?: Product;
  onQuantity: (quantity: number) => void;
  onRemove: () => void;
  onOptions?: (options: Record<string, string>) => void;
  compact?: boolean;
}

export function CartLine({ item, product, onQuantity, onRemove, onOptions, compact }: Props) {
  const options = Object.entries(item.options);

  return (
    <div className="flex gap-3 py-4">
      <Link
        to={`/produit/${item.slug}`}
        className="size-[84px] shrink-0 overflow-hidden rounded-[--radius-sm] bg-cream"
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="size-full object-cover" loading="lazy" />
        ) : null}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link to={`/produit/${item.slug}`} className="block truncate font-display text-[16px]">
              {item.name}
            </Link>
            {options.length > 0 && (
              <p className="mt-0.5 truncate text-[12.5px] text-stone">
                {options.map(([key, value]) => `${key} : ${value}`).join(' · ')}
              </p>
            )}
            <p className="mt-0.5 text-[12.5px] text-stone">{formatFcfa(item.unitPrice)} l'unité</p>
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Retirer ${item.name} du panier`}
            className="press grid size-8 shrink-0 place-items-center rounded-full text-stone hover:text-[#8a2f2f]"
          >
            <Trash2 className="size-4" />
          </button>
        </div>

        {!compact && onOptions && product && product.variants.length > 0 && (
          <div className="mt-3">
            <VariantPicker
              groups={product.variants}
              value={item.options}
              onChange={onOptions}
              size="sm"
            />
          </div>
        )}

        <div className="mt-3 flex items-center justify-between gap-3">
          <QuantityStepper
            value={item.quantity}
            onChange={onQuantity}
            min={1}
            max={product?.stock ?? 99}
            size="sm"
            label={item.name}
          />
          <span className="text-[15px] font-medium tabular-nums">
            {formatFcfa(item.unitPrice * item.quantity)}
          </span>
        </div>
      </div>
    </div>
  );
}
