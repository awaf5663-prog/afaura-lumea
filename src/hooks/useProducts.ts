import { useCallback, useEffect, useState } from 'react';
import { STORAGE_KEYS, readJson, writeJson } from '@/src/lib/storage';
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

/**
 * Le cache ne sert qu'au catalogue public : l'administration lit toujours la base.
 *
 * Il porte l'heure de sa dernière lecture, pour savoir s'il est encore frais
 * (voir FRAICHEUR). L'ancien format, un simple tableau, reste accepté : une
 * cliente qui revient avec l'ancien cache ne doit pas retrouver une grille vide.
 */
interface Cache {
  produits: Product[];
  lu: number;
}

function lireCache(): Cache | null {
  const garde = readJson<Cache | Product[] | null>(STORAGE_KEYS.catalogueEnCache, null);
  if (Array.isArray(garde)) return garde.length > 0 ? { produits: garde, lu: 0 } : null;
  if (garde && Array.isArray(garde.produits) && garde.produits.length > 0) return garde;
  return null;
}

/**
 * ─────────────────────────────────────────────────────────────
 *  À QUELLE FRÉQUENCE RELIRE LE CATALOGUE
 * ─────────────────────────────────────────────────────────────
 *  Le catalogue était relu à CHAQUE ouverture de page. Une cliente qui
 *  regarde six articles le téléchargeait six fois — et les photos voyagent
 *  dedans. C'est ce trafic qui a fini par épuiser le quota mensuel de la
 *  base, et avec lui la boutique entière.
 *
 *  Un catalogue lu il y a moins de cinq minutes est donc réutilisé tel
 *  quel. Passé ce délai, il est revérifié en silence, derrière la grille
 *  déjà affichée.
 *
 *  Ce n'est pas un pari sur les prix : aucun montant affiché ne devient un
 *  montant encaissé. Les totaux d'une commande sont recalculés par la base
 *  à l'enregistrement, à partir des prix qu'elle détient à cet instant.
 *  Et l'administration, elle, ne passe jamais par ce cache.
 */
const FRAICHEUR = 5 * 60 * 1000;

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
  const ecrire = (liste: Product[]) =>
    localStorage.setItem(
      STORAGE_KEYS.catalogueEnCache,
      JSON.stringify({ produits: liste, lu: Date.now() } satisfies Cache),
    );
  try {
    ecrire(produits);
  } catch {
    try {
      ecrire(
        produits.map((p) => ({
          ...p,
          images: p.images.filter((src) => !src.startsWith('data:')),
        })),
      );
    } catch {
      // Toujours trop gros : tant pis, la visite suivante repassera par la base.
    }
  }
}

/*
 * Un enregistrement périme le catalogue gardé, tout de suite.
 *
 * Sans cela, la boutique modifiée depuis l'administration continuerait
 * d'afficher l'ancienne version jusqu'à cinq minutes — y compris à la
 * personne qui vient de la modifier, qui croirait son changement perdu.
 *
 * L'abonnement est pris au chargement du module, donc dans l'onglet de
 * l'administration comme dans celui de la boutique.
 */
onDataChanged(() => {
  const cache = lireCache();
  if (cache) writeJson(STORAGE_KEYS.catalogueEnCache, { produits: cache.produits, lu: 0 });
});

/** Charge le catalogue depuis la source de données active (local ou Supabase). */
export function useProducts(includeDrafts = false) {
  const cache = includeDrafts ? null : lireCache();
  const frais = cache !== null && Date.now() - cache.lu < FRAICHEUR;
  const [products, setProducts] = useState<Product[]>(cache?.produits ?? []);
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
         * Jamais les grandes photos dans une liste — ni pour la boutique,
         * ni pour l'administration. Elles ne sont demandées que pour la
         * fiche qu'on ouvre (voir getProductImages).
         */
        const all = await db.listProducts();
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
    // Un catalogue lu il y a moins de cinq minutes est déjà à l'écran et n'a
    // pas à être redemandé : c'est autant de trafic que la base n'aura pas à
    // servir. Au-delà, il se vérifie en silence, sans écran d'attente.
    if (frais) return;
    void load(cache !== null);
    // `cache` et `frais` sont lus une seule fois, au montage : les relire ici
    // relancerait la vérification à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  // L'admin enregistre : le catalogue affiché se met à jour tout seul.
  useEffect(() => onDataChanged(() => void load(true)), [load]);

  return { products, loading, error, reload: () => load() };
}
