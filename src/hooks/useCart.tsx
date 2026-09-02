import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
import { findPhotoGroup, photoOfOption } from '@/src/lib/variants';
import { prixUnitaire } from '@/src/lib/optionPrice';
import type { CartItem, Product } from '@/src/types';

interface CartValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (product: Product, options: Record<string, string>, quantity?: number) => void;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  remove: (key: string) => void;
  updateOptions: (key: string, options: Record<string, string>) => void;
  clear: () => void;
  /** Incrémenté à chaque ajout : sert à animer l'icône panier. */
  pulse: number;
}

const CartContext = createContext<CartValue | null>(null);

function makeKey(productId: string, options: Record<string, string>): string {
  const suffix = Object.keys(options)
    .sort()
    .map((k) => `${k}:${options[k]}`)
    .join('|');
  return suffix ? `${productId}__${suffix}` : productId;
}

/**
 * Photo de la ligne panier.
 *
 * Quand un groupe de variantes est aligné sur les photos — autant d'options
 * que d'images, comme « Modèle » pour les pièces uniques et les abayas — on
 * reprend la photo du modèle choisi. Sans ça, la cliente choisit le beige
 * léopard et retrouve le noir & blanc dans son panier.
 */
function pickImage(product: Product, options: Record<string, string>): string {
  const group = findPhotoGroup(product);
  if (group) {
    const index = photoOfOption(group, options[group.name] ?? '');
    if (index >= 0 && product.images[index]) return product.images[index];
  }
  return product.images[0] ?? '';
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readJson<CartItem[]>(STORAGE_KEYS.cart, []));
  const [pulse, setPulse] = useState(0);

  // Le panier survit à la navigation et au rechargement.
  useEffect(() => {
    writeJson(STORAGE_KEYS.cart, items);
  }, [items]);

  // Synchronisation entre onglets.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.cart) setItems(readJson<CartItem[]>(STORAGE_KEYS.cart, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback<CartValue['add']>((product, options, quantity = 1) => {
    const key = makeKey(product.id, options);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(99, i.quantity + quantity) } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: product.id,
          name: product.name,
          slug: product.slug,
          image: pickImage(product, options),
          // Le prix peut dépendre de l'option choisie (lot de 4 / lot de 12).
          // Affichage seulement : la base recalcule le montant à la commande.
          unitPrice: prixUnitaire(product, options),
          quantity,
          options,
        },
      ];
    });
    setPulse((p) => p + 1);
  }, []);

  const setQuantity = useCallback<CartValue['setQuantity']>((key, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.key !== key)
        : prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, quantity) } : i)),
    );
  }, []);

  const increment = useCallback((key: string) => {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(99, i.quantity + 1) } : i)),
    );
  }, []);

  const decrement = useCallback((key: string) => {
    setItems((prev) =>
      prev.flatMap((i) =>
        i.key === key ? (i.quantity <= 1 ? [] : [{ ...i, quantity: i.quantity - 1 }]) : [i],
      ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const updateOptions = useCallback<CartValue['updateOptions']>((key, options) => {
    setItems((prev) => {
      const target = prev.find((i) => i.key === key);
      if (!target) return prev;
      const nextKey = makeKey(target.productId, options);
      const merged = prev.filter((i) => i.key !== key);
      const duplicate = merged.find((i) => i.key === nextKey);
      if (duplicate) {
        return merged.map((i) =>
          i.key === nextKey ? { ...i, quantity: Math.min(99, i.quantity + target.quantity) } : i,
        );
      }
      return [...merged, { ...target, key: nextKey, options }];
    });
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),
      add,
      setQuantity,
      increment,
      decrement,
      remove,
      updateOptions,
      clear,
      pulse,
    }),
    [items, add, setQuantity, increment, decrement, remove, updateOptions, clear, pulse],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart doit être utilisé dans <CartProvider>');
  return ctx;
}
