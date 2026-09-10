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

interface FavorisValue {
  /** Identifiants des articles mis de côté, du plus récent au plus ancien. */
  ids: string[];
  count: number;
  estFavori: (productId: string) => boolean;
  /** Ajoute ou retire, et renvoie l'état après le clic. */
  basculer: (productId: string) => boolean;
  retirer: (productId: string) => void;
  vider: () => void;
}

const FavorisContext = createContext<FavorisValue | null>(null);

/**
 * ─────────────────────────────────────────────────────────────
 *  FAVORIS
 * ─────────────────────────────────────────────────────────────
 *  Une liste d'envies gardée dans le navigateur de la cliente, et
 *  nulle part ailleurs : aucun compte à créer, rien envoyé au serveur.
 *
 *  On n'y garde que des identifiants. Le prix, la photo et la
 *  disponibilité sont relus dans le catalogue à chaque affichage —
 *  un favori vieux d'un mois ne montre donc jamais un prix périmé.
 */
export function FavorisProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>(() => readJson<string[]>(STORAGE_KEYS.favoris, []));

  useEffect(() => {
    writeJson(STORAGE_KEYS.favoris, ids);
  }, [ids]);

  // Deux onglets ouverts sur la boutique montrent la même liste.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.favoris) setIds(readJson<string[]>(STORAGE_KEYS.favoris, []));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const basculer = useCallback(
    (productId: string) => {
      const ajoute = !ids.includes(productId);
      setIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [productId, ...prev],
      );
      return ajoute;
    },
    [ids],
  );

  const retirer = useCallback((productId: string) => {
    setIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const vider = useCallback(() => setIds([]), []);

  const value = useMemo<FavorisValue>(
    () => ({
      ids,
      count: ids.length,
      estFavori: (productId: string) => ids.includes(productId),
      basculer,
      retirer,
      vider,
    }),
    [ids, basculer, retirer, vider],
  );

  return <FavorisContext.Provider value={value}>{children}</FavorisContext.Provider>;
}

export function useFavoris(): FavorisValue {
  const ctx = useContext(FavorisContext);
  if (!ctx) throw new Error('useFavoris doit être utilisé dans <FavorisProvider>');
  return ctx;
}
