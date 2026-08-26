import { ShoppingBag } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { CartLine } from './CartLine';
import { useCart } from '@/src/hooks/useCart';
import { formatFcfa } from '@/src/lib/format';
import { Sheet } from '@/src/components/ui/Sheet';
import { useRouter } from '@/src/lib/router';

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { items, subtotal, setQuantity, remove, count } = useCart();
  const { navigate } = useRouter();

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Panier${count > 0 ? ` (${count})` : ''}`}
      footer={
        items.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-stone">Sous-total</span>
              <span className="text-[17px] font-medium tabular-nums">{formatFcfa(subtotal)}</span>
            </div>
            <p className="text-[12px] text-stone">Les frais de livraison sont calculés à l'étape suivante.</p>
            <Button full size="lg" onClick={() => go('/commander')}>
              Passer la commande
            </Button>
            <Button full variant="secondary" onClick={() => go('/panier')}>
              Voir le panier en détail
            </Button>
          </div>
        ) : null
      }
    >
      {items.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag className="size-8" strokeWidth={1.2} />}
          title="Votre panier est vide"
          description="Voiles, abayas et accessoires vous attendent dans la boutique, tous sur commande."
          action={<Button onClick={() => go('/boutique')}>Découvrir la boutique</Button>}
        />
      ) : (
        <ul className="divide-y divide-line">
          {items.map((item) => (
            <li key={item.key}>
              <CartLine
                item={item}
                compact
                onQuantity={(quantity) => setQuantity(item.key, quantity)}
                onRemove={() => remove(item.key)}
              />
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
