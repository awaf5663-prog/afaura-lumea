import { useCallback, useEffect, useState } from 'react';
import { db } from '@/src/services';
import type { Product } from '@/src/types';

/** Charge le catalogue depuis la source de données active (local ou Supabase). */
export function useProducts(includeDrafts = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const all = await db.listProducts();
      setProducts(includeDrafts ? all : all.filter((p) => p.status !== 'draft'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [includeDrafts]);

  useEffect(() => {
    void load();
  }, [load]);

  return { products, loading, error, reload: load };
}
