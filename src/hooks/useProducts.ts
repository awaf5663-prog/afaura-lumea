import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readJson } from '@/src/lib/storage';
import { db, onDataChanged } from '@/src/services';
import type { Product } from '@/src/types';

/**
 * ─────────────────────────────────────────────────────────────
 *  LE CATALOGUE, AFFICHÉ SANS ATTENDRE
 * ─────────────────────────────────────────────────────────────
 *  À la première visite, il n'y a rien à montrer avant que la base réponde :
 *  la boutique affiche ses squelettes, et c'est honnête.
 *
 *  Aux visites suivantes, en revanche, faire patienter devant un écran gris
 *  alors qu'on connaît déjà le catalogue n'a aucun sens — surtout sur une
 *  connexion mobile. On garde donc le dernier catalogue reçu, on l'affiche
 *  immédiatement, et on va vérifier derrière : ce qui a changé se corrige
 *  tout seul en une fraction de seconde, sans écran d'attente.
 *
 *  CE CACHE N'EST PAS UNE SOURCE DE VÉRITÉ. Un prix qu'il afficherait le
 *  temps d'un battement de cil ne peut pas devenir un montant encaissé : les
 *  totaux d'une commande sont recalculés côté serveur, à partir des prix de
 *  la base, jamais de ce que le navigateur affiche.
 */

/** Le cache ne sert qu'au catalogue public : l'administration lit toujours la base. */
function lireCache(): Product[] | null {
  const garde = readJson<Product[] | null>(STORAGE_KEYS.catalogueEnCache, null);
  return Array.isArray(garde) && garde.length > 0 ? garde : null;
}

/**
 * Range le catalogue pour la visite suivante, sans jamais faire échouer la
 * page qui vient de s'afficher.
 *
 * Le navigateur alloue quelques mégaoctets par site, et les photos téléversées
 * depuis l'administration sont enregistrées en clair dans la fiche : un
 * catalogue bien fourni peut dépasser cette réserve. Refusé en bloc, le cache
 * ne servirait alors plus jamais à rien, et personne ne le saurait.
 *
 * On réessaie donc sans ces photos-là. La cliente revoit sa boutique
 * immédiatement, avec le cadre crème à la place de quelques photos, le temps
 * que la base réponde — ce qui vaut mieux qu'une grille vide.
 */
function garderEnCache(produits: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.catalogueEnCache, JSON.stringify(produits));
  } catch {
    try {
      const allege = produits.map((p) => ({
        ...p,
        images: p.images.filter((src) => !src.startsWith('data:')),
      }));
      localStorage.setItem(STORAGE_KEYS.catalogueEnCache, JSON.stringify(allege));
    } catch {
      // Toujours trop gros : tant pis, la visite suivante repassera par la base.
    }
  }
}

/** Charge le catalogue depuis la source de données active (local ou Supabase). */
export function useProducts(includeDrafts = false) {
  const cache = includeDrafts ? null : lireCache();
  const [products, setProducts] = useState<Product[]>(cache ?? []);
  // Rien en cache : on annonce le chargement. Sinon on montre, et on vérifie.
  const [loading, setLoading] = useState(cache === null);
  const [error, setError] = useState<string | null>(null);

  /**
   * `silent` : relecture déclenchée par un changement enregistré ailleurs, ou
   * vérification d'un catalogue déjà affiché depuis le cache. On ne repasse
   * pas en « chargement », sinon le catalogue clignoterait en squelettes.
   */
  const load = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError(null);
      try {
        /*
         * L'administration reçoit les grandes photos : elle doit pouvoir les
         * modifier. La boutique se contente des aperçus — six fois plus
         * légers — et va chercher la grande à l'ouverture d'une fiche.
         */
        const all = await db.listProducts({ completes: includeDrafts });
        const visibles = all.filter((p) => p.status !== 'draft');
        setProducts(includeDrafts ? all : visibles);
        // Seul le catalogue public est gardé : les brouillons n'ont rien à
        // faire dans le navigateur d'une cliente.
        if (!includeDrafts) garderEnCache(visibles);
      } catch (e) {
        /*
         * Une vérification qui échoue derrière un catalogue déjà affiché ne
         * doit pas l'effacer au profit d'un message d'erreur : ce qui est à
         * l'écran reste vrai jusqu'à preuve du contraire.
         */
        if (!silent) setError(e instanceof Error ? e.message : 'Chargement impossible.');
      } finally {
        setLoading(false);
      }
    },
    [includeDrafts],
  );

  useEffect(() => {
    // Un catalogue déjà à l'écran se vérifie en silence.
    void load(cache !== null);
    // `cache` est lu une seule fois, au montage : le relire ici relancerait
    // la vérification à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // L'admin enregistre : le catalogue affiché se met à jour tout seul.
  useEffect(() => onDataChanged(() => void load(true)), [load]);

  return { products, loading, error, reload: () => load() };
}
