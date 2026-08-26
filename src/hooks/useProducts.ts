import { useCallback, useEffect, useState } from 'react';
import { db, onDataChanged } from '@/src/services';
import type { Product } from '@/src/types';

/** Charge le catalogue depuis la source de données active (local ou Supabase). */
export function useProducts(includeDrafts = false) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * `silent` : relecture déclenchée par un changement enregistré ailleurs.
   * On ne repasse pas en « chargement », sinon le catalogue clignoterait en
   * squelettes à chaque enregistrement de l'admin.
   */
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        const all = await db.listProducts();
        setProducts(includeDrafts ? all : all.filter((p) => p.status !== 'draft'));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Chargement impossible.');
      } finally {
        setLoading(false);
      }
    },
    [includeDrafts],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // L'admin enregistre : le catalogue affiché se met à jour tout seul.
  useEffect(() => onDataChanged(() => void load(true)), [load]);

  return { products, loading, error, reload: () => load() };
}
